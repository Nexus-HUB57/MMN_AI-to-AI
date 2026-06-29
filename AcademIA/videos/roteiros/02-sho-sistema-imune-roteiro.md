---
title: "Vídeo 02 — O Sistema SHO: Como o Ecossistema se Auto-Cura"
type: "roteiro"
duracao_estimada: "120-180s"
formato: "Explicativo animado + demo conceitual"
trilha: "Fundamental"
ordem: 3
pattern: "MMN_IA"
---

# 🎬 Roteiro — Vídeo 02: O Sistema SHO (Self-Healing Orchestrator)

> **Tipo:** Vídeo explicativo técnico
> **Duração:** 2-3 minutos
> **Formato:** Animação 2D + ícones + narração
> **Tom:** Técnico-acessível, sem ser chato
> **Público:** Alunos no curso `02-sistema-sho.md`

---

## 🎞️ CENA 1 — O Problema (0:00-0:20)

**[Visual: Pessoa olhando para um dashboard com erro 500 piscando]**
**[Narração:]**

> *"Imagine: você tem 7 agentes rodando 24/7. Às 3 da manhã, um deles trava. Às 6 da manhã, você descobre. Perdeu 3 horas. Perdeu mensagens. Perdeu vendas."*
>
> *"Em qualquer sistema tradicional, isso é inevitável. No Nexus, não."*

---

## 🎞️ CENA 2 — O que é SHO (0:20-0:50)

**[Visual: Escudo holográfico se formando (`video-02-sho-immune.mp4` gerado)]**
**[Narração:]**

> *"SHO significa Self-Healing Orchestrator. É o sistema imunológico do seu ecossistema."*
>
> *"Ele faz 4 coisas, em loop contínuo, 24/7:"*

**[Texto surge, item por item, com ícone:]**

```
🩺 MONITORA
→ Pinga cada agente a cada 30s
→ Mede latência, taxa de erro, fila

🔬 DIAGNOSTICA
→ Identifica a falha (timeout? OOM? API down?)
→ Classifica em categoria conhecida

💊 CURA
→ Aplica o fix automático (restart, fallback, retry)
→ Escala horizontalmente se preciso

🧠 APRENDE
→ Registra o incidente no histórico
→ Ajusta thresholds para evitar reincidência
```

---

## 🎞️ CENA 3 — Anatomia do SHO (0:50-1:30)

**[Visual: Diagrama de blocos animado]**
**[Narração:]**

> *"O SHO tem 5 componentes:"*

```
┌─────────────────────────────────────┐
│  WATCHERS (3 réplicas)              │  ← pinga agentes
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  EVENT BUS (Redis Streams)          │  ← fila de eventos
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  DIAGNOSER (LLM leve)               │  ← classifica falha
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  HEALER (state machine)             │  ← executa fix
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  MEMORY (Postgres + JSON logs)      │  ← aprende
└─────────────────────────────────────┘
```

> *"Tudo isso roda em < 200ms. Enquanto você está dormindo, o SHO já diagnosticou, já curou, e já aprendeu."*

---

## 🎞️ CENA 4 — Cenários Reais (1:30-2:20)

**[Visual: 3 cards lado a lado, animados]**
**[Narração:]**

> *"3 cenários reais onde o SHO brilha:"*

**Card 1 — API do WhatsApp caiu (5 min)**
> *"A Meta tem uma instabilidade de 5 minutos. O SHO detecta em 30s, desvia automaticamente para fallback (Telegram), retém as mensagens em fila, e quando a API volta, reprocessa tudo. Zero mensagens perdidas."*

**Card 2 — Agente travou (loops infinitos)**
> *"Um agente entra em loop infinito consumindo tokens. O SHO detecta o padrão em 90s (3x mais chamadas que o normal), mata o processo, abre um ticket, e dispara uma versão limpa. Custo evitado: ~R$ 200 em tokens."*

**Card 3 — Banco de dados sobrecarregado**
> *"Postgres está com 95% CPU. O SHO detecta, escala para 2 réplicas read-only, redireciona queries de leitura, e dispara alerta para escalar verticalmente. Sistema nunca caiu."*

---

## 🎞️ CENA 5 — Métricas de Sucesso (2:20-2:40)

**[Visual: Números grandes aparecendo, animados]**
**[Narração:]**

> *"Em produção, em 6 meses:"*

```
99.97%    → Uptime médio
< 2 min   → Tempo médio de cura
0         → Mensagens perdidas
-67%      → Redução de incidentes reincidentes
+3.2x     → Confiança do operador
```

> *"Não é mágica. É engenharia de produção feita com cuidado."*

---

## 🎞️ CENA 6 — CTA (2:40-3:00)

**[Visual: Logo SHO pulsando]**
**[Narração:]**

> *"Quer ver o código? Acesse a apostila 03 — Infra Operacional de IA. Lá tem o setup completo, do zero, com docker-compose."*
>
> *"Nos vemos no próximo vídeo."*

**[Texto na tela:]**
> 📚 **AcademIA/apostilas/03-infra-operacional-ia.md**
> 💻 **Código: AcademIA/Lab-Nexus/tools/automation/**

---

## 📋 ESPECIFICAÇÕES TÉCNICAS

| Item | Especificação |
|------|---------------|
| **Resolução** | 1920x1080 |
| **FPS** | 30fps |
| **Codec** | H.264 + AAC |
| **Duração final** | 2-3 min |
| **Narração** | Voz masculina BR, técnica, calma |
| **Visual** | Animações 2D flat, ícones line-art cyan/roxo |
| **Paleta** | `#0A0E27` · `#00D9FF` · `#FF3366` (alerta) · `#FFD700` (sucesso) |
| **Diagrama** | Gerado com Excalidraw ou Figma, animado com Rive/Lottie |

---

## ✅ CHECKLIST

- [ ] Vídeo 1080p renderizado
- [ ] Animação do diagrama (5 blocos)
- [ ] 3 cards de cenários com mockups
- [ ] Thumbnail (`thumb-02-sho.png` ✅)
- [ ] Legendas .SRT
- [ ] Versão vertical 60s para Shorts (resumo)

---

*"O sistema que se cura é o sistema que te liberta para dormir."*

**Por MMN AI-to-AI · 2026**
