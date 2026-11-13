@echo off
chcp 65001 > nul
title KHOI DONG HE THONG GOM DON VKU
echo ========================================================
echo   HE THONG DAT HANG NHOM & CHIA TIEN VIETQR REALTIME
echo   Do an Co so 4 - Khoa KHMT - VKU
echo   Sinh vien: Pham Thai Bao - 24IT023
echo ========================================================
echo.

echo [1/3] Dang khoi dong Backend Server tren port 4000...
pushd "%~dp0server"
start "GomDon-Server" cmd /k "npm run dev"
popd

timeout /t 2 /nobreak > nul

echo [2/3] Dang khoi dong Frontend Client tren port 3000...
pushd "%~dp0client"
start "GomDon-Client" cmd /k "npm run dev"
popd

timeout /t 3 /nobreak > nul

echo [3/3] Dang xac dinh Dia chi IP Mang Thuc Te (LAN/Wi-Fi)...
for /f "tokens=*" %%i in ('node -e "const os = require('os'); const nets = os.networkInterfaces(); for (const name of Object.keys(nets)) { for (const net of nets[name]) { if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254.') && !net.address.startsWith('192.168.56.') && !net.address.startsWith('192.168.50.') && !net.address.startsWith('192.168.100.')) { if (/wi-fi|wireless|wlan/i.test(name)) { console.log(net.address); process.exit(0); } } } } for (const name of Object.keys(nets)) { for (const net of nets[name]) { if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254.') && !net.address.startsWith('192.168.56.')) { console.log(net.address); process.exit(0); } } }"') do set LAN_IP=%%i

if "%LAN_IP%"=="" set LAN_IP=127.0.0.1

echo.
echo ========================================================
echo   🌐 DIA CHI MANG THUC TE: http://%LAN_IP%:3000
echo   📱 Dien thoai quet QR / vao web qua: http://%LAN_IP%:3000
echo ========================================================
echo.
echo Dang mo trinh duyet qua Dia chi IP Mang...
start http://%LAN_IP%:3000

echo.
echo HE THONG DA SAN SANG!
echo Giu nguyen 2 cua so den dang chay de he thong hoat dong nhe!
pause
