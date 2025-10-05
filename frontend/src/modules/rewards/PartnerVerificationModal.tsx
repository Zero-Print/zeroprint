'use client';

import React, { useState, useRef } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { QrCode, X, CheckCircle, XCircle, Camera, Scan } from 'lucide-react';
import { verifyPartnerRedemptionFn } from '@/lib/services/rewardsClient';

interface PartnerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (result: { success: boolean; message: string; rewardId?: string }) => void;
  partnerId: string;
  isLoading?: boolean;
}

export function PartnerVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  partnerId,
  isLoading = false
}: PartnerVerificationModalProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ 
    success: boolean; 
    message: string 
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async () => {
    if (!voucherCode.trim()) {
      setVerificationResult({ 
        success: false, 
        message: 'Please enter a voucher code' 
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyPartnerRedemptionFn(voucherCode);
      setVerificationResult({ 
        success: result.isValid, 
        message: result.message 
      });
      onVerify({
        success: result.isValid,
        message: result.message,
        rewardId: result.rewardId
      });
    } catch (error) {
      setVerificationResult({ 
        success: false, 
        message: 'Verification failed. Please try again.' 
      });
      onVerify({
        success: false,
        message: 'Verification failed'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanQR = () => {
    // In a real implementation, this would trigger the camera to scan a QR code
    // For demo, we'll just show a message
    setVerificationResult({ 
      success: true, 
      message: 'QR scanning would be implemented here in a real application' 
    });
  };

  const handleClose = () => {
    // Reset form
    setVoucherCode('');
    setVerificationResult(null);
    setIsVerifying(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <ZPCard className="w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="mx-auto bg-gradient-to-br from-emerald-100 to-teal-200 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Partner Verification</h2>
          <p className="text-gray-600 mt-1">
            Scan QR code or enter voucher ID to verify redemption
          </p>
        </div>
        
        <div className="space-y-4">
          {/* QR Scan Button */}
          <ZPButton
            variant="outline"
            onClick={handleScanQR}
            className="w-full flex items-center justify-center gap-2"
            disabled={isVerifying || isLoading}
          >
            <Camera className="h-4 w-4" />
            Scan QR Code
          </ZPButton>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          {/* Manual Entry */}
          <div>
            <label htmlFor="voucherCode" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Voucher Code
            </label>
            <input
              ref={inputRef}
              type="text"
              id="voucherCode"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., AMZ-123-XYZ"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              disabled={isVerifying || isLoading}
            />
          </div>
          
          {/* Verification Result */}
          {verificationResult && (
            <div className={`p-3 rounded-md flex items-center gap-2 ${
              verificationResult.success 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {verificationResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{verificationResult.message}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <ZPButton
              variant="outline"
              onClick={handleClose}
              disabled={isVerifying || isLoading}
            >
              Cancel
            </ZPButton>
            
            <ZPButton
              variant="primary"
              onClick={handleVerify}
              disabled={isVerifying || isLoading || !voucherCode.trim()}
              loading={isVerifying || isLoading}
            >
              <Scan className="h-4 w-4 mr-2" />
              Verify Voucher
            </ZPButton>
          </div>
        </div>
      </ZPCard>
    </div>
  );
}