@echo off
title Company Management System

echo ========================================
echo     Company Management System
echo ========================================

cd /d "%~dp0"

echo.
echo [1/2] Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul

echo.
echo Opening website...

start "" "http://localhost:5173"

echo.
echo ========================================
echo        System Started!
echo ========================================
pause