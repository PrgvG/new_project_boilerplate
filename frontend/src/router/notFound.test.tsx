import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('shows "Страница не найдена" and link to main', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/Страница не найдена/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /На главную/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
