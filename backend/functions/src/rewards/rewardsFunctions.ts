import * as functions from "firebase-functions/v2";
import {addReward, updateReward, deleteReward, getRewards, getRewardById, updateRewardStock} from "./rewardsService";
import {redeemCoins, getUserRedemptions, getAllRedemptions} from "./redemptionService";
import {uploadVouchers, verifyPartnerRedemption, getVouchersForReward} from "./voucherService";
import {getAnalyticsData, getTotalCoinsRedeemed, getRedemptionTrends} from "./analyticsService";

// Reward Management Functions
export const rewards_addReward = functions.https.onCall({region: "asia-south1"}, addReward);
export const rewards_updateReward = functions.https.onCall({region: "asia-south1"}, updateReward);
export const rewards_deleteReward = functions.https.onCall({region: "asia-south1"}, deleteReward);
export const rewards_getRewards = functions.https.onCall({region: "asia-south1"}, getRewards);
export const rewards_getRewardById = functions.https.onCall({region: "asia-south1"}, getRewardById);
export const rewards_updateRewardStock = functions.https.onCall({region: "asia-south1"}, updateRewardStock);

// Redemption Functions
export const rewards_redeemCoins = functions.https.onCall({region: "asia-south1"}, redeemCoins);
export const rewards_getUserRedemptions = functions.https.onCall({region: "asia-south1"}, getUserRedemptions);
export const rewards_getAllRedemptions = functions.https.onCall({region: "asia-south1"}, getAllRedemptions);

// Voucher Functions
export const rewards_uploadVouchers = functions.https.onCall({region: "asia-south1"}, uploadVouchers);
export const rewards_verifyPartnerRedemption = functions.https.onCall({region: "asia-south1"}, verifyPartnerRedemption);
export const rewards_getVouchersForReward = functions.https.onCall({region: "asia-south1"}, getVouchersForReward);

// Analytics Functions
export const rewards_getAnalyticsData = functions.https.onCall({region: "asia-south1"}, getAnalyticsData);
export const rewards_getTotalCoinsRedeemed = functions.https.onCall({region: "asia-south1"}, getTotalCoinsRedeemed);
export const rewards_getRedemptionTrends = functions.https.onCall({region: "asia-south1"}, getRedemptionTrends);
