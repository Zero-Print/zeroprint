export interface PartnerResponse { success: boolean; voucherCode?: string; message?: string }

export async function dispatchRedeem(partnerConfig: any, redemption: any): Promise<PartnerResponse> {
  // Simulate success 80% of time
  const ok = Math.random() < 0.8;
  if (!ok) return {success: false, message: "Simulated failure"};
  return {success: true, voucherCode: `SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`};
}

export async function syncInventory(partnerConfig: any): Promise<Array<{ rewardId: string; stock: number }>> {
  return [{rewardId: "demo_reward", stock: 100}];
}


