# ZeroPrint Local Development Setup

This guide will help you set up and run the complete ZeroPrint application locally with Firebase emulators.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- k6 (optional, for load testing)

### 1. Clone and Install

```bash
git clone <repository-url>
cd zeroprint
npm install
```

### 2. Start Development Environment

```bash
# Make the setup script executable
chmod +x scripts/dev-setup.sh

# Run the complete setup
./scripts/dev-setup.sh
```

This will:
- Install all dependencies
- Build frontend and backend
- Start Firebase emulators
- Seed test data
- Start frontend dev server
- Run all tests

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Functions**: http://127.0.0.1:5000/zeroprint-dev/us-central1
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099

## 🧪 Test Accounts

The setup script creates several test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Citizen | citizen@zeroprint.com | password | Regular user for testing |
| Admin | admin@zeroprint.com | password | Admin user for testing |
| Government | govt@zeroprint.com | password | Government user for testing |

## 🎮 Test Data

### Games
- **Climate Change Quiz** (`quiz-climate`) - 100 max coins
- **Waste Sorting Challenge** (`drag-drop-waste`) - 150 max coins  
- **Energy Efficiency Simulation** (`simulation-energy`) - 200 max coins

### Rewards
- **Eco-Friendly Water Bottle** (`reward1`) - 500 coins
- **Solar Phone Charger** (`reward2`) - 800 coins
- **Tree Planting Certificate** (`reward3`) - 200 coins

### Subscription Plans
- **Basic Plan** - ₹299/month
- **Premium Plan** - ₹599/month
- **Enterprise Plan** - ₹1999/month

## 🔧 Development Commands

### Backend (Firebase Functions)

```bash
cd backend/functions

# Install dependencies
npm install

# Build
npm run build

# Start emulators
npm run serve

# Run tests
npm test
npm run test:integration
npm run test:rules
npm run test:load
npm run test:security

# Lint and typecheck
npm run lint
npm run typecheck
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build

# Run tests
npm test
npm run test:e2e
npm run test:visual
npm run test:accessibility
npm run test:security

# Lint and typecheck
npm run lint
npm run typecheck
```

### Firebase Emulators

```bash
cd backend

# Start all emulators
firebase emulators:start

# Start with UI
firebase emulators:start --ui

# Start with data import/export
firebase emulators:start --import=emulator-data --export-on-exit

# Start specific emulators
firebase emulators:start --only functions,firestore,auth
```

## 📊 Complete E2E Flow Test

The application includes a comprehensive E2E test that validates the complete user journey:

1. **Login** - Authenticate as test user
2. **Play Game** - Complete Climate Change Quiz, earn 85 coins
3. **Log Carbon Action** - Log public transport usage, earn 2 coins
4. **Log Mood** - Check in with mood/energy/stress, earn 5 coins
5. **Redeem Reward** - Redeem Eco-Friendly Water Bottle for 500 coins
6. **Check Wallet** - Verify balance and transaction history
7. **View Dashboard** - See updated metrics and trends
8. **Subscribe** - Test subscription flow with Razorpay webhook
9. **Admin Dashboard** - View system health, analytics, logs
10. **Government Dashboard** - View ward statistics, simulations
11. **Monitoring** - Check performance metrics, alerts
12. **Integrations** - Test notifications, partners, geo services
13. **Audit Logs** - Verify all actions are logged
14. **Error Handling** - Test error scenarios
15. **Performance** - Measure load times and API response times

### Run E2E Tests

```bash
cd frontend
npm run test:e2e
```

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router** - Modern Next.js routing
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **API Client** - Centralized API calls via `src/lib/api.ts`

### Backend (Firebase Functions)
- **Express.js** - HTTP router
- **TypeScript** - Type safety
- **Firestore** - Database
- **Firebase Auth** - Authentication
- **Service Layer** - Business logic separation

### Key Features
- **Strict Security Rules** - No client-side writes to sensitive data
- **Comprehensive Logging** - Audit logs, activity logs, error logs
- **Real-time Monitoring** - Performance metrics, system health
- **Role-based Access** - Citizen, Entity, Government, Admin dashboards
- **Anti-fraud Measures** - Daily caps, duplicate detection, rate limiting
- **Webhook Security** - HMAC signature verification
- **Feature Flags** - Dynamic feature control

## 🔒 Security Features

### Firestore Security Rules
- **No client writes** to wallets, payments, subscriptions, audit logs
- **Role-based access** - Users can only access their own data
- **Admin-only collections** - Fraud alerts, error logs, system settings
- **Immutable audit logs** - Cannot be modified or deleted

### API Security
- **JWT Authentication** - All API calls require valid tokens
- **Input Validation** - Zod schemas for all inputs
- **Rate Limiting** - Daily/monthly caps enforced
- **Fraud Prevention** - Duplicate detection, suspicious activity monitoring
- **Webhook Security** - HMAC signature verification

### Data Protection
- **Client-side write prevention** - All sensitive operations via functions
- **Audit trail immutability** - Tamper-evident logs
- **Data encryption** - Sensitive data encrypted in transit and at rest
- **Input sanitization** - All user inputs validated and sanitized

## 🧪 Testing

### Test Types
- **Unit Tests** - Jest for individual functions
- **Integration Tests** - Firebase emulator testing
- **E2E Tests** - Playwright for complete user flows
- **Visual Tests** - Screenshot comparison testing
- **Load Tests** - k6 for performance testing
- **Security Tests** - Vulnerability scanning and rules testing
- **Accessibility Tests** - WCAG compliance testing

### Test Coverage
- **Frontend**: 80%+ code coverage
- **Backend**: 80%+ code coverage
- **E2E**: Complete user journey coverage
- **Security**: All security rules tested
- **Performance**: Load testing for critical paths

## 📈 Monitoring & Analytics

### Real-time Metrics
- **System Health** - Uptime, memory, CPU usage
- **Performance** - API response times, p95/p99 latency
- **User Activity** - DAU, engagement metrics
- **Business Metrics** - CO₂ saved, coins earned/redeemed
- **Error Tracking** - Error rates, stack traces
- **Fraud Detection** - Suspicious activity alerts

### Admin Dashboard
- **System Overview** - Health status, key metrics
- **User Analytics** - Growth, engagement, retention
- **Financial Metrics** - Revenue, subscriptions, redemptions
- **Error Monitoring** - Error logs, performance issues
- **Audit Trail** - All system actions logged

## 🔌 Integrations

### External Services
- **Razorpay** - Payment processing
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications
- **FCM** - Push notifications
- **Google Maps** - Geo services
- **Sentry** - Error tracking

### Feature Flags
- **Push Notifications** - Enable/disable notifications
- **CSR Integration** - Partner integrations
- **Geo Services** - Location-based features
- **Advanced Analytics** - Premium features

## 🚀 Deployment

### CI/CD Pipeline
- **GitHub Actions** - Automated testing and deployment
- **Quality Gates** - Tests must pass before deployment
- **Environment Isolation** - Staging and production environments
- **Deployment Logging** - All deployments tracked

### Deployment Commands
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Deploy specific services
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## 🐛 Troubleshooting

### Common Issues

1. **Emulators not starting**
   ```bash
   # Check if ports are available
   lsof -i :4000,5000,8080,9099
   
   # Kill processes using ports
   pkill -f firebase
   ```

2. **Frontend not loading**
   ```bash
   # Check if backend is running
   curl http://127.0.0.1:5000/zeroprint-dev/us-central1/health
   
   # Restart frontend
   cd frontend && npm run dev
   ```

3. **Tests failing**
   ```bash
   # Clear test data
   rm -rf frontend/test-results
   rm -rf frontend/playwright-report
   
   # Reinstall dependencies
   npm install
   ```

4. **Database issues**
   ```bash
   # Reset emulator data
   firebase emulators:start --import=emulator-data --export-on-exit
   
   # Clear all data
   rm -rf emulator-data
   ```

### Debug Mode

```bash
# Start emulators with debug info
firebase emulators:start --inspect-functions

# Start frontend with debug info
cd frontend && DEBUG=* npm run dev

# Run tests with debug info
npm run test:e2e -- --debug
```

## 📚 Documentation

- **API Documentation**: http://localhost:3000/api-docs
- **Storybook**: http://localhost:6006
- **Test Reports**: frontend/playwright-report/index.html
- **Coverage Reports**: frontend/coverage/index.html

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at the test files for examples
3. Check the Firebase emulator logs
4. Open an issue on GitHub

---

**Happy coding! 🚀**
