/**
 * ART Timer - Primary window script
 * Handles the main application window, sessions, countdowns, and reminders
 */

// Define global variables
let artStartDate, artEndDate, iterationStartDate, iterationEndDate;
let piPlanningAndInnovation, piIterations, helpers;
let sessionTimers = {};

/**
 * Loads the configuration data and initializes global timer variables
 * @returns {Promise<boolean>} True if config loaded successfully, false otherwise
 */
async function loadConfigAndInitialize() {
  try {
    const config = await window.electron.readConfig('/src/inputParameters.json');

    // Parse and assign the dates from config to global variables
    piPlanningAndInnovation = config.PI_1.PI_PlanningAndInnovation;
    piIterations = config.PI_1.PI_Iterations;
    artStartDate = new Date(config.PI_1.startDate);
    artEndDate = new Date(config.PI_1.endDate);

    return true;
  } catch (error) {
    console.error('Error loading config:', error);
    return false;
  }
}

// Initialize the page when it loads
window.onload = function() {
  renderDetails();
  setInterval(updateCountdowns, 1000);
};

/**
 * Toggles the menu visibility and adjusts the UI accordingly
 */
function menu() {
  const menuElement = document.getElementById("menu");
  const bottomElement = document.getElementsByClassName("bottom")[0];
  const detail = document.getElementsByClassName("detail")[0];
  const body = document.getElementsByTagName("body")[0];

  // Check if menu is hidden by checking the computed style
  const isMenuHidden = window.getComputedStyle(menuElement).display === "none";

  if (isMenuHidden) {
    menuElement.style.display = "flex";
    bottomElement.style.opacity = "0.05";
    detail.style.opacity = "0.05";
    body.style.background = "#313131";
  } else {
    menuElement.style.display = "none";
    bottomElement.style.opacity = "1";
    detail.style.opacity = "1";
    body.style.background = "#E3E5F2";
  }
}

/**
 * Changes the theme of the application
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
 */
function maximizeWindow() {
  menu();
  window.electron.maximizeWindow();
}

/**
 * Toggles between the detail view and the bottom view
 */
function toggleDetail() {
  const bottomElement = document.getElementsByClassName("bottom")[0];
  const detailElement = document.getElementsByClassName("detail")[0];
  const isBottomDisplayNone = window.getComputedStyle(bottomElement).display === "none";
  const isDetailDisplayNone = window.getComputedStyle(detailElement).display === "none";

  if (isBottomDisplayNone && !isDetailDisplayNone) {
    bottomElement.style.display = "flex";
    detailElement.style.display = "none";
  } else {
    bottomElement.style.display = "none";
    detailElement.style.display = "flex";
  }
}

/**
 * Renders the activity details in the UI
 */
function renderDetails() {
  window.electron.readConfig('/src/inputParameters.json')
    .then(jsonData => {
      document.querySelector('.detail-bottom').innerHTML = ''; // Clear existing content
      
      const numberOfActivities = jsonData.PI_1.PI_PlanningAndInnovation[0].activities.length;
      for (let i = 0; i < numberOfActivities; i++) {
        const eachActivity = jsonData.PI_1.PI_PlanningAndInnovation[0].activities[i];
        const eachDetail = document.createElement('div');
        eachDetail.classList.add('each-detail');
        
        const detailHeaderP = document.createElement('p');
        const day = eachActivity.day;
        const activityName = eachActivity.name;
        detailHeaderP.textContent = `Day ${day} : ${activityName}`;
        detailHeaderP.classList.add('each-detail-header');
        
        const sessionDiv = document.createElement('div');
        sessionDiv.classList.add('session');
        const eachSessionDiv = document.createElement('div');
        eachSessionDiv.classList.add('each-session');
 
        const numberOfSessions = eachActivity.sessions.length;
        for (let j = 0; j < numberOfSessions; j++) {
          const eachSession = eachActivity.sessions[j];
          const sessionHeaderP = document.createElement('p');
          const eachSessionInsideDiv = document.createElement('div');
          eachSessionInsideDiv.classList.add('each-session-inside');
          
          sessionHeaderP.textContent = eachSession.name;
          sessionHeaderP.classList.add('each-session-header');
          sessionHeaderP.setAttribute('onclick', 'remindMe(this)');
          sessionHeaderP.setAttribute('data-session-name', eachSession.name);
          sessionHeaderP.setAttribute('data-session-day', day);
          
          const spanElement = createSpanTooltipForAlert();
          sessionHeaderP.appendChild(spanElement);
          
          if (isAlertSet(eachSession)) {
            const alertCount = eachSession.alerts.filter(alert => alert.timerEnabled === "true").length;
            const bellSpanElement = generateBellIconSpan(alertCount);
            sessionHeaderP.appendChild(bellSpanElement);
          }
          
          const countdownBarDiv = document.createElement('div');
          countdownBarDiv.classList.add('countdown-bar');
          countdownBarDiv.setAttribute('data-session-id', `session-${i}-${j}`); // Unique ID
          
          const now = new Date();
          const start = new Date(eachSession.startDate);
          const end = new Date(eachSession.endDate);
          
          let duration = 0;
          if (now >= start && now <= end) {
            const activityElement = document.getElementById("timer2-description");
            activityElement.textContent = eachActivity.sessions[j].name;
            duration = window.electron.calculateDurationInMinutes(now, eachSession.endDate) * 60;
          } else if (now < start) {
            duration = window.electron.calculateDurationInMinutes(eachSession.startDate, eachSession.endDate) * 60;
          }
          
          const svgElement = createCountdownSVG(duration, start, end);
          countdownBarDiv.appendChild(svgElement);

          // Store session end time for live updating
          sessionTimers[`session-${i}-${j}`] = { 
            countdownBarDiv, 
            startTime: start, 
            endTime: end 
          };
          
          eachSessionInsideDiv.appendChild(sessionHeaderP);
          eachSessionInsideDiv.appendChild(countdownBarDiv);
          eachSessionDiv.appendChild(eachSessionInsideDiv);
        }
        
        sessionDiv.appendChild(eachSessionDiv);
        eachDetail.appendChild(detailHeaderP);
        eachDetail.appendChild(sessionDiv);
        document.querySelector('.detail-bottom').appendChild(eachDetail);
      }
    })
    .catch(err => {
      console.error('Error reading JSON file:', err);
    });
}

/**
 * Creates a span element with tooltip for alert
 * @returns {HTMLSpanElement} The created span element
 */
function createSpanTooltipForAlert() {
  const span = document.createElement('span');
  span.textContent = "Click for Alert";
  span.classList.add('tooltip');
  return span;
}

/**
 * Generates a bell icon span element
 * @param {number} count - The count of alerts
 * @returns {HTMLSpanElement} The created span element with bell icon
 */
function generateBellIconSpan(count = 1) {
  const span = document.createElement('span');
  span.textContent = count > 1 ? `🔔×${count}` : "🔔";
  return span;
}

/**
 * Checks if an alert is set on a node
 * @param {Object} node - The node to check
 * @returns {boolean} True if alert is set, false otherwise
 */
function isAlertSet(node) {
  return Array.isArray(node.alerts) && node.alerts.some(alert => alert.timerEnabled === "true");
}

/**
 * Creates a countdown SVG element
 * @param {number} duration - The duration in seconds
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {SVGElement} The created SVG element
 */
function createCountdownSVG(duration, startDate, endDate) {
  const rectangleHeight = 30;
  const rectangleWidth = 300;
  const colors = {
    background: "white",
    foreground: "#0C8DE8",
    pending: "#cccccc",
    completed: "#28A745",
    text: "#9cd6ff"
  };

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total session duration
  const totalDurationMinutes = window.electron.calculateDurationInMinutes(start, end);
  const totalHours = Math.floor(totalDurationMinutes / 60);
  const totalMinutes = Math.floor(totalDurationMinutes % 60);
  const totalDurationText = totalHours > 0 
    ? `${totalHours}h ${totalMinutes}m` 
    : `${totalMinutes}m`;
  
  const svg = createSVGElement("svg", {
    width: rectangleWidth,
    height: rectangleHeight,
    xmlns: "http://www.w3.org/2000/svg"
  });

  const backgroundRect = createSVGElement("rect", {
    x: "0",
    y: "0",
    width: "100%",
    height: "100%",
    fill: colors.background
  });

  let progressRect, statusText;
  
  // Different states based on session timing
  if (now < start) {
    // Session hasn't started yet
    progressRect = createSVGElement("rect", {
      x: "0",
      y: "0",
      width: "100%",
      height: "100%",
      fill: colors.pending
    });
    
    statusText = `Starts in ${formatTimeRemaining(start - now)} (${totalDurationText})`;
  } 
  else if (now > end) {
    // Session has ended
    progressRect = createSVGElement("rect", {
      x: "0",
      y: "0",
      width: "100%",
      height: "100%",
      fill: colors.completed
    });
    
    statusText = "Completed";
  }
  else {
    // Session is in progress
    const remainingPercentage = Math.min(100, Math.max(0, (duration / (24 * 60 * 60)) * 100));
    const barWidth = (remainingPercentage / 100) * rectangleWidth;
    
    progressRect = createSVGElement("rect", {
      x: "0",
      y: "0",
      width: barWidth + "px",
      height: "100%",
      fill: colors.foreground
    });
    
    statusText = `${new Date(duration * 1000).toISOString().substr(11, 8)} remaining`;
  }

  const text = createSVGElement("text", {
    x: "50%",
    y: "50%",
    fill: now < start || now > end ? "white" : colors.text, // White for pending/completed, dark for active
    "font-size": "18",
    "font-weight": "bold",
    "text-anchor": "middle",
    "dominant-baseline": "middle"
  });
  
  text.textContent = statusText;

  svg.appendChild(backgroundRect);
  svg.appendChild(progressRect);
  svg.appendChild(text);

  return svg;
}

/**
 * Formats time remaining in a human-readable format
 * @param {number} milliseconds - The time in milliseconds
 * @returns {string} Formatted time string
 */
function formatTimeRemaining(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Creates an SVG element with the specified attributes
 * @param {string} type - The type of SVG element
 * @param {Object} attributes - The attributes to set
 * @returns {SVGElement} The created SVG element
 */
const createSVGElement = (type, attributes) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const element = document.createElementNS(svgNS, type);
  Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
  return element;
};

/**
 * Updates all countdowns every second
 */
function updateCountdowns() {
  const now = new Date();
  for (const sessionId in sessionTimers) {
    const { countdownBarDiv, startTime, endTime } = sessionTimers[sessionId];
    
    const textElement = countdownBarDiv.querySelector('text');
    const progressRect = countdownBarDiv.querySelector('rect:nth-child(2)');
    
    if (!textElement || !progressRect) continue;
    
    // Calculate total session duration
    const totalDurationMinutes = window.electron.calculateDurationInMinutes(startTime, endTime);
    const totalHours = Math.floor(totalDurationMinutes / 60);
    const totalMinutes = Math.floor(totalDurationMinutes % 60);
    const totalDurationText = totalHours > 0 
      ? `${totalHours}h ${totalMinutes}m` 
      : `${totalMinutes}m`;
    
    // Session hasn't started yet
    if (now < startTime) {
      textElement.textContent = `Starts in ${formatTimeRemaining(startTime - now)} (${totalDurationText})`;
      textElement.setAttribute('fill', 'white'); // White text on gray background
    } 
    // Session is in progress
    else if (now >= startTime && now <= endTime) {
      const remainingTime = window.electron.calculateDurationInMinutes(now, endTime) * 60;
      const totalDuration = window.electron.calculateDurationInMinutes(startTime, endTime) * 60;
      const remainingPercentage = (remainingTime / totalDuration) * 100;
      
      textElement.textContent = `${new Date(remainingTime * 1000).toISOString().substr(11, 8)} remaining`;
      textElement.setAttribute('fill', '#9cd6ff'); // Dark text for visibility
      progressRect.setAttribute('width', `${remainingPercentage}%`);
      progressRect.setAttribute('fill', '#0C8DE8'); // Active color
    } 
    // Session has ended
    else {
      textElement.textContent = "Completed";
      textElement.setAttribute('fill', 'white'); // White text on green background
      progressRect.setAttribute('width', "100%");
      progressRect.setAttribute('fill', '#28A745');
    }
  }
}

/**
 * Triggers the reminder function for a session
 * @param {HTMLElement} element - The element that triggered the reminder
 */
function remindMe(element) {
  const name = element.getAttribute('data-session-name');
  const day = element.getAttribute('data-session-day');
  window.electron.remindMe({ innerText: name }, day);
}

// Event listener for when a reminder is added
window.electron.onReminderAdded((text) => {
  document.querySelectorAll('.each-session-header').forEach((header) => {
    if (header.innerText === text || header.innerText.startsWith(text + " ")) {
      // Remove any existing bell icons
      header.querySelectorAll('span').forEach(span => {
        if (span.textContent.startsWith("🔔")) span.remove();
      });
      // Append bell icon
      header.innerHTML += '<span>🔔</span>';
    }
  });
});

// Event listener for when a reminder is triggered
window.electron.onReminderTriggered((text) => {
  document.querySelectorAll('.each-session-header').forEach((header) => {
    if (header.innerText.includes(text)) {
      header.innerHTML = header.innerHTML.replace('<span>🔔</span>', '');
    }
  });
});

/**
 * Handles the small batch timer
 */
function handleSmallBatchTimer() {
  const currentArtActivity = window.electron.identifyCurrentArtActivity(piPlanningAndInnovation, piIterations);

  if (!currentArtActivity) {
    console.error('Failed to identify the current ART activity.');
    return;
  }

  const activityStartDate = new Date(currentArtActivity.startDate);
  const activityEndDate = new Date(currentArtActivity.endDate);
  const totalDays = window.electron.calculateWorkingDays(activityStartDate, activityEndDate);
  const decrementPerDay = 100 / totalDays;

  // Update Small Batch Timer
  window.electron.updateProgress(2, activityStartDate, decrementPerDay, totalDays, 160);
  const smallBatchTimer = setInterval(() => {
    window.electron.updateProgress(2, activityStartDate, decrementPerDay, totalDays, 160);
  }, 24 * 60 * 60 * 1000); // Update daily

  const activityElement = document.getElementById("timer2-description");
  activityElement.textContent = currentArtActivity.name;
}

/**
 * Main handler function for initializing timers
 */
function mainHandler() {
  const artTotalDays = window.electron.calculateWorkingDays(artStartDate, artEndDate);

  if (artTotalDays <= 0) {
    console.error('Invalid ART dates. Please check the input parameters.');
    return;
  }

  const artDecrementPerDay = 100 / artTotalDays;
  
  // Update ART Timer
  window.electron.updateProgress(1, artStartDate, artDecrementPerDay, artTotalDays, 160);
  const artTimer = setInterval(() => {
    window.electron.updateProgress(1, artStartDate, artDecrementPerDay, artTotalDays, 160);
  }, 24 * 60 * 60 * 1000); // Update daily

  // Update small batch Timer
  handleSmallBatchTimer();
}

/**
 * Initializes the application
 * Ensures mainHandler is executed only after config is loaded
 */
async function initializeApplication() {
  const isConfigLoaded = await loadConfigAndInitialize();
  if (isConfigLoaded) {
    mainHandler(); // Call mainHandler only if the config was loaded successfully
  } else {
    console.error('Failed to initialize application due to config loading issues.');
  }
}
  
// Initialize the application
initializeApplication();

// Export the functions
module.exports = {
  isAlertSet,
  formatTimeRemaining,
  minimizeWindow,
  maximizeWindow,
  createSpanTooltipForAlert,
  generateBellIconSpan
};