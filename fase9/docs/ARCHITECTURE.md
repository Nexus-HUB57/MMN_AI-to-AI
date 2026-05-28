# Documentação Complementar - Fase 9 GA Launch

## Visão Geral do GA Launch

O programa de General Availability (GA) Launch representa a fase mais crítica do projeto MMN_AI-to-AI, marcando a transição de um MVP funcional para uma plataforma comercial pronta para produção. Esta documentação complementa o SPEC.md principal com informações adicionais sobre implementação, integração e operação.

## Arquitetura de Referência

### Visão Geral da Arquitetura

A arquitetura do sistema GA é projetada para alta disponibilidade, escalabilidade e segurança. O design segue princípios de microservices com orchestration via Kubernetes, garantindo que cada componente possa ser escalado independentemente conforme demanda.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN (Cloudflare)                         │
│                    DDoS Protection + WAF + Cache                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Load Balancer (L7)                            │
│                   SSL Termination + Routing                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  API Server   │    │  API Server   │    │  API Server   │
│  (Node.js)    │    │  (Node.js)    │    │  (Node.js)    │
│  Pod: 3       │    │  Pod: 3       │    │  Pod: 3       │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    Redis      │    │   PostgreSQL   │    │    BullMQ     │
│   (Cache)     │    │   (Primary)    │    │    (Queue)    │
│               │    │   + Replicas   │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Componentes Principais

**API Gateway**: Ponto de entrada para todas as requisições, responsavel por autenticação, rate limiting, roteamento e logging. Implementado em Node.js com Express ou Fastify, utilizando middleware pattern parachain de validação e transformação de requests.

**Application Servers**: Stateless servers que processam lógica de negócio. Cada pod pode processar qualquer tipo de requisição, permitindo load balancing round-robin ou least-connections. Comunicação inter-serviço utiliza protocolo HTTP/JSON para simplicidade e gRPC para performance crítico onde necessário.

**Database Layer**: PostgreSQL com configuração de alta disponibilidade. Primary node recebe todas as writes, enquanto read replicas distribuem reads. Replicação síncrona para primeira replica garante zero data loss em failover scenario. Connection pooling via PgBouncer otimiza resource utilization.

**Cache Layer**: Redis utilizado para sessão storage, hot data cache e rate limiting counters. TTLs vary por tipo de dado: sessão (24h),热点数据 (5min), counters (1min). Cache invalidation segue event-driven pattern para garantirconsistência.

**Message Queue**: BullMQ sobre Redis processa jobsassíncronos como email sending, webhook delivery, agent execution. Filas dedicadas para cada tipo de job permiten prioritization e isolation. Dead letter queues capturam failed jobs para investigation.

## Modelo de Dados

### Schema Principal

O schema do banco de dados foi projetado para suportar o modelo de negócios MMN com multi-tenancy via white-label. Cada tenant (instância white-label) possui isolação lógica através de tenant_id em todas as tabelas.

```sql
-- Instâncias White-Label
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    plan_id UUID REFERENCES plans(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuários (afiliados)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'affiliate',
    affiliate_code VARCHAR(20) UNIQUE,
    parent_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos (Marketplace)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id),
    external_id VARCHAR(255),
    marketplace VARCHAR(100),
    name VARCHAR(255),
    price INTEGER, -- em centavos
    commission_percentage INTEGER DEFAULT 10,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos (Dropshipping)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    external_order_id VARCHAR(255),
    marketplace VARCHAR(100),
    amount INTEGER,
    commission_amount INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    customer_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comissões
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount INTEGER,
    level INTEGER DEFAULT 1,
    source VARCHAR(50),
    source_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Segurança e Compliance

### Matriz de Controles SOC2

| Categoria | Controle | Implementação |
|-----------|----------|---------------|
| Access Control | MFA for all users | TOTP-based 2FA |
| Access Control | Role-based permissions | RBAC with predefined roles |
| Encryption | Data at rest | AES-256 for all storage |
| Encryption | Data in transit | TLS 1.3 mandatory |
| Logging | Audit trail | Immutable logs, 1 year retention |
| Change Mgmt | Code review | PR requirements, 2 approvals |
| Backup | Point-in-time recovery | Continuous archiving |
| Incident | Response procedures | Playbooks, 24h notification |

### LGPD/GDPR Compliance Matrix

| Requisito | Implementação | Status |
|-----------|---------------|--------|
| Consentimento explícito | Cookie banner + terms acceptance | ✅ |
| Direito de acesso | API endpoint para export dados | ✅ |
| Direito de correção | Profile editing + data update API | ✅ |
| Direito de deletion | Account deletion + data wipe | ✅ |
| Portabilidade | JSON export de todos os dados | ✅ |
| Data retention | Policies automatizadas | ✅ |
| Breach notification | 72h notification procedure | ✅ |

## Operações e Monitoring

### On-Call Rotation

| Semana | Primary | Secondary | Escalation |
|--------|---------|-----------|------------|
| Week 1-2 | DevOps-1 | DevOps-2 | Engineering Manager |
| Week 3-4 | DevOps-2 | Backend-1 | Engineering Manager |
| Week 5-6 | Backend-1 | DevOps-1 | Engineering Manager |

### Runbook de Incidentes

**P1 - Critical (Service Down)**
1. Acknowledge em 15 minutos
2. Avaliar impacto (users afetados, revenue impact)
3. Ativar war room se > 100 users afetados
4. Comunicar stakeholders a cada 30 minutos
5. Priorizar fix sobre root cause analysis
6. Post-mortem dentro de 5 dias úteis

**P2 - High (Degraded Performance)**
1. Acknowledge em 30 minutos
2. Investigar causa raíz
3. Implementar mitigação se disponível
4. Update stakeholders a cada 2 horas
5. Resolution tracking until fixed

## Testes e Qualidade

### Strategy de Testes

```
Unit Tests (70%)
├── Service layer tests
├── Utility function tests
└── Model validation tests

Integration Tests (20%)
├── API endpoint tests
├── Database integration
└── Queue/job processing

E2E Tests (10%)
├── Critical user flows
├── Payment flows
└── Auth flows
```

### Test Coverage Requirements

| Componente | Minimum Coverage |
|------------|-------------------|
| API Routes | 80% |
| Services | 85% |
| Models/Schemas | 90% |
| Utils | 100% |

## Deployment e CI/CD

### Pipeline de Deployment

```yaml
stages:
  - test
  - build
  - security-scan
  - deploy-staging
  - integration-tests
  - deploy-production

test:
  script:
    - npm run lint
    - npm run test:unit
    - npm run test:integration

build:
  script:
    - npm run build
    - docker build -t app:$CI_COMMIT_SHA
    - docker push registry/app:$CI_COMMIT_SHA

deploy-production:
  script:
    - kubectl set image deployment/api api=registry/app:$CI_COMMIT_SHA
    - kubectl rollout status deployment/api
    - kubectl rollout history deployment/api
```

---

**Versão**: 1.0.0
**Data**: 2026-05-28
**Autor**: Nexus-HUB57 / MiniMax Agent