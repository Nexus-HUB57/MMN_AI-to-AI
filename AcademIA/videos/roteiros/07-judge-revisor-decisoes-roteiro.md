---
title: "Vídeo 07 — Judge Revisor: A IA que Decide por Você"
type: "roteiro"
duracao_estimada: "8-10 min"
formato: "Abertura + 3 blocos + CTA"
trilha: "Agente"
persona: "Sir Nexus Alencar"
ordem: 6
pattern: "MMN_IA"
---

# 🎬 Roteiro — Vídeo 07: Judge Revisor — A IA que Decide por Você

> **Tipo:** Vídeo-aula técnica (Nível Agente)
> **Duração estimada:** 8 a 10 minutos
> **Persona:** Sir Nexus Alencar
> **Público:** Operadores — Trilha Agente

---

## 🎞️ CENA 1 — Abertura (Duração: 1 min)

**Visual:** Animação de um "juiz" simbólico (balança digital + chip de IA) analisando uma mensagem. Sir Nexus Alencar em plano médio, escritório.

**Sir Nexus Alencar:** "Olá. Eu sou Sir Nexus Alencar. Hoje a gente vai abrir a caixa-preta do **Judge Revisor** — talvez a peça mais importante da sua operação, e a menos compreendida. Veja bem: **o Judge não é um chatbot. Não é um filtro de palavras. É um avaliador autônomo** que lê cada mensagem antes dela sair, decide se aprova, rejeita, ou sugere ajuste, e ainda **aprende com cada decisão sua**. Em afiliado que escala, **o Judge é o segundo cérebro operacional**. Vamos entender como ele funciona, como configurar, e como tirar o máximo dele."

---

## 🎞️ CENA 2 — Como o Judge Decide (Duração: 3 min)

**Visual:** Diagrama em camadas mostrando os 5 critérios avaliados pelo Judge em paralelo: tom, conformidade, persuasão, contexto, histórico.

**Sir Nexus Alencar:** "O Judge avalia cada mensagem em **5 critérios simultâneos**, em tempo real. **Critério 1: Tom de voz.** A mensagem é coerente com a personalidade configurada para o agente? Está consistente com o histórico do lead? Se você configurou tom formal e o agente mandou 'eai parça, beleza?', **rejeita**. **Critério 2: Conformidade.** Tem dado sensível vazando (CPF, cartão, senha)? Tem promessa proibida (resultado garantido, 'cura', 'fique rico')? Tem clickbait agressivo? **Rejeita e explica o motivo**. **Critério 3: Persuasão.** A copy tem estrutura (gancho, problema, solução, CTA)? Tem clareza? Tem emoção? Tem especificidade? Score de 0-100. Abaixo de 60, **bloqueia para revisão**. **Critério 4: Contexto.** A mensagem faz sentido no fluxo da conversa? Não é repetitiva? Não contradiz algo dito antes? Não pula etapa do funil? **Critério 5: Histórico do lead.** Esse lead já recebeu mensagem similar? Já abriu? Já respondeu? Já pediu descadastro? Se sim, **o Judge adapta a copy ou sugere outro canal**."

**Visual:** Animação mostrando mensagem sendo avaliada em tempo real. Cada critério pisca verde (aprovado) ou vermelho (reprovado).

**Sir Nexus Alencar:** "O que torna o Judge especial é que **ele não toma decisões isoladas**. Cada critério é ponderado em conjunto. Uma mensagem pode ter tom perfeito (nota 95), mas contexto ruim (nota 40) — **nesse caso, o Judge bloqueia para sua revisão**, porque o risco de soar estranho na conversa é alto. E mais: **o Judge registra todas as decisões em log**. Você pode auditar. Pode ver exatamente **por que** uma mensagem foi aprovada ou rejeitada. Isso é **compliance automatizado** — você sabe, a qualquer momento, como seus agentes estão performando."

---

## 🎞️ CENA 3 — Configurando o Judge para Sua Operação (Duração: 2 min)

**Visual:** Tela capturada do painel. Sliders sendo ajustados para os 5 critérios.

**Sir Nexus Alencar:** "Agora, **como configurar o Judge para a sua realidade**. Vá em **Agentes > Judge Revisor > Configurações**. Você vai ver os 5 critérios com sliders. **Recomendações por estágio:**"

**Visual:** Tabela com perfis de uso.

**Sir Nexus Alencar:** "**Se você está começando (0-30 dias):** Suba a barra. **Tom: 90. Conformidade: 100. Persuasão: 80. Contexto: 90. Histórico: 80.** Por quê? Porque você ainda não tem histórico de aprovações. O Judge vai bloquear mais, você vai aprovar mais, mas **cada aprovação treina o sistema**. **Se você já está rodando (30-90 dias):** Abaixe Persuasão para 65, Histórico para 70. Você já validou seu tom, agora quer escala. **Se você está maduro (90+ dias):** Persuasão pode ir para 55. **O Judge já aprendeu seu estilo** — confia nele."

**Visual:** Demonstração de slider sendo ajustado.

**Sir Nexus Alencar:** "Outra config essencial: **lista de bloqueio**. Em **Judge > Blacklist**, você cadastra **palavras e expressões proibidas**. Por exemplo: 'garantido', 'fique rico', 'cura definitiva', '100% sem risco'. O Judge **bloqueia qualquer mensagem que contenha esses termos**, automaticamente. Você pode adicionar quantos quiser. **Minha recomendação:** comece com 30-50 termos comuns de spam e誇大, e vá refinando com base no que aparecer nas auditorias."

**Visual:** Lista de bloqueio sendo editada.

**Sir Nexus Alencar:** "E o **botão 'Aprovar e Aprender'**. Sempre que você aprova uma mensagem ajustada pelo Judge, **o Judge aprende**. Em 3 meses, **o Judge vai aprovar sozinho 70-80% das mensagens** — sem você mexer. Isso é **automação real** — não é 'automação que precisa aprovar tudo'. É **automação que melhora com o tempo**."

---

## 🎞️ CENA 4 — Interpretando o Relatório de Autonomia (Duração: 2 min)

**Visual:** Dashboard com 4 métricas grandes: Total de decisões, Aprovações automáticas, Bloqueios, Sugestões aceitas.

**Sir Nexus Alencar:** "Toda semana, abra o **Relatório de Autonomia** (Agentes > Judge > Relatório). Você vai ver 4 números essenciais. **1) Total de decisões.** Quantas mensagens o Judge avaliou na semana. **2) Aprovações automáticas.** Quantas ele liberou sem você intervir. Esse número **deve crescer com o tempo**. Se estagnou, **o Judge não está aprendendo** — provavelmente você está aprovando mensagens muito diferentes entre si, ou o tom configurado não bate com sua copy real. **3) Bloqueios.** Quantas mensagens ele travou para sua revisão. Se for 0%, **suspeito** — pode ser que o Judge está calibrado frouxo demais. O ideal é **8-15% de bloqueios** (nem zero, nem mais de 20%). **4) Sugestões aceitas.** Das mensagens que ele sugeriu ajuste, quantas você aceitou a versão dele. Se for alta (>70%), **o Judge está no seu tom**. Se for baixa (<40%), **ele está sugerindo coisas que você não aprova** — reveja a calibração."

**Visual:** Gráfico de evolução semanal mostrando crescimento de autonomia ao longo de 12 semanas.

**Sir Nexus Alencar:** "A métrica de ouro é **taxa de autonomia crescente**. Em **semana 1**: 20%. Em **semana 4**: 50%. Em **semana 12**: 75%+. Se você chegar a 80% de autonomia sustentada por 4 semanas seguidas, **você virou afiliado de elite operacional**. **Pode parar de aprovar uma a uma e começar a focar em estratégia**."

**Visual:** Checklist visual: "Você virou Elite quando..." com 5 itens marcados.

**Sir Nexus Alencar:** "Os 5 sinais: **Judge aprova sozinho >75% das mensagens.** **Você só aprova exceções.** **Tom configurado bate com a voz real da marca.** **Blacklist ativa e atualizada.** **Relatório de autonomia mostra tendência de alta sustentada.** Quando esses 5 sinais acendem, parabéns — **você saiu do operacional e entrou na estratégia**."

---

## 🎞️ CENA 5 — Recapitulação e CTA (Duração: 1 min)

**Visual:** Slide final com 5 critérios do Judge + 5 sinais de elite. Logo da Academia.

**Sir Nexus Alencar:** "Recapitulando: o **Judge Revisor** avalia cada mensagem em **5 critérios** — **tom, conformidade, persuasão, contexto, histórico**. Ele aprende com cada aprovação sua. Você **configura os pesos por estágio**, mantém uma **blacklist ativa**, e **acompanha o Relatório de Autonomia semanal**. A meta é chegar a **75%+ de autonomia** — aí você vira elite. **No próximo módulo**, a gente sobe para a **Trilha Master** — onde você vai aprender a **otimizar conversão**, **construir funis**, **rodar A/B tests com Judge**, e **analisar coortes de churn**. A operação fica séria. Estarei com você no próximo passo. Respire fundo. **Judge é seu segundo cérebro.**"

**Visual:** CTA: "Próxima aula: Trilha Master — Otimização de Conversão".

---

## 📋 Notas de Produção

- **Persona:** Sir Nexus Alencar
- **Duração:** 8-10 min
- **Visual:** Diagrama de critérios, dashboard de autonomia, tabela de configuração

## ✅ Checklist

- [x] 5 cenas
- [x] Duração 8-10 min
- [x] Persona Sir Nexus Alencar
- [x] 5 critérios do Judge explicados
- [x] 5 sinais de elite operacional
- [x] CTA para Trilha Master

---

**Última atualização:** 2026-06-22 · v1.0