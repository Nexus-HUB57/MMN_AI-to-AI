# Estágio de build para o Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Estágio de build para o Backend
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Estágio final de produção
FROM node:22-alpine
WORKDIR /app

# Instalar Redis (opcional, se não usar container separado)
RUN apk add --no-cache redis

# Copiar builds
COPY --from=frontend-builder /app/frontend/dist ./public
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY database ./database

# Instalar dependências de produção do backend
WORKDIR /app/backend
RUN npm install --production

# Expor portas
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar
CMD ["node", "dist/index.js"]
