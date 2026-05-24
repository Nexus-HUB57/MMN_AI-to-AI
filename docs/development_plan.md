# Plano de Desenvolvimento para MMN AI-to-AI

## 1. Análise do Estado Atual do Repositório

Com base na análise dos arquivos `README.md`, `DOCUMENTACAO_CANONICA.md`, `ANALISE_TECNICA_SISTEMA_ATUAL.md`, `CHANGELOG.md`, `frontend/src/App.tsx` e `backend/src/appRouter.ts`, o repositório `Nexus-HUB57/MMN_AI-to-AI` apresenta uma base técnica sólida e um desenvolvimento ativo, especialmente nas funcionalidades de Backoffice Admin e automação Cron. No entanto, foram identificadas algumas fragilidades estruturais que podem impactar a manutenibilidade e a clareza do projeto a longo prazo.

### 1.1 Forças Atuais

*   **Base Monorepo Moderna e Escalável:** A estrutura de monorepo com React, Node.js, TypeScript, tRPC, Drizzle ORM, MySQL, Redis e BullMQ oferece uma base robusta para o desenvolvimento e escalabilidade do sistema.
*   **Backend Sólido:** O backend é o núcleo transacional, concentrando integrações com banco de dados, filas, autenticação, processamento de pedidos, comissões, pagamentos e recursos agentic.
*   **Frontend Abrangente:** O frontend possui uma vasta cobertura de módulos administrativos e operacionais, com dezenas de páginas prontas para uso.
*   **Separação de Domínios:** Há uma clara separação entre a aplicação web, backend transacional, schemas de banco, documentação e scripts de automação, o que favorece a manutenção do código.
*   **Saneamento do Legado:** O histórico recente indica um esforço bem-sucedido de saneamento do legado PHP, com a remoção de payloads pesados e a manutenção de relatórios de inventário.
*   **Documentação Produzida:** Existe uma quantidade considerável de documentação já produzida, incluindo uma `DOCUMENTACAO_CANONICA.md` detalhada.
*   **Desenvolvimento Ativo:** O `CHANGELOG.md` demonstra um desenvolvimento contínuo e recente, com foco na melhoria do Backoffice Admin e do domínio Cron.

### 1.2 Fragilidades Atuais

As principais fragilidades identificadas, conforme a `ANALISE_TECNICA_SISTEMA_ATUAL.md` [1], são:

*   **Raiz Excessivamente Carregada:** A raiz do repositório contém diversos documentos analíticos e estratégicos (`Analise_Tecnica_Completa_MMN_AI_to_AI.md`, `CORRECOES_TECNICAS.md`, `FUSAO_LEGACY_OFICIAL.md`, `INCONSISTENCIAS.md`, `PROPOSTAS_E_ROADMAP_DE_MELHORIA.md`, `Todo.md`, `analise_mercado_brasil_mmn_afiliados_ia.pdf`) que poluem visualmente e dificultam a navegação e descoberta da documentação canônica.
*   **Documentação Duplicada/Dispersa:** A pasta `docs/` possui conteúdo útil, mas com múltiplas trilhas paralelas (`docs/agentic/`, `docs/planning/`, `docs/reports/`, `docs/roadmaps/`, `docs/v16_delivery/`) e duplicações semânticas, como `docs/roadmap_fusao_mmn.md` e `docs/roadmaps/roadmap_fusao_mmn.md`, reduzindo a clareza sobre a fonte oficial.
*   **Superfície Funcional vs. Navegação Principal:** Existe um desequilíbrio entre a capacidade de interface já codificada no frontend (`frontend/src/App.tsx` lista muitas páginas) e a exposição efetiva dessas áreas no fluxo principal do produto, sugerindo que a fusão técnica avançou mais rápido que a fusão de experiência e roteamento.
*   **Artefatos Paralelos Coexistentes:** A presença de `orquestrador-dashboard/`, `extracted_ecosystem/`, `browser/`, `extract/` e grandes blocos de documentação/planning no mesmo nível do produto principal indica uma mistura de produto, experimentos, extrações e subprodutos de análise, necessitando de reorganização.
*   **Drift de Bootstrap/Dependências:** O processo de bootstrap ainda precisa de normalização contínua para manter a coerência entre a documentação de instalação, scripts de build e dependências efetivamente necessárias.

## 2. Plano de Ação para Próximos Passos de Desenvolvimento

O plano de desenvolvimento inicial focará nas recomendações de higiene do repositório e consolidação documental, que são cruciais para facilitar o trabalho futuro e garantir a clareza arquitetural.

### Fase 1: Higiene do Repositório e Consolidação Documental

**Objetivo:** Organizar a estrutura de arquivos do repositório, centralizar a documentação e eliminar duplicações para melhorar a navegabilidade e a clareza.

**Tarefas:**

1.  **Mover Documentos da Raiz para `docs/repository-review/`:**
    *   Identificar todos os arquivos `.md` e `.pdf` na raiz do repositório que são de natureza analítica ou estratégica e movê-los para a pasta `docs/repository-review/`. Exemplos incluem `Analise_Tecnica_Completa_MMN_AI_to_AI.md`, `CORRECOES_TECNICAS.md`, `FUSAO_LEGACY_OFICIAL.md`, `INCONSISTENCIAS.md`, `PROPOSTAS_E_ROADMAP_DE_MELHORIA.md`, `Todo.md`, `analise_mercado_brasil_mmn_afiliados_ia.pdf`.
    *   Atualizar quaisquer referências internas a esses arquivos nos documentos restantes.
2.  **Consolidar Documentação em `docs/`:**
    *   Revisar as subpastas em `docs/` (`agentic/`, `planning/`, `reports/`, `roadmaps/`, `v16_delivery/`) e os arquivos avulsos para identificar duplicações e conteúdo desatualizado.
    *   Criar um índice centralizado ou um guia de navegação para a documentação, apontando para as fontes oficiais e explicando a finalidade de cada seção.
    *   Remover arquivos duplicados ou obsoletos, como `docs/roadmap_fusao_mmn.md` se `docs/roadmaps/roadmap_fusao_mmn.md` for a versão oficial.
3.  **Atualizar `README.md`:**
    *   Remover menções a documentos que foram movidos da raiz.
    *   Adicionar uma seção clara sobre a estrutura da documentação e como navegar por ela, apontando para a `DOCUMENTACAO_CANONICA.md` e o novo índice de documentação.

### Fase 2: Análise e Consolidação do Frontend

**Objetivo:** Mapear as rotas do frontend, identificar páginas órfãs e planejar a integração das funcionalidades existentes na navegação principal.

**Tarefas:**

1.  **Mapear Rotas e Componentes:**
    *   Criar um inventário detalhado de todas as rotas definidas em `frontend/src/App.tsx` e seus respectivos componentes.
    *   Identificar quais dessas rotas são acessíveis através da `NAVIGATION_STRUCTURE` e quais podem ser consideradas 
órfãs ou de difícil acesso.
2.  **Propor Consolidação de Navegação:**
    *   Com base no mapeamento, propor um plano para integrar as funcionalidades existentes na navegação principal, garantindo que todas as áreas importantes do sistema sejam facilmente acessíveis.
    *   Considerar a criação de um menu de navegação mais dinâmico ou a reorganização das categorias existentes.

### Fase 3: Claridade de Artefatos Auxiliares

**Objetivo:** Isolar experimentos, extrações e dashboards paralelos em áreas mais explícitas para evitar confusão com o produto principal.

**Tarefas:**

1.  **Criar Pastas Dedicadas:**
    *   Mover `orquestrador-dashboard/`, `extracted_ecosystem/`, `browser/`, `extract/` para uma pasta de nível superior como `auxiliary/` ou `experiments/`.
    *   Documentar a finalidade de cada uma dessas pastas auxiliares.

### Fase 4: Normalização do Bootstrap e Dependências

**Objetivo:** Garantir a coerência entre a documentação de instalação, scripts de build e dependências.

**Tarefas:**

1.  **Revisar `package.json` e Scripts:**
    *   Verificar a consistência das dependências e scripts em todos os `package.json` (raiz, backend, frontend, mobile).
    *   Garantir que os scripts de build e desenvolvimento estejam atualizados e funcionais.
2.  **Atualizar Documentação de Instalação:**
    *   Revisar e atualizar a seção "Como Iniciar" no `README.md` e na `DOCUMENTACAO_CANONICA.md` para refletir o estado atual das dependências e do processo de bootstrap.

## 3. Próximos Passos Imediatos

Para iniciar a execução deste plano, o próximo passo imediato será a **Fase 1: Higiene do Repositório e Consolidação Documental**.

### Referências

[1] [Análise Técnica do Sistema Atual](docs/repository-review/ANALISE_TECNICA_SISTEMA_ATUAL.md)
