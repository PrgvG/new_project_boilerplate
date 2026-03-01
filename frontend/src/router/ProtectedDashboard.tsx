import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/authState';
import { Dashboard } from '../pages/Dashboard';

export function ProtectedDashboard() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Dashboard />;
}
