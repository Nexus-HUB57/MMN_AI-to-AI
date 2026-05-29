# Manual de Integração - MMN AI-to-AI - Versão Consolidada

> Baseado em: v16_delivery/INTEGRATION_MANUAL.md + guides-archive/integration-manual.md
> Última atualização: 2026-05-28
> Autor: MiniMax Agent

## Índice

1. [Visão Geral da Integração](#1-visão-geral-da-integração)
2. [Autenticação e Autorização](#2-autenticação-e-autorização)
3. [Integração com a API tRPC](#3-integração-com-a-api-trpc)
4. [Integração com Marketplaces](#4-integração-com-marketplaces)
5. [Webhooks para Notificações](#5-webhooks-para-notificações-em-tempo-real)
6. [Integração com Redes Sociais](#6-integração-com-redes-sociais)
7. [Exportação de Dados](#7-exportação-de-dados)
8. [Considerações de Segurança](#8-considerações-de-segurança)

---

## 1. Visão Geral da Integração

Este manual detalha os procedimentos e considerações para a integração de sistemas externos com a plataforma MMN AI-to-AI. Ele é destinado a desenvolvedores e equipes técnicas que desejam conectar suas aplicações, marketplaces ou serviços à nossa plataforma.

A plataforma MMN AI-to-AI oferece diversas APIs e pontos de integração para permitir a comunicação com sistemas de terceiros. As integrações podem ser realizadas para:

- **Sincronização de Dados**: Usuários, produtos, pedidos, comissões.
- **Automação de Processos**: Registro de afiliados, processamento de pagamentos, geração de conteúdo.
- **Extensão de Funcionalidades**: Conexão com marketplaces, sistemas de CRM, ferramentas de marketing.

---

## 2. Autenticação e Autorização

Todas as interações com a API do MMN AI-to-AI requerem autenticação para garantir a segurança dos dados. O sistema utiliza tokens de autenticação baseados em JWT (JSON Web Tokens).

### 2.1. Obtenção de Token de Acesso

Para obter um token de acesso, é necessário realizar uma requisição para o endpoint de login da API, fornecendo credenciais válidas (e-mail e senha).

**Endpoint**: `/api/auth.login` (via tRPC)
**Método**: `POST` (internamente via tRPC mutation)
**Entrada**: `{ email: string, password: string }`
**Saída**: `{ token: string }`

### 2.2. Uso do Token de Acesso

O token de acesso deve ser incluído no cabeçalho `Authorization` de todas as requisições subsequentes à API, no formato `Bearer <token>`.

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 3. Integração com a API tRPC

A API do MMN AI-to-AI é construída com tRPC, o que simplifica a integração para clientes TypeScript/JavaScript.

### 3.1. Instalação do Cliente tRPC

Para integrar com a API tRPC, você precisará instalar o cliente tRPC em seu projeto:

```bash
npm install @trpc/client
# ou
yarn add @trpc/client
```

### 3.2. Configuração do Cliente

Configure o cliente tRPC em seu projeto, apontando para a URL da API do MMN AI-to-AI:

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../path/to/your/backend/src/routers/_app'; // Ajuste o caminho conforme necessário

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.mmn-ai-to-ai.com/trpc', // Substitua pela URL real da sua API
      async headers() {
        // Adicione o token de autenticação se disponível
        const token = localStorage.getItem('authToken');
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});

export default trpc;
```

### 3.3. Exemplo de Uso (Frontend)

```typescript
import trpc from './trpcClient';

async function getUserProfile() {
  try {
    const profile = await trpc.mmn.getProfile.query();
    console.log('Perfil do Afiliado:', profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
  }
}

async function requestNewWithdrawal(amount: number, bankDetails: any) {
  try {
    const result = await trpc.payments.requestWithdrawal.mutate({ amount, bankDetails });
    console.log('Solicitação de saque:', result);
  } catch (error) {
    console.error('Erro ao solicitar saque:', error);
  }
}

getUserProfile();
requestNewWithdrawal(100, { bankName: 'Banco Exemplo', accountNumber: '12345', agencyNumber: '6789' });
```

### 3.4. Principais Procedures Disponíveis

| Procedure | Descrição |
|-----------|-----------|
| `mmn.getProfile` | Obtém perfil do afiliado logado |
| `mmn.getNetwork` | Retorna árvore de indicados (até 15 níveis) |
| `mmn.getCommissions` | Lista comissões do afiliado |
| `payments.requestWithdrawal` | Solicita saque de saldo |
| `marketplaces.syncProducts` | Força sincronização de produtos |

---

## 4. Integração com Marketplaces

### 4.1. Integrando Novos Marketplaces

Para adicionar um novo marketplace (ex: Amazon, Magalu), siga estes passos:

#### Backend

1. **Schema**: Adicione o novo enum em `products.marketplace` no arquivo `schema.ts`.
2. **Router**: Crie uma nova procedure em `marketplacesRouter.ts` para lidar com a autenticação e busca de produtos da nova API.
3. **Sync Service**: Implemente uma função de sincronização que mapeie os campos externos para o modelo interno:
   - `externalId` -> ID único do produto na plataforma.
   - `commissionPercentage` -> Margem oferecida ao afiliado.

#### Frontend

1. Adicione o logo e as cores da marca no componente `ProductCard`.
2. Atualize os filtros de busca para incluir a nova fonte.

### 4.2. Credenciais de API

Para integrar marketplaces externos:

1. **Credenciais de API**: Obtenha as chaves de API e tokens de acesso do marketplace (ex: Mercado Livre, Shopee, Hotmart).
2. **Mapeamento de Dados**: Defina como os produtos, pedidos e informações de comissão do marketplace serão mapeados para o sistema MMN AI-to-AI.
3. **Sincronização**: Implemente a lógica para sincronizar produtos (importação), pedidos (exportação/status) e comissões (cálculo e atribuição).

### 4.3. Configuração de APIs no Admin

* **Configuração de APIs**: Insira chaves de API e credenciais para conectar o sistema a plataformas externas como Mercado Livre, Shopee, Hotmart, Monetizze, etc.
* **Sincronização de Produtos**: Configure rotinas automáticas ou manuais para importar produtos, preços e estoques dos marketplaces para o sistema MMN.
* **Mapeamento de Comissões Externas**: Defina como as comissões recebidas dessas plataformas externas serão distribuídas na rede de afiliados interna.

---

## 5. Webhooks para Notificações em Tempo Real

Para receber notificações em tempo real sobre eventos importantes (ex: nova venda, aprovação de afiliado, atualização de status de pagamento), o MMN AI-to-AI pode enviar webhooks para um endpoint configurado em seu sistema.

### 5.1. Configuração de Webhook

Entre em contato com o suporte ou utilize o painel administrativo para configurar a URL do seu webhook e os tipos de eventos que deseja receber.

### 5.2. Estrutura do Payload do Webhook

Os webhooks são enviados como requisições `POST` com um corpo JSON:

```json
{
  "eventType": "SALE_COMPLETED",
  "timestamp": "2026-05-12T10:00:00Z",
  "data": {
    "orderId": "ORD12345",
    "productId": "PROD6789",
    "amount": 150.75,
    "commissionAmount": 15.07,
    "affiliateId": "AFF001"
  },
  "signature": "HASH_DE_SEGURANCA"
}
```

### 5.3. Webhook de Conversão

**Endpoint**: `POST /api/webhooks/conversion`
**Payload esperado**:
```json
{
  "affiliate_id": "string",
  "product_id": "string",
  "amount": "number",
  "currency": "BRL",
  "status": "confirmed"
}
```
**Segurança**: Requer `X-Webhook-Secret` no cabeçalho.

### 5.4. Verificação de Assinatura (Segurança)

É altamente recomendável verificar a assinatura do webhook para garantir que a requisição realmente veio do MMN AI-to-AI e não foi adulterada. O sistema enviará uma chave secreta que você usará para gerar e comparar a assinatura.

---

## 6. Integração com Redes Sociais

Os agentes utilizam conectores para postagem em diversas plataformas:

- **WhatsApp**: Via API oficial ou gateways de automação.
- **Instagram/Facebook**: Via Graph API da Meta.
- **X (Twitter)**: Via API v2.

Para configurar novas credenciais, o administrador deve acessar o arquivo de configuração de conectores do sistema. A integração com redes sociais permite que o agente IA poste automaticamente conteúdo gerado em múltiplas plataformas.

---

## 7. Exportação de Dados

Para BI e relatórios externos, os dados podem ser consumidos via:

- **CSV Export**: Disponível no painel admin.
- **JSON API**: Endpoint `system.getRawData` (apenas para admins).

### 7.1. Estrutura de Dados Disponíveis

| Tipo de Dados | Descrição |
|---------------|-----------|
| Usuários | Cadastros, níveis, status |
| Comissões | Histórico completo de ganhos |
| Produtos | Catálogo com preços e estoques |
| Pedidos | Transações e status |
| Rede | Árvore de afiliados e indicações |

---

## 8. Considerações de Segurança

- **Proteção de Credenciais**: Nunca exponha chaves de API ou tokens de acesso em código frontend ou repositórios públicos.
- **Validação de Entrada**: Sempre valide e sanitize todas as entradas recebidas de sistemas externos.
- **Tratamento de Erros**: Implemente um tratamento robusto de erros e mecanismos de retry para integrações.
- **Monitoramento**: Monitore ativamente os logs de integração para identificar e resolver problemas rapidamente.
- **Controle de Acesso Baseado em Funções (RBAC)**: Garanta que cada administrador ou gerente tenha acesso apenas às áreas necessárias para sua função.
- **Logs de Auditoria**: O sistema registra ações críticas (ex: alteração de comissões, aprovação de pagamentos, exclusão de usuários). Monitore esses logs para identificar atividades suspeitas e garantir a integridade do sistema.
- **Backups**: Certifique-se de que as rotinas de backup do banco de dados estejam configuradas e funcionando corretamente para prevenir perda de dados.

---

## Histórico de Versões

| Versão | Data | Origem | Mudanças |
|--------|------|--------|----------|
| 1.0 | 2026-05-28 | Consolidação | v16_delivery/INTEGRATION_MANUAL.md + guides-archive/integration-manual.md |

---

## Referências

- [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
- [Documentação Oficial tRPC](https://trpc.io/docs/)
- [JSON Web Tokens (JWT)](https://jwt.io/introduction/)