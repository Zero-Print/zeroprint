'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { ZPButton } from './ZPButton';

const meta = {
  title: 'UI/ZPButton',
  component: ZPButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
  },
} satisfies Meta<typeof ZPButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Icon: Story = { args: { variant: 'icon' } };


