---
title: "Vídeo 01 — Entendendo o IOAID (Infraestrutura Operacional de IA Distribuída)"
type: "roteiro"
duracao_estimada: "120-150s"
formato: "Explicativo animado + diagrama + narração"
trilha: "Fundamental"
ordem: 2
pattern: "MMN_IA"
---

# 🎬 Roteiro — Vídeo 01: Entendendo o IOAID

> **Tipo:** Vídeo explicativo técnico
> **Duração:** 2-2.5 minutos
> **Formato:** Animação 2D + ícones + narração
> **Tom:** Didático-acessível, sem jargão desnecessário
> **Público:** Alunos no curso `01-entendendo-ioaid.md`

---

## 🎞️ CENA 1 — A Pergunta Inicial (0:00-0:15)

**[Visual: Pessoa olhando para um sistema complexo com muitas peças se movendo]**
**[Narração:]**

> *"Você já parou pra pensar o que acontece entre o momento que você aperta 'enviar' e a mensagem chegar no cliente? No Nexus, isso passa por 5 módulos diferentes em menos de 800 milissegundos. Vamos ver quais são."*

---

## 🎞️ CENA 2 — Os 5 Módulos (0:15-0:50)

**[Visual: 5 caixas 3D aparecem em sequência, cada uma com ícone + nome]**
**[Narração:]**

> *"São 5 módulos. Cada um com um papel claro:"*

**Módulo 1 — Autenticação** 🔐
> *"Quem é você? Você tem permissão? Isso aqui responde em < 50ms."*

**Módulo 2 — Event Bus** 📨
> *"O carteiro. Recebe a mensagem, distribui para os módulos certos. Usa Redis Streams, é assíncrono."*

**Módulo 3 — Agent Runtime** 🤖
> *"O cérebro. Aqui o LLM é chamado, com o system prompt, contexto, ferramentas."*

**Módulo 4 — Judge Revisor** ⚖️
> *"O fiscal. Antes de responder, checa se a mensagem está OK (compliance, ética, qualidade)."*

**Módulo 5 — Monitoring** 📊
> *"O olho que tudo vê. Logs, métricas, traces. Se algo falhar, alerta em < 30s."*

---

## 🎞️ CENA 3 — O Fluxo (0:50-1:20)

**[Visual: Animação das 5 caixas se conectando, mensagem fluindo de uma para outra]**
**[Narração:]**

> *"O fluxo é esse: você envia → autenticação valida → event bus roteia → agent runtime pensa → judge revisa → resposta volta → monitoring registra. Em paralelo."*

```
[Você envia] 
   ↓ (5ms)
[Autenticação] → [Event Bus] → [Agent Runtime]
                                     ↓
                                 [Judge] 
                                     ↓
                              [Resposta volta]
                                     ↓
                              [Monitoring loga]
```

> *"Tudo isso em < 800ms. O cliente nem percebeu que existiu."*

---

## 🎞️ CENA 4 — Auditável, Escalável, Reversível (1:20-1:40)

**[Visual: 3 palavras aparecem em destaque, cada uma com ícone]**
**[Narração:]**

> *"Três palavras que resumem o IOAID:"*

**Auditável** 📋
> *"Cada requisição é registrada. Você sabe exatamente o que foi feito, quando, e por quê."*

**Escalável** 📈
> *"Funciona com 10 requisições ou 10 milhões. O sistema escala horizontalmente."*

**Reversível** ↩️
> *"Algo deu errado? Você pode reverter. Cada ação tem um 'desfazer' correspondente."*

---

## 🎞️ CENA 5 — Comparação com Sistemas Tradicionais (1:40-1:55)

**[Visual: Lado a lado — sistema antigo (caixa preta) vs. IOAID (5 módulos visíveis)]**
**[Narração:]**

> *"Em sistemas tradicionais, tudo isso é uma caixa preta. Você envia, e 'espera que dê certo'. No IOAID, cada passo é visível, monitorável, e ajustável."*

---

## 🎞️ CENA 6 — CTA (1:55-2:10)

**[Visual: Logo IOAID pulsando]**
**[Narração:]**

> *"Quer ver o código? Acesse a apostila 01 — Apresentação da Infraestrutura. Tem diagrama completo e setup com docker-compose."*
>
> *"Próximo vídeo: O Sistema SHO. O sistema imunológico do Nexus."*

**[Texto na tela:]**
> 📚 **AcademIA/apostilas/01-apresentacao-infraestrutura.md**
> 💻 **Código: AcademIA/Lab-Nexus/workflows/**

---

## 📋 ESPECIFICAÇÕES TÉCNICAS

| Item | Especificação |
|------|---------------|
| **Resolução** | 1920x1080 |
| **FPS** | 30fps |
| **Codec** | H.264 + AAC |
| **Duração final** | 2-2.5 min |
| **Narração** | Voz masculina BR, didática, calma |
| **Visual** | Animações 2D flat, ícones line-art cyan/azul |
| **Paleta** | `#0A0E27` · `#00D9FF` · `#4DA8FF` · `#FFD700` |
| **Diagrama** | Animação sequencial com setas se formando |

---

*"IOAID não é só uma tecnologia. É a promessa de que cada interação é rastreável, escalável, e reversível."*

**Por MMN AI-to-AI · 2026**