---
title: "Go-Live Checklist · AcademIA"
description: "Checklist operacional para iniciar a Academia nas próximas horas"
tags: [go-live, start, checklist, operacao, academia, lancamento]
categoria: operacao
prioridade: CRÍTICA
autor: "Equipo Nexus · COO/AI (Otavio)"
date: 2026-07-14
horizonte: "24-48h"
status: ativo
---

# 🚀 Go-Live Checklist · AcademIA

> Plano operacional para iniciar a AcademIA nas próximas horas. Tudo que precisa ser verificado, validado e publicado.

## 🎯 Objetivo

Colocar a AcademIA operacional e acessível, com:
- ✅ Pelo menos **3 módulos** publicados (piloto)
- ✅ Hub HTML renderizado e servível
- ✅ Personas Ive + Alencar validadas (voz + visual)
- ✅ Roteiros revisados e aprovados
- ✅ Admin funcionando (analytics + publish)
- ✅ Smoke test passando

## ⏰ Janela de Tempo

| Fase | Horário | Duração |
|------|---------|---------|
| **0 — Triagem** | T+0h | 30 min |
| **1 — Validação de Material** | T+0:30h | 1h |
| **2 — Render de Vídeos Piloto** | T+1:30h | 2-3h |
| **3 — Publicação do Hub** | T+4h | 1h |
| **4 — Admin + Analytics** | T+5h | 1h |
| **5 — Smoke Test + Go-Live** | T+6h | 1h |
| **6 — Comunicação** | T+7h | 30 min |

**Total: ~7-8h para go-live com 3 módulos publicados.**

## 📋 FASE 0 — Triagem (30 min)

### Diagnóstico do Estado Atual

```bash
# Conferir o que já está pronto
ls AcademIA/videos/roteiros/ | wc -l
ls AcademIA/videos/*.mp4 | wc -l  
ls AcademIA/hubs/
ls AcademIA/producao/catalog/
```

### Decisão de Escopo

**Cenário MÍNIMO (1 módulo):** Apenas `00-boas-vindas` publicado como piloto
**Cenário IDEAL (3 módulos):** `00` + `01` + `02` (Fundamental completo)
**Cenário COMPLETO (16 módulos):** Todos publicados

**Recomendação:** Começar com **3 módulos** (Fundamental: boas-vindas + ioaid + sho). Caminho de valor claro para o aluno.

### Validação de Recursos

- [ ] Personas Ive e Alencar têm voz clonada disponível
- [ ] Pipeline TTS está funcional (synthesize_speech)
- [ ] Pipeline image-to-video está funcional (gen_videos)
- [ ] Frontend tem rotas `/academia/*` configuradas
- [ ] Admin tem acesso a publish
- [ ] Banco tem schema `academia_lessons` válido

## 📋 FASE 1 — Validação de Material (1h)

### Roteiros (17 disponíveis)

Para cada módulo piloto, validar:

```markdown
- [ ] Roteiro tem 5-10 cenas
- [ ] Duração estimada: 6-10 min
- [ ] Cada cena tem **Visual** + **Persona: fala**
- [ ] Vocabulário alinhado com persona
- [ ] CTA (call to action) no final
- [ ] Sem promessas irreais
- [ ] Conformidade LGPD
```

**Módulos prioritários:**
1. `00-boas-vindas-academia-roteiro.md` (158 linhas — ✅)
2. `01-entendendo-ioaid-roteiro.md` (135 linhas — ✅)
3. `02-sho-sistema-imune-roteiro.md` (176 linhas — ✅)

### Personas (Ive + Alencar)

```bash
# Conferir que existem e estão íntegros
ls -la AcademIA/personas/ive/
ls -la AcademIA/personas/alencar/
ls -la AcademIA/personas/dupla/
```

**Crítico:**
- [ ] `sra_nexus_ive.png` (4354621 bytes) — INTACTO
- [ ] `voz_sra_nexus_ive.wav` (1570604 bytes) — INTACTO
- [ ] `dialogo_ive_alencar.wav` (3356204 bytes) — INTACTO
- [ ] `sir_nexus_alencar.md` (1.9 KB canonic) — INTACTO
- [ ] `official_voice.wav` Alencar — INTACTO

### Assets Visuais

- [ ] 14 thumbnails gerados (PNG + WebP)
- [ ] Slides (referências em `Generate Vídeos Nexus V/brand/personas/`)
- [ ] Capas dos ebooks (já renderizadas)

## 📋 FASE 2 — Render de Vídeos Piloto (2-3h)

### Pipeline de Render

Para cada módulo piloto:

```bash
# 1. Gerar áudio TTS por cena
synthesize_speech(
  text=cena.fala,
  voice_id="alencar" ou "ive",
  output_file_path="academia/audio/modulo-cena.wav"
)

# 2. Gerar visual cena a cena
gen_videos(
  prompt=descricao_visual,
  input_image_path=slide_referencia,
  output_file_path="academia/video/modulo-cena.mp4",
  duration=6 ou 10
)

# 3. Combinar (FFmpeg)
ffmpeg -i audio.wav -i video.mp4 -c:v copy -c:a aac output.mp4
```

### 3 Módulos x 6-8 cenas = ~21 vídeos a render

**Tempo estimado:**
- Áudio: 21 × 30s = 10 min
- Vídeo: 21 × 2 min = 42 min (paralelo)
- Combinação: 21 × 1 min = 21 min

**Total: ~1h15 min (com paralelização)**

### Recursos

- [ ] API key OpenAI/Anthropic funcional
- [ ] Acesso a `gen_videos` serverless endpoint
- [ ] Storage para vídeos (S3 / local)
- [ ] CDN para servir (ou nginx)

## 📋 FASE 3 — Publicação do Hub (1h)

### Verificar Hubs HTML

```bash
ls AcademIA/hubs/
# Esperado: index.html, apostilas.html, cursos.html (?), playbooks.html, etc
```

**Status atual:**
- `apostilas.html` ✅
- `index.html` ✅
- `lab.html` ✅
- `lib.html` ✅
- `playbooks.html` ✅
- `tutoriais.html` ✅
- `webinars.html` ✅

**Falta?** Hub principal de cursos/vídeos:
- [ ] `cursos.html` ou `aulas.html` (criar se não existir)
- [ ] `trilhas.html` (Fundamental, Agente, Master, Elite)
- [ ] `player.html` (template para assistir vídeo)

### Atualizar INDEX

- [ ] INDEX.md reflete status "🟢 GO-LIVE" vs "🚧 Em produção"
- [ ] Adicionar link para "Assistir Academia" no topo
- [ ] Métricas atualizadas (módulos publicados, horas de conteúdo, etc)

## 📋 FASE 4 — Admin + Analytics (1h)

### Admin Academia

- [ ] `frontend/src/pages/AdminAcademia.tsx` funcional
- [ ] Rota `/admin/academia` acessível
- [ ] Lista de módulos com status (publicado, draft, em render)
- [ ] Botão de "publicar" funcional
- [ ] Botão de "despublicar" funcional

### Analytics

- [ ] `frontend/src/pages/AdminAcademiaAnalytics.tsx` funcional
- [ ] Rota `/admin/academia/analytics` acessível
- [ ] Mostra: views, tempo médio, conclusão, NPS
- [ ] Conectado a banco `academia_lessons`

### Schema DB

- [ ] Tabela `academia_lessons` existe
- [ ] Tabela `academia_progress` existe
- [ ] Migrações aplicadas
- [ ] Seed data com 3 módulos piloto

## 📋 FASE 5 — Smoke Test + Go-Live (1h)

### Checklist de Smoke Test

```bash
# 1. Frontend carrega
curl -I https://oneverso.com.br/academia
# Esperado: 200 OK

# 2. Hubs renderizam
curl -I https://oneverso.com.br/academia/hubs/index.html
# Esperado: 200 OK

# 3. Vídeos servem (CDN)
curl -I https://oneverso.com.br/academia/videos/video-00-boas-vindas.mp4
# Esperado: 200 OK, Content-Type: video/mp4

# 4. API de progresso
curl https://api.oneverso.com.br/academia/progress
# Esperado: 200, JSON válido

# 5. Admin acessível
curl https://oneverso.com.br/admin/academia
# Esperado: 200 (ou 401/302 se precisa auth)
```

### Cenários de Teste

- [ ] **Visitante anônimo:** consegue ver hub + 1º vídeo
- [ ] **Login com email:** consegue salvar progresso
- [ ] **Admin:** consegue publicar/despublicar
- [ ] **Mobile:** layout responsivo funciona
- [ ] **Performance:** LCP < 2.5s

### Load Test (opcional)

- [ ] 100 usuários simultâneos assistindo
- [ ] CDN aguenta tráfego
- [ ] DB não trava em writes

## 📋 FASE 6 — Comunicação (30 min)

### Canais

- [ ] Email para base de alunos (template pronto em `Lab-Nexus/templates/email/`)
- [ ] Post no LinkedIn / Instagram
- [ ] Update em `RESUMO_EXECUTIVO.md` + `CHANGELOG.md`
- [ ] Slack #csuite (interno)
- [ ] Notificação para C-Suite (Ravi, Helena, Otto, Otavio)

### Mensagem Padrão

```
🎓 AcademIA está no ar!

Agora você pode assistir aos primeiros módulos da nossa
academia de Agentes IA + Marketing de Afiliação.

🎬 Módulos disponíveis:
- 00 · Boas-vindas (Ive + Alencar)
- 01 · Entendendo o IOAID
- 02 · Sistema SHO

👉 Acesse: https://oneverso.com.br/academia

Feedback? Responder este email ou abrir ticket.
```

## 🚨 Bloqueios Críticos (Stop-the-world)

Se algum desses falhar, **NÃO fazer go-live** até resolver:

1. ❌ **Personas corrompidas** (voz ou imagem faltando)
2. ❌ **Vídeo não renderiza** (pipeline quebrado)
3. ❌ **Hub não carrega** (frontend quebrado)
4. ❌ **Auth não funciona** (usuários não conseguem logar)
5. ❌ **LGPD/Compliance pendente** (termos não publicados)

## 📊 KPIs de Sucesso (pós go-live)

| Métrica | Meta 24h | Meta 7 dias | Meta 30 dias |
|---------|----------|-------------|--------------|
| Visitantes únicos | 100 | 500 | 2000 |
| Módulos iniciados | 50 | 300 | 1500 |
| Conclusão módulo 1 | 30% | 50% | 60% |
| NPS do curso | > 7 | > 8 | > 8 |
| Inscrições para próximo | 10 | 50 | 200 |

## 🔄 Pós Go-Live

### Primeiras 24h
- Monitor ativo (C-Suite online)
- Resposta a feedback em < 2h
- Métricas enviadas a cada 4h

### Primeira Semana
- Coletar feedback qualitativo
- Identificar gargalos (carregamento, qualidade vídeo)
- Ajustar copy/títulos baseado em dados
- Render próximo módulo (a definir baseado em demanda)

### Primeiro Mês
- Adicionar 2-3 módulos novos
- Implementar gamificação (badges, progresso)
- Lançar primeira certificação formal
- Avaliar ROI do esforço

## 📚 Materiais Relacionados

- `producao/pipeline/PIPELINE_PRODUCAO.md` — pipeline completo
- `producao/catalog/CATALOGO_MODULOS.md` — status por módulo
- `governanca/C-SUITE-AI.md` — quem decide o quê
- `playbooks/PB-LANCAMENTO-lancamento-7-dias.md` — playbook de lançamento
- `webinars/WB-2026-08-financeiro-ia.md` — case do Otto
- `Lab-Nexus/prompts/governanca/02-postmortem-incidente.md` — se algo falhar

## 🎯 Resumo de 1 Linha

> "Garantir que 3 módulos da trilha Fundamental estão publicados, hub renderiza, admin funciona, e visitante consegue assistir do zero ao fim — em 7-8h."

---

*AcademIA · Go-Live Checklist · 2026*