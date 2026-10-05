@echo off
title DoorKnock Alert Simulator
cd /d "%~dp0"

node simulator.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not run Node.js.
    echo Make sure Node.js is installed and added to PATH.
    echo.
    pause
)