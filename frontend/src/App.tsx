import { useEffect, useState } from 'react';

interface User {
  _id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthStatus {
  status: string;
  message: string;
  database?: string;
}

function App() {
  const [message, setMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<
    'connected' | 'disconnected' | 'checking'
  >('checking');
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Функция для проверки статуса
    const checkHealth = () => {
      fetch('/health')
        .then(res => {
          if (!res.ok) {
            throw new Error('Health check failed');
          }
          return res.json();
        })
        .then((data: HealthStatus) => {
          if (data.database === 'connected') {
            setDbStatus('connected');
          } else {
            setDbStatus('disconnected');
          }
        })
        .catch(err => {
          console.error('Error checking health:', err);
          setDbStatus('disconnected');
        });
    };

    // Проверяем сразу
    checkHealth();

    // Проверяем каждые 5 секунд
    const interval = setInterval(checkHealth, 5000);

    // Получаем сообщение от API
    fetch('/api')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error fetching message:', err));

    // Загружаем пользователей
    loadUsers();

    return () => clearInterval(interval);
  }, []);

  // Функция для загрузки пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Функция для создания пользователя
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSubmitSuccess(true);
      setFormData({ email: '', name: '' });
      // Обновляем список пользователей
      await loadUsers();
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <h1>Pirmoney2</h1>
      <p>React + TypeScript + Vite</p>

      {/* Индикатор статуса MongoDB */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500',
          backgroundColor:
            dbStatus === 'connected'
              ? '#d4edda'
              : dbStatus === 'disconnected'
                ? '#f8d7da'
                : '#fff3cd',
          color:
            dbStatus === 'connected'
              ? '#155724'
              : dbStatus === 'disconnected'
                ? '#721c24'
                : '#856404',
          border: `1px solid ${
            dbStatus === 'connected'
              ? '#c3e6cb'
              : dbStatus === 'disconnected'
                ? '#f5c6cb'
                : '#ffeaa7'
          }`,
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor:
              dbStatus === 'connected'
                ? '#28a745'
                : dbStatus === 'disconnected'
                  ? '#dc3545'
                  : '#ffc107',
            display: 'inline-block',
            animation:
              dbStatus === 'checking'
                ? 'pulse 1.5s ease-in-out infinite'
                : 'none',
          }}
        />
        <span>
          MongoDB:{' '}
          {dbStatus === 'connected'
            ? '✅ Подключен'
            : dbStatus === 'disconnected'
              ? '❌ Отключен'
              : '⏳ Проверка...'}
        </span>
      </div>

      {message && <p>Backend message: {message}</p>}

      {/* Ссылка на веб-морду MongoDB */}
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
          🔗 Открыть веб-морду MongoDB (Mongo Express)
        </a>
      </div>

      {/* Форма для добавления пользователя */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          maxWidth: '500px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Добавить пользователя</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Email <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="name"
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Имя (необязательно)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>
          {submitError && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
              }}
            >
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
              }}
            >
              ✅ Пользователь успешно добавлен!
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: submitting ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Добавление...' : 'Добавить пользователя'}
          </button>
        </form>
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
                {users.map(user => (
                  <li
                    key={user._id}
                    style={{
                      padding: '1rem',
                      margin: '0.5rem 0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <strong>Email:</strong> {user.email}
                    {user.name && (
                      <>
                        <br />
                        <strong>Имя:</strong> {user.name}
                      </>
                    )}
                    <br />
                    <small style={{ color: '#666' }}>
                      Создан: {new Date(user.createdAt).toLocaleString('ru-RU')}
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

export default App;
