@echo off
REM ZeroPrint Integration Test Script for Windows
REM Tests all integrations with proper configuration

setlocal enabledelayedexpansion

echo [INFO] Starting integration tests...

REM Check dependencies
echo [INFO] Checking dependencies...

where firebase >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firebase CLI is not installed. Please install it with: npm install -g firebase-tools
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

where curl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] curl is not installed. Please install curl
    exit /b 1
)

echo [SUCCESS] All dependencies are installed

REM Validate environment
set ENV_FILE=.env.development
if "%1" neq "" set ENV_FILE=%1

if not exist "%ENV_FILE%" (
    echo [ERROR] Environment file %ENV_FILE% not found
    echo [WARNING] Please copy env.example to %ENV_FILE% and fill in the required values
    exit /b 1
)

echo [SUCCESS] Environment variables validated

REM Test backend build
echo [INFO] Testing backend build...
cd backend\functions
call npm ci --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend dependencies installation failed
    exit /b 1
)
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend build failed
    exit /b 1
)
cd ..\..
echo [SUCCESS] Backend build successful

REM Test frontend build
echo [INFO] Testing frontend build...
cd frontend
call npm ci --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend dependencies installation failed
    exit /b 1
)
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend build successful

REM Start Firebase emulators
echo [INFO] Starting Firebase emulators...

REM Kill any existing emulator processes
taskkill /f /im firebase.exe >nul 2>nul

REM Start emulators in background
start /b firebase emulators:start --import=emulator-data --export-on-exit > emulator.log 2>&1

REM Wait for emulators to start
echo [INFO] Waiting for emulators to start...
timeout /t 10 /nobreak >nul

REM Test Firebase connectivity
echo [INFO] Testing Firebase connectivity...

REM Test Firestore
curl -s "http://localhost:8080" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firestore emulator is not accessible
    exit /b 1
)
echo [SUCCESS] Firestore emulator is accessible

REM Test Auth
curl -s "http://localhost:9099" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Auth emulator is not accessible
    exit /b 1
)
echo [SUCCESS] Auth emulator is accessible

REM Test Functions
curl -s "http://127.0.0.1:5000" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Functions emulator is not accessible
    exit /b 1
)
echo [SUCCESS] Functions emulator is accessible

REM Test API endpoints
echo [INFO] Testing API endpoints...

set BASE_URL=http://127.0.0.1:5000/demo-zeroprint/asia-south1/api

REM Test health endpoint
curl -s "%BASE_URL%/health" | findstr "ok" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Health endpoint is not working
    exit /b 1
)
echo [SUCCESS] Health endpoint is working

REM Test API documentation endpoint
curl -s "%BASE_URL%/docs" | findstr "ZeroPrint API" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] API documentation endpoint is not working
    exit /b 1
)
echo [SUCCESS] API documentation endpoint is working

REM Test authentication
echo [INFO] Testing authentication...

REM Test auth endpoint (should return 401 without token)
for /f %%i in ('curl -s -o nul -w "%%{http_code}" "%BASE_URL%/auth/me"') do set AUTH_RESPONSE=%%i
if "%AUTH_RESPONSE%" neq "401" (
    echo [ERROR] Authentication endpoint is not properly secured
    exit /b 1
)
echo [SUCCESS] Authentication is properly secured

REM Test security headers
echo [INFO] Testing security headers...

curl -s -I "%BASE_URL%/health" | findstr "X-Content-Type-Options: nosniff" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] X-Content-Type-Options header is missing
    exit /b 1
)
echo [SUCCESS] X-Content-Type-Options header is present

curl -s -I "%BASE_URL%/health" | findstr "X-Frame-Options: DENY" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] X-Frame-Options header is missing
    exit /b 1
)
echo [SUCCESS] X-Frame-Options header is present

curl -s -I "%BASE_URL%/health" | findstr "X-XSS-Protection: 1; mode=block" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] X-XSS-Protection header is missing
    exit /b 1
)
echo [SUCCESS] X-XSS-Protection header is present

REM Run unit tests
echo [INFO] Running unit tests...

REM Backend tests
echo [INFO] Running backend unit tests...
cd backend\functions
call npm test -- --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend unit tests failed
    exit /b 1
)
cd ..\..
echo [SUCCESS] Backend unit tests passed

REM Frontend tests
echo [INFO] Running frontend unit tests...
cd frontend
call npm test -- --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend unit tests failed
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend unit tests passed

REM Cleanup
echo [INFO] Cleaning up...

REM Kill emulators
taskkill /f /im firebase.exe >nul 2>nul

REM Remove log files
if exist emulator.log del emulator.log

echo [SUCCESS] Cleanup completed

echo [SUCCESS] All integration tests completed successfully!

endlocal
