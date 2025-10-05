'use client';

import React from 'react';
import { ThemeProvider } from '@/styles/theme';
import { ZPThemeToggle } from '@/components/ui/ZPThemeToggle';
import {
  ZPButton,
  ZPButtonPrimary,
  ZPButtonSecondary,
  ZPButtonGhost,
  ZPButtonIcon,
} from '@/components/ZPButton';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPInput, ZPPasswordInput, ZPEmailInput } from '@/components/ui/ZPInput';
import { ZPBadge, ZPHealCoinBadge, ZPCarbonBadge, ZPEnergyBadge } from '@/components/ZPBadge';
import { ZPModal, useZPModal } from '@/components/ui/ZPModal';
import { WalletCard } from '@/components/ui/WalletCard';
import { LeaderboardList } from '@/components/ui/LeaderboardList';
import { GameCard } from '@/components/ui/GameCard';
import { TrackerCard } from '@/components/ui/TrackerCard';
import { Play, Settings, Heart, Star, Plus } from 'lucide-react';

export default function DesignSystemPage() {
  const modal = useZPModal();

  return (
    <ThemeProvider>
      <div className='min-h-screen bg-background text-foreground'>
        <div className='container mx-auto p-8 space-y-12'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-foreground mb-2'>ZeroPrint Design System</h1>
              <p className='text-muted-foreground'>
                A comprehensive component library for ZeroPrint Core Web and all spin-offs
              </p>
            </div>
            <ZPThemeToggle />
          </div>

          {/* Design Tokens */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Design Tokens</h2>

            {/* Colors */}
            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Colors</ZPCard.Title>
                <ZPCard.Description>
                  Brand and semantic colors from our design tokens
                </ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='space-y-2'>
                    <div className='w-full h-16 bg-[var(--zp-primary-green)] rounded-md'></div>
                    <p className='text-sm font-medium'>Primary Green</p>
                  </div>
                  <div className='space-y-2'>
                    <div className='w-full h-16 bg-[var(--zp-solar-yellow)] rounded-md'></div>
                    <p className='text-sm font-medium'>Solar Yellow</p>
                  </div>
                  <div className='space-y-2'>
                    <div className='w-full h-16 bg-[var(--zp-info-blue)] rounded-md'></div>
                    <p className='text-sm font-medium'>Info Blue</p>
                  </div>
                  <div className='space-y-2'>
                    <div className='w-full h-16 bg-[var(--zp-healcoin-gold)] rounded-md'></div>
                    <p className='text-sm font-medium'>HealCoin Gold</p>
                  </div>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>

          {/* Buttons */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Buttons</h2>

            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Button Variants</ZPCard.Title>
                <ZPCard.Description>
                  Primary (green), secondary (yellow), ghost, and icon variants
                </ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='space-y-4'>
                  <div className='flex flex-wrap gap-3'>
                    <ZPButtonPrimary>Primary Button</ZPButtonPrimary>
                    <ZPButtonSecondary>Secondary Button</ZPButtonSecondary>
                    <ZPButtonGhost>Ghost Button</ZPButtonGhost>
                    <ZPButton variant='outline'>Outline Button</ZPButton>
                  </div>

                  <div className='flex flex-wrap gap-3'>
                    <ZPButton variant='success'>Success</ZPButton>
                    <ZPButton variant='warning'>Warning</ZPButton>
                    <ZPButton variant='danger'>Danger</ZPButton>
                  </div>

                  <div className='flex flex-wrap gap-3'>
                    <ZPButton icon={<Play className='h-4 w-4' />} iconPosition='left'>
                      Play Game
                    </ZPButton>
                    <ZPButton
                      icon={<Settings className='h-4 w-4' />}
                      iconPosition='right'
                      variant='outline'
                    >
                      Settings
                    </ZPButton>
                    <ZPButtonIcon icon={<Heart className='h-4 w-4' />} aria-label='Like' />
                    <ZPButtonIcon icon={<Star className='h-4 w-4' />} aria-label='Favorite' />
                  </div>

                  <div className='flex flex-wrap gap-3'>
                    <ZPButton size='sm'>Small</ZPButton>
                    <ZPButton size='md'>Medium</ZPButton>
                    <ZPButton size='lg'>Large</ZPButton>
                    <ZPButton size='xl'>Extra Large</ZPButton>
                  </div>

                  <div className='flex flex-wrap gap-3'>
                    <ZPButton loading>Loading...</ZPButton>
                    <ZPButton disabled>Disabled</ZPButton>
                  </div>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>

          {/* Cards */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Cards</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <ZPCard variant='default'>
                <ZPCard.Header>
                  <ZPCard.Title>Default Card</ZPCard.Title>
                  <ZPCard.Description>
                    A simple card with header, body, and footer
                  </ZPCard.Description>
                </ZPCard.Header>
                <ZPCard.Body>
                  <p className='text-sm text-muted-foreground'>
                    This is the card body content. It can contain any React components or text.
                  </p>
                </ZPCard.Body>
                <ZPCard.Footer>
                  <ZPButton size='sm' variant='outline'>
                    Cancel
                  </ZPButton>
                  <ZPButton size='sm'>Action</ZPButton>
                </ZPCard.Footer>
              </ZPCard>

              <ZPCard variant='elevated' hover>
                <ZPCard.Header actions={<ZPButtonIcon icon={<Plus className='h-4 w-4' />} />}>
                  <ZPCard.Title>Elevated Card</ZPCard.Title>
                  <ZPCard.Description>With hover effect and action button</ZPCard.Description>
                </ZPCard.Header>
                <ZPCard.Body>
                  <p className='text-sm text-muted-foreground'>
                    This card has an elevated shadow and hover animation.
                  </p>
                </ZPCard.Body>
              </ZPCard>

              <ZPCard variant='outlined' clickable onClick={() => alert('Card clicked!')}>
                <ZPCard.Header>
                  <ZPCard.Title>Clickable Card</ZPCard.Title>
                  <ZPCard.Description>Click anywhere on this card</ZPCard.Description>
                </ZPCard.Header>
                <ZPCard.Body>
                  <p className='text-sm text-muted-foreground'>
                    This entire card is clickable and has focus states.
                  </p>
                </ZPCard.Body>
              </ZPCard>
            </div>
          </section>

          {/* Inputs */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Form Inputs</h2>

            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Input Components</ZPCard.Title>
                <ZPCard.Description>Various input types with validation states</ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <ZPInput
                      label='Full Name'
                      placeholder='Enter your full name'
                      description='This will be displayed on your profile'
                      required
                    />

                    <ZPEmailInput label='Email Address' placeholder='you@example.com' required />

                    <ZPPasswordInput
                      label='Password'
                      placeholder='Enter your password'
                      description='Must be at least 8 characters'
                      required
                    />
                  </div>

                  <div className='space-y-4'>
                    <ZPInput
                      label='Success State'
                      placeholder='Valid input'
                      success='This looks good!'
                      defaultValue='valid@example.com'
                    />

                    <ZPInput
                      label='Error State'
                      placeholder='Invalid input'
                      error='This field is required'
                    />

                    <ZPInput
                      label='With Icon'
                      placeholder='Search...'
                      leftIcon={<Settings className='h-4 w-4' />}
                    />
                  </div>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>

          {/* Badges */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Badges</h2>

            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Badge Variants</ZPCard.Title>
                <ZPCard.Description>Status tags and HealCoin badges</ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='space-y-4'>
                  <div className='flex flex-wrap gap-2'>
                    <ZPBadge variant='default'>Default</ZPBadge>
                    <ZPBadge variant='success'>Success</ZPBadge>
                    <ZPBadge variant='warning'>Warning</ZPBadge>
                    <ZPBadge variant='danger'>Danger</ZPBadge>
                    <ZPBadge variant='info'>Info</ZPBadge>
                    <ZPBadge variant='outline'>Outline</ZPBadge>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <ZPHealCoinBadge>1,250 HC</ZPHealCoinBadge>
                    <ZPCarbonBadge>-15 kg CO₂</ZPCarbonBadge>
                    <ZPEnergyBadge>Solar Power</ZPEnergyBadge>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <ZPBadge size='sm'>Small</ZPBadge>
                    <ZPBadge size='md'>Medium</ZPBadge>
                    <ZPBadge size='lg'>Large</ZPBadge>
                  </div>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>

          {/* Modal */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Modal</h2>

            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Modal Component</ZPCard.Title>
                <ZPCard.Description>Focus-trapped, ARIA-labeled modal dialogs</ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='flex gap-3'>
                  <ZPButton onClick={modal.openModal}>Open Modal</ZPButton>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>

          {/* Typography */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-semibold'>Typography</h2>

            <ZPCard>
              <ZPCard.Header>
                <ZPCard.Title>Font Hierarchy</ZPCard.Title>
                <ZPCard.Description>Poppins for headings, Inter for body text</ZPCard.Description>
              </ZPCard.Header>
              <ZPCard.Body>
                <div className='space-y-4'>
                  <h1 className='text-4xl font-bold'>Heading 1 - 36px</h1>
                  <h2 className='text-3xl font-semibold'>Heading 2 - 30px</h2>
                  <h3 className='text-2xl font-semibold'>Heading 3 - 24px</h3>
                  <h4 className='text-xl font-medium'>Heading 4 - 20px</h4>
                  <h5 className='text-lg font-medium'>Heading 5 - 18px</h5>
                  <h6 className='text-base font-medium'>Heading 6 - 16px</h6>
                  <p className='text-base'>Body text - 16px (Inter font family)</p>
                  <p className='text-sm text-muted-foreground'>Small text - 14px</p>
                  <code className='text-sm bg-muted px-2 py-1 rounded'>
                    Code text (Roboto Mono)
                  </code>
                </div>
              </ZPCard.Body>
            </ZPCard>
          </section>
        </div>

        {/* Domain-Specific Components */}
        <section className='space-y-8'>
          <div>
            <h2 className='text-3xl font-bold text-foreground mb-2'>Domain Components</h2>
            <p className='text-muted-foreground'>Specialized components for ZeroPrint ecosystem</p>
          </div>

          {/* Wallet Card */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-foreground'>Wallet Card</h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <WalletCard
                balance={1250.75}
                walletAddress='0x1234567890abcdef1234567890abcdef12345678'
                isConnected={true}
                onAddFunds={() => alert('Add funds clicked')}
                onDisconnect={() => alert('Disconnect clicked')}
              />
              <WalletCard
                balance={0}
                isConnected={false}
                onConnect={() => alert('Connect wallet clicked')}
              />
            </div>
          </div>

          {/* Leaderboard */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-foreground'>Leaderboard</h3>
            <LeaderboardList
              entries={[
                {
                  id: '1',
                  name: 'Alice Johnson',
                  score: 15420,
                  rank: 1,
                  change: 2,
                  category: 'carbon',
                  location: 'San Francisco, CA',
                },
                {
                  id: '2',
                  name: 'Bob Smith',
                  score: 14890,
                  rank: 2,
                  change: -1,
                  category: 'overall',
                  location: 'New York, NY',
                },
                {
                  id: '3',
                  name: 'Carol Davis',
                  score: 13750,
                  rank: 3,
                  change: 1,
                  category: 'mental-health',
                  location: 'Austin, TX',
                },
                {
                  id: 'current',
                  name: 'You',
                  score: 12100,
                  rank: 5,
                  change: 3,
                  category: 'animal-welfare',
                  location: 'Seattle, WA',
                },
              ]}
              currentUserId='current'
              showCategory={true}
              maxEntries={5}
            />
          </div>

          {/* Game Cards */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-foreground'>Game Cards</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <GameCard
                type='challenge'
                title='Carbon Reduction Challenge'
                description='Reduce your carbon footprint by 20% this month through sustainable practices.'
                category='carbon'
                difficulty='medium'
                status='available'
                reward={{ amount: 500, type: 'tokens' }}
                timeLimit={{
                  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  isExpired: false,
                }}
                onStart={() => alert('Challenge started!')}
              />
              <GameCard
                type='achievement'
                title='Mindfulness Master'
                description='Complete 30 days of meditation tracking to unlock this achievement.'
                category='mental-health'
                difficulty='hard'
                status='in-progress'
                progress={{ current: 18, total: 30, unit: 'days' }}
                reward={{ amount: 1000, type: 'points' }}
                onView={() => alert('View progress')}
              />
              <GameCard
                type='quest'
                title='Community Hero'
                description='Help 5 community members with their environmental goals.'
                category='community'
                difficulty='easy'
                status='completed'
                reward={{ amount: 750, type: 'tokens' }}
                onClaim={() => alert('Reward claimed!')}
              />
            </div>
          </div>

          {/* Tracker Cards */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-foreground'>Tracker Cards</h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <TrackerCard
                type='carbon'
                title='Carbon Footprint'
                description='Track your daily carbon emissions'
                metrics={[
                  {
                    label: 'Daily Emissions',
                    value: 12.5,
                    unit: 'kg CO₂',
                    change: { value: -2.3, period: 'vs yesterday', isPositive: true },
                    target: 10,
                  },
                  {
                    label: 'Monthly Total',
                    value: 385,
                    unit: 'kg CO₂',
                    change: { value: -45, period: 'vs last month', isPositive: true },
                  },
                ]}
                overallScore={{ value: 78, maxValue: 100, label: 'Carbon Score' }}
                trend='improving'
                lastUpdated={new Date(Date.now() - 2 * 60 * 60 * 1000)}
                onViewDetails={() => alert('View carbon details')}
                onAddEntry={() => alert('Add carbon entry')}
              />
              <TrackerCard
                type='mental-health'
                title='Mental Wellness'
                description='Monitor your mental health journey'
                metrics={[
                  {
                    label: 'Mood Score',
                    value: 7.8,
                    unit: '/10',
                    change: { value: 0.5, period: 'vs last week', isPositive: true },
                  },
                  {
                    label: 'Meditation',
                    value: 25,
                    unit: 'minutes',
                    target: 30,
                  },
                ]}
                overallScore={{ value: 85, maxValue: 100, label: 'Wellness Score' }}
                trend='stable'
                lastUpdated={new Date(Date.now() - 6 * 60 * 60 * 1000)}
                onViewDetails={() => alert('View wellness details')}
                onAddEntry={() => alert('Add wellness entry')}
              />
            </div>
          </div>
        </section>

        {/* Modal Example */}
        <ZPModal
          isOpen={modal.isOpen}
          onClose={modal.closeModal}
          title='Example Modal'
          description='This is a demonstration of the ZPModal component with focus trapping and accessibility features.'
          size='md'
        >
          <ZPModal.Body>
            <div className='space-y-4'>
              <p>This modal demonstrates:</p>
              <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
                <li>Focus trapping (try pressing Tab)</li>
                <li>Escape key to close</li>
                <li>Click outside to close</li>
                <li>Proper ARIA labels</li>
                <li>Scroll prevention</li>
              </ul>

              <ZPInput label='Test Input' placeholder='Try tabbing through the modal' />
            </div>
          </ZPModal.Body>
          <ZPModal.Footer>
            <ZPButton variant='outline' onClick={modal.closeModal}>
              Cancel
            </ZPButton>
            <ZPButton onClick={modal.closeModal}>Confirm</ZPButton>
          </ZPModal.Footer>
        </ZPModal>
      </div>
    </ThemeProvider>
  );
}
