const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tucools", {
  saveBytes(filename, bytes) {
    return ipcRenderer.invoke("dialog:save-bytes", filename, bytes);
  },
});
