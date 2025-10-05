'use client';

import React from 'react';
import { PartnerVerificationPage } from '@/modules/rewards/PartnerVerificationPage';

export default function AdminRewardsVerifyPage() {
  // In a real implementation, partnerId should come from auth/session
  const partnerId = 'partner_demo_001';
  return <PartnerVerificationPage partnerId={partnerId} />;
}


