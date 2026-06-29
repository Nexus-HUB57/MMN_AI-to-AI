---
title: "Auditoria LGPD Automatizada com Agentes IA"
tutorial_code: TUT-ELI-03
level: elite
duration: 24min
tags: [tutorial, lgpd, gdpr, auditoria, compliance, elite]
last_updated: 2026-06-28
prerequisites: ["apostila-12-seguranca-ofensiva"]
---

# ⚖️ Auditoria LGPD Automatizada com Agentes IA

> **Tempo:** 24 min · **Nível:** Elite · **Pré-requisitos:** Operação em produção com PII

## Problema

Sua operação processa dados pessoais (CPF, email, telefone) de milhares de pessoas. A LGPD exige:
- Consentimento explícito para coleta
- Direito ao esquecimento (data deletion on request)
- Relatório de impacto (DPIA)
- Notificação de incidentes em 72h
- Auditoria regular

Mas fazer isso manualmente é impossível em escala. É aí que entram os **agentes de compliance**.

## Solução

### 1. Inventário Automático de PII

```python
# compliance/pii_scanner.py
import re
from typing import List, Dict

class PIIScanner:
    """Detecta automaticamente PII em qualquer base de dados."""

    PATTERNS = {
        "cpf": r"\d{3}\.?\d{3}\.?\d{3}-?\d{2}",
        "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "phone_br": r"\+?55?\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}",
        "credit_card": r"\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}",
        "rg": r"\d{1,2}\.?\d{3}\.?\d{3}-?[\dX]",
        "cnpj": r"\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}",
        "address": r"(?i)(rua|av\.|avenida|travessa)\s+[\w\s]+,?\s*\d+",
        "birth_date": r"\d{2}/\d{2}/\d{4}",
        "ip": r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",
    }

    def scan_database(self, db_connection) -> List[Dict]:
        """Escaneia todas as tabelas e identifica colunas com PII."""
        findings = []

        # 1. Listar todas as tabelas
        tables = db_connection.execute("""
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
        """).fetchall()

        # 2. Para cada coluna, samplear 100 valores e detectar PII
        for table, column, dtype in tables:
            if dtype not in ['text', 'varchar', 'character varying']:
                continue
            samples = db_connection.execute(
                f"SELECT {column} FROM {table} LIMIT 100"
            ).fetchall()

            for pii_type, pattern in self.PATTERNS.items():
                matches = sum(
                    1 for (val,) in samples
                    if val and re.search(pattern, str(val))
                )
                if matches > 5:  # 5% das amostras são PII
                    findings.append({
                        "table": table,
                        "column": column,
                        "pii_type": pii_type,
                        "match_rate": matches / len(samples),
                        "severity": self._severity(pii_type),
                    })

        return findings

    def _severity(self, pii_type: str) -> str:
        return {
            "cpf": "HIGH",
            "credit_card": "CRITICAL",
            "rg": "HIGH",
            "cnpj": "MEDIUM",
            "email": "MEDIUM",
            "phone_br": "MEDIUM",
            "address": "MEDIUM",
            "birth_date": "MEDIUM",
            "ip": "LOW",
        }.get(pii_type, "LOW")
```

### 2. Verificação de Consentimento

```sql
-- Query: quem tem consentimento válido?
SELECT
  c.id,
  c.email,
  c.consent_status,
  c.consent_granted_at,
  c.consent_expires_at,
  c.consent_purposes,
  CASE
    WHEN c.consent_status = 'granted'
         AND (c.consent_expires_at IS NULL OR c.consent_expires_at > NOW())
    THEN 'VALID'
    ELSE 'EXPIRED_OR_MISSING'
  END as effective_consent
FROM contacts c
WHERE c.tenant_id = current_setting('app.current_tenant_id')::INT;

-- Alvos para auditoria: contatos com consent expirado
SELECT COUNT(*) FROM contacts
WHERE consent_status = 'granted'
  AND consent_expires_at < NOW();
```

### 3. Direito ao Esquecimento (Data Deletion)

```python
# compliance/right_to_be_forgotten.py
class RightToBeForgotten:
    """
    Implementa o direito do titular de ter seus dados deletados.
    """

    def __init__(self, db, audit_log):
        self.db = db
        self.audit = audit_log

    async def execute_deletion_request(
        self,
        contact_id: int,
        request_id: str,
        verified: bool,
    ) -> dict:
        """
        Processa um pedido de exclusão LGPD.
        LGPD Art. 18, VI.
        """
        if not verified:
            return {"status": "rejected", "reason": "identity not verified"}

        # 1. Verificar se contato existe
        contact = await self.db.get_contact(contact_id)
        if not contact:
            return {"status": "not_found"}

        # 2. Soft delete (reversível por 30 dias para auditoria)
        await self.db.soft_delete_contact(contact_id, reason="lgpd_request", request_id=request_id)

        # 3. Anonimizar dados em logs antigos (manter estrutura, remover PII)
        await self._anonymize_logs(contact_id)

        # 4. Anonimizar em comunicações antigas
        await self._anonymize_messages(contact_id)

        # 5. Logar para auditoria
        await self.audit.append(
            event_type="lgpd_deletion",
            actor="system",
            payload={
                "contact_id": contact_id,
                "request_id": request_id,
                "deleted_at": datetime.utcnow().isoformat(),
            },
        )

        # 6. Notificar DPO
        await self._notify_dpo(contact_id, request_id)

        # 7. Retornar comprovante
        return {
            "status": "completed",
            "request_id": request_id,
            "deleted_at": datetime.utcnow().isoformat(),
            "soft_delete_until": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        }

    async def _anonymize_logs(self, contact_id: int):
        """Substitui PII por hash irreversível em logs antigos."""
        # Manter integridade referencial mas remover identificação
        await self.db.execute("""
            UPDATE audit_logs
            SET actor = 'anonymized_' || MD5(actor::text)
            WHERE payload->>'contact_id' = %s
              AND created_at < NOW() - INTERVAL '90 days'
        """, str(contact_id))

    async def _anonymize_messages(self, contact_id: int):
        """Anonimiza corpo de mensagens antigas."""
        await self.db.execute("""
            UPDATE messages
            SET body = '[Mensagem anonimizada por solicitação LGPD em ' || NOW()::text || ']'
            WHERE contact_id = %s
              AND created_at < NOW() - INTERVAL '90 days'
        """, contact_id)
```

### 4. Relatório de Impacto (DPIA)

```python
# compliance/dpia_generator.py
class DPIAGenerator:
    """Gera Relatório de Impacto à Proteção de Dados (DPIA)."""

    async def generate(self, tenant_id: int) -> dict:
        # 1. Coletar dados sobre o tratamento
        scan_findings = await PIIScanner(...).scan_database(...)

        # 2. Coletar estatísticas de incidentes
        incidents = await self.db.query("""
            SELECT * FROM security_incidents
            WHERE tenant_id = %s
              AND created_at > NOW() - INTERVAL '12 months'
        """, tenant_id)

        # 3. Gerar relatório
        return {
            "tenant_id": tenant_id,
            "generated_at": datetime.utcnow().isoformat(),
            "pii_inventory": scan_findings,
            "consent_statistics": await self._consent_stats(tenant_id),
            "data_subject_requests": await self._dsar_stats(tenant_id),
            "incidents_count": len(incidents),
            "mitigation_measures": await self._list_mitigations(),
            "risk_assessment": await self._assess_risks(scan_findings),
            "compliance_status": await self._check_compliance(),
        }
```

### 5. Notificação de Incidente em 72h

```python
# compliance/incident_notification.py
class IncidentNotifier:
    """
    Sistema de notificação de incidentes em até 72h,
    conforme LGPD Art. 48.
    """

    async def notify_breach(self, incident: dict):
        # 1. Notificar DPO interno imediatamente
        await self.dpo_alert(incident)

        # 2. Avaliar risco em até 24h
        risk = await self._assess_risk(incident)

        # 3. Se risco alto: notificar ANPD em até 72h
        if risk.severity in ["HIGH", "CRITICAL"]:
            await self._notify_anpd(incident, deadline=72h)

        # 4. Se afetou titulares: notificar cada um
        if incident.affected_individuals:
            await self._notify_individuals(incident.affected_individuals)

        # 5. Log tudo
        await self.audit.append("incident_notification", ...)
```

### 6. Agente de Compliance Contínuo

```python
# compliance/continuous_auditor.py
class ContinuousComplianceAuditor:
    """
    Roda auditoria contínua: 24/7 monitorando compliance.
    """

    async def run_hourly(self):
        """Auditoria horária."""
        findings = []

        # 1. Contatos com consent expirado
        expired = await self.db.query("""
            SELECT COUNT(*) FROM contacts
            WHERE consent_expires_at < NOW()
              AND soft_deleted_at IS NULL
        """)
        if expired[0]["count"] > 0:
            findings.append({
                "type": "expired_consent",
                "severity": "HIGH",
                "count": expired[0]["count"],
                "action": "auto_pause_processing",
            })

        # 2. PII em logs antigos
        pii_in_logs = await self._scan_logs_for_pii()
        if pii_in_logs > 0:
            findings.append({...})

        # 3. Skills sem privacy policy
        skills_without_policy = await self._check_skill_policies()
        if skills_without_policy:
            findings.append({...})

        # 4. Reportar findings
        if findings:
            await self._notify_dpo(findings)

        return findings
```

## Verificação

✅ Você tem scanner automático de PII em todas as bases
✅ Você implementa direito ao esquecimento com audit trail
✅ Você gera DPIA sob demanda
✅ Você notifica incidentes em ≤ 72h automaticamente
✅ Você roda auditoria contínua (hourly)

## Próximos passos

- Implementar Privacy by Design em novas skills
- Configurar DPO as a Service (DPOaaS)
- Auditar fornecedores terceiros (subcontracting)
