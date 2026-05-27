# ============================================================
# Dockerfile multi-stage do monorepo MMN_AI-to-AI (Nexus SaaS)
# Estrutura real: /frontend (React+Vite), /backend (tRPC+Drizzle),
#                 /database (schemas+migrations), /infra (config)
# Build a partir da RAIZ:
#   docker build -f infra/Dockerfile -t nexus-saas .
# ============================================================

# ---------- Stage 1: build do Frontend (React + Vite) ----------
FROM node:22-alpine AS frontend-builder
WORKDIR /repo

# Manifests do workspace
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/

# Instala dependências do workspace frontend
# (npm ci falha sem package-lock atualizado; usamos install com legacy peer deps
#  porque o workspace mobile tem dependências do Expo que não impactam o build do front)
RUN npm install --workspace frontend --include-workspace-root --legacy-peer-deps --no-audit --no-fund

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

# drizzle-orm é dependência runtime, garantida no package.json do backend
RUN npm install --workspace backend --include-workspace-root --legacy-peer-deps --no-audit --no-fund

# Backend + schemas/migrations compartilhados
COPY backend ./backend
COPY database ./database
COPY infra ./infra
COPY tsconfig*.json ./

# Build (gera backend/dist via esbuild)
RUN npm run build --workspace backend

# ---------- Stage 3: imagem final de produção ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Manifests para instalar APENAS dependências de produção do backend
COPY backend/package.json ./backend/
COPY package.json ./

# Instala apenas prod deps do backend (ignorando workspaces para evitar mobile/expo)
WORKDIR /app/backend
RUN npm install --omit=dev --no-audit --no-fund --workspaces=false --legacy-peer-deps

# Artefatos compilados do backend e database
COPY --from=backend-builder /repo/backend/dist ./dist
COPY --from=backend-builder /repo/database /app/database
COPY --from=backend-builder /repo/infra /app/infra

# Frontend estático servido pelo backend Express na rota /
COPY --from=frontend-builder /repo/frontend/dist /app/public

WORKDIR /app
EXPOSE 3000

# Healthcheck (a aplicação responde em /api/health e /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

CMD ["node", "backend/dist/index.js"]
