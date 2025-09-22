/**
 * ART Timer - Reminder Window Script
 * Handles the reminder creation and submission functionality
 */

const { ipcRenderer } = require("electron");

/**
 * Parse URL parameters to get session information
 */
const urlParams = new URLSearchParams(window.location.search);
const sessionName = decodeURIComponent(urlParams.get("name") || "");
const sessionDay = decodeURIComponent(urlParams.get("day") || "");

/**
 * Set up event listeners for the reminder form
 */
document.getElementById("alertButton").addEventListener("click", () => {
  // Get form values
  const message = document.getElementById("message").value.trim();
  const days = parseInt(document.getElementById("days").value.trim()) || 0;
  const hours = parseInt(document.getElementById("hours").value.trim()) || 0;
  const minutes = parseInt(document.getElementById("minutes").value.trim()) || 0;

  // Validate form
  if (!message && !days && !hours && !minutes) {
    alert("Please fill any one of the fields (Message, Days, Hours, or Minutes) before submitting.");
    return;
  }

  // Send reminder data to main process
  ipcRenderer.send("set-reminder", {
    message,
    alertDays: days,
    alertHours: hours,
    alertMinutes: minutes,
    name: sessionName,
    day: sessionDay
  });
});

document.getElementById("cancelButton").addEventListener("click", () => {
  window.close();
});