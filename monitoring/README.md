# Monitoramento MMN AI-to-AI

## Grafana Dashboard

O arquivo `grafana-dashboard.json` é um dashboard pronto para importação no Grafana 10+.

### Como importar

1. Abra o Grafana no seu ambiente
2. Vá em **Dashboards → Import**
3. Clique em **Upload JSON file** e selecione `grafana-dashboard.json`  
   (ou cole o conteúdo JSON diretamente)
4. Selecione a **data source Prometheus** apontando para `<backend>/metrics`
5. Clique em **Import**

### Configuração do scrape Prometheus

```yaml
scrape_configs:
  - job_name: mmn-backend
    static_configs:
      - targets: ['backend:3000']   # ajuste host:porta
    metrics_path: /metrics
    scrape_interval: 15s
```

### Painéis disponíveis

| Seção | Painéis |
|-------|---------|
| Visão Geral | 6 stat cards (requests, erros, tRPC, PIX, uptime) |
| Latência HTTP | Percentis p50/p95/p99 |
| Latência tRPC | Percentis p50/p95/p99 |
| PIX & Pagamentos | Taxa QR/confirmados, eventos de comissão |
| Agentes IA | Sessões, heap gauge Node.js |
| Requests | Taxa total/sucesso/erro |

### Endpoint de métricas

```
GET /metrics
Content-Type: text/plain; version=0.0.4
```

Implementado em `backend/src/middlewares/prometheusMetrics.ts` (zero deps — formato Prometheus manual).
