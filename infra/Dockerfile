# ============================================================
# Dockerfile multi-stage do monorepo MMN_AI-to-AI
# Estrutura real: /frontend (React+Vite), /backend (tRPC+Drizzle),
#                 /database (schemas+migrations), /infra (config)
# Build deve ser executado a partir da RAIZ do repositório:
#   docker build -f infra/Dockerfile -t mmn-ai-to-ai .
# ============================================================

# ---------- Stage 1: build do Frontend (React + Vite) ----------
FROM node:22-alpine AS frontend-builder
WORKDIR /repo

# Manifests do workspace
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/

# Instala dependências do workspace frontend
RUN npm install --workspace frontend --include-workspace-root

# Código-fonte do frontend
COPY frontend ./frontend
COPY tsconfig*.json ./

# Build (gera frontend/dist)
RUN npm run build --workspace frontend

# ---------- Stage 2: build do Backend (tRPC + Drizzle) ----------
FROM node:22-alpine AS backend-builder
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

RUN npm install --workspace backend --include-workspace-root

# Backend + schemas/migrations compartilhados
COPY backend ./backend
COPY database ./database
COPY infra ./infra
COPY tsconfig*.json ./

# Build (gera backend/dist)
RUN npm run build --workspace backend

# ---------- Stage 3: imagem final de produção ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Manifests para instalar APENAS dependências de produção do backend
COPY backend/package.json ./backend/
COPY package.json ./

# Instala apenas prod deps do backend
WORKDIR /app/backend
RUN npm install --omit=dev --no-audit --no-fund

# Copia artefatos compilados
COPY --from=backend-builder /repo/backend/dist ./dist
COPY --from=backend-builder /repo/database ../database
COPY --from=backend-builder /repo/infra ../infra

# Frontend estático servido pelo backend (ou por reverse-proxy)
COPY --from=frontend-builder /repo/frontend/dist ../public

WORKDIR /app
EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "backend/dist/index.js"]
