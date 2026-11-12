@echo off
chcp 65001 > nul
title KHOI DONG HE THONG GOM DON VKU
echo ========================================================
echo   HE THONG DAT HANG NHOM & CHIA TIEN VIETQR REALTIME
echo   Do an Co so 4 - Khoa KHMT - VKU
echo   Sinh vien: Pham Thai Bao - 24IT023
echo ========================================================
echo.

echo [1/2] Dang khoi dong Backend Server tren port 4000...
pushd "%~dp0server"
start "GomDon-Server" cmd /k "npm run dev"
popd

timeout /t 2 /nobreak > nul

echo [2/2] Dang khoi dong Frontend Client tren port 3000...
pushd "%~dp0client"
start "GomDon-Client" cmd /k "npm run dev"
popd

timeout /t 3 /nobreak > nul

echo.
echo Dang mo trinh duyet tai http://localhost:3000 ...
start http://localhost:3000

echo.
echo HE THONG DA SAN SANG!
echo Giu nguyen 2 cua so den dang chay de he thong hoat dong nhe!
pause
