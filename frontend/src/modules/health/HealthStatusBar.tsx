import type { DbStatus } from './types';

type HealthStatusBarProps = {
  dbStatus: DbStatus;
  onRefresh: () => void;
};

export function HealthStatusBar({ dbStatus, onRefresh }: HealthStatusBarProps) {
  return (
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
          ? 'Подключен'
          : dbStatus === 'disconnected'
            ? 'Отключен'
            : 'Проверка...'}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        style={{
          marginLeft: 'auto',
          padding: '0.25rem 0.5rem',
          cursor: 'pointer',
        }}
      >
        Обновить
      </button>
    </div>
  );
}
