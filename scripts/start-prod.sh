#!/bin/bash

# Скрипт для запуска production-like окружения в Docker

echo "🚀 Запуск production окружения в Docker..."

# Останавливаем dev MongoDB если запущен
if docker ps | grep -q template-mongodb-dev; then
  echo "🛑 Останавливаем dev MongoDB..."
  docker-compose -f docker-compose.dev.yml down
fi

# Запускаем все сервисы
echo "📦 Запускаем все сервисы..."
docker-compose up -d --build

echo "✅ Все сервисы запущены!"
echo ""
echo "📍 Доступ к приложению:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   Backend напрямую: http://localhost:3001"
echo "   Health check: http://localhost/health"
echo ""
echo "📊 Просмотр логов: docker-compose logs -f"
echo "🛑 Остановка: docker-compose down"

