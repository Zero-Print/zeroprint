// Voucher Service - Handles voucher operations for the rewards system

// Mock Timestamp for demo purposes
const Timestamp = {
  now: () => new Date().toISOString()
};

// Voucher interface
export interface Voucher {
  id: string;
  code: string;
  rewardId: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  createdAt: string;
  createdBy: string;
}

// Mock voucher data for demo
let mockVouchers: Voucher[] = [
  {
    id: 'v1',
    code: 'AMZ-123-XYZ',
    rewardId: '1',
    isRedeemed: true,
    redeemedBy: 'user1',
    redeemedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v2',
    code: 'AMZ-456-ABC',
    rewardId: '1',
    isRedeemed: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin1'
  },
  {
    id: 'v3',
    code: 'AMZ-789-DEF',
    rewardId: '1',
    isRedeemed: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin1'
  }
];

// Parse CSV data
function parseCSV(csvText: string): { code: string; rewardId: string }[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Find the code column (should be the first column)
  const codeIndex = headers.findIndex(h => h.toLowerCase() === 'code');
  
  if (codeIndex === -1) {
    throw new Error('CSV must have a "code" column');
  }
  
  // Parse data rows
  const vouchers: { code: string; rewardId: string }[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    const code = values[codeIndex];
    
    if (code) {
      vouchers.push({ code, rewardId: '' }); // rewardId will be set during upload
    }
  }
  
  return vouchers;
}

// Upload vouchers from CSV data
import { uploadVouchersFn } from '@/lib/services/rewardsClient';

export async function uploadVouchers(
  file: File,
  rewardId: string,
  _createdBy: string
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const text = await file.text();
    const voucherData = parseCSV(text);
    if (voucherData.length === 0) {
      return { success: false, message: 'No valid voucher data found in CSV file' };
    }
    const codes = voucherData.map(v => v.code);
    const count = await uploadVouchersFn(rewardId, codes);
    return { success: true, message: `${count} vouchers uploaded successfully`, count };
  } catch (error: any) {
    console.error('Error uploading vouchers:', error);
    return { success: false, message: `Failed to upload vouchers: ${error.message || 'Unknown error'}` };
  }
}

// Get vouchers by reward ID
export async function getVouchersByRewardId(rewardId: string): Promise<Voucher[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockVouchers.filter(v => v.rewardId === rewardId);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw new Error('Failed to fetch vouchers');
  }
}

// Get unredeemed vouchers by reward ID
export async function getUnredeemedVouchersByRewardId(rewardId: string): Promise<Voucher[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockVouchers.filter(v => v.rewardId === rewardId && !v.isRedeemed);
  } catch (error) {
    console.error('Error fetching unredeemed vouchers:', error);
    throw new Error('Failed to fetch unredeemed vouchers');
  }
}

// Assign voucher to redemption
export async function assignVoucherToRedemption(
  rewardId: string, 
  userId: string, 
  redemptionId: string
): Promise<{ success: boolean; message: string; voucherCode?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find an unredeemed voucher for this reward
    const unredeemedVoucher = mockVouchers.find(v => v.rewardId === rewardId && !v.isRedeemed);
    
    if (!unredeemedVoucher) {
      return { success: false, message: 'No available vouchers for this reward' };
    }
    
    // Mark voucher as redeemed
    const updatedVoucher = {
      ...unredeemedVoucher,
      isRedeemed: true,
      redeemedBy: userId,
      redeemedAt: Timestamp.now()
    };
    
    // Update in mock data
    mockVouchers = mockVouchers.map(v => 
      v.id === unredeemedVoucher.id ? updatedVoucher : v
    );
    
    return { 
      success: true, 
      message: 'Voucher assigned successfully',
      voucherCode: updatedVoucher.code
    };
  } catch (error) {
    console.error('Error assigning voucher:', error);
    return { success: false, message: 'Failed to assign voucher' };
  }
}

// Verify voucher
export async function verifyVoucher(
  voucherCode: string
): Promise<{ isValid: boolean; message: string; rewardId?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const voucher = mockVouchers.find(v => v.code === voucherCode);
    
    if (!voucher) {
      return { isValid: false, message: 'Voucher not found' };
    }
    
    if (voucher.isRedeemed) {
      return { isValid: false, message: 'Voucher has already been redeemed' };
    }
    
    return { 
      isValid: true, 
      message: 'Voucher is valid',
      rewardId: voucher.rewardId
    };
  } catch (error) {
    console.error('Error verifying voucher:', error);
    return { isValid: false, message: 'Failed to verify voucher' };
  }
}