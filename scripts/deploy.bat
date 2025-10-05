@echo off
REM ZeroPrint Deployment Script for Windows
REM This script handles deployment with proper environment variable management

setlocal enabledelayedexpansion

REM Check if environment is provided
if "%1"=="" (
    echo [ERROR] Environment is required
    echo Usage: deploy.bat ^<environment^> [--skip-tests]
    echo Environments: development, staging, production
    exit /b 1
)

set ENVIRONMENT=%1
set SKIP_TESTS=false

REM Parse arguments
if "%2"=="--skip-tests" set SKIP_TESTS=true

echo [INFO] Starting deployment to %ENVIRONMENT% environment...

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

echo [SUCCESS] All dependencies are installed

REM Validate environment
set ENV_FILE=.env.%ENVIRONMENT%
if not exist "%ENV_FILE%" (
    echo [ERROR] Environment file %ENV_FILE% not found
    echo [WARNING] Please copy env.example to %ENV_FILE% and fill in the required values
    exit /b 1
)

echo [SUCCESS] Environment variables validated

REM Setup environment
echo [INFO] Setting up environment for %ENVIRONMENT%...
copy "%ENV_FILE%" "backend\functions\.env" >nul
echo [SUCCESS] Environment file copied to backend\functions\.env

REM Build backend
echo [INFO] Building backend functions...
cd backend\functions
call npm ci --only=production
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend build failed
    exit /b 1
)
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend build failed
    exit /b 1
)
cd ..\..

REM Build frontend
echo [INFO] Building frontend...
cd frontend
call npm ci --only=production
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
cd ..

echo [SUCCESS] Project built successfully

REM Run tests (unless skipped)
if "%SKIP_TESTS%"=="false" (
    echo [INFO] Running tests...
    
    REM Backend tests
    echo [INFO] Running backend tests...
    cd backend\functions
    call npm test
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Backend tests failed
        exit /b 1
    )
    cd ..\..
    
    REM Frontend tests
    echo [INFO] Running frontend tests...
    cd frontend
    call npm run test:ci
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Frontend tests failed
        exit /b 1
    )
    cd ..
    
    echo [SUCCESS] All tests passed
) else (
    echo [WARNING] Skipping tests
)

REM Set Firebase project
echo [INFO] Setting Firebase project...
if "%ENVIRONMENT%"=="development" (
    firebase use demo-zeroprint-dev
) else if "%ENVIRONMENT%"=="staging" (
    firebase use demo-zeroprint-staging
) else if "%ENVIRONMENT%"=="production" (
    firebase use demo-zeroprint-prod
) else (
    echo [ERROR] Invalid environment: %ENVIRONMENT%
    exit /b 1
)

REM Deploy to Firebase
echo [INFO] Deploying to Firebase (%ENVIRONMENT%)...

echo [INFO] Deploying Cloud Functions...
firebase deploy --only functions
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Functions deployment failed
    exit /b 1
)

echo [INFO] Deploying hosting...
firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Hosting deployment failed
    exit /b 1
)

echo [INFO] Deploying Firestore rules...
firebase deploy --only firestore:rules
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Firestore rules deployment failed
    exit /b 1
)

echo [INFO] Deploying storage rules...
firebase deploy --only storage
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Storage rules deployment failed
    exit /b 1
)

echo [SUCCESS] Deployment completed successfully

REM Verify deployment
echo [INFO] Verifying deployment...

REM Get the deployed URL based on environment
set BASE_URL=
if "%ENVIRONMENT%"=="development" (
    set BASE_URL=https://demo-zeroprint-dev.web.app
) else if "%ENVIRONMENT%"=="staging" (
    set BASE_URL=https://demo-zeroprint-staging.web.app
) else if "%ENVIRONMENT%"=="production" (
    set BASE_URL=https://demo-zeroprint-prod.web.app
)

REM Test health endpoint
set HEALTH_URL=%BASE_URL%/api/health
echo [INFO] Testing health endpoint: %HEALTH_URL%

curl -f -s "%HEALTH_URL%" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Health check failed
    exit /b 1
)

echo [SUCCESS] Health check passed

REM Cleanup
echo [INFO] Cleaning up...
if exist "backend\functions\.env" (
    del "backend\functions\.env"
    echo [INFO] Removed backend environment file
)

echo [SUCCESS] Deployment to %ENVIRONMENT% completed successfully!

endlocal
