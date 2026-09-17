@echo off
setlocal
cd /d "%~dp0"

title Port Scanner

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

start "Port Scanner Browser" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8787"
call npm start

pause
