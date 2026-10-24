const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const Busboy = require("busboy");

const MAX_BYTES = 50 * 1024 * 1024;

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
  };
  return types[ext] || "application/octet-stream";
}

function sendJson(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(raw);
}

function proxyTo(req, res, port) {
  const headers = { ...req.headers, host: `127.0.0.1:${port}` };
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port,
      path: req.url,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );
  upstream.on("error", () => {
    if (!res.headersSent) sendJson(res, 502, { detail: "引擎没有响应。请先启动本机引擎。" });
    else res.end();
  });
  req.pipe(upstream);
}

function createStaticServer(webRoot, engine) {
  return http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (url.pathname === "/app-config.json") {
      const raw = String(process.env.TUCOOLS_FEATURES || "").replace(/[^A-Za-z0-9,-]/g, "");
      const body = JSON.stringify({ features: raw });
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      res.end(body);
      return;
    }
    if (url.pathname.startsWith("/api/engine")) {
      if (engine.mode === "legacy") {
        handleLegacy(req, res, engine.runtime);
        return;
      }
      proxyTo(req, res, engine.port);
      return;
    }
    const requested = decodeURIComponent(url.pathname);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    let filePath = path.normalize(path.join(webRoot, relative));
    if (!filePath.startsWith(path.normalize(webRoot))) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(webRoot, "index.html");
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("页面不存在");
        return;
      }
      res.writeHead(200, { "content-type": contentType(filePath) });
      res.end(data);
    });
  });
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(typeof address === "object" && address ? address.port : 0);
    });
  });
}

function runtimeModels(runtime) {
  return path.join(runtime, "models");
}

function missingModels(runtime, names) {
  return names.filter((name) => !fs.existsSync(path.join(runtimeModels(runtime), name)));
}

function legacyHealth(runtime) {
  const cutoutFiles = ["u2net.onnx", "u2netp.onnx", "u2net_human_seg.onnx", "isnet-general-use.onnx", "isnet-anime.onnx"];
  const cutoutMissing = missingModels(runtime, cutoutFiles);
  const eraseMissing = missingModels(runtime, ["big-lama.pt"]);
  const enhancePairs = {
    balanced: ["upscayl-lite-4x.bin", "upscayl-lite-4x.param"],
    standard: ["upscayl-standard-4x.bin", "upscayl-standard-4x.param"],
    premium: ["realesrgan-x4plus.bin", "realesrgan-x4plus.param"],
    anime: ["digital-art-4x.bin", "digital-art-4x.param"],
    anime_pro: ["realesrgan-x4plus-anime.bin", "realesrgan-x4plus-anime.param"],
  };
  const enhanceMissing = [];
  const enhanceAvailable = [];
  for (const [name, files] of Object.entries(enhancePairs)) {
    const absent = missingModels(runtime, files);
    if (absent.length) enhanceMissing.push(...absent);
    else enhanceAvailable.push(name);
  }
  const upscayl = path.join(runtime, "bin", "windows", "upscayl-bin.exe");
  if (!fs.existsSync(upscayl)) enhanceMissing.push(upscayl);
  if (!fs.existsSync(path.join(runtime, "eenhance.exe"))) enhanceMissing.push("eenhance.exe");
  if (!fs.existsSync(path.join(runtime, "erembg.exe"))) cutoutMissing.push("erembg.exe");
  if (!fs.existsSync(path.join(runtime, "eerase.exe"))) eraseMissing.push("eerase.exe");
  return {
    ok: true,
    device: "cpu",
    cuda: false,
    modelsDir: runtimeModels(runtime),
    upscayl,
    cutout: {
      ready: fs.existsSync(path.join(runtime, "erembg.exe")) && cutoutMissing.length < cutoutFiles.length,
      missing: cutoutMissing,
      available: cutoutFiles.filter((name) => fs.existsSync(path.join(runtimeModels(runtime), name))).map((name) => name.replace(".onnx", "")),
    },
    enhance: {
      ready: fs.existsSync(path.join(runtime, "eenhance.exe")) && fs.existsSync(upscayl) && enhanceAvailable.length > 0,
      missing: enhanceMissing,
      available: enhanceAvailable,
    },
    erase: {
      ready: eraseMissing.length === 0,
      missing: eraseMissing,
      available: eraseMissing.length ? [] : ["lama"],
    },
  };
}

const jobs = new Map();
let legacyBusy = false;

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES } });
    const fields = {};
    const files = {};
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tucools-"));
    const writes = [];
    let failed = false;
    busboy.on("field", (name, value) => {
      fields[name] = value;
    });
    busboy.on("file", (name, stream, info) => {
      const ext = path.extname(info.filename || "") || ".png";
      const dest = path.join(dir, `${name}${ext}`);
      const writer = fs.createWriteStream(dest);
      writes.push(
        new Promise((done, fail) => {
          writer.on("finish", () => {
            files[name] = dest;
            done();
          });
          writer.on("error", fail);
        })
      );
      stream.on("limit", () => {
        failed = true;
        reject(Object.assign(new Error("图片超过 50MB。"), { status: 400 }));
      });
      stream.pipe(writer);
    });
    busboy.on("error", reject);
    busboy.on("finish", () => {
      Promise.all(writes)
        .then(() => {
          if (!failed) resolve({ dir, fields, files });
        })
        .catch(reject);
    });
    req.pipe(busboy);
  });
}

function spawnJob(runtime, command, args, job) {
  const child = spawn(command, args, { cwd: runtime, windowsHide: true });
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString("utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith("PROGRESS:")) continue;
      try {
        const payload = JSON.parse(line.slice("PROGRESS:".length));
        job.events.push({
          status: "running",
          percentage: Number(payload.percentage || 0),
          message: payload.status || "正在处理",
        });
      } catch {
        // 忽略无法解析的进度行
      }
    }
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });
  child.on("close", (code) => {
    legacyBusy = false;
    if (code === 0 && fs.existsSync(job.output)) {
      job.events.push({ status: "completed", percentage: 100, message: "处理完成" });
    } else {
      job.events.push({
        status: "failed",
        percentage: 100,
        message: "处理失败",
        error: stderr.trim() || `处理进程退出，代码 ${code}`,
      });
    }
  });
}

function writeSse(res, job) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  let sent = 0;
  const timer = setInterval(() => {
    while (sent < job.events.length) {
      res.write(`data: ${JSON.stringify(job.events[sent])}\n\n`);
      sent += 1;
    }
    const last = job.events[job.events.length - 1];
    if (last && (last.status === "completed" || last.status === "failed")) {
      clearInterval(timer);
      res.end();
    }
  }, 300);
  res.on("close", () => clearInterval(timer));
}

function handleLegacy(req, res, runtime) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/api/engine/health") {
    sendJson(res, 200, legacyHealth(runtime));
    return;
  }
  const events = url.pathname.match(/^\/api\/engine\/jobs\/([^/]+)\/events$/);
  if (req.method === "GET" && events) {
    const job = jobs.get(events[1]);
    if (!job) {
      sendJson(res, 404, { detail: "任务不存在或已过期。" });
      return;
    }
    writeSse(res, job);
    return;
  }
  const result = url.pathname.match(/^\/api\/engine\/jobs\/([^/]+)\/result$/);
  if (req.method === "GET" && result) {
    const job = jobs.get(result[1]);
    if (!job) {
      sendJson(res, 404, { detail: "任务不存在或已过期。" });
      return;
    }
    const last = job.events[job.events.length - 1];
    if (!last || last.status !== "completed" || !fs.existsSync(job.output)) {
      sendJson(res, last?.status === "failed" ? 400 : 409, { detail: last?.error || "结果还没准备好。" });
      return;
    }
    res.writeHead(200, { "content-type": "image/png" });
    fs.createReadStream(job.output).pipe(res);
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 404, { detail: "接口不存在。" });
    return;
  }
  if (legacyBusy) {
    sendJson(res, 409, { detail: "引擎正在处理另一张图片，请等当前任务结束后再试。" });
    return;
  }
  parseMultipart(req)
    .then(({ dir, fields, files }) => {
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const output = path.join(dir, "result.png");
      const job = { id, output, events: [{ status: "queued", percentage: 0, message: "已排队" }] };
      let command = "";
      let args = [];
      if (url.pathname === "/api/engine/cutout") {
        command = path.join(runtime, "erembg.exe");
        args = [files.image, output, "--model", fields.model || "u2net"];
      } else if (url.pathname === "/api/engine/enhance") {
        command = path.join(runtime, "eenhance.exe");
        args = [files.image, output, "--model", fields.model || "balanced", "--scale", fields.scale || "2"];
      } else if (url.pathname === "/api/engine/erase") {
        command = path.join(runtime, "eerase.exe");
        args = ["--image", files.image, "--mask", files.mask, "--output", output, "--mode", "common_removal", "--model", "lama", "--device", fields.device || "cpu"];
      } else {
        sendJson(res, 404, { detail: "接口不存在。" });
        return;
      }
      if (!files.image || !fs.existsSync(command)) {
        sendJson(res, 400, { detail: `找不到处理程序：${command}` });
        return;
      }
      legacyBusy = true;
      jobs.set(id, job);
      spawnJob(runtime, command, args, job);
      sendJson(res, 200, { id, status: "running", percentage: 0, message: "已排队" });
    })
    .catch((error) => {
      sendJson(res, error.status || 400, { detail: error.message || "无法读取上传的图片。" });
    });
}

function pythonCommand() {
  if (process.env.TUCOOLS_PYTHON) return { command: process.env.TUCOOLS_PYTHON, prefix: [] };
  const venv = path.resolve(__dirname, "../../.venv/Scripts/python.exe");
  if (fs.existsSync(venv)) return { command: venv, prefix: [] };
  return { command: "py", prefix: ["-3"] };
}

function modelPackDir(isPackaged) {
  if (process.env.TUCOOLS_MODEL_PACK) return path.resolve(process.env.TUCOOLS_MODEL_PACK);
  if (isPackaged) {
    const base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(base, "tucools", "model-pack");
  }
  return path.resolve(__dirname, "../../model-pack");
}

function startPythonEngine(engineDir, port, packDir = modelPackDir(false)) {
  const spec = pythonCommand();
  const child = spawn(spec.command, [...spec.prefix, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: engineDir,
    windowsHide: true,
    env: { ...process.env, PYTHONPATH: engineDir, TUCOOLS_MODEL_PACK: packDir },
  });
  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function startBundledEngine(executable, port, packDir) {
  return spawn(executable, [], {
    windowsHide: true,
    env: { ...process.env, PORT: String(port), TUCOOLS_MODEL_PACK: packDir },
  });
}

async function chooseEngine(resourcesPath, isPackaged) {
  const bundled = path.join(resourcesPath, "engine", "tucools-engine.exe");
  if (fs.existsSync(bundled)) return { mode: "bundled", executable: bundled };
  const runtime = process.env.TUCOOLS_RUNTIME;
  if (runtime && fs.existsSync(path.join(runtime, "erembg.exe"))) return { mode: "legacy", runtime };
  const engineDir = isPackaged ? path.join(resourcesPath, "engine") : path.resolve(__dirname, "../../services/engine");
  return { mode: "python", engineDir };
}

async function startHost({ webRoot, resourcesPath, isPackaged }) {
  const choice = await chooseEngine(resourcesPath, isPackaged);
  const enginePort = 8787;
  const packDir = modelPackDir(isPackaged);
  let child = null;
  if (choice.mode === "bundled") child = startBundledEngine(choice.executable, enginePort, packDir);
  if (choice.mode === "python") child = startPythonEngine(choice.engineDir, enginePort, packDir);
  const server = createStaticServer(webRoot, {
    mode: choice.mode === "legacy" ? "legacy" : "proxy",
    port: enginePort,
    runtime: choice.runtime,
  });
  const port = await listen(server);
  return {
    url: `http://127.0.0.1:${port}/`,
    mode: choice.mode,
    stop() {
      server.close();
      if (child && !child.killed) child.kill();
    },
  };
}

module.exports = { startHost, startPythonEngine };
