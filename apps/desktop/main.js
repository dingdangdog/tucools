const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { startHost, startPythonEngine } = require("./host");

let host;
let engineChild;

function webDevUrl() {
  return process.env.TUCOOLS_WEB_URL || "http://127.0.0.1:5173";
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
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 880,
    minHeight: 640,
    title: "图酷",
    icon: path.join(__dirname, "build", "icon.ico"),
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

ipcMain.handle("dialog:save-bytes", async (_event, filename, bytes) => {
  const result = await dialog.showSaveDialog({ defaultPath: filename });
  if (result.canceled || !result.filePath) return "cancelled";
  await fs.promises.writeFile(result.filePath, Buffer.from(bytes));
  return "saved";
});

app.whenReady().then(async () => {
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
  if (host) host.stop();
  if (engineChild && !engineChild.killed) engineChild.kill();
  if (process.platform !== "darwin") app.quit();
});
