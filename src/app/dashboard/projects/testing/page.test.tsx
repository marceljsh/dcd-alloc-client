import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectsPage from '../page';

// Mock ResizeObserver karena tidak ada di lingkungan JSDOM
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock useRouter untuk menguji navigasi
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock semua komponen yang diimpor dari shadcn/ui
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }) => <input {...props} data-testid="input" />,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children, ...props }: { children: React.ReactNode }) => <label {...props}>{children}</label>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>---</div>,
  // Mock yang lebih baik untuk DropdownMenuTrigger agar getByRole dapat menemukan tombol dengan nama 'Open menu'
  DropdownMenuTrigger: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  // Mock yang lebih baik untuk DialogTrigger agar getByRole dapat menemukan tombol
  DialogTrigger: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock komponen custom
jest.mock('@/components/project/AddProjectForm', () => ({
  AddProjectForm: ({ onCancel }) => (
    <div data-testid="add-project-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock('@/components/ProjectTimeline', () => {
  return jest.fn(() => <div data-testid="project-timeline">Mocked Project Timeline</div>);
});

// Mock data proyek
jest.mock('@/data/projects.json', () => [
  { "code": "P-001", "name": "Project Alpha", "team": "DMA", "category": "Big", "priority": "Critical", "crew": 5, "budgetCode": "BC-001", "budget": 100000, "startDate": "2023-01-01", "endDate": "2023-12-31" },
  { "code": "P-002", "name": "Project Beta", "team": "NCM", "category": "Medium", "priority": "Medium", "crew": 3, "budgetCode": "BC-002", "budget": 50000, "startDate": "2023-02-01", "endDate": "2023-11-30" },
]);

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => '[]'),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });


describe('ProjectsPage', () => {
  const mockProjects = [
    { "code": "P-001", "name": "Project Alpha", "team": "DMA", "category": "Big", "priority": "Critical", "crew": 5, "budgetCode": "BC-001", "budget": 100000, "startDate": "2023-01-01", "endDate": "2023-12-31" },
    { "code": "P-002", "name": "Project Beta", "team": "NCM", "category": "Medium", "priority": "Medium", "crew": 3, "budgetCode": "BC-002", "budget": 50000, "startDate": "2023-02-01", "endDate": "2023-11-30" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tes 1: Memastikan komponen dirender dengan benar
  it('should render the projects page with the correct title and stats', () => {
    render(<ProjectsPage />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Big Sized Projects')).toBeInTheDocument();
  });

  // Tes 2: Memastikan tabel data proyek dirender
  it('should render the projects data table', () => {
    render(<ProjectsPage />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  // Tes 3: Memastikan fungsionalitas pencarian bekerja
  it('should filter projects based on search input', async () => {
    render(<ProjectsPage />);
    const searchInput = screen.getByPlaceholderText('Search projects...');
    
    await userEvent.type(searchInput, 'Alpha');
    
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
  });

  // Tes 4: Memastikan fungsionalitas filter kategori bekerja
  it('should filter projects by category', async () => {
    render(<ProjectsPage />);
    const categoryFilter = screen.getByRole('button', { name: /Category/i });
    await userEvent.click(categoryFilter);
    
    const bigCategory = screen.getByRole('checkbox', { name: 'Big' });
    await userEvent.click(bigCategory);
    
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
    });
  });

  // Tes 5: Memastikan dialog "Add Project" dapat dibuka
  it('should open the add project dialog when "Add Project" button is clicked', async () => {
    render(<ProjectsPage />);
    const addButton = screen.getByRole('button', { name: /Add Project/i });
    await userEvent.click(addButton);
    
    expect(screen.getByText('Add New Project')).toBeInTheDocument();
    expect(screen.getByTestId('add-project-form')).toBeInTheDocument();
  });

  // Tes 6: Memastikan fungsionalitas "Archive" bekerja dengan benar
  it('should archive a project and navigate to archive page', async () => {
    render(<ProjectsPage />);
    
    const projectActions = screen.getAllByRole('button', { name: /Open menu/i });
    await userEvent.click(projectActions[0]);
    
    const archiveButton = screen.getByRole('menuitem', { name: /Archive/i });
    await userEvent.click(archiveButton);
    
    // Periksa apakah localStorage dipanggil
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'archivedProjects',
      JSON.stringify([mockProjects[0]])
    );
    
    // Periksa apakah proyek dihapus dari daftar
    expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
    
    // Periksa apakah toast notifikasi muncul
    expect(toast.success).toHaveBeenCalledWith('Project "Project Alpha" has been archived.');
    
    // Periksa apakah router.push dipanggil untuk navigasi
    expect(mockPush).toHaveBeenCalledWith('/dashboard/archive');
  });

  // Tes 7: Memastikan dialog "View Timeline" dapat dibuka
  it('should open the timeline dialog when "View Timeline" is clicked', async () => {
    render(<ProjectsPage />);
    const projectActions = screen.getAllByRole('button', { name: /Open menu/i });
    await userEvent.click(projectActions[0]);
    
    const timelineButton = screen.getByRole('menuitem', { name: /View Timeline/i });
    await userEvent.click(timelineButton);
    
    expect(screen.getByText(/Timeline: Project Alpha/i)).toBeInTheDocument();
    expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
  });
});
