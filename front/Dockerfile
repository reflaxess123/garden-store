# Используем Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая dev для сборки)
RUN npm ci --verbose

# Копируем исходный код (исключая .env через .dockerignore)
COPY . .

# Очищаем кеш Next.js
RUN rm -rf .next

# Проверяем наличие критических файлов
RUN ls -la src/shared/lib/utils.ts && \
    echo "Checking TypeScript config..." && \
    cat tsconfig.json | grep -A 5 -B 5 "paths"

# Собираем Next.js приложение
RUN npm run build

# Открываем порт 3000 (стандартный для Next.js)
EXPOSE 3000

# Запускаем Next.js в продакшн режиме
CMD ["npm", "start"] 