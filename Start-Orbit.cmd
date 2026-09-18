@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])!==24){console.error('Please use Node.js 24 LTS.');process.exit(1)}"
if errorlevel 1 (
  pause
  exit /b 1
)
echo.
echo Orbit - Student Life OS. Built by Rajkamal.
echo Open http://localhost:3000 in your browser.
echo Keep this window open. Press Ctrl+C to stop.
echo.
node --env-file-if-exists=.env server/local.js
pause
