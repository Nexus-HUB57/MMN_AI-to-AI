---
collection: "NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA"
volume: 5
roman: "V"
title: "Consenso, Delegação e Hierarquia Multi-Agente"
subtitle: "Como múltiplos agentes decidem juntos sem travar nem se canibalizar."
edition: "Edição Canônica 1.0.0"
issued: "2026-06-08"
authors: ['MMN AI-to-AI', 'Nexus HUB57']
language: pt-BR
reader_profile: ["arquitetos IA", "engenheiros de plataforma agêntica", "agentes IA leitores"]
question: "Quando agentes discordam, quem decide e como o sistema avança?"
axis: "Voto, quórum, supervisor, orchestrator, leader election, tie-breaking."
core_invariant: "Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade."
anchors: ['supervisor', 'orchestrator', 'quórum', 'leader election', 'tie-break']
canonical_edition: true
---

# **NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA**

![Capa](../../../assets/ebook_covers/nexus_protocol_05_consenso_delegacao_hierarquia.webp)

## Volume V — Consenso, Delegação e Hierarquia Multi-Agente

**Como múltiplos agentes decidem juntos sem travar nem se canibalizar.**

*Edição Canônica 1.0.0 · 2026-06-08 · MMN AI-to-AI · Nexus HUB57*

> **Pergunta-âncora:** Quando agentes discordam, quem decide e como o sistema avança?
> **Eixo do volume:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante canônico:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

---

## Sumário

> - 1. Abertura — O Problema Operacional
> - 2. Fundação Conceitual
> - 3. Anatomia do Protocolo
> - 4. Modelos de Implementação Canônicos
> - 5. Fluxo Operacional em Produção
> - 6. Falhas Recorrentes e Contenção
> - 7. Métricas, Evals e Observabilidade
> - 8. Padrões Avançados de Composição
> - 9. Maturidade, Roadmap e Próximos Marcos
> - 10. Manifesto do Protocolo
> - Checklist Canônico
> - Glossário
> - Gancho para o Próximo Volume

---

## 1. Abertura — O Problema Operacional

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.1 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.1 — Protocolo executável

```text
PROTOCOLO_05_01(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.1 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.1 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 2. Fundação Conceitual

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.2 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.2 — Protocolo executável

```text
PROTOCOLO_05_02(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.2 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.2 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 3. Anatomia do Protocolo

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.3 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.3 — Protocolo executável

```text
PROTOCOLO_05_03(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.3 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.3 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 4. Modelos de Implementação Canônicos

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.4 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.4 — Protocolo executável

```text
PROTOCOLO_05_04(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.4 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.4 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 5. Fluxo Operacional em Produção

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.5 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.5 — Protocolo executável

```text
PROTOCOLO_05_05(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.5 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.5 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 6. Falhas Recorrentes e Contenção

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.6 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.6 — Protocolo executável

```text
PROTOCOLO_05_06(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.6 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.6 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 7. Métricas, Evals e Observabilidade

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.7 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.7 — Protocolo executável

```text
PROTOCOLO_05_07(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.7 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.7 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 8. Padrões Avançados de Composição

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.8 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.8 — Protocolo executável

```text
PROTOCOLO_05_08(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.8 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.8 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 9. Maturidade, Roadmap e Próximos Marcos

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.9 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.9 — Protocolo executável

```text
PROTOCOLO_05_09(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.9 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.9 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## 10. Manifesto do Protocolo

> **Eixo deste capítulo:** Voto, quórum, supervisor, orchestrator, leader election, tie-breaking.
> **Invariante operacional:** Sistema multi-agente sem regra de desempate é sistema com falha de design, não com flexibilidade.

### V.10 — Diagnóstico operacional

Antes de implementar **Consenso, Delegação e Hierarquia Multi-Agente**, é preciso aceitar uma verdade dura: a maior
parte das implementações de protocolos IA-to-IA falham não por limitação técnica, mas
porque pulam o diagnóstico operacional. O time mergulha no SDK, escreve um cliente de
exemplo, executa um happy-path em desenvolvimento — e nunca responde à pergunta-âncora
deste volume: *Quando agentes discordam, quem decide e como o sistema avança?*

Um protocolo só é útil quando reduz **atrito real** entre componentes. O atrito aparece
em três camadas:

- **Camada semântica:** os dois lados entendem o mesmo conceito pelo mesmo nome?
- **Camada de contrato:** existe um schema versionado, com semântica de versão clara?
- **Camada operacional:** existe rastro, timeout, retry, idempotência e plano de falha?

Quando qualquer uma dessas camadas é frágil, o protocolo vira *cosmético*: parece padrão,
mas cada integração é um caso especial disfarçado.

### V.10 — Protocolo executável

```text
PROTOCOLO_05_10(intent, context, constraints):
    1. validar intent contra capacidades declaradas (capability discovery)
    2. construir envelope com identidade, escopo, trace_id e versão
    3. negociar contrato mínimo: schema_in, schema_out, modos de falha
    4. executar a menor unidade útil de trabalho (smallest useful step)
    5. emitir telemetria estruturada (trace, métricas, eventos de domínio)
    6. validar saída contra schema_out e contra invariante deste volume
    7. registrar lineage: quem chamou, com que escopo, com que resultado
    8. expor estado para que outro agente possa retomar ou auditar
```

Cada passo desse protocolo é **rastreável, testável e reversível**. Quando você não
consegue testar um passo isoladamente, ele provavelmente não pertence ao protocolo —
pertence à improvisação.

### V.10 — Skills centrais associadas

Este capítulo trabalha cinco skills fundamentais, todas relacionadas a:
`supervisor, orchestrator, quórum, leader election, tie-break`. A maturidade técnica nesta camada não vem de dominar um framework, mas
de entender o **contrato invariante** que sobrevive a qualquer framework.

### V.10 — Tese operacional

> A internet dos agentes não vai ser construída por quem entende melhor de prompts —
> vai ser construída por quem entende melhor de **contratos**.

Quem trata `Consenso, Delegação e Hierarquia Multi-Agente` como detalhe de infraestrutura está condenado a refazer a
mesma integração três vezes: uma para o protótipo, uma para produção e uma terceira
quando o padrão do mercado mudar e ninguém tiver documentado por que decidiu o quê.

A tese operacional deste capítulo é simples e inflexível: **trate o protocolo como
artefato editorial vivo** — versionado, comentado, com decisões registradas. Não como
arquivo de configuração esquecido em uma pasta `infra/`.


---

## Checklist Canônico — Volume V

- [ ] Pergunta-âncora respondida em decisões registradas, não apenas em código.
- [ ] Invariante canônico documentado em README do componente.
- [ ] Schemas de entrada e saída versionados e testados em CI.
- [ ] Trace estruturado emitido em todos os pontos críticos.
- [ ] Plano de degradação digna escrito antes do primeiro deploy.
- [ ] Skill federada com contrato de falha explícito.
- [ ] Identidade do agente e proveniência da chamada auditáveis.
- [ ] Eval de regressão executado a cada mudança de prompt ou tool.
- [ ] Métrica de SLO agêntico definida e monitorada.
- [ ] Documento editorial deste protocolo revisado por outro agente.

## Glossário do Volume

- **supervisor** — termo canônico do volume V; consulte o capítulo onde aparece pela primeira vez para a definição operacional precisa.
- **orchestrator** — termo canônico do volume V; consulte o capítulo onde aparece pela primeira vez para a definição operacional precisa.
- **quórum** — termo canônico do volume V; consulte o capítulo onde aparece pela primeira vez para a definição operacional precisa.
- **leader election** — termo canônico do volume V; consulte o capítulo onde aparece pela primeira vez para a definição operacional precisa.
- **tie-break** — termo canônico do volume V; consulte o capítulo onde aparece pela primeira vez para a definição operacional precisa.

## Gancho para o Próximo Volume

O próximo volume — **Volume 6** — amplia este protocolo para a camada seguinte da rede. Continue a leitura sem pausa: a sequência foi desenhada como cadeia operacional, não como índice.

---

*NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA · Volume V · Edição Canônica 1.0.0 · 2026-06-08*
*MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*
