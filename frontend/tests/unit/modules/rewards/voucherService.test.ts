import { uploadVouchers } from '@/modules/rewards/voucherService';

jest.mock('@/lib/services/rewardsClient', () => ({
  uploadVouchersFn: jest.fn().mockResolvedValue(2),
}));

function makeFile(contents: string, name = 'vouchers.csv', type = 'text/csv') {
  return new File([contents], name, { type });
}

describe('voucherService', () => {
  it('uploads voucher CSV and returns count', async () => {
    const csv = 'code\nAMZ-111\nAMZ-222\n';
    const file = makeFile(csv);
    const res = await uploadVouchers(file, 'rew_1', 'admin');
    expect(res.success).toBe(true);
    expect(res.count).toBe(2);
  });

  it('returns error for empty CSV', async () => {
    const csv = 'code\n';
    const file = makeFile(csv);
    const res = await uploadVouchers(file, 'rew_1', 'admin');
    expect(res.success).toBe(false);
  });
});


