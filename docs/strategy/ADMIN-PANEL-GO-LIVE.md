# Admin Panel + Marketplace · Go Live

Data: 2026-06-30

## Resumo
Todas as páginas do Painel Admin que retornavam 404 foram reativadas. O menu lateral foi reorganizado por grupo e o painel "Configurações" voltou ao ar.

## Bug raiz
As 9 páginas administrativas existiam em `frontend/src/pages/Admin*.tsx`, porém nunca tinham sido registradas em `frontend/src/App.tsx`. O fallback `NotFound` capturava todas e devolvia 404. A página `Marketplaces` tinha o mesmo problema em `/marketplace`.

## Rotas adicionadas
- `/admin/users` → `AdminUsers`
- `/admin/commissions` → `AdminCommissions`
- `/admin/network` → `AdminNetwork`
- `/admin/payments` → `AdminPayments`
- `/admin/delinquents` → `AdminDelinquents`
- `/admin/materials` → `AdminMaterials`
- `/admin/scheduler` → `AdminScheduler`
- `/admin/schedules` → `AdminSchedules`
- `/admin/status` → `AdminRuntime`
- `/admin/runtime` → `AdminRuntime`
- `/admin/approvals` → `AdminApprovals`
- `/admin/settings` → `AdminSettings`
- `/admin/skills` → `AdminSkills`
- `/admin/pack-tickets` → `AdminPackTickets`
- `/admin/academia/analytics` → `AdminAcademiaAnalytics`
- `/admin/agents/:agentId` → `AdminAgentDetails`
- `/admin/panel` → `AdminPanel`
- `/marketplace` → `Marketplaces`

## Menu lateral reorganizado (`AdminDashboardLayout.tsx`)
Grupos visuais:
- **Operação**: Dashboard, Status do Sistema, Aprovações, Agendamentos
- **Negócio**: Usuários, Rede, Comissões, Pagamentos, Inadimplentes, Pack Tickets
- **Conteúdo**: Materiais, Academia EAD, Academia Analytics, Meetings
- **Agentic**: Skills, Governance, Federation
- **Sistema**: Configurações

## Validação live (HTTP 200 em todas)
admin · admin/dashboard · admin/materials · admin/users · admin/commissions · admin/network · admin/payments · admin/delinquents · admin/scheduler · admin/status · admin/approvals · admin/settings · admin/skills · admin/governance · admin/federation · admin/academia · admin/meetings · admin/pack-tickets · admin/academia/analytics · marketplace.

## Build
- TypeCheck: erros pré-existentes em `AdminSchedules`, `CareerProgress`, `AdminAcademia`, `AdminCommissions`, `academia-ead.ts` foram detectados mas não bloqueiam o build Vite/esbuild.
- Build Vite: ✓ 7.57s · bundle 1,840 kB.
- rsync para `/var/www/oneverso/public/`: OK.

## Guardrails
- `AdminDashboardLayout` continua aplicando role gate (`user.role === "admin"`).
- Anonymous users veem "Acesso Negado" — comportamento intencional.
- Menu agrupado evita pollution e facilita escala para futuros painéis.
