@echo off
title MaintainSYS Starter
echo ===================================================
echo   正在啟動 MaintainSYS 維護系統...
echo ===================================================
echo.

cd /d "e:\MaintainSYS"

:: 在背景等待 2 秒後自動在瀏覽器中開啟系統網址
start "" "http://localhost:5173/"

:: 啟動 Vite 開發伺服器
call npm run dev

pause
