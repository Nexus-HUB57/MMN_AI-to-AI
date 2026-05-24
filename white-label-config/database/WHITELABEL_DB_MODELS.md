# Modelos de Banco de Dados - Multi-Tenancy

## Visão Geral

Este documento especifica os modelos de banco de dados para suportar a arquitetura multi-tenant da plataforma White-Label.

## Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXUS-HUB57 DATABASE                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │   SHARED SCHEMA  │  │  TENANT: client1 │  │ TENANT: client2 │ │
│  │                 │  │                 │  │               │  │
│  │  - plans         │  │  - users         │  │  - users      │  │
│  │  - plans_features│  │  - transactions  │  │  - transactions│ │
│  │  - system_config│  │  - network_tree  │  │  - network_tree│ │
│  │                 │  │  - commissions   │  │  - commissions │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Esquema Compartilhado

### Tabela: instances

```sql
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id VARCHAR(50) UNIQUE NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    brand_slug VARCHAR(100) UNIQUE NOT NULL,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'provisioning',
    admin_user_id UUID REFERENCES users(id),
    country VARCHAR(3) DEFAULT 'BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) DEFAULT 'BRL',
    custom_domain VARCHAR(255),
    dashboard_url VARCHAR(255),
    api_endpoint VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    suspended_at TIMESTAMP
);

CREATE INDEX idx_instances_status ON instances(status);
CREATE INDEX idx_instances_brand_slug ON instances(brand_slug);
CREATE INDEX idx_instances_plan ON instances(plan_id);
```

### Tabela: plans

```sql
CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: plans_features

```sql
CREATE TABLE plans_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) REFERENCES plans(id),
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255) NOT NULL,
    UNIQUE(plan_id, feature_name)
);
```

### Tabela: domain_aliases

```sql
CREATE TABLE domain_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id),
    domain VARCHAR(255) NOT NULL,
    domain_type VARCHAR(20) DEFAULT 'alias',
    ssl_enabled BOOLEAN DEFAULT true,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(instance_id, domain)
);
```

### Tabela: branding_configs

```sql
CREATE TABLE branding_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID UNIQUE REFERENCES instances(id),
    colors JSONB DEFAULT '{}',
    fonts JSONB DEFAULT '{}',
    logo_config JSONB DEFAULT '{}',
    email_config JSONB DEFAULT '{}',
    landing_pages JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: api_keys

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id),
    key_prefix VARCHAR(10) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INT DEFAULT 1000,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);
```

### Tabela: webhooks

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id),
    url VARCHAR(500) NOT NULL,
    events VARCHAR(50)[] NOT NULL,
    secret_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: webhook_logs

```sql
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INT,
    response_body TEXT,
    attempt_count INT DEFAULT 1,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Esquema por Tenant (Dinâmico)

Cada instância White-Label possui seu próprio schema com as seguintes tabelas:

### Schema: tenant_{instance_id}

```sql
-- Schema: tenant_inst_abc123def456

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    parent_user_id UUID,
    rank_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE TABLE network_tree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id),
    parent_id UUID REFERENCES users(id),
    depth INT DEFAULT 0,
    path LTREE,
    left_bound INT,
    right_bound INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    transaction_id UUID REFERENCES transactions(id),
    type VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    min_volume DECIMAL(12,2),
    min_referrals INT,
    bonus_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    commission_percent DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Índices Globais (Shared Schema)

```sql
-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_instance ON users(instance_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_paid ON commissions(paid_at);
```

---

## Triggers e Functions

### Função: criar_schema_tenant

```sql
CREATE OR REPLACE FUNCTION criar_schema_tenant(instance_uuid UUID)
RETURNS VOID AS $$
DECLARE
    instance_rec RECORD;
    schema_name TEXT;
BEGIN
    SELECT * INTO instance_rec FROM instances WHERE id = instance_uuid;
    schema_name := 'tenant_' || instance_rec.instance_id;

    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);

    -- Criar tabelas do tenant
    EXECUTE format('
        CREATE TABLE %I.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT ''user'',
            status VARCHAR(20) DEFAULT ''active'',
            metadata JSONB DEFAULT ''{}'',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )', schema_name);

    -- Mais tabelas...
END;
$$ LANGUAGE plpgsql;
```

### Trigger: atualizar_timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_instances_updated
    BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Migração de Dados

### Script de Provisionamento de Novo Tenant

```bash
#!/bin/bash
# script/provision_tenant.sh

INSTANCE_ID=$1
DB_NAME="mmn_whitelabel"

# Criar extension se não existir
psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS hstore;"

# Executar migração
psql -d $DB_NAME -c "SELECT criar_schema_tenant('$INSTANCE_ID');"

# Seed inicial
psql -d $DB_NAME -c "INSERT INTO ranks (name, min_volume, min_referrals, bonus_amount)
    SELECT * FROM default_ranks" USING INSTANCE_ID;
```

---

## Backup e Restore

### Estratégia de Backup

- **Full Backup**: Diário às 02:00 UTC
- **Incremental**: A cada 6 horas
- **Transações**: Real-time replication
- **Retenção**: 30 dias

### Restore por Tenant

```sql
-- Restore específico para um tenant
SELECT restore_tenant_backup(
    'tenant_inst_abc123def456',
    '2026-05-24_020000',
    's3://backups-mmn/tenants/'
);
```

---

**Versão**: 1.0
**Última Atualização**: 2026-05-24
**Mantido por**: Nexus-HUB57