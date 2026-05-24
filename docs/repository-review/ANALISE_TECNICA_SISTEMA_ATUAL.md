# Análise Técnica do Sistema Atual

## Escopo desta revisão

Esta análise reflete o estado atual do repositório **MMN AI-to-AI** após a fase de fusão com o legado, considerando a estrutura observada no monorepo, os scripts raiz, a documentação presente, os módulos frontend disponíveis e o histórico recente de estabilização.

## 1. Visão geral arquitetural

O sistema está organizado como um **monorepo** com três workspaces principais:

- `frontend/`: aplicação web em **React + Vite + wouter + TanStack Query**
- `backend/`: API e serviços em **Node.js + TypeScript + tRPC + Drizzle ORM**
- `mobile/`: aplicação **React Native + Expo Router**

Na raiz também coexistem áreas complementares importantes:

- `database/`: schemas e migrations compartilhados
- `docs/`: documentação operacional, agentic, planejamento, relatórios e roadmaps
- `scripts/`: automações técnicas e utilitários de migração
- `ai/`: ativos de configuração/datasets/training scripts
- `orquestrador-dashboard/`: aplicação paralela dedicada ao dashboard do orquestrador
- `extracted_ecosystem/`: material extraído/analisado do ecossistema anterior

## 2. Estado funcional observado

### 2.1 Backend

Os scripts da raiz indicam um backend estruturado para:

- execução em desenvolvimento via `tsx watch`
- build de produção
- start isolado do backend
- geração e execução de migrations com Drizzle
- execução de workers separados para conteúdo, comissões, marketplace e pedidos
- camada Genkit em execução própria

O backend atual permanece como o **núcleo transacional** do sistema, concentrando integração com banco, filas, autenticação, processamento de pedidos, comissões, pagamentos e recursos agentic.

### 2.2 Frontend

O frontend contém um conjunto extenso de páginas, incluindo módulos para:

- administração (`AdminDashboard`, `AdminUsers`, `AdminPayments`, `AdminNetwork`, `AdminMaterials`, `AdminCommissions`, `AdminDelinquents`)
- afiliado (`AffiliateProfile`, `AffiliatePayments`, `MiniSite`, `MarketingMaterials`)
- agentic (`AgentDashboard`, `AgentConfiguration`, `AgentStatus`, `Agents`)
- operação comercial (`Payments`, `PaymentManagement`, `Commissions`, `Network`, `TrackingDashboard`, `Marketplaces`, `RecommendedProducts`, `TrendingProducts`)
- produção de conteúdo (`ContentHub`, `ContentGeneration`, `ContentCalendar`, `PostScheduler`, `ImageGenerator`)
- fusão/legado (`LegacyReview`, `Dashboard`, `Home`, `OrchestratorDashboard`)

Isso mostra que o repositório já possui **cobertura funcional ampla no frontend**, mas a presença de muitas páginas coexistindo com uma navegação pública reduzida indica que parte relevante da superfície da aplicação ainda está em **consolidação ou reconexão**.

### 2.3 Mobile

O workspace `mobile/` está presente com stack moderna de Expo e React Native, sugerindo que o projeto já foi desenhado para expansão omnichannel. Contudo, no estado atual do repositório, a aplicação mobile ainda parece cumprir papel secundário em relação ao frontend web e backend principal.

## 3. Sinais claros de maturidade técnica

### 3.1 Monorepo consistente

A raiz possui scripts claros para:

- desenvolvimento conjunto
- build por workspace
- controle de infraestrutura Docker
- pipeline de banco de dados
- execução de testes

Isso é um bom sinal de organização operacional e facilita evolução incremental.

### 3.2 Separação de domínios

Há separação nítida entre:

- aplicação web
- backend transacional
- schemas de banco
- documentação
- scripts de migração/automação
- artefatos de IA

Essa divisão favorece manutenção e governança do código.

### 3.3 Evidência de migração estruturada

O histórico recente da fusão mostra que o payload pesado de `legacy/` já foi retirado do Git após inventário e arquivamento externo. Além disso, o repositório mantém relatórios de inventário em `docs/reports/legacy-inventory.*`, o que indica rastreabilidade da retirada do legado bruto.

## 4. Problemas estruturais atuais

### 4.1 Excesso de documentação espalhada na raiz

A raiz do repositório contém diversos documentos analíticos e estratégicos fora de `docs/`, incluindo:

- `Analise_Tecnica_Completa_MMN_AI_to_AI.md`
- `CORRECOES_TECNICAS.md`
- `FUSAO_LEGACY_OFICIAL.md`
- `INCONSISTENCIAS.md`
- `PROPOSTAS_E_ROADMAP_DE_MELHORIA.md`
- `Todo.md`
- `analise_mercado_brasil_mmn_afiliados_ia.pdf`

Tecnicamente isso gera:

- poluição visual na raiz
- dificuldade de navegação
- descoberta ruim de documentação canônica
- risco de duplicação e desatualização

### 4.2 Espalhamento e duplicação documental em `docs/`

A pasta `docs/` concentra muito conteúdo útil, porém com múltiplas trilhas paralelas:

- `docs/agentic/`
- `docs/planning/`
- `docs/reports/`
- `docs/roadmaps/`
- `docs/v16_delivery/`
- arquivos avulsos na própria raiz de `docs/`

Também há evidência de duplicidade semântica, por exemplo:

- `docs/roadmap_fusao_mmn.md`
- `docs/roadmaps/roadmap_fusao_mmn.md`

Isso reduz a clareza sobre qual documento é a fonte oficial.

### 4.3 Superfície funcional maior que a navegação principal

Embora existam dezenas de páginas prontas em `frontend/src/pages`, o histórico recente do app principal mostra uma navegação pública concentrada em poucos pontos de entrada. Esse desequilíbrio sugere um gap entre:

- capacidade de interface já codificada
- exposição efetiva dessas áreas no fluxo principal do produto

Na prática, a fusão técnica avançou mais rápido que a fusão de experiência e roteamento.

### 4.4 Artefatos paralelos ainda convivendo no mesmo nível

A presença de `orquestrador-dashboard/`, `extracted_ecosystem/`, `browser/`, `extract/` e grandes blocos de documentação/planning indica que o repositório ainda mistura:

- produto principal
- experimentos
- extrações
- documentação operacional
- subprodutos de análise

Isso é compreensível em fase de fusão, mas já pede uma reorganização mais explícita.

### 4.5 Drift de bootstrap/dependências

Durante a estabilização recente, houve necessidade de alinhar README, scripts e dependências. Isso sinaliza que o processo de bootstrap ainda precisa de normalização contínua para manter coerência entre:

- documentação de instalação
- scripts de build
- dependências efetivamente necessárias

## 5. Diagnóstico técnico consolidado

### Forças atuais

- Base monorepo moderna e escalável
- Backend com desenho operacional sólido
- Frontend com ampla cobertura de módulos administrativos e operacionais
- Separação razoável de domínios
- Histórico recente de saneamento do legado pesado
- Boa quantidade de documentação já produzida

### Fragilidades atuais

- Raiz excessivamente carregada com documentos de análise
- Documentação duplicada/dispersa
- Alguns workspaces e artefatos coexistem sem hierarquia explícita
- Build/bootstrap ainda depende de normalização fina
- Parte da superfície funcional ainda não está consolidada numa navegação única e simples

## 6. Recomendações técnicas prioritárias

### Prioridade 1 — Higiene do repositório

- manter a raiz focada apenas em arquivos operacionais essenciais
- mover análises e relatórios soltos para uma área documental única
- padronizar a documentação canônica da fusão

### Prioridade 2 — Consolidação documental

- definir uma trilha oficial para arquitetura, roadmap, operação e relatórios
- eliminar duplicações de roadmap
- criar índices de documentação por domínio

### Prioridade 3 — Consolidação do frontend

- alinhar páginas existentes com rotas efetivamente acessíveis
- separar claramente áreas públicas, afiliado, admin e agentic
- evitar páginas órfãs sem rota principal

### Prioridade 4 — Claridade de artefatos auxiliares

- isolar experimentos, extrações e dashboards paralelos em áreas mais explícitas
- documentar quais pastas são produto, suporte, experimento ou legado analítico

## 7. Reorganização aplicada nesta etapa

Nesta etapa, a reorganização recomendada é:

1. criar uma área única `docs/repository-review/`
2. centralizar nela a nova análise técnica e o resumo executivo
3. mover documentos analíticos soltos da raiz para dentro dessa área documental
4. manter a raiz mais enxuta e orientada à operação do monorepo

## 8. Conclusão

O sistema atual **já não é mais um repositório legado improvisado**; ele se comporta como uma base moderna em processo real de consolidação. O principal desafio agora deixou de ser apenas “migrar código” e passou a ser **organizar a superfície do produto, estabilizar o bootstrap e tornar a documentação inequívoca**.

Em outras palavras:

- a base técnica já existe
- a fusão estrutural avançou
- o gargalo atual é governança de código, clareza arquitetural e organização do repositório
