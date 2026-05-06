# tRPC Dashboard API - Documentação Técnica

## Visão Geral

Este documento descreve os endpoints tRPC implementados para a integração do Dashboard Mobile com o Backend do MMN AI-to-AI.

---

## Dashboard Router

### Namespace: `trpc.dashboard`

#### 1. `getMetrics` (Query)

**Descrição**: Retorna as métricas resumidas do dashboard do usuário, incluindo comissões totais e status do agente IA.

**Tipo**: `protectedProcedure` (requer autenticação)

**Input**: Nenhum

**Output**:
```typescript
{
  commissions: {
    total: number;
  };
  agent: {
    id: number;
    name: string;
    status: string;
    vitals: {
      energy: number;
      health: number;
    };
  } | null;
}
```

**Exemplo de Uso (React)**:
```typescript
const { data: metricsData, isLoading } = trpc.dashboard.getMetrics.useQuery();

// Acessar dados
const totalCommissions = metricsData?.commissions.total;
const agentStatus = metricsData?.agent?.status;
```

**Polling Automático**:
```typescript
const { data } = trpc.dashboard.getMetrics.useQuery(undefined, { 
  pollingInterval: 5000 // 5 segundos
});
```

---

#### 2. `getRecentSales` (Query)

**Descrição**: Retorna as vendas/pedidos recentes do afiliado do usuário.

**Tipo**: `protectedProcedure` (requer autenticação)

**Input**:
```typescript
{
  limit?: number; // Número máximo de vendas a retornar (padrão: 50)
}
```

**Output**: Array de objetos com informações de pedidos
```typescript
Array<{
  id: number;
  affiliateId: number;
  productId: number;
  value: number;
  status: string;
  createdAt: Date;
  // ... outros campos
}>
```

**Exemplo de Uso (React)**:
```typescript
const { data: recentSales } = trpc.dashboard.getRecentSales.useQuery({ 
  limit: 3 
}, { 
  pollingInterval: 5000 
});

// Renderizar vendas
recentSales?.forEach(sale => {
  console.log(`Venda: ${sale.value} - Status: ${sale.status}`);
});
```

---

## MMN Router

### Namespace: `trpc.mmn`

#### 1. `getProfile` (Query)

**Descrição**: Retorna o perfil de afiliado do usuário autenticado.

**Tipo**: `protectedProcedure` (requer autenticação)

**Input**: Nenhum

**Output**:
```typescript
{
  id: number;
  userId: number;
  affiliateCode: string;
  sponsorId?: number;
  commissionPercentage: number;
  totalCommissions: number;
  pendingCommissions: number;
  // ... outros campos
}
```

**Exemplo de Uso**:
```typescript
const { data: profile } = trpc.mmn.getProfile.useQuery();

const referralLink = `https://mmn.ai/ref/${profile?.affiliateCode}`;
```

---

#### 2. `getAgent` (Query)

**Descrição**: Retorna os dados do agente IA do usuário.

**Tipo**: `protectedProcedure` (requer autenticação)

**Input**: Nenhum

**Output**:
```typescript
{
  id: number;
  userId: number;
  name: string;
  status: "learning" | "active" | "inactive";
  contentStrategy: string; // JSON stringificado
  vitals?: {
    energy: number;
    health: number;
    creativity: number;
    reputation: number;
  };
  // ... outros campos
}
```

**Exemplo de Uso**:
```typescript
const { data: agent } = trpc.mmn.getAgent.useQuery();

const isActive = agent?.status === "active";
const energy = agent?.vitals?.energy || 0;
```

---

#### 3. `updateAgentStrategy` (Mutation)

**Descrição**: Atualiza a estratégia de conteúdo do agente IA do usuário.

**Tipo**: `protectedProcedure` (requer autenticação)

**Input**:
```typescript
{
  agentId: number;
  contentStrategy: {
    platforms: string[]; // ex: ["whatsapp", "instagram", "facebook"]
    postingFrequency: string; // ex: "hourly", "daily", "weekly"
    tone: string; // ex: "professional", "casual"
  };
}
```

**Output**:
```typescript
{
  success: boolean;
}
```

**Exemplo de Uso**:
```typescript
const updateStrategy = trpc.mmn.updateAgentStrategy.useMutation();

const handleUpdate = async () => {
  await updateStrategy.mutateAsync({
    agentId: agent.id,
    contentStrategy: {
      platforms: ["whatsapp", "instagram"],
      postingFrequency: "daily",
      tone: "professional",
    },
  });
};
```

---

## Tratamento de Erros

Todos os endpoints podem retornar os seguintes erros tRPC:

| Código | Descrição |
|--------|-----------|
| `NOT_FOUND` | Recurso não encontrado (perfil, agente, etc.) |
| `UNAUTHORIZED` | Usuário não autenticado |
| `FORBIDDEN` | Usuário não tem permissão para acessar o recurso |
| `INTERNAL_SERVER_ERROR` | Erro no servidor (ex: banco de dados indisponível) |

**Exemplo de Tratamento**:
```typescript
const { data, error } = trpc.dashboard.getMetrics.useQuery();

if (error) {
  if (error.code === "NOT_FOUND") {
    console.error("Perfil de afiliado não encontrado");
  } else if (error.code === "UNAUTHORIZED") {
    console.error("Usuário não autenticado");
  }
}
```

---

## Performance e Otimizações

### Polling Automático
- Intervalo recomendado: 5000ms (5 segundos)
- Pode ser ajustado conforme necessário
- Use `pollingInterval: 0` para desabilitar

### Caching
- tRPC utiliza cache automático por padrão
- Dados em cache são reutilizados enquanto válidos
- Use `refetch()` para forçar atualização

### Exemplo de Refresh Manual:
```typescript
const { refetch } = trpc.dashboard.getMetrics.useQuery();

const handleRefresh = async () => {
  await refetch();
};
```

---

## Integração com Componentes React Native

### Home Screen
```typescript
const { data: metricsData, isLoading } = trpc.dashboard.getMetrics.useQuery(
  undefined, 
  { pollingInterval: 5000 }
);
const { data: recentSalesData } = trpc.dashboard.getRecentSales.useQuery(
  { limit: 3 },
  { pollingInterval: 5000 }
);
```

### Profile Screen
```typescript
const { data: profile } = trpc.mmn.getProfile.useQuery();
```

### Agent Screen
```typescript
const { data: agent, refetch } = trpc.mmn.getAgent.useQuery();
const updateStrategy = trpc.mmn.updateAgentStrategy.useMutation();
```

---

## Próximas Implementações

- [ ] Implementar cache local com AsyncStorage
- [ ] Adicionar notificações push para novas comissões
- [ ] Implementar gráficos de ganhos históricos
- [ ] Adicionar funcionalidade de compartilhamento de link
- [ ] Implementar solicitação de saque

---

## Suporte

Para dúvidas ou problemas, consulte a documentação completa em `/docs/TECHNICAL_DOCUMENTATION.md` ou entre em contato com a equipe de desenvolvimento.
