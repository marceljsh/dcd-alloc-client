import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from '../OriGantt'; // Pastikan path ini sesuai dengan lokasi file Anda

describe('Gantt Chart Component', () => {

  // Test case 1: Memastikan komponen dirender dengan benar
  test('should display "Nothing to display" when no projects or roles are selected', async () => {
    render(<Component />);
    
    // 1. Klik tombol dropdown Project untuk membukanya.
    fireEvent.click(screen.getByTestId('project-filter-dropdown'));

    const projectCheckboxes = await screen.findAllByRole('checkbox', { name: /Project/i });
    
    projectCheckboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    fireEvent.click(screen.getByTestId('project-filter-dropdown'));

    // 5. Ulangi proses yang sama untuk dropdown Role.
    fireEvent.click(screen.getByTestId('role-filter-dropdown'));
    const roleCheckboxes = await screen.findAllByRole('checkbox');
    
    roleCheckboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });

    // 6. Tunggu hingga elemen "Nothing to display." muncul.
    // Pastikan untuk menunggu perubahan UI.
    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument();
    });
});

  // Test case 2: Memastikan filter proyek berfungsi dengan benar
  test('should filter tasks by project', async () => {
    render(<Component />);

    fireEvent.click(screen.getByTestId('project-filter-dropdown'));

    // Klik item filter "Project Alpha" (asumsi id 1)
    const projectAlphaCheckbox = screen.getByTestId('project-filter-item-1');
    fireEvent.click(projectAlphaCheckbox);

    // Periksa apakah tasks yang terkait dengan Project Alpha (misal: 'Requirements Gathering') muncul
    await waitFor(() => {
      expect(screen.getByTestId('task-bar-0')).toBeInTheDocument();
      // Periksa apakah tasks dari project lain tidak muncul (misal: 'Data Analysis' dari Project Beta)
      expect(screen.queryByTestId('task-bar-6')).not.toBeInTheDocument();
    });
  });

  // Test case 3: Memastikan filter peran berfungsi dengan benar
  test('should filter employees and tasks by role', async () => {
    render(<Component />);

    // Klik tombol filter peran
    fireEvent.click(screen.getByTestId('role-filter-dropdown'));

    // Hapus filter peran "Software Engineer"
    const softwareEngineerCheckbox = screen.getByTestId('role-filter-item-Software-Engineer');
    fireEvent.click(softwareEngineerCheckbox);
    
    // Tunggu hingga update UI selesai
    await waitFor(() => {
      // Periksa apakah nama karyawan dengan peran Software Engineer tidak lagi ditampilkan
      expect(screen.queryByTestId('employee-row-3')).not.toBeInTheDocument(); // Carol Davis (id 3)
      expect(screen.queryByTestId('employee-row-4')).not.toBeInTheDocument(); // David Wilson (id 4)
      
      // Periksa apakah tugas terkait juga tidak ada
      expect(screen.queryByTestId('task-bar-4')).not.toBeInTheDocument(); // 'API Development'
      
      // Periksa apakah karyawan dan tugas dari peran lain masih ada
      expect(screen.getByTestId('employee-row-1')).toBeInTheDocument(); // Alice Johnson
      expect(screen.getByTestId('task-bar-1')).toBeInTheDocument(); // 'Requirements Gathering'
    });
  });

  // Test case 4: Memastikan tooltip tugas berfungsi
  test('should show tooltip on task bar hover', async () => {
    render(<Component />);

    // Temukan bar tugas
    const taskBar = screen.getByTestId('task-bar-1');

    // Arahkan kursor ke task bar
    fireEvent.mouseEnter(taskBar);

    // Tunggu sampai tooltip muncul
    await waitFor(() => {
      const tooltip = screen.getByTestId('task-tooltip-1');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Requirements Gathering');
      expect(tooltip).toHaveTextContent('8 story points');
    });
  });

  // Test case 5: Memastikan pesan "Nothing to display" muncul ketika semua filter tidak dipilih
  test('should show empty state when no projects or roles are selected', async () => {
    render(<Component />);
    
    // Nonaktifkan semua proyek
    fireEvent.click(screen.getByTestId('project-filter-dropdown'));
    const allProjectCheckboxes = screen.getAllByTestId(/project-filter-item/i);
    allProjectCheckboxes.forEach(checkbox => fireEvent.click(checkbox));

    // Nonaktifkan semua peran
    fireEvent.click(screen.getByTestId('role-filter-dropdown'));
    const allRoleCheckboxes = screen.getAllByTestId(/role-filter-item/i);
    allRoleCheckboxes.forEach(checkbox => fireEvent.click(checkbox));

    await waitFor(() => {
      expect(screen.getByTestId('empty-state-message')).toBeInTheDocument();
    });
  });
});