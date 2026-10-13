@echo off
chcp 65001 >nul
title Enable ASPER GO Autostart on Windows Boot
color 0E

echo ===================================================
echo     ⚙️ ENABLE AUTOSTART ON WINDOWS BOOT
echo     (কম্পিউটার অন করলেই স্বয়ংক্রিয়ভাবে ASPER GO চালু হবে)
echo ===================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $StartupPath = [Environment]::GetFolderPath('Startup'); $Shortcut = $WshShell.CreateShortcut(\"$StartupPath\ASPER-GO-Autostart.lnk\"); $Shortcut.TargetPath = 'D:\ASPERGO\START-SILENT.vbs'; $Shortcut.WorkingDirectory = 'D:\ASPERGO'; $Shortcut.Description = 'ASPER GO Background Autostart Service'; $Shortcut.Save()"

color 0A
echo.
echo ✅ স্থায়ী সমাধান সম্পন্ন! (Autostart Configured Successfully)
echo এখন থেকে আপনার কম্পিউটার চালু করার সাথে সাথেই ASPER GO ব্যাকগ্রাউন্ডে রেডি থাকবে।
echo কোনো টার্মিনাল বা কমান্ড রান করতে হবে না।
echo.
timeout /t 5 >nul
