# 🎬 Meeting Genesis · 07/07/2026 · Formato A

**Data**: 07/07/2026 (segunda-feira · daqui a 4 dias)
**Meeting code**: `meeting-genesis-2026`
**Owner**: Lucas Thomaz + Niko + Otávio (copiloto)
**Formato**: A — Chat silencioso, sem voz/vídeo do AI

## 🎯 Objetivo

Primeira reunião oficial C-level do Nexus Affil'IA'te com o Sócio Humano. Sem afiliados externos ainda. Reunião interna estratégica.

## 👥 Participantes

- **Humano**: Lucas Thomaz Nexus (Sócio Humano · Presidente)
- **C-Suite AI**:
  - Niko Nexus (CEO/AI) — condução
  - Otávio Nexus Ops (COO/AI) — copiloto operacional (NOVO)
  - Otto Cardoso (CFO/AI) — snapshot financeiro
  - Ravi (CTO/AI) — status técnico
  - Helena (CMO/AI) — status marketing

## 📋 Pauta (9 itens)

1. **Abertura** (Lucas) — 5min
2. **Snapshot Operacional** (Otávio COO) — 10min
   - Uptime backend/frontend
   - Auto-heal executions 7 dias
   - SLA endpoints críticos
   - Incidentes resolvidos
3. **Snapshot Financeiro** (Otto CFO) — 10min
   - GMV real (2 orders R$11,98)
   - Unit economics projeção
   - Cashflow 90 dias
4. **Status Técnico** (Ravi CTO) — 10min
   - Migrations recentes (0013 csuite_agents)
   - Deploy blue-green
   - RAG ingestion
5. **Status Marketing** (Helena CMO) — 10min
   - Marketplace 355 ebooks
   - Skill Marketplace 5 listings
   - Publishers pipeline
6. **Estratégia CEO** (Niko) — 15min
   - Roadmap Ondas 8-10
   - Batch 1: 9 fundadores restantes
   - Autonomy Score target 4.0/5
7. **Decisões pendentes** (Lucas) — 15min
   - Aprovar/reprovar propostas em governance_actions status=review
   - Ratificar sprint COO
   - Mercado Pago PROD? (após teste PIX R$1)
8. **Q&A cruzado** — 10min
9. **Encerramento + próximos passos** — 5min

**Duração total**: 90min

## 🎯 Deliverables da Reunião

- Ata registrada em `meetings` table (id 1)
- Governance actions ratificadas
- Roadmap Onda 8 aprovado
- Batch 1 lista finalizada (nome+email 9 fundadores)

## 🤖 Kit Copiloto (Formato A)

**Como funciona**:
- Lucas conduz reunião em voz alta (sozinho na sala ou com equipe humana)
- Niko + Otávio + demais C-level respondem via **chat silencioso** em janela paralela
- Cada AI tem context próprio + acesso ao DB em tempo real
- Lucas pergunta → AI responde no chat → Lucas lê + fala

**Ferramentas necessárias**:
- Notebook Lucas com 2 monitores
- Monitor 1: apresentação/planilha
- Monitor 2: chats Genspark (Niko, Otávio, Otto, Ravi, Helena)

**Comandos rápidos** (Lucas digita):
- `/status` → Otávio responde com snapshot operacional
- `/cfo` → Otto envia financial snapshot
- `/tech` → Ravi envia deploy status
- `/mkt` → Helena envia catalog + skills
- `/decision <topic>` → Niko orquestra decisão C-level

## 📊 Preparação Pré-Meeting (executada por Otávio)

- [ ] Snapshot SLA às 08h do dia 07/07
- [ ] Snapshot CFO Otto (persistDailySnapshot)
- [ ] Governance actions status=review listadas
- [ ] Autonomy Score composite atual
- [ ] Founders batch status
- [ ] Auto-heal 7d stats
- [ ] Marketplace GMV real

## 🔒 Governança

Reunião não altera estrutura sozinha — todas as decisões que envolvem `payout`, `commissions matrix`, `agent hire-fire`, `custody keys` requerem **ratificação escrita de Lucas** no chat.

## ✅ Após a Reunião

- Otávio persiste ata em `meetings.notes`
- Niko cria episódios `niko_operational_memory` para cada decisão
- Otto atualiza `cfo_kpi_history`
- Governance actions são executadas em Onda 8
