# Manual de Integração - MMN AI-to-AI

Este manual descreve como integrar sistemas externos e novos marketplaces à plataforma MMN AI-to-AI.

## 1. Integrando Novos Marketplaces
Para adicionar um novo marketplace (ex: Amazon, Magalu), siga estes passos:

### Backend
1. **Schema**: Adicione o novo enum em `products.marketplace` no arquivo `schema.ts`.
2. **Router**: Crie uma nova procedure em `marketplacesRouter.ts` para lidar com a autenticação e busca de produtos da nova API.
3. **Sync Service**: Implemente uma função de sincronização que mapeie os campos externos para o modelo interno:
   - `externalId` -> ID único do produto na plataforma.
   - `commissionPercentage` -> Margem oferecida ao afiliado.

### Frontend
1. Adicione o logo e as cores da marca no componente `ProductCard`.
2. Atualize os filtros de busca para incluir a nova fonte.

---

## 2. Webhooks de Conversão
O sistema está preparado para receber notificações de vendas externas.

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

---

## 3. Integração com Redes Sociais
Os agentes utilizam conectores para postagem:
- **WhatsApp**: Via API oficial ou gateways de automação.
- **Instagram/Facebook**: Via Graph API da Meta.
- **X (Twitter)**: Via API v2.

Para configurar novas credenciais, o administrador deve acessar o arquivo de configuração de conectores do sistema.

---

## 4. Exportação de Dados
Para BI e relatórios externos, os dados podem ser consumidos via:
- **CSV Export**: Disponível no painel admin.
- **JSON API**: Endpoint `system.getRawData` (apenas para admins).
