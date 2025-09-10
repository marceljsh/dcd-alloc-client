import React from 'react';
import { render, screen } from '@testing-library/react';
import ResourcesLoading from '../loading';

describe('ResourcesLoading', () => {
  it('should render the loading spinner with a status role', () => {
    // Render komponen ke dalam DOM
    render(<ResourcesLoading />);

    // Mencari elemen spinner berdasarkan role-nya
    const spinner = screen.getByRole('status');

    // Memastikan elemen spinner ada di dokumen
    expect(spinner).toBeInTheDocument();
  });
});
