import React from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock providers for testing
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid='mock-providers'>{children}</div>;
};

// Custom render function
const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: MockProviders, ...options });
};

// User event setup
const createUser = () => userEvent.setup();

// Mock data generators
export const mockTrackerData = {
  carbon: {
    id: 'carbon-1',
    type: 'carbon' as const,
    title: 'Carbon Footprint',
    description: 'Track your environmental impact',
    score: 75,
    trend: 'up' as const,
    lastUpdated: new Date().toISOString(),
    logs: [
      {
        id: 'log-1',
        category: 'transport',
        activity: 'Car trip',
        amount: 25.5,
        unit: 'kg CO2',
        date: new Date().toISOString(),
      },
    ],
    categories: [
      { name: 'transport', total: 150.5, percentage: 45 },
      { name: 'energy', total: 120.3, percentage: 35 },
      { name: 'food', total: 67.2, percentage: 20 },
    ],
    stats: {
      totalEmissions: 338,
      monthlyAverage: 112.7,
      yearlyProjection: 1352,
      reductionGoal: 20,
    },
  },
  mentalHealth: {
    id: 'mental-1',
    type: 'mental-health' as const,
    title: 'Mental Health',
    description: 'Track your wellbeing journey',
    score: 82,
    trend: 'up' as const,
    lastUpdated: new Date().toISOString(),
    entries: [
      {
        id: 'entry-1',
        mood: 8,
        energy: 7,
        stress: 3,
        sleep: 8,
        notes: 'Feeling great today!',
        date: new Date().toISOString(),
      },
    ],
    insights: [
      'Your mood has improved by 15% this week',
      'Consider maintaining your current sleep schedule',
    ],
    goals: [
      { id: 'goal-1', title: 'Meditate daily', completed: true },
      { id: 'goal-2', title: 'Exercise 3x per week', completed: false },
    ],
  },
  animalWelfare: {
    id: 'animal-1',
    type: 'animal-welfare' as const,
    title: 'Animal Welfare',
    description: 'Track rescue and adoption efforts',
    score: 90,
    trend: 'up' as const,
    lastUpdated: new Date().toISOString(),
    rescues: [
      {
        id: 'rescue-1',
        animalType: 'dog',
        name: 'Buddy',
        status: 'adopted',
        rescueDate: new Date().toISOString(),
        adoptionDate: new Date().toISOString(),
      },
    ],
    adoptions: [
      {
        id: 'adoption-1',
        animalId: 'rescue-1',
        adopterName: 'John Doe',
        adoptionDate: new Date().toISOString(),
        followUpDate: new Date().toISOString(),
      },
    ],
    impact: {
      totalRescues: 25,
      successfulAdoptions: 22,
      adoptionRate: 88,
      averageRescueTime: 14,
    },
  },
  digitalTwin: {
    id: 'digital-1',
    type: 'digital-twin' as const,
    title: 'Digital Twin',
    description: 'Manage digital simulations',
    score: 78,
    trend: 'stable' as const,
    lastUpdated: new Date().toISOString(),
    simulations: [
      {
        id: 'sim-1',
        name: 'Climate Model',
        status: 'running',
        progress: 65,
        startTime: new Date().toISOString(),
        estimatedCompletion: new Date().toISOString(),
      },
    ],
    results: [
      {
        id: 'result-1',
        simulationId: 'sim-1',
        name: 'Temperature Analysis',
        completedAt: new Date().toISOString(),
        accuracy: 94.5,
        insights: ['Temperature increase of 2.1°C projected'],
      },
    ],
    templates: [
      { id: 'template-1', name: 'Climate Model', category: 'Environment' },
      { id: 'template-2', name: 'Traffic Flow', category: 'Urban Planning' },
    ],
  },
};

// Test assertions helpers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled();
};

export const expectToBeEnabled = (element: HTMLElement) => {
  expect(element).toBeEnabled();
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, createUser };
