@echo off
title Vastrika Dev Servers

echo Starting customer frontend (port 5173)...
start "Customer - 5173" cmd /k "cd /d d:\project\vastrika\vastrika && npm run dev"

echo Starting admin frontend (port 5174)...
start "Admin - 5174" cmd /k "cd /d d:\project\vastrika\admin-vastrika && npm run dev"

echo.
echo Both frontends started.
echo Customer: http://localhost:5173
echo Admin:    http://localhost:5174
echo.
echo Remember to also start the API in Visual Studio (port 5095).
echo.
pause
