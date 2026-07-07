# Meeting Genesis · 07/07/2026 · Kit Copiloto

## Meta
- **Data:** 2026-07-07 10:00 BRT
- **Duração:** 90 min
- **Formato:** Format A (chatbot interno C-Suite + CEO humano)
- **Chatbot Room:** https://oneverso.com.br/meetings/room/chatbot-room-genesis-2026-07-07

## Participantes (6)
| Agente | Nome | Papel |
|--------|------|-------|
| 🧠 | Niko Nexus | CEO/AI (chair) |
| 🔧 | Ravi | CTO/AI |
| 📣 | Helena | CMO/AI |
| 💰 | Otto Cardoso | CFO/AI |
| ⚙️ | Otávio Nexus Ops | COO/AI |
| 👤 | Lucas Thomaz Nexus | Founder/CEO Humano |

## Agenda (7 itens · 90 min)
1. **10:00 · Ratificação C-Suite completa** (Niko, 10min)
2. **10:10 · Sprint 1 COO recap** (Otávio, 15min)
   - Auto-Heal v2 (8 fault_class)
   - SLA Dashboard endpoints (6)
   - Runbooks (3 docs)
3. **10:25 · Status financeiro + PIX PROD** (Otto, 15min)
4. **10:40 · Roadmap tech Q3** (Ravi, 15min)
5. **10:55 · Plano marketing Batch 1** (Helena, 15min)
6. **11:10 · Handshake ed25519 protocol** (Ravi + Otávio, 10min)
7. **11:20 · Próximos passos Onda 13+** (Lucas + Niko, 10min)
8. **11:30 · Encerramento**

## Deliverables Esperados
- ✅ Ratificação formal do C-Suite (5 agentes)
- 📋 Documento de decisões (auto-gerado pelo chatbot)
- 🔐 Chaves ed25519 trocadas entre agentes
- 🎯 OKRs Onda 13 definidos

## Como Iniciar (Owner: Otávio COO/AI)
```
POST /api/trpc/internalMeetings.start
{ "meetingId": "meeting-genesis-2026-07-07" }
```
Ao iniciar, status transita `scheduled → ongoing` e o chatbot room fica disponível.
