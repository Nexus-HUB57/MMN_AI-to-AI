# Fase 8 - Dropshipping Automatizado

## Descrição

Backend automatizado para dropshipping que permite afiliados venderem produtos de marketplaces (Shopee, Mercado Livre, etc.) com gestão automatizada de pedidos, comissões e notificações.

## Funcionalidades

- **Registro de Pedidos**: Criação automática de pedidos com cálculo de comissões
- **Gestão de Status**: Atualização de status (pending → processing → shipped → delivered)
- **Comissões Automáticas**: Cálculo e registro de comissões na entrega
- **Notificações**: Sistema de notificações para cliente e afiliado
- **API REST**: Endpoints completos para integração

## Estrutura de Diretórios

```
fase8/
├── src/
│   ├── services/
│   │   └── dropshippingService.ts    # Lógica de negócio
│   └── routes/
│       └── dropshippingRoutes.ts      # Endpoints da API
├── tests/
│   └── dropshipping.test.ts          # Testes unitários
├── docs/
│   └── SPEC.md                       # Especificação técnica
└── README.md
```

## Instalação

```bash
# Instalar dependências
npm install

# Executar testes
npm test

# Build
npm run build
```

## Uso

### Registrar Pedido

```bash
curl -X POST http://localhost:3000/dropshipping/orders \
  -H "Content-Type: application/json" \
  -d '{
    "affiliateId": 1,
    "productId": 10,
    "externalOrderId": "SHOPEE-123456",
    "marketplace": "shopee",
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "shippingAddress": "Rua Teste, 123 - São Paulo, SP",
    "amount": 5990
  }'
```

### Atualizar Status

```bash
curl -X PATCH http://localhost:3000/dropshipping/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

## Fluxo de Dados

```
Afiliado → Pedido (amount) → Cálculo Comissão → Registro → Notificações
                ↓
         Comissões (pending)
                ↓
         Afiliado (pendingCommissions)
```

## Status dos Pedidos

| Status | Descrição |
|--------|-----------|
| `pending` | Pedido criado, aguardando processamento |
| `processing` | Pedido em processamento |
| `shipped` | Pedido enviado |
| `delivered` | Pedido entregue (trigger佣金) |
| `cancelled` | Pedido cancelado |

## Cálculo de Comissão

```
commissionAmount = amount × (commissionPercentage / 100)

Exemplo:
- amount = R$ 100,00
- commissionPercentage = 10%
- commissionAmount = R$ 10,00
```

## Integração com Banco de Dados

Utiliza o schema existente em `database/schemas/schema-final.ts`:

- `orders` - Pedidos de dropshipping
- `products` - Produtos dos marketplaces
- `affiliates` - Afiliados com código e percentual
- `commissions` - Comissões geradas

---

**Versão**: 1.0.0
**Data**: 2026-05-25
**Autor**: Nexus-HUB57 / MiniMax Agent