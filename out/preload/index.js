"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  getIpAddress: async () => {
    return await ipcRenderer.invoke("get-ip-address");
  }
});
