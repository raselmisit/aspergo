@echo off
chcp 65001 >nul
title Stop ASPER GO Server
color 0C

echo ===================================================
echo     🛑 ASPER GO SERVER STOPPER
echo ===================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess; if ($p) { Stop-Process -Id $p -Force; Write-Host '✅ ASPER GO Server সফলভাবে বন্ধ করা হয়েছে (Stopped successfully)!' -ForegroundColor Green } else { Write-Host 'ℹ️ সার্ভারটি বর্তমানে চালু নেই (No server is currently running on port 5000).' -ForegroundColor Yellow }"

echo.
timeout /t 3 >nul
exit
