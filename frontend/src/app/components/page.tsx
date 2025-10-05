'use client';

import React, { useState } from 'react';
import { ZPSelect } from '@/components/ui/ZPSelect';
import { ZPTextArea } from '@/components/ui/ZPTextArea';
import { ZPCheckbox } from '@/components/ui/ZPCheckbox';
import { ZPRadio } from '@/components/ui/ZPRadio';
import { ZPAvatar, ZPAvatarGroup } from '@/components/ui/ZPAvatar';
import { ZPToast, useZPToast, ZPToastContainer } from '@/components/ui/ZPToast';
import { ZPSkeleton, ZPSkeletonCard, ZPSkeletonText } from '@/components/ui/ZPSkeleton';
import { ZPNav, ZPBreadcrumb } from '@/components/ui/ZPNav';
import { ChartCard } from '@/components/ui/ChartCard';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ui/ZPButton';

export default function ComponentsShowcase() {
  const [selectValue, setSelectValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  const { toasts, toast } = useZPToast();

  const selectOptions = [
    { value: 'option1', label: 'ZeroPrint Platform' },
    { value: 'option2', label: 'Carbon Tracking' },
    { value: 'option3', label: 'Mental Health' },
    { value: 'option4', label: 'Animal Welfare' },
  ];

  const radioOptions = [
    { value: 'citizen', label: 'Citizen', description: 'Individual sustainability tracking' },
    { value: 'school', label: 'School/MSME', description: 'Educational or business sustainability' },
    { value: 'government', label: 'Government', description: 'Municipal sustainability management' },
  ];

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', active: true, icon: '🏠' },
    { label: 'Carbon Tracker', href: '/carbon', icon: '🌱' },
    { label: 'Mental Health', href: '/mental-health', icon: '🧠' },
    { label: 'Animal Welfare', href: '/animal-welfare', icon: '🐾' },
    { label: 'Rewards', href: '/rewards', icon: '🎁', badge: '3' },
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Showcase', active: true },
  ];

  const chartData = [
    { month: 'Jan', carbon: 120, energy: 80 },
    { month: 'Feb', carbon: 95, energy: 85 },
    { month: 'Mar', carbon: 88, energy: 92 },
    { month: 'Apr', carbon: 75, energy: 88 },
    { month: 'May', carbon: 65, energy: 95 },
    { month: 'Jun', carbon: 58, energy: 98 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">ZeroPrint Design System</h1>
          <p className="text-muted-foreground">Comprehensive component showcase</p>
          <ZPBreadcrumb items={breadcrumbItems} className="justify-center mt-4" />
        </div>

        {/* Navigation */}
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title>Navigation Components</ZPCard.Title>
          </ZPCard.Header>
          <ZPCard.Body>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Horizontal Navigation</h4>
                <ZPNav items={navItems} orientation="horizontal" variant="pills" />
              </div>
              <div>
                <h4 className="font-medium mb-3">Vertical Navigation</h4>
                <ZPNav items={navItems} orientation="vertical" variant="sidebar" className="max-w-xs" />
              </div>
            </div>
          </ZPCard.Body>
        </ZPCard>

        {/* Form Components */}
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title>Form Components</ZPCard.Title>
          </ZPCard.Header>
          <ZPCard.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ZPSelect
                  label="Select Platform Feature"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Choose a feature..."
                  description="Select which ZeroPrint feature you're interested in"
                />
                
                <ZPTextArea
                  label="Feedback"
                  placeholder="Share your thoughts about ZeroPrint..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  maxLength={200}
                  description="Help us improve our platform"
                />
              </div>
              
              <div className="space-y-4">
                <ZPCheckbox
                  label="Subscribe to sustainability updates"
                  checked={isChecked}
                  onChange={setIsChecked}
                  description="Get weekly tips and platform updates"
                />
                
                <ZPRadio
                  name="userType"
                  label="User Type"
                  options={radioOptions}
                  value={radioValue}
                  onChange={setRadioValue}
                  description="This helps us personalize your experience"
                />
              </div>
            </div>
          </ZPCard.Body>
        </ZPCard>

        {/* Avatar Components */}
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title>Avatar Components</ZPCard.Title>
          </ZPCard.Header>
          <ZPCard.Body>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <ZPAvatar alt="User 1" size="sm" fallback="U1" status="online" />
                <ZPAvatar alt="User 2" size="md" fallback="U2" status="away" />
                <ZPAvatar alt="User 3" size="lg" fallback="U3" status="busy" />
                <ZPAvatar alt="User 4" size="xl" fallback="U4" status="offline" />
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Avatar Group</h4>
                <ZPAvatarGroup max={3}>
                  <ZPAvatar alt="Member 1" fallback="M1" />
                  <ZPAvatar alt="Member 2" fallback="M2" />
                  <ZPAvatar alt="Member 3" fallback="M3" />
                  <ZPAvatar alt="Member 4" fallback="M4" />
                  <ZPAvatar alt="Member 5" fallback="M5" />
                </ZPAvatarGroup>
              </div>
            </div>
          </ZPCard.Body>
        </ZPCard>

        {/* Toast & Skeleton */}
        <ZPCard>
          <ZPCard.Header>
            <ZPCard.Title>Interactive Components</ZPCard.Title>
          </ZPCard.Header>
          <ZPCard.Body>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Toast Notifications</h4>
                <div className="flex flex-wrap gap-2">
                  <ZPButton size="sm" onClick={() => toast.success('Carbon tracking updated!')}>
                    Success Toast
                  </ZPButton>
                  <ZPButton size="sm" variant="outline" onClick={() => toast.error('Connection failed')}>
                    Error Toast
                  </ZPButton>
                  <ZPButton size="sm" variant="outline" onClick={() => toast.warning('Low HealCoins balance')}>
                    Warning Toast
                  </ZPButton>
                  <ZPButton size="sm" variant="outline" onClick={() => toast.info('New sustainability tips available')}>
                    Info Toast
                  </ZPButton>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Loading Skeletons</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <ZPButton 
                    size="sm" 
                    onClick={() => setShowSkeleton(!showSkeleton)}
                    variant={showSkeleton ? 'outline' : 'primary'}
                  >
                    {showSkeleton ? 'Hide' : 'Show'} Loading State
                  </ZPButton>
                </div>
                
                {showSkeleton ? (
                  <div className="space-y-4">
                    <ZPSkeletonCard />
                    <ZPSkeletonText lines={3} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ZPCard className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <ZPAvatar alt="User" fallback="U" size="sm" />
                        <div>
                          <p className="font-medium">ZeroPrint User</p>
                          <p className="text-sm text-muted-foreground">Sustainability Champion</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        This week I've reduced my carbon footprint by 15kg CO₂ through sustainable 
                        transportation choices and earned 250 HealCoins!
                      </p>
                    </ZPCard>
                  </div>
                )}
              </div>
            </div>
          </ZPCard.Body>
        </ZPCard>

        {/* Chart Components */}
        <ChartCard
          title="Carbon Footprint Reduction"
          description="Monthly progress tracking your sustainability journey"
          data={chartData}
          dataKey="carbon"
          xAxisKey="month"
          type="line"
          color="#2E7D32"
          actions={
            <ZPButton size="sm" variant="outline">
              Export Data
            </ZPButton>
          }
        />
      </div>

      {/* Toast Container */}
      <ZPToastContainer toasts={toasts} position="top-right" />
    </div>
  );
}