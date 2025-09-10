import { render, screen } from '@testing-library/react';
import TimelinePage from '../page';

// Mock komponen OriGantt
jest.mock('@/components/OriGantt', () => {
  // Pastikan 'data-testid' sudah ada
  return jest.fn(() => <div data-testid="gantt-chart-component">Gantt Chart Component</div>);
});

describe('TimelinePage', () => {
  it('should render the OriGantt component correctly', () => {
    render(<TimelinePage />);

    // Ganti getByRole dengan getByTestId untuk menemukan komponen mock
    const ganttChartComponent = screen.getByTestId('gantt-chart-component');

    expect(ganttChartComponent).toBeInTheDocument();
  });
});