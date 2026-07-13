---
title: "Padrões de Segurança Nexus"
description: "Modelo canônico de segurança: secrets, PII, auth, audit, threat model"
tags: [lib-nexus, knowledge-base, seguranca, pii, auth, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-28"
status: canonico
---

# 🔐 Padrões de Segurança Nexus

> **Source of truth** sobre segurança do ecossistema: secrets, PII, autenticação, autorização, audit, threat model, e resposta a incidentes. Este documento é a fonte canônica consultada pelo SHO e por todas as decisões de segurança em produção.

---

## 🎯 Princípios Canônicos

1. **Defense in depth** — nunca uma única camada de proteção.
2. **Least privilege** — todo agente, humano, sistema acessa só o que precisa.
3. **Audit by default** — toda ação é logada, retida, queryable.
4. **Fail loud** — falhas de segurança devem ser **visíveis**, não silenciosas.
5. **Reversible when possible** — preferir ações reversíveis para audit-trail completo.
6. **Zero trust between nodes** — federation requer validação mútua em cada hop.

---

## 🔑 Gestão de Secrets

### Tipos de secrets

| Tipo | Onde | Como |
|------|------|------|
| **API keys** | Vault (HashiCorp) | Auto-rotate a 90 dias |
| **DB passwords** | Vault + IAM roles | Sem nunca em código |
| **Tokens de modelo LLM** | Vault | Rotação a 60 dias |
| **Webhook secrets** | Vault | Por tenant |
| **JWT signing keys** | Vault + KMS | Rotação a 30 dias |
| **Encryption keys (PII)** | KMS | Por tenant, rotation auto |

### Regras

- **Nunca** em código, comentários, logs.
- **Nunca** em CI/CD env vars sem masking.
- **Sempre** via Vault, com IAM role assumido.
- **Sempre** com audit log de acesso.
- **Sempre** com princípio de menor privilégio.

---

## 👤 PII (Personally Identifiable Information)

### Categorias de PII

**PII Comum:**
- Nome completo.
- CPF / RG.
- Email pessoal.
- Telefone pessoal.
- Endereço.
- Data de nascimento.

**PII Sensível (LGPD Art. 11):**
- Saúde, biométricos, genéticos.
- Convicção religiosa, filosófica, política.
- Origem racial/étnica, sindical.
- Opinião política, vida sexual.

### Regras de Tratamento

**Por padrão, PII é:**
- **Criptografada** at-rest (AES-256) e in-transit (TLS 1.3).
- **Mascarada** em logs e outputs.
- **Anonimizada** antes de cruzar fronteira de nó (federation).
- **Auditada** em todo acesso.

**PII sensível tem regras extras:**
- Consentimento **explícito** obrigatório.
- Acesso restrito a DPO + 2 humanos autorizados.
- Logs imutáveis com hash de evidência.
- Retenção limitada ao período estritamente necessário.

### Detecção e Prevenção

**PII Scanner** roda em:
- Outputs de agentes (antes de chegar ao usuário).
- Logs (detecção retroativa).
- Uploads de tenant (skill submission).
- Federation handoff (antes do hop).

**Em caso de detecção:**
- Bloquear output / log.
- Alertar DPO.
- Quarentena de skill se necessário.
- Audit trail imutável.

---

## 🔐 Autenticação (AuthN)

### Métodos Suportados

| Método | Uso |
|--------|-----|
| **Bearer Token (JWT)** | Web + mobile |
| **OAuth 2.0** | Integrações third-party |
| **API Key** | Server-to-server |
| **mTLS** | Federation node-to-node |
| **WebAuthn (FIDO2)** | Operadores Nexus internos |
| **Magic Link** | Recovery, low-friction |

### Requisitos

- Senha mínima 12 caracteres, ou passphrase.
- MFA **obrigatório** para operadores e admin.
- Rotação de token a cada 60 dias.
- Bloqueio após 5 tentativas falhas.
- Logout global disponível.

---

## 🛡️ Autorização (AuthZ)

### Modelo RBAC + ABAC

Combinamos **RBAC** (Role-Based) com **ABAC** (Attribute-Based) para flexibilidade:

```yaml
roles:
  - admin_global       # acesso total (1-2 humanos)
  - admin_tenant       # acesso ao próprio tenant
  - operator           # operações do dia-a-dia
  - developer          # ambiente dev/staging
  - viewer             # read-only dashboard

attributes:
  - tenant_id
  - region
  - mfa_enabled
  - ip_range
  - time_of_day
  - action_sensitivity
```

### Princípio

Toda requisição é avaliada por **PolicyEngine** que combina role + attributes:

```python
def can_access(user, resource):
    if not user.mfa_enabled and resource.sensitivity == "high":
        return False
    if user.tenant_id != resource.tenant_id:
        return False
    if not user.role in resource.allowed_roles:
        return False
    if resource.region not in user.allowed_regions:
        return False
    return True
```

### Audit AuthZ

- **Toda decisão de authz é logada**.
- Decisões podem ser **revistas** se necessário.
- Falhas de authz **alertam** se >5 em 1min do mesmo user (possível ataque).

---

## 📜 Auditoria

### Padrões de Audit Log

Cada entrada:
```json
{
  "ts": "2026-06-28T12:34:56.789Z",
  "actor_id": "user:abc123",
  "actor_type": "human | agent | system",
  "action": "skill.execute",
  "resource": "skill:whatsapp-copy-v3",
  "tenant_id": "tenant:xyz789",
  "result": "allow | deny | error",
  "trace_id": "uuid",
  "metadata": {
    "ip": "...",
    "user_agent": "...",
    "region": "BR"
  },
  "hash": "sha256-of-previous-entry"
}
```

**Características:**

- **Append-only**: log é imutável (hash chain).
- **Retido por 7 anos** (LGPD + GDPR).
- **Exportável** via API autenticada.
- **Queryable** por trace_id, actor, recurso, período.

### Quem Acessa Audit Log

- **DPO** — leitura total.
- **Head de Operações** — leitura total.
- **Tenant owner** — apenas seus próprios logs.
- **Auditor externo** — leitura total, com contrato NDA.

---

## 🛡️ Threat Model

### Atores Externos

- **Script kiddies** — testes básicos (SQLi, XSS).
- **Hackers organizados** — alvos de alto valor (tenants enterprise).
- **Atacantes internos** — funcionários maliciosos.
- **State actors** — APTs, especialmente em healthcare/finance.

### Vetores de Ataque

| Vetor | Mitigação |
|-------|-----------|
| **SQL injection** | Parameterized queries, ORM |
| **XSS** | CSP, output encoding |
| **CSRF** | SameSite cookies, tokens |
| **SSRF** | Allowlist de domínios, network policies |
| **Prompt injection** | Input sanitization, system prompt isolation |
| **Data exfiltration** | DLP, anomaly detection |
| **Insider threat** | Least privilege, audit, anomaly detection |
| **Compromised dependencies** | SCA scanning, pinning, SBOM |
| **API abuse** | Rate limiting, anomaly detection |

### Resposta a Incidentes (SEV-4)

**Playbook `PB-CRISES-gestao-crise-data-loss.md`:**
1. **Detectar** — SHO identifica anomalia.
2. **Conter** — bloquear recurso, isolar nó.
3. **Erradicar** — remover causa raiz.
4. **Recuperar** — restaurar de backup, validar.
5. **Notificar** — DPO, ANPD se necessário (<72h), titulares (<5 dias).
6. **Postmortem** — público em <30 dias.

---

## 📋 Compliance Mapping

| Regulação | Como Nexus Atende |
|-----------|-------------------|
| **LGPD (Brasil)** | DPO nomeado, base legal explícita, PII scoped |
| **GDPR (EU)** | Data residency, right to delete, opt-in |
| **CCPA (California)** | Right to know, right to delete |
| **HIPAA (Saúde)** | BAA disponível, encryption adicional |
| **SOX (Financeiro)** | Audit trail completo, segregação |
| **PCI DSS (Cartão)** | Tokenização, scope reduzido |
| **AI Act (EU)** | Transparência, audit, explainability |

---

## 📚 Documentos Relacionados

- [Knowledge-base: `03-conformidade-lgpd.md`](03-conformidade-lgpd.md)
- [Knowledge-base: `04-modelo-sho.md`](04-modelo-sho.md)
- [Apostila 11 — SHO em Produção](../AcademIA/apostilas/11-sho-em-producao.md)
- [Playbook `PB-LGPD-direitos-titular.md`](../AcademIA/playbooks/PB-LGPD-direitos-titular.md)
- [Playbook `PB-LGPD-avancado-data-subjects.md`](../AcademIA/playbooks/PB-LGPD-avancado-data-subjects.md)
- [Best-practice: Error Handling](../best-practices/01-error-handling.md)

## 👥 Ownership

- **Owner:** CISO + DPO
- **Reviewers:** Head de Arquitetura, Head de Operações
- **Audit externo:** Anual

---

*Nexus Affil'IA'te · Lib-Nexus · knowledge-base/06-padroes-seguranca.md · v1.0 · Junho 2026*
