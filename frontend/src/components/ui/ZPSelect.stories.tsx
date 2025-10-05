import type { Meta, StoryObj } from '@storybook/react';
import { ZPSelect } from './ZPSelect';

const meta: Meta<typeof ZPSelect> = {
  title: 'Components/ZPSelect',
  component: ZPSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4 (Disabled)', disabled: true },
];

export const Default: Story = {
  args: {
    label: 'Select an option',
    options: sampleOptions,
    placeholder: 'Choose an option...',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'in', label: 'India' },
    ],
    description: 'Select your country of residence',
    placeholder: 'Select country',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Field',
    options: sampleOptions,
    error: 'This field is required',
    required: true,
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Validated Field',
    options: sampleOptions,
    success: 'Great choice!',
    value: 'option2',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    options: sampleOptions,
    disabled: true,
    value: 'option1',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ZPSelect
        label="Small"
        size="sm"
        options={sampleOptions}
        placeholder="Small select"
      />
      <ZPSelect
        label="Medium (Default)"
        size="md"
        options={sampleOptions}
        placeholder="Medium select"
      />
      <ZPSelect
        label="Large"
        size="lg"
        options={sampleOptions}
        placeholder="Large select"
      />
    </div>
  ),
};