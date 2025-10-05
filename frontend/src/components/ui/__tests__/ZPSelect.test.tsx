import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZPSelect } from '../ZPSelect';

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4 (Disabled)', disabled: true },
];

describe('ZPSelect', () => {
  it('renders correctly', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        placeholder="Choose an option"
      />
    );

    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('handles selection change', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText('Test Select');
    await user.selectOptions(select, 'option2');

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('displays error message', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays success message', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        success="Great choice!"
      />
    );

    expect(screen.getByText('Great choice!')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        disabled
      />
    );

    const select = screen.getByLabelText('Test Select');
    expect(select).toBeDisabled();
  });

  it('shows required indicator', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies correct accessibility attributes', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
        error="Error message"
        description="Helper text"
      />
    );

    const select = screen.getByLabelText('Test Select');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby');
  });

  it('renders disabled options correctly', () => {
    render(
      <ZPSelect
        label="Test Select"
        options={sampleOptions}
      />
    );

    const disabledOption = screen.getByRole('option', { name: 'Option 4 (Disabled)' });
    expect(disabledOption).toBeDisabled();
  });
});