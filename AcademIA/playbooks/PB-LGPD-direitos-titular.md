---
title: "PB-LGPD-TITULAR · Atendimento a direitos do titular (Art. 18)"
playbook_code: PB-LGPD-TITULAR
category: conformidade
duration_execution: 15 dias
tags: [playbook, lgpd, art-18, titular, privacidade, dpo]
last_updated: 2026-06-02
---

# 🔒 PB-LGPD-TITULAR · Atendimento a direitos do titular (Art. 18)

> **Tempo de leitura:** 10 min · **Tempo de execução:** até 15 dias · **Quando usar:** Titular pede acesso, correção, exclusão, portabilidade etc.

## 🚨 Quando usar

Você recebeu uma **solicitação de titular** (cliente, lead, afiliado) sobre seus dados pessoais. A LGPD (Art. 18) garante **9 direitos** que devem ser atendidos em até **15 dias**.

## 📋 Os 9 direitos do titular (Art. 18)

| # | Direito | O que fazer | Prazo |
|---|---|---|---|
| 1 | **Confirmação da existência** | Confirmar se temos dados do titular | 7 dias |
| 2 | **Acesso** | Entregar cópia dos dados | 15 dias |
| 3 | **Correção** | Corrigir dados incompletos/incorretos | 15 dias |
| 4 | **Anonimização, bloqueio ou eliminação** | Dados desnecessários ou tratados em desconformidade | 15 dias |
| 5 | **Portabilidade** | Entregar dados em formato estruturado (JSON/CSV) | 15 dias |
| 6 | **Eliminação dos dados** | Excluir dados tratados com consentimento | 15 dias |
| 7 | **Informação sobre entidades públicas e privadas** | Listar com quem compartilhamos | 15 dias |
| 8 | **Informação sobre a possibilidade de não fornecer consentimento** | Explicar consequências | 7 dias |
| 9 | **Revogação do consentimento** | Parar de tratar dados baseados em consentimento | 15 dias |

## ⚠️ Pré-condições

- [ ] Identificar o titular (verificação de identidade obrigatória)
- [ ] Ter acesso ao painel Admin
- [ ] Em casos complexos: consultar o **DPO**

## 📋 Passo a passo

### Passo 1 — RECEBER E CATALOGAR (1 dia)

```
1. Canal: e-mail, ticket no painel, ou solicitação verbal
2. Identificar o direito exercido (qual dos 9)
3. Verificar identidade (e-mail, CPF, último acesso)
4. Catalogar no sistema: /admin/privacy/requests
5. Iniciar contador de prazo (15 dias)
```

### Passo 2 — COLETAR DADOS (1-3 dias)

```
1. Buscar em todos os domínios:
   - contacts (CRM)
   - eventBus (audit log)
   - tenants (multi-tenant)
   - backups (verificar últimos 12 meses)
2. Compilar inventário completo
3. Anonimizar dados de terceiros (manter só os do titular)
```

### Passo 3 — PREPARAR RESPOSTA (2-5 dias)

**Para Acesso (Direito 2):**

```json
{
  "titular": "Nome do Titular",
  "dados_coletados": {
    "identificacao": ["nome", "cpf", "email", "telefone"],
    "comportamentais": ["ultimo_acesso", "engagement_score", "ltv"],
    "transacionais": ["compras", "ciclo_mmn", "sponsor"]
  },
  "finalidades": ["marketing", "comissoes", "suporte"],
  "compartilhamentos": ["hotmart", "stripe", "meta"],
  "retencao": "12 meses após último acesso",
  "base_legal": "consentimento + execução de contrato"
}
```

**Para Correção (Direito 3):**

- Lista dos dados a corrigir + dados corretos (com evidência)

**Para Eliminação (Direito 6):**

- Confirmação de que o titular entende as consequências (perda de acesso, comissões pendentes)
- Data de exclusão efetiva

**Para Portabilidade (Direito 5):**

- JSON ou CSV estruturado
- Incluir apenas dados que o titular forneceu (não inferidos)

### Passo 4 — ENVIAR RESPOSTA (1 dia)

```
1. Canal: e-mail assinado pelo DPO ou responsável
2. Anexar relatório de dados (PDF ou JSON)
3. Informar prazo de recurso (se discordar)
4. Arquivar no sistema: /admin/privacy/requests/[id]
```

### Passo 5 — EXECUÇÃO (1-7 dias)

**Se Acesso/Correção/Informação:** ✅ só entregar

**Se Eliminação:**

```
1. Marcar contato como "deleted" (soft delete, 30 dias)
2. Após 30 dias: hard delete do banco primário
3. Solicitar exclusão em sistemas integrados (Hotmart, etc.)
4. Anonimizar audit log (manter registro da exclusão, sem dados pessoais)
5. Confirmar exclusão ao titular
```

**Se Revogação de consentimento:**

```
1. Marcar opt-in = false
2. Remover de listas de marketing (mas manter em cadastro de cliente se houver contrato)
3. Confirmar revogação ao titular
```

### Passo 6 — ARQUIVAMENTO (1 dia)

```
- Salvar toda a comunicação por 5 anos (Art. 16 LGPD + 37 LGPD)
- Incluir: data, direito exercido, dados entregues, ações tomadas
- Indexável por CPF do titular
```

## 🛑 Quando recusar

Você pode recusar solicitações quando:

- **Identificação não confirmada** (risco de fraude)
- **Direito já atendido** nos últimos 12 meses (sem nova justificativa)
- **Dados necessários para cumprimento de obrigação legal/regulatória** (ex: fiscais)
- **Direitos de terceiros** seriam violados

> **Sempre justifique por escrito.** O titular pode recorrer à ANPD.

## ⚠️ LGPD — Sanções

Em caso de descumprimento:

| Sanção | Valor |
|---|---|
| Advertência | — |
| Multa | Até 2% do faturamento (limitada a R$ 50M por infração) |
| Bloqueio | Dos dados envolvidos |
| Eliminação | Dos dados envolvidos |
| Proibição | De tratamento por até 6 meses |

## 📞 Contatos de emergência

- **DPO (Data Protection Officer):** ver lista em `Admin → Equipe`
- **ANPD:** [link](https://www.gov.br/anpd)
- **Jurídico:** ver lista em `Admin → Diretoria`

## ⏭️ Próximo playbook

👉 [PB-CRISES-DATA-LOSS · Perda de dados](PB-CRISES-gestao-crise-data-loss.md)

---

**Versão 1.0** · Atualizado 2026-06-02
