# Sprint 4: IA Content Hub Avançado - Documentação de Implementação

**Data de Início**: 14 de Maio de 2026  
**Status**: Em Desenvolvimento  
**Versão**: 1.0.0  

---

## 📋 Visão Geral

A Sprint 4 implementa funcionalidades avançadas do **IA Content Hub**, expandindo as capacidades de geração de conteúdo com suporte a múltiplos modelos de IA, agendamento de posts, templates dinâmicos e analytics em tempo real.

### Objetivos Principais

1. **Integração com Google Genkit**: Suporte a modelos Gemini do Google
2. **Múltiplos Modelos de IA**: Google Gemini, OpenAI GPT, Modelos Proprietários MMN
3. **Templates de Conteúdo**: Sistema de templates com variáveis dinâmicas
4. **Agendamento de Posts**: Integração com filas BullMQ para publicação automática
5. **Analytics de Conteúdo**: Dashboard com métricas de performance

---

## 🏗️ Arquitetura

### Backend

#### Serviços Criados

**1. `genkit-integration.ts`** - Integração com Google Genkit
- Suporte a múltiplos provedores de IA
- Roteamento dinâmico de requisições
- Configuração de modelos
- Funções de ativação/desativação de modelos

```typescript
// Modelos Suportados
- Google Gemini 2.0 Flash
- Google Gemini 1.5 Pro
- OpenAI GPT-4 Mini
- MMN Copywriting V1 (Proprietário)
- MMN Strategy V1 (Proprietário)
```

**2. `aiContentHubRouter.ts`** - Router tRPC para IA Content Hub
- `listModels()` - Listar modelos disponíveis
- `getModel(modelId)` - Obter informações de um modelo
- `generateContent()` - Gerar conteúdo com modelo selecionado
- `generateVariations()` - Gerar múltiplas variações
- `createTemplate()` - Criar template de conteúdo
- `schedulePost()` - Agendar post para publicação
- `getContentAnalytics()` - Obter analytics de conteúdo

#### Integração com Routers Existentes

O novo `aiContentHubRouter` foi integrado ao `appRouter` em `authRouter.ts`:

```typescript
export const appRouter = router({
  // ... outros routers
  aiContentHub: aiContentHubRouter,
});
```

### Frontend

#### Componentes Criados

**1. `AIModelSelectorAdvanced.tsx`** - Seletor avançado de modelos
- Visualização de estatísticas de modelos
- Comparação de custos e performance
- Configurações avançadas (temperatura, max tokens)
- Histórico de uso
- Tabs: Visão Geral, Comparação, Configurações

**2. `PostSchedulerAdvanced.tsx`** - Agendador avançado de posts
- Agendamento para múltiplas plataformas
- Seleção de melhor horário para publicação
- Visualização de posts agendados
- Edição e cancelamento de posts
- Métricas de engajamento para posts publicados

#### Componentes Existentes Melhorados

- `AIModelSelector.tsx` - Base para seletor avançado
- `ContentTemplate.tsx` - Sistema de templates
- `ContentAnalytics.tsx` - Dashboard de analytics
- `PostScheduler.tsx` - Agendador básico

---

## 🔌 Integração com Sistemas Existentes

### BullMQ (Filas de Processamento)

Os posts agendados são adicionados à fila `contentGenerationQueue`:

```typescript
// Estrutura do job
{
  jobId: string;
  type: "schedule_post";
  data: {
    postId: string;
    content: string;
    platforms: string[];
    scheduledFor: Date;
  };
  status: "pending" | "active" | "completed" | "failed";
}
```

### Banco de Dados

Tabelas relacionadas (a serem criadas):

```sql
-- Templates de Conteúdo
CREATE TABLE content_templates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  content LONGTEXT,
  variables JSON,
  platform VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts Agendados
CREATE TABLE scheduled_posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  platforms JSON,
  scheduled_for TIMESTAMP,
  status ENUM('scheduled', 'published', 'failed', 'cancelled'),
  media_urls JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL
);

-- Analytics de Conteúdo
CREATE TABLE content_analytics (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  platform VARCHAR(50),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Fluxo de Dados

### Geração de Conteúdo

```
Frontend (Prompt)
    ↓
AIContentHubRouter.generateContent()
    ↓
genkit-integration.generateContent()
    ↓
Roteador de Provedor
    ├─ Google Gemini API
    ├─ OpenAI API
    └─ Modelo Proprietário (placeholder)
    ↓
Resposta com Conteúdo
    ↓
Frontend (Preview)
```

### Agendamento de Posts

```
Frontend (Agendar)
    ↓
AIContentHubRouter.schedulePost()
    ↓
Salvar no Banco de Dados
    ↓
Adicionar à Fila BullMQ
    ↓
contentGenerationWorker
    ├─ Aguardar horário
    ├─ Publicar em plataformas
    └─ Atualizar status
    ↓
Analytics (rastreamento)
```

---

## 🔑 Configurações Necessárias

### Variáveis de Ambiente

```env
# Google Genkit
GOOGLE_API_KEY=<sua-chave-api-google>
GOOGLE_PROJECT_ID=<seu-projeto-google>

# OpenAI
OPENAI_API_KEY=<sua-chave-api-openai>

# BullMQ
REDIS_URL=redis://localhost:6379

# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/mmn_ai
```

### Dependências NPM

Backend:
```bash
npm install @genkit-ai/ai @genkit-ai/google-ai
npm install openai
npm install bullmq
```

Frontend:
```bash
npm install lucide-react sonner
```

---

## 🧪 Testes

### Testes Unitários

```bash
# Backend
npm run test backend/src/services/genkit-integration.test.ts
npm run test backend/src/routers/aiContentHubRouter.test.ts

# Frontend
npm run test frontend/src/components/AIModelSelectorAdvanced.test.tsx
npm run test frontend/src/components/PostSchedulerAdvanced.test.tsx
```

### Testes de Integração

```bash
npm run test:integration
```

### Testes E2E

```bash
npm run test:e2e
```

---

## 📈 Métricas de Sucesso

| Métrica | Target | Status |
|---------|--------|--------|
| Tempo de resposta (geração) | < 2s | 📍 |
| Modelos disponíveis | 5+ | ✅ |
| Taxa de sucesso (agendamento) | > 99% | 📍 |
| Cobertura de testes | > 80% | 📍 |
| Performance (Lighthouse) | > 90 | 📍 |

---

## 🚀 Próximos Passos

### Fase 1: Testes e Validação
- [ ] Testes unitários completos
- [ ] Testes de integração com APIs reais
- [ ] Testes de carga
- [ ] Validação de segurança

### Fase 2: Otimizações
- [ ] Cache de respostas
- [ ] Compressão de dados
- [ ] Otimização de queries
- [ ] Implementação de rate limiting

### Fase 3: Recursos Adicionais
- [ ] Suporte a imagens e vídeos
- [ ] Análise de sentimento
- [ ] Recomendações de conteúdo
- [ ] Integração com redes sociais reais

### Fase 4: Deploy
- [ ] Deploy em staging
- [ ] Testes de produção
- [ ] Monitoramento
- [ ] Documentação de usuário

---

## 📚 Referências

- [Google Genkit Documentation](https://github.com/firebase/genkit)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [tRPC Documentation](https://trpc.io/)

---

## 👥 Responsáveis

- **Desenvolvimento Backend**: Manus AI
- **Desenvolvimento Frontend**: Manus AI
- **QA**: Manus AI
- **DevOps**: Manus AI

---

## 📝 Changelog

### v1.0.0 (14 de Maio de 2026)
- ✅ Criação de `genkit-integration.ts`
- ✅ Criação de `aiContentHubRouter.ts`
- ✅ Criação de `AIModelSelectorAdvanced.tsx`
- ✅ Criação de `PostSchedulerAdvanced.tsx`
- ✅ Integração com `appRouter`
- 📍 Testes e validação (em andamento)

---

## 🤝 Contribuindo

Para contribuir com a Sprint 4:

1. Crie uma branch: `git checkout -b feature/sprint-4-<feature-name>`
2. Faça commits atômicos: `git commit -m "feat(sprint4): descrição"`
3. Push para a branch: `git push origin feature/sprint-4-<feature-name>`
4. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o time de desenvolvimento.
