const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");
const { Readable, Transform } = require("stream");
const { pipeline } = require("stream/promises");

const MODEL_PACK_URL = "https://github.com/dingdangdog/tucools/releases/download/models/model-pack.zip";
const MAX_DOWNLOAD_BYTES = 4 * 1024 * 1024 * 1024;
const MAX_ENTRY_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 8 * 1024 * 1024 * 1024;
const MAX_ENTRIES = 500;
const MAX_CENTRAL_DIRECTORY_BYTES = 8 * 1024 * 1024;

const PUBLIC_CODES = new Set(["cancelled", "network", "http", "zip", "layout", "disk", "busy"]);
const DISK_CODES = new Set(["ENOSPC", "EACCES", "EPERM", "EBUSY", "EROFS", "ENOTDIR", "EISDIR"]);

function coded(code, cause) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function normalize(error, signal) {
  if (signal?.aborted || error?.name === "AbortError" || error?.code === "cancelled") return coded("cancelled", error);
  if (PUBLIC_CODES.has(error?.code)) return error;
  if (DISK_CODES.has(error?.code)) return coded("disk", error);
  return coded("network", error);
}

function reportProgress(onProgress, state, payload) {
  const now = Date.now();
  const finished = payload.total > 0 && payload.received >= payload.total;
  if (payload.phase === state.phase && !finished && now - state.at < 200) return;
  state.phase = payload.phase;
  state.at = now;
  onProgress?.(payload);
}

async function readExact(fh, buffer, position) {
  let offset = 0;
  while (offset < buffer.length) {
    const { bytesRead } = await fh.read(buffer, offset, buffer.length - offset, position + offset);
    if (bytesRead === 0) throw coded("zip");
    offset += bytesRead;
  }
}

function readU64(buffer, offset) {
  const value = buffer.readBigUInt64LE(offset);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw coded("zip");
  return Number(value);
}

function applyZip64(entry, extra) {
  let cursor = 0;
  while (cursor + 4 <= extra.length) {
    const id = extra.readUInt16LE(cursor);
    const size = extra.readUInt16LE(cursor + 2);
    const start = cursor + 4;
    const end = start + size;
    if (end > extra.length) throw coded("zip");
    if (id === 1) {
      let pos = start;
      const take = () => {
        if (pos + 8 > end) throw coded("zip");
        const value = readU64(extra, pos);
        pos += 8;
        return value;
      };
      if (entry.uncompressed === 0xffffffff) entry.uncompressed = take();
      if (entry.compressed === 0xffffffff) entry.compressed = take();
      if (entry.offset === 0xffffffff) entry.offset = take();
      return;
    }
    cursor = end;
  }
}

async function readCentralDirectory(fh, size) {
  const tailSize = Math.min(size, 22 + 0xffff);
  const tail = Buffer.alloc(tailSize);
  await readExact(fh, tail, size - tailSize);
  let eocdIndex = -1;
  for (let index = tail.length - 22; index >= 0; index -= 1) {
    if (tail.readUInt32LE(index) !== 0x06054b50) continue;
    const commentLength = tail.readUInt16LE(index + 20);
    if (index + 22 + commentLength === tail.length) {
      eocdIndex = index;
      break;
    }
  }
  if (eocdIndex < 0) throw coded("zip");

  let totalEntries = tail.readUInt16LE(eocdIndex + 10);
  let cdSize = tail.readUInt32LE(eocdIndex + 12);
  let cdOffset = tail.readUInt32LE(eocdIndex + 16);
  const needsZip64 = totalEntries === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff;
  if (needsZip64) {
    const eocdPos = size - tail.length + eocdIndex;
    if (eocdPos < 20) throw coded("zip");
    const locator = Buffer.alloc(20);
    await readExact(fh, locator, eocdPos - 20);
    if (locator.readUInt32LE(0) !== 0x07064b50) throw coded("zip");
    const zip64 = Buffer.alloc(56);
    await readExact(fh, zip64, readU64(locator, 8));
    if (zip64.readUInt32LE(0) !== 0x06064b50) throw coded("zip");
    totalEntries = readU64(zip64, 32);
    cdSize = readU64(zip64, 40);
    cdOffset = readU64(zip64, 48);
  }
  if (totalEntries > MAX_ENTRIES || cdSize > MAX_CENTRAL_DIRECTORY_BYTES) throw coded("zip");
  if (cdOffset + cdSize > size) throw coded("zip");

  const directory = Buffer.alloc(cdSize);
  if (cdSize > 0) await readExact(fh, directory, cdOffset);
  const entries = [];
  let cursor = 0;
  while (cursor + 46 <= directory.length) {
    if (directory.readUInt32LE(cursor) !== 0x02014b50) throw coded("zip");
    const flags = directory.readUInt16LE(cursor + 8);
    const method = directory.readUInt16LE(cursor + 10);
    const compressed = directory.readUInt32LE(cursor + 20);
    const uncompressed = directory.readUInt32LE(cursor + 24);
    const nameLength = directory.readUInt16LE(cursor + 28);
    const extraLength = directory.readUInt16LE(cursor + 30);
    const commentLength = directory.readUInt16LE(cursor + 32);
    const external = directory.readUInt32LE(cursor + 38);
    const offset = directory.readUInt32LE(cursor + 42);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;
    const extraEnd = nameEnd + extraLength;
    const next = extraEnd + commentLength;
    if (next > directory.length) throw coded("zip");
    const entry = {
      name: directory.subarray(nameStart, nameEnd).toString("utf8"),
      flags,
      method,
      compressed,
      uncompressed,
      external,
      offset,
    };
    if (compressed === 0xffffffff || uncompressed === 0xffffffff || offset === 0xffffffff) {
      applyZip64(entry, directory.subarray(nameEnd, extraEnd));
    }
    entries.push(entry);
    cursor = next;
  }
  if (entries.length !== totalEntries) throw coded("zip");
  return entries;
}

function entryDestination(root, name) {
  const normalized = String(name).replaceAll("\\", "/");
  if (normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized) || normalized.includes("\0")) throw coded("zip");
  const parts = normalized.split("/").filter((part) => part.length > 0);
  if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) throw coded("zip");
  const dest = path.resolve(root, ...parts);
  const relative = path.relative(root, dest);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw coded("zip");
  return { dest, directory: normalized.endsWith("/"), skip: parts[0] === "__MACOSX" };
}

async function extractZip(zipPath, destDir, { signal, onProgress } = {}) {
  const fh = await fs.promises.open(zipPath, "r");
  const reporter = { phase: "", at: 0 };
  try {
    const stat = await fh.stat();
    const entries = await readCentralDirectory(fh, stat.size);
    let uncompressedTotal = 0;
    for (const entry of entries) {
      if (entry.flags & 1) throw coded("zip");
      if (entry.method !== 0 && entry.method !== 8) throw coded("zip");
      if (entry.uncompressed > MAX_ENTRY_BYTES) throw coded("zip");
      uncompressedTotal += entry.uncompressed;
      if (uncompressedTotal > MAX_UNCOMPRESSED_BYTES) throw coded("zip");
      const mode = (entry.external >>> 16) & 0xffff;
      if ((mode & 0o170000) === 0o120000) throw coded("zip");
    }
    await fs.promises.mkdir(destDir, { recursive: true });
    let received = 0;
    for (const entry of entries) {
      if (signal?.aborted) throw coded("cancelled");
      const target = entryDestination(destDir, entry.name);
      if (target.skip) continue;
      if (target.directory) {
        await fs.promises.mkdir(target.dest, { recursive: true });
        continue;
      }
      const header = Buffer.alloc(30);
      if (entry.offset < 0 || entry.offset + 30 > stat.size) throw coded("zip");
      await readExact(fh, header, entry.offset);
      if (header.readUInt32LE(0) !== 0x04034b50) throw coded("zip");
      const dataOffset = entry.offset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28);
      if (dataOffset + entry.compressed > stat.size) throw coded("zip");
      await fs.promises.mkdir(path.dirname(target.dest), { recursive: true });
      if (entry.compressed === 0) {
        await fs.promises.writeFile(target.dest, Buffer.alloc(0));
      } else {
        const source = fs.createReadStream(zipPath, { start: dataOffset, end: dataOffset + entry.compressed - 1 });
        const inflate = entry.method === 8 ? zlib.createInflateRaw() : new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          },
        });
        let produced = 0;
        const counter = new Transform({
          transform(chunk, _encoding, callback) {
            produced += chunk.length;
            if (produced > entry.uncompressed) {
              callback(coded("zip"));
              return;
            }
            received += chunk.length;
            reportProgress(onProgress, reporter, { phase: "extracting", received, total: uncompressedTotal });
            callback(null, chunk);
          },
        });
        await pipeline(source, inflate, counter, fs.createWriteStream(target.dest), { signal });
        if (produced !== entry.uncompressed) throw coded("zip");
      }
    }
    onProgress?.({ phase: "extracting", received, total: uncompressedTotal });
  } finally {
    await fh.close();
  }
}

async function downloadToFile(url, dest, { fetchImpl, signal, onProgress, maxBytes }) {
  const doFetch = fetchImpl || globalThis.fetch;
  let response;
  try {
    response = await doFetch(url, {
      signal,
      redirect: "follow",
      headers: { "user-agent": "tucools", accept: "application/octet-stream" },
    });
  } catch (error) {
    if (signal?.aborted || error?.name === "AbortError") throw coded("cancelled");
    throw coded("network", error);
  }
  if (!response?.ok || !response.body) throw coded("http");
  const total = Number(response.headers.get("content-length") || 0);
  if (total > maxBytes) throw coded("disk");
  const reporter = { phase: "", at: 0 };
  let received = 0;
  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      if (received > maxBytes) {
        callback(coded("disk"));
        return;
      }
      reportProgress(onProgress, reporter, { phase: "downloading", received, total });
      callback(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(response.body), counter, fs.createWriteStream(dest), { signal });
  } catch (error) {
    if (signal?.aborted || error?.name === "AbortError" || error?.code === "cancelled") throw coded("cancelled");
    if (error?.code === "disk") throw error;
    throw coded("network", error);
  }
  onProgress?.({ phase: "downloading", received, total: total || received });
}

async function assertZip(zipPath) {
  const fh = await fs.promises.open(zipPath, "r");
  try {
    const header = Buffer.alloc(4);
    const { bytesRead } = await fh.read(header, 0, 4, 0);
    if (bytesRead < 4 || header.readUInt32LE(0) !== 0x04034b50) throw coded("zip");
  } finally {
    await fh.close();
  }
}

async function isDirectory(dir) {
  try {
    return (await fs.promises.stat(dir)).isDirectory();
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function findPackRoot(dir, depth = 0) {
  if ((await isDirectory(path.join(dir, "models"))) && (await isDirectory(path.join(dir, "bin")))) return dir;
  if (depth >= 3) return null;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "__MACOSX") continue;
    const found = await findPackRoot(path.join(dir, entry.name), depth + 1);
    if (found) return found;
  }
  return null;
}

async function makeExecutable(destDir) {
  if (process.platform === "win32") return;
  const stack = [path.join(destDir, "bin")];
  while (stack.length) {
    const current = stack.pop();
    const entries = await fs.promises.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) await fs.promises.chmod(full, 0o755);
    }
  }
}

async function installModelPack({
  destDir,
  url = MODEL_PACK_URL,
  fetchImpl,
  signal,
  onProgress,
  maxBytes = MAX_DOWNLOAD_BYTES,
} = {}) {
  if (!destDir) throw coded("disk");
  const work = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tucools-model-"));
  try {
    const zipPath = path.join(work, "model-pack.zip");
    await downloadToFile(url, zipPath, { fetchImpl, signal, onProgress, maxBytes });
    await assertZip(zipPath);
    const extracted = path.join(work, "unpacked");
    await extractZip(zipPath, extracted, { signal, onProgress });
    const root = await findPackRoot(extracted);
    if (!root) throw coded("layout");
    await fs.promises.mkdir(destDir, { recursive: true });
    await fs.promises.cp(path.join(root, "models"), path.join(destDir, "models"), { recursive: true, force: true });
    await fs.promises.cp(path.join(root, "bin"), path.join(destDir, "bin"), { recursive: true, force: true });
    await makeExecutable(destDir);
  } catch (error) {
    throw normalize(error, signal);
  } finally {
    await fs.promises.rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = {
  MODEL_PACK_URL,
  extractZip,
  installModelPack,
};
