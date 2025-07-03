/**
 * ART Timer - Secondary Window Script
 * Handles the minimized window view functionality and timer displays
 */

// Define global variables
let artStartDate, artEndDate, iterationStartDate, iterationEndDate, piPlanningAndInnovation, piIterations;

/**
 * Loads configuration from file and initializes global variables
 * @returns {Promise<boolean>} True if configuration loaded successfully
 */
async function loadConfigAndInitialize() {
  try {
    const config = await window.electron.readConfig('/src/inputParameters.json');

    // Parse and assign the dates from config to global variables
    piPlanningAndInnovation = config.PI_1.PI_PlanningAndInnovation;
    piIterations = config.PI_1.PI_Iterations;
    const innovationWeek = piPlanningAndInnovation[1];
    artStartDate = new Date(innovationWeek.startDate);
    artEndDate = new Date(piIterations[piIterations.length - 1].endDate);

    return true;
  } catch (error) {
    console.error('Error loading config:', error);
    return false;
  }
}

/**
 * Toggles the menu visibility
 */
function menu() {
  const menuElement = document.getElementById("menu");
  const bottomElement = document.getElementsByClassName("bottom")[0];
  const body = document.getElementsByTagName("body")[0];

  // Check if menu is hidden by checking the computed style
  const isMenuHidden = window.getComputedStyle(menuElement).display === "none";

  if (isMenuHidden) {
    menuElement.style.display = "flex";
    bottomElement.style.opacity = "0.05";
    body.style.background = "#313131";
  } else {
    menuElement.style.display = "none";
    bottomElement.style.opacity = "1";
    body.style.background = "#f2f1ed";
  }
}

/**
 * Toggles between light and dark theme
 */
function changeTheme() {
  const html = document.getElementsByTagName("html")[0];
  const computedStyle = window.getComputedStyle(html);
  const currentFilter = computedStyle.filter;
  const isInverted = currentFilter.includes("invert(0)");

  if (isInverted) {
    html.style.filter = "invert(1) hue-rotate(190deg)";
    menu();
  } else {
    html.style.filter = "invert(0) hue-rotate(0deg)";
    menu();
  }
}

/**
 * Minimizes the window
 */
function minimizeWindow() {
  menu();
  window.electron.minimizeWindow();
}

/**
 * Maximizes the window
 * Closes the secondary window and shows the main window
 */
function maximizeWindow() {
  menu();
  window.electron.maximizeWindow();

  // Close the secondary window
  window.close();

  // Open the app session running in the system tray
  window.electron.showMainWindow();
}

/**
 * Handles the small batch timer initialization and updates
 */
function handleSmallBatchTimer() {
  console.log("Handling Small Batch Timer");
  const currentArtActivity = window.electron.identifyCurrentArtActivity(piPlanningAndInnovation, piIterations);

  if (!currentArtActivity) {
    console.error('Failed to identify the current ART activity.');
    return;
  }

  console.log("Current ART Activity:", currentArtActivity.name);

  const activityStartDate = new Date(currentArtActivity.startDate);
  const activityEndDate = new Date(currentArtActivity.endDate);
  const totalDays = window.electron.calculateWorkingDays(activityStartDate, activityEndDate);
  const decrementPerDay = 100 / totalDays;

  // Update Small Batch Timer
  window.electron.updateProgress(2, activityStartDate, decrementPerDay, totalDays, 80);

  // Set up interval for daily updates
  setInterval(() => {
    window.electron.updateProgress(2, activityStartDate, decrementPerDay, totalDays, 80);
  }, 24 * 60 * 60 * 1000); // Update daily

  // Update timer description
  const activityElement = document.getElementById("timer2-description");
  activityElement.textContent = currentArtActivity.name;
}

/**
 * Initializes the application after ensuring config is loaded
 */
async function initializeApplication() {
  const isConfigLoaded = await loadConfigAndInitialize();
  if (isConfigLoaded) {
    handleSmallBatchTimer();
  } else {
    console.error('Failed to initialize application due to config loading issues.');
  }
}

// Initialize the application when the script runs
initializeApplication();