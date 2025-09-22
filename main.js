/**
 * ART Timer - Electron application for managing ART planning sessions
 */
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

// Set app ID for Windows notifications
if (process.platform === "win32") {
  app.setAppUserModelId("ART.Timer");
}

const isPackaged = app.isPackaged;
let jsonPath;
let tray = null;
let isQuitting = false;
let mainWindow;
let secondaryWin;

// Determine the path to the input parameters JSON file
if (isPackaged) {
  jsonPath = path.join(process.resourcesPath, "inputParameters.json");
} else {
  jsonPath = path.join(__dirname, "src", "inputParameters.json");
}

// Load configuration data
const _data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

/**
 * Get the appropriate notification icon path based on environment
 * @returns {string} Path to the notification icon
 */
function getNotificationIcon() {
  if (isPackaged) {
    return path.join(process.resourcesPath, "app_icon.ico");
  } else {
    return path.join(__dirname, "src/resources/static/img/icon.ico");
  }
}

// Handle read-config IPC requests
ipcMain.handle("read-config", (event, filePath) => {
  let configPath;
  if (app.isPackaged) {
    configPath = path.join(process.resourcesPath, "inputParameters.json");
  } else {
    configPath = path.join(__dirname, "src", "inputParameters.json");
  }
  
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, "utf-8", (err, data) => {
      if (err) {
        reject("Error reading config file: " + err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
});

// Enable hot reload in development
if (process.env.NODE_ENV !== "production") {
  try {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
  } catch (e) {
    console.log("electron-reload not installed");
  }
}

// Disable SMIL animations in SVG
app.commandLine.appendSwitch("disable-blink-features", "SVGSMILEnabled");

/**
 * Create the main application window
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1066,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "./src/scripts/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });
  
  mainWindow.loadFile("./src/views/primaryWindow.html");
  
  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
  
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
  
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * Create the secondary mini window
 */
function createSecondaryWindow() {
  secondaryWin = new BrowserWindow({
    width: 300,
    height: 300,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    maximizable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "./src/scripts/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    }
  });
  
  secondaryWin.loadFile("./src/views/secondaryWindow.html");

  secondaryWin.on("closed", () => {
    secondaryWin = null;
  });
}

// Handle IPC events for window management
ipcMain.on("minimize-window", () => {
  if (mainWindow) {
    mainWindow.close();
    createSecondaryWindow();
  }
});

ipcMain.on("maximize-window", () => {
  if (secondaryWin) {
    secondaryWin.close();
    createMainWindow();
  }
});

ipcMain.on("remind-me", (event, { name, day }) => {
  remindMe({ name, day });
});

app.on("window-all-closed", () => {
  console.log("All windows closed, app still running in tray");
});

/**
 * Convert a local date to UTC
 * @param {Date} date - The date to convert
 * @returns {string} - ISO string in UTC
 */
function convertToUTC(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

/**
 * Find a session by name and activity day
 * @param {Object} data - The data object containing sessions
 * @param {string} sessionName - The name of the session to find
 * @param {string} activityDay - The day of the activity
 * @returns {Object|null} - The session object or null if not found
 */
function findSessionByName(data, sessionName, activityDay) {
  const activities = data.PI_1.PI_PlanningAndInnovation[0].activities;
  for (const activity of activities) {
    if (activity.day && activityDay && activity.day.toString().trim() === activityDay.toString().trim()) {
      for (const session of activity.sessions) {
        console.log("Comparing session:", session.name, "with", sessionName);
        if (
          typeof session.name === "string" &&
          session.name.trim().toLowerCase() === sessionName.trim().toLowerCase()
        ) {
          return session;
        }
      }
    }
  }
  return null;
}

// Handle setting reminders
ipcMain.on("set-reminder", (event, { message, alertDays, alertHours, alertMinutes, name, day }) => {
  console.log("set-reminder called with:", name, day);
  const data = _data;

  const focusedWindow = BrowserWindow.getFocusedWindow();
  const element = focusedWindow ? focusedWindow.getTitle() : null;
  if (!element) return;

  const result = findSessionByName(data, name, day);
  if (!result) {
    console.error("Could not find session for reminder:", name, day);
    return;
  }

  // Ensure alerts array exists
  if (!Array.isArray(result.alerts)) {
    result.alerts = [];
  }

  const resultDateTime = new Date(result.startDate);
  resultDateTime.setTime(resultDateTime.getTime() - 
    (alertDays * 24 * 60 * 60 * 1000) - 
    (alertHours * 60 * 60 * 1000) - 
    (alertMinutes * 60 * 1000));

  // Add new alert to the array
  const newAlert = {
    timerEnabled: "true",
    message,
    alertTime: convertToUTC(resultDateTime)
  };
  result.alerts.push(newAlert);

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  const delay = resultDateTime.getTime() - new Date().getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification({ 
        title: `Reminder: ${name}`, 
        body: message, 
        icon: getNotificationIcon(), 
        appID: "ART.Timer" 
      }).show();
      
      mainWindow.webContents.send("reminder-triggered", element);
    }, delay);
  }

  mainWindow.webContents.send("reminder-added", element);
  if (focusedWindow) focusedWindow.close();
});

/**
 * Create and show the reminder window
 * @param {Object} element - The element containing session information
 */
function remindMe(element) {
  let reminderWindow = new BrowserWindow({
    width: 350,
    height: 400,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Pass session name and day as query parameters
  const sessionName = encodeURIComponent(element.name.trim());
  const sessionDay = encodeURIComponent(element.day);
  
  reminderWindow.loadFile(
    path.join(__dirname, "./src/views/reminderWindow.html"),
    { query: { name: sessionName, day: sessionDay } }
  );
  
  reminderWindow.setTitle(element.name.trim());
}

/**
 * Schedule all reminders from configuration
 */
function scheduleAllReminders() {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const activities = data.PI_1.PI_PlanningAndInnovation[0].activities;
  
  for (const activity of activities) {
    for (const session of activity.sessions) {
      if (Array.isArray(session.alerts)) {
        for (const alert of session.alerts) {
          console.log("Found alert:", alert);
          
          if (alert.timerEnabled === "true") {
            const alertTime = new Date(alert.alertTime).getTime();
            const now = Date.now();
            const delay = alertTime - now;
            
            if (delay > 0) {
              console.log("Scheduling alert for", alertTime, "with message:", alert.message);
              
              setTimeout(() => {
                console.log("Triggering notification:", alert.message);
                
                new Notification({ 
                  title: `Reminder: ${session.name}`, 
                  body: alert.message, 
                  icon: getNotificationIcon(), 
                  appID: "ART.Timer" 
                }).show();
                
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("reminder-triggered", session.name);
                }
              }, delay);
            } else if (delay > -5 * 60 * 1000) { // If missed within last 5 minutes
              console.log("Missed alert, triggering immediately:", alert.message);
              
              new Notification({ 
                title: `Reminder: ${session.name}`, 
                body: alert.message, 
                icon: getNotificationIcon(), 
                appID: "ART.Timer" 
              }).show();
              
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send("reminder-triggered", session.name);
              }
            } else {
              console.log("Alert time is in the past:", alertTime);
            }
          }
        }
      }
    }
  }
}

// Ensure only a single instance of the app is running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // If a second instance is launched, show and focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show(); // Ensure the window is visible
      mainWindow.focus(); // Bring it to the foreground
    } else {
      createMainWindow(); // Recreate the main window if it doesn't exist
    }
  });

  app.whenReady().then(() => {
    createMainWindow();
    createTray();
    scheduleAllReminders();
    
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  /**
   * Create the system tray icon and menu
   */
  function createTray() {
    let iconPath;
    if (isPackaged) {
      iconPath = path.join(process.resourcesPath, "tray_icon.png");
    } else {
      iconPath = path.join(__dirname, "src/resources/static/img/tray_icon.png");
    }

    tray = new Tray(iconPath);
    tray.setToolTip("ART Timer");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open ART Timer",
        click: () => {
          if (secondaryWin) {
            secondaryWin.close(); // Close the secondary window if active
          }
          if (mainWindow) {
            mainWindow.show();
          } else {
            createMainWindow();
          }
        }
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      if (secondaryWin) {
        secondaryWin.close(); // Close the secondary window if active
      }
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      } else {
        createMainWindow();
      }
    });
  }

  // Handle showing all reminders
  ipcMain.on("show-reminders", (event) => {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const reminders = [];

    const activities = data.PI_1.PI_PlanningAndInnovation[0].activities;
    for (const activity of activities) {
      for (const session of activity.sessions) {
        if (Array.isArray(session.alerts)) {
          for (const alert of session.alerts) {
            reminders.push({
              sessionName: session.name,
              message: alert.message,
              alertTime: alert.alertTime
            });
          }
        }
      }
    }

    const reminderWindow = new BrowserWindow({
      width: 400,
      height: 500,
      resizable: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "./src/scripts/preload.js"),
        nodeIntegration: true,
        contextIsolation: true,
      }
    });

    reminderWindow.loadFile("./src/views/reminderWindow.html");

    reminderWindow.webContents.once("did-finish-load", () => {
      reminderWindow.webContents.send("load-reminders", reminders);
    });
  });

  // Handle showing the main window
  ipcMain.on("show-main-window", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });
}