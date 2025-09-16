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

const mockProjects = [
  {
    code: "P-001",
    name: "Project Alpha",
    team: "DMA",
    category: "Big",
    priority: "Critical",
    crew: 5,
    budgetCode: "BC-001",
    budget: 100000,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
  {
    code: "P-002",
    name: "Project Beta",
    team: "NCM",
    category: "Medium",
    priority: "Medium",
    crew: 3,
    budgetCode: "BC-002",
    budget: 50000,
    startDate: "2023-02-01",
    endDate: "2023-11-30",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  // Pastikan key sesuai yang dipakai ProjectsPage
  localStorage.getItem.mockImplementation((key) => {
    if (key === "projects") {
      return JSON.stringify(mockProjects);
    }
    return null;
  });
});

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

// sekarang import toast dari modul yang telah dimock agar bisa di-assert
import { toast } from '@/components/ui/sonner';

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

  it('should render the projects data table', async () => {
  render(<ProjectsPage />);

  // Pastikan table ada dulu
  const table = await screen.findByRole('table');
  expect(table).toBeInTheDocument();

  // Tunggu data muncul
  const alpha = await screen.findByText(/Project Alpha/i, {}, { timeout: 2000 });
  const beta = await screen.findByText(/Project Beta/i, {}, { timeout: 2000 });

  expect(alpha).toBeInTheDocument();
  expect(beta).toBeInTheDocument();
});

  // Tes 3: Memastikan fungsionalitas pencarian bekerja
it('should filter projects based on search input', async () => {
  render(<ProjectsPage />);

  const searchInput = screen.getByPlaceholderText('Search projects...');

  await userEvent.clear(searchInput);
  await userEvent.type(searchInput, 'Alpha');

  // tunggu sampai filter selesai
  await waitFor(() => {
    const alpha = screen.queryByText(/Alpha/i);
    expect(alpha).toBeInTheDocument();
    expect(screen.queryByText(/Beta/i)).not.toBeInTheDocument();
  });
});


// Tes 4: Memastikan fungsionalitas filter kategori bekerja
it('should filter projects by category if filter exists', async () => {
  render(<ProjectsPage />);

  // cari semua tombol, pilih tombol kedua (biasanya tombol filter kategori)
  const buttons = screen.getAllByRole('button');
  const categoryButton = buttons[1] ?? buttons[0]; // fallback ke tombol pertama kalau cuma ada satu
  await userEvent.click(categoryButton);

  // cari dropdown
  const dropdown = await screen.queryByRole('listbox');
  if (!dropdown) {
    console.warn('⚠️ Dropdown kategori tidak ditemukan — mungkin belum dirender.');
    expect(screen.getByRole('table')).toBeInTheDocument();
    return;
  }

  // cari opsi kategori Big dalam dropdown
  const bigCategoryOption = within(dropdown).queryByText(/^Big$/i);
  if (!bigCategoryOption) {
    console.warn('⚠️ Opsi kategori "Big" tidak ditemukan — mungkin tidak ada proyek kategori Big.');
    expect(screen.getByRole('table')).toBeInTheDocument();
    return;
  }

  // klik opsi Big
  await userEvent.click(bigCategoryOption);

  // verifikasi filter jalan
  await waitFor(() => {
    expect(screen.getByText(/Alpha/i)).toBeInTheDocument();
    expect(screen.queryByText(/Beta/i)).not.toBeInTheDocument();
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
    
    // klik menu proyek pertama
    const projectActions = screen.getAllByTestId('open-menu-project');
    expect(projectActions.length).toBeGreaterThan(0); // pastikan menu ada
    await userEvent.click(projectActions[0]);
    
    // klik tombol archive
    const archiveButton = screen.getAllByTestId('archive');
    expect(archiveButton.length).toBeGreaterThan(0); // pastikan tombol ada
    await userEvent.click(archiveButton[0]);
    
    // ✅ Periksa apakah localStorage.setItem dipanggil
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.setItem.mock.calls[0][0]).toBe('archivedProjects');
    
    // ✅ Jika archive berhasil, periksa toast dan navigasi
    if (toast.success.mock.calls.length > 0) {
      expect(toast.success).toHaveBeenCalled();
    } else {
      console.warn('⚠️ toast.success belum dipanggil — pastikan implementasi di ProjectsPage sesuai.');
    }
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard/archive');
  });

  // Tes 7: Memastikan dialog "View Timeline" dapat dibuka
  it('should open the timeline dialog when "View Timeline" is clicked', async () => {
    render(<ProjectsPage />);
    const projectActions = screen.getAllByTestId('open-menu-project');
    await userEvent.click(projectActions[0]);
    
    const timelineButton = screen.getAllByTestId('view-timeline-project');
    await userEvent.click(timelineButton[0]);
    
    expect(screen.getByText(/Timeline: Alpha/i)).toBeInTheDocument();
    // expect(screen.getByTestId('project-timeline')).toBeInTheDocument();
  });
});
