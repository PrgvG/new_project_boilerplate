# Pirmoney2

Full-stack application with React frontend and Express backend.

## Structure

- `backend/` - Express server with TypeScript, Prisma, and MongoDB
- `frontend/` - React application with TypeScript
- `nginx/` - Nginx configuration
- `mongodb/` - MongoDB database (via Docker)

## Локальный хостинг

Есть два способа запуска приложения локально:

### Вариант 1: Локальная разработка (рекомендуется для разработки)

**Преимущества:**
- Быстрая перезагрузка при изменениях
- Легкая отладка
- Hot reload для frontend и backend

**Шаги:**

1. **Установка зависимостей:**
```bash
npm install
```

2. **Настройка переменных окружения:**
```bash
# Создать .env файл для backend
cp backend/env.example backend/.env
```

3. **Запуск MongoDB (только БД в Docker):**
```bash
# Используйте скрипт для удобства
./scripts/start-dev.sh

# Или вручную:
docker-compose -f docker-compose.dev.yml up -d mongodb
```

4. **Генерация Prisma Client:**
```bash
cd backend && npm run prisma:generate && cd ..
```

5. **Запуск приложения:**
```bash
# Запустить frontend и backend одновременно
npm run dev

# Или отдельно:
# Терминал 1:
cd backend && npm run dev

# Терминал 2:
cd frontend && npm run dev
```

**Доступ:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MongoDB: `localhost:27017`

---

### Вариант 2: Production-like окружение (Docker)

**Преимущества:**
- Полная изоляция окружения
- Идентично production
- Nginx для проксирования

**Шаги:**

1. **Запуск всех сервисов:**
```bash
# Используйте скрипт
./scripts/start-prod.sh

# Или вручную:
docker-compose up -d --build
```

2. **Проверка статуса:**
```bash
docker-compose ps
```

**Доступ:**
- Frontend (через Nginx): `http://localhost`
- Backend API: `http://localhost/api`
- Backend напрямую: `http://localhost:3001`
- Health check: `http://localhost/health`

**Управление:**
```bash
# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

---

### Database Setup

```bash
# Generate Prisma Client
cd backend && npm run prisma:generate

# Open Prisma Studio (database GUI)
cd backend && npm run prisma:studio
```

## Scripts

### NPM скрипты (корневая папка):
- `npm run dev` - Запустить frontend и backend в режиме разработки
- `npm run build` - Собрать frontend и backend для production
- `npm run lint` - Проверить код линтером
- `npm run format` - Форматировать код с Prettier

### Скрипты для запуска:
- `./scripts/start-dev.sh` - Запустить MongoDB для разработки
- `./scripts/start-prod.sh` - Запустить все сервисы в Docker

### Backend скрипты:
- `npm run dev` - Запустить в режиме разработки с hot reload
- `npm run build` - Собрать для production
- `npm run start` - Запустить production сборку
- `npm run prisma:generate` - Сгенерировать Prisma Client
- `npm run prisma:studio` - Открыть Prisma Studio (GUI для БД)
- `npm run prisma:migrate` - Запустить миграции

### Frontend скрипты:
- `npm run dev` - Запустить dev сервер (Vite)
- `npm run build` - Собрать для production
- `npm run preview` - Предпросмотр production сборки

