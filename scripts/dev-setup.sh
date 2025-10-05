#!/bin/bash

# ZeroPrint Local Development Setup Script
# Sets up complete local development environment with emulators

set -e

echo "🚀 Setting up ZeroPrint local development environment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v k6 &> /dev/null; then
        print_warning "k6 is not installed. Load testing will not be available."
        echo "Install k6: https://k6.io/docs/getting-started/installation/"
    fi
    
    print_success "Dependencies check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend/functions
    npm install
    cd ../..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend/functions
    npm run build
    cd ../..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Start Firebase emulators
start_emulators() {
    print_status "Starting Firebase emulators..."
    
    # Start emulators in background
    cd backend
    firebase emulators:start --import=emulator-data --export-on-exit &
    EMULATOR_PID=$!
    cd ..
    
    # Wait for emulators to start
    print_status "Waiting for emulators to start..."
    sleep 10
    
    # Check if emulators are running
    if curl -s http://localhost:4000 > /dev/null; then
        print_success "Firebase emulators started successfully"
    else
        print_error "Failed to start Firebase emulators"
        exit 1
    fi
}

# Seed emulator data
seed_data() {
    print_status "Seeding emulator data..."
    
    # Wait for emulators to be ready
    sleep 5
    
    # Run seed script
    cd backend
    node scripts/setup-emulators.js
    cd ..
    
    print_success "Emulator data seeded successfully"
}

# Start frontend development server
start_frontend() {
    print_status "Starting frontend development server..."
    
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend development server started successfully"
    else
        print_warning "Frontend may still be starting up..."
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    print_status "Running backend tests..."
    cd backend/functions
    npm test
    cd ../..
    
    # Run frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm test
    cd ..
    
    print_success "Tests completed successfully"
}

# Display development information
show_dev_info() {
    echo ""
    echo "🎉 ZeroPrint local development environment is ready!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Firebase Emulator UI: http://localhost:4000"
    echo "⚡ Functions: http://127.0.0.1:5000/zeroprint-dev/us-central1"
    echo "🔥 Firestore: http://localhost:8080"
    echo "🔐 Auth: http://localhost:9099"
    echo ""
    echo "👤 Test Accounts:"
    echo "   Citizen: citizen@zeroprint.com"
    echo "   Admin: admin@zeroprint.com"
    echo "   Government: govt@zeroprint.com"
    echo ""
    echo "🎮 Test Games:"
    echo "   Climate Quiz: quiz-climate"
    echo "   Waste Sorting: drag-drop-waste"
    echo "   Energy Simulation: simulation-energy"
    echo ""
    echo "🎁 Test Rewards:"
    echo "   Eco-Friendly Water Bottle: reward1 (500 coins)"
    echo "   Solar Phone Charger: reward2 (800 coins)"
    echo "   Tree Planting Certificate: reward3 (200 coins)"
    echo ""
    echo "💳 Test Subscription Plans:"
    echo "   Basic: ₹299/month"
    echo "   Premium: ₹599/month"
    echo "   Enterprise: ₹1999/month"
    echo ""
    echo "🔧 Development Commands:"
    echo "   Stop emulators: pkill -f firebase"
    echo "   Stop frontend: pkill -f 'next dev'"
    echo "   View logs: firebase emulators:start --inspect-functions"
    echo "   Run tests: npm run test"
    echo "   Run E2E tests: npm run test:e2e"
    echo "   Run load tests: npm run test:load"
    echo ""
    echo "📚 Documentation:"
    echo "   API Documentation: http://localhost:3000/api-docs"
    echo "   Storybook: http://localhost:6006"
    echo "   Test Reports: frontend/playwright-report/index.html"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    # Kill background processes
    if [ ! -z "$EMULATOR_PID" ]; then
        kill $EMULATOR_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo "🌟 ZeroPrint Development Setup"
    echo "=============================="
    echo ""
    
    check_dependencies
    install_dependencies
    build_applications
    start_emulators
    seed_data
    start_frontend
    run_tests
    show_dev_info
    
    print_success "Setup completed successfully!"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    wait
}

# Run main function
main "$@"
