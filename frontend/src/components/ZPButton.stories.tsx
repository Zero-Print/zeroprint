import type { Meta, StoryObj } from '@storybook/react';
import { ZPButton } from './ZPButton';
import { Plus, Download, Heart, Settings } from 'lucide-react';

const meta: Meta<typeof ZPButton> = {
  title: 'Components/ZPButton',
  component: ZPButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile button component with multiple variants, sizes, and states for the ZeroPrint design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default button
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// All variants
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// All sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Plus className='h-4 w-4' />,
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const DisabledOutline: Story = {
  args: {
    variant: 'outline',
    disabled: true,
    children: 'Disabled Outline',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Download className='mr-2 h-4 w-4' />
        Download
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <Settings className='h-4 w-4' />,
  },
};

export const HeartButton: Story = {
  args: {
    variant: 'ghost',
    children: (
      <>
        <Heart className='mr-2 h-4 w-4' />
        Like
      </>
    ),
  },
};

// Size comparison
export const SizeComparison: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <ZPButton size='sm'>Small</ZPButton>
      <ZPButton size='md'>Default</ZPButton>
      <ZPButton size='lg'>Large</ZPButton>
      <ZPButton size='icon'>
        <Plus className='h-4 w-4' />
      </ZPButton>
    </div>
  ),
};

// Variant comparison
export const VariantComparison: Story = {
  render: () => (
    <div className='flex flex-wrap gap-4'>
      <ZPButton variant='primary'>Default</ZPButton>
      <ZPButton variant='danger'>Danger</ZPButton>
      <ZPButton variant='outline'>Outline</ZPButton>
      <ZPButton variant='secondary'>Secondary</ZPButton>
      <ZPButton variant='ghost'>Ghost</ZPButton>
      <ZPButton variant='success'>Success</ZPButton>
    </div>
  ),
};
