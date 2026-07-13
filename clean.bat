@echo off
echo ==============================================
echo BPL Project: Clean and Auto-Start Script
echo ==============================================
echo.

echo [1/3] Cleaning Vinxi/Vite build caches and outputs...
if exist .vinxi (
    echo Deleting .vinxi...
    rmdir /s /q .vinxi
)
if exist .output (
    echo Deleting .output...
    rmdir /s /q .output
)
if exist .tanstack (
    echo Deleting .tanstack...
    rmdir /s /q .tanstack
)
if exist dist (
    echo Deleting dist...
    rmdir /s /q dist
)
echo Clean completed successfully.
echo.

echo [2/3] Checking and installing dependencies...
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo Bun detected. Installing dependencies with Bun...
    call bun install
) else (
    echo Bun not detected. Installing dependencies with npm...
    call npm install
)
echo Dependencies check completed.
echo.

echo [3/3] Starting local development server...
where bun >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting server with Bun...
    bun run dev
) else (
    echo Starting server with npm...
    npm run dev
)

pause
