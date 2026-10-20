@echo off
title KHOI DONG HE THONG GOM DON VKU
echo ========================================================
echo   HE THONG DAT HANG NHOM & CHIA TIEN VIETQR REALTIME
echo   Do an Co so 4 - Khoa KHMT - VKU
echo   Sinh vien: Pham Thai Bao - 24IT023
echo ========================================================
echo.

echo [1/2] Dang khoi dong Backend Server (Node.js + Socket.io) tren port 4000...
start "GomDon-Server" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak > nul

echo [2/2] Dang khoi dong Frontend Client (React Vite) tren port 3000...
start "GomDon-Client" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Dang mo trinh duyet tai http://localhost:3000 ...
start http://localhost:3000

echo.
echo HE THONG DA SAN SANG!
echo Ban co the mo 2 tab hoac ket noi dien thoai de test Real-time!
pause
