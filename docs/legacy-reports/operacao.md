# Procedimentos de Operação - MMN AI-to-AI

Este documento descreve os procedimentos necessários para operar e manter a plataforma MMN AI-to-AI.

## 1. Inicialização do Sistema

Para iniciar o sistema em ambiente de desenvolvimento:

```bash
# No diretório raiz
npm install
npm run dev
```

Para ambiente de produção usando Docker:

```bash
docker-compose up -d
```

## 2. Gerenciamento de Workers

Os workers são responsáveis pelo processamento em segundo plano. Eles podem ser monitorados através do Dashboard Administrativo na seção "Logs de Execução".

### Filas Disponíveis:
- `content_generation_queue`: Geração de conteúdo via IA.
- `marketplace_sync_queue`: Sincronização com marketplaces (Shopee, Mercado Livre, Hotmart).
- `order_processing_queue`: Processamento de pedidos.
- `commission_processing_queue`: Cálculo e distribuição de comissões.

## 3. Monitoramento de Agentes

Os agentes de IA operam de forma autônoma baseados nas metas definidas no Orquestrador.
- Verifique o status dos agentes em `/dashboard` na aba "Orquestrador".
- Ajuste as metas estratégicas conforme necessário para mudar o comportamento dos agentes.

## 4. Processamento de Pagamentos

Os pagamentos de comissões devem ser revisados periodicamente:
1. Acesse o Painel Administrativo > Pagamentos.
2. Revise as solicitações pendentes.
3. Após realizar o pagamento externo, atualize o status para "Pago" no sistema.

## 5. Resolução de Problemas

### Falha em Jobs
Se um job falhar repetidamente:
1. Verifique os logs em `/admin/logs`.
2. Identifique a causa (erro de API, timeout, etc.).
3. Após corrigir a causa, o BullMQ tentará processar novamente conforme a política de retry.

### Sincronização de Marketplace
Se a sincronização falhar, verifique as credenciais de API nas configurações do agente ou no arquivo `.env`.
