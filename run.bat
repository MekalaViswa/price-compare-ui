@echo off
cd /d "%~dp0"
if not exist node_modules (
    echo Installing packages (first run only)...
    call npm install
)
echo.
echo Open http://localhost:5173 in your browser
call npm run dev
pause
