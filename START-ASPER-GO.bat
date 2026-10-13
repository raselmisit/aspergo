@echo off
chcp 65001 >nul
title ASPER GO - E-Commerce Engine Launcher
color 0A

echo ===================================================
echo     🚀 ASPER GO - LIVE E-COMMERCE LAUNCHER
echo     Anything, Anytime, Anywhere (Bangladesh)
echo ===================================================
echo.

cd /d "D:\ASPERGO"

REM Check if port 5000 is occupied, if so close old instance cleanly
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force; Write-Host '[INFO] পুরানো প্রসেস বন্ধ করে নতুন করে চালু করা হচ্ছে...' -ForegroundColor Yellow }"

echo [INFO] ASPER GO সার্ভার চালু হচ্ছে...
echo [INFO] ব্রাউজারে http://localhost:5000 ওপেন করা হচ্ছে...
echo.

REM Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

REM Run server
node server/server.js

pause
