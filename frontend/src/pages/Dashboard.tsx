import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/authState';
import { apiJson } from '../api/client';
import { isUserArray } from '../types/guards';
import { HealthStatusBar, fetchHealth } from '../modules/health';
import type { DbStatus } from '../modules/health';

function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiJson('/api/users', {}, isUserArray),
  });
}

function useApiMessageQuery() {
  return useQuery({
    queryKey: ['apiMessage'],
    queryFn: async () => {
      const res = await fetch('/api');
      const data = (await res.json()) as { message: string };
      return data.message;
    },
  });
}

function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const usersQuery = useUsersQuery();
  const messageQuery = useApiMessageQuery();
  const healthQuery = useHealthQuery();

  const dbStatus: DbStatus = healthQuery.isPending
    ? 'checking'
    : healthQuery.data?.database === 'connected'
      ? 'connected'
      : 'disconnected';

  const onRefresh = () => {
    usersQuery.refetch();
    messageQuery.refetch();
    healthQuery.refetch();
  };

  const loading = usersQuery.isPending;
  const error = usersQuery.error
    ? usersQuery.error instanceof Error
      ? usersQuery.error.message
      : 'Не удалось загрузить пользователей'
    : null;
  const users = usersQuery.data ?? [];
  const message = messageQuery.data ?? '';

  return (
    <div className="app">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1>template</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {user.email}
              {user.name ? ` (${user.name})` : ''}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Выйти
          </button>
        </div>
      </div>
      <p>React + TypeScript + Vite</p>

      <HealthStatusBar dbStatus={dbStatus} onRefresh={onRefresh} />

      {message && <p>Backend message: {message}</p>}

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <a
          href="http://localhost:8081"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500',
          }}
        >
          Открыть веб-морду MongoDB (Mongo Express)
        </a>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Пользователи из MongoDB</h2>
        {loading && <p>Загрузка пользователей...</p>}
        {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
        {!loading && !error && (
          <>
            {users.length === 0 ? (
              <p>Пользователей пока нет в базе данных</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map(u => (
                  <li
                    key={u._id}
                    style={{
                      padding: '1rem',
                      margin: '0.5rem 0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <strong>Email:</strong> {u.email}
                    {u.name && (
                      <>
                        <br />
                        <strong>Имя:</strong> {u.name}
                      </>
                    )}
                    <br />
                    <small style={{ color: '#666' }}>
                      Создан: {new Date(u.createdAt).toLocaleString('ru-RU')}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
