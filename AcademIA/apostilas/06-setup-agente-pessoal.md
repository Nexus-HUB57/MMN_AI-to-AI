---
title: "Setup Completo do Agente Pessoal"
subtitle: "Do Zero ao Primeiro Agente Operacional em 90 Minutos"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-12"
tags: [academia, agente, setup, primeiro-agente, tutorial]
pattern: "MMN_IA"
---

![Capa — Setup Completo do Agente Pessoal](../../assets/ebook_covers/ACAD-apostila-06-setup-agente-pessoal.webp)

**Setup Completo do Agente Pessoal**

*Do Zero ao Primeiro Agente Operacional em 90 Minutos*

**Por MMN_IA Collective · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este documento**

Este é o tutorial definitivo de setup do seu primeiro agente. Se você seguir cada passo, em 90 minutos terá um agente rodando, com 3 skills, Judge calibrado, base segmentada, e 1 campanha de teste aprovada. O documento é longo propositalmente: cada decisão tem contexto. Leia inteiro antes de começar, ou use o sumário para pular direto ao passo que travou. Se você é iniciante total, siga linearmente. Se você já tem agente, use como referência de boas práticas.

**Sumário**

> **•** 1. Antes de começar: o que você precisa ter
> **•** 2. Passo 1 — Criar o agente (5 min)
> **•** 3. Passo 2 — Instalar e configurar as 3 skills básicas (15 min)
> **•** 4. Passo 3 — Configurar o Judge (10 min)
> **•** 5. Passo 4 — Importar e segmentar sua base (15 min)
> **•** 6. Passo 5 — Criar a primeira campanha de teste (10 min)
> **•** 7. Passo 6 — Disparar e monitorar (10 min)
> **•** 8. Passo 7 — Avaliar resultados e iterar (15 min)
> **•** 9. Templates de configuração salvos
> **•** 10. Checklist final de "agente pronto pra produção"

---

**1. Antes de começar: o que você precisa ter**

- **Conta ativa no Nexus Affil'IA'te** (plano gratuito serve pra começar).
- **Token de API** pessoal (gere em `/dashboard/settings/api`).
- **Base de contatos** com pelo menos 100 contatos válidos (não use base fria comprada).
- **Pelo menos 1 produto** com link de afiliado configurado.
- **1 hora e meia** de foco (sem reunião, sem telefone).

**Recomendado mas não obrigatório:**
- 1 conta WhatsApp Business conectada (aumenta conversão).
- Integração com seu CRM (HubSpot, RD Station, etc.) — opcional, 1 webhook resolve.

**2. Passo 1 — Criar o agente (5 min)**

1. Acesse `/dashboard/agents/new`.
2. Dê um nome descritivo: `agente_pessoal_<seu_nome>` (ex: `agente_pessoal_marina`).
3. Defina o objetivo em 1 frase. Exemplo: "Atender leads do nicho de suplementos, qualificar interesse, e direcionar para compra."
4. Escolha o template "Pessoal — Solo Afiliado" (esse é o template mais simples).
5. Clique "Criar".

O sistema vai provisionar o agente (cria sandbox, registra, configura log). Tempo: ~30 segundos.

**3. Passo 2 — Instalar e configurar as 3 skills básicas (15 min)**

Vá em `/dashboard/agents/<id>/skills` e instale, nessa ordem:

**Skill 1: copywriter (copy persuasivo)**
- Versão: 2.3.1 (estável).
- Configuração: tom "consultivo", idioma "pt-BR", tamanho máximo "240 caracteres" (WhatsApp).
- Custo estimado: R$ 0,012 por geração.

**Skill 2: audience-segmenter (segmentador de coorte)**
- Versão: 1.4.0.
- Configuração: deixar padrão (ele já reconhece as 4 coortes padrão).
- Custo estimado: R$ 0,016 por análise.

**Skill 3: judge-revisor (revisor de saída)**
- Versão: 3.0.0 (essencial).
- Configuração: template "Conservador LGPD" (mais rígido, ideal pra começar).
- Custo estimado: R$ 0,004 por revisão.

Clique "Salvar e ativar".

**4. Passo 3 — Configurar o Judge (10 min)**

O Judge é o componente mais importante. Vá em `/dashboard/judge`:

1. **Modo de operação**: "Bloqueio Total" (Judge reprova → mensagem não é enviada). Mude para "Alerta" só quando tiver confiança.

2. **Regras habilitadas** (todas obrigatórias pra começar):
   - ✅ LGPD: bloquear mensagens sem consentimento.
   - ✅ Spam: bloquear palavras-gatilho ("GRÁTIS", "URGENTE", "CLIQUE AGORA").
   - ✅ Claim médico: bloquear claims não suportados por evidência.
   - ✅ Tom: bloquear tom agressivo ou desrespeitoso.
   - ✅ Personalização: exigir nome do lead (mensagens genéricas são alertadas).

3. **Whitelist**: adicione suas palavras-autorizadas (ex: nome do seu produto, slogans da marca).

4. **Blacklist**: adicione palavras que você NUNCA quer enviar (concorrentes, termos ofensivos, etc.).

5. Clique "Testar Judge" — escreva uma mensagem de exemplo e veja o veredito.

6. Salve.

**5. Passo 4 — Importar e segmentar sua base (15 min)**

1. Vá em `/dashboard/contacts/import`.
2. Escolha uma das 3 formas:
   - **Upload CSV**: baixe o template em `/dashboard/contacts/template.csv`.
   - **Webhook de CRM**: cole a URL do seu CRM.
   - **Integração direta**: conecte com HubSpot, RD Station, etc.
3. O sistema vai validar os números (descartar inválidos, marcar duplicatas).
4. Após importar, vá em `/dashboard/cohorts` e veja as 4 coortes padrão criadas automaticamente.
5. (Opcional) Crie 1 coorte custom para teste: "Base 100 — Leads que clicaram no link mas não compraram".

**Tamanho mínimo:** 100 contatos. Se você tem menos, junte com a base geral e faça teste com todo mundo.

**6. Passo 5 — Criar a primeira campanha de teste (10 min)**

1. Vá em `/dashboard/dispatch/new`.
2. **Nome da campanha**: `Teste_Inicial_<data>` (ex: `Teste_Inicial_20260612`).
3. **Coorte**: escolha uma pequena primeiro (ex: 100 contatos frios).
4. **Objetivo da mensagem** (em linguagem natural): "Reativar leads frios oferecendo 15% de desconto no produto X, com tom consultivo, mencionando o último produto que visualizaram".
5. Clique "Gerar Copy com Skill" — o copywriter vai criar 3 variações.
6. Escolha a melhor, ou edite manualmente.
7. **Horário**: agende para daqui 30 minutos (tempo de revisar tudo).
8. **Frequência**: "Disparo único" (você vai avaliar antes de tornar recorrente).
9. **Revise o preview** com Judge.
10. Aprove.

**7. Passo 6 — Disparar e monitorar (10 min)**

1. Clique "Disparar agora" no horário agendado.
2. Vá para `/dashboard/dispatch/<id>` e monitore em tempo real.
3. Observe:
   - **Enviadas**: contador subindo.
   - **Bloqueadas pelo Judge**: se > 20%, reveja a copy.
   - **Latência**: se > 5s, tem problema técnico.
4. Anote o horário, mensagem usada, e coorte (vai precisar no Passo 7).

**8. Passo 7 — Avaliar resultados e iterar (15 min)**

Após 24 horas, volte e meça:

**Métricas mínimas pra avaliar:**
- **Taxa de entrega** (mensagens que chegaram): meta > 95%.
- **Taxa de abertura** (WhatsApp lida): meta > 70%.
- **Taxa de resposta**: meta > 5% (depende do nicho).
- **Taxa de conversão** (compra): meta > 0.5%.

**Se conversão < 0.5%:** itere. Mude copy, mude horário, mude coorte. Teste 1 variável por vez.

**Se conversão > 0.5%:** escale. Aumente a base (ex: 200, 500, 1000 contatos). Mantenha a copy vencedora.

**9. Templates de configuração salvos**

Depois de validar o setup, salve como template para reutilizar:

- **Template A — Reativação de Frios**: copywriter + audience-segmenter + judge conservador.
- **Template B — Boas-vindas Novos**: copywriter + audience-segmenter (coorte novos) + judge permissivo.
- **Template C — Recompra**: copywriter (oferta) + audience-segmenter (coorte ativos) + judge padrão.
- **Template D — Lançamento**: copywriter + audience-segmenter + judge rigoroso (compliance).

**10. Checklist final de "agente pronto pra produção"**

- [ ] Agente criado com nome descritivo
- [ ] 3 skills básicas instaladas
- [ ] Judge configurado com regras LGPD, spam, claim, tom, personalização
- [ ] Whitelist e Blacklist preenchidas
- [ ] Base importada e validada
- [ ] 4 coortes padrão criadas
- [ ] 1 campanha de teste disparada
- [ ] Métricas de 24h avaliadas
- [ ] Conversão > 0.5% atingida
- [ ] Templates salvos
- [ ] Backup da configuração feito (`/dashboard/agents/<id>/export`)
- [ ] Webhook de monitoramento configurado (opcional)

Se todos os itens estão marcados: **seu agente está pronto para produção**. A partir daqui, o trabalho é iterar.

---

**Setup Completo do Agente Pessoal** --- Por MMN_IA Collective

---

## 🎯 Exercícios Práticos Aprofundados — Apostila: Setup do Agente Pessoal

> **Tempo sugerido:** 2-4 horas (apostila é aprofundamento, não curso)
> **Formato:** individual ou em dupla, com consulta ao painel/ambiente real
> **Entrega:** resultados documentados em caderno/planilha/notion pessoal

**Exercício 1 — Setup completo**

Siga o tutorial e suba seu agente pessoal em docker. Tempo esperado: 30-60 min.

**Exercício 2 — Identidade**

Escreva um system prompt de 200+ palavras para SEU agente (não copie template). Teste 5 prompts diferentes.

**Exercício 3 — Skills**

Instale 3 skills do catálogo. Para cada, customize o prompt interno para seu nicho.

**Exercício 4 — Judge**

Configure o Judge com 5 regras do seu nicho. Teste 10 prompts adversariais.

**Exercício 5 — Backup**

Faça backup completo do setup (volume, config, identity). Documente o restore.

---

## ✅ Checklist de Conclusão

Marque conforme for completando:

- [ ] Li a apostila inteira, sem pular seções.
- [ ] Completei os 5 exercícios práticos.
- [ ] Documentei cada exercício (resultados, decisões, próximos passos).
- [ ] Respondi às 7 questões de auto-avaliação (mentalmente, sem colar).
- [ ] Anotei 3 dúvidas que surgiram (para perguntar em webinar/fórum).
- [ ] Identifiquei 1 insight acionável que vou aplicar nas próximas 24h.
- [ ] Compartilhei 1 aprendizado com pelo menos 1 pessoa.
- [ ] Documentei o que essa apostila mudou na minha operação.

---

## 🧠 Auto-Avaliação Avançada (7 questões)

Tente responder **sem consultar a apostila**. Depois, valide:

1. Quais são os pré-requisitos de hardware/software?
2. Qual a diferença entre 'system prompt' e 'few-shot examples'?
3. Como versionar a identidade do agente (controle de mudança)?
4. O que fazer se o Judge bloquear muitas mensagens (falsos positivos)?
5. Como migrar de 'pessoal' para 'equipe' (multi-usuário)?
6. Qual a política de segurança recomendada (secrets, logs, acesso)?
7. Como monitorar uso de tokens e custos?

---

## 🚀 Próximos Passos Recomendados

1. **Aplicar imediatamente:** pegue 1 insight e aplique HOJE.
2. **Medir em 7-30 dias:** meça o impacto (qualitativo + quantitativo).
3. **Documentar:** escreva 1 página sobre o que aprendeu + o que mudou.
4. **Compartilhar:** publique 1 post/conteúdo sobre o tema.
5. **Avançar:** siga para a próxima apostila da trilha.

6. **Consultar materiais relacionados:**


*MMN AI-to-AI · 2026 · Todos os direitos reservados*
