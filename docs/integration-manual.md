# Manual de Integração: MMN AI-to-AI

Este manual detalha os procedimentos e considerações para a integração de sistemas externos com a plataforma MMN AI-to-AI. Ele é destinado a desenvolvedores e equipes técnicas que desejam conectar suas aplicações, marketplaces ou serviços à nossa plataforma.

## 1. Visão Geral da Integração

A plataforma MMN AI-to-AI oferece diversas APIs e pontos de integração para permitir a comunicação com sistemas de terceiros. As integrações podem ser realizadas para:

*   **Sincronização de Dados**: Usuários, produtos, pedidos, comissões.
*   **Automação de Processos**: Registro de afiliados, processamento de pagamentos, geração de conteúdo.
*   **Extensão de Funcionalidades**: Conexão com marketplaces, sistemas de CRM, ferramentas de marketing.

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

## 4. Webhooks para Notificações em Tempo Real

Para receber notificações em tempo real sobre eventos importantes (ex: nova venda, aprovação de afiliado, atualização de status de pagamento), o MMN AI-to-AI pode enviar webhooks para um endpoint configurado em seu sistema.

### 4.1. Configuração de Webhook

Entre em contato com o suporte ou utilize o painel administrativo para configurar a URL do seu webhook e os tipos de eventos que deseja receber.

### 4.2. Estrutura do Payload do Webhook

Os webhooks são enviados como requisições `POST` com um corpo JSON. A estrutura do payload varia de acordo com o tipo de evento, mas geralmente inclui:

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

### 4.3. Verificação de Assinatura (Segurança)

É altamente recomendável verificar a assinatura do webhook para garantir que a requisição realmente veio do MMN AI-to-AI e não foi adulterada. O sistema enviará uma chave secreta que você usará para gerar e comparar a assinatura.

## 5. Integração com Marketplaces Externos

Para integrar novos marketplaces ou plataformas de e-commerce, siga os passos gerais:

1.  **Credenciais de API**: Obtenha as chaves de API e tokens de acesso do marketplace (ex: Mercado Livre, Shopee, Hotmart).
2.  **Mapeamento de Dados**: Defina como os produtos, pedidos e informações de comissão do marketplace serão mapeados para o sistema MMN AI-to-AI.
3.  **Sincronização**: Implemente a lógica para sincronizar produtos (importação), pedidos (exportação/status) e comissões (cálculo e atribuição).

## 6. Considerações de Segurança

*   **Proteção de Credenciais**: Nunca exponha chaves de API ou tokens de acesso em código frontend ou repositórios públicos.
*   **Validação de Entrada**: Sempre valide e sanitize todas as entradas recebidas de sistemas externos.
*   **Tratamento de Erros**: Implemente um tratamento robusto de erros e mecanismos de retry para integrações.
*   **Monitoramento**: Monitore ativamente os logs de integração para identificar e resolver problemas rapidamente.

## Referências

[1] [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI]
[2] [Documentação Oficial tRPC](https://trpc.io/docs/)
[3] [JSON Web Tokens (JWT)](https://jwt.io/introduction/)
