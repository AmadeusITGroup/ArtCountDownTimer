/**
 * ART Timer - Preload Script
 * Exposes Electron APIs to renderer processes
 * 
 * This file is responsible for securely exposing specific Electron APIs
 * to the renderer process using the contextBridge API.
 */

const { contextBridge, ipcRenderer } = require("electron");
const commonFunctions = require("./commonFunctions");

/**
 * Expose APIs to renderer process
 * Using contextBridge for secure IPC communication
 */
contextBridge.exposeInMainWorld("electron", {
  // Window management functions
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  showMainWindow: () => ipcRenderer.send("show-main-window"),

  // Reminder management functions
  remindMe: (element, day) => ipcRenderer.send("remind-me", {
    name: element.innerText.replace("Click for Alert", "").trim(),
    day
  }),
  onReminderAdded: (callback) =>
    ipcRenderer.on("reminder-added", (event, elementText) => callback(elementText)),
  onReminderTriggered: (callback) =>
    ipcRenderer.on("reminder-triggered", (event, elementText) => callback(elementText)),

  // Configuration handling
  readConfig: (filePath) => ipcRenderer.invoke("read-config", filePath),

  // Timer and UI utility functions from commonFunctions
  calculateWorkingDays: commonFunctions.calculateWorkingDays,
  identifyCurrentArtActivity: commonFunctions.identifyCurrentArtActivity,
  createCountdownSVG: commonFunctions.createCountdownSVG,
  calculateDurationInMinutes: commonFunctions.calculateDurationInMinutes,
  updateProgress: commonFunctions.updateProgress,
  createElement: commonFunctions.createElement,
  createSessionHeader: commonFunctions.createSessionHeader,
  createCountdownBar: commonFunctions.createCountdownBar
});