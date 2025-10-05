import React from 'react';
import {
  render,
  screen,
  createUser,
  expectToBeVisible,
  expectToBeDisabled,
} from '@/lib/test-utils';
import { ZPButton } from '../ZPButton';

describe('ZPButton', () => {
  it('renders with default props', () => {
    render(<ZPButton>Click me</ZPButton>);
    const button = screen.getByRole('button', { name: /click me/i });
    expectToBeVisible(button);
    expect(button).toHaveClass('bg-[var(--zp-primary-green)]', 'text-white');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<ZPButton variant='danger'>Delete</ZPButton>);

    let button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-[var(--zp-danger)]', 'text-white');

    rerender(<ZPButton variant='outline'>Outline</ZPButton>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border', 'bg-background');

    rerender(<ZPButton variant='ghost'>Ghost</ZPButton>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<ZPButton size='sm'>Small</ZPButton>);

    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8', 'px-3');

    rerender(<ZPButton size='lg'>Large</ZPButton>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-11', 'px-6');

    rerender(<ZPButton size='icon'>Icon</ZPButton>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('handles disabled state', () => {
    render(<ZPButton disabled>Disabled</ZPButton>);

    const button = screen.getByRole('button', { name: /disabled/i });
    expectToBeDisabled(button);
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('handles click events', async () => {
    const user = createUser();
    const handleClick = jest.fn();

    render(<ZPButton onClick={handleClick}>Click me</ZPButton>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = createUser();
    const handleClick = jest.fn();

    render(
      <ZPButton disabled onClick={handleClick}>
        Disabled
      </ZPButton>
    );

    const button = screen.getByRole('button', { name: /disabled/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<ZPButton className='custom-class'>Custom</ZPButton>);

    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('renders with ref and is accessible', () => {
    render(<ZPButton data-testid='ref-button'>Ref test</ZPButton>);

    const button = screen.getByTestId('ref-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Ref test');
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders with custom props', () => {
    render(<ZPButton data-testid='custom-button'>Custom</ZPButton>);

    const button = screen.getByTestId('custom-button');
    expectToBeVisible(button);
    expect(button).toHaveAttribute('data-testid', 'custom-button');
  });

  it('supports keyboard navigation', async () => {
    const user = createUser();
    const handleClick = jest.fn();

    render(<ZPButton onClick={handleClick}>Keyboard test</ZPButton>);

    const button = screen.getByRole('button', { name: /keyboard test/i });
    button.focus();

    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
