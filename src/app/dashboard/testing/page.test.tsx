import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '../page';
import * as data from '@/lib/data';
import userEvent from '@testing-library/user-event';

// Mock the data functions as before
jest.mock('@/lib/data', () => ({
  getEmployees: jest.fn(() => [
    {
      id: "emp1",
      name: "Budi Santoso",
      role: "Software Engineer",
      team: "Team Alpha",
      level: "Senior",
      status: "Active",
    },
    {
      id: "emp2",
      name: "Siti Rahayu",
      role: "Data Scientist",
      team: "Team Alpha",
      level: "Middle",
      status: "Active",
    },
    {
      id: "emp3",
      name: "Joko Susanto",
      role: "Project Manager",
      team: "Team Beta",
      level: "Senior",
      status: "Active",
    },
  ]),
  getProjects: jest.fn(() => [
    {
      id: "proj1",
      name: "E-Commerce App",
      team: "Team Alpha",
      budget: 500000000,
      crew: 5,
      priority: "Critical",
      category: "Web Development",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      id: "proj2",
      name: "Data Analytics Platform",
      team: "Team Beta",
      budget: 350000000,
      crew: 3,
      priority: "High",
      category: "Data Science",
      startDate: "2024-03-01",
      endDate: "2024-11-30",
    },
  ]),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Memastikan komponen dirender dengan benar
  test('renders the dashboard with projects view by default', () => {
    render(<Page />);
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('dashboard-subtitle')).toHaveTextContent('Monitor project resources, utilization, and budget performance');
    expect(screen.getByTestId('view-projects-button')).toHaveClass('bg-black');
    expect(screen.getByTestId('view-resources-button')).toHaveClass('bg-white');
    expect(screen.getByTestId('chart-project-distribution')).toBeInTheDocument();
  });

  // Test Case 2: Menguji interaksi tombol view mode
  test('switches to resources view when the resources button is clicked', async () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('view-resources-button'));
    await waitFor(() => {
      expect(screen.getByTestId('view-resources-button')).toHaveClass('bg-black');
      expect(screen.getByTestId('view-projects-button')).toHaveClass('bg-white');
      expect(screen.getByTestId('chart-fte-workload')).toBeInTheDocument();
    });
  });

  // Test Case 3: Menguji fungsionalitas filter Role
  test('filters employees and updates charts when a role is selected', async () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('view-resources-button'));
    const roleFilterButton = await screen.findByTestId('role-filter-button');
    fireEvent.click(roleFilterButton);
    const seItem = await screen.findByTestId('role-filter-item-software-engineer');
    fireEvent.click(seItem);

    await waitFor(() => {
      expect(screen.getByTestId('role-filter-button')).toHaveTextContent('Role (1)');
      expect(screen.getByTestId('chart-fte-workload')).toBeInTheDocument();
    });
  });

  // Test Case 4: Menguji fungsionalitas filter Project
  test('filters projects and updates summary cards', async () => {
    render(<Page />);

    const projectFilterButton = await screen.findByTestId('project-filter-button');
    userEvent.click(projectFilterButton);
    const projectFilterItem = await screen.findAllByTestId(/project-filter-item/);
    userEvent.click(projectFilterItem[1]);
    
    await waitFor(() => {
      expect(screen.getByTestId('project-filter-button')).toHaveTextContent(/Project \(1\)/);
      const activeProjectsCard = screen.getByTestId('summary-card-active-projects');
      expect(activeProjectsCard).toHaveTextContent(/1/);
      expect(activeProjectsCard).toHaveTextContent(/Web Development/);

      const totalBudgetCard = screen.getByTestId('summary-card-total-budget');
      expect(totalBudgetCard).toHaveTextContent('Rp500.000.000');
    });
  });

  // Test Case 5: Memastikan ProjectTable merender 5 item atau kurang
  test('renders project table with a maximum of 5 projects', async () => {
    render(<Page />);
    
    // Tunggu sampai DOM merender konten tampilan "Projects" secara penuh
    // Ini mengonfirmasi bahwa seluruh blok kondisional telah dieksekusi
    await screen.findByText('Project Distribution by Priority');

    // Sekarang, cari ProjectTable yang seharusnya sudah ada
    const projectList = screen.getByTestId('project-table');
    expect(projectList).toBeInTheDocument();

    const projects = screen.getAllByTestId(/project-list-item-/);
    expect(projects.length).toBeLessThanOrEqual(5);
  });
});