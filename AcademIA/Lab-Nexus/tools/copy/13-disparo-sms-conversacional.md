---
title: "13 · Disparo SMS Conversacional"
description: "Templates + prompt para SMS transacional e relacional com compliance ANATEL/LGPD"
tags: [lab-nexus, copy, sms, transacional, relacional, anatel, lgpd]
category: copy
level: agent
estimated_time: "20 min para configurar 1 template + 5 min por disparo"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: sms-conversacional
course_anchor: cursos/agente/02-disparo-whatsapp.md
---

# 📱 13 · Disparo SMS Conversacional

> Templates de SMS transacional e relacional com compliance ANATEL + LGPD, integração com WhatsApp e prompt gerador de mensagens curtas.

## 🎯 Spec

| Atributo | Valor |
|---|---|
| **O que é** | 8 templates de SMS (transacional + relacional) + prompt gerador + checklist de compliance ANATEL/LGPD |
| **Quando usar** | Confirmações de compra, lembretes, recuperações, follow-up rápido |
| **Pré-requisitos** | Nível 🥈 Agente; base opt-in validada; provedor SMS com sender ID |
| **Tempo estimado** | 20 min para configurar 1 template + 5 min por disparo |
| **Skill que executa** | `sms-conversacional` (agent) |
| **Judge que valida** | `judge-revisor` + `compliance-auditor` |

## ⚠️ Por que SMS ainda importa

| Canal | Open rate | Custo | Velocidade | Compliance |
|---|---|---|---|---|
| Email | 22% | R$ 0,01 | 5min–24h | LGPD média |
| WhatsApp | 95% | R$ 0,08 | <1min | LGPD alta + opt-in |
| **SMS** | **98%** | **R$ 0,05** | **<10s** | **ANATEL + LGPD alta** |

> SMS é o canal com **maior open rate** do mundo. Mas é **rastreável e regulado**.

## 📋 Regras ANATEL + LGPD (obrigatórias)

### ANATEL (Resolução 632/2014)

1. **Opt-in prévio** e documentado (print, log, ou checkbox)
2. **Horário restrito**: 8h–20h (horário comercial local do destinatário)
3. **Opt-out gratuito** — responder `SAIR` deve parar imediatamente
4. **Identificação do remetente** — sender ID claro (ex: `NEXUS`)
5. **Não usar para conteúdo adulto, drogas, jogos de azar** sem licença

### LGPD

1. **Base legal**: consentimento (opt-in) ou legítimo interesse (transacional puro)
2. **Finalidade explícita** — não misturar transacional com marketing sem aviso
3. **Retenção**: log de envios por 5 anos (ANATEL) + dados pessoais até revogação
4. **Direito de exclusão**: até 15 dias para remover base inteira

> ❌ Sem opt-in documentado = **multa + bloqueio do sender ID**.

## 📦 Asset 1 — 8 Templates Prontos

### 🟦 Transacional (sempre permitido, base legal: execução de contrato)

#### 1. Confirmação de compra

```
[NEXUS] Olá {nome}! Compra aprovada: {produto}. 
Acesso enviado para {email}. Suporte: {link_suporte}
```

#### 2. Código de acesso / 2FA

```
[NEXUS] Seu código de acesso: {codigo_6digitos}. 
Valido por 10 min. Nao compartilhe. Responda SAIR para cancelar.
```

#### 3. Lembrete de evento (24h antes)

```
[NEXUS] Amanha {data} as {hora} tem {evento}. 
Link de entrada: {link}. Chegue 5min antes.
```

#### 4. Atualização de status (ex: pedido)

```
[NEXUS] Status do pedido #{numero}: {status}. 
Prazo estimado: {data}. Rastrear: {link}
```

### 🟨 Relacional (requer opt-in marketing, base legal: consentimento)

#### 5. Boas-vindas (após cadastro)

```
[NEXUS] Oi {nome}! Bem-vindo. Aqui vai seu presente: {link_bonus}. 
Responda SAIR para sair da lista a qualquer momento.
```

#### 6. Conteúdo novo (1× por semana, máx)

```
[NEXUS] Novo post no blog: "{titulo_curto}". 
Ler: {link}. Semanalmente, as quartas. SAIR para cancelar.
```

#### 7. Pesquisa de satisfação (pós-compra +7d)

```
[NEXUS] Oi {nome}! Como foi sua experiencia com {produto}? 
Responda de 1 a 5. Leva 30s. Obrigado!
```

#### 8. Recuperação de compra (carrinho 2h)

```
[NEXUS] {nome}, seu carrinho com {produto} ({valor}) ainda espera. 
Finalize: {link}. 10% off nas proximas 6h: CUPOM10. SAIR para sair.
```

## 📦 Asset 2 — Prompt Gerador de SMS

```markdown
# Prompt: gerar SMS curto com compliance

Voce e copywriter do Nexus. Gere UM SMS para o objetivo abaixo,
respeitando as restricoes ANATEL + LGPD.

## Objetivo
{tipo: transacional|relacional}
{contexto}

## Variaveis
- Nome: {nome}
- Produto/servico: {produto}
- Link: {link}
- Codigo (se aplicavel): {codigo}

## Restricoes RIGIDAS
- Maximo 160 caracteres (1 SMS)
- Sem acentos (alguns provedores quebram)
- Sem emojis (encoding pode falhar)
- Identificar remetente como [NEXUS] no inicio
- Incluir SAIR para cancelar (se relacional)
- Sem promessas absolutas ("garantido", "100%")
- Sem dados pessoais extras (email, CPF no corpo)
- Linguagem humana, nao robotica

## Saida esperada
1. Versao principal (1 SMS, 160 chars)
2. Versao alternativa (tom mais formal OU mais casual)
3. Tamanho em caracteres de cada uma
4. Risco de compliance (linha unica)
5. Horario sugerido de envio (8h-20h local)
```

## 📦 Asset 3 — Checklist de Disparo (rode antes de cada campanha)

```yaml
pre_disparo:
  base_opt_in_validada: true   # checkbox de consentimento + log
  base_lgpd_ok: true           # sem dados de crianças, sem base estourada
  template_aprovado_judge: true # judge-revisor marcou como safe
  sender_id_configurado: true  # NEXUS cadastrado no provedor
  horario_permitido: true      # 8h-20h do fuso do destinatario
  opt_out_linha_inclusa: true  # "SAIR para cancelar"

pos_disparo:
  log_envios_salvo: true       # 5 anos (ANATEL)
  bounce_rate_monitorado: true # > 5% = problema
  opt_outs_processados: <24h   # remover em até 24h
  relatorio_metricas: true     # delivery, open, click, opt-out
```

## 📊 Métricas Esperadas

| Métrica | Referência (B2C BR) | Bom | Ótimo |
|---|---|---|---|
| Delivery rate | 92% | ≥ 95% | ≥ 98% |
| Open rate (proxy: link tracking) | 85% | ≥ 90% | ≥ 95% |
| CTR (link curto) | 12% | ≥ 18% | ≥ 25% |
| Opt-out rate | 2% | ≤ 1.5% | ≤ 0.8% |
| Conversão (relacional) | 1.5% | ≥ 3% | ≥ 5% |

## ⚠️ Riscos & Anti-patterns

- ❌ **Enviar fora do horário (8h–20h)** — ANATEL pode multar
- ❌ **Misturar transacional com marketing** sem aviso — LGPD art. 7
- ❌ **Sem opt-out no template** — infração ANATEL + LGPD
- ❌ **Enviar para base fria (>90d sem interação)** sem re-opt-in
- ❌ **Usar link longo (> 60 chars)** — quebra em 2 SMS = 2x custo
- ❌ **Enviar mesmo SMS para base inteira sem segmentação** — alto opt-out
- ⚠️ **2FA**: nunca enviar código por SMS sem TLS no endpoint de validação

## 🤝 Compliance Workflow

```
[Criador] → escreve template
   ↓
[judge-revisor] → marca como safe ou pede ajuste
   ↓
[compliance-auditor] → valida base legal + opt-in
   ↓
[Operador] → agenda disparo no horário permitido
   ↓
[Disparo] → execução
   ↓
[Pós-disparo] → processa opt-outs em <24h
   ↓
[Auditoria mensal] → revisa bounce + opt-out trends
```

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
