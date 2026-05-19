# Consolidação Documental — Fase 2

## Objetivo

Esta etapa consolida a segunda rodada de organização documental do repositório **MMN AI-to-AI**, com foco em três frentes:

1. reduzir duplicações evidentes em `docs/`
2. definir caminhos canônicos para leitura do projeto
3. separar melhor produto principal, documentação histórica e artefatos paralelos

## Diagnóstico aplicado

Durante a revisão estrutural foram observados alguns padrões de dispersão documental:

- arquivos estratégicos na raiz já haviam sido movidos para `docs/repository-review/`
- ainda existiam documentos sem fonte canônica explícita
- havia duplicidade do roadmap de fusão em:
  - `docs/roadmap_fusao_mmn.md`
  - `docs/roadmaps/roadmap_fusao_mmn.md`
- a navegação documental não deixava claro o que é:
  - documento oficial
  - documento histórico
  - relatório de revisão
  - material de entrega legado

## Decisões desta fase

### 1. Documento canônico da fusão

Fica definido como **fonte principal** do roadmap de fusão:

- `docs/roadmap_fusao_mmn.md`

O arquivo duplicado em `docs/roadmaps/roadmap_fusao_mmn.md` deve permanecer apenas como ponte de compatibilidade, apontando para o documento canônico.

### 2. Área oficial de revisão do repositório

Fica consolidado o uso de:

- `docs/repository-review/`

como espaço para:

- análise técnica do estado atual
- resumo executivo
- diagnóstico de reorganização
- revisão da navegação frontend
- avaliação de artefatos paralelos

### 3. Organização por intenção

A organização documental recomendada passa a seguir a lógica abaixo:

- `docs/agentic/` → visão e evolução da camada agentic
- `docs/reports/` → relatórios técnicos e inventários
- `docs/planning/` → planejamento operacional e materiais de trabalho
- `docs/roadmaps/` → roadmaps históricos e sprint-level
- `docs/repository-review/` → curadoria estrutural do repositório
- `docs/v16_delivery/` → entregáveis/documentos de release histórico

## Mapa canônico recomendado

### Leitura inicial do projeto

1. `README.md`
2. `docs/repository-review/README.md`
3. `docs/repository-review/ANALISE_TECNICA_SISTEMA_ATUAL.md`
4. `docs/repository-review/RESUMO_EXECUTIVO_SISTEMA_ATUAL.md`

### Fusão e migração

1. `docs/roadmap_fusao_mmn.md`
2. `docs/VALIDACAO_FUSAO_FASE1.md`
3. `docs/VALIDACAO_FUSAO_FASE2.md`
4. `docs/RELATORIO_VALIDACAO_FUSAO.md`
5. `docs/reports/legacy-inventory.md`

### Camada agentic

1. `docs/agentic/ARQUITETURA_AGENTIC_ALVO.md`
2. `docs/agentic/ROADMAP_AGENTIC_EXECUCAO.md`
3. `docs/agentic/OPERACAO_AGENTIC_SRE_COMPLIANCE.md`
4. `docs/agentic/PLANO_SPRINTS_AGENTIC.md`

## Próximos passos recomendados

- criar um índice `docs/README.md` para facilitar onboarding
- transformar duplicatas documentais em ponte curta, não em cópia integral
- consolidar arquivos muito semelhantes dentro de trilhas canônicas
- revisar também os artefatos fora de `docs/` que ainda não pertencem claramente ao produto principal

## Resultado desta rodada

A segunda rodada de reorganização melhora a governança documental sem apagar histórico. O foco foi reduzir ambiguidades e deixar mais claro **onde começa a leitura certa do sistema**.
