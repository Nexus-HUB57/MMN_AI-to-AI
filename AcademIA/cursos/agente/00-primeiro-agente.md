---
title: "00 · Seu primeiro agente"
level: agente
duration: 30min
prerequisites: ["03-painel-afiliado"]
tags: [agente, primeiro-agente, setup, copywriter, segmenter, judge]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Seu primeiro agente](../../../assets/ebook_covers/ACAD-apostila-06-setup-agente-pessoal.webp)

**00 · Seu primeiro agente**

*Trilha Agente · 30 minutos · Pré-requisito: 03-Painel do Afiliado*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Chegou a hora de criar seu primeiro agente funcional. Este curso é o **tutorial guiado** — em 30 minutos você sai com 1 agente rodando, 3 skills instaladas, Judge calibrado, e 1 campanha de teste disparada. Para o tutorial detalhado de 90 minutos (com troubleshooting avançado), consulte a **Apostila 06** (Setup Completo do Agente Pessoal). Aqui, vamos direto ao ponto.

---

## ⚡ TL;DR — Resumo Executivo

> Em 25 minutos, você vai construir seu primeiro agente funcional: cérebro (LLM), identidade (system prompt), ferramenta (API), memória (contexto). Não é mágica — é engenharia. Inclui setup com docker-compose e teste com 3 prompts.

### 🗺️ Posição na Trilha

**Anterior:** [← ../fundamental/03-painel-afiliado](../fundamental/03-painel-afiliado.md)
**Próximo:** [→ 01-skills-essenciais](01-skills-essenciais.md)



**Sumário**

> **•** 1. Antes de começar: o que você precisa
> **•** 2. Criar o agente (5 min)
> **•** 3. Instalar 3 skills básicas (10 min)
> **•** 4. Configurar o Judge Revisor (5 min)
> **•** 5. Primeira campanha de teste (5 min)
> **•** 6. Monitorar e iterar (5 min)
> **•** 7. Erros comuns do primeiro agente
> **•** 8. Quando expandir para mais skills
> **•** 9. Checklist final
> **•** 10. Próximo curso

---

**1. Antes de começar: o que você precisa**

- Conta ativa no Nexus com **perfil completo** (nome, banco, nicho).
- **Pelo menos 1 produto** conectado com link de afiliado.
- **Pelo menos 100 contatos** importados (ou em importação).
- **30 minutos de foco** (sem interrupção).

Se algum desses itens falta, volte ao curso 03-Painel e complete primeiro.

**2. Criar o agente (5 min)**

**Caminho:** `/dashboard/agents/new`

1. **Nome descritivo**: `agente_pessoal_<seu_nome>` (ex: `agente_pessoal_marina`).
2. **Objetivo em 1 frase**: "Atender leads do nicho [X], qualificar interesse, e direcionar para compra de [produto Y]."
3. **Template**: escolha "Pessoal — Solo Afiliado" (o mais simples).
4. **Clique "Criar"**.

O sistema provisiona o agente (cria sandbox, registra, configura log) em ~30 segundos.

**Resultado:** você verá o painel do agente com 4 abas: Visão Geral, Skills, Judge, Logs.

**3. Instalar 3 skills básicas (10 min)**

**Caminho:** `/dashboard/agents/<id>/skills`

Instale nessa ordem (comece com o botão "Adicionar Skill"):

**Skill 1 — `copywriter-whatsapp`**
- Versão: 2.3.1 (estável).
- Tom: "consultivo" (default).
- Idioma: pt-BR.
- Tamanho máximo: 240 caracteres.
- Custo estimado: R$ 0,012 por geração.

**Skill 2 — `audience-segmenter`**
- Versão: 1.4.0.
- Configuração: deixar padrão (já reconhece 4 coortes).
- Custo: R$ 0,016 por análise.

**Skill 3 — `judge-revisor`**
- Versão: 3.0.0.
- Template: "Conservador LGPD".
- Custo: R$ 0,004 por revisão.

**Clique "Salvar e Ativar"**.

**4. Configurar o Judge Revisor (5 min)**

**Caminho:** `/dashboard/judge`

**Configuração inicial (essencial):**

1. **Modo**: "Bloqueio Total" (Judge reprova → mensagem não é enviada).
2. **Regras habilitadas** (todas marcadas):
   - ✅ LGPD: bloquear sem consentimento.
   - ✅ Spam: bloquear palavras-gatilho.
   - ✅ Claim médico: bloquear claims sem evidência.
   - ✅ Tom: bloquear agressividade.
   - ✅ Personalização: exigir nome do lead.
3. **Whitelist**: adicione termos autorizados (nome do produto).
4. **Blacklist**: adicione termos proibidos (concorrentes).
5. **Testar Judge**: escreva mensagem de exemplo e veja o veredito.
6. Salvar.

**Por que "Bloqueio Total" no início?** Porque você ainda não conhece os limites. Depois de 30 dias, pode mudar para "Alerta" (mais permissivo).

**5. Primeira campanha de teste (5 min)**

**Caminho:** `/dashboard/dispatch/new`

**Passo a passo:**

1. **Nome**: `Teste_Inicial_<data>` (ex: `Teste_Inicial_20260613`).
2. **Coorte**: escolha uma pequena primeiro (sugestão: "Novos" com 50 contatos).
3. **Objetivo da mensagem** (linguagem natural): "Dar boas-vindas aos novos leads, apresentar o produto X, e convidar para uma conversa."
4. **Gerar Copy com Skill** — copywriter cria 3 variações.
5. **Escolha a melhor** ou edite.
6. **Horário**: agende para 30 minutos no futuro.
7. **Frequência**: "Disparo único".
8. **Revisar com Judge** (botão no preview).
9. **Aprovar**.

**Tempo:** ~5 minutos. Agora aguarde 30 minutos até o horário agendado.

**6. Monitorar e iterar (5 min)**

Após o disparo, vá para `/dashboard/dispatch/<id>` e monitore:

- **Enviadas**: contador subindo.
- **Bloqueadas pelo Judge**: se > 20%, copy inadequada.
- **Latência**: se > 5s, problema técnico.
- **Judge selos**: quantas mensagens foram 🟢🟡🔴.

**Após 24 horas**, meça:
- Taxa de abertura (> 70% é meta).
- Taxa de resposta (> 5% é meta).
- Taxa de conversão (> 0.5% é meta).

**Se conversão < 0.5%:** itere. Mude copy OU mude horário OU mude coorte. 1 variável por vez.

**Se conversão > 0.5%:** escale. Aumente base (200, 500, 1000).

**7. Erros comuns do primeiro agente**

- **Erro 1**: Instalar 5+ skills no primeiro agente. Resultado: confusão, custo alto, baixa conversão.
- **Erro 2**: Desativar Judge. Resultado: ban WhatsApp em 7 dias.
- **Erro 3**: Disparar para base inteira logo de cara. Resultado: queima base.
- **Erro 4**: Mudar copy todo dia. Resultado: nunca tem dados suficientes.
- **Erro 5**: Não medir. Resultado: otimização no escuro.
- **Erro 6**: Esperar perfeição na primeira campanha. Resultado: desistência.

**8. Quando expandir para mais skills**

**Após 30 dias** com 3 skills eJudge calibrado, você pode adicionar:

- `analytics-cohort` (análise semanal).
- `automation-cron-trigger` (agendamento automático).
- `copywriter-email` (e-mail marketing).

**Após 60 dias**, considere adicionar:
- `marketing-cohort-recommender`.
- `analytics-funnel`.

**Após 90 dias**, o agente pode ter 5-7 skills e estar em produção plena.

**9. Checklist final**

Antes de considerar seu primeiro agente "pronto":

- [ ] Agente criado com nome descritivo.
- [ ] 3 skills básicas instaladas.
- [ ] Judge configurado em "Bloqueio Total".
- [ ] Whitelist e Blacklist preenchidas.
- [ ] 1 campanha de teste disparada.
- [ ] Métricas de 24h avaliadas.
- [ ] Conversão > 0.5% (ou iterar).
- [ ] Backup de configuração exportado.

**10. Próximo curso**

👉 [`01-skills-essenciais.md`](01-skills-essenciais.md) — Skills Essenciais · 30 min

**Recursos extras:**
- **Apostila 06**: Setup Completo do Agente Pessoal (tutorial 90min com troubleshooting).
- **Apostila 07**: 18 Skills Operacionais Base (catálogo completo).

---

**00 · Seu primeiro agente** --- Trilha Agente

---

## 🎯 Exercícios Práticos — Curso: Seu Primeiro Agente

> **Tempo sugerido:** 45-90 minutos
> **Formato:** individual, com consulta ao painel/ambiente real
> **Entrega:** não há prova formal; use este espaço para fixar o aprendizado

**Exercício 1 — Setup local**

Siga o tutorial da apostila 06. Configure seu primeiro agente localmente. Teste com 3 prompts diferentes.

**Exercício 2 — Identidade**

Escreva um system prompt de 200 palavras para seu agente. Teste, itere 3 vezes, e anote qual versão ficou melhor.

**Exercício 3 — Ferramenta**

Adicione 1 tool real ao seu agente (consultar preço, agendar, enviar e-mail). Teste com 2 cenários reais do seu dia-a-dia.

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

1. Quais são as 4 partes de um agente?
2. O que é um system prompt e por que ele importa mais que o modelo?
3. Cite 2 guardrails essenciais para um agente em produção.
4. Qual a diferença entre memória de curto prazo e longo prazo?
5. Quando NÃO usar um agente (cenário onde é exagero)?

---

## 🚀 Próximos Passos Recomendados

1. **Aplicar imediatamente:** pegue 1 insight deste curso e aplique HOJE.
2. **Medir em 7 dias:** meça o impacto (mesmo que qualitativo).
3. **Compartilhar:** documente o que aprendeu (post, conversa, diário).
4. **Avançar:** siga para o próximo curso da trilha.


*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
