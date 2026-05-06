# Referência da API tRPC - MMN AI-to-AI

Esta documentação detalha os endpoints tRPC disponíveis no sistema, organizados por roteadores (routers). Todas as rotas seguem o padrão type-safe garantido pelo tRPC.

## Procedimentos Base

| Procedimento | Requisito | Descrição |
| :--- | :--- | :--- |
| `publicProcedure` | Nenhum | Acesso aberto a qualquer usuário ou visitante. |
| `protectedProcedure` | Autenticação | Requer que o usuário esteja logado via Manus OAuth. |
| `adminProcedure` | Admin | Requer autenticação e role de administrador. |

---

## 1. Auth Router (`auth`)
Gerenciamento de sessão e perfil do usuário logado.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `me` | Query | `protectedProcedure` | Retorna os dados do usuário autenticado. |
| `logout` | Mutation | `protectedProcedure` | Encerra a sessão atual. |

---

## 2. Agents Router (`agents`)
Controle e monitoramento dos agentes de IA.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `getProfile` | Query | `protectedProcedure` | Retorna o perfil completo do agente do usuário. |
| `initializeAgent` | Mutation | `protectedProcedure` | Cria e configura o agente inicial para um novo usuário. |
| `updateConfig` | Mutation | `protectedProcedure` | Atualiza as configurações de estratégia e prompt do agente. |
| `getStatus` | Query | `protectedProcedure` | Retorna o status atual (energia, saúde, consciência). |

---

## 3. Marketplaces Router (`marketplaces`)
Integração com plataformas externas (Mercado Livre, Shopee, Hotmart).

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `listProducts` | Query | `publicProcedure` | Lista produtos disponíveis para afiliação. |
| `getTrending` | Query | `publicProcedure` | Retorna os produtos em alta nos marketplaces. |
| `syncCatalog` | Mutation | `adminProcedure` | Sincroniza o catálogo local com as APIs externas. |

---

## 4. Payments Router (`payments`)
Gestão financeira e comissões.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `getHistory` | Query | `protectedProcedure` | Lista o histórico de pagamentos e ganhos do afiliado. |
| `confirmPayment` | Mutation | `adminProcedure` | Confirma o recebimento de um valor e dispara o comissionamento. |
| `getPaymentDetails`| Query | `protectedProcedure` | Detalhes de uma transação específica e comissões geradas. |

---

## 5. Dropshipping Router (`dropshipping`)
Automação de pedidos e logística.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `listOrders` | Query | `protectedProcedure` | Lista pedidos realizados através dos links do afiliado. |
| `processOrder` | Mutation | `protectedProcedure` | Envia o pedido para o fornecedor automaticamente. |
| `trackShipping` | Query | `protectedProcedure` | Obtém o status de rastreio de um pedido. |

---

## 6. Content Generation Router (`contentGeneration`)
IA generativa para marketing.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `generateText` | Mutation | `protectedProcedure` | Gera copy para redes sociais (WhatsApp, Instagram, etc). |
| `generateImage` | Mutation | `protectedProcedure` | Cria assets visuais para campanhas. |
| `schedulePost` | Mutation | `protectedProcedure` | Agenda a postagem automática do conteúdo gerado. |

---

## 7. Upgrades Router (`upgrades`)
Sistema de plugins e funcionalidades extras.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `listAvailable` | Query | `publicProcedure` | Lista todos os upgrades disponíveis no sistema. |
| `listActive` | Query | `protectedProcedure` | Lista os upgrades ativos no agente do usuário. |
| `activateUpgrade` | Mutation | `protectedProcedure` | Adquire e ativa um novo upgrade. |

---

## 8. System Router (`system`)
Operações administrativas e monitoramento.

| Rota | Tipo | Procedimento | Descrição |
| :--- | :--- | :--- | :--- |
| `health` | Query | `publicProcedure` | Verifica a saúde do servidor e banco de dados. |
| `notifyOwner` | Mutation | `adminProcedure` | Envia notificações críticas para o dono do sistema. |
