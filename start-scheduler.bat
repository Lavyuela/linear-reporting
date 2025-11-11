@echo off
REM Linear Report Scheduler Startup Script
REM This script starts the email scheduler in the background

cd /d "%~dp0"

echo Starting Linear Report Scheduler...
echo Reports will be sent daily at 5:00 PM to ivy@purpleelephant.ventures
echo.

node scheduler.js

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo An error occurred. Press any key to exit...
    pause >nul
)
