#!/bin/bash

# ZeroPrint Deployment Script
# This script handles deployment with proper environment variable management

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

# Function to setup environment for deployment
setup_environment() {
    local environment=$1
    local env_file=""
    
    case $environment in
        "development")
            env_file=".env.development"
            ;;
        "staging")
            env_file=".env.staging"
            ;;
        "production")
            env_file=".env.production"
            ;;
        *)
            print_error "Invalid environment: $environment. Use development, staging, or production"
            exit 1
            ;;
    esac
    
    # Copy environment file to backend functions
    if [ -f "$env_file" ]; then
        print_status "Setting up environment for $environment..."
        cp "$env_file" "backend/functions/.env"
        print_success "Environment file copied to backend/functions/.env"
    else
        print_error "Environment file $env_file not found"
        exit 1
    fi
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    # Build backend
    print_status "Building backend functions..."
    cd backend/functions
    npm ci --only=production
    npm run build
    cd ../..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm ci --only=production
    npm run build
    cd ..
    
    print_success "Project built successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend/functions
    npm test
    cd ../..
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd frontend
    npm run test:ci
    cd ..
    
    print_success "All tests passed"
}

# Function to deploy to Firebase
deploy_firebase() {
    local environment=$1
    print_status "Deploying to Firebase ($environment)..."
    
    # Set Firebase project
    case $environment in
        "development")
            firebase use demo-zeroprint-dev
            ;;
        "staging")
            firebase use demo-zeroprint-staging
            ;;
        "production")
            firebase use demo-zeroprint-prod
            ;;
    esac
    
    # Deploy functions
    print_status "Deploying Cloud Functions..."
    firebase deploy --only functions
    
    # Deploy hosting
    print_status "Deploying hosting..."
    firebase deploy --only hosting
    
    # Deploy Firestore rules
    print_status "Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    # Deploy storage rules
    print_status "Deploying storage rules..."
    firebase deploy --only storage
    
    print_success "Deployment completed successfully"
}

# Function to cleanup after deployment
cleanup() {
    print_status "Cleaning up..."
    
    # Remove environment file from backend
    if [ -f "backend/functions/.env" ]; then
        rm "backend/functions/.env"
        print_status "Removed backend environment file"
    fi
    
    print_success "Cleanup completed"
}

# Function to verify deployment
verify_deployment() {
    local environment=$1
    print_status "Verifying deployment..."
    
    # Get the deployed URL based on environment
    local base_url=""
    case $environment in
        "development")
            base_url="https://demo-zeroprint-dev.web.app"
            ;;
        "staging")
            base_url="https://demo-zeroprint-staging.web.app"
            ;;
        "production")
            base_url="https://demo-zeroprint-prod.web.app"
            ;;
    esac
    
    # Test health endpoint
    local health_url="${base_url}/api/health"
    print_status "Testing health endpoint: $health_url"
    
    if curl -f -s "$health_url" > /dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        return 1
    fi
    
    print_success "Deployment verification completed"
}

# Main deployment function
deploy() {
    local environment=$1
    local skip_tests=${2:-false}
    
    print_status "Starting deployment to $environment environment..."
    
    # Check dependencies
    check_dependencies
    
    # Validate environment
    validate_environment ".env.${environment}"
    
    # Setup environment
    setup_environment "$environment"
    
    # Build project
    build_project
    
    # Run tests (unless skipped)
    if [ "$skip_tests" != "true" ]; then
        run_tests
    else
        print_warning "Skipping tests"
    fi
    
    # Deploy to Firebase
    deploy_firebase "$environment"
    
    # Verify deployment
    verify_deployment "$environment"
    
    # Cleanup
    cleanup
    
    print_success "Deployment to $environment completed successfully!"
}

# Function to show help
show_help() {
    echo "ZeroPrint Deployment Script"
    echo ""
    echo "Usage: $0 <environment> [options]"
    echo ""
    echo "Environments:"
    echo "  development  Deploy to development environment"
    echo "  staging      Deploy to staging environment"
    echo "  production   Deploy to production environment"
    echo ""
    echo "Options:"
    echo "  --skip-tests Skip running tests before deployment"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 production --skip-tests"
    echo ""
    echo "Prerequisites:"
    echo "  - Environment files (.env.development, .env.staging, .env.production)"
    echo "  - Firebase CLI installed and authenticated"
    echo "  - Node.js 18+ installed"
    echo ""
}

# Parse command line arguments
ENVIRONMENT=""
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        development|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if environment is provided
if [ -z "$ENVIRONMENT" ]; then
    print_error "Environment is required"
    show_help
    exit 1
fi

# Run deployment
deploy "$ENVIRONMENT" "$SKIP_TESTS"
