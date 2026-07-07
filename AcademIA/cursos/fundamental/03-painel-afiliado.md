---
title: "03 · Primeiros passos no Painel do Afiliado"
level: fundamental
duration: 20min
prerequisites: ["02-sistema-sho"]
tags: [painel, ui, runtime, skills, comissoes, analytics]
last_updated: 2026-06-02
---

# 🖥️ 03 · Primeiros passos no Painel do Afiliado

> **Tempo:** 20 min · **Nível:** Fundamental · **Pré-requisitos:** 02 - Sistema SHO

## 🌐 Acesso

| URL | Função |
|---|---|
| `https://app.oneverso.com.br/affiliate/` | Painel principal |
| `https://app.oneverso.com.br/admin/runtime` | Runtime dos agentes |
| `https://app.oneverso.com.br/admin/skills` | Catálogo de Skills |
| `https://app.oneverso.com.br/admin/commissions` | Comissões e ciclos |
| `https://app.oneverso.com.br/support` | Tickets e base de conhecimento |

> 🔐 **2FA é obrigatório.** Se ainda não ativou, faça isso primeiro.

## 🧭 As 7 telas que você precisa conhecer hoje

### 1. 🏠 Home do Afiliado
- Cards de KPI: cliques, conversões, comissões do mês
- Notificações: aprovações pendentes, Judge reprovou algo
- Atalhos: disparar skill, ver relatório

### 2. 🤖 Admin Runtime
- **Fila de aprovações** (tempo real, WebSocket)
- **Status dos agentes** (verde = OK, amarelo = fila, vermelho = falhou)
- **Botão de kill switch** (para todos os agentes em emergência)

### 3. 🎯 Catálogo de Skills (`/admin/skills`)
45 skills no total, divididas em 3 níveis:

| Nível | Qtd | Preço |
|---|---|---|
| Básico | 15 | R$ 14–28/mês |
| Intermediário | 15 | R$ 36–64/mês |
| Avançado | 15 | R$ 89–189/mês |

Status por skill: `operacional` | `em desenvolvimento` | `planejada`

### 4. 💰 Comissões (`/admin/commissions`)
- Visão por ciclo MMN (semanal / mensal / configurável)
- Árvore da sua rede (quem está em cada nível)
- Split de comissões (first-touch / last-touch / decay)
- Exportar CSV para o contador

### 5. 📊 Analytics
- **Funil:** visita → clique → conversão → comissão
- **Coortes** por origem do lead
- **LTV** estimado (em beta)

### 6. ⚙️ Configurações
- Dados pessoais + bancários
- Notificações (push, e-mail, WhatsApp)
- **Parâmetros do SHO** (limites de risco, confiança, dispatcher)
- Integrações: Hotmart, Shopee, Mercado Livre, Stripe

### 7. 🆘 Suporte
- Base de conhecimento (muitos artigos vieram da Lib Nexus)
- Abrir ticket (com SLA: 4h úteis)
- Status do sistema (atualizado a cada 60s)

## 🚀 Roteiro guiado — 10 min

```
1. Abra o painel
2. Clique em "Admin Runtime"  → veja se tem aprovação pendente
3. Vá em "Catálogo de Skills" → ative 1 skill nova do nível básico
4. Vá em "Configurações"     → ative notificações push
5. Vá em "Analytics"         → olhe seu funil atual
6. Volte para "Home"          → comemore 🎉
```

## ⚠️ Erros comuns de iniciante

| ❌ Errado | ✅ Certo |
|---|---|
| Ativar 10 skills de uma vez | Ativar 1, esperar 7 dias, ver resultado |
| Colocar confiança do Judge em 0.95 | Manter em 0.75–0.85 (deixa o Judge trabalhar) |
| Não configurar dispatcher | Configurar 1 canal antes de qualquer campanha |
| Disparar para lista fria | Segmentar primeiro com `audience-segmenter` |

## 🎯 Exercício final do Nível Fundamental

Complete todos os passos:

- [ ] Ativar 2FA
- [ ] Ativar 1 skill de copywriting (`copywriter-persuasivo`)
- [ ] Configurar 1 dispatcher (WhatsApp ou e-mail)
- [ ] Disparar 1 campanha real para **no máximo 50 contatos**
- [ ] Ler o relatório de autonomia 24h depois

> Quando completar tudo, você está pronto para o **Nível 2 — Agentes**.

## ⏭️ Próximo passo

👉 [`cursos/agente/00-primeiro-agente.md`](../agente/00-primeiro-agente.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `frontend/src/pages/affiliate/*` + `docs/guias/MANUAL-PLATAFORMA.md`
