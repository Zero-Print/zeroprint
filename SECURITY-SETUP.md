# 🔒 ZeroPrint Security Setup Guide

This guide will help you set up the ZeroPrint application with proper security configurations and environment variables.

## 🚨 **CRITICAL: Security Issues Fixed**

The following critical security vulnerabilities have been addressed:

1. **✅ REMOVED**: Exposed service account key (`backend/functions/src/serviceAccountKey.json`)
2. **✅ CREATED**: Environment variable templates (`env.example`)
3. **✅ UPDATED**: Enhanced `.gitignore` to exclude sensitive files
4. **✅ IMPLEMENTED**: Security headers middleware
5. **✅ IMPLEMENTED**: Rate limiting middleware
6. **✅ IMPROVED**: CORS configuration
7. **✅ CREATED**: Secure deployment scripts

## 📋 **Setup Checklist**

### 1. Environment Variables Setup

#### Frontend Environment Variables
Create `frontend/.env.local`:
```bash
# Copy from env.example and fill in your values
cp env.example frontend/.env.local
```

#### Backend Environment Variables
Create `backend/functions/.env`:
```bash
# Copy from env.example and fill in your values
cp env.example backend/functions/.env
```

### 2. Required Environment Variables

#### 🔥 Firebase Configuration
```bash
# Get from Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side only)
# Get from Firebase Console > Project Settings > Service Accounts
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

#### 💳 Payment Integration (Razorpay)
```bash
# Get from Razorpay Dashboard > Settings > API Keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### 📊 Error Tracking (Sentry)
```bash
# Get from Sentry Dashboard > Project Settings > Client Keys (DSN)
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```

### 3. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: `zeroprint-[environment]` (e.g., `zeroprint-dev`)
3. Enable Authentication, Firestore, Storage, and Functions
4. Generate service account key and add to environment variables

#### Firestore Security Rules
The project includes strict security rules:
- No client-side writes to sensitive collections
- Role-based access control
- Immutable audit logs

### 4. Razorpay Setup

#### Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create test account for development
3. Generate API keys and add to environment variables
4. Set up webhooks with proper signatures

### 5. Security Features Implemented

#### 🛡️ Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` with strict rules

#### 🚦 Rate Limiting
- Authentication endpoints: 5 requests/15 minutes
- Payment endpoints: 10 requests/hour
- Game endpoints: 20 requests/minute
- Coin earning: 10 requests/minute
- Webhooks: 50 requests/minute

#### 🔐 CORS Configuration
- Environment-based origin validation
- Development mode allows localhost
- Production mode restricts to specific domains
- Credentials support for authenticated requests

### 6. Deployment

#### Using Deployment Scripts

**Linux/macOS:**
```bash
# Deploy to development
./scripts/deploy.sh development

# Deploy to production (with tests)
./scripts/deploy.sh production

# Deploy to production (skip tests)
./scripts/deploy.sh production --skip-tests
```

**Windows:**
```cmd
REM Deploy to development
scripts\deploy.bat development

REM Deploy to production (with tests)
scripts\deploy.bat production

REM Deploy to production (skip tests)
scripts\deploy.bat production --skip-tests
```

#### Manual Deployment
```bash
# Set Firebase project
firebase use your-project-id

# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 7. Testing Security Configuration

#### Run Security Tests
```bash
# Backend security tests
cd backend/functions
npm run test:security

# Frontend security tests
cd frontend
npm run test:security
```

#### Manual Security Checks
1. **Environment Variables**: Ensure no sensitive data in code
2. **CORS**: Test cross-origin requests
3. **Rate Limiting**: Test endpoint limits
4. **Authentication**: Verify JWT token validation
5. **Webhooks**: Test signature verification

### 8. Monitoring and Logging

#### Security Monitoring
- All security violations are logged
- Rate limit violations tracked
- Suspicious request patterns detected
- CORS violations monitored

#### Audit Logging
- All user actions logged
- Admin actions tracked
- Payment transactions recorded
- System changes audited

### 9. Production Security Checklist

Before deploying to production:

- [ ] All environment variables set correctly
- [ ] Service account key rotated and secured
- [ ] Firebase security rules deployed
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers implemented
- [ ] Error tracking configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented

### 10. Emergency Procedures

#### If Credentials Are Compromised
1. **Immediately rotate** all compromised credentials
2. **Revoke** Firebase service account keys
3. **Update** all environment variables
4. **Redeploy** the application
5. **Monitor** for suspicious activity
6. **Audit** access logs

#### If Security Breach Detected
1. **Isolate** affected systems
2. **Preserve** evidence and logs
3. **Notify** security team
4. **Patch** vulnerabilities
5. **Update** security measures
6. **Communicate** with users if needed

## 🔧 **Development Commands**

### Start Development Environment
```bash
# Start Firebase emulators
firebase emulators:start

# Start frontend development server
cd frontend && npm run dev

# Start backend development server
cd backend/functions && npm run serve
```

### Run Tests
```bash
# Run all tests
npm run test:all

# Run security tests
npm run test:security

# Run integration tests
npm run test:integration
```

### Environment-Specific Commands
```bash
# Development
npm run dev

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

## 📚 **Additional Resources**

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Razorpay Webhook Security](https://razorpay.com/docs/webhooks/)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🆘 **Support**

If you encounter any security issues or need assistance:

1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Review the security configuration
5. Contact the security team for critical issues

---

**Remember**: Security is an ongoing process. Regularly update dependencies, rotate credentials, and review security configurations to maintain a secure application.
