@echo off
title HE THONG GOM DON VKU
cls
echo ========================================================
echo   HE THONG DAT HANG NHOM VA CHIA TIEN VIETQR
echo   Do An Co So 4 - Khoa KHMT - VKU
echo   Sinh vien: Pham Thai Bao - 24IT023
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Khoi dong Backend Server port 4000...
start "GomDon-Server" cmd /k "cd /d "%~dp0server" && npm.cmd run dev"

timeout /t 3 > nul

echo [2/2] Khoi dong Frontend Client port 3000...
start "GomDon-Client" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

timeout /t 4 > nul

echo.
echo He thong da khoi dong thanh cong!
echo Dang mo trinh duyet...

node -e "const os=require('os');let ip='localhost';const nets=os.networkInterfaces();for(const n in nets){for(const net of nets[n]){if(net.family==='IPv4'&&!net.internal&&!net.address.startsWith('169.254.')&&!net.address.startsWith('192.168.56.')&&!net.address.startsWith('192.168.50.')&&!net.address.startsWith('192.168.100.')){if(/wi-fi|wireless|wlan/i.test(n)){console.log(net.address);process.exit(0);}}}}for(const n in nets){for(const net of nets[n]){if(net.family==='IPv4'&&!net.internal&&!net.address.startsWith('169.254.')&&!net.address.startsWith('192.168.56.')){console.log(net.address);process.exit(0);}}}console.log(ip);" > "%TEMP%\vku_lan_ip.txt"

set /p LAN_IP=<"%TEMP%\vku_lan_ip.txt"
if "%LAN_IP%"=="" set LAN_IP=localhost

echo.
echo ========================================================
echo   DIA CHI TRUY CAP: http://%LAN_IP%:3000
echo ========================================================
echo.
start http://%LAN_IP%:3000

echo GIU NGUYEN CAC CUA SO DANG CHAY.
pause
