---
title: "02 · Sistema SHO — Sistema Híbrido de Orquestração"
level: fundamental
duration: 15min
prerequisites: ["01-entendendo-ioaid"]
tags: [sho, orquestracao, autonomia, judge, risk-limit]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Sistema SHO](../../../assets/ebook_covers/ACAD-apostila-04-orquestracao-hibrida-agentes.webp)

**02 · Sistema SHO — Sistema Híbrido de Orquestração**

*Trilha Fundamental · 15 minutos · Pré-requisito: 01-Entendendo IOAID*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

O IOAID é o "sistema nervoso" da Nexus. Mas todo sistema nervoso precisa de um **sistema imunológico** que detecte, contenha, e recupere de falhas. Esse sistema se chama **SHO** (Sistema Híbrido de Orquestração). Em 15 minutos, você vai entender como ele funciona, por que ele é o que permite autonomia real, e como configurar os 3 modos de operação para o seu perfil.

---

## ⚡ TL;DR — Resumo Executivo

> SHO (Sistema Híbrido de Orquestração) é o sistema imunológico do seu ecossistema: monitora, diagnostica, cura e aprende. Em 30 minutos, você vai entender a anatomia do SHO, 3 cenários reais onde ele brilha, e métricas de sucesso (uptime 99.97%, MTTR < 2 min).

### 🗺️ Posição na Trilha

**Anterior:** [← 01-entendendo-ioaid](01-entendendo-ioaid.md)
**Próximo:** [→ 03-painel-afiliado](03-painel-afiliado.md)



**Sumário**

> **•** 1. O que é o SHO na prática
> **•** 2. Por que "híbrido"?
> **•** 3. Os 3 modos de operação
> **•** 4. Anatomia de uma decisão do SHO
> **•** 5. Thresholds padrão (e como ajustar)
> **•** 6. Como o SHO conversa com o Judge
> **•** 7. Logs e telemetria
> **•** 8. Quando o SHO escala para humano
> **•** 9. Configuração recomendada por porte
> **•** 10. Próximo curso

---

**1. O que é o SHO na prática**

O SHO é o **sistema imunológico** da infraestrutura Nexus. Ele monitora todas as execuções, detecta anomalias, e toma ações defensivas **sem intervenção humana** em 90%+ dos casos.

O SHO **não é um LLM**. É um **orquestrador determinístico** baseado em regras. Isso é importante: ele não alucina, não decide por intuição, não erra por ambiguidade. Ele segue regras explícitas, configuráveis, auditáveis.

**O que o SHO faz:**
- Detecta skills falhando mais do que o aceitável.
- Detecta campanhas saindo dos limites de compliance.
- Detecta nós federados comprometidos.
- Detecta métricas de saúde degradando.

**O que o SHO faz:**
- Retry com backoff.
- Fallback para skill alternativa.
- Contenção (pausa + alerta).
- Quarentena (bloqueio + ticket).

**2. Por que "híbrido"?**

O SHO é **híbrido** porque combina 3 modos de decisão:

**Modo Reativo**: reage a eventos (skill falhou, judge reprovou).
**Modo Preditivo**: antecipa problemas (em Q4 2026, ainda em preview).
**Modo Consultivo**: pede input humano em casos ambíguos.

A hibridez permite que o SHO seja **rápido quando pode** (reage), **preventivo quando deve** (prediz), e **humilde quando precisa** (consulta).

**3. Os 3 modos de operação**

**🟢 Modo Saturação (normal)**
- Execução padrão, sem interferência.
- Cada decisão é registrada, cada anomalia é flagada.
- SHO não interfere.
- **90% do tempo, seu agente está aqui.**

**🟡 Modo Contenção (anomalia)**
- SHO detecta anomalia (skill falhando, judge reprovando, latência subindo).
- Isola a skill defeituosa.
- Redireciona tráfego para fallback.
- Banner amarelo no dashboard.
- **9% do tempo, em incidentes pontuais.**

**🔴 Modo Quarentena (falha grave)**
- SHO bloqueia novas execuções.
- Abre ticket automaticamente.
- Banner vermelho no dashboard.
- **Humano precisa intervir**.
- **1% do tempo, em incidentes críticos.**

A passagem entre modos é **automática** (baseada em thresholds) e **auditável** (cada transição gera log).

**4. Anatomia de uma decisão do SHO**

Quando uma skill executa, o SHO observa 5 métricas:
- **Latência** (p50, p95, p99).
- **Taxa de erro** (últimas 100 execuções).
- **Custo em tokens**.
- **Aprovação do Judge**.
- **Latência de API externa** (se aplicável).

Critérios de contenção (defaults):
- Latência > 10s por 3 execuções seguidas.
- Taxa de erro > 15% em janela de 100 execuções.
- Judge reprovando > 50% em 50 execuções.
- Custo > R$ 0.10 por execução individual.
- Latência de API externa > 5s.

Quando **2 ou mais** critérios disparam, SHO entra em Modo Contenção.

**5. Thresholds padrão (e como ajustar)**

Os defaults são conservadores (mais falsos positivos, menos falsos negativos). Para afiliados experientes, ajustar para mais permissivo:

**Solo Afiliado (iniciante):**
- Latência: 10s ✓ (mantém)
- Erro: 15% ✓ (mantém)
- Judge: 50% ✓ (mantém)

**Pequena Equipe (intermediário):**
- Latência: 8s (mais sensível)
- Erro: 20% (mais tolerante — volume alto gera erros esporádicos)
- Judge: 40% (mais tolerante)

**Operação Avançada (Elite):**
- Latência: 5s (muito sensível)
- Erro: 25% (tolerância alta)
- Judge: 30% (configurado por skill)

Ajustar em `/dashboard/sho/config`.

**6. Como o SHO conversa com o Judge**

O SHO observa o output do Judge, mas **não interfere na decisão** do Judge. Eles são complementares:

- **Judge** decide: "essa mensagem deve ser enviada?"
- **SHO** decide: "essa skill está saudável?"

Quando o Judge reprova muito, **o SHO é alertado** e pode entrar em contenção. Mas o SHO não diz ao Judge "ignore essa reprovação". Eles têm responsabilidades separadas.

**7. Logs e telemetria**

Cada decisão do SHO gera um log estruturado (imutável, 90 dias):

```json
{
  "timestamp": "2026-05-22T10:34:22Z",
  "sho_decision_id": "sho_a8f3e2c1",
  "skill_id": "copywriter-whatsapp",
  "modo_anterior": "saturacao",
  "modo_novo": "contencao",
  "criterios_disparados": ["judge_reprovacao_50pct"],
  "acao_tomada": "pausar_skill_rotear_fallback",
  "humano_notificado": true,
  "resolvido_autonomamente": false
}
```

Você vê esses logs em `/dashboard/sho/logs` ou via API REST.

**8. Quando o SHO escala para humano**

O SHO **não** toma decisões sobre:
- **Valores éticos** (campanha polêmica). Escala para humano.
- **Mudanças de produto** (descontinuar). Escala para humano.
- **Compliance** (mudança em LGPD). Escala para humano.
- **Decisões de alto valor** (contrato com parceiro). Escala para humano.

A regra é: **SHO lida com anomalias operacionais; humanos lidam com decisões estratégicas**.

**9. Configuração recomendada por porte**

**Solo (1 pessoa)**
- SHO em modo padrão.
- Alertas: e-mail + dashboard.
- Sem federação.
- Threshold conservador.

**Pequena Equipe (2-5 pessoas)**
- SHO em modo padrão.
- Alertas: e-mail + dashboard + Slack.
- Federação Nível 1 opcional.
- Threshold padrão.

**Média Operação (6-20)**
- SHO com 1 camada extra de log.
- Alertas: SMS para severidade alta.
- Federação Nível 1-2.
- Threshold ajustável por skill.

**Grande Operação (20+)**
- SHO avançado com shadow testing.
- Integração com PagerDuty/OpsGenie.
- Federação Nível 1-3.
- Threshold fino, com tuning dashboard.

**10. Próximo curso**

👉 [`03-painel-afiliado.md`](03-painel-afiliado.md) — Primeiros passos no Painel · 20 min

Para aprofundamento:
- **Apostila 01**: Apresentação Oficial da Infraestrutura.
- **Webinar WB-2026-02**: SHO em Produção (3 cases reais de incidentes).
- **Apostila 04**: Orquestração Híbrida de Agentes.

---

**02 · Sistema SHO** --- Trilha Fundamental

---

## 🎯 Exercícios Práticos — Curso: Sistema SHO

> **Tempo sugerido:** 45-90 minutos
> **Formato:** individual, com consulta ao painel/ambiente real
> **Entrega:** não há prova formal; use este espaço para fixar o aprendizado

**Exercício 1 — Cenário**

Escreva 1 cenário onde seu agente pode falhar (ex: API do WhatsApp cai). Como o SHO deveria reagir em < 2 minutos?

**Exercício 2 — Métricas**

No painel, localize os indicadores de "saúde do SHO" (uptime, MTTR, taxa de cura). Anote os valores atuais.

**Exercício 3 — Plano**

Crie um mini-plano de contingência (1 página) para quando o SHO ficar offline por > 30 minutos. Quem é avisado? O que fazer manualmente?

---

## ✅ Checklist de Conclusão

Marque conforme for completando:

- [ ] Li o curso inteiro sem pular seções.
- [ ] Fiz os 3 exercícios práticos.
- [ ] Respondi às 5 questões de auto-avaliação (mentalmente, sem colar).
- [ ] Anotei 1 dúvida que surgiu (para perguntar no webinar ou fórum).
- [ ] Identifiquei 1 ação concreta que vou tomar nas próximas 24h.
- [ ] Compartilhei meu progresso com pelo menos 1 pessoa (mentor, par, ou comunidade).

---

## 🧠 Auto-Avaliação (5 questões)

Tente responder **sem consultar o curso**. Depois, valide:

1. Quais são os 4 papéis do SHO (monitora, diagnostica, cura, aprende)?
2. O que é MTTR e qual é a meta do SHO?
3. Como o SHO evita reincidência de incidentes?
4. Cite 2 cenários onde o SHO NÃO deveria atuar automaticamente.
5. Qual a diferença entre "restart" e "fallback" no SHO?

---

## 🚀 Próximos Passos Recomendados

1. **Aplicar imediatamente:** pegue 1 insight deste curso e aplique HOJE.
2. **Medir em 7 dias:** meça o impacto (mesmo que qualitativo).
3. **Compartilhar:** documente o que aprendeu (post, conversa, diário).
4. **Avançar:** siga para o próximo curso da trilha.


*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
