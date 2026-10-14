@echo off
title ASPER GO Live Internet Launcher
color 0B
cd /d "D:\ASPERGO"

echo ===================================================
echo           ASPER GO - 1-CLICK LIVE ONLINE
echo ===================================================
echo.
echo [1/2] Starting ASPER GO Server...
start "" wscript.exe D:\ASPERGO\START-SILENT.vbs
timeout /t 3 /nobreak >nul

echo [2/2] Generating Secure Cloudflare Live Link...
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5000
