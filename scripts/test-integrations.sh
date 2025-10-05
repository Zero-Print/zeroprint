#!/bin/bash

# ZeroPrint Integration Test Script
# Tests all integrations with proper configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to validate environment variables
validate_environment() {
    local env_file=$1
    print_status "Validating environment variables from $env_file..."
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found"
        print_warning "Please copy env.example to $env_file and fill in the required values"
        exit 1
    fi
    
    # Check for required environment variables
    local required_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "FIREBASE_SERVICE_ACCOUNT_KEY"
        "RAZORPAY_KEY_ID"
        "RAZORPAY_KEY_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=your_" "$env_file"; then
            print_error "Required environment variable $var is not set or contains placeholder value"
            exit 1
        fi
    done
    
    print_success "Environment variables validated"
}

# Function to start Firebase emulators
start_emulators() {
    print_status "Starting Firebase emulators..."
    
    # Kill any existing emulator processes
    pkill -f firebase || true
    
    # Start emulators in background
    firebase emulators:start --import=emulator-data --export-on-exit > emulator.log 2>&1 &
    local emulator_pid=$!
    
    # Wait for emulators to start
    print_status "Waiting for emulators to start..."
    sleep 10
    
    # Check if emulators are running
    if ! ps -p $emulator_pid > /dev/null; then
        print_error "Failed to start Firebase emulators"
        cat emulator.log
        exit 1
    fi
    
    print_success "Firebase emulators started successfully"
    echo $emulator_pid > emulator.pid
}

# Function to test Firebase connectivity
test_firebase() {
    print_status "Testing Firebase connectivity..."
    
    # Test Firestore
    curl -s "http://localhost:8080" > /dev/null
    if [ $? -eq 0 ]; then
        print_success "Firestore emulator is accessible"
    else
        print_error "Firestore emulator is not accessible"
        return 1
    fi
    
    # Test Auth
    curl -s "http://localhost:9099" > /dev/null
    if [ $? -eq 0 ]; then
        print_success "Auth emulator is accessible"
    else
        print_error "Auth emulator is not accessible"
        return 1
    fi
    
    # Test Functions
    curl -s "http://127.0.0.1:5000" > /dev/null
    if [ $? -eq 0 ]; then
        print_success "Functions emulator is accessible"
    else
        print_error "Functions emulator is not accessible"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    local base_url="http://127.0.0.1:5000/demo-zeroprint/asia-south1/api"
    
    # Test health endpoint
    local health_response=$(curl -s "$base_url/health")
    if echo "$health_response" | grep -q "ok"; then
        print_success "Health endpoint is working"
    else
        print_error "Health endpoint is not working"
        echo "Response: $health_response"
        return 1
    fi
    
    # Test API documentation endpoint
    local docs_response=$(curl -s "$base_url/docs")
    if echo "$docs_response" | grep -q "ZeroPrint API"; then
        print_success "API documentation endpoint is working"
    else
        print_error "API documentation endpoint is not working"
        echo "Response: $docs_response"
        return 1
    fi
}

# Function to test authentication
test_authentication() {
    print_status "Testing authentication..."
    
    local base_url="http://127.0.0.1:5000/demo-zeroprint/asia-south1/api"
    
    # Test auth endpoint (should return 401 without token)
    local auth_response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/auth/me")
    if [ "$auth_response" = "401" ]; then
        print_success "Authentication is properly secured"
    else
        print_error "Authentication endpoint is not properly secured"
        return 1
    fi
}

# Function to test rate limiting
test_rate_limiting() {
    print_status "Testing rate limiting..."
    
    local base_url="http://127.0.0.1:5000/demo-zeroprint/asia-south1/api"
    
    # Test rate limiting by making multiple requests
    local rate_limit_hit=false
    for i in {1..6}; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/auth/login" -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}')
        if [ "$response" = "429" ]; then
            rate_limit_hit=true
            break
        fi
        sleep 1
    done
    
    if [ "$rate_limit_hit" = true ]; then
        print_success "Rate limiting is working"
    else
        print_warning "Rate limiting may not be working (this could be expected in development)"
    fi
}

# Function to test CORS
test_cors() {
    print_status "Testing CORS configuration..."
    
    local base_url="http://127.0.0.1:5000/demo-zeroprint/asia-south1/api"
    
    # Test CORS preflight request
    local cors_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$base_url/health" -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET")
    if [ "$cors_response" = "200" ]; then
        print_success "CORS preflight requests are working"
    else
        print_error "CORS preflight requests are not working"
        return 1
    fi
}

# Function to test security headers
test_security_headers() {
    print_status "Testing security headers..."
    
    local base_url="http://127.0.0.1:5000/demo-zeroprint/asia-south1/api"
    
    # Test security headers
    local headers=$(curl -s -I "$base_url/health")
    
    if echo "$headers" | grep -q "X-Content-Type-Options: nosniff"; then
        print_success "X-Content-Type-Options header is present"
    else
        print_error "X-Content-Type-Options header is missing"
        return 1
    fi
    
    if echo "$headers" | grep -q "X-Frame-Options: DENY"; then
        print_success "X-Frame-Options header is present"
    else
        print_error "X-Frame-Options header is missing"
        return 1
    fi
    
    if echo "$headers" | grep -q "X-XSS-Protection: 1; mode=block"; then
        print_success "X-XSS-Protection header is present"
    else
        print_error "X-XSS-Protection header is missing"
        return 1
    fi
}

# Function to test frontend build
test_frontend_build() {
    print_status "Testing frontend build..."
    
    cd frontend
    
    # Install dependencies
    npm ci --silent
    
    # Build frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        cd ..
        return 1
    fi
    
    cd ..
}

# Function to test backend build
test_backend_build() {
    print_status "Testing backend build..."
    
    cd backend/functions
    
    # Install dependencies
    npm ci --silent
    
    # Build backend
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Backend build successful"
    else
        print_error "Backend build failed"
        cd ../..
        return 1
    fi
    
    cd ../..
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    # Backend tests
    print_status "Running backend unit tests..."
    cd backend/functions
    npm test -- --silent
    if [ $? -eq 0 ]; then
        print_success "Backend unit tests passed"
    else
        print_error "Backend unit tests failed"
        cd ../..
        return 1
    fi
    cd ../..
    
    # Frontend tests
    print_status "Running frontend unit tests..."
    cd frontend
    npm test -- --silent
    if [ $? -eq 0 ]; then
        print_success "Frontend unit tests passed"
    else
        print_error "Frontend unit tests failed"
        cd ..
        return 1
    fi
    cd ..
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Kill emulators
    if [ -f emulator.pid ]; then
        local emulator_pid=$(cat emulator.pid)
        kill $emulator_pid 2>/dev/null || true
        rm emulator.pid
    fi
    
    # Remove log files
    rm -f emulator.log
    
    print_success "Cleanup completed"
}

# Function to run all tests
run_all_tests() {
    local env_file=${1:-".env.development"}
    
    print_status "Starting integration tests with $env_file..."
    
    # Check dependencies
    check_dependencies
    
    # Validate environment
    validate_environment "$env_file"
    
    # Test builds
    test_backend_build
    test_frontend_build
    
    # Start emulators
    start_emulators
    
    # Test Firebase connectivity
    test_firebase
    
    # Test API endpoints
    test_api_endpoints
    
    # Test authentication
    test_authentication
    
    # Test rate limiting
    test_rate_limiting
    
    # Test CORS
    test_cors
    
    # Test security headers
    test_security_headers
    
    # Run unit tests
    run_unit_tests
    
    # Cleanup
    cleanup
    
    print_success "All integration tests completed successfully!"
}

# Function to show help
show_help() {
    echo "ZeroPrint Integration Test Script"
    echo ""
    echo "Usage: $0 [environment_file]"
    echo ""
    echo "Arguments:"
    echo "  environment_file  Path to environment file (default: .env.development)"
    echo ""
    echo "Examples:"
    echo "  $0                           # Test with .env.development"
    echo "  $0 .env.staging              # Test with .env.staging"
    echo "  $0 .env.production           # Test with .env.production"
    echo ""
    echo "This script will:"
    echo "  - Validate environment variables"
    echo "  - Test backend and frontend builds"
    echo "  - Start Firebase emulators"
    echo "  - Test all API endpoints"
    echo "  - Verify security configurations"
    echo "  - Run unit tests"
    echo ""
}

# Parse command line arguments
ENV_FILE=".env.development"

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        *)
            ENV_FILE="$1"
            shift
            ;;
    esac
done

# Run all tests
run_all_tests "$ENV_FILE"
