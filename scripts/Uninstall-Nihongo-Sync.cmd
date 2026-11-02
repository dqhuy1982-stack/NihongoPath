@echo off
setlocal
schtasks.exe /Delete /TN "NihongoPath-Develop-AutoSync" /F
if errorlevel 1 (
 echo Task was not removed (it may not exist).
 exit /b 1
)
echo Auto Sync scheduling removed. Source and GitHub unchanged.
exit /b 0
