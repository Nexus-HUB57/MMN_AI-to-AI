# Fase 4: Deploy e Operações

## Visão Geral

A Fase 4 garante que o IA Content Hub possa ser implantado, monitorado e mantido em um ambiente de produção de forma eficiente e segura. Esta documentação cobre CI/CD, testes de produção, monitoramento e documentação de usuário.

---

## 1. Pipeline CI/CD

### 1.1 Configuração GitHub Actions

O pipeline CI/CD está configurado em `.github/workflows/ci-cd.yml` e executa automaticamente:

#### **Estágio 1: Testes**
- Testes unitários
- Testes de integração
- Linting e verificação de código
- Cobertura de testes (>80%)

```bash
# Executar testes localmente
pnpm run test:unit
pnpm run test:integration
pnpm run test:coverage
```

#### **Estágio 2: Build**
- Build do backend
- Build do frontend
- Construção de imagem Docker
- Push para Container Registry

```bash
# Executar build localmente
pnpm run build:backend
pnpm run build:frontend
docker build -t ia-content-hub:latest .
```

#### **Estágio 3: Security Scan**
- Trivy vulnerability scanner
- npm audit
- SARIF upload para GitHub Security

#### **Estágio 4: Deploy Staging**
- Deploy automático em staging
- Smoke tests
- Notificação Slack

#### **Estágio 5: Deploy Production**
- Deploy manual ou automático
- Health checks
- Rollback automático em caso de falha

### 1.2 Variáveis de Ambiente Necessárias

Configure as seguintes secrets no GitHub:

```
STAGING_DEPLOY_KEY          # SSH private key para staging
STAGING_DEPLOY_HOST         # Host do servidor staging
STAGING_DEPLOY_USER         # Usuário SSH para staging

PROD_DEPLOY_KEY             # SSH private key para produção
PROD_DEPLOY_HOST            # Host do servidor produção
PROD_DEPLOY_USER            # Usuário SSH para produção

SLACK_WEBHOOK               # Webhook para notificações Slack
```

---

## 2. Deploy em Staging

### 2.1 Configuração do Ambiente

```bash
# Clonar repositório
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.staging.example .env.staging
# Editar .env.staging com valores reais
```

### 2.2 Variáveis de Ambiente Staging

```env
# Database
DATABASE_URL=mysql://user:password@staging-db:3306/ia_content_hub_staging
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=staging-redis
REDIS_PORT=6379
REDIS_PASSWORD=staging_password

# AWS S3
AWS_ACCESS_KEY_ID=staging_key
AWS_SECRET_ACCESS_KEY=staging_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=ia-content-hub-staging

# APIs
OPENAI_API_KEY=sk-staging-...
GOOGLE_GENKIT_API_KEY=staging-key

# OAuth
OAUTH_CLIENT_ID=staging_client_id
OAUTH_CLIENT_SECRET=staging_client_secret

# Monitoring
SENTRY_DSN=https://staging@sentry.io/...
LOG_LEVEL=info
```

### 2.3 Executar Staging

```bash
# Build
pnpm run build:backend
pnpm run build:frontend

# Migrar banco de dados
pnpm run migrate:staging

# Iniciar com PM2
pm2 start ecosystem.config.js --env staging

# Verificar status
pm2 status
pm2 logs ia-content-hub-staging
```

---

## 3. Deploy em Produção

### 3.1 Checklist Pré-Deploy

- [ ] Todos os testes passando (>80% cobertura)
- [ ] Code review aprovado
- [ ] Segurança validada (Trivy, npm audit)
- [ ] Changelog atualizado
- [ ] Documentação atualizada
- [ ] Backup do banco de dados realizado
- [ ] Plano de rollback preparado

### 3.2 Processo de Deploy

```bash
# 1. Criar tag de versão
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. GitHub Actions dispara automaticamente
# 3. Verificar deployment em https://ia-content-hub.example.com

# 4. Executar smoke tests
curl -f https://ia-content-hub.example.com/health
curl -f https://ia-content-hub.example.com/api/health

# 5. Monitorar logs
pm2 logs ia-content-hub
```

### 3.3 Rollback

```bash
# Se algo der errado, fazer rollback
git revert <commit-hash>
git push origin main

# Ou reverter para versão anterior
pm2 restart ia-content-hub
pm2 save
```

---

## 4. Testes de Produção

### 4.1 Smoke Tests

```bash
# Health check
curl -f https://ia-content-hub.example.com/health

# API health
curl -f https://ia-content-hub.example.com/api/health

# Listar modelos
curl -H "Authorization: Bearer $TOKEN" \
  https://ia-content-hub.example.com/api/trpc/aiContentHub.listModels
```

### 4.2 Testes de Performance

```bash
# Usar Apache Bench
ab -n 1000 -c 100 https://ia-content-hub.example.com/health

# Ou k6
k6 run tests/load-test.js
```

### 4.3 Testes de Segurança

```bash
# OWASP ZAP
zaproxy -cmd -quickurl https://ia-content-hub.example.com -quickout report.html

# Nmap
nmap -A ia-content-hub.example.com
```

### 4.4 Backup e Recovery

```bash
# Backup automático (diário)
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Restaurar
mysql -u user -p database < backup-20240514.sql

# Backup Redis
redis-cli BGSAVE
```

---

## 5. Monitoramento

### 5.1 Stack de Monitoramento

- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização de dashboards
- **Loki**: Agregação de logs
- **Jaeger**: Distributed tracing
- **AlertManager**: Gerenciamento de alertas
- **Sentry**: Rastreamento de erros

### 5.2 Iniciar Stack de Monitoramento

```bash
# Usar docker-compose
docker-compose -f docker/docker-compose.monitoring.yml up -d

# Acessar dashboards
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# Jaeger: http://localhost:16686
# Loki: http://localhost:3100
```

### 5.3 Métricas Principais

#### **Performance**
- Tempo de resposta (p50, p95, p99)
- Taxa de erro (5xx, 4xx)
- Throughput (req/s)
- Latência de banco de dados

#### **Recursos**
- CPU (%)
- Memória (MB)
- Disco (GB)
- Conexões de banco de dados

#### **Negócio**
- Conteúdo gerado (count)
- Posts agendados (count)
- Taxa de sucesso de publicação (%)
- Engajamento médio

### 5.4 Alertas Configurados

```yaml
# Alertas críticos
- CPU > 80% por 5 minutos
- Memória > 90% por 5 minutos
- Taxa de erro > 5% por 5 minutos
- Tempo de resposta > 2s (p95) por 5 minutos
- Banco de dados indisponível
- Redis indisponível
- Espaço em disco < 10%
```

### 5.5 Dashboards Grafana

#### **Dashboard 1: Overview**
- Status geral do sistema
- Uptime
- Taxa de erro
- Latência média

#### **Dashboard 2: Performance**
- Tempo de resposta por endpoint
- Taxa de throughput
- Uso de cache
- Performance de queries

#### **Dashboard 3: Recursos**
- CPU, Memória, Disco
- Conexões de banco de dados
- Conexões Redis
- Network I/O

#### **Dashboard 4: Negócio**
- Conteúdo gerado
- Posts agendados
- Taxa de sucesso
- Engajamento

---

## 6. Logs Centralizados

### 6.1 Configuração Loki

```yaml
# loki-config.yml
auth_enabled: false

ingester:
  chunk_idle_period: 3m
  chunk_retain_period: 1m
  max_chunk_age: 1h
  chunk_encoding: snappy

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema:
        version: v11
        index:
          prefix: index_
          period: 24h

server:
  http_listen_port: 3100
  log_level: info
```

### 6.2 Coletar Logs com Promtail

```yaml
# promtail-config.yml
clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: 'container'
```

### 6.3 Consultar Logs

```bash
# Via Grafana Loki UI
# http://localhost:3000 -> Explore -> Loki

# Exemplos de queries
{job="ia-content-hub"} | json
{job="ia-content-hub"} | json | level="error"
{job="ia-content-hub"} | json | status >= 500
```

---

## 7. Rastreamento de Erros

### 7.1 Integração Sentry

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
});

// Capturar exceções
try {
  // código
} catch (error) {
  Sentry.captureException(error);
}
```

### 7.2 Acessar Dashboard Sentry

- URL: https://sentry.io/organizations/your-org/
- Filtrar por projeto: ia-content-hub
- Analisar stack traces
- Configurar alertas por email

---

## 8. Documentação de Usuário

### 8.1 Guia de Uso

Consulte `docs/USER_GUIDE.md` para:
- Como criar conta
- Como gerar conteúdo
- Como agendar posts
- Como visualizar analytics
- Como conectar redes sociais

### 8.2 Documentação de APIs

```bash
# Gerar documentação OpenAPI
pnpm run generate:openapi

# Acessar Swagger UI
# http://localhost:3001/api/docs
```

### 8.3 Troubleshooting

Consulte `docs/TROUBLESHOOTING.md` para:
- Problemas comuns
- Soluções
- Como coletar logs para suporte

### 8.4 FAQ

Consulte `docs/FAQ.md` para:
- Perguntas frequentes
- Limites de rate limiting
- Planos de preço
- Suporte

---

## 9. Manutenção Operacional

### 9.1 Tarefas Diárias

- [ ] Verificar status do sistema (Grafana)
- [ ] Revisar logs de erro (Sentry)
- [ ] Verificar alertas (AlertManager)
- [ ] Monitorar performance (Prometheus)

### 9.2 Tarefas Semanais

- [ ] Revisar relatório de performance
- [ ] Verificar uso de recursos
- [ ] Testar backup e recovery
- [ ] Atualizar dependências menores

### 9.3 Tarefas Mensais

- [ ] Revisar segurança (Trivy, npm audit)
- [ ] Atualizar documentação
- [ ] Planejar próximas features
- [ ] Revisar métricas de negócio

### 9.4 Tarefas Trimestrais

- [ ] Teste de disaster recovery
- [ ] Auditoria de segurança
- [ ] Planejamento de capacidade
- [ ] Revisão de SLA

---

## 10. Escalabilidade

### 10.1 Horizontal Scaling

```yaml
# docker-compose.production.yml
services:
  backend:
    image: ia-content-hub:latest
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
```

### 10.2 Load Balancing

```nginx
# nginx.conf
upstream backend {
    server backend-1:3001;
    server backend-2:3001;
    server backend-3:3001;
}

server {
    listen 80;
    server_name ia-content-hub.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 10.3 Database Replication

```sql
-- Master-Slave replication
CHANGE MASTER TO
  MASTER_HOST='master-db',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;
```

---

## 11. Checklist de Qualidade

- [ ] Cobertura de testes: > 80%
- [ ] Lighthouse Score: > 90
- [ ] Tempo de resposta: < 2s (p95)
- [ ] Uptime: > 99.9%
- [ ] Sem erros críticos em logs
- [ ] Documentação: Completa e atualizada
- [ ] Code review: Aprovado
- [ ] Segurança: Validada

---

## 12. Contatos e Suporte

- **Slack**: #ia-content-hub-ops
- **Email**: ops@example.com
- **PagerDuty**: https://example.pagerduty.com
- **Status Page**: https://status.example.com

---

## Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
