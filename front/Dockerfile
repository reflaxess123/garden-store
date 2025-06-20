# Используем Node.js 20 Alpine
FROM node:20-alpine

# Устанавливаем curl для health check
RUN apk add --no-cache curl

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая dev для сборки)
RUN npm ci --verbose

# Копируем исходный код (исключая .env через .dockerignore)
COPY . .

# Объявляем ARG для переменных сборки
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_URL=$BACKEND_URL

# Очищаем кеш Next.js
RUN rm -rf .next

# Собираем Next.js приложение
RUN npm run build

# Открываем порт 80
EXPOSE 80

# Запускаем Next.js на порту 80
CMD ["npm", "start", "--", "--port", "80"] 