# Nexus AfilIAte-AI (mmn-ai-to-ai)

## Project Overview

A Multi-Level Marketing (MMN) ecosystem fused with an autonomous AI orchestration layer. Built as a monorepo with a React/Vite frontend, Node.js/tRPC backend, and optional mobile (Expo) app.

### Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, TanStack Query, tRPC, wouter (routing), Radix UI
- **Backend**: Node.js + TypeScript, tRPC v11, Express, Drizzle ORM, BullMQ, Redis
- **Database**: MySQL (via Drizzle ORM) + PostgreSQL available via Replit secrets
- **AI/LLM**: OpenAI, Google Genkit/Gemini
- **Package Manager**: npm workspaces (frontend + backend; mobile excluded from root workspaces)

### Architecture

- `frontend/` — React + Vite web app (port 5000 in dev)
- `backend/` — Express + tRPC API server (port 3000)
- `database/schemas/` — Shared Drizzle ORM schemas
- `mobile/` — Expo mobile app (excluded from root workspace due to peer dep conflicts)

## Workflows

- **Start application** — `npm --prefix frontend run dev` → port 5000 (webview)
- **Backend API** — `cd backend && ../node_modules/.bin/tsx src/index.ts` → port 3000 (console)

## Environment Variables

Set in Replit Secrets:
- `PORT` — Backend port (default: 3000)
- `NODE_ENV` — Environment (development/production)
- `FRONTEND_ORIGIN` — CORS origin for backend (e.g., http://localhost:5000)
- `JWT_SECRET` — JWT signing secret
- `DATABASE_URL` — MySQL connection URL (mysql://user:pass@host:3306/dbname)
- `REDIS_URL` — Redis connection URL (redis://localhost:6379)
- `OPENAI_API_KEY` — OpenAI API key (required for AI features)

## Setup Notes

- The mobile workspace was removed from root `package.json` workspaces to avoid peer dependency conflicts with Expo packages
- `package-lock.json` was deleted (it had 218+ entries with invalid version strings from the mobile workspace)
- Frontend and backend dependencies are installed separately in their own directories
- OpenAI client is lazy-initialized (only fails when AI features are actually used, not on startup)
- MySQL and Redis connection errors on startup are expected without those services configured

## User Preferences

- Language: Portuguese (Brazilian) — project code and logs are in pt-BR
