const { app, BrowserWindow, dialog, ipcMain, net } = require("electron");
const fs = require("fs");
const path = require("path");
const { startHost, startPythonEngine, modelPackDir } = require("./host");
const { installModelPack } = require("./model-pack");

let host;
let engineChild;
let lastUrl = "";
let modelDownloadAbort = null;

const MODEL_DOWNLOAD_CODES = new Set(["cancelled", "network", "http", "zip", "layout", "disk", "busy"]);

function stopChildren() {
  if (host) {
    host.stop();
    host = null;
  }
  if (engineChild && !engineChild.killed) engineChild.kill();
  engineChild = null;
}

function webDevUrl() {
  return process.env.TUCOOLS_WEB_URL || "http://127.0.0.1:13175";
}

async function reachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitFor(url, tries = 40) {
  for (let index = 0; index < tries; index += 1) {
    if (await reachable(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function createWindow(url) {
  lastUrl = url;
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 880,
    minHeight: 640,
    title: "图酷",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  window.loadURL(url);
}

function offlinePage(message) {
  const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>图酷</title><body style="font-family:Segoe UI,Microsoft YaHei,sans-serif;padding:32px"><h1>图酷</h1><p>${message}</p></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function sendModelProgress(sender, payload) {
  if (sender.isDestroyed()) return;
  sender.send("models:progress", payload);
}

ipcMain.handle("models:download", async (event) => {
  if (modelDownloadAbort) return { ok: false, code: "busy" };
  const controller = new AbortController();
  modelDownloadAbort = controller;
  const sender = event.sender;
  try {
    const directory = modelPackDir(app.isPackaged);
    await installModelPack({
      destDir: directory,
      fetchImpl: (url, init) => net.fetch(url, init),
      signal: controller.signal,
      onProgress: (payload) => sendModelProgress(sender, payload),
    });
    return { ok: true, directory };
  } catch (error) {
    const code = MODEL_DOWNLOAD_CODES.has(error?.code) ? error.code : "network";
    if (code !== "cancelled") console.error(error?.cause || error);
    return { ok: false, code };
  } finally {
    if (modelDownloadAbort === controller) modelDownloadAbort = null;
  }
});

ipcMain.handle("models:cancel", () => {
  modelDownloadAbort?.abort();
});

ipcMain.handle("models:directory", () => modelPackDir(app.isPackaged));

ipcMain.handle("dialog:save-bytes", async (_event, filename, bytes) => {
  const result = await dialog.showSaveDialog({ defaultPath: filename });
  if (result.canceled || !result.filePath) return "cancelled";
  await fs.promises.writeFile(result.filePath, Buffer.from(bytes));
  return "saved";
});

app.whenReady().then(async () => {
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && lastUrl) createWindow(lastUrl);
  });

  if (app.isPackaged) {
    host = await startHost({
      webRoot: path.join(process.resourcesPath, "web"),
      resourcesPath: process.resourcesPath,
      isPackaged: true,
    });
    createWindow(host.url);
    return;
  }

  const devEngine = path.resolve(__dirname, "../../services/engine");
  if (!(await reachable("http://127.0.0.1:8787/api/engine/health"))) {
    engineChild = startPythonEngine(devEngine, 8787);
  }
  const webReady = await waitFor(webDevUrl(), 20);
  if (!webReady) {
    createWindow(offlinePage("开发页面还没启动。请在另一个终端运行 npm run dev:web。"));
    return;
  }
  createWindow(webDevUrl());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopChildren();
    app.quit();
  }
});

app.on("before-quit", () => {
  modelDownloadAbort?.abort();
  stopChildren();
});
