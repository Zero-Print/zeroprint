'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { ZPCard } from './ZPCard';

const meta = {
  title: 'UI/ZPCard',
  component: ZPCard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ZPCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: (
      <div className='p-6'>
        <h3 className='text-lg font-semibold mb-2'>Card Title</h3>
        <p className='text-sm text-gray-600'>Card content goes here.</p>
      </div>
    ),
  },
};


