@echo off
chcp 65001 >nul
title Create ASPER GO Desktop Shortcut
color 0B

echo ===================================================
echo     🖥️ CREATING ASPER GO DESKTOP SHORTCUT
echo ===================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut(\"$([Environment]::GetFolderPath('Desktop'))\ASPER GO.lnk\"); $Shortcut.TargetPath = 'D:\ASPERGO\START-SILENT.vbs'; $Shortcut.WorkingDirectory = 'D:\ASPERGO'; $Shortcut.Description = 'ASPER GO E-Commerce Platform'; $Shortcut.Save()"

color 0A
echo.
echo ✅ অভিনন্দন! আপনার ডেক্সটপে "ASPER GO" নামে শর্টকাট আইকন তৈরি হয়েছে!
echo এখন থেকে ডেক্সটপের "ASPER GO" আইকনে ডাবল ক্লিক করলেই ওয়েবসাইট চালু হয়ে ব্রাউজারে ওপেন হবে।
echo.
timeout /t 5 >nul
