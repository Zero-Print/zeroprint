import type { Meta, StoryObj } from '@storybook/react';
import { TrackerCard } from './TrackerCard';

const meta: Meta<typeof TrackerCard> = {
  title: 'Components/TrackerCard',
  component: TrackerCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile tracker card component for displaying various sustainability metrics with interactive controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['carbon', 'mental-health', 'animal-welfare', 'digital-twin'],
      description: 'The type of tracker which determines the icon and color scheme',
    },
    title: {
      control: 'text',
      description: 'The main title of the tracker card',
    },
    overallScore: { control: 'object', description: 'Overall score object' },
    metrics: {
      control: 'object',
      description: 'Array of metric objects to display in the grid',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    type: 'carbon',
    title: 'Carbon Footprint',
    overallScore: { value: 85, maxValue: 100, label: 'Eco Score' },
    metrics: [
      {
        label: 'CO₂ Saved',
        value: 245,
        unit: 'kg',
      },
      {
        label: 'Actions',
        value: 12,
        unit: 'this week',
      },
      {
        label: 'Streak',
        value: 7,
        unit: 'days',
      },
      {
        label: 'Savings',
        value: 1250,
        unit: '₹',
      },
    ],
    trend: 'improving',
    lastUpdated: new Date(),
  },
};

// Mental Health variant
export const MentalHealth: Story = {
  args: {
    type: 'mental-health',
    title: 'Mental Wellness',
    overallScore: { value: 78, maxValue: 100, label: 'Wellness Score' },
    metrics: [
      {
        label: 'Mood',
        value: 8,
        unit: '/10',
      },
      {
        label: 'Anxiety',
        value: 3,
        unit: '/10',
      },
      {
        label: 'Sleep',
        value: 7.5,
        unit: 'hrs',
      },
      {
        label: 'Activities',
        value: 5,
        unit: 'today',
      },
    ],
    trend: 'improving',
    lastUpdated: new Date(),
  },
};

// Animal Welfare variant
export const AnimalWelfare: Story = {
  args: {
    type: 'animal-welfare',
    title: 'Animal Kindness',
    overallScore: { value: 92, maxValue: 100, label: 'Kindness Score' },
    metrics: [
      {
        label: 'Actions',
        value: 18,
        unit: 'this month',
      },
      {
        label: 'Animals Helped',
        value: 6,
        unit: 'total',
      },
      {
        label: 'Coins Earned',
        value: 450,
        unit: 'ZP',
      },
      {
        label: 'Streak',
        value: 12,
        unit: 'days',
      },
    ],
    trend: 'improving',
    lastUpdated: new Date(),
  },
};

// Digital Twin variant
export const DigitalTwin: Story = {
  args: {
    type: 'digital-twin',
    title: 'Digital Twin Simulations',
    overallScore: { value: 88, maxValue: 100, label: 'Avg Feasibility' },
    metrics: [
      {
        label: 'CO₂ Saved',
        value: 1250,
        unit: 'kg',
      },
      {
        label: 'Energy Saved',
        value: 2400,
        unit: 'kWh',
      },
      {
        label: 'Cost Saved',
        value: 15000,
        unit: '₹',
      },
      {
        label: 'Simulations',
        value: 8,
        unit: 'completed',
      },
    ],
    trend: 'improving',
    lastUpdated: new Date(),
  },
};

// Low Score variant
export const LowScore: Story = {
  args: {
    ...Default.args,
    overallScore: { value: 35, maxValue: 100, label: 'Eco Score' },
    metrics: [
      {
        label: 'CO₂ Saved',
        value: 12,
        unit: 'kg',
      },
      {
        label: 'Actions',
        value: 2,
        unit: 'this week',
      },
      {
        label: 'Streak',
        value: 0,
        unit: 'days',
      },
      {
        label: 'Savings',
        value: 50,
        unit: '₹',
      },
    ],
    trend: 'declining',
    lastUpdated: new Date(),
  },
};

// High Score variant
export const HighScore: Story = {
  args: {
    ...Default.args,
    overallScore: { value: 98, maxValue: 100, label: 'Eco Score' },
    metrics: [
      {
        label: 'CO₂ Saved',
        value: 2500,
        unit: 'kg',
      },
      {
        label: 'Actions',
        value: 45,
        unit: 'this week',
      },
      {
        label: 'Streak',
        value: 30,
        unit: 'days',
      },
      {
        label: 'Savings',
        value: 12500,
        unit: '₹',
      },
    ],
    trend: 'improving',
    lastUpdated: new Date(),
  },
};
