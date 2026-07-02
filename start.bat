@echo off
title MaintainSYS Starter
echo Starting MaintainSYS...
cd /d "e:\MaintainSYS"
start "" "http://localhost:5173/"
call npm run dev
