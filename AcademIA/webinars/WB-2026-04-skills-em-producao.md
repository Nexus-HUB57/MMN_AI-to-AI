---
title: "WB-2026-04 · As 18 Skills em Produção: Cases Reais"
level: "agente+"
duracao: "90-120min (incluindo Q&A de 30min)"
data: "2026-07-15"
formato: "webinar-ao-vivo + gravado"
palestrante: "Equipe Nexus + 2 convidados"
tags: [skills, producao, casos-reais, troubleshooting]
pattern: "MMN_IA"
status: "planejado"
---

![Capa — As 18 Skills em Produção](../../assets/ebook_covers/ACAD-apostila-07-18-skills-operacionais.webp)

**WB-2026-04 · As 18 Skills em Produção: Cases Reais**

*Cases de quem está rodando skills em produção há 6+ meses. O que funciona, o que quebra, e como iterar.*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este webinar**

Este webinar é um **mergulho profundo** nas 18 skills operacionais da Academ'IA. Vamos sair da teoria e entrar em **produção real**: 2 convidados que rodam cada skill há 6+ meses vão contar o que funciona, o que quebra, e como eles iteraram até chegar a uma versão estável.

**Não é um tutorial**. É um **debate franco** sobre as armadilhas que ninguém te conta.

---

# 🎯 Sumário

> **•** 1. Por que este webinar importa
> **•** 2. Os 3 convidados
> **•** 3. As 18 skills — categorias e funções
> **•** 4. Case 1 — Copywriter em produção (6 meses)
> **•** 5. Case 2 — Audience Segmenter em produção (4 meses)
> **•** 6. Case 3 — Judge em produção (8 meses)
> **•** 7. As 5 skills que ninguém usa (e por quê)
> **•** 8. As 3 skills subestimadas (que salvam运营)
> **•** 9. Como iterar uma skill em 5 ciclos
> **•** 10. Q&A ao vivo (30 minutos)

---

**1. Por que este webinar importa**

Se você está na Trilha Agente, já passou pelo curso de Skills Essenciais. Já sabe o que são, como instalar, como encadear. Mas entre "instalar" e "rodar em produção por 6 meses sem quebrar" tem um abismo.

Este webinar preenche esse abismo com 3 cases reais.

---

**2. Os 3 convidados**

**Convidada 1 — Beatriz Yamamoto, 38 anos, São Paulo**
- Afiliada Nexus há 4 anos
- Roda o stack completo (10 skills ativas) desde dez/2025
- Faturamento: R$ 32k/mês
- Nicho: marketing digital para clínicas

**Convidado 2 — Carlos Menezes, 45 anos, Recife**
- Ex-engenheiro de software, hoje afiliado full-time
- Roda 6 skills há 8 meses
- Faturamento: R$ 18k/mês
- Nicho: e-commerce de suplementos

**Convidado 3 — Rafael Lima, 29 anos, Belo Horizonte**
- Mais novo do grupo, afiliado há 1 ano
- Roda 4 skills (foco em copy + segmenter)
- Faturamento: R$ 9k/mês
- Nicho: cursos online

---

**3. As 18 skills — categorias e funções**

Dividimos as 18 skills em 4 categorias. Cada convidado vai comentar sobre as que usa:

**A — Copywriting (4 skills)**
- `copywriter-headline`: escreve títulos que vendem
- `copywriter-email`: estrutura e-mails de venda
- `copywriter-whatsapp`: mensagens curtas para WhatsApp
- `copywriter-landing-page`: copy de páginas de venda

**B — Segmentação (4 skills)**
- `audience-segmenter`: divide lista em quente/morno/frio
- `lead-scorer`: pontua leads de 0-100
- `demographics-extractor`: extrai idade, cidade, profissão
- `intent-detector`: identifica intenção de compra

**C — Operação (4 skills)**
- `scheduler`: agenda disparos
- `disparador-whatsapp`: envia mensagens
- `disparador-telegram`: envia mensagens
- `disparador-email`: envia e-mails

**D — Compliance (4 skills)**
- `judge-compliance`: bloqueia mensagens ilegais
- `judge-tone`: avalia tom (agressivo, passivo, etc.)
- `judge-claims`: detecta promessas exageradas
- `judge-lgpd`: checa conformidade LGPD

**E — Análise (2 skills)**
- `metrics-extractor`: extrai métricas de dashboards
- `cohort-analyzer`: analisa coortes

---

**4. Case 1 — Beatriz e o Copywriter**

Beatriz usa `copywriter-whatsapp` 24/7. Dispara ~5.000 mensagens/mês. Em 6 meses, o que aconteceu:

**O que funcionou:**
- System prompt muito específico (não genérico)
- Few-shot examples reais (3 exemplos por tom)
- Calibração quinzenal baseada em conversão
- A/B testing semanal de copy

**O que quebrou:**
- Fevereiro/2026: a Meta mudou o algoritmo anti-spam, e a copy parou de funcionar por 3 dias
- Março/2026: um cliente reclamou de tom agressivo, e o Judge bloqueou 40% das mensagens (falso positivo)
- Abril/2026: dados de treino antigos geraram respostas que mencionavam concorrentes

**Como ela iterou:**
1. Re-treino mensal com 50 mensagens reais como few-shot
2. Sistema de feedback (cliente avalia copy com 👍/👎)
3. Regras específicas no Judge para evitar bloqueios excessivos
4. Backup diário dos prompts e metrics

**Lição**: copywriter em produção exige **calibração constante**, não é "set and forget".

---

**5. Case 2 — Carlos e o Audience Segmenter**

Carlos usa `audience-segmenter` para classificar 12.000 leads. Em 4 meses, aprendeu:

**O que funcionou:**
- Segmentação em 5 níveis (frio, morno, quente, vip, churn-risk)
- Critérios claros: tempo desde última interação, score de lead, histórico de compras
- Re-segmentação semanal (não diária — performance)

**O que quebrou:**
- Semana 3: o segmenter classificou 60% dos leads como "vip" (falso positivo)
- Semana 8: leads novos (cadastrados há < 24h) estavam indo para "frio" — mas tinham alta intenção

**Como ele iterou:**
1. Threshold manual: vip = score > 80 + 3+ compras
2. Lead novo (D0-D7) vai para "warm-watch" (categoria especial)
3. Modelo de scoring híbrido: 70% LLM + 30% regras determinísticas
4. Logs detalhados de cada re-classificação

**Lição**: segmenter puro via LLM é **perigoso**. Precisa de **regras determinísticas** como backup.

---

**6. Case 3 — Rafael e o Judge**

Rafael usa `judge-compliance` desde o dia 1. Por que? Porque trabalha com nicho sensível (cursos online) onde promessas exageradas são comuns.

**O que funcionou:**
- Judge em modo "Bloqueio Total" para claims financeiros ("ganhe R$X")
- Calibração do Judge com 100 exemplos negativos
- Bloqueio de palavras-chave específicas (lista de 200)

**O que quebrou:**
- Mês 3: o Judge bloqueou 25% das mensagens de copy legítima (falso positivo alto)
- Mês 5: Meta advertiu conta de Rafael por causa de 3 mensagens que passaram (falso negativo)

**Como ele iterou:**
1. Reduziu threshold de Bloqueio Total para Bloqueio Parcial (em casos de dúvida)
2. Whitelist de clientes VIP (que podem receber claims agressivos)
3. Auditoria semanal de falsos negativos (cada bloqueio que escapou)
4. Ensemble: 3 judges com votos (consenso = bloqueio)

**Lição**: Judge **único** é arriscado. Use **ensemble** (3 judges votam) para nicho sensível.

---

**7. As 5 skills que ninguém usa**

Perguntamos aos 3 convidados: "qual skill você instalou mas **não usa em produção**?"

1. **`demographics-extractor`** (Carlos): "muito impreciso para leads brasileiros. Chutava idade em 60% dos casos. Voltei para planilha."
2. **`intent-detector`** (Beatriz): "interessante, mas o lead-scorer já cobre 80%. Redundante."
3. **`copywriter-landing-page`** (Rafael): "minhas LP são feitas pelo designer humano. IA não chega perto."
4. **`cohort-analyzer`** (Beatriz): "tenho, mas só uso 1x por mês. Não justifica o custo de manter ativo."
5. **`judge-tone`** (Carlos): "o judge-compliance já pega tom agressivo. Redundante."

**Lição**: **menos skills, melhor**. 8-10 skills ativas é mais eficiente que 18.

---

**8. As 3 skills subestimadas**

Perguntamos: "qual skill você achava bobagem mas **virou essencial**?"

1. **`disparador-telegram`** (Carlos): "achava que WhatsApp era suficiente. Mas quando WhatsApp cai (e cai!), Telegram é o backup que salvou R$ 8k em vendas num único dia."
2. **`metrics-extractor`** (Beatriz): "eu olhava dashboard todo dia. Mas quando automatizei, descobri padrões que não via: terça 14h tem conversão 2x maior. Mudei horário de disparo e faturei 18% a mais."
3. **`scheduler`** (Rafael): "achava que podia disparar na hora. Mas agendar com base em fuso horário do lead (não meu) aumentou abertura em 40%."

---

**9. Como iterar uma skill em 5 ciclos**

Beatriz, Carlos e Rafael convergem em um framework de iteração:

```
CICLO 1 (Semana 1): instalar e rodar com prompt padrão
        ↓ (medir: taxa de sucesso, falsos positivos)
CICLO 2 (Semana 2): few-shot examples (3-5 reais)
        ↓ (medir: melhoria vs baseline)
CICLO 3 (Semana 3): regras determinísticas (negócios)
        ↓ (medir: estabilidade)
CICLO 4 (Semana 4): ensemble (2-3 votes)
        ↓ (medir: robustez)
CICLO 5 (Mês 2+): monitoramento contínuo + re-treino mensal
```

**Métricas para cada ciclo:**
- **Sucesso**: % de execuções que produzem output útil
- **Latência**: tempo médio de execução
- **Custo**: tokens gastos / mês
- **Confiança**: % de operadores que confiam no output sem revisar

---

**10. Q&A ao vivo (30 minutos)**

Deixamos os últimos 30 minutos abertos para perguntas da audiência. Os convidados já confirmaram que vão responder qualquer pergunta sobre:
- Como escolher entre 2 skills similares
- Quando desativar uma skill
- Como migrar de uma skill paga para uma custom
- Quanto custa manter 10 skills ativas
- Como treinar a equipe em produção

---

# 📋 Especificações do Webinar

| Item | Detalhe |
|------|---------|
| **Data prevista** | 15 de julho de 2026 |
| **Duração** | 90-120 minutos (60 painel + 30 Q&A) |
| **Formato** | Ao vivo via Zoom + YouTube Live |
| **Gravação** | Liberada 48h após o evento |
| **Inscrição** | Gratuita para membros Nexus (R$ 47 para não-membros) |
| **Pré-requisito** | Ter feito o curso 01-skills-essenciais |
| **Público-alvo** | Alunos da Trilha Agente e Master |

---

# 🎓 O que você vai sair sabendo

1. Quais das 18 skills **realmente valem** em produção.
2. Como iterar uma skill em **5 ciclos** sem perder sanidade.
3. Como evitar os **3 erros mais comuns** (falso positivo, falso negativo, custo).
4. Quando usar **ensemble** (3 judges) vs judge único.
5. **5 skills que ninguém usa** (para você não perder tempo instalando).
6. **3 skills subestimadas** (que podem mudar seu jogo).

---

# 🎯 CTA Pós-Webinar

- Apostila **07 — As 18 Skills Operacionais**: leitura complementar essencial
- Curso **01-skills-essenciais**: revise antes do webinar
- Página de **Progresso**: marque este webinar como assistido

---

*WB-2026-04 · As 18 Skills em Produção*

*Por MMN AI-to-AI · 2026 · Licença: CC BY-SA 4.0*

*"A diferença entre instalar uma skill e operá-la em produção é o mesmo abismo que existe entre 'saber nadar' e 'salvar alguém de afogamento'."*