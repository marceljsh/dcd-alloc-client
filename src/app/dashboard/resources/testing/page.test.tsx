import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourcesPage from '../page';

// Mocking semua komponen eksternal untuk fokus hanya pada ResourcesPage
jest.mock('@/components/employee/AddEmployeeForm', () => ({
  AddEmployeeForm: ({ onSubmit, onCancel }) => (
    <form data-testid="add-employee-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ name: 'Test User', email: 'test@example.com', role: 'Software Engineer', level: '1', team: 'Squad A', status: 'Permanent' }); }}>
      <button data-testid="submit-add-form" type="submit">Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </form>
  ),
}));

jest.mock('@/components/employee/EmployeeHeatmap', () => {
  return jest.fn(() => <div data-testid="employee-heatmap">Mocked Employee Heatmap</div>);
});

// Mock modul data dan utilitas
jest.mock('@/data/employees.json', () => [
  { "id": 1, "name": "Budi Santoso", "email": "budi@example.com", "code": "ORG-12345", "role": "Software Engineer", "level": "3", "team": "Alpha", "status": "Permanent", "joinDate": "2020-01-15T00:00:00Z", "phone": "6281234567890", "location": "Jakarta" },
  { "id": 2, "name": "Siti Aminah", "email": "siti@example.com", "code": "CR-67890", "role": "Data Engineer", "level": "2", "team": "Beta", "status": "Contract", "joinDate": "2021-03-20T00:00:00Z", "phone": "6281987654321", "location": "Bandung", "contractStartDate": "2023-01-01T00:00:00Z", "contractEndDate": "2024-12-31T00:00:00Z" }
]);

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: jest.fn(),
  },
}));

// Mock komponen-komponen UI lainnya
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

// Tes utama untuk ResourcesPage
describe('ResourcesPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Mereset mock sebelum setiap tes untuk menghindari side effects
    jest.clearAllMocks();
  });

  // Tes 1: Memastikan komponen utama dirender
  it('should render the main page title and stats cards', () => {
    render(<ResourcesPage />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Manage your team members and their assignments')).toBeInTheDocument();
    expect(screen.getByText('Contract Resources')).toBeInTheDocument();
  });

  // Tes 2: Memastikan tabel ditampilkan secara default
  it('should display the table view by default', () => {
    render(<ResourcesPage />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  // Tes 3: Memastikan mode tampilan bisa diganti ke heatmap
  it('should switch view mode to heatmap when the button is clicked', async () => {
    render(<ResourcesPage />);
    
    // Pastikan tombol toggle ada dan dapat diakses
    const heatmapToggleButton = screen.getByRole('radio', { name: /Heatmap view/i });
    await user.click(heatmapToggleButton);

    // Memastikan tabel tidak ada dan heatmap ditampilkan
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByTestId('employee-heatmap')).toBeInTheDocument();
  });

  // Tes 4: Memastikan filter dapat diterapkan
  it('should filter employees by role', async () => {
    render(<ResourcesPage />);

    // Buka dropdown filter
    const roleFilterButton = screen.getByRole('button', { name: /Role/i });
    await user.click(roleFilterButton);

    // Klik opsi "Software Engineer"
    const softwareEngineerOption = screen.getByRole('menuitemcheckbox', { name: /Software Engineer/i });
    await user.click(softwareEngineerOption);

    // Tunggu tabel untuk diperbarui (jika perlu)
    await waitFor(() => {
      // Pastikan "Budi Santoso" (Software Engineer) ada
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      // Pastikan "Siti Aminah" (Data Engineer) tidak ada
      expect(screen.queryByText('Siti Aminah')).not.toBeInTheDocument();
    });
  });

  // Tes 5: Memastikan fungsionalitas pencarian
  it('should filter employees using the search input', async () => {
    render(<ResourcesPage />);

    const searchInput = screen.getByPlaceholderText('Search resources...');
    await user.type(searchInput, 'Siti');

    // Pastikan "Siti Aminah" ada setelah pencarian
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    // Pastikan "Budi Santoso" tidak ada
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
  });

});
