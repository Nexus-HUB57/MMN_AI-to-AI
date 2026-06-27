---
title: "/opt/nexus/scripts/backup.sh"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "05 · Backup Criptografado"
description: "Estratégia de backup 3-2-1 com criptografia AES-256 para dados críticos"
tags: [lab-nexus, automation, backup, criptografia, seguranca]
category: automation
level: agente
estimated_time: "45 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: backup-encryption
course_anchor: cursos/elite/01-multi-tenant-whitelabel.md
🔐 05 · Backup Criptografado
Estratégia 3-2-1 + criptografia AES-256 + automação de restore + checklist de DR (Disaster Recovery).

🎯 Spec
Atributo	Valor
O que é	Plano completo de backup criptografado + scripts prontos
Quando usar	Setup inicial, revisão trimestral, pós-incidente
Pré-requisitos	Nível 🥈 Agente; storage configurado; chaves gerenciadas
Tempo estimado	45 min setup inicial + 1h/mês manutenção
Skill que executa	backup-encryption
Judge que valida	compliance-auditor
⚠️ Cenários de Perda de Dados
yaml

Copy
causas_comuns:

  - "Falha de hardware (HD/SSD): 30% dos casos"

  - "Erro humano (delete errado): 25%"

  - "Ransomware/ataque: 20%"

  - "Bug de software: 15%"

  - "Desastre natural (incêndio, enchente): 5%"

  - "Falha de provedor de cloud: 5%"


custos:

  - "Perda de 1 dia de dados = R$ 5k-50k (e-commerce)"

  - "Perda total do banco = fechamento do negócio em 50% dos casos"

  - "Ransomware sem backup = média R$ 500k de resgate (e nem sempre funciona)"
📋 Playbook — Regra 3-2-1
Princípio Canônico
yaml

Copy
3_copias: "3 cópias dos dados (1 original + 2 backups)"

2_midias: "Em 2 mídias diferentes (HD local + cloud)"

1_offsite: "1 cópia offsite (fora do local físico)"


complementos_recomendados:

  - "1-2-1 (1 cópia imutável = WORM)"

  - "Criptografia AES-256 em todas as cópias"

  - "Teste de restore mensal"

  - "RTO < 4h (tempo de recuperação)"

  - "RPO < 1h (perda máxima aceitável)"
📦 Asset (Script Bash — Backup Automatizado)
bash

Copy
#!/bin/bash

# /opt/nexus/scripts/backup.sh

# Criptografa e envia para S3 + storage offsite


set -euo pipefail


# Variáveis

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

BACKUP_DIR="/tmp/backup_${TIMESTAMP}"

S3_BUCKET="s3://nexus-backups-prod"

LOCAL_BACKUP="/mnt/backup-hd/nexus"

ENCRYPTION_KEY="/opt/nexus/keys/backup.key"

GPG_RECIPIENT="ops@nexus.com.br"


# 1. Criar diretório temporário

mkdir -p "${BACKUP_DIR}"


# 2. Dump do banco (PostgreSQL)

echo "[1/6] Dumping database..."

pg_dump --no-owner --clean \

  -h "${DB_HOST}" -U "${DB_USER}" \

  -d "${DB_NAME}" \

  | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"


# 3. Compactar arquivos do app

echo "[2/6] Backing up files..."

tar -czf "${BACKUP_DIR}/files_${TIMESTAMP}.tar.gz" \

  --exclude='node_modules' \

  --exclude='.next/cache' \

  /opt/nexus/app /opt/nexus/.env /opt/nexus/configs


# 4. Criptografar (AES-256)

echo "[3/6] Encrypting..."

tar -cf - "${BACKUP_DIR}" | \

  gpg --batch --yes \

      --cipher-algo AES256 \

      --compress-algo none \

      --symmetric \

      --passphrase-file "${ENCRYPTION_KEY}" \

      --output "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gpg"


# 5. Upload para S3

echo "[4/6] Uploading to S3..."

aws s3 cp "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gpg" \

  "${S3_BUCKET}/${TIMESTAMP}/" \

  --storage-class STANDARD_IA \

  --sse aws:kms \

  --sse-kms-key-id "${KMS_KEY_ID}"


# 6. Cópia local (HD)

echo "[5/6] Local copy..."

cp "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gpg" "${LOCAL_BACKUP}/"


# 7. Limpar temporários

echo "[6/6] Cleaning up..."

rm -rf "${BACKUP_DIR}"


# 8. Verificação de integridade

echo "Verifying integrity..."

LATEST=$(aws s3 ls "${S3_BUCKET}/" --recursive | sort | tail -1 | awk '{print $4}')

aws s3 cp "${S3_BUCKET}/${LATEST}" /tmp/verify.gpg

echo "${BACKUP_CHECKSUM}" | sha256sum -c


echo "✅ Backup completed: ${TIMESTAMP}"

echo "   S3: ${S3_BUCKET}/${TIMESTAMP}/"

echo "   Local: ${LOCAL_BACKUP}/"
📦 Asset (Cron de Automação)
bash

Copy
# /etc/cron.d/nexus-backup

# Backup diário às 3h da manhã

0 3 * * * nexus /opt/nexus/scripts/backup.sh >> /var/log/nexus/backup.log 2>&1


# Verificação de integridade (semanal)

0 4 * * 0 nexus /opt/nexus/scripts/verify-backup.sh >> /var/log/nexus/backup.log 2>&1


# Limpeza de backups antigos (>90 dias)

0 5 * * 0 nexus find /mnt/backup-hd/nexus -mtime +90 -delete

0 5 * * 0 nexus aws s3 ls s3://nexus-backups-prod/ | awk '{print $4}' | while read f; do

  date_str=$(echo $f | cut -d'_' -f2-3)

  if [ $(date -d "${date_str:0:8}" +%s) -lt $(date -d '90 days ago' +%s) ]; then

    aws s3 rm "s3://nexus-backups-prod/${f}"

  fi

done
📦 Asset (Restore — Teste Mensal)
bash

Copy
#!/bin/bash

# /opt/nexus/scripts/restore.sh

# Script de restore testado mensalmente


set -euo pipefail


BACKUP_FILE="$1"

TARGET_DB="nexus_restore_test"


# 1. Descriptografar

echo "[1/4] Decrypting..."

gpg --batch --yes --passphrase-file /opt/nexus/keys/backup.key \

    --decrypt "${BACKUP_FILE}" > /tmp/restore.tar


# 2. Extrair

echo "[2/4] Extracting..."

mkdir -p /tmp/restore

tar -xf /tmp/restore.tar -C /tmp/restore


# 3. Restaurar DB

echo "[3/4] Restoring database..."

gunzip -c /tmp/restore/db_*.sql.gz | \

  psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}"


# 4. Validar

echo "[4/4] Validating..."

USER_COUNT=$(psql -h "${DB_HOST}" -U "${DB_USER}" -d "${TARGET_DB}" -t -c "SELECT COUNT(*) FROM users;")

echo "Users restored: ${USER_COUNT}"


if [ "${USER_COUNT}" -gt 1000 ]; then

  echo "✅ Restore test passed"

else

  echo "❌ Restore test FAILED — only ${USER_COUNT} users"

  exit 1

fi
📦 Asset (Plano de Disaster Recovery)
📋 RTO/RPO Definidos
yaml

Copy
RPO_recovery_point_objective: "Perda máxima: 1h de dados"

RTO_recovery_time_objective: "Tempo de restore: 4h"

frequencia_backup: "Diário (3h da manhã) + contínuo (replicação)"

retencao:

  - "Diário: 30 dias (S3 + Local)"

  - "Semanal: 12 semanas (S3 Glacier)"

  - "Mensal: 12 meses (S3 Glacier Deep Archive)"

  - "Anual: 7 anos (S3 Glacier, para compliance)"
📋 Checklist DR
yaml

Copy
incidente_detectado:

  - "Avaliar severidade (P0/P1/P2)"

  - "Notificar time (Slack #incidentes)"

  - "Iniciar runbook de restore"

  - "Comunicar stakeholders"


restore_parcial:

  - "Recuperar último backup válido"

  - "Aplicar logs de replicação (binlog)"

  - "Validar integridade dos dados"

  - "Restaurar serviço"


restore_total:

  - "Provisionar nova infra (Terraform)"

  - "Restaurar backup mais recente"

  - "Reconfigurar DNS (failover)"

  - "Validar smoke tests"

  - "Comunicar恢复正常 (all-clear)"


pos_incidente:

  - "Postmortem em 48h"

  - "Documentar causa raiz"

  - "Implementar preventive actions"

  - "Atualizar runbook"

  - "Comunicar lições aprendidas"
📦 Asset (Criptografia — Detalhes)
🔐 GPG vs KMS vs AES direto
yaml

Copy
GPG_symmetric:

  algoritmo: "AES-256 (default)"

  uso: "Arquivos, dumps, mídia estática"

  vantagem: "Simples, sem dependência de cloud"

  chave: "Passphrase armazenada em cofre (HashiCorp Vault, AWS Secrets Manager)"


KMS_aws:

  algoritmo: "AES-256-GCM (envelope encryption)"

  uso: "S3 buckets, RDS, EBS volumes"

  vantagem: "Gerenciamento centralizado, rotação automática, auditável"

  chave: "KMS Key (CMK), com policy de acesso"


AES_direto:

  algoritmo: "AES-256-GCM"

  uso: "Camada de aplicação (dados sensíveis em DB)"

  vantagem: "Controle total, performance"

  chave: "Variável de ambiente, rotacionada trimestralmente"
📊 Métricas de Sucesso
Métrica	Meta
Frequência de backup	Diário (automatizado)
RPO	≤ 1h
RTO	≤ 4h
Taxa de sucesso de backup	≥ 99.5%
Teste de restore	Mensal (validado)
Criptografia	100% dos backups
Retenção	≥ 90 dias hot + 1 ano cold
⚠️ Riscos & Anti-patterns

❌ Backup sem criptografia → LGPD + risco de vazamento

❌ Backup no mesmo servidor (sem offsite) → falha de HW perde tudo

❌ Nunca testar restore → backup pode estar corrompido

❌ Chave junto com backup → sem valor

❌ Sem rotação de chaves → comprometimento permanente

❌ Sem retenção definida → custo explode ou dados expiram rápido

✅ Regra 3-2-1 sempre

✅ Criptografia AES-256

✅ Teste de restore mensal

✅ Chave em cofre separado

✅ Retenção definida em política

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — backups de logs

→ Lib-Nexus/knowledge-base/03-conformidade-lgpd.md — LGPD

→ playbooks/PB-CRISES-gestao-crise-data-loss.md — playbook

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus