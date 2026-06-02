---
title: "PB-CRISES-BAN · Ban de número WhatsApp"
playbook_code: PB-CRISES-BAN
category: crise
duration_execution: 4-72h
tags: [playbook, crise, ban, whatsapp, meta, recuperacao]
last_updated: 2026-06-02
---

# 🚫 PB-CRISES-BAN · Ban de número WhatsApp

> **Tempo de leitura:** 10 min · **Tempo de execução:** 4–72h · **Quando usar:** Número banido pela Meta (parcial ou total)

## 🚨 Quando usar

- Meta notificou ban do número (Quality Rating < 30%)
- Templates reprovados em massa
- Mensagens pararam de chegar (delivery < 50%)
- Painel mostra "numero restrito"

## ⚠️ Pré-condições

- [ ] Confirmar que NÃO é falha temporária (verificar Meta Business Help Center)
- [ ] Ter pelo menos 1 número备用 (backup)
- [ ] Lista de opt-in verificada (LGPD)

## 📋 Passo a passo

### Passo 1 — CONFIRMAR O BAN (30 min)

```
1. Acessar Meta Business Help Center
2. Verificar Quality Rating do número
3. Ler a notificação oficial (se houver)
4. Documentar: tipo de ban, data, motivo citado
```

**Tipos de ban:**

| Tipo | O que acontece | Tempo de recuperação |
|---|---|---|
| **Restriction** | Limite de mensagens/dia | 24–72h se corrigir |
| **Quality ban** | Bloqueio total | 7–30 dias (pode ser permanente) |
| **Permanent ban** | Número morto | Novo número obrigatório |

### Passo 2 — PARAR TUDO (10 min)

```
Admin Runtime → [agente] → "PAUSAR IMEDIATAMENTE"
Admin → Dispatchers → WhatsApp → "DESCONECTAR"
```

### Passo 3 — DIAGNÓSTICO (1h)

Causas mais comuns:

| Causa | Sinais |
|---|---|
| Block rate > 5% | Métricas do dispatcher |
| Opt-out spike | Audit log com `whatsapp.opt_out` em massa |
| Template com claim | Judge reprovou 100% nas últimas 24h |
| Audiência fria | Muitos contatos sem opt-in |
| Reincidência após ban anterior | Histórico do número |

### Passo 4 — AÇÃO CORRETIVA

**Para ban temporário (Quality ban):**

```
1. Remover TODOS os templates ativos
2. Atualizar opt-in da base (re-confirmação)
3. Aguardar 7 dias
4. Submeter 1 template novo, simples
5. Se aprovado: começar com 5 contatos/dia
6. Escalar devagar: 5 → 50 → 500 → 5000 (warm-up)
```

**Para ban permanente:**

```
1. Adquirir novo número
2. Configurar novo dispatcher
3. Migrar audiência COM opt-in verificado
4. Iniciar warm-up rigoroso
5. Atualizar todas as referências (site, e-mail signature, etc.)
```

### Passo 5 — PREVENÇÃO (contínuo)

- [ ] Ativar **kill switch** de block rate > 1%
- [ ] Implementar **opt-in duplo** para novos contatos
- [ ] Rever **todos os templates** (evitar claim sem prova)
- [ ] Treinar equipe: **NUNCA** disparar para lista fria
- [ ] Auditar **semanalmente** o Quality Rating

## 🛑 Quando escalar

- Ban permanente afeta 2+ números → **C-level imediato**
- Padrão se repete (3+ bans em 6 meses) → **revisão operacional completa**
- Reincidência após prevenção → **auditoria externa**

## 📞 Contatos de emergência

- **Meta Support:** [link](https://business.facebook.com/business/help)
- **Eng. SHO on-call:** `#sho-oncall` (Discord)
- **C-level:** ver lista em `Admin → Diretoria`

## 📊 Pós-mortem (preencher 7 dias depois)

```markdown
### PB-CRISES-BAN · Pós-mortem
- Tipo de ban: [...]
- Causa raiz: [...]
- Tempo de recuperação: X dias
- Mensagens perdidas: ~Y
- Receita impactada: ~R$ Z
- Ações preventivas tomadas: [bullets]
- Próximos passos: [bullets]
```

## ⏭️ Próximo playbook

👉 [PB-CRISES-AUTONOMIA · Crise de Autonomia](PB-CRISES-gestao-crise-autonomia.md)

---

**Versão 1.0** · Atualizado 2026-06-02
