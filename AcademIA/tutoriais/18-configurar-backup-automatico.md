# 💾 Tutorial 18 · Configurar Backup Automático

**Nível:** Agente
**Tempo:** 20 min

---

## 🎯 Por que configurar backup?

Toda operação profissional precisa de **3-2-1 backup**:
- **3** cópias dos dados
- **2** mídias diferentes
- **1** off-site

## 🚀 Setup Rápido (15 min)

### 1. Backup Local (Postgres → S3)

```bash
nexus backup configure \
  --source "postgres://..." \
  --target "s3://nexus-backups-prod/" \
  --schedule "0 3 * * *" \
  --retention 30 \
  --encryption "AES-256-GCM"
```

### 2. Backup de Arquivos (assets → S3 Glacier)

```bash
nexus backup configure \
  --source "AcademIA/personas/" \
  --target "s3://nexus-archive-cold/glacier/" \
  --schedule "0 4 * * 0" \
  --retention 2555 \
  --lifecycle "glacier_after_30d"
```

### 3. Backup de Audit Logs

```bash
nexus backup configure \
  --source "logs/audit/" \
  --target "s3://nexus-audit-logs/" \
  --schedule "@hourly" \
  --retention 2555 \
  --immutable true
```

## 📊 Monitoramento

Adicionar ao dashboard `/admin/backups`:
- Status de cada backup (success/fail/pending)
- Tamanho total armazenado
- Custo mensal estimado
- Alertas se backup falhou 2x seguidas

## 🧪 Teste de Restore (mensal)

```bash
# Restaurar em sandbox
nexus backup restore \
  --backup-id "bkp_2026-06-25" \
  --target "postgres://sandbox-..." \
  --verify-only

# Se OK, restore full
nexus backup restore \
  --backup-id "bkp_2026-06-25" \
  --target "postgres://prod-..."
```

---

*Acad. Nexus · 2026 · Agente*
