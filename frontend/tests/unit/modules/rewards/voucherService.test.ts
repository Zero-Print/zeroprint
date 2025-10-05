// Mock the rewards client before importing the service
jest.mock('@/lib/services/rewardsClient', () => ({
  uploadVouchersFn: jest.fn().mockResolvedValue(2),
}));

import { uploadVouchers } from '@/modules/rewards/voucherService';
import { uploadVouchersFn } from '@/lib/services/rewardsClient';

const mockUploadVouchersFn = uploadVouchersFn as jest.MockedFunction<typeof uploadVouchersFn>;

function makeFile(contents: string, name = 'vouchers.csv', type = 'text/csv') {
  return new File([contents], name, { type });
}

describe('voucherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUploadVouchersFn.mockResolvedValue(2);
  });

  it('uploads voucher CSV and returns count', async () => {
    const csv = 'code\nAMZ-111\nAMZ-222\n';
    const file = makeFile(csv);
    const res = await uploadVouchers(file, 'rew_1', 'admin');
    expect(res.success).toBe(true);
    expect(res.count).toBe(2);
    expect(mockUploadVouchersFn).toHaveBeenCalledWith('rew_1', ['AMZ-111', 'AMZ-222']);
  });

  it('returns error for empty CSV', async () => {
    const csv = 'code\n';
    const file = makeFile(csv);
    const res = await uploadVouchers(file, 'rew_1', 'admin');
    expect(res.success).toBe(false);
  });
});


