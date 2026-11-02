@echo off
setlocal
set "TASK=NihongoPath-Develop-AutoSync"
set "RUNNER=%~dp0Run-Nihongo-Sync.cmd"
echo.
echo NIHONGO PATH - SAFE TWO-PC SYNC INSTALL
echo Source: %~dp0..
echo Schedule: every 2 minutes, current Windows user.
echo Never deploys Public Demo or changes source main.
echo.
py -3 "%~dp0nihongo-autosync.py" --status
if errorlevel 1 (
  echo ERROR: Fix repository state before enabling automatic sync.
  exit /b 2
)
echo.
schtasks.exe /Create /F /SC MINUTE /MO 2 /TN "%TASK%" /TR "%RUNNER%"
if errorlevel 1 (
  echo ERROR: Could not register task. No source changes were made.
  exit /b 2
)
echo.
echo INSTALLED: %TASK%
echo Run task manually: schtasks /Run /TN "%TASK%"
echo Read log: Get-Content "C:\Dev\NihongoPath\.git\nihongo-autosync.log" -Tail 25
echo Stop: scripts\Uninstall-Nihongo-Sync.cmd
exit /b 0
