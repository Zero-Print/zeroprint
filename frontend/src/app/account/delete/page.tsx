'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth';
import { api } from '@/lib/api';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ui/ZPButton';
import { AlertTriangle, Trash2, Shield, Clock } from 'lucide-react';

export default function AccountDeletionPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const requiredConfirmationText = 'DELETE MY ACCOUNT';

  const handleInitiateDeletion = () => {
    setStep('confirmation');
  };

  const handleConfirmDeletion = async () => {
    if (!user || confirmationText !== requiredConfirmationText || !agreedToTerms) {
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      await api.account.deleteAccount({
        confirmationText,
        reason: 'User requested account deletion',
      });

      // Show success message and logout
      alert(
        'Account deletion request submitted successfully. You will receive a confirmation email.'
      );

      // Logout user
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('Failed to submit deletion request. Please contact support.');
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  const dataToBeDeleted = [
    'Profile information and account details',
    'Wallet balance and transaction history',
    'Carbon footprint and mental health tracking data',
    'Game progress and achievements',
    'Subscription history and billing information',
    'Activity logs and app usage data',
    'Uploaded files and documents',
  ];

  const dataRetained = [
    'Anonymized analytics data (as permitted by law)',
    'Financial records (for regulatory compliance - 7 years)',
    'Audit logs (for security and compliance purposes)',
    'Legal documents and communications',
  ];

  if (step === 'processing') {
    return (
      <div className='container mx-auto px-4 py-8 max-w-2xl'>
        <ZPCard>
          <div className='p-8 text-center'>
            <Clock className='w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse' />
            <h1 className='text-2xl font-bold mb-4'>Processing Account Deletion</h1>
            <p className='text-gray-600 mb-6'>
              Your account deletion request is being processed. This may take a few moments.
            </p>
            <div className='animate-pulse'>
              <div className='h-2 bg-blue-200 rounded-full'>
                <div className='h-2 bg-blue-500 rounded-full w-3/4'></div>
              </div>
            </div>
          </div>
        </ZPCard>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2 flex items-center'>
          <Trash2 className='w-8 h-8 mr-3 text-red-500' />
          Delete Account
        </h1>
        <p className='text-gray-600'>
          Permanently delete your ZeroPrint account and all associated data.
        </p>
      </div>

      {step === 'warning' && (
        <div className='space-y-6'>
          {/* Warning Card */}
          <ZPCard className='border-red-200 bg-red-50'>
            <div className='p-6'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='w-6 h-6 text-red-500 mt-1' />
                <div>
                  <h2 className='text-lg font-semibold text-red-900 mb-2'>
                    Warning: This action cannot be undone
                  </h2>
                  <p className='text-red-800'>
                    Deleting your account will permanently remove all your data from our systems.
                    This action is irreversible and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </ZPCard>

          {/* Data to be Deleted */}
          <ZPCard>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-4 flex items-center'>
                <Trash2 className='w-5 h-5 mr-2 text-red-500' />
                Data to be Deleted
              </h2>
              <p className='text-gray-600 mb-4'>
                The following data will be permanently deleted from our systems:
              </p>
              <ul className='space-y-2'>
                {dataToBeDeleted.map((item, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-red-500 mt-1'>•</span>
                    <span className='text-gray-700'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ZPCard>

          {/* Data Retained */}
          <ZPCard>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-4 flex items-center'>
                <Shield className='w-5 h-5 mr-2 text-blue-500' />
                Data Retained for Compliance
              </h2>
              <p className='text-gray-600 mb-4'>
                Some data may be retained for legal and regulatory compliance:
              </p>
              <ul className='space-y-2'>
                {dataRetained.map((item, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span className='text-gray-700'>{item}</span>
                  </li>
                ))}
              </ul>
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Note:</strong> Retained data is anonymized where possible and will be
                  deleted according to our data retention policy and applicable laws.
                </p>
              </div>
            </div>
          </ZPCard>

          {/* Alternative Options */}
          <ZPCard>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-4'>Consider These Alternatives</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>Deactivate Account</h3>
                  <p className='text-sm text-gray-600 mb-3'>
                    Temporarily disable your account without losing data.
                  </p>
                  <ZPButton variant='outline' size='sm'>
                    Deactivate Instead
                  </ZPButton>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h3 className='font-medium mb-2'>Export Data First</h3>
                  <p className='text-sm text-gray-600 mb-3'>
                    Download a copy of your data before deletion.
                  </p>
                  <ZPButton
                    variant='outline'
                    size='sm'
                    onClick={() => router.push('/account/export')}
                  >
                    Export Data
                  </ZPButton>
                </div>
              </div>
            </div>
          </ZPCard>

          <div className='flex justify-end space-x-4'>
            <ZPButton variant='outline' onClick={() => router.push('/account')}>
              Cancel
            </ZPButton>
            <ZPButton variant='danger' onClick={handleInitiateDeletion}>
              Continue with Deletion
            </ZPButton>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <ZPCard>
          <div className='p-6'>
            <h2 className='text-xl font-semibold mb-6 text-red-900'>Final Confirmation Required</h2>

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Type &quot;{requiredConfirmationText}&quot; to confirm deletion:
                </label>
                <input
                  type='text'
                  value={confirmationText}
                  onChange={e => setConfirmationText(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  placeholder={requiredConfirmationText}
                />
              </div>

              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='agree-terms'
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className='mt-1'
                />
                <label htmlFor='agree-terms' className='text-sm text-gray-700'>
                  I understand that this action is permanent and irreversible. I acknowledge that
                  all my data will be deleted and cannot be recovered.
                </label>
              </div>

              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <p className='text-sm text-red-800'>
                  <strong>Last chance:</strong> Once you click &quot;Delete Account&quot;, your
                  account and all associated data will be permanently deleted within 30 days as per
                  DPDP regulations.
                </p>
              </div>

              <div className='flex justify-end space-x-4'>
                <ZPButton variant='outline' onClick={() => setStep('warning')}>
                  Go Back
                </ZPButton>
                <ZPButton
                  variant='danger'
                  onClick={handleConfirmDeletion}
                  disabled={
                    loading || confirmationText !== requiredConfirmationText || !agreedToTerms
                  }
                >
                  {loading ? 'Deleting Account...' : 'Delete Account'}
                </ZPButton>
              </div>
            </div>
          </div>
        </ZPCard>
      )}
    </div>
  );
}
