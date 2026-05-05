# MMN AI-to-AI - Todo List

## Fase 1: Análise e Planejamento

- [x] Definir requisitos funcionais e não-funcionais

- [x] Mapear fluxos de usuário por perfil

- [x] Documentar arquitetura do sistema

- [x] Criar diagramas de fluxo (autenticação, comissões, pagamentos, dropshipping)

## Fase 2: Modelagem de Dados e Schema

### Tabelas Principais

- [x] users - Usuários com perfis hierárquicos

- [x] affiliates - Dados específicos de afiliados

- [x] network - Relações de patrocínio pai-filho

- [x] commissions - Histórico de comissões calculadas

- [x] payments - Registro de pagamentos e recebimentos

- [x] agents - Configuração e estado de cada agente IA

- [x] agent_upgrades - Upgrades ativados por agente

- [x] upgrades - Plugins e módulos disponíveis

- [x] products - Catálogo de produtos de marketplaces

- [x] orders - Histórico de pedidos e conversões

- [x] bonuses - Registro de bônus e prêmios

- [x] materials - Banners, e-books e materiais de divulgação

- [x] notifications - Alertas do sistema

### Migrations

- [x] Gerar migrations do Drizzle

- [x] Aplicar migrations ao banco de dados

## Fase 3: Backend - Autenticação e Autorização

- [x] Estender schema de usuários com campos MMN

- [x] Implementar middleware de autorização por perfil (admin, líder, supervisor, afiliado)

- [x] Criar procedures tRPC para login/logout

- [x] Implementar verificação de perfil em procedures protegidas

- [x] Criar sistema de mini-site com ID de afiliado

- [x] Implementar rastreamento de indicação via URL

- [x] Testes unitários de autenticação

## Fase 4: Backend - Lógica MMN e Comissões

- [x] Implementar cálculo de comissões por nível (até 15 níveis)

- [x] Implementar cálculo de comissões por largura (bônus por indicados diretos)

- [x] Criar procedure para registrar indicação

- [x] Criar procedure para visualizar árvore de indicados

- [x] Implementar sistema de bônus e prêmios

- [x] Criar procedure para visualizar histórico de comissões

- [x] Testes de lógica de comissões

## Fase 5: Backend - Gestão de Pagamentos

- [x] Implementar inserção de receitas

- [x] Implementar identificação automática de pagamentos

- [x] Implementar confirmação e comissionamento

- [x] Criar procedure para gerar extrato de remuneração

- [x] Implementar rastreamento de inadimplentes

- [x] Testes de fluxo de pagamentos

## Fase 6: Backend - Agentes IA e Upgrades

- [x] Criar estrutura de dados para agentes

- [x] Implementar inicialização de agente por usuário

- [x] Criar procedures para configurar agente

- [x] Implementar sistema de upgrades/plugins

- [x] Criar procedure para ativar/desativar upgrades

- [x] Implementar armazenamento de estado do agente

- [x] Integração com LLM para geração de conteúdo

- [x] Testes de agentes IA

## Fase 7: Backend - Integração com Marketplaces

- [x] Implementar integração com API do Mercado Livre

- [x] Implementar integração com API do Shopee

- [x] Implementar integração com API do Hotmart

- [x] Criar job para sincronizar produtos diariamente

- [x] Implementar análise de tendências

- [x] Criar procedure para listar produtos recomendados

- [x] Implementar cálculo de margem de afiliado

- [x] Testes de integração com marketplaces

## Fase 8: Backend - Dropshipping Automatizado

- [x] Criar procedure para registrar pedido

- [x] Implementar notificação ao fornecedor

- [x] Criar procedure para atualizar status de pedido

- [x] Implementar notificação ao cliente

- [x] Criar procedure para registrar comissão de venda

- [x] Implementar fluxo completo de pedido

- [x] Testes de dropshipping

## Fase 9: Frontend - Autenticação e Layout

- [x] Criar página de login

- [x] Implementar redirecionamento após login

- [x] Criar layout principal com navegação

- [x] Implementar menu de perfil do usuário

- [x] Criar página de logout

- [x] Implementar verificação de autenticação em rotas

- [x] Design system e paleta de cores

## Fase 10: Frontend - Dashboard do Afiliado

- [ ] Criar dashboard principal com KPIs

- [ ] Implementar visualização de ganhos acumulados

- [ ] Criar gráfico de performance do agente IA

- [ ] Implementar visualização de árvore de indicados

- [ ] Criar seção de estatísticas da rede

- [ ] Implementar visualização de upgrades disponíveis

- [ ] Criar mini-site personalizado do afiliado

## Fase 11: Frontend - Painel Administrativo

- [ ] Criar dashboard administrativo

- [ ] Implementar gerenciador de usuários

- [ ] Criar painel de configuração de comissões

- [ ] Implementar relatório de rede completa

- [ ] Criar gerenciador de pagamentos

- [ ] Implementar visualização de inadimplentes

- [ ] Criar gerenciador de materiais de divulgação

## Fase 12: Frontend - Gerenciamento de Agentes IA

- [ ] Criar interface de configuração do agente

- [ ] Implementar visualização de estado do agente

- [ ] Criar painel de geração de conteúdo

- [ ] Implementar agendador de postagens

- [ ] Criar visualização de produtos recomendados

- [ ] Implementar gerenciador de upgrades

- [ ] Integrar geração de imagens

## Fase 13: Frontend - Marketplaces e Dropshipping

- [ ] Criar página de produtos recomendados

- [ ] Implementar visualização de tendências

- [ ] Criar painel de pedidos de dropshipping

- [ ] Implementar rastreamento de pedidos

- [ ] Criar notificações de pedidos

## Fase 14: Frontend - Sistema de Bônus e Materiais

- [ ] Criar página de bônus e prêmios

- [ ] Implementar visualização de top patrocinadores

- [ ] Criar gerenciador de banners

- [ ] Implementar gerenciador de e-books

- [ ] Criar visualização de materiais de divulgação

## Fase 15: Testes e Qualidade

- [ ] Escrever testes unitários para lógica MMN

- [ ] Criar testes de integração para APIs

- [ ] Implementar testes de autenticação

- [ ] Testar fluxo de comissões

- [ ] Testar integração com marketplaces

- [ ] Validar segurança e controle de acesso

- [ ] Testes de performance

## Fase 16: Documentação e Entrega

- [ ] Documentar APIs tRPC

- [ ] Criar guia de uso para afiliados

- [ ] Documentar guia de administrador

- [ ] Criar documentação técnica

- [ ] Preparar manual de integração

- [ ] Gerar relatório final do projeto

