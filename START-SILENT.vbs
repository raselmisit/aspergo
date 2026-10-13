' ASPER GO Silent Background Launcher (No Black Terminal Window)
Set WshShell = CreateObject("WScript.Shell")

' Set working directory to project root
WshShell.CurrentDirectory = "D:\ASPERGO"

' Run Node.js production server hidden in the background (0 = hidden)
WshShell.Run "node server/server.js", 0, False

' Wait 2 seconds for server to start up
WScript.Sleep 2000

' Open default browser at http://localhost:5000
WshShell.Run "http://localhost:5000"
