@echo off
REM ART Timer - Start Script
REM This script installs dependencies and starts the Electron application.

REM Navigate to the script's directory
cd /d "%~dp0"

REM Install dependencies
echo Installing dependencies...
call npm install

REM Start the application
echo Starting the application...
call npm start

REM Indicate completion
echo Application has stopped.
pause