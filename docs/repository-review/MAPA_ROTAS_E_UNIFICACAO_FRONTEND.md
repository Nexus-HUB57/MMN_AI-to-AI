# Mapa de Rotas e Proposta de Unificação do Frontend

## Estado atual observado

O `frontend/src/App.tsx` expõe hoje somente 5 entradas principais:

- `/` → `Home`
- `/dashboard` → `Dashboard`
- `/content-hub` → `ContentHub`
- `/orchestrator` → `OrchestratorDashboard`
- `/legacy-review` → `LegacyReview`

Ao mesmo tempo, o diretório `frontend/src/pages/` contém dezenas de páginas adicionais, incluindo áreas para:

- administração
- afiliado
- pagamentos
- rede
- materiais
- conteúdo
- upgrades
- marketplaces
- tracking
- agentic

## Diagnóstico

Existe uma diferença clara entre:

- **superfície implementada**
- **superfície roteada**

Ou seja: o repositório já tem muita interface construída, mas a navegação oficial ainda está concentrada em poucos pontos.

## Páginas agrupadas por domínio

### 1. Núcleo institucional / entrada

- `Home`
- `Dashboard`
- `LegacyReview`
- `NotFound`
- `Login`
- `Logout`

### 2. Backoffice administrativo

- `AdminDashboard`
- `AdminDashboardLayout`
- `AdminUsers`
- `AdminPayments`
- `AdminMaterials`
- `AdminNetwork`
- `AdminCommissions`
- `AdminDelinquents`
- `AdminPanel`
- `PaymentManagement`
- `UpgradesManagement`
- `BannerManager`
- `EbookManager`

### 3. Operação do afiliado

- `AffiliateProfile`
- `AffiliatePayments`
- `MiniSite`
- `AffiliateMiniSite`
- `MarketingMaterials`
- `Network`
- `Commissions`
- `Payments`
- `OrderTracking`
- `TopSponsors`
- `BonusPage`
- `BonusRewards`

### 4. Conteúdo e crescimento

- `ContentHub`
- `ContentGeneration`
- `ContentGenerator`
- `ContentCalendar`
- `PostScheduler`
- `ImageGenerator`
- `TrackingDashboard`
- `RecommendedProducts`
- `TrendingProducts`
- `Marketplaces`
- `MarketplacesManagement`
- `DropshippingOrders`

### 5. Camada agentic / orquestração

- `OrchestratorDashboard`
- `ExecutionLogs`
- `Agent`
- `Agents`
- `AgentDashboard`
- `AgentConfiguration`
- `AgentStatus`
- `SkillsUpgrades`
- `Upgrades`
- `NotificationCenter`

## Proposta de unificação

### Navegação-alvo recomendada

#### Público

- `/`
- `/login`
- `/legacy-review`

#### Backoffice

- `/app`
- `/app/dashboard`
- `/app/network`
- `/app/commissions`
- `/app/payments`
- `/app/materials`
- `/app/orders`
- `/app/marketplaces`

#### Administração

- `/admin`
- `/admin/users`
- `/admin/network`
- `/admin/payments`
- `/admin/materials`
- `/admin/commissions`
- `/admin/delinquents`
- `/admin/settings`

#### Agentic / monitoramento

- `/agentic`
- `/agentic/orchestrator`
- `/agentic/agents`
- `/agentic/logs`
- `/agentic/status`

#### Conteúdo

- `/content`
- `/content/hub`
- `/content/calendar`
- `/content/generator`
- `/content/images`

## Regras de consolidação recomendadas

1. evitar múltiplas páginas com papéis quase equivalentes sem shell compartilhado
2. criar layouts por domínio (`app`, `admin`, `agentic`, `content`)
3. esconder páginas antigas/experimentais até haver rota oficial
4. tratar o `Dashboard` atual como gateway, não como destino final de todos os módulos

## Decisão aplicada nesta etapa

Nesta rodada, a unificação foi documentada como plano técnico, mas não foi executada por alteração massiva de rotas. A decisão correta é avançar primeiro com:

- mapeamento de ownership de páginas
- agrupamento por domínio
- shell/layout por área
- ativação progressiva de rotas oficiais

## Conclusão

O frontend já possui massa crítica suficiente para operar como um sistema mais amplo do que o roteamento atual demonstra. O próximo ganho estrutural não depende de criar mais páginas, e sim de **organizar e expor corretamente as páginas que já existem**.
