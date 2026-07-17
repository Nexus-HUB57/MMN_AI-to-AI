---
title: "Módulo Agent-00 · Slides · Primeiro Agente"
description: "Slides visuais para acompanhar o vídeo do módulo 00 da Trilha Agente"
tags: [slides, agente, modulo-00, primeiro-agente, setup]
modulo: agent-00
trilha: Agente
ordem: 0
total_slides: 8
pattern: "MMN_IA"
---

# 📊 Slides · Agente 00 · Primeiro Agente

> Material visual para acompanhar o vídeo. Cada slide tem referência ao PNG correspondente em `slides/`.

## 🎨 Paleta de Cores

```
Primary:    #63eaff (cyan neon)
Secondary:  #b78cff (purple neon)
Accent:     #ff7eb6 (pink)
Background: #0a0e1a (dark)
Text:       #e5edf5
```

---

## 📍 SLIDE 01 — Abertura (00:00 - 00:15)

**Título:** Seu Primeiro Agente em 30 Minutos
**Subtítulo:** Trilha Agente · Módulo 00
**Visual:** Persona Alencar + ícone de robô
**Tipografia:** Display 80px, peso 900

```
┌─────────────────────────────────────────┐
│                                         │
│     🤖 Seu Primeiro Agente              │
│        em 30 Minutos                    │
│                                         │
│     Trilha Agente · Módulo 00           │
│     Sir. Nexus Alencar                  │
│                                         │
│     [cyan glow effect]                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 02 — O que é um Agente (00:15 - 00:45)

**Título:** "Agente ≠ Chatbot"
**Pontos:**
- Chatbot: responde pergunta por pergunta
- Agente: executa ações no mundo real
- Tem objetivos, memória, ferramentas
- Roda 24/7 sem precisar de você

```
┌─────────────────────────────────────────┐
│  Chatbot          vs        Agente      │
│  ┌────────┐               ┌────────┐   │
│  │Pergunta│               │ Objetivo│   │
│  │Resposta│               │ + Plano │   │
│  │Pergunta│               │ + Tools │   │
│  │Resposta│               │ + Ações │   │
│  └────────┘               └────────┘   │
│   Reativo                Pró-ativo     │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 03 — Arquitetura Básica (00:45 - 02:00)

**Título:** Os 4 Componentes de Todo Agente
**Visual:** Diagrama circular com 4 nodos

```
┌─────────────────────────────────────────┐
│                                         │
│            ┌──────────┐                 │
│            │ AGENTE   │                 │
│            └────┬─────┘                 │
│       ┌─────┬───┴────┬──────┐            │
│       ▼     ▼        ▼      ▼            │
│   ┌────┐ ┌────┐  ┌────┐ ┌────┐         │
│   │LLM │ │MEM │  │TOOL│ │OBJ │         │
│   │Core│ │ória│  │   │ │ etivo│        │
│   └────┘ └────┘  └────┘ └────┘         │
│                                         │
│  Cérebro  Memória  Mãos   Missão         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 04 — O que Você Vai Construir (02:00 - 03:00)

**Título:** "Hoje: 1 agente que responde WhatsApp"
**Especificações:**
- Trigger: lead novo na lista
- Ação: envia 3 mensagens com delay
- Métrica: taxa de resposta
- Custo: ~R$ 0,01 por conversa

```
┌─────────────────────────────────────────┐
│  TRIGGER          AGENTE          AÇÃO  │
│                                         │
│  Lead novo ──→ [Processar] ──→ Msg 1    │
│  na lista       [Decidir]       (imediata)│
│                 [Agendar]  ──→ Msg 2     │
│                              (24h)       │
│                           ──→ Msg 3      │
│                              (72h)       │
│                                         │
│  Logs + Métricas → Dashboard             │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 05 — Passo 1: Acessar Painel (03:00 - 04:00)

**Título:** "5 Minutos para Configurar"
**URL:** `app.nexus-academy.io/agentes`
**Print:** Tela do painel

```
┌─────────────────────────────────────────┐
│  🌐 app.nexus-academy.io/agentes        │
│                                         │
│  [Screenshot do painel com botão        │
│   "+ Novo Agente" destacado em cyan]    │
│                                         │
│  1. Login                               │
│  2. Menu "Agentes"                      │
│  3. Clicar "+ Novo Agente"              │
│  4. Nome: "Agente Boas-vindas"          │
│  5. Descrição: "Responde leads WhatsApp" │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 06 — Passo 2: Definir Trigger (04:00 - 06:00)

**Título:** "Quando o Agente Acorda?"
**Opções:**
- Webhook externo (formulário, evento)
- Schedule (cron)
- Manual
- Resposta de outro agente

```
┌─────────────────────────────────────────┐
│  TRIGGERS DISPONÍVEIS                   │
│                                         │
│  ◉ Webhook (recomendado)                │
│  ◯ Schedule                             │
│  ◯ Manual                               │
│  ◯ Federation (outro agente)            │
│                                         │
│  Webhook URL:                           │
│  https://api.nexus-academy.io/trigger/  │
│    agent_abc123                         │
│                                         │
│  Payload esperado:                      │
│  {                                      │
│    "event": "lead.captured",            │
│    "user_id": "...",                    │
│    "phone": "..."                       │
│  }                                      │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 07 — Passo 3: Configurar Ações (06:00 - 12:00)

**Título:** "O que o Agente Faz?"
**3 mensagens de WhatsApp com delays**

```
┌─────────────────────────────────────────┐
│  MENSAGEM 1 (imediata)                  │
│  ─────────────────────                  │
│  "Oi {{nome}}! Sou da Nexus. Recebeu   │
│   essa msg porque baixou nosso e-book.  │
│   Posso te ajudar a começar?"           │
│                                         │
│  MENSAGEM 2 (24h depois, se não         │
│             respondeu)                  │
│  ─────────────────────                  │
│  "Oi {{nome}}! Aqui é o Alencar da     │
│   Nexus. Vi que baixou nosso material.  │
│   3 afiliados nossos saíram de R$ 0    │
│   a R$ 30k em 6 meses. Quer ver como?" │
│                                         │
│  MENSAGEM 3 (72h, se ainda sem resposta)│
│  ─────────────────────                  │
│  "{{nome}}, última msg sobre o e-book. │
│   Tem 1 minuto? Link aqui: bit.ly/..." │
└─────────────────────────────────────────┘
```

---

## 📍 SLIDE 08 — Métricas & Próximos Passos (12:00 - 14:00)

**Título:** "Como Saber se Está Funcionando"
**Métricas-chave:**
- Entrega > 95%
- Abertura > 70%
- Resposta > 15%
- Conversão > 3%

**Próximo módulo:** Skills Essenciais

```
┌─────────────────────────────────────────┐
│  📊 MÉTRICAS DO AGENTE                  │
│                                         │
│  Entrega:    ████████░░  95% ✓          │
│  Abertura:   ██████░░░░  68%             │
│  Resposta:   ███░░░░░░░  18%             │
│  Conversão:  █░░░░░░░░░  4%              │
│                                         │
│  ────────────────────────────           │
│  ⏭ PRÓXIMO MÓDULO                      │
│                                         │
│  Agente 01 · Skills Essenciais          │
│  As 18 skills que todo agente precisa   │
│  14 min · Alencar                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎬 Notas de Produção

**Duração total:** ~14 minutos
**Cenas:** 8 slides (cada um vira 1 cena do vídeo)
**Persona:** Sir. Nexus Alencar (voz oficial)
**Visual style:** Dark mode + cyan/purple neon + gradientes
**Música de fundo:** Opcional, instrumental tech, 30% volume

**Para gerar PNG de cada slide:**
- Use `image_synthesize` com referência cyberpunk
- Resolução: 1920x1080 (16:9)
- Cores: #0a0e1a (bg), #63eaff (cyan), #b78cff (purple)

**Para gerar vídeo final:**
- Use `gen_videos` em cada slide com prompt descritivo
- Combine com TTS (synthesize_speech) em ffmpeg
- Total: ~14 min de conteúdo + ~5 min de produção

---

*AcademIA · Slides Agent-00 · 2026*