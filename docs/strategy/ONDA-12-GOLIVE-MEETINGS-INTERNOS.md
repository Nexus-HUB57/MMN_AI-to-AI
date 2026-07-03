# ONDA 12 · GO LIVE · MEETINGS INTERNOS
**Data:** 2026-07-03 19:44 BRT  
**Diretiva CEO:** *"Go Live"* — resposta à Onda 11 (correções honestas)  
**Episódio Niko:** id=21 (`onda-12-golive-meetings-internos-2026-07-03`)

## Contexto
CEO aprovou correções brutais da Onda 11 e emitiu Go Live. Onda 12 entrega a única pendência real declarada: **Meetings Chatbot Interno + Jivo** (item 7 lista CEO).

## Entregas Onda 12

### F1 · Tabela `internal_meetings` (nova)
Schema completo para reuniões internas:
- `meeting_type`: 'c-suite' | 'affiliate-support' | 'training'
- `chatbot_room_id`: URL única para sala do chatbot
- `jivo_channel_id`: canal Jivo (para affiliate-support)
- `participants` + `agenda` como JSONB

### F2 · `internalMeetingsRouter` (novo)
4 procedures via tRPC:
- `list` (protectedProcedure)
- `create` (adminProcedure) — automatiza chatbot room + Jivo channel
- `start` (adminProcedure) — transição scheduled → ongoing
- `stats` (protectedProcedure)

### F3 · Meeting Genesis 07/07 registrado
- **ID:** `meeting-genesis-2026-07-07`
- **Data:** 2026-07-07 10:00 BRT · 90 min
- **Chatbot Room:** `chatbot-room-genesis-2026-07-07`
- **Jivo Channel:** `jivo-channel-genesis`
- **Participantes (6):** Niko, Ravi, Helena, Otto, Otávio, Lucas
- **Agenda (7 tópicos):**
  1. Ratificação C-Suite completa (Niko, 10min)
  2. Sprint 1 COO recap (Otávio, 15min)
  3. Status financeiro + PIX PROD (Otto, 15min)
  4. Roadmap tech Q3 (Ravi, 15min)
  5. Plano marketing Batch 1 (Helena, 15min)
  6. Handshake ed25519 protocol (Ravi + Otávio, 10min)
  7. Próximos passos Onda 13+ (Lucas + Niko, 10min)

### F4 · Registro no appRouter
`internalMeetings: internalMeetingsRouter` adicionado após `materials`.

## Deploy

| Item | Valor |
|------|-------|
| Backend build | `dist/index.js` 1.4 MB (esbuild 112ms) |
| PM2 reload | OK (mmn-api id 9,10) |
| `internalMeetings.stats` | HTTP 401 (existe, auth required) |
| `admin.getSettings` | HTTP 401 (Onda 11 persistente) |
| `materials.list` | HTTP 401 (Onda 11 persistente) |
| Health | ok=true uptime OK |
| Rotas admin | 11/11 HTTP 200 |

## Métricas DB FINAIS

| Métrica | Valor |
|---------|-------|
| users_reais | 11 |
| affiliates_reais | 11 |
| founders_batch1 | 10 |
| **csuite_ativos** | **5** ✅ |
| **judges_federados** | **5** ✅ (COO incluído) |
| materials_reais | 6 |
| commissions_reais | 0 |
| aulas_publicadas | 54 |
| **meetings_internos** | **1** ✅ (Meeting Genesis) |
| episodios_ondas | 13 |

## Aprendizado Registrado (Niko id=21)
> Feature nova requer:
> - Nova tabela DB (`internal_meetings`)
> - Novo router com todas as procedures (list/create/start/stats)
> - Registro no `appRouter` como sub-router
> - Migration para replicabilidade

## Próximos Passos (Onda 13+)

### Curto prazo
1. **Meeting Genesis 07/07** — realizar co-copilotos Format A
2. **Frontend widget** `/meetings/room/{id}` (renderiza chatbot C-Suite)
3. **Jivo integration** frontend widget para afiliados
4. **AdminMeetings.tsx** — adicionar tab "Reuniões Internas" listando `internal_meetings`

### Médio prazo
5. Teste PIX R$1 produção (Mercado Pago PROD)
6. Onboarding fundadores Batch 1 (Jeane, Amanda, Lara, Lais, Beatriz, Luiz, Alexsander, Gabriel, Gisele)
7. Handshake ed25519 entre agentes C-Suite

### Configuração pendente (CEO)
- Env vars no Render: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `HOTMART_CLIENT_ID`, `SHOPEE_AFFILIATE_ID`
- Limpar cache do navegador (Ctrl+Shift+R)
