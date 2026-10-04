@echo off
title Midnight Mass — Command Center Launcher
color 00

echo.
echo  ============================================================
echo        THE  MIDNIGHT  MASS  —  COMMAND  CENTER
echo  ============================================================
echo.
echo  Launching your full Midnight Mass Growth Toolkit...
echo.

REM ── Kill any old server on port 8085 ──────────────────────────
echo  [1/5] Clearing port 8085...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8085 "') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM ── Start local web server from this folder ────────────────────
echo  [2/5] Starting local Sacred Codex server on port 8085...
start /B "" python -m http.server 8085 >nul 2>&1

REM ── Wait for server to boot ────────────────────────────────────
timeout /t 2 /nobreak >nul

REM ── Open all hub tools in browser ─────────────────────────────
echo  [3/5] Opening Midnight Mass Growth Hub tools...

start "" "http://localhost:8085/index.html"
timeout /t 1 /nobreak >nul

start "" "%~dp0email_composer.html"
timeout /t 1 /nobreak >nul

start "" "%~dp0placement_checklist.html"
timeout /t 1 /nobreak >nul

start "" "%~dp0server_growth_tracker.html"
timeout /t 1 /nobreak >nul

REM ── Launch bump reminder in background ───────────────────────
echo  [4/5] Starting server bump reminder (every 2 hours)...
start /min "" powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0bump_reminder.ps1"

REM ── Print status ──────────────────────────────────────────────
echo  [5/5] All systems launched.
echo.
echo  ============================================================
echo.
echo   QR Generator    ->  http://localhost:8085
echo   Email Composer  ->  email_composer.html
echo   Checklist       ->  placement_checklist.html
echo   Growth Tracker  ->  server_growth_tracker.html
echo   Bump Reminder   ->  Running silently (every 2 hours)
echo.
echo   Invite Link     ->  discord.gg/midnightmass
echo.
echo  ============================================================
echo.
echo  Press any key to generate a fresh QR code batch...
echo  (or close this window — everything is already running)
echo.
pause >nul

REM ── Optional: Generate full QR batch ─────────────────────────
echo.
echo  Generating Sacred QR batch for all placements...
python "%~dp0generate_qr.py" --source all --output "%~dp0QR_Exports"

echo.
echo  ✦ Done. Check QR_Exports folder for your QR codes.
echo.
pause
