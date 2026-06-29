# Documentação da API tRPC

Esta documentação detalha os endpoints da API tRPC do sistema MMN, incluindo seus propósitos, parâmetros de entrada, saídas esperadas e requisitos de autenticação. O tRPC é uma biblioteca que permite construir APIs Type-Safe, eliminando a necessidade de geração de código ou esquemas, e garantindo a segurança de tipo de ponta a ponta entre o frontend e o backend.

## Visão Geral do tRPC

tRPC é uma estrutura para construir APIs totalmente seguras em TypeScript, permitindo que os desenvolvedores escrevam funções de backend e as chamem diretamente do frontend com segurança de tipo garantida. Isso significa que erros de tipo são detectados em tempo de compilação, não em tempo de execução, resultando em um desenvolvimento mais rápido e menos propenso a erros.

### Benefícios do tRPC:

*   **Segurança de Tipo de Ponta a Ponta**: Garante que os tipos de dados sejam consistentes entre o cliente e o servidor.
*   **Desenvolvimento Rápido**: Reduz a sobrecarga de escrita de esquemas e geração de código.
*   **Experiência de Desenvolvedor Aprimorada**: Oferece autocompletar e detecção de erros em tempo real.
*   **Leve**: Não adiciona sobrecarga de tempo de execução desnecessária.

## Estrutura da API

A API tRPC é organizada em *routers*, que agrupam endpoints relacionados. Cada endpoint pode ser uma *query* (para buscar dados) ou uma *mutation* (para criar, atualizar ou deletar dados).

## 1. `mmnRouter`

O `mmnRouter` gerencia funcionalidades relacionadas ao marketing multinível, como perfis de afiliados, referências, rede e estatísticas de comissão.

### 1.1. `getProfile`

- **Descrição**: Retorna o perfil de afiliado do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Objeto `Affiliate` (se encontrado), ou erro `NOT_FOUND`.

```typescript
interface Affiliate {
  id: string;
  userId: string;
  code: string;
  // ... outros campos do perfil de afiliado
}
```

### 1.2. `getAffiliateByCode`

- **Descrição**: Retorna o perfil de afiliado com base em um código de afiliado fornecido. Usado para mini-sites ou páginas de destino.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Nenhuma (público)
- **Entrada**: `{ code: string }` - O código único do afiliado.
- **Saída**: Objeto `Affiliate` (se encontrado), ou erro `NOT_FOUND`.

### 1.3. `getAgent`

- **Descrição**: Retorna o perfil do agente de IA associado ao usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Objeto `Agent` (se encontrado), ou erro `NOT_FOUND`.

```typescript
interface Agent {
  id: string;
  userId: string;
  name: string;
  // ... outros campos do agente de IA
}
```

### 1.4. `getDirectReferrals`

- **Descrição**: Retorna uma lista de referências diretas do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Referral`.

```typescript
interface Referral {
  id: string;
  referredUserId: string;
  referrerUserId: string;
  // ... outros campos de referência
}
```

### 1.5. `getNetworkTree`

- **Descrição**: Retorna a árvore completa da rede de afiliados do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Objeto representando a estrutura da rede. A estrutura exata pode variar, mas geralmente inclui `id`, `children` (array de `NetworkNode`), e `level`.

```typescript
interface NetworkNode {
  id: string;
  name: string;
  level: number;
  children: NetworkNode[];
}
```

### 1.6. `getStats`

- **Descrição**: Retorna estatísticas de comissão para o usuário autenticado, incluindo o total de comissões e comissões pendentes.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: `{ total: number, pending: number }`.

### 1.7. `getRecentOrders`

- **Descrição**: Retorna uma lista dos 10 pedidos mais recentes associados ao afiliado autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Order`.

```typescript
interface Order {
  id: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  // ... outros campos do pedido
}
```

### 1.8. `getTrendingProducts`

- **Descrição**: Retorna uma lista de produtos em alta no sistema.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Nenhuma (público)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Product`.

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  // ... outros campos do produto
}
```

### 1.9. `getUpgrades`

- **Descrição**: Retorna uma lista de upgrades ativos para o usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Upgrade`.

```typescript
interface Upgrade {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  // ... outros campos do upgrade
}
```

## 2. `authRouter`

O `authRouter` lida com a autenticação de usuários, incluindo login, registro e gerenciamento de sessão.

### 2.1. `login`

- **Descrição**: Autentica um usuário e retorna um token de sessão.
- **Tipo**: Mutation (criação de dados)
- **Autenticação**: Nenhuma (público)
- **Entrada**: `{ email: string, password: string }`
- **Saída**: `{ token: string }` ou erro `UNAUTHORIZED`.

### 2.2. `register`

- **Descrição**: Registra um novo usuário no sistema.
- **Tipo**: Mutation (criação de dados)
- **Autenticação**: Nenhuma (público)
- **Entrada**: `{ email: string, password: string, name: string }`
- **Saída**: `{ userId: string }` ou erro `CONFLICT`.

### 2.3. `logout`

- **Descrição**: Invalida a sessão do usuário atual.
- **Tipo**: Mutation (deleção de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: `{ success: boolean }`.

## 3. `paymentsRouter`

O `paymentsRouter` gerencia todas as operações relacionadas a pagamentos e comissões.

### 3.1. `requestWithdrawal`

- **Descrição**: Permite que um afiliado solicite um saque de suas comissões disponíveis.
- **Tipo**: Mutation (criação de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: `{ amount: number, bankDetails: BankDetails }`
- **Saída**: `{ withdrawalId: string, status: 'pending' }` ou erro `INSUFFICIENT_FUNDS`.

```typescript
interface BankDetails {
  bankName: string;
  accountNumber: string;
  agencyNumber: string;
  // ... outros detalhes bancários
}
```

### 3.2. `getPaymentHistory`

- **Descrição**: Retorna o histórico de pagamentos e saques do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `PaymentTransaction`.

```typescript
interface PaymentTransaction {
  id: string;
  type: 'withdrawal' | 'commission';
  amount: number;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}
```

## 4. `contentGenerationRouter`

O `contentGenerationRouter` oferece endpoints para a geração de conteúdo, como e-books e materiais de marketing.

### 4.1. `generateEbook`

- **Descrição**: Inicia o processo de geração de um e-book com base em tópicos fornecidos.
- **Tipo**: Mutation (criação de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: `{ title: string, topics: string[] }`
- **Saída**: `{ ebookId: string, status: 'processing' }`.

### 4.2. `getEbookStatus`

- **Descrição**: Verifica o status de geração de um e-book.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: `{ ebookId: string }`
- **Saída**: `{ status: 'processing' | 'completed' | 'failed', downloadUrl?: string }`.

## 5. `adminRouter` (Exemplo - para documentação futura)

Este router (não implementado neste rascunho) conteria endpoints para funcionalidades administrativas, como gerenciamento de usuários, aprovação de saques e configuração do sistema.

## Referências

[1] [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
[2] [Documentação Oficial tRPC](https://trpc.io/docs/)
