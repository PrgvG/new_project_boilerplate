import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../contexts/authState';
import { ProtectedDashboard } from './ProtectedDashboard';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../pages/Dashboard', () => ({
  Dashboard: () => <div>Dashboard content</div>,
}));

function renderWithAuth(value: {
  isLoading: boolean;
  isAuthenticated: boolean;
}) {
  return render(
    <AuthContext.Provider
      value={{
        ...value,
        user: value.isAuthenticated
          ? {
              _id: '1',
              email: 'a@b.com',
              createdAt: '',
              updatedAt: '',
            }
          : null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      }}
    >
      <ProtectedDashboard />
    </AuthContext.Provider>
  );
}

describe('ProtectedDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading when isLoading is true', () => {
    renderWithAuth({ isLoading: true, isAuthenticated: false });
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument();
  });

  it('calls navigate to /login when not loading and not authenticated', () => {
    renderWithAuth({ isLoading: false, isAuthenticated: false });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument();
  });

  it('renders Dashboard when authenticated', () => {
    renderWithAuth({ isLoading: false, isAuthenticated: true });
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
  });
});
