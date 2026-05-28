# Integração Fase 7 + Fase 8: White-Label API com Dropshipping Automatizado

## Visão Geral

Este documento estabelece a especificação de integração entre a **Fase 7 (White-Label API)** e a **Fase 8 (Dropshipping Automatizado)** do projeto MMN_AI-to-AI. A integração permite que instâncias White-Label operem como plataformas de dropshipping, conectando afiliados às marketplaces através de uma camada de gestão unificada de pedidos, comissões e notificações. O objetivo principal é habilitar parceiros White-Label a oferecerem sistemas de venda automatizada com tracking de comissões e sincronização de pedidos entre plataformas.

A arquitetura proposta estabelece comunicação bidirecional entre os sistemas, onde a Fase 7 atua como orquestrador de instâncias e gestão comercial, enquanto a Fase 8 gerencia a operação de dropshipping propriamente dita. Cada instância White-Label pode estar associada a múltiplos afiliados que gerenciam seus próprios pedidos de dropshipping, criando um ecossistema escalável e independente.

## Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE ORQUESTRAÇÃO                              │
│                    (White-Label API - FastAPI/Python)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Instances   │  │   Billing    │  │  Webhooks    │  │   Metrics    │   │
│  │   Router     │  │    Router    │  │    Router    │  │    Router    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                │                │                │              │
│         └────────────────┴────────────────┴────────────────┘              │
│                               │                                            │
│                    ┌──────────┴──────────┐                                 │
│                    │  Integration Layer  │                                 │
│                    │  (API Gateway)     │                                 │
│                    └──────────┬──────────┘                                 │
│                               │                                            │
└───────────────────────────────┼────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   REST API External   │
                    │   (Bearer Token)      │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────┼────────────────────────────────────────────┐
│                         CAMADA DE OPERAÇÃO                                   │
│                  (Dropshipping API - Node.js/TypeScript)                    │
├───────────────────────────────┼────────────────────────────────────────────┤
│                               │                                            │
│  ┌───────────────────────────┴────────────────────────────┐              │
│  │              DropshippingService                         │              │
│  │  - registerDropshippingOrder()                          │              │
│  │  - updateDropshippingOrderStatus()                      │              │
│  │  - calculateConsumptionCommission()                     │              │
│  │  - affiliateManagement()                                │              │
│  └───────────────────────────┬────────────────────────────┘              │
│                              │                                             │
│         ┌────────────────────┼────────────────────┐                        │
│         │                    │                    │                        │
│  ┌──────┴──────┐    ┌───────┴───────┐    ┌──────┴──────┐                 │
│  │   orders    │    │  affiliates   │    │ commissions  │                 │
│  │   table     │    │    table      │    │   table     │                 │
│  └─────────────┘    └───────────────┘    └─────────────┘                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Marketplace Connectors                            │  │
│  │           (Shopee, Mercado Livre, Amazon, etc.)                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Integração entre Sistemas

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  White-Label    │      │   Integration   │      │  Dropshipping   │
│  Dashboard      │ ───▶ │     Layer       │ ───▶ │    Service      │
│                 │      │                 │      │                 │
│ (Partner/Admin) │      │ (API Gateway)   │      │ (Node.js/TS)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Instance Config │      │  Auth & Rate    │      │  Order Status   │
│ & Branding      │      │  Limiting       │      │  Updates        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │                        │                        ▼
        │                        │               ┌─────────────────┐
        │                        │               │  Commission     │
        │                        │               │  Calculation    │
        │                        │               └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│ Webhook Events  │      │  Analytics &    │
│ (Billing/Orders)│      │  Metrics        │
└─────────────────┘      └─────────────────┘
```

## Pontos de Integração

A tabela abaixo apresenta os pontos de integração entre os recursos da White-Label API e o sistema de Dropshipping, identificando como cada componente de cada fase se relaciona e quais dados são compartilhados entre eles.

| Recurso | White-Label (Fase 7) | Dropshipping (Fase 8) | Tipo de Integração |
|---------|----------------------|-----------------------|-------------------|
| **Instâncias** | `/whitelabel/instances` | Affiliated Instance ID | A instância White-Label determina o contexto operacional do dropshipping |
| **Billing/Subscriptions** | `/whitelabel/billing/subscriptions` | Subscription Status | Planos podem incluir módulos de dropshipping |
| **Pagamentos** | `/whitelabel/billing/payments` | Commission Payments | Comissões podem ser vinculada a faturas |
| **Clientes** | Instance Customers | Order Customers | Clientes do dropshipping sãoborne de instâncias |
| **Produtos** | Instance Products | Dropshipping Products | Produtos da marketplace sincronizados |
| **Afiliados** | Instance Users (Type: affiliate) | Affiliates Table | Usuários da instância com role específica |
| **Comissões** | Revenue Metrics | Commission Calculation | Tracking unificado de comissões |
| **Notificações** | Webhooks | Order Notifications | Eventos sincronizados via webhooks |
| **Métricas** | Instance Metrics | Order Analytics | Dados consolidados para dashboard |
| **Branding** | Theme/Logo Configuration | Order Emails | Templates de email com branding |

### Mapeamento de Entidades

O mapeamento de entidades estabelece a correspondência entre os identificadores e estruturas de dados de cada sistema, permitindo que operações em uma fase sejam corretamente refletidas na outra.

| Entidade White-Label | Entidade Dropshipping | Relacionamento | Descrição |
|---------------------|----------------------|----------------|-----------|
| `Instance.id` | `Order.instance_id` | 1:N | Uma instância pode ter múltiplos pedidos |
| `Plan.id` | `Affiliate.plan_id` | 1:N | Planos definem limites de afiliados |
| `User.id` | `Affiliate.user_id` | 1:1 | Usuários podem ser afiliados |
| `Instance.branding` | `Order.email_template` | 1:1 | Branding aplica-se a emails de pedido |
| `Subscription.id` | `Affiliate.subscription_id` | 1:1 | Assinatura ativa affiliate |

## Endpoints Necessários

### Endpoints White-Label (Fase 7) para Dropshipping

A Fase 7 disponibiliza endpoints que suportam a integração com o sistema de dropshipping, permitindo consultar dados de instâncias, métricas e configuração de webhooks para sincronização de eventos.

| Endpoint | Método | Descrição | Uso no Dropshipping |
|----------|--------|-----------|---------------------|
| `/whitelabel/instances/{id}` | GET | Obter detalhes da instância | Validar contexto operacional |
| `/whitelabel/instances/{id}/users` | GET | Listar usuários da instância | Buscar afiliados |
| `/whitelabel/instances/{id}/revenue` | GET | Métricas de receita | Consolidar comissões |
| `/whitelabel/instances/{id}/summary` | GET | Resumo de billing | Status da instância |
| `/whitelabel/instances/{id}/webhooks` | POST | Criar webhook | Sincronizar eventos |
| `/whitelabel/billing/subscriptions/instance/{instance_id}` | GET | Assinatura da instância | Verificar plano ativo |
| `/whitelabel/plans` | GET | Listar planos | Planos com módulo dropshipping |

### Endpoints Dropshipping (Fase 8) para White-Label

A Fase 8 disponibiliza endpoints que permitem à White-Label API gerenciar operações de dropshipping e consultar dados operacionais para consolidação de métricas e gestão de afiliados.

| Endpoint | Método | Descrição | Uso pela White-Label |
|----------|--------|-----------|---------------------|
| `/dropshipping/orders` | POST | Registrar pedido | Criar pedido via API |
| `/dropshipping/orders/:orderId` | GET | Buscar pedido | Consultar status |
| `/dropshipping/orders/:orderId/status` | PATCH | Atualizar status | Sincronizar estado |
| `/dropshipping/affiliates/:affiliateId/orders` | GET | Listar pedidos | Dashboard do afiliado |
| `/dropshipping/affiliates/:affiliateId/commissions` | GET | Listar comissões | Consolidar receitas |
| `/dropshipping/orders/:orderId/calculate-commission` | POST | Calcular comissão | Recalcular manualmente |
| `/dropshipping/affiliates` | GET | Listar afiliados | Gestão de parceiros |
| `/dropshipping/affiliates/:affiliateId` | GET | Detalhes do afiliado | Perfil do afiliado |

## Fluxos de Dados

### Fluxo 1: Criação de Pedido de Dropshipping

Este fluxo descreve o processo de criação de um pedido de dropshipping através da integração entre as APIs. O fluxo inicia quando um afiliado submete um novo pedido, que passa por validação na camada White-Label antes de ser registrado no sistema de dropshipping. Durante o processo, comissões são calculadas automaticamente e webhooks são disparados para notificar sistemas externos sobre o novo pedido.

```
Afiliado                              White-Label API                    Dropshipping API
   │                                        │                                  │
   │── POST /dropshipping/orders ──────────▶│                                  │
   │                                        │                                  │
   │                                        │── Validar instance_id ──────────▶│
   │                                        │◀── Instance Valid ──────────────│
   │                                        │                                  │
   │                                        │── Validar affiliate ────────────▶│
   │                                        │◀── Affiliate Valid ─────────────│
   │                                        │                                  │
   │                                        │◀─ Response: orderId, commission │
   │◀── 201: {success, orderId} ──────────│                                  │
   │                                        │                                  │
   │                                        │── POST /whitelabel/.../webhooks  │
   │                                        │◀─ Webhook Created                │
```

### Fluxo 2: Atualização de Status e Liberação de Comissão

Quando um pedido atinge o status "delivered", o sistema de dropshipping calcula e registra a comissão do afiliado. Este fluxo automatizado garante que comissões sejam liberadas apenas após confirmação de entrega, mantendo a integridade financeira do sistema.

```
Order Status                           Dropshipping API                    White-Label API
   │                                        │                                  │
   │── PATCH /orders/:id/status (delivered)│                                  │
   │                                        │                                  │
   │                                        │── Calculate Commission           │
   │                                        │◀── commissionAmount             │
   │                                        │                                  │
   │                                        │── Insert commissions table        │
   │                                        │◀── Commission Registered         │
   │                                        │                                  │
   │                                        │── Update affiliate.pendingCommissions│
   │                                        │◀── Updated                      │
   │                                        │                                  │
   │                                        │── POST /webhooks (order.delivered)│
   │                                        │◀── OK                            │
   │◀── 200: {success, commissionCalculated}│                                  │
```

### Fluxo 3: Sincronização de Métricas para Dashboard

O dashboard White-Label consolida métricas de dropshipping para apresentar ao parceiro uma visão unificada do desempenho de sua instância. Este fluxo consulta dados de pedidos e comissões da Fase 8 e os consolida com métricas da Fase 7.

```
Dashboard Request                      White-Label API                    Dropshipping API
   │                                        │                                  │
   │── GET /instances/:id/metrics ──────────▶│                                  │
   │                                        │                                  │
   │                                        │── GET /affiliates/:id/commissions▶
   │                                        │◀── {commissions[], total} ───────│
   │                                        │                                  │
   │                                        │── GET /orders?instance_id=X ────▶│
   │                                        │◀── {orders[], stats} ───────────│
   │                                        │                                  │
   │                                        │◀─ Consolidated Metrics           │
   │◀── 200: {revenue, orders, commissions}─│                                  │
```

### Fluxo 4: Notificação de Eventos via Webhook

O sistema de webhooks permite que eventos de dropshipping sejam notificados a sistemas externos configurados pela instância White-Label. Quando um evento ocorre (como mudança de status ou criação de pedido), um webhook é disparado para todos os endpoints registrados naquela instância.

```
Event Trigger                          Dropshipping API                    External System
   │                                        │                                  │
   │  (order.delivered)                     │                                  │
   │                                        │                                  │
   │                                        │── Load webhook URLs for instance │
   │                                        │                                  │
   │                                        │── POST {event, data} ──────────▶│
   │                                        │◀── 200 OK                        │
   │                                        │                                  │
   │                                        │── Log webhook delivery           │
   │                                        │◀── Logged                        │
```

## Mapeamento de Dados

### Estrutura de Dados para Sincronização

A integração entre os sistemas requer mapeamento consistente de estruturas de dados. Os schemas abaixo definem como os dados são transformados entre sistemas durante as operações de sincronização.

**Order Creation Request (White-Label → Dropshipping)**

```json
{
  "instance_id": "inst_abc123def456",
  "affiliate_id": 1,
  "product_id": 10,
  "external_order_id": "SHOPEE-123456",
  "marketplace": "shopee",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "address": "Rua Teste, 123 - São Paulo, SP - 01000-000"
  },
  "amount": 5990,
  "commission_config": {
    "percentage": 10,
    "source": "affiliate"
  }
}
```

**Order Response (Dropshipping → White-Label)**

```json
{
  "order_id": 1,
  "instance_id": "inst_abc123def456",
  "status": "pending",
  "commission_amount": 599,
  "affiliate_commission_percentage": 10,
  "created_at": "2026-05-28T19:50:00Z",
  "marketplace": "shopee",
  "external_order_id": "SHOPEE-123456"
}
```

**Commission Record (Dropshipping)**

```json
{
  "id": 1,
  "affiliate_id": 1,
  "order_id": 1,
  "amount": 599,
  "level": 1,
  "source": "dropshipping",
  "status": "pending",
  "calculated_at": "2026-05-28T19:50:00Z",
  "released_at": null
}
```

**Webhook Payload (Dropshipping → White-Label)**

```json
{
  "event": "order.delivered",
  "instance_id": "inst_abc123def456",
  "timestamp": "2026-05-28T20:30:00Z",
  "data": {
    "order_id": 1,
    "external_order_id": "SHOPEE-123456",
    "commission_amount": 599,
    "affiliate_id": 1
  }
}
```

## Contrato de API para Integração

### Headers de Autenticação

A comunicação entre sistemas utiliza autenticação via Bearer Token, onde a White-Label API valida a identidade do solicitante antes de代理请求 ao sistema de dropshipping.

```
Authorization: Bearer wl_partner_{api_key}
X-Instance-Id: inst_abc123def456
X-Request-Id: req_uuid123
Content-Type: application/json
```

### Handlers de Erro

Os erros são padronizados para facilitar o tratamento adequado por sistemas consumidores da API.

| Código | HTTP Status | Descrição | Ação Recomendada |
|--------|-------------|-----------|------------------|
| `INSTANCE_NOT_FOUND` | 404 | Instância não existe | Verificar instance_id |
| `AFFILIATE_NOT_FOUND` | 404 | Afiliado não existe | Verificar affiliate_id |
| `ORDER_NOT_FOUND` | 404 | Pedido não existe | Verificar order_id |
| `INVALID_STATUS_TRANSITION` | 400 | Transição de status inválida | Validar fluxo de estados |
| `COMMISSION_CALCULATION_FAILED` | 500 | Falha no cálculo | Verificar amount e percentage |
| `WEBHOOK_DELIVERY_FAILED` | 500 | Falha no disparo | Retry com backoff exponencial |

### Validações Cruzadas

Antes de processar operações de dropshipping, o sistema valida constraints definidas na instância White-Label, garantindo que parceiros não ultrapassem limites estabelecidos em seus planos.

```
1. Plan Limits Validation
   - Verificar se instância tem módulo dropshipping ativo
   - Verificar limite de afiliados permitido pelo plano
   - Verificar limite de pedidos simultâneos

2. Affiliate Status Validation
   - Verificar se afiliado está ativo
   - Verificar se affiliate pertence à instância correta

3. Product Validation
   - Verificar se produto existe
   - Verificar se produto está ativo para venda

4. Amount Validation
   - Verificar se amount está dentro de limites do plano
   - Validar formato monetário (centavos)
```

## Funcionalidades de Integração

### Gestão de Afiliados Cruzada

A instância White-Label pode criar e gerenciar afiliados que operam dentro do sistema de dropshipping. Esta funcionalidade permite que parceiros adicionem vendedores sem necessidade de interação direta com o sistema de dropshipping.

```
White-Label: POST /whitelabel/instances/{id}/affiliates
  ├── Cria usuário na instância (role: affiliate)
  ├── Sincroniza com Dropshipping: POST /dropshipping/affiliates
  └── Retorna affiliate_id unificado

White-Label: GET /whitelabel/instances/{id}/affiliates
  ├── Lista usuários com role affiliate
  └── Inclui dados de comissões pendentes do dropshipping
```

### Compartilhamento de Branding

O branding configurado na instância White-Label é automaticamente aplicado aos templates de email transacional do sistema de dropshipping, garantindo consistência visual em todas as comunicações com clientes e afiliados.

```
Branding Sync:
  ├── Logo principal → Email header (dropshipping)
  ├── Cores do tema → Email templates
  ├── Fonte primária → Email typography
  └── URL da instância → Email footer links
```

### Consolidação de Métricas e Analytics

O dashboard White-Label presenta métricas consolidadas que combinam dados de uso da plataforma com dados operacionais de dropshipping, oferecendo aos parceiros uma visão completa do desempenho de seus negócios.

```
Dashboard Metrics:
  ├── Total de pedidos dropshipping
  ├── Valor total de vendas
  ├── Comissões geradas e liberadas
  ├── Taxa de conversão de pedidos
  ├── ticket médio
  ├── Distribuição por marketplace
  └── Ranking de afiliados por volume
```

## Implementação Recomendada

### Configuração de Ambiente

A integração requer que as variáveis de ambiente estejam corretamente configuradas em ambos os sistemas para garantir comunicação segura e operações adequadas.

**White-Label API (fase7/.env)**
```
DROPSHIP_API_URL=http://localhost:3000
DROPSHIP_API_KEY=dropshipping_secret_key
DROPSHIP_WEBHOOK_SECRET=whsec_dropship_webhook_secret
```

**Dropshipping API (fase8/.env)**
```
WHITELABEL_API_URL=http://localhost:8000
WHITELABEL_API_KEY=wl_partner_api_key
WHITELABEL_INSTANCE_HEADER=X-Instance-Id
```

### Middleware de Integração

Recomenda-se a implementação de um middleware na White-Label API que centralize todas as operações de comunicação com o sistema de dropshipping, incluindo tratamento de retries, circuit breaker e logging centralizado.

```
IntegrationMiddleware:
  ├── validateInstanceContext() - Valida contexto da instância
  ├── forwardToDropshipping() - Repassa requests ao dropshipping
  ├── transformResponse() - Normaliza respostas
  ├── handleErrors() - Trata erros de integração
  └── logRequests() - Logging para debugging
```

### Webhook Receiver no White-Label

O sistema White-Label deve expor um endpoint para receber webhooks do dropshipping, permitindo que eventos sejam processados e refletidos no dashboard da instância.

```
POST /whitelabel/integrations/dropshipping/webhook
  ├── Validar assinatura do webhook
  ├── Parsear payload do evento
  ├── Atualizar dados locais (comissões, pedidos)
  ├── Disparar notificações internas
  └── Retornar 200 para confirmar recebimento
```

## Próximos Passos

O roadmap de implementação da integração está organizado em fases sequenciais, permitindo desenvolvimento incremental e testes progressivos de cada componente.

**Fase 1: Infraestrutura de Integração (Semana 1-2)**
- Implementar middleware de comunicação entre sistemas
- Configurar variáveis de ambiente e credenciais
- Criar endpoint de health check cruzado
- Implementar logging centralizado de integração

**Fase 2: Sincronização de Dados (Semana 3-4)**
- Implementar criação de afiliados cruzada
- Implementar busca de pedidos por instância
- Implementar sincronização de status de pedidos
- Criar endpoint de webhook receiver

**Fase 3: Funcionalidades Avançadas (Semana 5-6)**
- Implementar consolidação de métricas
- Implementar compartilhamento de branding
- Implementar notifications cross-system
- Criar dashboard unificado de analytics

**Fase 4: Validação e Produção (Semana 7-8)**
- Implementar testes de integração
- Configurar ambiente de staging
- Executar testes de carga
- Preparar documentação de deployment

## Considerações de Segurança

A integração entre os sistemas deve seguir práticas recomendado de segurança para proteger dados sensíveis e garantir a integridade das operações.

**Autenticação e Autorização**
- Todas as chamadas entre sistemas devem utilizar Bearer tokens
- Tokens devem ser rotacionados periodicamente
- Instance ID deve ser validado em todas as requests
- Rate limiting deve ser aplicado por instância

**Proteção de Dados**
- Dados de clientes devem ser criptografados em trânsito (HTTPS)
- Informações de pagamento não devem ser logadas
- Dados sensíveis devem ser mascarados em erros
- Webhooks devem validar assinatura HMAC

**Monitoramento**
- Logs de integração devem ser mantidos por no mínimo 90 dias
- Alertas devem ser configurados para falhas de comunicação
- Métricas de latência devem ser monitoradas
- Circuit breaker deve interromper tentativas após falhas consecutivas

---

**Versão**: 1.0.0
**Data**: 2026-05-28
**Autor**: MiniMax Agent
**Projeto**: MMN_AI-to-AI