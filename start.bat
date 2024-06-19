@echo off
title Bot Launcher

:main
cls
echo ============= Bot Launcher ==================================
echo 1 - Run normally
echo 2 - Run in online updating mode
echo =============================================================
set/p "cho=>"
if %cho%== 1 goto dev
if %cho%== 2 goto devwatch
echo ERROR unknown chose...
PAUSE
goto main

:dev
npm run dev
goto end

:devwatch
npm run devwatch
goto end

:end
PAUSE
