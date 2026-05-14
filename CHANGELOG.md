# Changelog MMN AI-to-AI

## 2026-05-14

### Implementação de Cache Redis e Rate Limiting

*   **Cache Redis:** Integrado nos endpoints `listModels`, `getModel`, `getModelStats` e `getContentAnalytics` do `aiContentHubRouter.ts` para otimizar a performance e reduzir a carga no servidor. Utiliza `cache-service.ts` para gerenciar o cache com tempos de vida (TTL) configuráveis para diferentes tipos de dados.
*   **Rate Limiting:** Implementado nos endpoints `listModels`, `generateContent`, `schedulePost` e `getContentAnalytics` do `aiContentHubRouter.ts` usando `rate-limiter.ts`. Isso protege a API contra uso excessivo e ataques de negação de serviço, aplicando limites de requisições por usuário e por IP.

### Suporte a Imagens e Vídeos

*   **Módulo de Mídia:** Adicionados novos endpoints ao `aiContentHubRouter.ts` para `listMedia`, `deleteMedia` e `getUploadUrl`. Estes endpoints utilizam o `media-service.ts` para gerenciar o upload, listagem e exclusão de imagens e vídeos no AWS S3, além de gerar URLs pré-assinadas para uploads seguros.

### Configuração de Monitoramento com Prometheus e Grafana

*   **Prometheus:** Configurado para coletar métricas do backend da aplicação, Redis, MySQL, Node Exporter e cAdvisor, conforme `prometheus.yml`.
*   **Grafana:** Configurado para visualização de métricas, com volumes persistentes para dados.
*   **Alertmanager:** Configurado com um `alertmanager.yml` básico para gerenciamento de alertas.
*   **Loki e Promtail:** Adicionados para agregação de logs, com `loki-config.yml` e `promtail-config.yml` para coleta e armazenamento de logs de sistema e contêineres.
*   **Jaeger:** Incluído para rastreamento distribuído, facilitando a depuração de requisições complexas.

Essas implementações visam melhorar a performance, segurança, escalabilidade e observabilidade do sistema, preparando-o para futuras expansões e um ambiente de produção robusto.
