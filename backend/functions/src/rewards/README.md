# Rewards & Marketplace Module

This module implements the complete Rewards & Marketplace functionality for ZeroPrint Web, enabling users to redeem HealCoins for vouchers, CSR eco-products, and bill credits.

## Features

### 1. Rewards Management
- Add, update, delete rewards
- Manage reward stock levels
- Support for different reward types (vouchers, products, credits)

### 2. Redemption System
- Secure coin redemption with comprehensive validation
- Fraud detection and prevention
- Voucher assignment for voucher-type rewards
- Audit logging for all transactions

### 3. Voucher Management
- Bulk upload of voucher codes via CSV
- Partner verification via QR code or voucher ID scan
- Voucher tracking and redemption status

### 4. Analytics & Reporting
- Redemption statistics and trends
- Reward performance tracking
- Stock level monitoring
- Export functionality for reports

## Cloud Functions

### Reward Management Functions
- `rewards_addReward` - Add a new reward (admin only)
- `rewards_updateReward` - Update an existing reward (admin only)
- `rewards_deleteReward` - Delete a reward (admin only)
- `rewards_getRewards` - Get all active rewards (public)
- `rewards_getRewardById` - Get a specific reward by ID (public)
- `rewards_updateRewardStock` - Update reward stock levels (admin only)

### Redemption Functions
- `rewards_redeemCoins` - Redeem coins for a reward
- `rewards_getUserRedemptions` - Get redemptions for the current user
- `rewards_getAllRedemptions` - Get all redemptions (admin only)

### Voucher Functions
- `rewards_uploadVouchers` - Upload voucher codes from CSV (admin only)
- `rewards_verifyPartnerRedemption` - Verify partner redemption via QR code or voucher ID
- `rewards_getVouchersForReward` - Get all vouchers for a specific reward (admin only)

### Analytics Functions
- `rewards_getAnalyticsData` - Get comprehensive analytics data (admin only)
- `rewards_getTotalCoinsRedeemed` - Get total coins redeemed (admin only)
- `rewards_getRedemptionTrends` - Get redemption trends for a date range (admin only)

## Security Features

- All wallet deductions via secure Cloud Functions
- Immutable audit logs for compliance
- Daily and monthly redemption caps
- Duplicate transaction prevention
- Fraud detection with risk scoring
- Admin action logging

## Data Collections

### rewards
```
{
  "rewardId": string,
  "title": string,
  "description": string,
  "coinCost": number,
  "stock": number,
  "type": "voucher" | "product" | "credit",
  "imageUrl": string,
  "createdAt": string,
  "createdBy": string,
  "isActive": boolean,
  "metadata": any
}
```

### redemptions
```
{
  "redemptionId": string,
  "userId": string,
  "rewardId": string,
  "coinsSpent": number,
  "status": "success" | "failed" | "pending",
  "voucherCode": string,
  "createdAt": string,
  "processedBy": string,
  "processedAt": string,
  "metadata": any
}
```

### vouchers
```
{
  "voucherId": string,
  "code": string,
  "rewardId": string,
  "isRedeemed": boolean,
  "redeemedBy": string,
  "redeemedAt": string,
  "createdAt": string,
  "createdBy": string,
  "expiresAt": string,
  "metadata": any
}
```

## Integration Points

- Wallet service for coin balance management
- Audit logs for compliance tracking
- Activity logs for user behavior analytics
- Error logs for troubleshooting
- Firebase Authentication for user verification

## Usage

### Frontend Integration
The frontend can call these functions using the Firebase SDK:

```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const addReward = httpsCallable(functions, 'rewards_addReward');

const result = await addReward({
  title: "Amazon Voucher ₹100",
  description: "Redeem for a ₹100 Amazon voucher",
  coinCost: 1000,
  stock: 50,
  type: "voucher"
});
```

### Admin Panel
Admin functions require proper authentication and authorization checks to ensure only authorized personnel can perform administrative tasks.