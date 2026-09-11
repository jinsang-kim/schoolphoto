@echo off
chcp 65001 > nul
title 📸 학교 축제 인생네컷 포토부스 시스템
cd /d "%~dp0"

echo ======================================================
echo   📸 2026 청춘 학교 축제 인생네컷 포토부스 시작
echo ======================================================
echo.

:: Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js 가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 먼저 설치해 주세요.
    echo.
    pause
    exit /b
)

:: 의존성 모듈 확인
if not exist "node_modules" (
    echo [알림] 필수 패키지를 처음 설치하는 중입니다...
    call npm install
    echo.
)

:: 2초 후 브라우저 자동 실행 (백그라운드)
start "" powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"

:: 서버 실행
echo [서버 시작 중...]
echo - 컴퓨터 접속: http://localhost:3000
echo - 태블릿 접속: 동일 Wi-Fi에서 서버 콘솔에 표시되는 IP로 접속
echo.
node server.js

pause
