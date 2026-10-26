const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tucools", {
  saveBytes(filename, bytes) {
    return ipcRenderer.invoke("dialog:save-bytes", filename, bytes);
  },
  downloadModelPack() {
    return ipcRenderer.invoke("models:download");
  },
  cancelModelPack() {
    return ipcRenderer.invoke("models:cancel");
  },
  modelPackDirectory() {
    return ipcRenderer.invoke("models:directory");
  },
  onModelPackProgress(callback) {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("models:progress", listener);
    return () => ipcRenderer.removeListener("models:progress", listener);
  },
});
