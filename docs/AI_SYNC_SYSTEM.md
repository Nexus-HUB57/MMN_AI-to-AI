# AI Agents & Skills Synchronization - Technical Guide

## Overview

This document describes the AI Agents synchronization system, including skill management, model recommendations, and integration with the LLM layer.

**Author:** MiniMax Agent
**Date:** 2026-05-23
**Version:** 1.0.0

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  SkillsMarketplace │ Agents Dashboard │ Sync Status             │
└────────────────────────────┬────────────────────────────────────┘
                             │ tRPC
┌────────────────────────────▼────────────────────────────────────┐
│                     BACKEND (Node.js)                            │
├─────────────────────────────────────────────────────────────────┤
│  aiSyncRouter.ts │ skillsRouter.ts │ agentsRouter.ts             │
│                         │                                       │
│  ┌──────────────────────▼────────────────────────────────────┐ │
│  │              AgentSyncService.ts                           │ │
│  │  - syncAgentSkills()                                        │ │
│  │  - getAgentSyncProfile()                                   │ │
│  │  - syncAllAgents()                                          │ │
│  │  - checkExpiredSkills()                                    │ │
│  └──────────────────────┬────────────────────────────────────┘ │
│                         │                                       │
│  ┌──────────────────────▼────────────────────────────────────┐ │
│  │              seedSkills.ts                                  │ │
│  │  - 30 skills (10 basic, 10 intermediate, 10 advanced)       │ │
│  │  - 10 categories                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   DATABASE (MySQL/Drizzle)                       │
│  skills │ agent_skills │ agents │ skill_categories              │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Sync Router (aiSyncRouter.ts)

### Endpoints

#### Protected Endpoints (Authenticated Users)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `aiSync.syncMyAgent` | Mutation | Sync current user's agent skills |
| `aiSync.getMySyncProfile` | Query | Get sync profile for current agent |

#### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `aiSync.syncAgent` | Mutation | Sync specific agent by ID |
| `aiSync.getAgentSyncProfile` | Query | Get sync profile for specific agent |
| `aiSync.syncAllAgents` | Mutation | Batch sync all active agents |
| `aiSync.checkExpiredSkills` | Mutation | Check and expire skills |

#### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `aiSync.getRecommendedModels` | Query | Get recommended models by category |
| `aiSync.getLevelCapabilities` | Query | Get capabilities by skill level |

---

## AgentSyncService

### Methods

#### `syncAgentSkills(agentId: number): Promise<AgentSyncResult>`

Synchronizes the skills of a specific agent with the recommended AI models.

```typescript
interface AgentSyncResult {
  success: boolean;
  agentId: number;
  skillsSynced: number;
  modelsConfigured: number;
  errors: string[];
}
```

**Process:**
1. Fetch agent from database
2. Get active skills for the agent
3. For each skill, retrieve recommended models based on category
4. Update agent configuration with model mappings
5. Return sync result

#### `getAgentSyncProfile(agentId: number): Promise<AgentSyncProfile | null>`

Returns a comprehensive sync profile for an agent.

```typescript
interface AgentSyncProfile {
  agentId: number;
  userId: number;
  currentSkills: SkillConfig[];
  availableModels: string[];
  recommendedActions: string[];
}

interface SkillConfig {
  skillId: number;
  skillName: string;
  level: "basic" | "intermediate" | "advanced";
  category: string;
  recommendedModels: string[];
  capabilities: string[];
}
```

#### `syncAllAgents(): Promise<{synced: number, errors: number}>`

Batch synchronization for all active agents (used in cron jobs).

#### `checkExpiredSkills(): Promise<number>`

Checks and expires skills that have passed their expiration date.

---

## Model Recommendations

### By Category

| Category | Primary Model | Secondary Model |
|----------|--------------|-----------------|
| copywriting | gemini-2.0-flash | gpt-4o-mini |
| social_media | gemini-2.0-flash | gpt-4o-mini |
| analytics | gemini-pro | gpt-4o |
| ads | gemini-2.0-flash | gpt-4o |
| ecommerce | gemini-2.0-flash | gpt-4o-mini |
| automation | gemini-pro | gpt-4o |
| sales | gemini-pro | gpt-4o |
| seo | gemini-2.0-flash | gpt-4o-mini |
| crm | gemini-2.0-flash | gpt-4o-mini |
| mmn | gemini-pro | gpt-4o |

### By Level

| Level | Capabilities |
|-------|--------------|
| **Basic** | text_generation, basic_analytics, scheduling |
| **Intermediate** | text_generation, image_generation, analytics, automation, scheduling |
| **Advanced** | text_generation, image_generation, video_generation, analytics, automation, scheduling, advanced_seo, multi_channel |

---

## Skills Catalog

### Basic Skills (10)

1. Copywriting Básico
2. Gestão de Redes Sociais
3. Atendimento ao Cliente
4. Analytics Básico
5. Criação de Conteúdo
6. E-mail Marketing
7. Landing Pages
8. Gestão de Leads
9. Link Tracking
10. Funil de Vendas

### Intermediate Skills (10)

1. Facebook Ads Intermediário
2. Crescimento no Instagram
3. WhatsApp Business Pro
4. SEO para Buscadores
5. Dropshipping Operações
6. Copywriting para E-mail
7. Video Marketing
8. Marketing de Afiliados
9. CRM Avançado
10. Lançamentos Digitais

### Advanced Skills (10)

1. Facebook Ads Master
2. Google Ads Expert
3. E-commerce Completo
4. Marketplace Master
5. Funil Enterprise
6. Mídia Paga Master
7. Automação Completa
8. Analytics Intelligence
9. Vendas Corporativas B2B
10. MMN Rede Master

---

## Skill Categories

| Category | Icon | Color |
|----------|------|-------|
| Anúncios | 📢 | #FF6B6B |
| Redes Sociais | 📱 | #4ECDC4 |
| E-commerce | 🛒 | #45B7D1 |
| Automação | ⚡ | #96CEB4 |
| CRM | 👥 | #DDA0DD |
| Vendas | 💰 | #98D8C8 |
| Analytics | 📊 | #F7DC6F |
| Copywriting | ✍️ | #BB8FCE |
| SEO | 🔍 | #85C1E9 |
| MMN | 🌐 | #F8B500 |

---

## Usage Examples

### Sync My Agent

```typescript
import { trpc } from '@/lib/trpc';

const syncMutation = trpc.aiSync.syncMyAgent.useMutation();

async function syncAgent() {
  const result = await syncMutation.mutateAsync();
  console.log(`Synced ${result.skillsSynced} skills`);
}
```

### Get My Sync Profile

```typescript
const { data: profile } = trpc.aiSync.getMySyncProfile.useQuery();

if (profile) {
  console.log(`Agent has ${profile.currentSkills.length} skills`);
  console.log(`Available models: ${profile.availableModels.join(', ')}`);
  console.log(`Recommended actions: ${profile.recommendedActions.join(', ')}`);
}
```

### Get Recommended Models

```typescript
const { data: models } = trpc.aiSync.getRecommendedModels.useQuery({
  categories: ['copywriting', 'analytics']
});

// Returns: [{ category: 'copywriting', models: [...] }]
```

---

## Cron Jobs Integration

### Sync All Agents (Daily)

```typescript
// In cron job configuration
{
  name: 'sync-all-agents',
  schedule: '0 2 * * *', // 2 AM daily
  handler: () => agentSyncService.syncAllAgents()
}
```

### Check Expired Skills (Hourly)

```typescript
{
  name: 'check-expired-skills',
  schedule: '0 * * * *', // Every hour
  handler: () => agentSyncService.checkExpiredSkills()
}
```

---

## Database Schema

### Tables

- `skills` - Catalog of available skills
- `agent_skills` - Many-to-many relationship between agents and skills
- `skill_usage_logs` - Usage tracking for analytics
- `skill_reviews` - User reviews and ratings
- `skill_categories` - Category definitions

### Key Fields

**skills table:**
- `id`, `name`, `slug`, `description`
- `level` (basic/intermediate/advanced)
- `category`, `subcategory`
- `price` (in cents)
- `features`, `requirements`, `integrations` (JSON)
- `status` (active/inactive/coming_soon)

**agent_skills table:**
- `agentId`, `skillId`
- `proficiency` (none/basic/intermediate/advanced/expert)
- `status` (active/inactive/expired)
- `activatedAt`, `expiresAt`
- `usageCount`, `lastUsedAt`

---

## Error Handling

| Error Code | Description |
|------------|-------------|
| `AGENT_NOT_FOUND` | Agent does not exist for user |
| `SKILL_NOT_FOUND` | Skill does not exist |
| `SKILL_ALREADY_ACTIVE` | Skill already active for agent |
| `SYNC_FAILED` | General synchronization failure |

---

## Monitoring

### Metrics

- `ai_sync.total_operations` - Total sync operations
- `ai_sync.successful_syncs` - Successful sync count
- `ai_sync.failed_syncs` - Failed sync count
- `ai_sync.expired_skills` - Skills expired per check

### Logs

All sync operations are logged with:
- Timestamp
- Agent ID
- Operation type
- Result (success/failure)
- Error details (if applicable)

---

**Last Updated:** 2026-05-23
**Author:** MiniMax Agent