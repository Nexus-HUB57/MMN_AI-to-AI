# Avaliação do `orquestrador-dashboard/`

## Resumo executivo

O diretório `orquestrador-dashboard/` representa um **artefato paralelo** ao produto principal, não o frontend oficial do monorepo.

Enquanto o produto principal usa:

- `frontend/` com **React + Vite + wouter + tRPC**
- `backend/` com **Node.js + TypeScript + tRPC + Drizzle + MySQL**

O `orquestrador-dashboard/` usa uma trilha diferente:

- `pnpm`
- `react-router-dom`
- `Supabase`
- stack de UI autônoma

## Evidências observadas

### Produto principal

O `frontend/src/App.tsx` expõe hoje as rotas:

- `/`
- `/dashboard`
- `/content-hub`
- `/orchestrator`
- `/legacy-review`

Isso mostra que o orquestrador **já possui representação dentro do produto principal**, via página `frontend/src/pages/OrchestratorDashboard.tsx`.

### Artefato paralelo

Já o `orquestrador-dashboard/README.md` descreve uma aplicação separada com:

- build e dev via `pnpm`
- autenticação e persistência via Supabase
- modelo de dados próprio
- orientação de uso independente da stack oficial do monorepo

## Diagnóstico técnico

O `orquestrador-dashboard/` parece cumprir mais o papel de:

- protótipo funcional
- sandbox de interface
- experimento paralelo
- referência visual/operacional

Do que de módulo canônico do sistema atual.

## Risco de manter como está

Manter essa pasta sem status explícito gera confusão sobre:

- qual frontend é o oficial
- qual backend e banco são a fonte da verdade
- qual stack deve ser usada para manutenção do orquestrador

## Recomendação

### Curto prazo

- manter `orquestrador-dashboard/` versionado
- marcar explicitamente como **workspace paralelo / protótipo / referência**
- evitar tratá-lo como frontend principal

### Médio prazo

Escolher uma das duas direções:

#### Opção A — absorção no produto principal

Migrar os melhores blocos visuais e operacionais do `orquestrador-dashboard/` para:

- `frontend/src/pages/OrchestratorDashboard.tsx`
- `frontend/src/components/`
- backend oficial via tRPC

#### Opção B — isolamento como laboratório

Mover o diretório para uma área mais explícita, por exemplo:

- `labs/orquestrador-dashboard/`
- `experiments/orquestrador-dashboard/`

## Decisão aplicada nesta etapa

Nesta rodada, a recomendação formal é:

- considerar `orquestrador-dashboard/` um **artefato paralelo não canônico**
- usar o frontend principal como destino da convergência funcional
- documentar essa distinção para reduzir ambiguidade arquitetural

## Conclusão

O orquestrador principal do sistema deve convergir para a stack oficial do monorepo. O `orquestrador-dashboard/`, no estado atual, deve ser lido como **referência/protótipo**, não como a interface principal definitiva.
