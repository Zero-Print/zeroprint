import type { Meta, StoryObj } from '@storybook/react';
import { CarbonTracker } from './CarbonTracker';

type CarbonLog = {
  logId: string;
  userId: string;
  categoryId: string;
  actionType: string;
  co2Saved: number;
  value: number;
  unit: string;
  date: string;
  createdAt: string;
  metadata?: Record<string, any>;
};
type CarbonCategory = {
  categoryId: string;
  name: string;
  co2Factor: number;
  maxDailyValue: number;
  unit: string;
  description: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
};
type CarbonStats = {
  userId: string;
  totalCo2Saved: number;
  totalCoinsEarned: number;
  totalActions: number;
  streakDays: number;
  lastActionDate: string;
  categoryBreakdown: Record<string, any>;
  monthlyStats: Array<{ month: string; co2Saved: number; actions: number; coinsEarned: number }>;
  updatedAt: string;
};

const meta: Meta<typeof CarbonTracker> = {
  title: 'Trackers/CarbonTracker',
  component: CarbonTracker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive carbon footprint tracker that allows users to log eco-friendly actions and monitor their environmental impact.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Tracker aggregated data' },
    onAddLog: {
      action: 'log added',
      description: 'Callback when a new log is added',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleCategories: CarbonCategory[] = [
  {
    categoryId: 'transport',
    name: 'Transportation',
    co2Factor: 0.21,
    maxDailyValue: 100,
    unit: 'km',
    description: 'Walking, cycling, or using public transport',
    icon: '🚶',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    categoryId: 'energy',
    name: 'Energy Saving',
    co2Factor: 0.85,
    maxDailyValue: 50,
    unit: 'kWh',
    description: 'Using renewable energy or reducing consumption',
    icon: '⚡',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    categoryId: 'waste',
    name: 'Waste Reduction',
    co2Factor: 0.5,
    maxDailyValue: 10,
    unit: 'kg',
    description: 'Recycling, composting, or reducing waste',
    icon: '♻️',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const sampleLogs: CarbonLog[] = [
  {
    logId: 'log1',
    userId: 'user1',
    categoryId: 'transport',
    actionType: 'Walked to work',
    co2Saved: 5.2,
    value: 25,
    unit: 'km',
    date: '2024-01-15',
    createdAt: '2024-01-15T08:00:00Z',
    metadata: {
      distance: 25,
      duration: 30,
      weather: 'sunny',
    },
  },
  {
    logId: 'log2',
    userId: 'user1',
    categoryId: 'energy',
    actionType: 'Used solar power',
    co2Saved: 12.8,
    value: 15,
    unit: 'kWh',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:00:00Z',
    metadata: {
      energySaved: 15,
      cost: 120,
    },
  },
  {
    logId: 'log3',
    userId: 'user1',
    categoryId: 'waste',
    actionType: 'Composted organic waste',
    co2Saved: 2.5,
    value: 5,
    unit: 'kg',
    date: '2024-01-14',
    createdAt: '2024-01-14T18:00:00Z',
    metadata: {
      wasteType: 'organic',
      composted: true,
    },
  },
];

const sampleStats: CarbonStats = {
  userId: 'user1',
  totalCo2Saved: 245.7,
  totalCoinsEarned: 1234,
  totalActions: 45,
  streakDays: 7,
  lastActionDate: '2024-01-15',
  categoryBreakdown: {
    transport: {
      co2Saved: 125.3,
      actions: 20,
      coinsEarned: 626,
    },
    energy: {
      co2Saved: 89.2,
      actions: 15,
      coinsEarned: 446,
    },
    waste: {
      co2Saved: 31.2,
      actions: 10,
      coinsEarned: 162,
    },
  },
  monthlyStats: [
    {
      month: '2024-01',
      co2Saved: 245.7,
      actions: 45,
      coinsEarned: 1234,
    },
    {
      month: '2023-12',
      co2Saved: 189.3,
      actions: 38,
      coinsEarned: 947,
    },
  ],
  updatedAt: '2024-01-15T12:00:00Z',
};

// Default story
export const Default: Story = {
  args: {
    data: {
      totalCo2Saved: sampleStats.totalCo2Saved,
      totalCoinsEarned: sampleStats.totalCoinsEarned,
      totalLogs: sampleStats.totalActions,
      streakDays: sampleStats.streakDays,
      lastLogDate: sampleStats.updatedAt,
      categoryBreakdown: {
        transport: {
          co2Saved: sampleStats.categoryBreakdown.transport?.co2Saved || 0,
          logs: sampleStats.categoryBreakdown.transport?.actions || 0,
        },
        energy: {
          co2Saved: sampleStats.categoryBreakdown.energy?.co2Saved || 0,
          logs: sampleStats.categoryBreakdown.energy?.actions || 0,
        },
        waste: {
          co2Saved: sampleStats.categoryBreakdown.waste?.co2Saved || 0,
          logs: sampleStats.categoryBreakdown.waste?.actions || 0,
        },
        water: { co2Saved: 0, logs: 0 },
      },
      monthlyStats: sampleStats.monthlyStats.map(m => ({
        month: m.month,
        co2Saved: m.co2Saved,
        logs: m.actions,
        coinsEarned: m.coinsEarned,
      })),
    },
  },
};

// High activity user
export const HighActivity: Story = {
  args: {
    data: {
      totalCo2Saved: 1250.5,
      totalCoinsEarned: 6252,
      totalLogs: 125,
      streakDays: 30,
      lastLogDate: new Date().toISOString(),
      categoryBreakdown: {
        transport: { co2Saved: 600, logs: 60 },
        energy: { co2Saved: 500, logs: 40 },
        waste: { co2Saved: 150, logs: 25 },
        water: { co2Saved: 0, logs: 0 },
      },
      monthlyStats: [
        { month: '2024-01', co2Saved: 1250.5, logs: 125, coinsEarned: 6252 },
        { month: '2023-12', co2Saved: 947.3, logs: 90, coinsEarned: 4200 },
      ],
    },
  },
};

// New user with minimal data
export const NewUser: Story = {
  args: {
    data: {
      totalCo2Saved: 2.1,
      totalCoinsEarned: 10,
      totalLogs: 1,
      streakDays: 1,
      lastLogDate: '2024-01-15T08:00:00Z',
      categoryBreakdown: {
        transport: { co2Saved: 2.1, logs: 1 },
        energy: { co2Saved: 0, logs: 0 },
        waste: { co2Saved: 0, logs: 0 },
        water: { co2Saved: 0, logs: 0 },
      },
      monthlyStats: [{ month: '2024-01', co2Saved: 2.1, logs: 1, coinsEarned: 10 }],
    },
  },
};

// No data state
export const NoData: Story = {
  args: {
    data: {
      totalCo2Saved: 0,
      totalCoinsEarned: 0,
      totalLogs: 0,
      streakDays: 0,
      lastLogDate: '2024-01-15T00:00:00Z',
      categoryBreakdown: {
        transport: { co2Saved: 0, logs: 0 },
        energy: { co2Saved: 0, logs: 0 },
        waste: { co2Saved: 0, logs: 0 },
        water: { co2Saved: 0, logs: 0 },
      },
      monthlyStats: [],
    },
  },
};
