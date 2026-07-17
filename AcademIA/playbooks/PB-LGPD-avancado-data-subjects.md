---
title: "PB-LGPD-avancado · Direitos do Titular e Operações Sensíveis"
playbook_code: PB-LGPD-AVANCADO
category: compliance
priority: high
owner: DPO Nexus
last_updated: 2026-06-28
version: "1.0.0"
pattern: "MMN_IA"
---

# 📜 PB-LGPD-AVANCADO · Direitos do Titular e Operações Sensíveis

> *Playbook avançado para tratamento de solicitações complexas de titulares e operações sensíveis sob LGPD, GDPR e regulações correlatas. Complementa o PB-LGPD-direitos-titular.md.*

## 🎯 Quando usar este playbook

Use este playbook quando:

- Titular solicita **operações combinadas** (ex: exportar + deletar + revogar consentimentos).
- Há **dados sensíveis** envolvidos (saúde, biométricos, opinião política, etc.).
- Titular é **representante legal** (responsável por menor, advogado, etc.).
- Solicitação envolve **dados compartilhados** com terceiros ou white-labels.
- Há **conflito entre direitos** (ex: titular quer deletar dados necessários para compliance).
- Solicitação é de **menor de idade** (LGPD Art. 18-A).
- Envolve **transferência internacional** de dados.

## 📋 Pré-requisitos

Antes de iniciar qualquer fluxo deste playbook:

- [ ] Verificar identidade do titular (vide PB-LGPD-direitos-titular.md).
- [ ] Confirmar que o tenant tem os dados solicitados.
- [ ] Acionar DPO via `dpo@nexus.io` com cópia para `compliance@nexus.io`.
- [ ] Estimar tempo de execução (vide tabela abaixo).

## ⏱️ SLAs Avançados

| Operação | SLA Legal | SLA Nexus Real | SLA Enterprise |
|----------|-----------|----------------|----------------|
| Exportação completa de dados | 15 dias | 5 dias úteis | 24h |
| Deleção completa (com confirmação) | 15 dias | 3 dias úteis | 48h |
| Revogação de consentimento | Imediato | Imediato | Imediato |
| Anonimização (vs. deleção) | 15 dias | 7 dias úteis | 5 dias úteis |
| Portabilidade (formato estruturado) | 15 dias | 7 dias úteis | 72h |
| Bloqueio de tratamento | Imediato | Imediato | Imediato |
| Oposição a tratamento | 15 dias | 5 dias úteis | 24h |
| Revisão de decisão automatizada | 15 dias | 7 dias úteis | 5 dias úteis |

## 🔐 Cenários Especiais

### Cenário 1 — Menores de Idade (LGPD Art. 18-A)

**Operações:**
- Solicitação de **representante legal** → tratar com prioridade.
- Solicitação direta do menor (12-17 anos) → **avaliar capacidade**.
- Solicitação de menor (<12 anos) → **exigir representante**.

**Fluxo:**
1. Validar idade via documento ou informação cruzada.
2. Se representante: validar procuração ou documentação.
3. Se menor direto: oferecer canal simplificado de comunicação.
4. Responder com **linguagem adaptada à idade**.

**Regra Nexus:** **criança tem proteção ampliada**. Em dúvida, **favor da proteção**.

### Cenário 2 — Dados Sensíveis (Art. 11)

**Categorias sensíveis:**
- Saúde, biométricos, genéticos.
- Convicção religiosa, filosófica, política.
- Origem racial/étnica, sindical.
- Opinião política, vida sexual.

**Fluxo:**
1. **Consentimento explícito** requerido (não basta legítimo interesse).
2. **Revisão humana obrigatória** antes de qualquer operação.
3. Log de auditoria **com hash de evidência**.
4. **Restrição de acesso** — apenas DPO + 2 humanos autorizados.
5. **PII stripping** em qualquer log/report de progresso.

**Regra:** **dados sensíveis têm SLA mais curto e mais humano**.

### Cenário 3 — Dados Compartilhados com Terceiros

**Quando:** titular pede deleção, mas dados foram compartilhados com parceiros, white-labels, ou provedores.

**Fluxo:**
1. Mapear **todos os destinatários** dos dados (vide mapa de dados).
2. Notificar **cada destinatário** sobre a solicitação.
3. **Aguardar confirmação** de cada um (até 7 dias úteis).
4. Consolidar evidências em log único.
5. Reportar ao titular com **lista de destinatários**.

**Template de notificação:**

```
Assunto: [LGPD] Solicitação de Titular — Ação Requerida

Prezados,

Recebemos solicitação de titular para [operação] dos dados
compartilhados com vocês em [data].

Pedimos confirmação da operação realizada até [data limite].

Caso não possam atender, justifiquem conforme Art. 16 LGPD.

DPO Nexus: dpo@nexus.io
Protocolo: #LGPD-{ano}-{número}
```

### Cenário 4 — Conflito entre Direitos

**Exemplo:** titular pede deleção, mas dados são necessários para:
- Cumprimento de obrigação legal/regulatória.
- Exercício regular de direitos em processo.
- Interesse legítimo da coletividade.

**Fluxo:**
1. **Não deletar imediatamente**.
2. Notificar titular do conflito (linguagem clara).
3. Oferecer alternativas:
   - Anonimização (dados mantidos, sem identificar titular).
   - Bloqueio (dados mantidos, sem uso).
   - Portabilidade + cancelamento parcial.
4. Documentar a decisão com justificativa legal.
5. DPO + jurídico revisam caso (até 10 dias úteis).

**Regra:** **em conflito, sempre favoreça transparência e titular**, salvo exceção legal explícita.

### Cenário 5 — Solicitação por Representante Legal

**Quando:** titular está incapacitado, falecido, ou representado por procuração.

**Fluxo:**
1. Validar **procuração** ou documentação de representação.
2. Verificar **alcance da procuração** (parcial ou total).
3. Aplicar mesmas operações, com **log adicional do representante**.
4. Se dúvida → consultar DPO antes de prosseguir.

**Documentos aceitos:**
- Procuração com firma reconhecida.
- Certidão de óbito + inventariante.
- Decisão judicial (curatela, tutela).
- Documento oficial de representação consular.

### Cenário 6 — Transferência Internacional

**Quando:** dados serão ou foram transferidos para fora do Brasil.

**Fluxo:**
1. Verificar **base legal** para transferência (LGPD Art. 33).
2. Se adequacy decision: documentar.
3. Se controller-binding rules: anexar contrato.
4. Se country-specific authorization: anexar autorização ANPD.
5. **Notificar titular** sobre a transferência (Art. 33, §4°).
6. Manter **registro de transferências** por 5 anos.

**Regra:** **nenhuma transferência internacional sem base legal explícita**.

### Cenário 7 — Decisão Automatizada (Art. 20)

**Quando:** titular pede revisão de decisão tomada apenas por algoritmo.

**Exemplos:**
- Score de crédito automatizado.
- Bloqueio automatizado de conta.
- Recusa automatizada de cadastro.
- Ranking automatizado que afeta direitos.

**Fluxo:**
1. Identificar **qual algoritmo** tomou a decisão.
2. Identificar **critérios** que afetaram a decisão.
3. Convocar **comitê de revisão humana** (mín. 3 pessoas).
4. Comitê tem **10 dias úteis** para responder.
5. Decisão final é **humana**, registrada, e comunicada ao titular.
6. Se procedente: **refazer a decisão** com revisão humana permanente.

## 📦 Operações Combinadas

Quando titular pede **múltiplas operações simultâneas**:

**Combinação comum 1 — Exportar + Deletar:**
```
1. Exportar (SLA 5 dias)
2. Confirmar exportação recebida pelo titular (1 dia)
3. Deletar (SLA 3 dias após confirmação)
4. Notificar parceiros (7 dias)
5. Report final
```

**Combinação comum 2 — Revogar consentimento + Anonimizar:**
```
1. Revogar consentimento (imediato)
2. Bloquear novos tratamentos (imediato)
3. Anonimizar dados existentes (7 dias)
4. Manter apenas dados necessários para compliance
```

**Combinação comum 3 — Portabilidade + Migração para outro serviço:**
```
1. Exportar em formato estruturado (JSON/CSV padronizado)
2. Incluir metadados (origem, consentimento, data de captura)
3. Enviar pacote com hash de integridade
4. Disponibilizar download por 30 dias
5. Após migração confirmada: opção de deletar origem
```

## 🚨 Situações de Incidente

Se durante o atendimento surgir **evidência de vazamento, uso indevido, ou risco ao titular**:

1. **Acionar protocolo de incidente** (vide PB-CRISES-gestao-crise-data-loss.md).
2. **Notificar DPO em <2h**.
3. **Avaliar se ANPD precisa ser notificada** (<72h sob LGPD).
4. **Comunicar titular afetado** em <5 dias úteis.
5. **Documentar lições aprendidas**.

## 📊 Relatórios e Auditoria

**Relatórios mensais gerados:**
- Total de solicitações por tipo.
- SLA médio de atendimento.
- Solicitações escaladas para DPO/jurídico.
- Transferências internacionais realizadas.
- Incidentes de compliance.
- Solicitações de revisão de decisão automatizada.

**Retenção:** 5 anos para audit log, conforme LGPD e regulações correlatas.

## 🤝 Quem acionar

| Situação | Acionar |
|----------|---------|
| Operação padrão com PII | Equipe de Operações + DPO |
| Dados sensíveis | DPO + Compliance Officer |
| Conflito de direitos | DPO + Jurídico |
| Transferência internacional | DPO + Jurídico + Head de Operações |
| Incidente durante atendimento | DPO + SHO + Head de Operações |
| Decisão automatizada contestada | Comitê de Revisão (DPO + Tech Lead + Operador) |

## 📚 Referências legais

- **LGPD** — Lei 13.709/2018 (Brasil).
- **GDPR** — Regulation (EU) 2016/679.
- **CCPA** — California Consumer Privacy Act.
- **Marco Civil da Internet** — Lei 12.965/2014.
- **Código de Defesa do Consumidor** — Lei 8.078/1990 (quando aplicável).
- **Resoluções ANPD** — Autoridade Nacional de Proteção de Dados.

## 📂 Documentos relacionados

- [PB-LGPD-direitos-titular.md](PB-LGPD-direitos-titular.md) — playbook básico.
- [PB-CRISES-gestao-crise-data-loss.md](PB-CRISES-gestao-crise-data-loss.md) — gestão de crises.
- [Lib-Nexus/knowledge-base/03-conformidade-lgpd.md](../Lib-Nexus/knowledge-base/03-conformidade-lgpd.md)
- [Apostila 14 — Multi-Tenant & White-Label](../apostilas/14-multi-tenant-whitelabel.md)

## 📞 Contatos

- **DPO Nexus:** dpo@nexus.io
- **Compliance:** compliance@nexus.io
- **Jurídico:** juridico@nexus.io
- **Plantão LGPD (24/7):** urgente@nexus.io

---

*Nexus Affil'IA'te · PB-LGPD-AVANCADO · v1.0.0 · Junho 2026*
