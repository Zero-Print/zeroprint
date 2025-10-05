import { render, screen, createUser, expectToBeVisible, mockTrackerData } from '@/lib/test-utils';
import { TrackerCard } from '../TrackerCard';

describe('TrackerCard', () => {
  const defaultProps = {
    title: 'Test Tracker',
    description: 'Test description',
    score: 75,
    trend: 'up' as const,
    lastUpdated: '2024-01-15T10:00:00Z',
    onViewDetails: jest.fn(),
    onAddEntry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(<TrackerCard {...defaultProps} />);

    expectToBeVisible(screen.getByText('Test Tracker'));
    expectToBeVisible(screen.getByText('Test description'));
    expectToBeVisible(screen.getByText('75'));
    expectToBeVisible(screen.getByText(/last updated/i));
  });

  it('displays correct trend icon and color', () => {
    const { rerender } = render(<TrackerCard {...defaultProps} trend='up' />);

    let trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-green-600');

    rerender(<TrackerCard {...defaultProps} trend='down' />);
    trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-red-600');

    rerender(<TrackerCard {...defaultProps} trend='stable' />);
    trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-gray-600');
  });

  it('shows different score colors based on value', () => {
    const { rerender } = render(<TrackerCard {...defaultProps} score={85} />);

    let scoreElement = screen.getByText('85');
    expect(scoreElement).toHaveClass('text-green-600');

    rerender(<TrackerCard {...defaultProps} score={65} />);
    scoreElement = screen.getByText('65');
    expect(scoreElement).toHaveClass('text-yellow-600');

    rerender(<TrackerCard {...defaultProps} score={45} />);
    scoreElement = screen.getByText('45');
    expect(scoreElement).toHaveClass('text-red-600');
  });

  it('handles view details click', async () => {
    const user = createUser();
    const onViewDetails = jest.fn();

    render(<TrackerCard {...defaultProps} onViewDetails={onViewDetails} />);

    const viewButton = screen.getByRole('button', { name: /view details/i });
    await user.click(viewButton);

    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('handles add entry click', async () => {
    const user = createUser();
    const onAddEntry = jest.fn();

    render(<TrackerCard {...defaultProps} onAddEntry={onAddEntry} />);

    const addButton = screen.getByRole('button', { name: /add entry/i });
    await user.click(addButton);

    expect(onAddEntry).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<TrackerCard {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /add entry/i })).toBeDisabled();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load tracker data';
    render(<TrackerCard {...defaultProps} error={errorMessage} />);

    expectToBeVisible(screen.getByText(errorMessage));
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('formats last updated date correctly', () => {
    const testDate = '2024-01-15T10:30:00Z';
    render(<TrackerCard {...defaultProps} lastUpdated={testDate} />);

    // Should display relative time
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<TrackerCard {...defaultProps} className='custom-tracker' />);

    const card = screen.getByTestId('tracker-card');
    expect(card).toHaveClass('custom-tracker');
  });

  it('supports keyboard navigation', async () => {
    const user = createUser();
    const onViewDetails = jest.fn();

    render(<TrackerCard {...defaultProps} onViewDetails={onViewDetails} />);

    const viewButton = screen.getByRole('button', { name: /view details/i });
    viewButton.focus();

    expect(viewButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      title: 'Minimal Tracker',
      description: 'Minimal description',
      score: 50,
      trend: 'stable' as const,
      lastUpdated: '2024-01-15T10:00:00Z',
    };

    render(<TrackerCard {...minimalProps} />);

    expectToBeVisible(screen.getByText('Minimal Tracker'));
    expectToBeVisible(screen.getByText('50'));
  });

  it('displays correct accessibility attributes', () => {
    render(<TrackerCard {...defaultProps} />);

    const card = screen.getByTestId('tracker-card');
    expect(card).toHaveAttribute('role', 'article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Test Tracker'));

    const scoreElement = screen.getByText('75');
    expect(scoreElement).toHaveAttribute('aria-label', 'Score: 75 out of 100');
  });
});
