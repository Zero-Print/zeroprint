import type { Meta, StoryObj } from '@storybook/react';
import { ZPCard } from './ZPCard';
import { ZPButton } from './ZPButton';
import { Heart, Star, TrendingUp, Users } from 'lucide-react';

const meta: Meta<typeof ZPCard> = {
  title: 'Components/ZPCard',
  component: ZPCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible card component that serves as a container for various content types in the ZeroPrint design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the card',
    },
    children: {
      control: 'text',
      description: 'The content to display inside the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Default: Story = {
  args: {
    children: (
      <div className='p-6'>
        <h3 className='text-lg font-semibold mb-2'>Card Title</h3>
        <p className='text-gray-600'>This is a basic card with some content inside.</p>
      </div>
    ),
  },
};

// Card with header and footer
export const WithHeaderAndFooter: Story = {
  args: {
    children: (
      <>
        <div className='p-6 border-b'>
          <h3 className='text-lg font-semibold'>Card Header</h3>
          <p className='text-sm text-gray-500'>Subtitle or description</p>
        </div>
        <div className='p-6'>
          <p className='text-gray-600 mb-4'>
            This card has a distinct header and footer section with a border separator.
          </p>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Item 1</span>
              <span className='font-medium'>Value 1</span>
            </div>
            <div className='flex justify-between'>
              <span>Item 2</span>
              <span className='font-medium'>Value 2</span>
            </div>
          </div>
        </div>
        <div className='p-6 border-t bg-gray-50'>
          <div className='flex justify-end space-x-2'>
            <ZPButton variant='outline' size='sm'>
              Cancel
            </ZPButton>
            <ZPButton size='sm'>Save</ZPButton>
          </div>
        </div>
      </>
    ),
  },
};

// Stats card
export const StatsCard: Story = {
  args: {
    children: (
      <div className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Monthly Stats</h3>
          <TrendingUp className='h-5 w-5 text-green-500' />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>1,234</div>
            <div className='text-sm text-gray-500'>Total Users</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>89%</div>
            <div className='text-sm text-gray-500'>Success Rate</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>456</div>
            <div className='text-sm text-gray-500'>New Signups</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>₹12.5K</div>
            <div className='text-sm text-gray-500'>Revenue</div>
          </div>
        </div>
      </div>
    ),
  },
};

// Profile card
export const ProfileCard: Story = {
  args: {
    children: (
      <div className='p-6'>
        <div className='flex items-center space-x-4 mb-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold'>
            JD
          </div>
          <div>
            <h3 className='font-semibold'>John Doe</h3>
            <p className='text-sm text-gray-500'>Software Engineer</p>
          </div>
        </div>
        <div className='space-y-2 mb-4'>
          <div className='flex items-center text-sm text-gray-600'>
            <Users className='h-4 w-4 mr-2' />
            <span>Team Lead</span>
          </div>
          <div className='flex items-center text-sm text-gray-600'>
            <Star className='h-4 w-4 mr-2' />
            <span>4.8 Rating</span>
          </div>
        </div>
        <ZPButton className='w-full' size='sm'>
          View Profile
        </ZPButton>
      </div>
    ),
  },
};

// Action card
export const ActionCard: Story = {
  args: {
    children: (
      <div className='p-6 text-center'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Heart className='h-8 w-8 text-red-500' />
        </div>
        <h3 className='text-lg font-semibold mb-2'>Support a Cause</h3>
        <p className='text-gray-600 mb-4'>
          Help make a difference by supporting environmental initiatives in your community.
        </p>
        <div className='space-y-2'>
          <ZPButton className='w-full'>Donate Now</ZPButton>
          <ZPButton variant='outline' className='w-full'>
            Learn More
          </ZPButton>
        </div>
      </div>
    ),
  },
};

// Compact card
export const CompactCard: Story = {
  args: {
    children: (
      <div className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='font-medium'>Quick Action</h4>
            <p className='text-sm text-gray-500'>Perform this action</p>
          </div>
          <ZPButton size='sm'>Go</ZPButton>
        </div>
      </div>
    ),
  },
};

// Custom styled card
export const CustomStyled: Story = {
  args: {
    className: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
    children: (
      <div className='p-6'>
        <h3 className='text-lg font-semibold text-blue-900 mb-2'>Custom Styled Card</h3>
        <p className='text-blue-700'>
          This card has custom styling applied through the className prop.
        </p>
      </div>
    ),
  },
};

// Card grid example
export const CardGrid: Story = {
  render: () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl'>
      <ZPCard>
        <div className='p-4 text-center'>
          <div className='text-2xl font-bold text-green-600'>245</div>
          <div className='text-sm text-gray-500'>CO₂ Saved (kg)</div>
        </div>
      </ZPCard>
      <ZPCard>
        <div className='p-4 text-center'>
          <div className='text-2xl font-bold text-blue-600'>1,234</div>
          <div className='text-sm text-gray-500'>Energy Saved (kWh)</div>
        </div>
      </ZPCard>
      <ZPCard>
        <div className='p-4 text-center'>
          <div className='text-2xl font-bold text-purple-600'>₹5,678</div>
          <div className='text-sm text-gray-500'>Money Saved</div>
        </div>
      </ZPCard>
    </div>
  ),
};
