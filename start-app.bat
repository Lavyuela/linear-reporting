@echo off
echo Starting Linear Reporting Dashboard...
echo.
echo Starting backend server...
start "Backend Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting frontend client...
start "Frontend Client" cmd /k "cd client && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
