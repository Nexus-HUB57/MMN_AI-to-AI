# Módulo de Gerenciamento de Agentes IA - Fase 12

## Visão Geral

O módulo de Gerenciamento de Agentes IA fornece uma interface completa para configurar, monitorar e operar agentes de inteligência artificial. O painel permite que os usuários gerenciem todas as capacidades do agente em uma única aplicação.

## Arquitetura

### Banco de Dados

O módulo utiliza as seguintes tabelas:

- **agents**: Configuração e estado do agente (nome, especialização, métricas, status)
- **scheduled_posts**: Postagens agendadas para publicação em múltiplas plataformas
- **recommended_products**: Produtos recomendados pelo agente com scores de relevância
- **generated_content**: Histórico de conteúdo gerado (texto, imagem, vídeo)
- **agent_skills**: Habilidades e upgrades do agente com status de desbloqueio
- **evolution_history**: Histórico de evolução e marcos do agente
- **generated_images**: Imagens geradas via IA com prompts

### Backend (tRPC Routers)

O módulo implementa os seguintes procedimentos tRPC em `server/routers.ts`:

#### Agentes
- `agents.getAgent()` - Buscar agente do usuário atual
- `agents.updateAgent(data)` - Atualizar configuração do agente

#### Postagens Agendadas
- `agents.getScheduledPosts()` - Listar postagens agendadas
- `agents.createScheduledPost(data)` - Criar nova postagem agendada
- `agents.updateScheduledPost(id, data)` - Atualizar status de postagem

#### Produtos Recomendados
- `agents.getRecommendedProducts()` - Listar produtos recomendados
- `agents.createRecommendedProduct(data)` - Adicionar novo produto

#### Skills e Upgrades
- `agents.getAgentSkills()` - Listar skills do agente
- `agents.createAgentSkill(data)` - Adicionar nova skill
- `agents.updateAgentSkill(id, data)` - Atualizar status/proficiência da skill

#### Histórico de Evolução
- `agents.getEvolutionHistory()` - Listar eventos de evolução
- `agents.createEvolutionHistory(data)` - Registrar novo evento

#### Conteúdo Gerado
- `agents.getGeneratedContent()` - Listar conteúdo gerado
- `agents.createGeneratedContent(data)` - Salvar novo conteúdo

#### Imagens Geradas
- `agents.getGeneratedImages()` - Listar imagens geradas
- `agents.createGeneratedImage(data)` - Salvar nova imagem

### Frontend (React Components)

O módulo implementa os seguintes componentes em `client/src/components/agents/`:

#### Páginas
- **Agents.tsx** - Página principal com navegação por abas

#### Componentes
- **AgentStatus.tsx** - Visualização de estado e métricas em tempo real
- **AgentConfiguration.tsx** - Formulário de edição de configurações
- **ContentGenerator.tsx** - Interface para geração de conteúdo com LLM
- **PostScheduler.tsx** - Calendário e fila de postagens agendadas
- **RecommendedProducts.tsx** - Listagem de produtos com scores de relevância
- **SkillsUpgrades.tsx** - Gerenciador de skills com histórico de evolução
- **ImageGenerator.tsx** - Gerador de imagens com IA

## Fluxos Principais

### 1. Configuração do Agente
1. Usuário acessa `/agents`
2. Clica na aba "Configuração"
3. Preenche formulário com nome, especialização, system prompt e descrição
4. Carrega avatar (salvo como data URL)
5. Clica em "Salvar Configurações"
6. Dados são enviados via `agents.updateAgent` e persistidos no banco

### 2. Geração de Conteúdo
1. Usuário acessa aba "Conteúdo"
2. Seleciona tipo de conteúdo (texto, imagem, vídeo)
3. Escolhe plataforma de destino (WhatsApp, Instagram, etc.)
4. Insere prompt descritivo
5. Clica em "Gerar Conteúdo"
6. Sistema gera conteúdo (mock LLM) e exibe preview
7. Usuário pode copiar ou agendar como postagem

### 3. Agendamento de Postagens
1. Usuário acessa aba "Postagens"
2. Preenche conteúdo, plataforma e data/hora
3. Adiciona imagem opcional
4. Clica em "Agendar Postagem"
5. Postagem é criada com status "agendado"
6. Usuário pode visualizar fila e atualizar status manualmente

### 4. Gerenciamento de Skills
1. Usuário acessa aba "Skills"
2. Visualiza skills ativas, desbloqueadas e bloqueadas
3. Pode desbloquear skills bloqueadas (com custo)
4. Pode ativar skills desbloqueadas
5. Visualiza histórico de evolução do agente

### 5. Geração de Imagens
1. Usuário acessa aba "Imagens"
2. Insere descrição/prompt para imagem
3. Clica em "Gerar Imagem"
4. Sistema gera imagem (mock) e exibe preview
5. Usuário pode baixar ou copiar URL
6. Imagem é salva no histórico

## Tipos de Dados

Veja `client/src/types/agent.ts` para as definições completas de tipos TypeScript.

### Agent
```typescript
{
  id: number;
  userId: number;
  agentId: string;
  name: string;
  specialization: string;
  systemPrompt: string | null;
  description: string | null;
  avatarUrl: string | null;
  status: 'genesis' | 'active' | 'hibernating' | 'critical' | 'dead' | 'resurrectable';
  sencienceLevel: string | number;
  health: number; // 0-100
  energy: number; // 0-100
  creativity: number; // 0-100
  reputation: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}
```

### ScheduledPost
```typescript
{
  id: number;
  agentId: string;
  content: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  scheduledAt: Date;
  status: 'agendado' | 'publicado' | 'falhou';
  imageUrl: string | null;
  failureReason: string | null;
  createdAt: Date;
  publishedAt: Date | null;
}
```

### AgentSkill
```typescript
{
  id: number;
  agentId: string;
  skillName: string;
  description: string | null;
  level: number;
  proficiency: string | number; // 0-100
  status: 'locked' | 'unlocked' | 'active';
  cost: string | number | null;
  acquiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testes

Testes unitários estão em:
- `server/agents.test.ts` - Testes dos procedimentos tRPC

Execute testes com:
```bash
pnpm test
```

## Próximas Melhorias

1. **Integração Real de LLM**: Substituir mocks por chamadas reais a `invokeLLM`
2. **Geração de Imagens Real**: Integrar com `generateImage` do backend
3. **Upload de Avatar**: Implementar upload real com `storagePut`
4. **Notificações em Tempo Real**: Adicionar WebSocket para atualizações de métricas
5. **Calendário Visual**: Implementar calendário interativo para agendamento
6. **Filtros e Busca**: Adicionar filtros avançados para produtos e postagens
7. **Proteção com protectedProcedure**: Usar `protectedProcedure` para todas as mutations
8. **Testes Frontend**: Adicionar testes para componentes React

## Notas de Implementação

- Todos os componentes usam shadcn/ui para consistência visual
- Dados são gerenciados via tRPC com type-safety completo
- Autenticação é verificada no frontend via `useAuth()`
- Mocks são usados para LLM e geração de imagens (substituir em produção)
- Avatares são salvos como data URLs (melhorar com storage real)
- Notificações ao owner ainda não foram implementadas

## Contato e Suporte

Para questões sobre este módulo, consulte a documentação do projeto MMN-AI-to-AI.
