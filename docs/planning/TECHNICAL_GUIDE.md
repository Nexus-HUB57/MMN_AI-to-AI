# Guia Técnico - MMN AI-to-AI

## Visão Geral do Sistema

O sistema MMN AI-to-AI é uma plataforma completa de Marketing Multinível com agentes de inteligência artificial generativos. A arquitetura segue o padrão modular com separação clara entre backend (tRPC), frontend (React) e banco de dados (MySQL).

## Stack Tecnológico

### Frontend
- **React 19**: Framework UI moderno com hooks
- **Tailwind CSS 4**: Estilização utilitária com OKLCH
- **shadcn/ui**: Componentes reutilizáveis
- **Recharts**: Gráficos e visualizações
- **Wouter**: Roteamento leve
- **tRPC**: Type-safe RPC client

### Backend
- **Express 4**: Servidor HTTP
- **tRPC 11**: API type-safe com validação Zod
- **Drizzle ORM**: Gerenciamento de banco de dados
- **Node.js**: Runtime

### Banco de Dados
- **MySQL/TiDB**: Armazenamento relacional
- **Drizzle Kit**: Migrations e schema management

## Estrutura de Pastas

```
mmn-ai-to-ai/
├── client/
│   ├── src/
│   │   ├── pages/          # Componentes de página
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitários (trpc.ts)
│   │   ├── App.tsx         # Roteamento principal
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Estilos globais
│   └── public/             # Arquivos estáticos
├── server/
│   ├── routers/            # Routers tRPC (mmn.ts, upgrades.ts)
│   ├── db.ts               # Query helpers
│   ├── routers.ts          # Agregador de routers
│   └── _core/              # Framework plumbing
├── drizzle/
│   ├── schema.ts           # Definição de tabelas
│   └── migrations/         # SQL migrations
├── shared/                 # Constantes compartilhadas
├── ARCHITECTURE.md         # Documentação de arquitetura
└── todo.md                 # Checklist de features
```

## Fluxo de Desenvolvimento

### 1. Adicionar Nova Feature no Backend

**Passo 1: Atualizar Schema (se necessário)**
```typescript
// drizzle/schema.ts
export const newTable = mysqlTable("newTable", {
  id: int("id").autoincrement().primaryKey(),
  // ... colunas
});
```

**Passo 2: Gerar Migration**
```bash
pnpm drizzle-kit generate
```

**Passo 3: Aplicar Migration**
```bash
pnpm drizzle-kit migrate
```

**Passo 4: Criar Query Helpers (server/db.ts)**
```typescript
export async function getNewTableData() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(newTable);
}
```

**Passo 5: Criar Procedures tRPC (server/routers/*.ts)**
```typescript
export const newRouter = router({
  getData: publicProcedure.query(async () => {
    return await getNewTableData();
  }),
});
```

**Passo 6: Integrar Router (server/routers.ts)**
```typescript
export const appRouter = router({
  // ... outros routers
  newFeature: newRouter,
});
```

### 2. Adicionar Nova Página Frontend

**Passo 1: Criar Componente (client/src/pages/NewPage.tsx)**
```typescript
import { trpc } from "@/lib/trpc";

export default function NewPage() {
  const { data } = trpc.newFeature.getData.useQuery();
  return <div>{/* conteúdo */}</div>;
}
```

**Passo 2: Registrar Rota (client/src/App.tsx)**
```typescript
<Route path={"/new-page"} component={NewPage} />
```

**Passo 3: Adicionar Navegação**
```typescript
<Button onClick={() => setLocation("/new-page")}>Nova Página</Button>
```

## Routers Disponíveis

### MMN Router (`/api/trpc/mmn`)
Operações relacionadas a marketing multinível:
- `getProfile` - Perfil do afiliado
- `registerAffiliate` - Registrar novo afiliado
- `getDirectReferrals` - Indicados diretos
- `getNetworkTree` - Árvore de rede
- `getTotalCommissions` - Comissões totais
- `getPendingCommissions` - Comissões pendentes
- `getOrders` - Histórico de pedidos
- `getTrendingProducts` - Produtos em alta
- `getAgent` - Agente IA do usuário
- `initializeAgent` - Criar novo agente

### Upgrades Router (`/api/trpc/upgrades`)
Gerenciamento de plugins e upgrades:
- `listAvailable` - Upgrades disponíveis
- `listActive` - Upgrades ativados
- `activateUpgrade` - Ativar upgrade
- `deactivateUpgrade` - Desativar upgrade

### Auth Router (`/api/trpc/auth`)
Autenticação:
- `me` - Usuário atual
- `logout` - Fazer logout

## Banco de Dados

### Tabelas Principais

#### users
Usuários do sistema com autenticação OAuth.
- `id` (PK): ID único
- `openId`: ID do OAuth Manus
- `role`: admin, leader, supervisor, affiliate
- `name`, `email`: Dados pessoais

#### affiliates
Dados específicos de afiliados.
- `id` (PK): ID único
- `userId` (FK): Referência a users
- `affiliateCode`: Código único para rastreamento
- `sponsorId`: ID do patrocinador direto
- `commissionPercentage`: % de comissão
- `totalEarnings`, `totalCommissions`: Ganhos
- `directReferrals`, `totalNetworkSize`: Rede

#### network
Relações de patrocínio na rede.
- `userId`: Afiliado
- `sponsorId`: Patrocinador
- `level`: Profundidade (1=direto, 2=indireto, etc)

#### commissions
Histórico de comissões.
- `affiliateId`: Afiliado que recebe
- `orderId`: Pedido relacionado
- `level`: Nível de profundidade
- `amount`: Valor da comissão
- `type`: direct_sale, network, bonus, adjustment
- `status`: pending, approved, paid

#### agents
Configuração de agentes IA.
- `userId`: Proprietário do agente
- `name`: Nome do agente
- `status`: active, inactive, learning
- `contentStrategy`: JSON com configurações
- `budget`, `budgetSpent`: Orçamento de anúncios

#### products
Catálogo de produtos de marketplaces.
- `externalId`: ID no marketplace
- `marketplace`: mercado_livre, shopee, hotmart
- `title`, `description`: Informações
- `price`, `commissionPercentage`: Valores
- `trend`: rising, stable, declining

#### orders
Histórico de pedidos e conversões.
- `affiliateId`: Afiliado que fez a venda
- `productId`: Produto vendido
- `amount`, `commission`: Valores
- `status`: pending, confirmed, shipped, delivered

#### upgrades
Plugins e módulos disponíveis.
- `name`: Nome do upgrade
- `type`: content_generation, analytics, automation, integration
- `price`: Preço do upgrade
- `features`: JSON com lista de features

#### agentUpgrades
Upgrades ativados por agente.
- `agentId`: Agente que tem o upgrade
- `upgradeId`: Upgrade ativado
- `status`: active, inactive, expired
- `activatedAt`, `expiresAt`: Datas

## Padrões de Código

### Queries tRPC

```typescript
// Query pública
getPublicData: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return await getData(input.id);
  }),

// Query protegida
getPrivateData: protectedProcedure.query(async ({ ctx }) => {
  return await getUserData(ctx.user.id);
}),

// Mutation
updateData: protectedProcedure
  .input(z.object({ id: z.number(), value: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return await updateUserData(ctx.user.id, input);
  }),
```

### Componentes React

```typescript
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

export default function MyComponent() {
  const { data, isLoading, error } = trpc.feature.getData.useQuery();
  const mutation = trpc.feature.updateData.useMutation();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <Card>
      <div>{data?.name}</div>
      <button onClick={() => mutation.mutate({ id: 1, value: "novo" })}>
        Atualizar
      </button>
    </Card>
  );
}
```

## Autenticação e Autorização

### OAuth Flow
1. Usuário clica "Entrar"
2. Redireciona para `getLoginUrl()` (Manus OAuth)
3. Após autenticação, retorna para `/api/oauth/callback`
4. Session cookie é criado
5. Usuário pode acessar rotas protegidas

### Controle de Acesso
```typescript
// Verificar autenticação
const { isAuthenticated, user } = useAuth();

// Verificar role
if (user?.role === "admin") {
  // Mostrar painel admin
}

// Proteger rota no backend
protectedProcedure // Requer autenticação
adminProcedure     // Requer role="admin"
```

## Deployment

### Preparar para Deploy
1. Criar checkpoint: `webdev_save_checkpoint`
2. Verificar build: `pnpm build`
3. Testar: `pnpm test`
4. Publicar via UI

### Variáveis de Ambiente
Todas as variáveis são injetadas automaticamente:
- `DATABASE_URL`: Conexão MySQL
- `JWT_SECRET`: Assinatura de sessão
- `VITE_APP_ID`: OAuth app ID
- `OAUTH_SERVER_URL`: OAuth backend
- E mais...

## Troubleshooting

### Erro: "Cannot find module"
- Verificar caminho do import
- Executar `pnpm install`
- Limpar cache: `rm -rf node_modules/.vite`

### Erro: "Type mismatch"
- Verificar tipos em `drizzle/schema.ts`
- Reexecutar `pnpm drizzle-kit generate`
- Verificar tipos retornados por query helpers

### Erro: "Database connection failed"
- Verificar `DATABASE_URL`
- Verificar migrations: `pnpm drizzle-kit migrate`
- Verificar status do banco

## Performance

### Otimizações Implementadas
- Lazy loading de componentes
- Caching de queries tRPC
- Índices em tabelas principais
- Paginação de resultados

### Monitoramento
- Logs em `.manus-logs/`
- Health checks no dashboard
- Métricas de performance

## Próximas Implementações

- [ ] Integração com APIs de marketplaces
- [ ] Geração de conteúdo IA
- [ ] Automação de postagens
- [ ] Sistema de notificações
- [ ] Webhooks para eventos
- [ ] Relatórios avançados
