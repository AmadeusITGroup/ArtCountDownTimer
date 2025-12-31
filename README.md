## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How to use](#how-to-use-application)
- [Configuration](#configuration)
- [Development](#development)
- [Technologies](#technologies)
- [Contributing](#contributing)

---

## Overview
ART Timer is a lightweight application designed to help teams track Program Increment (PI) planning sessions, innovation sprints, and iterations. It provides visual countdown timers, custom reminders, and detailed session tracking to improve coordination during Agile events.

---
## Features

**Multiple Timer Views:**
- Primary window with detailed PI and iteration timers
- Minimizable secondary window for at-a-glance progress
- System tray integration for background operation

**Comprehensive Timers:**
- Visual countdown displays with circular progress indicators
- Daily updates showing remaining days, hours, and minutes
- Session-specific timers for planning activities
- Shows the total duration of each session

**Reminder System:**
- Set custom reminders for sessions and activities
- Desktop notifications with customizable messages
- Persistent reminder tracking between application restarts

**Customization Options:**
- Light/dark theme switching
- Configurable planning sessions and iterations via JSON
- Detailed session information and descriptions

**User-Friendly Interface:**
- Interactive session details view
- One-click reminder creation
- Minimizable to secondary window or system tray

**Use Case:**
- This utility can be used for any SAFe practices

---
## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

### Steps

- **Method I - Using setup.exe file**

    #### Setup
    - Find the **ART Timer Setup 1.0.0.exe** file for the installation.
    - Check under Releases section to get the latest setup file.
    - After the installation, it will appear under the name **ART Timer**.
    - Once you open the app, initially, it will load an existing JSON file.
    
    #### Configuration
    - Since the app loaded with sample JSON data, it can be configured as per the user needs.
    - For Windows Users: 
        - Navigate to the following directory:  
            `C:\Users\<your_username>\AppData\Local\Programs\art-timer\resources`
        - Replace `<your_username>` with your actual Windows username.
        - Locate the file named `inputParameters.json`.
        - Edit this file as needed, then reopen the app to see the changes.

    - Build for Distribution (Optional)

        `npm run build`

        This will create installable packages in the `dist` directory.

- **Method II - Using Batch file** [Development purpose only]

    #### Setup
    - Clone the repository.
    - Find the **start-app.bat** file under the root directory.
    - Once you run the batch file, it will install the required dependencies and runs the app.

    #### Configuration
    - Find the **inputParameters.json** file under **/src** directory to configure the JSON file.

- **Method III - Using commands** [Development purpose only]

    #### Setup
    - Clone the repository
    - Install dependencies:

        `npm install`

    - Start the application:

        `npm start`

    - Test the application:

        `npm test`

---
## Usage
**Main Interface**
- Primary Window: Shows PI and planning timers with detailed session information
- Secondary Window: Minimized view showing current activity timer
- System Tray: Right-click for quick actions or click to restore window

**Setting Reminders**
- Click on any session name in the detailed view
- Enter your reminder message and timing (days/hours/minutes before the session)
- Click "Alert" to save the reminder

**Viewing Session Details**
- Click on the planning timer to toggle between the timer view and detailed session view
- Navigate through days and sessions to see timing information

**Window Management**
- Click the menu icon in the top-right to access options
- Use "MINIMIZE" to switch to the compact secondary window
- Use "MAXIMIZE" to return to the full view
- Use "CHANGE THEME" to toggle between light and dark modes

---
## How to use application:

**1. Understanding the Timers**
   
   The application uses the provided JSON file to render dynamic timers:

  - The primary window displays two main timers:
    - A PI timer showing the countdown for the entire Program Increment
    - A current event timer displaying the countdown for the active session

**2. Viewing Current Information**

  Both timers update automatically based on the current time and JSON configuration, showing:

  - Days, hours, and minutes remaining
  - Visual circular progress indicators
  - Current event name and timing information

**3. Accessing Detailed Information**

  Click on the current event timer to toggle between:
  - The standard timer view
  - A detailed breakdown showing all sessions/activities for the associated event
  - Navigate through multiple days and sessions using the interface

**4. Window Management**
- Use the menu icon in the top-right corner to access window controls
- Click "MINIMIZE" to switch to the compact secondary window that stays on top of other applications
- The secondary window shows only the current event timer for at-a-glance tracking
- Click "MAXIMIZE" to return to the full primary window view

**5. Setting Reminders**
- Click on any session name in the detailed view to open a dedicated reminder window
- In the reminder window:
  - Enter a custom message for your notification
  - Specify when you want to be reminded (days/hours/minutes before the session)
  - Click "Alert" to save the reminder
- The application calculates the timing automatically based on your preferences

**6. Receiving Notifications**
- When a reminder is due, the application sends a native desktop notification
- The notification includes your custom message and session details
- Reminders persist between application restarts

**7. Background Operation**
When you close the app window, it continues to run in the background. You'll see its icon in the system tray (bottom-right corner of your screen).

**8. Relaunching or Quitting the App**
- To reopen the app, click the system tray icon.
- To fully exit the app, right-click the tray icon and select Quit.
    
    Closing the window doesn't stop the app—it minimizes to the system tray. To exit completely, you must quit it from the tray icon.

---
## Configuration

### PI_PlanningAndInnovation
- **Purpose**: Define the details for the planning and innovation weeks.
- **Attributes**:
  - **`durationWeeks`**: Specify the duration of the planning and innovation weeks.
  - **`startDate`** and **`endDate`**: Define the start and end dates for the planning and innovation period.
  - **`activities`**: Include specific planning days and sessions with detailed attributes.
 
### Activities
- **Purpose**: Configure specific planning days and sessions.
- **Attributes**:
  - **`name`**: Provide the name or title of the activity/session.
  - **`description`**: Add a concise overview of the activity/session.
  - **`startDate`** and **`endDate`**: Specify the timing for each session.
 
### PI_Iterations
- **Purpose**: Set the iteration details.
- **Attributes**:
  - **`startDate`** and **`endDate`**: Define the start and end dates for each iteration.
  - **`durationWeeks`**: Specify the duration of each iteration in weeks.
 
### Key Attributes to Include
- **`description`**: A brief overview of the activity or event.
- **`name`**: The title or identifier for the activity/event.
- **`startDate`** and **`endDate`**: The specific start and end times for the activity/event.
- **`durationWeeks`**: The length of the event or iteration in weeks.

---
## Development

Kindly refer Method II & Method III under the Installation section

#### Project Structure

```
art-timer/
├── .gitignore            # Git ignore file
├── CONTRIBUTING.md       # Contribution guidelines
├── main.js               # Main Electron process
├── package.json          # Project metadata and dependencies
├── README.md             # Project documentation
├── start-app.bat         # Windows batch script to start the app (DEVELOPMENT)
├── __mocks__             # Includes mocks configurations used by jest for testing purpose
├── __tests__             # Includes files for testing using jest
├── src/                  # Source code
│   ├── inputParameters.json         # Configuration file
│   ├── resources/                   # Static assets
│   │   ├── static/
│   │   │   ├── css/                 # CSS files
│   │   │   ├── img/                 # Images
│   ├── scripts/                     # JavaScript files
│   │   ├── commonFunctions.js       # Shared utility functions
│   │   ├── preload.js               # Preload script for Electron
│   │   ├── primaryWindow.js         # Logic for the primary window
│   │   ├── reminderWindow.js        # Logic for the reminder window
│   │   ├── secondaryWindow.js       # Logic for the secondary window
│   ├── views/                       # HTML views
│       ├── primaryWindow.html       # Main application window
│       ├── reminderWindow.html      # Reminder dialog
│       ├── secondaryWindow.html     # Minimized view
```

---
## Technologies

- Electron: Cross-platform desktop application framework
- HTML/CSS/JavaScript: Frontend technologies
- SVG: Used for circular progress indicators
- Node.js: Runtime environment

---
## Contributing

Contributions are welcome! Please see the CONTRIBUTING.md file for guidelines.
