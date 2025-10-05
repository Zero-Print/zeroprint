/**
 * Mock Razorpay Utilities
 * 
 * Mock implementation for testing purposes
 */

export interface RazorpayConfig {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: number;
}

export class RazorpayUtils {
  constructor() {}
  
  // Order creation methods
  createOrder = jest.fn().mockResolvedValue({
    id: 'order_test_123',
    amount: 1000,
    currency: 'INR',
    receipt: 'receipt_123',
    status: 'created',
    created_at: Date.now()
  });
  
  // Payment verification methods
  verifyPayment = jest.fn().mockResolvedValue({
    success: true,
    paymentId: 'pay_test_123',
    orderId: 'order_test_123',
    amount: 1000
  });
  
  verifyPaymentSignature = jest.fn().mockReturnValue(true);
  
  // Webhook verification methods
  verifyWebhookSignature = jest.fn().mockReturnValue(true);
  processWebhook = jest.fn().mockResolvedValue({
    success: true,
    processed: true
  });
  
  // Refund methods
  processRefund = jest.fn().mockResolvedValue({
    success: true,
    refundId: 'rfnd_test_123'
  });
  
  // Utility methods
  validateIndianMobileNumber = jest.fn().mockReturnValue(true);
  validateIndianMobile = jest.fn().mockReturnValue(true);
  formatCurrency = jest.fn().mockReturnValue('₹1,000');
  formatAmount = jest.fn().mockReturnValue('₹10.00');
  getPaymentMethodDisplayName = jest.fn().mockReturnValue('Credit/Debit Card');
  isPaymentSuccessful = jest.fn().mockReturnValue(true);
  isOrderPaid = jest.fn().mockReturnValue(true);
  generateReceipt = jest.fn().mockReturnValue('subscription_premium_test-citizen-1_1234567890');
  generateReceiptNumber = jest.fn().mockReturnValue('RCP_1234567890_ABC123');
  validateRazorpayConfig = jest.fn().mockReturnValue(true);
  getCheckoutOptions = jest.fn().mockReturnValue({
    key: 'rzp_test_123',
    amount: 1000,
    currency: 'INR',
    name: 'ZeroPrint',
    description: 'Payment for ZeroPrint services',
    order_id: 'order_test_123'
  });
  
  // Currency conversion methods
  convertToPaise = jest.fn((amount) => amount * 100);
  convertFromPaise = jest.fn((paise) => paise / 100);
  
  // Legacy methods
  initializeRazorpay = jest.fn();
}

// Export singleton instance
export const razorpayUtils = new RazorpayUtils();

// Legacy exports for backward compatibility
export const initializeRazorpay = jest.fn();
export const verifyPayment = jest.fn();
export const createOrder = jest.fn();
export const createRazorpayOrder = jest.fn().mockResolvedValue({
  id: 'order_test_123',
  amount: 1000,
  currency: 'INR',
  receipt: 'receipt_123',
  status: 'created',
  created_at: Date.now()
});
export const verifyPaymentSignature = jest.fn().mockReturnValue(true);
export const verifyWebhookSignature = jest.fn().mockReturnValue(true);
export const processWebhookEvent = jest.fn().mockReturnValue({
  success: true,
  message: 'Event processed successfully'
});
export const processWebhook = jest.fn().mockResolvedValue({
  success: true,
  processed: true
});
export const processRefund = jest.fn().mockResolvedValue({
  success: true,
  refundId: 'rfnd_test_123'
});
export const formatAmount = jest.fn().mockReturnValue('₹10.00');
export const getPaymentMethodDisplayName = jest.fn().mockReturnValue('Credit/Debit Card');
export const isPaymentSuccessful = jest.fn().mockReturnValue(true);
export const isOrderPaid = jest.fn().mockReturnValue(true);
export const generateReceipt = jest.fn().mockReturnValue('subscription_premium_test-citizen-1_1234567890');
export const generateReceiptNumber = jest.fn().mockReturnValue('RCP_1234567890_ABC123');
export const validateRazorpayConfig = jest.fn().mockReturnValue(true);
export const validateIndianMobileNumber = jest.fn().mockReturnValue(true);
export const validateIndianMobile = jest.fn().mockReturnValue(true);
export const convertToPaise = jest.fn((amount) => amount * 100);
export const convertFromPaise = jest.fn((paise) => paise / 100);
export const getCheckoutOptions = jest.fn().mockReturnValue({
  key: 'rzp_test_123',
  amount: 1000,
  currency: 'INR',
  name: 'ZeroPrint',
  description: 'Payment for ZeroPrint services',
  order_id: 'order_test_123'
});