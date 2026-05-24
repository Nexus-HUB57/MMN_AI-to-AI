# Plano de Execução em Fases — Backoffice Admin MMN AI-to-AI

## Premissas de partida

A leitura do `README.md` e da estrutura atual do repositório indica que o sistema já possui base suficiente para iniciar o Backoffice Admin sem partir do zero. O projeto já declara, entre os elementos centrais da documentação canônica, o **Painel Administrativo e RBAC**, além de registrar no README que o frontend possui dezenas de páginas e que a plataforma já cobre MMN, pagamentos, conteúdo, marketplace e orquestração agentic.

Também há evidência concreta de páginas administrativas já implementadas no frontend, incluindo `AdminDashboard`, `AdminUsers`, `AdminNetwork`, `AdminCommissions`, `AdminPayments`, `AdminDelinquents` e `AdminMaterials`, além de rotas `/admin/*` já declaradas no `frontend/src/App.tsx`.

## Objetivo executivo

Criar um **Backoffice Admin unificado**, com shell próprio, módulos por domínio, contratos tRPC previsíveis, controle de acesso e visão operacional consolidada da plataforma MMN AI-to-AI.

## Princípios de execução

1. **Aproveitar o que já existe** antes de criar novas superfícies.
2. **Unificar por domínio** e não por tela isolada.
3. **Conectar frontend e backend reais** antes de sofisticar UI.
4. **Manter o admin separado** da jornada do afiliado, do conteúdo e da camada agentic.
5. **Trabalhar em entregas pequenas**, sempre publicáveis.

---

## Fase 0 — Diagnóstico e saneamento administrativo

### Objetivo

Definir a linha de base do Backoffice Admin e mapear o que já está operacional, o que é mock e o que ainda está órfão.

### Entregáveis

- inventário das páginas admin já existentes
- mapa dos endpoints/backend consumidos por cada tela
- classificação por status: funcional, parcial, mock, quebrado, órfão
- definição do shell oficial do admin

### Ações

- revisar todas as páginas `/admin/*`
- verificar dependências de hooks, auth e tRPC
- mapear quais telas já usam dados reais e quais usam mocks
- validar `AdminDashboardLayout` como shell base ou substituí-lo por versão consolidada

### Critério de saída

Existe um mapa claro do Backoffice Admin com ownership de cada módulo.

---

## Fase 1 — Shell oficial e navegação do Backoffice Admin

### Objetivo

Estabelecer a entrada oficial do administrador com navegação estável.

### Entregáveis

- shell admin oficial
- menu lateral padronizado
- breadcrumbs/header operacional
- estados de loading/erro/vazio padronizados
- rota raiz `/admin` apontando para o dashboard oficial

### Módulos mínimos no menu

- Dashboard
- Usuários
- Rede
- Comissões
- Pagamentos
- Inadimplentes
- Materiais
- Logs / observabilidade
- Configurações

### Critério de saída

O admin consegue navegar pelo núcleo do Backoffice sem telas órfãs.

---

## Fase 2 — Núcleo operacional de rede e usuários

### Objetivo

Consolidar o coração administrativo do MMN: usuários, afiliados e rede.

### Entregáveis

- gestão de usuários com busca, edição e mudança de papel
- visualização administrativa da rede
- painel de patrocinadores / estrutura hierárquica
- filtros por status, papel, atividade e volume

### Dependências técnicas

- endpoints tRPC estáveis para `users`, `affiliates` e `network`
- contratos consistentes para paginação e filtros
- política mínima de autorização admin

### Critério de saída

O operador administrativo consegue localizar, revisar e agir sobre usuários e estrutura de rede.

---

## Fase 3 — Financeiro administrativo

### Objetivo

Consolidar a camada financeira do Backoffice.

### Entregáveis

- painel de pagamentos
- visão de comissões pagas, pendentes e canceladas
- inadimplência e ações administrativas
- histórico financeiro consolidado
- indicadores principais no dashboard admin

### Critério de saída

O admin consegue operar a trilha financeira principal em uma única experiência administrativa.

---

## Fase 4 — Conteúdo, materiais e suporte operacional

### Objetivo

Levar para o Backoffice os módulos de suporte à rede e à comunicação.

### Entregáveis

- gestão de materiais
- banners / ebooks / ativos institucionais
- newsletter e CMS como subdomínios administrativos
- visão operacional de publicações e calendários quando aplicável

### Critério de saída

O Backoffice passa a cobrir também a camada de conteúdo e suporte à operação comercial.

---

## Fase 5 — Observabilidade, auditoria e camada agentic de apoio

### Objetivo

Adicionar supervisão operacional real ao Backoffice.

### Entregáveis

- dashboard de filas e workers
- logs administrativos de execução
- indicadores de falha por domínio
- trilha de auditoria para ações sensíveis
- ponte controlada com a camada agentic/orquestrador

### Critério de saída

O Backoffice Admin deixa de ser apenas CRUD operacional e passa a atuar como centro de supervisão.

---

## Fase 6 — Configuração do negócio e governança

### Objetivo

Centralizar regras administrativas da operação MMN.

### Entregáveis

- configurações de comissionamento
- parâmetros operacionais do negócio
- gestão de administradores e permissões
- baseline de RBAC por área administrativa

### Critério de saída

As regras centrais do negócio ficam parametrizadas dentro do Backoffice, reduzindo dependência de mudanças manuais no código.

---

## Fase 7 — Hardening e go-live incremental

### Objetivo

Preparar o Backoffice Admin para uso progressivo como interface principal administrativa.

### Entregáveis

- testes de fumaça por módulo
- validação de permissões
- limpeza de rotas antigas/duplicadas
- checklist de observabilidade
- rollout progressivo por domínio

### Critério de saída

O Backoffice Admin está apto a substituir a navegação administrativa dispersa por uma entrada única e controlada.

---

## Sequência recomendada de execução imediata

### Sprint 1

- Fase 0 completa
- Fase 1 parcial
- definição do shell oficial e do mapa de módulos

### Sprint 2

- Fase 1 completa
- Fase 2 iniciada
- correções de rotas/admin pages já existentes

### Sprint 3

- Fase 2 completa
- Fase 3 iniciada
- dashboard admin consolidado com dados reais

### Sprint 4

- Fase 3 completa
- Fase 4 iniciada
- trilha conteúdo/materiais acoplada ao admin

## Riscos principais

- telas administrativas existentes com dependências quebradas
- divergência entre componentes mockados e endpoints reais
- shell administrativo atual ainda incompleto
- inconsistências de auth/RBAC entre páginas antigas e novas

## Estratégia para reduzir risco

- começar pelo inventário real das telas admin
- ativar módulos por domínio
- evitar refatoração global antes de validar contratos tRPC
- publicar em incrementos pequenos com validação contínua

## Resultado esperado

Ao final dessas fases, o projeto terá um **Backoffice Admin operacional, modular e governável**, conectado à stack oficial do monorepo e pronto para absorver a operação administrativa hoje dispersa entre telas, fluxos legados e experimentos parciais.
