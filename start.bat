@echo off
title StockPro - Business Management System
color 0B

echo.
echo  ╔════════════════════════════════════════════════════════╗
echo  ║                                                        ║
echo  ║   StockPro - Restaurant ^& Supermarket Management      ║
echo  ║                                                        ║
echo  ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Node.js is not installed!
    echo  Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist" (
    echo  Building application...
    echo.
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  ERROR: Build failed!
        pause
        exit /b 1
    )
    echo.
    echo  Build complete!
    echo.
)

echo  Starting StockPro server...
echo.
echo  The app will open in your browser automatically.
echo  If it doesn't, open: http://localhost:3000
echo.
echo  Press Ctrl+C to stop the server.
echo.

REM Start the server
node server.js

pause
