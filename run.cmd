@echo off
setlocal
echo ==========================================
echo Starting Job Portal (backend + frontend)...
echo ==========================================

REM Resolve script directory (folder containing this script)
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

REM Start Backend in a new window
echo Starting Spring Boot Backend...
start "JobPortal - Backend" cmd /k "cd /d "%ROOT_DIR%\backend" && .\mvnw.cmd spring-boot:run"

REM Start Frontend in a new window
echo Starting React Frontend (Vite)...
start "JobPortal - Frontend" cmd /k "cd /d "%ROOT_DIR%\frontend" && npm install && npm run dev"

echo Both services are starting in separate windows.
echo Frontend dev server configured to run on http://localhost:3000
echo Backend API: http://localhost:8080

REM Automatically open frontend in default browser after a short delay
timeout /t 5 >nul
start "" "http://localhost:3000"

endlocal
exit /b 0
