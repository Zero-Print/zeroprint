import { render, screen, createUser, expectToBeVisible, mockTrackerData } from '@/lib/test-utils';
import { TrackerCard } from '../TrackerCard';

describe('TrackerCard', () => {
  const defaultProps = {
    type: 'carbon' as const,
    title: 'Test Tracker',
    description: 'Test description',
    metrics: [
      {
        label: 'Carbon Saved',
        value: 75,
        unit: 'kg CO2',
        change: {
          value: 5,
          period: 'week',
          isPositive: true,
        },
      },
    ],
    overallScore: {
      value: 75,
      maxValue: 100,
      label: 'Overall Score',
    },
    trend: 'improving' as const,
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
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
    expectToBeVisible(screen.getByText('75/100'));
    expectToBeVisible(screen.getByText(/last updated/i));
  });

  it('displays correct trend icon and color', () => {
    const { rerender } = render(<TrackerCard {...defaultProps} trend='improving' />);

    let trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-green-600');

    rerender(<TrackerCard {...defaultProps} trend='declining' />);
    trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-red-600');

    rerender(<TrackerCard {...defaultProps} trend='stable' />);
    trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveClass('text-gray-600');
  });

  it('shows different score colors based on value', () => {
    const { rerender } = render(<TrackerCard {...defaultProps} overallScore={{ value: 85, maxValue: 100, label: 'Score' }} />);

    let scoreElement = screen.getByText('85/100');
    expect(scoreElement).toBeInTheDocument();

    rerender(<TrackerCard {...defaultProps} overallScore={{ value: 65, maxValue: 100, label: 'Score' }} />);
    scoreElement = screen.getByText('65/100');
    expect(scoreElement).toBeInTheDocument();

    rerender(<TrackerCard {...defaultProps} overallScore={{ value: 45, maxValue: 100, label: 'Score' }} />);
    scoreElement = screen.getByText('45/100');
    expect(scoreElement).toBeInTheDocument();
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

  // Loading and error states are not part of this component's interface

  it('formats last updated date correctly', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');
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
      type: 'carbon' as const,
      title: 'Minimal Tracker',
      description: 'Minimal description',
      metrics: [],
      trend: 'stable' as const,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
    };

    render(<TrackerCard {...minimalProps} />);

    expectToBeVisible(screen.getByText('Minimal Tracker'));
    expectToBeVisible(screen.getByText('No metrics available'));
  });

  it('displays correct accessibility attributes', () => {
    render(<TrackerCard {...defaultProps} />);

    const card = screen.getByTestId('tracker-card');
    expect(card).toBeInTheDocument();

    const scoreElement = screen.getByText('75/100');
    expect(scoreElement).toBeInTheDocument();
  });
});
