# Nexus Affil'IA — MMN AI-to-AI Platform

<p align="center">
  <strong>Plataforma de Rede de Afiliados com Inteligência Artificial</strong><br/>
  <em>oneverso.com.br</em>
</p>

## 🏗️ Arquitetura

### Stack Técnico
| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + TypeScript + Vite 6 + Tailwind CSS 3 |
| **Backend** | Express + tRPC v11 + Drizzle ORM |
| **Banco de Dados** | PostgreSQL 16 |
| **Autenticação** | Firebase Auth (ID Tokens) |
| **Pagamentos** | Mercado Pago + OpenPix (Pix) |
| **Infraestrutura** | PM2 (6 workers) + Nginx |
| **Monitoramento** | Prometheus metrics + Audit events |

### Estrutura do Projeto
```
├── frontend/               # React SPA
│   ├── src/
│   │   ├── pages/         # Páginas (Dashboard, Admin, Login, etc.)
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (trpc client, formatBRL)
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts (AuthContext)
│   │   └── assets/        # Imagens estáticas
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── backend/                # Express + tRPC
│   ├── src/
│   │   ├── index.ts       # Entry point Express
│   │   ├── config/        # tRPC setup, routers
│   │   ├── routers/       # tRPC routers
│   │   │   ├── adminRouter.ts       # Painel admin
│   │   │   ├── commissionsRouter.ts # Comissões
│   │   │   ├── networkRouter.ts     # Rede/Indicação
│   │   │   └── affiliateStoreRouter.ts # Loja do afiliado
│   │   ├── domains/       # Lógica de domínio
│   │   │   └── commissions/
│   │   │       ├── commissionEngine.ts # Motor de bônus/carreira
│   │   │       ├── service.ts
│   │   │       └── events.ts
│   │   ├── services/      # Firebase, Cron, OpenPix
│   │   ├── middleware/     # Rate limiting, Pix
│   │   └── open-api/      # OpenAPI routes
│   ├── tsconfig.json
│   └── package.json
├── database/
│   └── schemas/
│       ├── schema-final.ts # Drizzle schema definitions
│       └── db.ts          # DB connection
├── docs/planning/          # Documentação de planejamento
└── drizzle.config.ts
```

## 🚀 Deploy

### Pré-requisitos
- Node.js 22+ (via NVM)
- PostgreSQL 16
- PM2 global (`npm i -g pm2`)
- Firebase project credentials

### Build
```bash
# Frontend
cd frontend && npx vite build

# Backend
cd backend && npx esbuild src/index.ts \
  --platform=node --bundle \
  --format=cjs --packages=external \
  --outfile=dist/index.js
```

### Deploy no VPS
```bash
# Sincronizar repo
cd /var/www/oneverso/current
git fetch origin main && git reset --hard origin/main

# Build frontend
cd frontend && npx vite build

# Build backend
cd ../backend && npx esbuild src/index.ts \
  --platform=node --bundle \
  --format=cjs --packages=external \
  --outfile=dist/index.js

# Restart PM2
pm2 restart mmn-api
```

### Variáveis de Ambiente
Veja `.env.example` para todas as variáveis necessárias:
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Backend port (3001)
- `FRONTEND_ORIGIN` — Frontend URL para CORS
- `FIREBASE_*` — Credenciais Firebase Admin
- `MP_ACCESS_TOKEN` — Mercado Pago token
- `OPENPIX_*` — OpenPix credentials

## 📊 Tabela de Bônus (Plano de Carreira)

### #1 Bônus Revenda — 100% do lucro sobre produtos vendidos

### #2 Bônus OnePack — Lucro por venda de packs (14 níveis)
| Tier Mínimo | Pack | Lucro (centavos) |
|-------------|------|-----------------|
| Afiliado I  | Pack A1 | R$ 2,50 |
| Afiliado I  | Pack A2 | R$ 5,00 |
| ... | ... | ... até R$ 7.500 |

### #3 Bônus Consumo — 1.5% a 4% por nível da rede N.O.
| Nível N.O. | Percentual |
|-----------|-------------|
| Nível 1 | 1.5% |
| Nível 2 | 2.0% |
| ... | ... até Nível 12 |

### #4 Bônus N.O. — Bonificação por qualificação de rede
| Qualificador | Novo Membro | Bônus |
|-------------|------------|-------|
| Agente I+ | Qualquer | R$ 500 |
| ... | ... | ... até R$ 2.000 |

## 🔐 Autenticação

A autenticação utiliza **Firebase ID Tokens** como método primário. O backend valida o token JWT via `verifyFirebaseIdToken()` e resolve o usuário no banco de dados.

> ⚠️ **Nota de Segurança**: Existe um fallback de header legado (`x-user-id`/`x-user-role`) para backward compatibility. Este deve ser removido quando todos os clientes migrarem para Firebase-only.

## 📈 Tópicos do Roadmap

- [ ] Pagamento Pix dinâmico (OpenPix webhook)
- [ ] Heatmap/Matrix com dados reais
- [ ] Bônus #5 (Inspiração), #6-9 (Grafo, Corp, HARP'IA, Nexus)
- [ ] Conectar commissionEngine ao fluxo de checkout real
- [ ] Migrar JSON file stores para PostgreSQL
- [ ] Code splitting com React.lazy() no frontend
- [ ] Padronizar tema admin (obsidian/quantum)

## 📄 Licença

Proprietário — Nexus Affil'IA / oneverso.com.br
