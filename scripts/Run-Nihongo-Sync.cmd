@echo off
setlocal
cd /d "%~dp0.."
py -3 "%~dp0nihongo-autosync.py" --once
exit /b %errorlevel%
