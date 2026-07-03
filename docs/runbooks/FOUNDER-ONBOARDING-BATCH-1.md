# 🎖️ Playbook · Founder Onboarding Batch 1

**Owner**: Otávio Nexus Ops (COO/AI) · **Ativação**: 9 slots restantes

## 🎯 Slots Batch 1 (10 fundadores)

| Slot | Status |
|---|---|
| FOUNDER-001-BATCH-1-1 | ✅ Ativo (Lucas Thomaz Nexus · 01/07) |
| FOUNDER-001-BATCH-1-2 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-3 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-4 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-5 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-6 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-7 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-8 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-9 | ⏸️ Aguardando lista Lucas |
| FOUNDER-001-BATCH-1-10 | ⏸️ Aguardando lista Lucas |

## 🚀 Protocolo de Ativação (5 etapas)

### 1. Recebimento (Lucas)
Lucas envia lista com `nome + email` de cada fundador ao Niko.

### 2. Whitelist temporária (Niko/Otávio)
```sql
UPDATE niko_sandbox_config 
SET value = value::jsonb || '["email@founder.com"]'::jsonb
WHERE key = 'founders_whitelist';
```

### 3. Auto-signup + criação de affiliate
- Sistema chama `auth.signUp` com email whitelisted
- Cria user com `is_test_data=false`
- Cria affiliate com código `NX-XXXXX` sequencial
- Persiste em `niko_operational_memory` (episode_type=signup)

### 4. Vinculação ao slot (Otávio)
```sql
UPDATE founders_batch
SET user_id = <novo_user_id>,
    affiliate_id = <novo_aff_id>,
    activated_at = NOW(),
    invited_at = NOW(),
    notes = 'Fundador Batch 1 · Ativado por COO Otávio'
WHERE founder_code = 'FOUNDER-001-BATCH-1-N';
```

### 5. Emissão do pack_founders_ticket
- Insere em `marketplace_pack_tickets` com status='approved'
- Vincula ticket_id ao founders_batch.pack_ticket_id
- Cria episode Niko (autonomy: execute_low)

## 📧 Kit de Boas-Vindas (email futuro)

- Assunto: "Bem-vindo ao Nexus Affil'IA'te · Fundador #N"
- Corpo: código NX-XXXXX, link para /dashboard, meeting genesis 07/07
- Anexo: Carta dos Fundadores (docs/strategy/CARTA-FUNDADORES-GENESIS.md)

## 🎯 KPIs de Sucesso

- 10/10 fundadores ativos até 15/07
- 1º sale de cada fundador em 30 dias
- Taxa de retenção 100% durante Batch 1

## 🔐 Autonomia do COO

- ✅ Executar ativação (execute_low)
- ✅ Emitir pack ticket (execute_low)
- ✅ Vincular slot founders_batch (execute_low)
- ❌ Alterar quantidade de slots (só CMO Helena)
- ❌ Alterar comissão do batch (só CFO Otto + Lucas)
