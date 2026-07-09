# Estrutura Oficial do Repositório · MMN_AI-to-AI (Onda 35)

Este documento define a estrutura oficial do repositório após a organização da Onda 35.

## Layout de Alto Nível

```
/
├── backend/              # API tRPC + Express + Genkit (Node.js)
├── frontend/             # SPA React + Vite + Tailwind
├── mobile/               # App mobile (Capacitor/Ionic)
├── infra/                # IaC · scripts de deploy VPS
├── database/             # Migrations Drizzle · schema · seeds
├── data/                 # Dados versionados (JSON estático)
├── docs/                 # Documentação técnica e de arquitetura
├── scripts/              # Scripts operacionais (deploy, sync, youtube)
├── tests/                # Testes end-to-end e integração
├── public/               # Assets estáticos servidos pelo Nginx
│   └── academia/         # Vídeos MP4, PDFs, MDs, HTMLs
├── AcademIA/             # Fonte pedagógica (roteiros, apostilas, personas)
│   ├── videos/           # Vídeos-fonte e scripts de vídeo
│   ├── apostilas/        # Apostilas (fonte MD + PDFs gerados)
│   ├── personas/         # Identidade das personas (Ive, Alencar)
│   ├── producao/         # Templates, pipeline e padrão de produção
│   ├── youtube/          # Manifesto de publicação, thumbs, results
│   └── cursos/           # Roteiros por curso
├── archive/              # Materiais históricos (fases anteriores)
│   ├── fases/            # fase7, fase8, fase9 arquivados
│   └── analysis/         # Análises técnicas de valuation
├── backups/              # Backups locais (NÃO VERSIONADO após Onda 35)
│   ├── env/              # .env.bak.*, staging.yml.bak
│   └── source/           # .bak.* de backend e frontend
└── legacy/               # Sistema PHP anterior (referência histórica)
```

## Convenções

### Nomenclatura de pastas
- Pastas em `kebab-case` ou `snake_case`, sem espaços nem caracteres especiais
- Pastas transversais em português (AcademIA, personas, producao) mantidas por identidade da marca
- Diretórios técnicos em inglês (backend, frontend, docs, scripts)

### Backups
- **Nunca versionar** arquivos `.bak`, `.env.bak.*`, `.env.before_*`, `staging.yml.bak`
- Backups locais em `backups/` (gitignored)
- Backups de segurança do sistema em `/var/www/oneverso/backups/` (fora do repo)

### Branches
- `main` = produção
- `feat/<escopo>-<data>` = features
- `fix/<escopo>` = correções
- `chore/<escopo>` = manutenção
- `docs/<escopo>` = documentação
- **Deletar após merge** para manter o repo enxuto

### Assets grandes
- MP4/PDF > 5MB devem ficar em `public/academia/videos/` ou `public/academia/pdf/` (servidos por Nginx)
- Cópias de trabalho vão em `AcademIA/youtube/videos_teaser/`
- Considerar Git LFS para binários que precisam ser versionados

### `.env`
- `.env` NUNCA no repo
- `.env.example` versionado com valores placeholder
- Backups em `backups/env/` (local apenas)

## Padrão de Commit

```
<tipo>(<escopo>): <mensagem>

Exemplos:
feat(academia): adicionar módulo elite-04
fix(youtube): corrigir upload de thumbnails
chore(repo): reorganizar estrutura de backups
docs(structure): documentar layout oficial
```

## Onda 35 · O que foi feito

1. ✅ Consolidados 8 arquivos `.env.bak.*` em `backups/env/`
2. ✅ Consolidados 66 arquivos `.bak` de backend/frontend em `backups/source/`
3. ✅ Movidas fases 7/8/9 e análises técnicas para `archive/`
4. ✅ Renomeada pasta `Generate Vídeos Nexus V` → `generate-videos-nexus-v`
5. ✅ `.gitignore` reforçado (backups, logs, .env*, IDE files)
6. ✅ Listadas 21 branches merged prontas para deletion
7. ✅ Este documento (`docs/REPO_STRUCTURE.md`) criado como fonte-verdade
