---
title: "Vídeo 04 — Construindo Seu Primeiro Agente"
type: "roteiro"
duracao_estimada: "180-240s"
formato: "Live-coding + conceito + visualização"
trilha: "Agente"
ordem: 1
pattern: "MMN_IA"
---

# 🎬 Roteiro — Vídeo 04: Construindo Seu Primeiro Agente em 4 Minutos

> **Tipo:** Vídeo híbrido (tutorial + conceitual)
> **Duração:** 3-4 minutos
> **Formato:** Live-coding acelerado + overlays explicativos
> **Tom:** Didático, mão-na-massa, motivador
> **Público:** Alunos entrando na Trilha Agente

---

## 🎞️ CENA 1 — A Pergunta (0:00-0:15)

**[Visual: Pessoa olhando para um notebook em branco]**
**[Narração:]**

> *"Quanto tempo leva pra construir um agente de IA que responde clientes no WhatsApp? Em 2023, semanas. Em 2024, dias. Em 2026? 4 minutos."*
>
> *"Eu vou te mostrar como."*

---

## 🎞️ CENA 2 — Definição (0:15-0:40)

**[Visual: Diagrama minimalista surgindo, peça por peça]**
**[Narração:]**

> *"Antes do código, o conceito. Um agente tem 4 partes:"*

```
1. CÉREBRO     → LLM (o modelo de linguagem)
2. MEMÓRIA     → contexto + histórico
3. FERRAMENTAS → APIs que ele pode chamar
4. IDENTIDADE  → system prompt (quem ele é)
```

> *"É isso. 4 partes. O resto é orquestração."*

---

## 🎞️ CENA 3 — Live Coding (0:40-2:30) **— coração do vídeo**

**[Visual: Tela dividida. Esquerda: VSCode. Direita: terminal. Topo: timer contando.]**
**[Narração rápida, técnica, em ritmo de live coding]**

**Minuto 0:40 — Setup**
> *"Vamos lá. `npm init agente-vendas`. Crio o projeto."*

```bash
$ npm init -y
$ npm install openai dotenv
```

**Minuto 1:00 — Cérebro**
> *"O cérebro. Carrega o LLM. Eu uso o `gpt-4o-mini` por custo, mas pode ser qualquer um."*

```javascript
// cerebro.js
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function pensar(mensagem, historico) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: IDENTIDADE },
      ...historico,
      { role: "user", content: mensagem }
    ]
  });
  return response.choices[0].message.content;
}
```

**Minuto 1:20 — Identidade**
> *"A identidade. É aqui que o agente vira SEU agente. Em vez de um chatbot genérico, vira a Marina, 28 anos, especialista em..."*

```javascript
const IDENTIDADE = `
Você é Marina, assistente virtual da Loja X.
Tom: amigável, direto, vendedora sem ser咄咄逼人.
Regras:
- Sempre cumprimente pelo nome do cliente
- Se não souber, ofereça falar com humano
- NUNCA invente preço ou estoque
- Máximo 3 linhas por resposta
`.trim();
```

**Minuto 1:40 — Ferramentas**
> *"As ferramentas. O que o agente pode fazer além de falar. Aqui, consultar preço:"*

```javascript
// tools/preco.js
export async function consultarPreco(sku) {
  const r = await fetch(`https://api.loja.com.br/preco/${sku}`);
  return await r.json();
}
```

**Minuto 2:00 — Memória**
> *"A memória. O agente precisa lembrar da conversa. Aqui uso um array simples:"*

```javascript
const historico = []; // cresce a cada mensagem

export function lembrar(userMsg, agentMsg) {
  historico.push({ role: "user", content: userMsg });
  historico.push({ role: "assistant", content: agentMsg });
}
```

**Minuto 2:15 — Conectando tudo**
> *"Agora conecto. Quando chega mensagem, ele pensa, lembra, e responde:"*

```javascript
// index.js
import { pensar } from './cerebro.js';
import { lembrar } from './memoria.js';

export async function handleMessage(from, msg) {
  const resposta = await pensar(msg, historico);
  lembrar(msg, resposta);
  return resposta;
}
```

**Minuto 2:30 — Teste ao vivo**
> *"Vamos testar. Eu envio uma mensagem simulada:"*

```
USER: "oi, tem o produto XPTO em estoque?"
AGENT: "Oi! 😊 Vou consultar pra você. Só um instante..."
AGENT: [chama tool consultarPreco("XPTO")]
AGENT: "Sim! Temos o XPTO por R$ 89,90. Quer que eu faça o pedido?"
```

> *"Pronto. 2 minutos e 30 segundos. Você tem um agente funcional."*

---

## 🎞️ CENA 4 — Os 10% que Fazem a Diferença (2:30-3:00)

**[Visual: Lista com checkmarks surgindo]**
**[Narração:]**

> *"Mas um agente PRODUÇÃO precisa de mais 5 coisas:"*

```
✅ 1. Guardrails: limites do que ele pode responder
✅ 2. Logs: gravar tudo (compliance + debug)
✅ 3. Fallback: o que fazer se o LLM travar
✅ 4. Métricas: latência, tokens, satisfação
✅ 5. SHO: o sistema imunológico que vimos no vídeo 02
```

> *"Isso é o que separa um protótipo de um sistema que fatura R$ 50k/mês."*

---

## 🎞️ CENA 5 — CTA (3:00-3:20)

**[Visual: Logo + URL]**
**[Narração:]**

> *"O código completo está no curso `00-primeiro-agente.md` da Trilha Agente. Tem também a apostila 06 — Setup do Agente Pessoal, com docker-compose pronto."*
>
> *"Bora codar?"*

**[Texto na tela:]**
> 💻 **AcademIA/cursos/agente/00-primeiro-agente.md**
> 📦 **Setup completo: AcademIA/apostilas/06-setup-agente-pessoal.md**

---

## 📋 ESPECIFICAÇÕES TÉCNICAS

| Item | Especificação |
|------|---------------|
| **Resolução** | 1920x1080 |
| **FPS** | 60fps (para o live-coding ficar suave) |
| **Codec** | H.264 + AAC |
| **Duração final** | 3-4 min |
| **Narração** | Voz masculina BR, ritmo rápido, didática |
| **Visual principal** | Tela de VSCode com tema dark, fonte Fira Code |
| **Paleta** | `#0A0E27` · `#00D9FF` · `#FFD700` (código) · `#FF6B35` (destaque) |
| **Tipografia código** | Fira Code 18-20pt |

---

## ⚠️ CUIDADOS DE GRAVAÇÃO

- **Velocidade do live-coding:** 2x (não 4x; precisa dar pra ler)
- **Zoom:** aumentar fonte do VSCode para 18-20pt
- **Áudio:** fone de ouvido + mic condensador, sem ruído de teclado
- **Demo real:** testar antes 3x para não travar na gravação
- **Backup:** ter um terminal pré-configurado como plano B

---

## ✅ CHECKLIST

- [ ] Vídeo 1080p renderizado
- [ ] Live-coding gravado em tela cheia
- [ ] Overlays explicativos (4 partes, 5%, CTA)
- [ ] Thumbnail (`thumb-04-primeiro-agente.png` ✅)
- [ ] Legendas .SRT
- [ ] Versão 60s resumida para Shorts (cenário 1 + 2 + CTA)
- [ ] Repositório do código linkado na descrição

---

*"Um agente não é construído. É cultivado. Comece simples, observe, e itere."*

**Por MMN AI-to-AI · 2026**
