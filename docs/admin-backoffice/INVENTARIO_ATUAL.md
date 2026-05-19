# Inventário Atual — Backoffice Admin

## Rotas administrativas já declaradas

Com base no `frontend/src/App.tsx`, as seguintes rotas administrativas já existem no frontend:

- `/admin`
- `/admin/dashboard`
- `/admin/users`
- `/admin/network`
- `/admin/commissions`
- `/admin/payments`
- `/admin/delinquents`
- `/admin/materials`

## Páginas administrativas já identificadas

- `AdminPanel`
- `AdminDashboard`
- `AdminUsers`
- `AdminNetwork`
- `AdminCommissions`
- `AdminPayments`
- `AdminDelinquents`
- `AdminMaterials`
- `AdminDashboardLayout`

## Leitura inicial de status

### Já existe e pode ser consolidado

- shell/layout administrativo
- dashboard administrativo
- usuários
- rede
- comissões
- pagamentos
- inadimplentes
- materiais

### Pontos que pedem revisão imediata

- alinhamento entre shell e rotas oficiais
- revisão de telas com possíveis dados mockados
- consolidação do módulo `/admin` como entrada canônica
- verificação de auth/RBAC na experiência administrativa

## Uso recomendado deste inventário

Este documento deve servir como ponto de partida para a **Fase 0** do plano de execução, evitando recomeçar o Backoffice Admin do zero quando já existe base administrativa implementada no repositório.
