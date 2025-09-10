import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimelineLoading from '../loading';

describe('TimelineLoading', () => {
  it('should render the loading spinner', () => {
    // Render komponen
    render(<TimelineLoading />);

    // Mencari elemen spinner berdasarkan role atau atribut
    const spinner = screen.getByRole('status');

    // Memastikan elemen spinner ada di dokumen
    expect(spinner).toBeInTheDocument();

    // Memastikan elemen memiliki kelas CSS yang benar
    expect(spinner).toHaveClass('animate-spin');
  });
});