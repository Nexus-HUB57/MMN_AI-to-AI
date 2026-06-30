# Marketplace Nexus · Sprint 2 + Admin Dashboard Real Data

Data: 2026-06-30

## Sprint 2 — Marketplace
- `colecao_IA_SE_DESCREVE` fechou: 3/9 → 9/9.
- 6 ebooks reais ingeridos com títulos canônicos dos markdowns.
- 6 capas oficiais promovidas: `47_O_Olho_que_se_Ve`, `48_A_Fronteira_que_se_Desenha`, `49_A_Escolha_que_se_Pesa`, `50_O_Dialogo_que_se_Tece`, `51_A_Marca_que_se_Grava`, `52_A_Frequencia_que_se_Canta`.
- Convenção `colecao-ia-se-descreve--<n>-<slug>.webp`.
- Pack: `pack-a2iii`.

## Total Marketplace
- Antes da Sprint 1: 164 ebooks.
- Após Sprint 1: 186 (+22).
- Após Sprint 2: **192** (+6).

## Demais coleções já completas (não havia gap real)
A análise inicial sugeria 9 coleções com gaps, mas a inspeção real revelou que 8 delas já estavam fechadas:
- `colecao-mmn-ia`: 18 ebooks ativos (READMEs e arquivos meta foram contados como gap erradamente).
- `curso-universo-ia`: 15 ativos (5 do curso original + 10 da expansão `ebook_NN`).
- `colecao-a-ia-perfeita`: 12 ativos.
- `colecao-nexus-protocol`: 10 ativos.
- `colecao-gnoxs`: 7 ativos.
- `colecao-human-ia`: 5 ativos.
- `colecao-agenticai-revolucao`: 5 ativos.
- `novas-profissoes-de-ia`: 5 ativos.

Diagnóstico: o relatório anterior contava READMEs como ebooks, gerando falso gap. A Sprint 2 atacou o único gap real existente.

## Admin Dashboard — Real Data Wiring
### Bug raiz
`AdminDashboard.tsx` continha `MOCK_USERS` hardcoded (5 usuários demo) e KPIs literais (`15.482`, `12.108`, `R$ 2.5M`, `R$ 184k`) que não consultavam o backend. Por isso o botão "Resetar Configurações" funcionava no banco mas a UI continuava mostrando dados fake.

### Correção
- Adicionado import `import { trpc } from "@/lib/trpc";`.
- Removido `MOCK_USERS`.
- Adicionado `trpc.admin.getDashboardMetrics.useQuery` com `refetchInterval: 30_000`.
- Adicionado `trpc.admin.listUsers.useQuery` (paginated, search-aware).
- Helpers `formatBRL`, `formatNumber`, `formatDate`.
- KPI cards agora bindam em: `metrics.totalUsers`, `metrics.activeAffiliates`, `metrics.totalCommissionsPaid`, `metrics.totalCommissionsPending`.
- Tabela "Usuários recentes" agora lê `usersQuery.data.users` (paginação `total` retornada).
- Status do usuário derivado de `lastSignedIn` (heurística simples).

### Métricas reais em produção (snapshot)
- Total users: **303**
- Total affiliates: **303**
- Active affiliates: **303**
- Commissions pending: **R$ 0**
- Payments confirmed: **R$ 0**

## Validação
- Build Vite: ✓ 8.32s.
- TypeCheck do AdminDashboard: sem novos erros.
- `marketplaceNexus.listEbooks`: 192 ativos.
- `admin.listUsers` / `admin.getDashboardMetrics`: HTTP 401 sem cookie (role gate OK).
- `/admin/dashboard`: HTTP 200.
- 6 capas IA SE DESCREVE: HTTP 200 com bytes reais (5-6 MB cada).

## Guardrails
- `trpc.admin.*` continua sob `adminProcedure` (require role admin).
- `refetchInterval: 30s` para métricas — sem polling agressivo.
- `keepPreviousData: true` para evitar flash de skeleton durante busca.
- Heurística de status do usuário documentada no código.

## Próximo
- Pipeline de PDF: 181 PDFs ainda inexistentes em `/ebooks/pdf/`.
- Atualizar manifesto `_marketplace_nexus_release` 132 → 192.
- AdminDashboard: substituir blocos hardcoded restantes (9.842 nós, 38.412 conexões, heatmap pseudo-random) por métricas reais quando o backend expor.
