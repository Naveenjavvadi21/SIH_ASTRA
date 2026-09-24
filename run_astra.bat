@echo off
title ASTRA - Smart City Urban Intelligence Platform
echo ===================================================
echo     ASTRA Platform Launcher (SIH26124)
echo ===================================================
echo.
echo Starting Backend and Frontend services...
echo.

start "ASTRA Backend Server (FastAPI + YOLOv11)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

start "ASTRA Frontend Dashboard (Vite + React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Services launched!
echo Backend:  http://127.0.0.1:8000/
echo Frontend: http://localhost:5173/
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173/
