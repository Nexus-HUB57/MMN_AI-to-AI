---
title: "PB-CRISES-DATA-LOSS · Perda de dados"
playbook_code: PB-CRISES-DATA-LOSS
category: crise
duration_execution: 4-24h
tags: [playbook, crise, data-loss, backup, recuperacao, lgpd]
last_updated: 2026-06-02
---

# 🗄️ PB-CRISES-DATA-LOSS · Perda de dados

> **Tempo de leitura:** 10 min · **Tempo de execução:** 4–24h · **Quando usar:** Dados corrompidos, deletados ou inacessíveis

## 🚨 Quando usar

- Dashboard mostra dados zerados ou inconsistentes
- Relatórios não batem com o esperado
- Contatos "desapareceram" do painel
- Erro 500 ao acessar dados
- Backup automático falhou (alerta no `#ops-alerts`)

## ⚠️ Pré-condições

- [ ] Acesso ao painel Admin
- [ ] Acesso à equipe de Engenharia (Discord `#ops-oncall`)
- [ ] Logs do audit intactos

## 📋 Passo a passo

### Passo 1 — CONFIRMAR A PERDA (15 min)

```
1. Conferir com 2+ fontes (dashboard, audit log, banco)
2. Identificar escopo: 1 tenant? 1 afiliado? Global?
3. Identificar timing: desde quando?
4. NÃO tentar corrigir antes de documentar
```

### Passo 2 — PARAR ESCRITAS (5 min)

```
Admin → Configurações → "Modo Read-Only" (se disponível)
ou
Admin → Dispatchers → "Pausar todos"
```

> **Regra de ouro:** pare de escrever antes de tentar recuperar. Você pode sobrescrever o backup.

### Passo 3 — AVALIAR BACKUPS (30 min)

```
1. Listar backups disponíveis:
   - Diário (retém 7 dias)
   - Semanal (retém 4 semanas)
   - Mensal (retém 12 meses)

2. Escolher o backup mais recente ANTES do problema

3. Verificar integridade: hash SHA-256
```

### Passo 4 — RECUPERAÇÃO (1-4h)

**Se perda é localizada (1 afiliado/tenant):**

```
1. Restaurar do backup em banco de homologação
2. Validar dados com usuário afetado
3. Aplicar em produção (com dry-run primeiro)
4. Confirmar com usuário
```

**Se perda é global (todos os tenants):**

```
1. ESCALAR IMEDIATAMENTE para C-level + Eng. Sênior
2. NÃO restaurar em produção sem aprovação
3. Restaurar em homologação
4. Validar com amostragem de usuários
5. Coordenar comunicação oficial
```

### Passo 5 — PÓS-MORTEM (24-72h)

- [ ] Identificar **causa raiz** (bug? erro humano? falha de infra?)
- [ ] Implementar **proteção** (constraint, validação, alerta)
- [ ] Atualizar **RPO/RTO** (Recovery Point/Time Objective)
- [ ] Comunicar **oficialmente** os afetados (LGPD se envolve dados pessoais)
- [ ] Documentar em `docs/post-mortem/`

## ⚠️ LGPD — Notificação obrigatória

Se a perda envolve **dados pessoais identificáveis**, pode haver obrigação de notificar a ANPD (Autoridade Nacional de Proteção de Dados) em **prazo razoável** (Art. 48 da LGPD).

Critérios:
- Risco significativo aos titulares
- Dados sensíveis vazados
- Volume alto

> **Consulte o DPO antes de qualquer comunicação externa.**

## 🛑 Quando escalar

- Perda global → **C-level + Eng. Sênior + DPO**
- Dados sensíveis vazados → **DPO + Jurídico + Comunicação**
- Não tem backup anterior ao problema → **revisão de infraestrutura**

## 📞 Contatos de emergência

- **Eng. Sênior on-call:** `#ops-oncall` (Discord, 24/7)
- **DPO (Data Protection Officer):** ver lista em `Admin → Equipe`
- **C-level:** ver lista em `Admin → Diretoria`

## ⏭️ Próximo playbook

👉 [PB-CRISES-AUTONOMIA · Crise de Autonomia](PB-CRISES-gestao-crise-autonomia.md)

---

**Versão 1.0** · Atualizado 2026-06-02
