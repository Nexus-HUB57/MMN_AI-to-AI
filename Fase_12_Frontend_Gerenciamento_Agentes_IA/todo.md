# Fase 12: Gerenciamento de Agentes IA - TODO

## Funcionalidades Principais

### Banco de Dados
- [x] Estender schema com tabelas para posts agendados
- [x] Estender schema com tabelas para produtos recomendados
- [x] Estender schema com tabelas para geração de conteúdo
- [x] Gerar e aplicar migrations SQL

### Interface de Configuração do Agente
- [x] Criar página AgentConfiguration.tsx
- [x] Implementar formulário de edição (nome, especialização, system prompt, descrição, avatar)
- [x] Adicionar upload de avatar com storage S3
- [x] Criar procedimento tRPC para atualizar configuração do agente
- [ ] Validar e testar com vitest

### Visualização de Estado do Agente
- [x] Criar componente AgentStatus.tsx
- [x] Exibir métricas em tempo real (health, energy, creativity, reputation, sencience, status)
- [x] Implementar gráficos/indicadores visuais
- [x] Criar procedimento tRPC para buscar estado atual
- [ ] Testar com vitest

### Painel de Geração de Conteúdo
- [x] Criar página ContentGenerator.tsx
- [x] Implementar interface para geração de textos/posts
- [x] Integrar LLM com base na especialização do agente
- [x] Adicionar preview de conteúdo gerado
- [x] Criar procedimento tRPC para geração de conteúdo
- [ ] Testar com vitest

### Agendador de Postagens
- [x] Criar página PostScheduler.tsx
- [x] Implementar calendário para agendamento
- [x] Criar fila de postagens com data/hora, plataforma e status
- [x] Adicionar CRUD para postagens agendadas
- [x] Criar procedimentos tRPC para gerenciar postagens
- [ ] Testar com vitest

### Visualização de Produtos Recomendados
- [x] Criar página RecommendedProducts.tsx
- [x] Exibir lista de produtos com score de relevância
- [x] Adicionar links de afiliado
- [ ] Implementar filtros e busca
- [x] Criar procedimento tRPC para listar produtos
- [ ] Testar com vitest

### Gerenciador de Upgrades e Skills
- [x] Criar página SkillsUpgrades.tsx
- [x] Exibir lista de skills disponíveis e adquiridos
- [x] Implementar interface para adquirir skills
- [x] Mostrar histórico de evolução
- [x] Criar procedimentos tRPC para gerenciar skills
- [ ] Testar com vitest

### Integração de Geração de Imagens
- [x] Criar componente ImageGenerator.tsx
- [x] Implementar interface para gerar imagens com prompt
- [x] Integrar com serviço de geração de imagens
- [x] Adicionar visualização e salvamento no storage
- [x] Criar procedimento tRPC para geração de imagens
- [ ] Testar com vitest

### Notificações Automáticas
- [ ] Implementar notificação ao owner para marcos importantes
- [ ] Alertas de saúde/energia crítica
- [ ] Notificação de skill completado
- [ ] Notificação de postagem publicada com sucesso
- [ ] Criar procedimento tRPC para notificações
- [ ] Testar com vitest

### Layout e Navegação
- [x] Criar layout principal do painel de agentes
- [x] Implementar navegação entre módulos
- [ ] Adicionar barra lateral com menu
- [x] Integrar com autenticação
- [x] Criar rota principal /agents

### Testes e Validação
- [x] Escrever testes unitários para cada módulo
- [x] Testar fluxos de integração
- [ ] Validar performance
- [ ] Testar responsividade

### Documentação e Entrega
- [ ] Criar documentação do módulo
- [ ] Preparar checkpoint final
- [ ] Entregar projeto ao usuário
