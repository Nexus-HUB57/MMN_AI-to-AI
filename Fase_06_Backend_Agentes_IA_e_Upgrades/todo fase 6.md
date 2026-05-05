# MMN AI-to-AI - Fase 6: Agentes IA e Upgrades

## Estrutura de Dados

- [x] Aplicar migrations do schema (agents, upgrades, agent_upgrades)
- [x] Validar criação das tabelas no banco de dados

## Helpers de Banco de Dados

- [x] Implementar `getAgentByUserId(userId)` em db.ts
- [x] Implementar `createAgent(data)` em db.ts
- [x] Implementar `updateAgent(agentId, data)` em db.ts
- [x] Implementar `getActiveUpgrades(agentId)` em db.ts
- [x] Implementar `getUpgradeById(upgradeId)` em db.ts

## Router de Agentes IA

- [ ] Criar arquivo `server/agentsRouter.ts`
- [ ] Implementar procedure `initializeAgent` (auto-chamada no login/registro)
- [ ] Implementar procedure `getAgent` (recuperar agente do usuário)
- [ ] Implementar procedure `updateAgent` (configurar nome, estratégia, status)
- [ ] Implementar procedure `getAgentState` (recuperar estado completo)
- [ ] Implementar procedure `updateAgentState` (atualizar performanceScore, contentStrategy)

## Router de Upgrades

- [ ] Criar arquivo `server/upgradesRouter.ts`
- [ ] Implementar procedure `listAvailable` (listar upgrades disponíveis)
- [ ] Implementar procedure `listActive` (listar upgrades ativos do agente)
- [ ] Implementar procedure `activateUpgrade` (ativar upgrade para agente)
- [ ] Implementar procedure `deactivateUpgrade` (desativar upgrade para agente)

## Router de Geração de Conteúdo

- [ ] Integrar `contentGenerationRouter` ao `appRouter`
- [ ] Validar procedures de geração de texto, variações, hashtags, sentimento, descrição de produto

## Testes Unitários

- [ ] Criar `server/agents.test.ts` com testes de inicialização e configuração
- [ ] Criar `server/upgrades.test.ts` com testes de ativação/desativação
- [ ] Criar `server/contentGeneration.test.ts` com testes de geração de conteúdo
- [ ] Executar suite de testes e validar cobertura

## Integração e Finalização

- [ ] Atualizar `server/routers.ts` para incluir agentsRouter, upgradesRouter e contentGenerationRouter
- [ ] Validar que todas as procedures estão acessíveis via tRPC
- [ ] Criar checkpoint final

