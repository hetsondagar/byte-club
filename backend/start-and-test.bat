@echo off
echo Starting Byte Club Backend Server...
start /B npm run dev
timeout /t 10 /nobreak > nul
echo Testing Byte Rush API...
npm run test:byte-rush
pause
