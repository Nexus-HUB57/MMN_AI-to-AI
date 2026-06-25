# 📋 PACOTE EXECUTIVO FINAL DE GO-LIVE
## OneVerso / Nexus Affil'IA'te — Versão Operação Real

- **Documento de referência**: GL-FINAL/2026-06-23
- **Data/Hora de emissão**: 2026-06-23 22:07 UTC
- **Responsável técnico**: Time de Engenharia OneVerso
- **Status do documento**: Pronto para assinatura executiva
- **Versão de produção avaliada**: backend `1.0.0` / commit `5855f8d` / bundle `index-DcIa1Eu6.js`
- **Baseline oficial de rollback**: `BASELINE_GOLIVE_20260623T212440Z`

---

## 1. SMOKE TEST AUTENTICADO PONTA A PONTA

### 1.1 Resultado consolidado (20/20 itens automatizáveis ✅)

| # | Camada | Item testado | Resultado | Status |
|---|---|---|---|:---:|
| 1 | Infra | `GET /api/health` | `ok=true`, `mode=full`, `version=1.0.0` | ✅ |
| 2 | Infra | PM2 — `mmn-api` e workers | 6/6 online (fork mode) | ✅ |
| 3 | Conteúdo | `whats-new/has-recent?hours=24` | `hasRecent=true`, `recentCount=39` | ✅ |
| 4 | Conteúdo | `search?q=ioaid` | 2 itens com vídeo/HTML/PDF | ✅ |
| 5 | Conteúdo | `stats/popular?days=30` | `fund-00` líder (4 views) | ✅ |
| 6 | Trilha | `lesson/fund-00/next-suggested` | Retorna `fund-01` | ✅ |
| 7 | Progresso | `lesson-progress/me?userId=1` | `fund-00` 16%, 42/261s | ✅ |
| 8 | Progresso | `lesson-progress/by-section` | 1 lesson, 16% | ✅ |
| 9 | Conteúdo | `whats-new?limit=5` | ws-03..wb-2026-02 | ✅ |
| 10 | UI pública | `/login` | Layout limpo, sem tour intrusivo | ✅ |
| 11 | UI pública | `/dashboard` sem sessão | Bloqueio educado | ✅ |
| 12 | UI pública | `/admin/...` sem permissão | Sem stacktrace | ✅ |
| 13 | Proteção | `/api/v1/academia/search` sem token | HTTP 401 | ✅ |
| 14 | Proteção | `/api/admin/cleanup-views` sem token | HTTP 401 | ✅ |
| 15 | Proteção | `/api/admin/translate-bulk` sem token | HTTP 401 | ✅ |
| 16 | UX | Aula `fund-00` — player + progresso | `watchedSeconds=42` registrado | ✅ |
| 17 | UX | Trilha `fund-00 → fund-01` | Sugestão correta | ✅ |
| 18 | Runtime | Worktree pós-saneamento | 0 `.bak` (94 arquivados) | ✅ |
| 19 | Runtime | Baseline oficial | `BASELINE_GOLIVE_20260623T212440Z` | ✅ |
| 20 | Runtime | Runbooks `daily-open` e `rollback` | STATUS VERDE no dry-run | ✅ |

### 1.2 Lacuna remanescente — smoke autenticado manual (L1–L8)

| Etapa | O que validar | Resultado esperado |
|---|---|---|
| L1 | Login afiliado (credencial real) | Sessão criada, redirect ao dashboard |
| L2 | Dashboard autenticado | Carrega métricas e atalhos |
| L3 | Abrir uma aula em `/academia` | Player toca, progresso sobe |
| L4 | Retomada (sair e voltar) | Volta no `lastPosition` |
| L5 | Admin Analytics (com permissão) | Mostra ranking e KPIs |
| L6 | Marketplace (compra sandbox) | Pedido entra em `marketplace_orders` |
| L7 | Biblioteca de usuário | Item entra em `marketplace_user_library` |
| L8 | Logout | Sessão encerrada, 401 nas protegidas |

**Veredito**: aprovado em 20/20 automatizáveis; resta apenas L1–L8 com credencial real em D0.

---

## 2. TERMO DE DECISÃO DE PRONTIDÃO

### DECISÃO

**APROVADO PARA OPERAÇÃO REAL ASSISTIDA, COM PROMOÇÃO CONDICIONADA A FULLTIME APÓS D+5 VERDE + L1–L8.**

| Modalidade | Decisão | Vigência |
|---|---|---|
| Operação assistida em produção | ✅ APROVADA | A partir de D0 |
| Operação fulltime irrestrita | ⏸️ CONDICIONADA | Liberada em D+5 se critérios cumpridos |
| Rollback imediato disponível | ✅ SIM | `rollback.sh 20260623T212440Z` |

### FUNDAMENTAÇÃO

1. Backend público saudável (`ok=true`, `mode=full`, `1.0.0`).
2. 54 aulas catalogadas, 39 itens recentes, busca completa.
3. Trilha funcional com progresso real persistido.
4. Camada de proteção 401 em rotas admin.
5. Baseline e snapshot de rollback criados e testados.
6. Runbooks publicados em `ops/runbooks/`.
7. Worktree saneado (94 `.bak` arquivados).
8. PM2 estável (6 processos).

### POR QUE NÃO LIBERAR FULLTIME HOJE

- Falta janela mínima (3–5 dias) de operação real observada.
- Smoke L1–L8 com credencial real ainda não executado.
- Sem 5 dias consecutivos de `daily-open` verde com tráfego real.

### ASSINATURAS

| Papel | Nome | Assinatura | Data |
|---|---|---|---|
| Responsável técnico | _____________________ | _____________________ | ___/___/2026 |
| Responsável operacional | _____________________ | _____________________ | ___/___/2026 |
| Owner da plataforma | _____________________ | _____________________ | ___/___/2026 |

---

## 3. CHECKLIST D0 / D1 / D5

### 3.1 D0 — DIA DA ABERTURA ASSISTIDA

**Pré-abertura (até 30 min antes)**
- [ ] `daily-open.sh` → STATUS VERDE
- [ ] `/api/health` → `ok=true`, `mode=full`
- [ ] PM2 → 6/6 online
- [ ] Bundle ativo `index-DcIa1Eu6.js`
- [ ] Baseline acessível
- [ ] Plantão definido

**Smoke L1–L8 manual**
- [ ] L1 Login afiliado
- [ ] L2 Dashboard
- [ ] L3 Abrir aula
- [ ] L4 Retomada
- [ ] L5 Admin Analytics
- [ ] L6 Marketplace
- [ ] L7 Biblioteca
- [ ] L8 Logout

**Durante o D0**
- [ ] Health a cada 30 min
- [ ] PM2 a cada 1h
- [ ] Sanity `whats-new` / `popular` a cada 2h
- [ ] Acompanhar `lesson-progress`
- [ ] Diário operacional aberto

### 3.2 D1 — ESTABILIZAÇÃO
- [ ] `daily-open.sh` → VERDE
- [ ] Logs PM2 sem crashes
- [ ] Error rate < 1%
- [ ] Crescimento orgânico de views/progresso/pedidos
- [ ] Smoke leve L1–L8
- [ ] Daily report

### 3.3 D5 — DECISÃO DE FULLTIME

**Obrigatórios cumulativos**
- [ ] 5 dias úteis com `daily-open` VERDE
- [ ] 0 incidentes críticos abertos
- [ ] L1–L8 manual ≥ 1 ciclo aprovado
- [ ] PM2 sem reinício anormal por 72h
- [ ] Marketplace ≥ 1 pedido real OK
- [ ] Biblioteca ≥ 1 item real OK
- [ ] Catálogo consistente
- [ ] Rollback funcional
- [ ] 401 mantido nas protegidas
- [ ] Tráfego real em ≥ 3 dias

**Saída**
- 10/10 + ≥4/6 qualitativos → **PROMOVER A FULLTIME**
- 10/10 + <4/6 → **FULLTIME PARCIAL**
- <10/10 → **ESTENDER ASSISTIDA +3 DIAS**

---

## 4. MATRIZ FINAL DE RISCO

| Área | Risco | Impacto | Prob. | Sev. | Mitigação | Responsável |
|---|---|:---:|:---:|:---:|---|---|
| Backend API | Indisponibilidade `mmn-api` | 5 | 2 | 10 | PM2 auto-restart + rollback baseline | Eng. Backend |
| Autenticação | Falha L1–L8 | 5 | 2 | 10 | Smoke manual D0 + rollback | Eng. Backend / Owner |
| Banco PostgreSQL | Perda de dados | 5 | 1 | 5 | Backup diário + monitoramento disco | Infra/DBA |
| Marketplace/Billing | Pedido não vira item | 4 | 2 | 8 | Smoke L6–L7 + reconciliação | Eng. Backend / Comercial |
| Conteúdo Academ'IA | 404 em vídeo/PDF/HTML | 3 | 2 | 6 | Mirror oficial + monitorar `whats-new` | Eng. Conteúdo |
| Progresso/Trilha | Não persiste | 4 | 1 | 4 | Endpoint validado + alerta diário | Eng. Backend |
| Admin/Permissões | Vazamento de rota | 5 | 1 | 5 | Guards 401 ativos | Eng. Backend |
| UX | Tour intrusivo | 2 | 2 | 4 | Tour pós-login | Eng. Frontend |
| Runtime/Memória | Heap alto (90%) | 4 | 3 | **12** | Restart programado + monitorar | Infra |
| Latência HTTP | p95 picos (2197ms) | 3 | 3 | 9 | Investigar rota + revisar chunking | Eng. Full-stack |
| Repositório/Deploy | Worktree poluído | 3 | 2 | 6 | Saneamento aplicado + baseline | Eng. Backend |
| Service Worker | Cache velho | 3 | 2 | 6 | Validar `sw.js` + bump versão | Eng. Frontend |
| Telemetria | Sem alertas proativos | 3 | 3 | 9 | Alertas mínimos em D+3 | Infra |
| Documentação | Time sem playbook | 3 | 2 | 6 | Runbooks publicados | Owner |
| LGPD/Compliance | Dado em log | 4 | 1 | 4 | Revisão de logs D+7 | Owner / Jurídico |

**Severidade**: 1–4 baixo · 5–9 médio · 10–14 alto · 15–25 crítico

---

## 5. PLANO DE ABERTURA, MONITORAMENTO E ROLLBACK

### 5.1 Rotina diária

```
08:00 → daily-open.sh
08:05 → confirmar STATUS VERDE
08:10 → pm2 list (6/6 online)
08:15 → curl /api/health
08:20 → abrir diário operacional
```

### 5.2 Monitoramento

| Janela | Ação |
|---|---|
| 30 min (D0–D2) | Health check |
| 1h | PM2 status |
| 2h | Sanity `whats-new` |
| 4h | Tráfego real (`lesson-progress`, `popular`) |
| Fechamento | `daily-open` de fechamento |

### 5.3 Gatilhos de rollback (automático e imediato)

- Health ≠ 200 por >5 min
- `mmn-api` >3 restarts em 10 min
- Falha de login generalizada (>50%)
- Erro marketplace >10%
- 404 em massa em conteúdo
- Vazamento de rota admin (200 sem token)

### 5.4 Procedimento

```bash
sudo /var/www/oneverso/runbooks/rollback.sh 20260623T212440Z
```

Tempo alvo: < 5 min.

---

## 6. CRITÉRIOS DE PROMOÇÃO FULLTIME

### Obrigatórios (10/10)

1. 5 dias úteis com `daily-open` VERDE
2. 0 incidentes críticos
3. L1–L8 manual ≥ 1 ciclo
4. PM2 estável ≥ 72h
5. Marketplace ≥ 1 pedido real OK
6. Biblioteca ≥ 1 item real OK
7. Catálogo consistente em `whats-new`, `popular`, `search`
8. Rollback funcional + baseline preservado
9. 401 mantido nas rotas protegidas
10. Tráfego real ≥ 3 dias

### Qualitativos (≥ 4/6)

- Telemetria mínima ativa
- Alertas proativos
- Plano de incidentes treinado
- Documentação de release atualizada
- Equipe ciente do procedimento
- Backup de banco validado ≤ 7 dias

---

## 7. ROADMAP PÓS-FULLTIME

**0–7 dias**: telemetria/alertas, playbook de incidentes, rotina diária consolidada, 1ª revisão de UX.
**7–30 dias**: otimização bundle/SW, endurecimento marketplace, telemetria de produto, governança de release.
**30–90 dias**: segurança/LGPD, SEO, otimização frontend, suporte ao usuário, plano de escala.

---

## 8. ENTREGÁVEIS

| Documento | Localização |
|---|---|
| Baseline oficial | `ops/baselines/BASELINE_GOLIVE_20260623T212440Z.md` |
| Snapshot rollback | `/var/www/oneverso/baselines/snapshots/20260623T212440Z/` |
| Runbook abertura | `ops/runbooks/daily-open.sh` |
| Runbook rollback | `ops/runbooks/rollback.sh` |
| Termo de decisão | `ops/golive/DECISAO_FINAL_GOLIVE_20260623.md` |
| Checklist D0/D1/D5 | seção 3 deste documento |
| Matriz de risco | seção 4 deste documento |
| Plano abertura/monitoramento/rollback | seção 5 deste documento |
| Critérios fulltime | seção 6 deste documento |

---

## 9. VEREDITO FINAL

**A plataforma OneVerso / Nexus Affil'IA'te está OPERACIONALMENTE PRONTA para entrar em produção real em modo assistido a partir do próximo D0.**

**A promoção para fulltime irrestrito é APROVADA EM PRINCÍPIO**, condicionada ao cumprimento dos critérios da seção 6 em D+5.

**Recomendação final**: assinar este termo, executar D0 amanhã pela manhã com `daily-open.sh`, executar smoke L1–L8 manual nas primeiras horas e seguir o monitoramento da seção 5 até decisão de D+5.

---

**Documento encerrado em**: 2026-06-23 22:07 UTC
**Próxima revisão prevista**: D+5
