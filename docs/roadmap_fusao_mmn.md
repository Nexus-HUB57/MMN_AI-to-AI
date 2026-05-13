# Roadmap de Fusão: Legado PHP para MMN AI-to-AI

Este documento detalha a estratégia para integrar as funcionalidades e o modelo de dados do sistema **Legado_PHP** ao novo ecossistema **MMN AI-to-AI**.

## 1. Visão Geral da Fusão
A fusão visa unir a robustez das regras de negócio do sistema de Marketing Multinível (MMN) tradicional com as capacidades de automação e inteligência artificial do novo sistema.

---

## 2. Fases da Implementação

### Fase 1: Mapeamento e Preparação (Atual)
- [x] Clonagem e exploração dos repositórios.
- [x] Análise da estrutura de banco de dados legada (`area123_clientes`, `pagamentos123_comissao`).
- [x] Identificação de lógica de rede (patrocinador/indicador).
- [ ] Criação de scripts de migração de dados (ETL) do PHP/MySQL para o novo Schema (Drizzle/TypeScript).

### Fase 2: Integração do Núcleo MMN
- [ ] **Migração de Genealogia**: Adaptar a lógica de `patrocinador` do legado para a tabela `network` do novo sistema.
- [ ] **Motor de Comissões**: Traduzir os scripts PHP de cálculo de bônus (`marketing123_gerar_comissao.php`) para serviços TypeScript.
- [ ] **Gestão de Planos**: Integrar os planos de marketing e níveis de carreira do legado no novo backend.

### Fase 3: Unificação do Painel Administrativo
- [ ] **Dashboard Híbrido**: Implementar no novo frontend as métricas críticas do legado (Pendentes de confirmação, Saques, Novos cadastros).
- [ ] **Ferramentas de Gestão**: Migrar funcionalidades de aprovação de pagamentos e auditoria de rede.

### Fase 4: Inteligência Artificial e Automação
- [ ] **Agentes de Suporte**: Treinar agentes de IA com base nos manuais e FAQs do sistema legado.
- [ ] **Orquestração de Vendas**: Conectar o motor de MMN com os agentes de geração de conteúdo e dropshipping já existentes no novo sistema.

---

## 3. Tabela de Equivalência de Dados

| Entidade Legada | Entidade Nova (MMN AI-to-AI) | Status |
| :--- | :--- | :--- |
| `area123_clientes` | `users` / `affiliates` | Mapeado |
| `patrocinador` | `network.sponsorId` | Mapeado |
| `pagamentos123_comissao`| `commissions` | Mapeado |
| `mdl123_newsletter` | `agents` (Marketing Automático) | A integrar |

---

## 4. Próximos Passos Imediatos
1. Finalizar a tradução do esquema de banco de dados legado para o formato Drizzle.
2. Criar um serviço de compatibilidade para leitura dos dados legados durante a transição.
3. Desenvolver o primeiro protótipo da árvore de rede no novo frontend.
