# Plano de Integração de Arquivos e Atualizações do Repositório

Este documento detalha o plano para integrar os arquivos fornecidos no arquivo ZIP (`DesenvolvimentodeAppFullstackcomRoadmapnoGitHub.zip`) ao repositório GitHub `Nexus-HUB57/MMN_AI-to-AI`, seguindo o roadmap `Arquitetura de Orquestração Autônoma para Tarefas Operacionais de MMN.md`.

## 1. Mapeamento de Arquivos

A tabela abaixo descreve o mapeamento dos arquivos extraídos do ZIP para suas respectivas localizações no repositório `MMN_AI-to-AI`.

| Arquivo do ZIP (`/home/ubuntu/projeto_mmn`) | Localização no Repositório (`/home/ubuntu/MMN_AI-to-AI`) |
| :---------------------------------------- | :------------------------------------------------------ |
| `Arquitetura de Orquestração Autônoma para Tarefas Operacionais de MMN.md` | `docs/Arquitetura_de_Orquestração_Autônoma/Arquitetura_de_Orquestração_Autônoma_para_Tarefas_Operacionais_de_MMN.md` |
| `todo.md`                                 | `docs/todo_roadmap.md`                                  |
| `authRouter.ts`                           | `backend/src/routers/authRouter.ts`                     |
| `orchestrationRouter.ts`                  | `backend/src/routers/orchestrationRouter.ts`            |
| `routers.ts`                              | `backend/src/routers/routers.ts`                        |
| `commissionProcessingWorker.ts`           | `backend/src/workers/commissionProcessingWorker.ts`     |
| `contentGenerationWorker.ts`              | `backend/src/workers/contentGenerationWorker.ts`        |
| `marketplaceSyncWorker.ts`                | `backend/src/workers/marketplaceSyncWorker.ts`          |
| `orderProcessingWorker.ts`                | `backend/src/workers/orderProcessingWorker.ts`          |
| `orchestrator.ts`                         | `backend/src/services/orchestrator.ts`                  |
| `scheduler.ts`                            | `backend/src/services/scheduler.ts`                     |
| `queue.ts`                                | `backend/src/services/queue.ts`                         |
| `jobLogger.ts`                            | `backend/src/services/jobLogger.ts`                     |
| `db.ts`                                   | `backend/src/db/db.ts`                                  |
| `schema.ts`                               | `database/schemas/schema.ts`                            |
| `schema-final.ts`                         | `database/schemas/schema-final.ts`                      |
| `App.tsx`                                 | `frontend/src/App.tsx`                                  |
| `Dashboard.tsx`                           | `frontend/src/pages/Dashboard.tsx`                      |
| `GoalCreation.tsx`                        | `frontend/src/components/GoalCreation.tsx`              |
| `package.json`                            | (Será mesclado com o `package.json` existente no repositório) |

## 2. Etapas de Atualização

### 2.1. Atualização do Backend

1.  **Criação de Diretórios:** Criar os diretórios `backend/src/workers` e `backend/src/db` no repositório.
2.  **Cópia de Arquivos:** Mover os arquivos de `routers`, `workers`, `services` e `db` para suas respectivas localizações.
3.  **Atualização de `package.json`:** Mesclar as dependências e scripts do `package.json` extraído com o `package.json` existente no diretório `backend` do repositório. Será necessário instalar as novas dependências.

### 2.2. Atualização do Frontend

1.  **Criação de Diretórios:** Criar o diretório `frontend/src/pages` e `frontend/src/components` se não existirem.
2.  **Cópia de Arquivos:** Mover os arquivos `App.tsx`, `Dashboard.tsx`, `GoalCreation.tsx` para suas respectivas localizações.

### 2.3. Atualização do Banco de Dados e Schemas

1.  **Cópia de Arquivos:** Mover `schema.ts` e `schema-final.ts` para `database/schemas/`.

### 2.4. Documentação

1.  **Cópia de Arquivos:** Mover `Arquitetura de Orquestração Autônoma para Tarefas Operacionais de MMN.md` para `docs/Arquitetura_de_Orquestração_Autônoma/` e `todo.md` para `docs/todo_roadmap.md`.

## 3. Controle de Versão

Após cada etapa significativa de cópia e ajuste, será realizado um commit no repositório GitHub para garantir a rastreabilidade das alterações.
