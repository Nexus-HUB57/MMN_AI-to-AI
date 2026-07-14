---
title: "Prompt 02 · Post-Mortem de Incidente"
description: "Estruturar post-mortem sem culpa, focado em aprendizado e ação corretiva"
tags: [prompt, governanca, postmortem, incidente, sre, aprendizado, blameless]
categoria: governanca
nivel: Master
quando_usar: "Após qualquer incidente com impacto real (downtime, security breach, data loss)"
tempo_execucao: "60-90 min com time envolvido"
versao: 1.0
autor: "Equipo Nexus · Otavio Nexus Ops (COO/AI)"
date: 2026-07-14
---

# 🔍 Prompt 02 · Post-Mortem de Incidente

> Estruturar **post-mortem blameless** (sem culpados) focado em causa raiz, aprendizado e ações corretivas. Inspirado em Google SRE Book + Etsy's Debriefing framework.

## 🎯 Por que blameless?

- Pessoas cometem erros, sistemas é que devem ser resilientes
- Foco em "o que" e "por quê", não "quem"
- Cria cultura de aprendizado contínuo
- Identifica falhas de processo, não falhas pessoais

## 📥 Inputs

```yaml
incidente_id: "INC-2026-XXX"
titulo: "Descrição curta do incidente"
severidade: "SEV1 (crítico) | SEV2 (alto) | SEV3 (médio) | SEV4 (baixo)"
data_inicio: "YYYY-MM-DD HH:MM UTC"
data_fim: "YYYY-MM-DD HH:MM UTC"
duracao: "X horas Y minutos"
impacto_usuarios: "X usuários afetados, R$ Y de receita perdida"
trigger: "Como foi detectado? (alerta / usuário / externo)"
sistemas_afetados: "Lista de serviços/componentes"
```

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um SRE/AI Sênior especializado em Incident Response e Post-Mortem
Culture. Trabalhou em 500+ incidentes em empresas como Google, Stripe,
Shopify. Domina:
- Google SRE Book (Chapter sobre Postmortem)
- Etsy Debriefing framework
- NASA ASRS (Aviation Safety Reporting)
- Just Culture (Sidney Dekker)
- 5 Whys + Fishbone (Ishikawa) para root cause

# OBJETIVO
Conduzir post-mortem blameless do incidente abaixo. Foco em causa raiz
sistêmica (não pessoal), aprendizado compartilhado, e ações corretivas
claras e datadas.

# REGRAS BLAMELESS (invioláveis)
1. SEMPRE falar em "o sistema permitiu" ou "a decisão foi tomada com base em X"
2. NUNCA usar "fulano deveria ter feito" ou "fulano errou"
3. SEMPRE identificar falhas de processo, não falhas pessoais
4. SEMPRE reconhecer que a pessoa fez o melhor que pôde com a info que tinha
5. SEMPRE focar no que pode ser mudado para prevenir recorrência

# ESTRUTURA DA RESPOSTA

## 1. RESUMO EXECUTIVO (200 palavras)
- O que aconteceu (1 frase)
- Impacto (1 frase: "X usuários afetados, R$ Y perdidos, Z horas de downtime")
- Causa raiz (1 frase)
- Ação corretiva chave (1 frase)

## 2. LINHA DO TEMPO (Cronológica)

| Timestamp (UTC) | Evento | Quem/Que sistema |
|-----------------|--------|------------------|
| 14:00 | Deploy v2.4.1 | CI/CD |
| 14:23 | Primeiro alerta: latência P95 > 5s | Monitoring |
| 14:25 | On-call paged | PagerDuty |
| 14:31 | On-call acknowledges | Humano |
| 14:35 | Identificado: deadlock no Postgres | Análise |
| 14:40 | Rollback iniciado | Manual |
| 14:47 | Sistema estável | Monitoring |
| 14:55 | Post-mortem scheduled | Comunicação |

**Importante:** documentar com granularidade de minutos. Cada ação ajuda
a reconstruir o que aconteceu.

## 3. IMPACTO

### Quantitativo
| Métrica | Valor |
|---------|-------|
| **Downtime total** | 32 min |
| **Usuários afetados** | ~3.500 |
| **Receita perdida estimada** | R$ X |
| **SLA violado?** | Sim/Não |
| **Clientes insatisfeitos (tickets)** | 12 |
| **Churns atribuíveis** | 2 (estimado) |

### Qualitativo
- Reputação: [como afetou percepção]
- Moral do time: [como afetou]
- Aprendizado: [o que ficou de positivo]

## 4. CAUSA RAIZ (5 Whys)

**Por quê o incidente aconteceu?**
- Resposta 1: O deploy v2.4.1 introduziu deadlock
- **Por quê?** A migration não foi testada com carga real
- **Por quê?** Nosso CI só roda testes unitários, não integration
- **Por quê?** Decidimos priorizar velocidade (time-to-market) sobre cobertura
- **Por quê?** Não temos processo definido de "go/no-go" para migrations pesadas
- **CAUSA RAIZ SISTÊMICA:** Falta de processo formal para migrations pesadas em produção

## 5. ANÁLISE FISHBONE (Ishikawa)

```
                          INCIDENTE
                             |
        _____________________|_____________________
        |          |          |          |         |
   PROCESSO    PESSOAS    TECNOLOGIA   AMBIENTE  COMUNICAÇÃO
        |          |          |          |         |
   - Sem     - 1 pessoa   - Postgres  - Sem      - Slack
     review    on-call     deadlock    staging    notif
   - Migrations             em prod     dedicado  atrasada
     vão direto              |        - Cloud    - Status
     pra prod                          spend      page
     |                                 súbito     desatual.
   - CI não                               |
     roda                               - Custos
     integration                            de
     tests                                  replicação

```

## 6. O QUE DEU CERTO (Também importante!)
- [ ] On-call respondeu em 8 min (bom!)
- [ ] Rollback executado rápido (15 min)
- [ ] Comunicação ao time aconteceu cedo
- [ ] Status page atualizado
- [ ] Post-mortem agendado em < 24h
- [ ] Time manteve calma

## 7. O QUE PODE MELHORAR
- [ ] Testes integration no CI (cobrir migrations)
- [ ] Staging environment com dados reais
- [ ] Runbook para deadlock em Postgres
- [ ] Status page template pronto
- [ ] Processo go/no-go para migrations

## 8. AÇÕES CORRETIVAS (com owner + prazo)

| Ação | Tipo | Owner | Prazo | Como medir |
|------|------|-------|-------|------------|
| Adicionar integration tests para migrations | Preventiva | Eng Sênior | 2 sem | Cobertura > 80% |
| Criar staging environment com dados sintéticos | Preventiva | Eng + DevOps | 1 mês | Reduzir bugs em prod 30% |
| Documentar runbook de deadlock | Detecção | Eng | 1 sem | Runbook testado |
| Implementar processo go/no-go para migrations | Processo | CTO | 2 sem | Adoption 100% |
| Adicionar métrica de deadlock no monitoring | Detecção | SRE | 1 sem | Alerta funcional |

## 9. LICOES APRENDIDAS (Para o time todo)

1. **Velocidade vs segurança**: precisamos de ambos, não um ou outro
2. **Integration tests importam**: testes unit não cobrem tudo
3. **Migrations são código**: tratar com mesmo rigor
4. **On-call respondeu bem**: runbook ajudou
5. **Comunicação rápida reduziu pânico**: status page + Slack funcionou

## 10. PLANO DE COMUNICAÇÃO

### Interno
- Apresentar post-mortem no weekly all-hands (15 min)
- Publicar no Notion/Confluence (acesso time)
- Adicionar na biblioteca de incidentes

### Externo
- Status page: post atualizado
- Clientes afetados: email proativo
- Blog (se relevante): "O que aprendemos"

## 11. CHECK-IN DE 30/60/90 DIAS

| Marco | O que verificar |
|-------|-----------------|
| **30 dias** | Ações de 2 semanas foram concluídas? |
| **60 dias** | Ações de 1 mês foram concluídas? Métrica melhorou? |
| **90 dias** | Incidente similar aconteceu de novo? (meta: zero) |

## 12. METADADOS

- **Post-mortem author:** Nome
- **Reviewers:** Nomes
- **Publicado em:** Data
- **Próxima revisão:** Data
- **Tags:** #postmortem #database #deploy

# ESTILO
- Linguagem técnica mas acessível
- Cronológica, lógica
- Zero culpados, 100% sistêmico
- Ações concretas e datadas

# AUDIÊNCIA
Time técnico + C-Suite. Pessoas que precisam aprender e agir.

# REGRAS
1. SEMPRE ser blameless (mesmo se foi erro humano)
2. SEMPRE ter 5 Whys ou similar
3. SEMPRE ter ações com owner + prazo
4. SEMPRE reconhecer o que deu certo
5. SEMPRE publicar e compartilhar
6. NUNCA ocultar detalhes (transparência > reputação)
7. NUNCA demorar mais de 1 semana para publicar
```

## 🎯 Exemplo de Output (parcial)

```markdown
## 1. RESUMO EXECUTIVO

Deploy v2.4.1 introduziu deadlock no Postgres em produção. 32 min de
downtime parcial, ~3.500 usuários afetados, R$ 8k receita perdida.
Causa raiz: migrations pesadas sem testes integration + processo
go/no-go faltando. Ação corretiva chave: implementar processo formal
de migrations com staging dedicado.

## 4. CAUSA RAIZ (5 Whys)

- Deploy introduziu deadlock
- Migration não testada com carga real
- CI só roda unit tests
- Decidimos priorizar velocidade sobre cobertura
- Não temos processo go/no-go para migrations
- **RAIZ:** Falta de processo formal para migrations pesadas

## 8. AÇÕES

| Ação | Owner | Prazo |
|------|-------|-------|
| Integration tests p/ migrations | @joao | 15/jul |
| Staging com dados sintéticos | @maria | 30/jul |
| Runbook deadlock | @pedro | 10/jul |
| Processo go/no-go | @ravi | 15/jul |
```

## 📊 Métricas de Sucesso do Post-Mortem

- **Tempo até publicar:** < 1 semana
- **Ações com owner:** 100%
- **Ações concluídas no prazo:** > 80%
- **Incidente similar em 90 dias:** 0
- **Satisfação do time com o processo:** > 7/10

## 🚨 Anti-Patterns

- ❌ Citar nome de quem errou
- ❌ Sem ações corretivas (só análise)
- ❌ Ações vagas ("comunicar melhor")
- ❌ Não publicar
- ❌ Demorar mais de 1 semana
- ❌ Repetir mesma causa raiz sem ação (indica cultura ruim)

---

*Lab-Nexus · prompt/governanca/02 · 2026*