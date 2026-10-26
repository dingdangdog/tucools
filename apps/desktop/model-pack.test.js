const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const test = require("node:test");
const zlib = require("zlib");
const { extractZip, installModelPack } = require("./model-pack");

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return ~crc >>> 0;
}

function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.data ?? "");
    const compressed = entry.store ? data : zlib.deflateRawSync(data);
    const method = entry.store ? 0 : 8;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(Buffer.concat([local, name, compressed]));
    centrals.push(Buffer.concat([central, name]));
    offset += local.length + name.length + compressed.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, eocd]);
}

async function tempDir() {
  return fs.promises.mkdtemp(path.join(os.tmpdir(), "tucools-model-test-"));
}

function listen(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

test("extracts models and bin, including a nested pack root and stored files", async () => {
  const root = await tempDir();
  try {
    const zipPath = path.join(root, "pack.zip");
    const unpacked = path.join(root, "unpacked");
    await fs.promises.writeFile(zipPath, buildZip([
      { name: "model-pack/models/u2net.onnx", data: "cutout-model" },
      { name: "model-pack/bin/linux/upscayl-bin", data: "upscaler", store: true },
      { name: "model-pack\\bin\\windows\\upscayl-bin.exe", data: "windows" },
    ]));
    await extractZip(zipPath, unpacked);
    assert.equal(await fs.promises.readFile(path.join(unpacked, "model-pack", "models", "u2net.onnx"), "utf8"), "cutout-model");
    assert.equal(await fs.promises.readFile(path.join(unpacked, "model-pack", "bin", "linux", "upscayl-bin"), "utf8"), "upscaler");
    assert.equal(await fs.promises.readFile(path.join(unpacked, "model-pack", "bin", "windows", "upscayl-bin.exe"), "utf8"), "windows");
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test("rejects zip entries that escape the destination", async () => {
  const root = await tempDir();
  try {
    const zipPath = path.join(root, "pack.zip");
    const unpacked = path.join(root, "unpacked");
    const outside = path.join(root, "secret.txt");
    await fs.promises.writeFile(zipPath, buildZip([
      { name: "../secret.txt", data: "nope" },
      { name: "models/u2net.onnx", data: "model" },
    ]));
    await assert.rejects(() => extractZip(zipPath, unpacked), (error) => error.code === "zip");
    assert.equal(fs.existsSync(outside), false);
  } finally {
    await fs.promises.rm(root, { recursive: true, force: true });
  }
});

test("downloads, follows a redirect, and installs into the model directory", async () => {
  const zip = buildZip([
    { name: "model-pack/model-pack/models/u2net.onnx", data: "cutout" },
    { name: "model-pack/model-pack/bin/macos/upscayl-bin", data: "mac" },
  ]);
  const { server, origin } = await listen((req, res) => {
    if (req.url === "/start") {
      res.writeHead(302, { location: "/model-pack.zip" });
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "application/zip", "content-length": String(zip.length) });
    res.end(zip);
  });
  const dest = await tempDir();
  const phases = [];
  try {
    await installModelPack({
      destDir: dest,
      url: `${origin}/start`,
      onProgress: (payload) => phases.push(payload.phase),
    });
    assert.equal(await fs.promises.readFile(path.join(dest, "models", "u2net.onnx"), "utf8"), "cutout");
    assert.equal(await fs.promises.readFile(path.join(dest, "bin", "macos", "upscayl-bin"), "utf8"), "mac");
    assert.equal(phases.includes("downloading"), true);
    assert.equal(phases.includes("extracting"), true);
  } finally {
    server.close();
    await fs.promises.rm(dest, { recursive: true, force: true });
  }
});

test("rejects an archive that has no models and bin directories", async () => {
  const zip = buildZip([{ name: "readme.txt", data: "hello" }]);
  const { server, origin } = await listen((_req, res) => {
    res.writeHead(200, { "content-type": "application/zip", "content-length": String(zip.length) });
    res.end(zip);
  });
  const dest = await tempDir();
  try {
    await assert.rejects(
      () => installModelPack({ destDir: dest, url: `${origin}/model-pack.zip` }),
      (error) => error.code === "layout",
    );
    assert.equal(fs.existsSync(path.join(dest, "models")), false);
  } finally {
    server.close();
    await fs.promises.rm(dest, { recursive: true, force: true });
  }
});

test("maps an HTTP error and a cancelled download", async () => {
  const { server, origin } = await listen((req, res) => {
    if (req.url === "/missing") {
      res.writeHead(404);
      res.end("missing");
      return;
    }
    res.writeHead(200, { "content-type": "application/zip" });
    res.write("PK");
  });
  const dest = await tempDir();
  try {
    await assert.rejects(
      () => installModelPack({ destDir: dest, url: `${origin}/missing` }),
      (error) => error.code === "http",
    );
    const controller = new AbortController();
    const pending = installModelPack({ destDir: dest, url: `${origin}/slow`, signal: controller.signal });
    setTimeout(() => controller.abort(), 30);
    await assert.rejects(pending, (error) => error.code === "cancelled");
    assert.equal(fs.existsSync(path.join(dest, "models")), false);
  } finally {
    server.closeAllConnections?.();
    server.close();
    await fs.promises.rm(dest, { recursive: true, force: true });
  }
});
