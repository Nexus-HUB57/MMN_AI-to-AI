# Documentação da API tRPC

Esta documentação detalha os endpoints da API tRPC do sistema MMN, incluindo seus propósitos, parâmetros de entrada, saídas esperadas e requisitos de autenticação.

## 1. `mmnRouter`

O `mmnRouter` gerencia funcionalidades relacionadas ao marketing multinível, como perfis de afiliados, referências, rede e estatísticas de comissão.

### 1.1. `getProfile`

- **Descrição**: Retorna o perfil de afiliado do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Objeto `Affiliate` (se encontrado), ou erro `NOT_FOUND`.

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

### 1.4. `getDirectReferrals`

- **Descrição**: Retorna uma lista de referências diretas do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Referral`.

### 1.5. `getNetworkTree`

- **Descrição**: Retorna a árvore completa da rede de afiliados do usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Objeto representando a estrutura da rede.

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

### 1.8. `getTrendingProducts`

- **Descrição**: Retorna uma lista de produtos em alta no sistema.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Nenhuma (público)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Product`.

### 1.9. `getUpgrades`

- **Descrição**: Retorna uma lista de upgrades ativos para o usuário autenticado.
- **Tipo**: Query (leitura de dados)
- **Autenticação**: Necessária (usuário logado)
- **Entrada**: Nenhuma
- **Saída**: Array de objetos `Upgrade`.

---

## Referências

[1] [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
