---
title: "WB-2026-02 · SHO em Produção"
webinar_code: WB-2026-02
date: 2026-05-22
duration: 75min
speaker: "Eng. SHO + Estrategista convidado"
tags: [webinar, sho, orquestracao, judge, tuning]
last_updated: 2026-06-12
version: "2.0.0"
status: realizado + apostila expandida
pattern: "MMN_IA"
---

![Capa — SHO em Produção](../../assets/ebook_covers/ACAD-apostila-04-orquestracao-hibrida-agentes.webp)

**WB-2026-02 · SHO em Produção**

*Webinar expandido em apostila — o Self-Healing Orchestrator em ambiente de produção real*

**Palestrante:** Eng. SHO + Estrategista convidado
**Data original:** 22/05/2026 · **Duração:** 75 min

Nexus Affil'IA'te · 2026

**Sobre esta apostila**

Esta é a versão expandida do webinar WB-2026-02. O webinar original apresentou o SHO (Self-Healing Orchestrator) em ambiente de produção, com 3 cases reais de incidentes resolvidos autonomamente. Esta apostila documenta o conteúdo técnico em profundidade, com os protocolos, os logs reais, e as lições aprendidas.

**Sumário**

> **•** 1. O que é o SHO na prática
> **•** 2. Os 3 modos de operação
> **•** 3. Anatomia de uma decisão do SHO
> **•** 4. Case 1 — Resiliência de skill de copy
> **•** 5. Case 2 — Contenção de campanha problemática
> **•** 6. Case 3 — Quarentena de nó federado
> **•** 7. Configuração recomendada por porte
> **•** 8. Logs e telemetria
> **•** 9. Limites e quando escalar para humano
> **•** 10. Q&A completo

---

**1. O que é o SHO na prática**

O SHO (Self-Healing Orchestrator) é o **sistema imunológico** da infraestrutura Nexus. Ele monitora todas as execuções, detecta anomalias, e toma ações defensivas **sem intervenção humana** em 90%+ dos casos.

O SHO não é um LLM. É um **orquestrador determinístico** baseado em regras. Ele sabe:
- Quando uma skill está falhando mais do que o aceitável.
- Quando uma campanha está saindo dos limites de compliance.
- Quando um nó federado está comprometido.
- Quando uma métrica de saúde degrada.

E ele age: retry, fallback, contenção, quarentena.

**2. Os 3 modos de operação**

**Modo Saturação (normal)**
- Execução padrão.
- Cada decisão é registrada, cada anomalia é flagada.
- SHO não interfere.

**Modo Contenção (anomalia detectada)**
- SHO isola a skill defeituosa.
- Redireciona tráfego para fallback.
- Alerta: amarelo no dashboard.

**Modo Quarentena (falha grave)**
- SHO bloqueia novas execuções.
- Abre ticket de suporte automaticamente.
- Alerta: vermelho no dashboard.
- **Humano precisa intervir**.

A passagem entre modos é **automática**, baseada em thresholds configuráveis.

**3. Anatomia de uma decisão do SHO**

Quando uma skill executa, o SHO observa:
- Latência (p50, p95, p99).
- Taxa de erro (últimas 100 execuções).
- Custo em tokens.
- Aprovação do Judge.
- Latência de rede (em chamada a APIs externas).

Critérios de contenção (configurável, defaults razoáveis):
- Latência > 10s por 3 execuções seguidas.
- Taxa de erro > 15% em janela de 100 execuções.
- Judge reprovando > 50% em janela de 50 execuções.
- Custo > R$ 0.10 por execução individual.
- Latência de API externa > 5s.

Quando **2 ou mais** critérios disparam, SHO entra em **Modo Contenção**.

**4. Case 1 — Resiliência de skill de copy**

**Incidente:** Em 18/04/2026, a skill `copywriter-whatsapp` começou a retornar mensagens com tom agressivo após uma atualização do LLM subjacente.

**Detecção:** SHO notou que o Judge começou a reprovar 47% das mensagens (vs. baseline de 6%). Threshold: > 30% em 50 execuções = contenção.

**Ação do SHO:**
1. Marcou a skill como suspeita.
2. Pausou novas execuções.
3. Roteou execuções para a skill `copywriter-email` (fallback configurado), com adaptação automática de tom (de email para WhatsApp).
4. Abriu ticket de prioridade média.

**Resolução humana:** 2 horas. Equipe técnica reverteu a versão do LLM. SHO validou a correção (Judge voltou a reprovar < 10%) e promoveu a versão estável.

**Impacto:** zero mensagens problemáticas chegaram a leads. 100% dos disparos foram roteados para fallback.

**5. Case 2 — Contenção de campanha problemática**

**Incidente:** Em 03/05/2026, um afiliado configurou uma campanha de reativação de frios, mas a coorte estava com 90% de números banidos/inválidos.

**Detecção:** SHO notou que a taxa de falha de entrega subiu de 2% para 38% em 15 minutos.

**Ação do SHO:**
1. Pausou a campanha.
2. Alertou o afiliado (banner amarelo).
3. Sugeriu limpar a base via skill `audience-segmenter` (regra: remover inválidos).
4. Não abriu ticket (era erro de configuração, não bug).

**Resolução humana:** 12 minutos. Afiliado limpou a base, re-aprovou a campanha. SHO validou a entrega > 95% e re-ativou.

**Impacto:** 1 campanha pausada preventivamente. 0 leads receberam mensagem com erro.

**6. Case 3 — Quarentena de nó federado**

**Incidente:** Em 11/05/2026, um nó federado começou a fazer chamadas suspeitas (volume 50x o normal, IPs em geolocalização inesperada).

**Detecção:** SHO notou anomalia no padrão de uso (volume + latência + IP).

**Ação do SHO:**
1. Quarentenou o nó (bloqueou novas requisições).
2. Manteve consultas para preservar estado.
3. Abriu ticket de prioridade ALTA.
4. Notificou administrador da rede.

**Resolução humana:** 4 horas. Verificou-se que o nó tinha sido comprometido (credenciais vazadas). Foi feita rotação de mTLS, auditoria de logs, e re-ativação supervisionada.

**Impacto:** 0 dados vazaram. O isolamento evitou propagação para outros nós da federação.

**7. Configuração recomendada por porte**

**Solo Afiliado (1 pessoa)**
- SHO em modo padrão.
- Alertas: e-mail + dashboard.
- Sem federação.
- Threshold de contenção: conservador.

**Pequena Equipe (2-5 pessoas)**
- SHO em modo padrão.
- Alertas: e-mail + dashboard + Slack.
- Federação opcional (Nível 1).
- Threshold de contenção: padrão.

**Média Equipe (6-20 pessoas)**
- SHO em modo com 1 camada extra de log.
- Alertas: e-mail + dashboard + Slack + SMS (apenas severidade alta).
- Federação Nível 1-2.
- Threshold de contenção: ajustável por skill.

**Grande Operação (20+ pessoas)**
- SHO em modo avançado com shadow testing.
- Alertas: integração com PagerDuty/OpsGenie.
- Federação Nível 1-3.
- Threshold de contenção: fino, com dashboards de tuning.

**8. Logs e telemetria**

Cada decisão do SHO gera um log estruturado:

```json
{
  "timestamp": "2026-05-22T10:34:22Z",
  "sho_decision_id": "sho_a8f3e2c1",
  "skill_id": "copywriter-whatsapp",
  "modo_anterior": "saturacao",
  "modo_novo": "contencao",
  "criterios_disparados": ["judge_reprovacao_50pct"],
  "acao_tomada": "pausar_skill_rotear_fallback",
  "fallback_usado": "copywriter-email",
  "humano_notificado": true,
  "resolvido_autonomamente": false,
  "duracao_contencao_ms": 7200000
}
```

Esses logs são **imutáveis** (append-only) e ficam disponíveis por 90 dias para auditoria.

**9. Limites e quando escalar para humano**

O SHO **não** toma decisões sobre:
- **Valores éticos** (ex: campanha polêmica). Escala para humano.
- **Mudanças de produto** (ex: descontinuar). Escala para humano.
- **Compliance** (ex: mudança em LGPD). Escala para humano.
- **Decisões de alto valor** (ex: contrato com parceiro). Escala para humano.

A regra é: **SHO lida com anomalias operacionais; humanos lidam com decisões estratégicas**.

**10. Q&A completo**

**P1: Posso desativar o SHO?**
R: Pode, mas não recomendamos. Sem SHO, falhas propagam. 99% dos afiliados deixa ativado.

**P2: SHO decide sozinho se a mensagem é spam?**
R: SHO detecta padrões (volume, frequência, taxa de bloqueio). O **Judge** é quem avalia o conteúdo.

**P3: Quanto custa o SHO?**
R: Está incluso no plano. Não há cobrança adicional.

**P4: SHO tem alucinações?**
R: SHO é determinístico, baseado em regras. Não tem LLM. Não alucina.

**P5: Como configuro o threshold de contenção?**
R: Em `/dashboard/sho/config`. Sugerimos começar com defaults e ajustar após 30 dias de operação.

**P6: SHO pode entrar em loop?**
R: SHO tem proteções anti-loop (circuit breaker). Se o SHO entra em contenção e a contenção não resolve em 1h, escala para humano.

**P7: Como exporto logs do SHO?**
R: Via API REST (`/api/v1/sho/logs?start=...&end=...`) ou download CSV em `/dashboard/sho/export`.

**P8: SHO monitora custos?**
R: Sim. SHO pode pausar execução se o custo diário da skill ultrapassar 80% do orçamento configurado.

**P9: Como o SHO se comunica com o Judge?**
R: Via canal interno. SHO observa o output do Judge; Judge é independente na decisão de aprovar/reprovar.

**P10: SHO funciona em federação?**
R: Sim. SHO monitora também chamadas entre nós federados. Anomalias em 1 nó disparam contenção só local (não derrubam a federação inteira).

---

**WB-2026-02 · SHO em Produção** --- Versão Apostila Expandida

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
