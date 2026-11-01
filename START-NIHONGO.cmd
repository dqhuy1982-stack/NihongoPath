@echo off
setlocal
cd /d "%~dp0"
if not exist "source\public\index.html" (
    echo Nihongo Path source not found: source\public\index.html
    pause
    exit /b 1
)
where py >nul 2>nul
if errorlevel 1 (
    echo Python launcher "py" was not found. Install Python or use another local HTTP server.
    pause
    exit /b 1
)
echo.
echo NIHONGO PATH - LOCAL DEVELOPMENT PREVIEW
echo Branch: use develop in GitHub Desktop
echo Browser: http://127.0.0.1:8081/?mode=demo#learn
echo Keep this window open. Press Ctrl+C to stop.
echo.
py -m http.server 8081 --bind 127.0.0.1 --directory "%~dp0source\public"
if errorlevel 1 (
    echo.
    echo Could not start server. If port 8081 is in use, stop the old server first.
)
pause
