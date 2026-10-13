@echo off
title Push ASPER GO to GitHub
color 0A
cd /d "D:\ASPERGO"
echo ===================================================
echo        ASPER GO - GITHUB UPLOAD HELPER
echo ===================================================
echo.
echo Uploading code to: https://github.com/raselmisit/aspergo.git ...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ===================================================
    echo   SUCCESS! All files are uploaded to GitHub!
    echo ===================================================
) else (
    echo ===================================================
    echo   If GitHub asked for Sign-In, please complete it!
    echo ===================================================
)
echo.
pause
