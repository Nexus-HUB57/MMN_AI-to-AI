---
title: "Conformidade LGPD · Mapeamento Canônico"
description: "Mapeamento canônico de conformidade com a LGPD para todos os componentes do Nexus"
tags: [lib-nexus, knowledge-base, lgpd, conformidade, canonico, legal]
category: knowledge-base
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 🛡️ Conformidade LGPD · Mapeamento Canônico

> Documento **legal-técnico** que mapeia todas as obrigações da LGPD (Lei 13.709/2018) para os componentes do Nexus. **Toda feature nova** que envolve dados pessoais deve ser revisada contra este documento.

---

## ⚖️ O que é a LGPD

A **Lei Geral de Proteção de Dados** (Lei nº 13.709/2018) entrou em vigor em setembro de 2020. Ela regula qualquer atividade de tratamento de **dados pessoais** (coleta, armazenamento, uso, compartilhamento, eliminação) por pessoas físicas ou jurídicas, públicas ou privadas.

### Princípios (Art. 6º)
- **Finalidade** — propósito específico e legítimo
- **Adequação** — compatível com a finalidade
- **Necessidade** — mínimo necessário
- **Livre acesso** — titular pode consultar seus dados
- **Qualidade dos dados** — exatos, atualizados, claros
- **Transparência** — informações claras sobre o tratamento
- **Segurança** — medidas técnicas e administrativas
- **Prevenção** — medidas para evitar danos
- **Não discriminação** — finalidade não pode discriminar
- **Responsabilização** — demonstração de conformidade

### Bases Legais (Art. 7º)
1. **Consentimento** — titular concorda
2. **Cumprimento de obrigação legal** — exigido por lei
3. **Execução de políticas públicas** — governo
4. **Realização de estudos** — pesquisa
5. **Execução de contrato** — com titular
6. **Exercício regular de direitos** — processo
7. **Proteção da vida** — interesse vital
8. **Tutela da saúde** — profissionais de saúde
9. **Interesse legítimo** — do controlador, sem prejuízo ao titular
10. **Crédito** — proteção ao crédito

### Direitos do Titular (Art. 18)
- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos/incorretos
- Anonimização, bloqueio ou eliminação de dados desnecessários
- Portabilidade
- Eliminação dos dados pessoais tratados com consentimento
- Informação sobre entidades públicas e privadas com as quais houve compartilhamento
- Informação sobre a possibilidade de não fornecer consentimento e suas consequências
- Revogação do consentimento

### Penalidades (Art. 52)
- Advertência
- Multa: até 2% do faturamento do grupo, limitada a R$ 50 milhões por infração
- Bloqueio ou eliminação dos dados
- Suspensão ou proibição do exercício da atividade

---

## 🎯 Dados Tratados pelo Nexus

### Dados Pessoais Coletados

| Dado | Onde | Base Legal | Retenção |
|---|---|---|---|
| Nome | Cadastro, CRM | Consentimento | Até exclusão + 5 anos |
| E-mail | Cadastro, CRM | Consentimento | Até descadastro + 5 anos |
| Telefone/WhatsApp | Cadastro, CRM, opt-in WA | Consentimento | Até descadastro + 5 anos |
| CPF | Compras (obrigatório) | Execução de contrato | 5 anos (obrigação legal) |
| IP | Logs de acesso, segurança | Legítimo interesse | 6 meses |
| User Agent | Logs | Legítimo interesse | 6 meses |
| UTM params | Analytics | Legítimo interesse | 24 meses |
| Cookies de analytics | Site | Consentimento | 12 meses |
| Cookies de ads | Site | Consentimento | 90 dias |
| Histórico de compras | CRM | Execução de contrato | 5 anos |
| Histórico de interações | CRM, e-mail | Consentimento | Até descadastro |
| Geolocalização (GPS) | Não coletado | N/A | N/A |
| Dados sensíveis (saúde, religião, etc.) | **Nunca coletado** | N/A | N/A |

### Categorias de Titulares
- **Afiliados** — pessoas que operam a rede
- **Leads** — pessoas que preencheram formulário
- **Clientes** — pessoas que compraram
- **Visitantes** — pessoas que acessaram o site (cookies)
- **Funcionários** — pessoas contratadas (RH)

---

## 🏗️ Como o Nexus Implementa Conformidade

### 1. Coleta com Consentimento

**Implementação**:
- Banner de consentimento **ANTES** de qualquer pixel
- Opt-in **explícito** (checkbox desmarcado por padrão)
- Granularidade: 4 níveis (essencial, analytics, marketing, personalização)
- Modal completo, não apenas link

**Onde está no código**:
- `apps/web/components/CookieBanner.tsx`
- `apps/web/components/ConsentModal.tsx`
- `backend/src/lgpd/consent.ts`

**Como validar**:
```typescript
// Exemplo de validação
if (!hasValidConsent(userId, 'marketing')) {
  throw new ConsentRequiredError('Marketing requires consent');
}
```

### 2. Direito de Acesso (Art. 18, II)

**Implementação**:
- Endpoint `/api/me/data` retorna todos os dados do titular
- Resposta em até 15 dias
- Formato: JSON + PDF legível

**Endpoint**:
```http
GET /api/me/data
Authorization: Bearer {user_token}
```

**Resposta**:
```json
{
  "user_id": "user_abc",
  "dados_pessoais": {
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "telefone": "11999998888",
    "cpf": "***456789**"
  },
  "compras": [
    {"order_id": "ord_001", "produto": "Curso X", "valor": 497, "data": "2026-01-15"}
  ],
  "consentimentos": [
    {"tipo": "marketing", "consentido_em": "2026-01-10", "revogado_em": null}
  ],
  "compartilhamentos": [
    {"entidade": "Hotmart", "finalidade": "Processamento de pagamento", "desde": "2026-01-15"}
  ]
}
```

### 3. Direito de Correção (Art. 18, III)

**Implementação**:
- Endpoint `/api/me/profile` (PUT) para atualizar dados
- Auditoria: salva log de toda mudança

### 4. Direito de Eliminação (Art. 18, VI)

**Implementação**:
- Endpoint `DELETE /api/me/account`
- Soft delete (30 dias) + hard delete após
- Anonimiza: nome → "Usuário Egresso", e-mail → hash, mantém integridade referencial
- Exceções: dados com obrigação legal (fiscal: 5 anos)

**Script de anonimização**:
```typescript
// /backend/src/lgpd/anonymize.ts
export async function anonymizeUser(userId: string) {
  await db.transaction(async (tx) => {
    // 1. Anonimizar dados pessoais
    await tx.update(users)
      .set({
        name: 'Usuário Egresso',
        email: `egresso-${hash(userId)}@nexus.anon`,
        phone: null,
        cpf: null,
        anonymized_at: new Date()
      })
      .where(eq(users.id, userId));

    // 2. Remover consentimentos
    await tx.delete(consents).where(eq(consents.userId, userId));

    // 3. Remover tags
    await tx.delete(userTags).where(eq(userTags.userId, userId));

    // 4. Manter compras (obrigação legal)
    // Compras são mantidas, mas desvinculadas do usuário

    // 5. Log de auditoria
    await tx.insert(auditLog).values({
      action: 'LGPD_ANONYMIZE',
      userId,
      timestamp: new Date(),
      reason: 'user_request'
    });
  });
}
```

### 5. Direito de Portabilidade (Art. 18, V)

**Implementação**:
- Endpoint `GET /api/me/export` retorna JSON + CSV
- Inclui: dados pessoais, compras, interações

### 6. Direito de Revogação (Art. 18, IX)

**Implementação**:
- Link "Descadastrar" em todo e-mail
- Endpoint `POST /api/me/unsubscribe` para parar comunicações
- Banner de preferências: escolher quais comunicações receber

### 7. Registro de Operações de Tratamento (Art. 37)

**Implementação**:
- Documento interno `/legal/ripd/` (Relatório de Impacto à Proteção de Dados Pessoais)
- Atualizado anualmente
- Inclui: tipos de dados, finalidades, bases legais, retenção, compartilhamentos

### 8. Encarregado de Dados (DPO) (Art. 41)

**Implementação**:
- DPO: [email protegido]
- Email visível em todo site
- Resposta a solicitações em até 15 dias

### 9. Comunicação de Incidentes (Art. 48)

**Implementação**:
- Em caso de incidente: notificar ANPD e titulares em **prazo razoável**
- Procedimento: `playbooks/PB-CRISES-gestao-crise-data-loss.md`
- Registro de incidente: `/legal/incidents/`

### 10. Consentimento de Cookies

**Implementação com Google Consent Mode v2**:

```html
<script>
  // Default: tudo negado
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  function acceptAll() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
</script>
```

---

## 🔐 Medidas de Segurança (Art. 46)

### Técnicas
- ✅ **Criptografia em trânsito** — TLS 1.3 obrigatório
- ✅ **Criptografia em repouso** — AES-256 no S3, RDS, EBS
- ✅ **Criptografia de backups** — AES-256 + GPG
- ✅ **Hashing de senhas** — bcrypt (cost 12) ou Argon2id
- ✅ **2FA obrigatório** para admins
- ✅ **API Gateway** com rate limiting
- ✅ **WAF** (Web Application Firewall) ativo
- ✅ **CSP, HSTS, X-Frame-Options** configurados
- ✅ **Audit log** de toda ação sensível

### Administrativas
- ✅ **Treinamento LGPD** para todo novo funcionário
- ✅ **Política de acesso** com least privilege
- ✅ **Política de incidentes** com runbook
- ✅ **Acordo de confidencialidade** (NDA) com fornecedores
- ✅ **DPA** (Data Processing Agreement) com terceiros
- ✅ **Auditoria anual** por empresa independente

---

## 📤 Compartilhamento com Terceiros

### Terceiros que Recebem Dados

| Terceiro | Dados compartilhados | Finalidade | DPA assinado |
|---|---|---|---|
| **Hotmart** | Nome, e-mail, telefone, CPF | Processar pagamento | ✅ |
| **Kiwify** | Nome, e-mail, telefone, CPF | Processar pagamento | ✅ |
| **Stripe** | Dados de cartão (token), nome, e-mail | Processar pagamento | ✅ |
| **Eduzz** | Nome, e-mail, telefone, CPF | Processar pagamento | ✅ |
| **Shopee** | User ID, endereço | Venda e logística | ✅ |
| **SendGrid** | E-mail, nome | Envio de e-mails | ✅ |
| **Meta (Ads)** | E-mail (hash), eventos | Publicidade | ✅ |
| **Google (Ads)** | E-mail (hash), eventos | Publicidade | ✅ |
| **n8n Cloud** | Dados de workflows | Automação | ✅ |
| **AWS** | Dados de aplicação | Infraestrutura | ✅ (BAA para US) |

### Transferência Internacional

- **AWS US-East-1**: dados em região US, com cláusulas-padrão contratuais
- **Nenhum dado sai do Brasil sem consentimento explícito**

---

## 📋 Checklist de Conformidade por Feature

Ao desenvolver nova feature, responda:

- [ ] **Quais dados pessoais** essa feature coleta?
- [ ] **Qual base legal** se aplica?
- [ ] **Como o titular dá consentimento** (se necessário)?
- [ ] **Como o titular revoga consentimento**?
- [ ] **Onde os dados são armazenados** (qual região, criptografia)?
- [ ] **Quem tem acesso** (least privilege)?
- [ ] **Por quanto tempo são retidos** (política de retenção)?
- [ ] **São compartilhados com terceiros** (DPA necessário)?
- [ ] **Há transferência internacional**?
- [ ] **Como o titular pode exercer direitos** (acesso, correção, exclusão)?
- [ ] **Foi feito DPIA** (Data Protection Impact Assessment)?

---

## 🛠️ Ferramentas de Conformidade

- **Privacy by Design** checklist
- **RIPD** template (`/legal/ripd/`)
- **Política de Privacidade** (`/legal/privacidade.md`)
- **Termos de Uso** (`/legal/termos.md`)
- **Banner de consentimento** (CookieBanner + ConsentModal)
- **Audit log** (`audit_log` table)
- **Endpoint de exportação** (`/api/me/export`)

---

## 📞 Contato do DPO

- **Email**: dpo@nexus.com.br
- **Resposta**: até 15 dias
- **Língua**: Português

---

## 📚 Documentos Relacionados

- `00-glossario.md` — termos (LGPD, PII, opt-in, opt-out)
- `01-modelo-ioaid.md` — L4 (federation) tem o PII Gate
- `../agents-specs/03-federation-gate.md` — PII Gate técnico
- `../../playbooks/PB-CRISES-gestao-crise-data-loss.md` — playbook
- `../../playbooks/PB-LGPD-direitos-titular.md` — atendimento de direitos

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
