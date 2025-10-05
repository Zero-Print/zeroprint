'use client';

import React, { useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { QrCode, CheckCircle, XCircle, AlertCircle, Gift } from 'lucide-react';
import { PartnerVerificationModal } from './PartnerVerificationModal';

interface PartnerVerificationPageProps {
  partnerId: string;
}

export function PartnerVerificationPage({ partnerId }: PartnerVerificationPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    rewardId?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = (result: { success: boolean; message: string; rewardId?: string }) => {
    setVerificationResult(result);
  };

  const handleRedeemReward = () => {
    if (verificationResult?.rewardId) {
      // In a real implementation, this would trigger the actual reward redemption
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setVerificationResult({
          success: true,
          message: 'Reward successfully redeemed!',
          rewardId: verificationResult.rewardId
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-lg shadow-gray-100/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                Partner Verification 🛡️
              </h1>
              <p className="text-gray-600 font-medium">
                Verify and redeem citizen rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <ZPCard className="text-center">
            <div className="mx-auto bg-gradient-to-br from-emerald-100 to-teal-200 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <QrCode className="h-10 w-10 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Citizen Rewards</h2>
            <p className="text-gray-600 mb-8">
              Scan QR codes or enter voucher IDs to verify and redeem citizen rewards
            </p>
            
            <ZPButton
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
              size="lg"
            >
              <QrCode className="h-5 w-5" />
              Verify Voucher
            </ZPButton>
            
            {/* Verification Result */}
            {verificationResult && (
              <div className={`mt-8 p-4 rounded-lg ${
                verificationResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {verificationResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      verificationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
                    </h3>
                    <p className={`mt-1 ${
                      verificationResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verificationResult.message}
                    </p>
                    
                    {verificationResult.success && verificationResult.rewardId && (
                      <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-purple-500" />
                            <span className="font-medium text-gray-900">Reward Available</span>
                          </div>
                          <ZPButton
                            variant="primary"
                            onClick={handleRedeemReward}
                            loading={isVerifying}
                            size="sm"
                          >
                            Redeem Reward
                          </ZPButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">How to Verify Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-emerald-600 font-bold">1</span>
                  </div>
                  <span>Scan QR code or enter voucher ID</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-emerald-600 font-bold">2</span>
                  </div>
                  <span>Verify voucher authenticity</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-emerald-600 font-bold">3</span>
                  </div>
                  <span>Redeem reward for citizen</span>
                </div>
              </div>
            </div>
          </ZPCard>
        </div>
      </div>
      
      {/* Verification Modal */}
      <PartnerVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerify}
        partnerId={partnerId}
      />
    </div>
  );
}