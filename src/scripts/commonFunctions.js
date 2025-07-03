/**
 * ART Timer - Common Functions
 * Shared utility functions for timer calculations and UI elements
 */

/**
 * Creates an SVG element with the specified attributes
 * 
 * @param {string} type - The type of SVG element to create
 * @param {Object} attributes - Key-value pairs of attributes to set
 * @returns {Element} The created SVG element
 */
const createSVGElement = (type, attributes) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const element = document.createElementNS(svgNS, type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    return element;
};

/**
 * Checks if a date is within a specified range
 * 
 * @param {Date} currentDate - The date to check
 * @param {string|Date} startDate - The start of the range
 * @param {string|Date} endDate - The end of the range
 * @returns {boolean} True if the date is within the range
 */
const isWithinDateRange = (currentDate, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return currentDate >= start && currentDate <= end;
};

/**
 * Creates an HTML element with the specified attributes
 * 
 * @param {string} type - The type of element to create
 * @param {Object} attributes - Key-value pairs of attributes to set
 * @returns {Element} The created HTML element
 */
const createElement = (type, attributes = {}) => {
    const element = document.createElement(type);
    Object.keys(attributes).forEach(attr => element.setAttribute(attr, attributes[attr]));
    return element;
};

/**
 * Creates a session header element with alert functionality
 * 
 * @param {Object} session - The session data
 * @returns {Element} The created session header element
 */
const createSessionHeader = (session) => {
    const sessionHeaderP = createElement('p', {
        class: 'each-session-header',
        onclick: 'remindMe(this)'
    });
    sessionHeaderP.textContent = session.name;
    sessionHeaderP.appendChild(createSpanTooltipForAlert());
    if (isAlertSet(session)) {
        sessionHeaderP.appendChild(generateBellIconSpan());
    }
    return sessionHeaderP;
};

/**
 * Creates a countdown bar for a session
 * 
 * @param {Object} session - The session data
 * @param {string} sessionId - The session identifier
 * @param {Object} sessionTimers - Object to store timer references
 * @returns {Element} The created countdown bar element
 */
const createCountdownBar = (session, sessionId, sessionTimers) => {
    const countdownBarDiv = createElement('div', {
        class: 'countdown-bar',
        'data-session-id': sessionId
    });

    const now = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);

    let duration = 100;
    if (now >= start && now <= end) {
        duration = calculateDurationInMinutes(now, session.endDate) * 60;
    } else if (now < start) {
        duration = calculateDurationInMinutes(session.startDate, session.endDate) * 60;
    }

    const svgElement = createCountdownSVG(duration);
    countdownBarDiv.appendChild(svgElement);

    // Store session end time for live updating
    sessionTimers[sessionId] = { countdownBarDiv, startTime: start, endTime: end };

    return countdownBarDiv;
};

/**
 * Gets the remaining time in the day in IST timezone
 * 
 * @returns {Object} Object containing hours and minutes remaining
 */
function getRemainingTimeInDayIST() {
    const istNow = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const now = new Date(istNow);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const remainingTime = endOfDay - now;

    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}

/**
 * Calculates the number of working days between two dates
 * 
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} The number of working days
 */
function calculateWorkingDays(startDate, endDate) {
    let totalDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            totalDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalDays;
}

/**
 * Identifies the current ART activity based on the current date
 * 
 * @param {Array} piPlanningAndInnovation - Planning and innovation weeks
 * @param {Array} piIterations - PI iterations
 * @returns {Object|undefined} The current ART activity or undefined
 */
function identifyCurrentArtActivity(piPlanningAndInnovation, piIterations) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if the current date is within the ART planning
    const planningWeek = piPlanningAndInnovation[0];
    if (isWithinDateRange(currentDate, planningWeek.startDate, planningWeek.endDate)) {
        return planningWeek;
    }

    // Check if the current date is within the Innovation week
    const innovationWeek = piPlanningAndInnovation[1];
    if (isWithinDateRange(currentDate, innovationWeek.startDate, innovationWeek.endDate)) {
        return innovationWeek;
    }

    // Check if the current date is within any of the PI iterations
    const currentIteration = piIterations.find(iteration =>
        isWithinDateRange(currentDate, iteration.startDate, iteration.endDate)
    );

    return currentIteration;
}

/**
 * Creates an SVG countdown animation
 * 
 * @param {number} duration - The duration in seconds
 * @returns {Element} The SVG element with countdown animation
 */
function createCountdownSVG(duration) {
    const rectangleHeight = 30;
    const rectangleWidth = 300;
    const colors = {
        background: "white",
        foreground: "#0C8DE8",
        text: "white"
    };

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

    const foregroundRect = createSVGElement("rect", {
        x: "0",
        y: "0",
        width: "100%",
        height: "100%",
        fill: colors.foreground
    });

    const animate = createSVGElement("animate", {
        attributeName: "width",
        from: rectangleWidth,
        to: "0",
        dur: `${duration}s`,
        fill: "freeze",
        begin: "0s"
    });

    foregroundRect.appendChild(animate);

    const text = createSVGElement("text", {
        x: "50%",
        y: "50%",
        fill: colors.text,
        "font-size": "18",
        "font-weight": "bold",
        "text-anchor": "middle",
        "dominant-baseline": "middle"
    });
    text.textContent = `${new Date(duration * 1000).toISOString().substr(11, 8)} remaining`;

    svg.appendChild(backgroundRect);
    svg.appendChild(foregroundRect);
    svg.appendChild(text);

    return svg;
}

/**
 * Calculates the duration in minutes between two dates
 * 
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} The duration in minutes
 */
function calculateDurationInMinutes(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = (end - start) / 1000 / 60;
    return duration;
}

/**
 * Creates a tooltip span element for alerts
 * 
 * @returns {Element} The tooltip span element
 */
function createSpanTooltipForAlert() {
    const span = document.createElement('span');
    span.textContent = "Click for Alert";
    span.classList.add('tooltip');
    return span;
}

/**
 * Checks if an alert is set on a node
 * 
 * @param {Object} node - The node to check
 * @returns {boolean} True if an alert is set
 */
function isAlertSet(node) {
    return Array.isArray(node.alerts) && node.alerts.some(alert => alert.timerEnabled === "true");
}

/**
 * Generates a bell icon span element
 * 
 * @returns {Element} The bell icon span element
 */
function generateBellIconSpan() {
    const span = document.createElement('span');
    span.textContent = "🔔";
    return span;
}

/**
 * Updates the progress display for a timer
 * 
 * @param {number|string} timerId - The ID of the timer
 * @param {Date|string} startDate - The start date
 * @param {number} decrementPerDay - The daily decrement percentage
 * @param {number} totalDays - The total number of days
 * @param {number} circleRadius - The radius of the progress circle
 */
async function updateProgress(timerId, startDate, decrementPerDay, totalDays, circleRadius) {
    const currentDate = new Date();
    let elapsedDays = 0;
    let remainingTimeInCurrentDay = { hours: 0, minutes: 0 };
    let remainingDays = totalDays;

    if (currentDate > startDate) {
        elapsedDays = calculateWorkingDays(startDate, currentDate) - 1;
        remainingTimeInCurrentDay = getRemainingTimeInDayIST();
        remainingDays = totalDays - elapsedDays - 1;
    }

    // Calculate the remaining percentage
    const totalRemainingTime = remainingDays * decrementPerDay +
        (remainingTimeInCurrentDay.hours / 24) +
        (remainingTimeInCurrentDay.minutes / (24 * 60));
    const remainingPercentage = Math.max(totalRemainingTime, 0);

    // Update the timer display
    const element = document.getElementById("timer" + String(timerId));
    const circleElement = document.getElementById("progressCircle" + String(timerId));

    element.textContent = `${remainingDays} Days ${remainingTimeInCurrentDay.hours} Hours ${remainingTimeInCurrentDay.minutes} Minutes left`;

    // Calculate and update progress circle
    const circumference = 2 * Math.PI * circleRadius;
    const dashOffset = circumference * (remainingPercentage / 100);
    circleElement.setAttribute("stroke-dasharray", `${circumference}`);
    circleElement.setAttribute("stroke-dashoffset", `${dashOffset}`);
}

// Export the functions
module.exports = {
    calculateWorkingDays,
    getRemainingTimeInDayIST,
    identifyCurrentArtActivity,
    createCountdownSVG,
    calculateDurationInMinutes,
    updateProgress,
    createElement,
    createSessionHeader,
    createCountdownBar
};

/**
 * Calculates the number of working days between two dates
 * 
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} The number of working days
 */
function calculateWorkingDays(startDate, endDate) {
    let totalDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            totalDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalDays;
}

/**
 * Identifies the current ART activity based on the current date
 * 
 * @param {Array} piPlanningAndInnovation - Planning and innovation weeks
 * @param {Array} piIterations - PI iterations
 * @returns {Object|undefined} The current ART activity or undefined
 */
function identifyCurrentArtActivity(piPlanningAndInnovation, piIterations) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if the current date is within the ART planning
    const planningWeek = piPlanningAndInnovation[0];
    if (isWithinDateRange(currentDate, planningWeek.startDate, planningWeek.endDate)) {
        return planningWeek;
    }

    // Check if the current date is within the Innovation week
    const innovationWeek = piPlanningAndInnovation[1];
    if (isWithinDateRange(currentDate, innovationWeek.startDate, innovationWeek.endDate)) {
        return innovationWeek;
    }

    // Check if the current date is within any of the PI iterations
    const currentIteration = piIterations.find(iteration =>
        isWithinDateRange(currentDate, iteration.startDate, iteration.endDate)
    );

    return currentIteration;
}

/**
 * Creates an SVG countdown animation
 * 
 * @param {number} duration - The duration in seconds
 * @returns {Element} The SVG element with countdown animation
 */
function createCountdownSVG(duration) {
    const rectangleHeight = 30;
    const rectangleWidth = 300;
    const colors = {
        background: "white",
        foreground: "#0C8DE8",
        text: "white"
    };

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

    const foregroundRect = createSVGElement("rect", {
        x: "0",
        y: "0",
        width: "100%",
        height: "100%",
        fill: colors.foreground
    });

    const animate = createSVGElement("animate", {
        attributeName: "width",
        from: rectangleWidth,
        to: "0",
        dur: `${duration}s`,
        fill: "freeze",
        begin: "0s"
    });

    foregroundRect.appendChild(animate);

    const text = createSVGElement("text", {
        x: "50%",
        y: "50%",
        fill: colors.text,
        "font-size": "18",
        "font-weight": "bold",
        "text-anchor": "middle",
        "dominant-baseline": "middle"
    });
    text.textContent = `${new Date(duration * 1000).toISOString().substr(11, 8)} remaining`;

    svg.appendChild(backgroundRect);
    svg.appendChild(foregroundRect);
    svg.appendChild(text);

    return svg;
}

/**
 * Calculates the duration in minutes between two dates
 * 
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {number} The duration in minutes
 */
function calculateDurationInMinutes(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = (end - start) / 1000 / 60;
    return duration;
}

/**
 * Creates a tooltip span element for alerts
 * 
 * @returns {Element} The tooltip span element
 */
function createSpanTooltipForAlert() {
    const span = document.createElement('span');
    span.textContent = "Click for Alert";
    span.classList.add('tooltip');
    return span;
}

/**
 * Checks if an alert is set on a node
 * 
 * @param {Object} node - The node to check
 * @returns {boolean} True if an alert is set
 */
function isAlertSet(node) {
    return Array.isArray(node.alerts) && node.alerts.some(alert => alert.timerEnabled === "true");
}

/**
 * Generates a bell icon span element
 * 
 * @returns {Element} The bell icon span element
 */
function generateBellIconSpan() {
    const span = document.createElement('span');
    span.textContent = "🔔";
    return span;
}

/**
 * Updates the progress display for a timer
 * 
 * @param {number|string} timerId - The ID of the timer
 * @param {Date|string} startDate - The start date
 * @param {number} decrementPerDay - The daily decrement percentage
 * @param {number} totalDays - The total number of days
 * @param {number} circleRadius - The radius of the progress circle
 */
async function updateProgress(timerId, startDate, decrementPerDay, totalDays, circleRadius) {
    const currentDate = new Date();
    let elapsedDays = 0;
    let remainingTimeInCurrentDay = { hours: 0, minutes: 0 };
    let remainingDays = totalDays;

    if (currentDate > startDate) {
        elapsedDays = calculateWorkingDays(startDate, currentDate) - 1;
        remainingTimeInCurrentDay = getRemainingTimeInDayIST();
        remainingDays = totalDays - elapsedDays - 1;
    }

    // Calculate the remaining percentage
    const totalRemainingTime = remainingDays * decrementPerDay +
        (remainingTimeInCurrentDay.hours / 24) +
        (remainingTimeInCurrentDay.minutes / (24 * 60));
    const remainingPercentage = Math.max(totalRemainingTime, 0);
    console.log("Remaining percentage", remainingPercentage);

    // Update the timer display
    const element = document.getElementById("timer" + String(timerId));
    const circleElement = document.getElementById("progressCircle" + String(timerId));

    element.textContent = `${remainingDays} Days ${remainingTimeInCurrentDay.hours} Hours ${remainingTimeInCurrentDay.minutes} Minutes left`;

    // Calculate and update progress circle
    const circumference = 2 * Math.PI * circleRadius;
    const dashOffset = circumference *(1-remainingPercentage / 100);
    circleElement.setAttribute("stroke-dasharray", `${circumference}`);
    circleElement.setAttribute("stroke-dashoffset", `${dashOffset}`);
}

// Export the functions
module.exports = {
    calculateWorkingDays,
    getRemainingTimeInDayIST,
    identifyCurrentArtActivity,
    createCountdownSVG,
    calculateDurationInMinutes,
    updateProgress,
    createElement,
    createSessionHeader,
    createCountdownBar
};