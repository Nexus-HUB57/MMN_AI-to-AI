---
title: "03 · Lendo o Judge Revisor"
level: agente
duration: 30min
prerequisites: ["02-disparo-whatsapp"]
tags: [judge, lgpd, spam, revisao, alertas]
last_updated: 2026-06-13
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Lendo o Judge Revisor](../../assets/ebook_covers/ACAD-apostila-05-sete-telas-essenciais.webp)

**03 · Lendo o Judge Revisor**

*Trilha Agente · 30 minutos · Pré-requisito: 02-Disparando no WhatsApp*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

O Judge Revisor é o componente mais importante para a sua segurança operacional. Ele é o que te protege de ban do WhatsApp, de multas da LGPD, e de mensagens com tom inadequado. Em 30 minutos, você vai entender como ele funciona, como configurar as regras, como interpretar os vereditos (verde/amarelo/vermelho), e como calibrá-lo ao longo do tempo. Para a interface detalhada, consulte a tela `/dashboard/judge` ou a **Apostila 05** (Tela 04).

**Sumário**

> **•** 1. O que é o Judge Revisor
> **•** 2. Como ele funciona tecnicamente
> **•** 3. Os 3 vereditos
> **•** 4. As 5 categorias de revisão
> **•** 5. Configurando as regras
> **•** 6. Whitelist e Blacklist
> **•** 7. Lendo as reprovações
> **•** 8. Calibrando o Judge ao longo do tempo
> **•** 9. Quando desativar (raramente)
> **•** 10. Próximo curso

---

**1. O que é o Judge Revisor**

O Judge Revisor é um **LLM menor (3B parâmetros)**, afinado especificamente para revisar saídas do seu agente antes de virarem ação. Ele é o filtro final.

**Por que ele existe?**

- LLMs grandes (como o que gera copy) podem produzir texto que viola compliance sem perceber.
- O Judge é uma **segunda opinião** automática, sem custo de tempo.
- Ele aprende com o feedback humano (calibração).

**2. Como ele funciona tecnicamente**

Para cada mensagem gerada pelo copywriter, o Judge:

1. **Lê o texto** e o contexto de uso.
2. **Aplica 5 categorias de revisão** (próxima seção).
3. **Calcula um score** de 0-1.
4. **Emite um veredito** baseado no score e nas regras configuradas.
5. **Registra** a decisão no log.

**Latência típica:** 200-500ms por mensagem. Para 1.000 mensagens, ~5 minutos.

**3. Os 3 vereditos**

**🟢 Aprovado**
- Score > 0.85.
- Mensagem segue sem ressalvas.
- Selo verde no log.

**🟡 Alerta**
- Score 0.5-0.85.
- Mensagem segue, mas fica marcada para revisão humana.
- Aparece em `/dashboard/judge` como "revisar".

**🔴 Bloqueado**
- Score < 0.5.
- Mensagem **não é enviada**.
- Requer aprovação manual.

**4. As 5 categorias de revisão**

**Categoria 1 — LGPD (peso: alto)**
- Verifica: tem consentimento? menciona coleta de dados? pede dados sensíveis?
- Bloqueia: mensagens sem contexto de consentimento, pedido de CPF/senha, etc.
- Configurável em: templates ("Conservador LGPD", "Permissivo", "Custom").

**Categoria 2 — Spam (peso: alto)**
- Verifica: palavras-gatilho ("GRÁTIS", "URGENTE", "CLIQUE AGORA")? repetição de exclamação? caps excessivo?
- Bloqueia: copy com > 2 palavras-gatilho, caps > 30% do texto, > 3 exclamações.

**Categoria 3 — Claim médico/saúde (peso: alto)**
- Verifica: promete cura? usa linguagem absoluta ("100% eficaz", "garantido")?
- Bloqueia: claims sem evidência científica, promessas absolutas.

**Categoria 4 — Tom (peso: médio)**
- Verifica: agressivo? desrespeitoso? passivo-agressivo? inapropriado?
- Bloqueia ou alerta conforme configuração.

**Categoria 5 — Personalização (peso: baixo)**
- Verifica: tem nome do lead? contexto pessoal?
- Alerta (não bloqueia) mensagens genéricas.

**5. Configurando as regras**

**Caminho:** `/dashboard/judge/config`

**Modo de operação:**

- **Bloqueio Total**: qualquer reprovação = 🔴 bloqueia. Recomendado para iniciantes.
- **Alerta**: reprovação = 🟡 alerta (envia, mas marca). Para afiliados experientes.
- **Permissivo**: só bloqueia violações graves. Para cenários de baixo risco.

**Regras habilitadas** (todas recomendadas):

- ✅ LGPD: bloqueio.
- ✅ Spam: bloqueio.
- ✅ Claim médico: bloqueio.
- ✅ Tom: alerta (não bloqueia).
- ✅ Personalização: alerta (não bloqueia).

**6. Whitelist e Blacklist**

**Whitelist**: termos autorizados. O Judge **não** vai reprovar mensagens que contenham esses termos.
- Exemplo: nome do seu produto ("Curso de Copy"), nome do seu mentor, slogans da marca.

**Blacklist**: termos proibidos. O Judge **vai reprovar** mensagens com esses termos.
- Exemplo: nomes de concorrentes, termos ofensivos, promessas proibidas pelo seu produto.

**Como adicionar:** simplesmente cole os termos em `/dashboard/judge/lists` (uma por linha, ou CSV).

**7. Lendo as reprovações**

Vá em `/dashboard/judge` para ver o histórico:

**Cada reprovação mostra:**
- Mensagem original.
- Categoria reprovada (LGPD, spam, etc.).
- Motivo específico ("Contém 'GRÁTIS' em 3+ ocorrências").
- Score.
- Sugestão de reescrita (gerada pelo Judge).

**Como agir:**

- **Se concorda com a reprovação:** descarte a mensagem, ajuste a copy.
- **Se discorda:** adicione o termo à whitelist ou ajuste a regra.

**8. Calibrando o Judge ao longo do tempo**

**Mês 1**: deixe em Bloqueio Total. Não mexa nas regras.

**Mês 2**: analise as reprovações. Se Judge está reprovando mensagens legítimas (> 10%), ajuste a whitelist.

**Mês 3**: considere mudar para modo "Alerta" se você já entendeu os padrões.

**Mês 6+**: ajuste fino por categoria (mais tolerante em tom, mais rigoroso em LGPD).

**Como medir calibração:**

- Reprovações > 20% das mensagens: Judge muito rigoroso.
- Reprovações < 3%: Judge pode estar frouxo.
- Taxa de banimento: 0% (se > 0, Judge não está protegendo o suficiente).

**9. Quando desativar (raramente)**

**Desative apenas em:**

- Ambiente de teste (não produção).
- Debug de copy (quer ver exatamente o que o agente gera).
- Cenário de altíssima confiança com Judge temporariamente sobre-revisando.

**Nunca desative em produção**, mesmo que "seja só hoje". Banimento não avisa antes.

**10. Próximo curso**

Você completou a **Trilha Agente**. Próximo passo:

👉 [`../master/00-otimizacao-conversao.md`](../master/00-otimizacao-conversao.md) — Otimização de Conversão · 45 min

**O que você vai aprender na trilha Master:**
- Otimizar funis com base em coortes.
- A/B test rigoroso com Judge.
- Análise de churn e retenção.
- Reduzir CAC, aumentar LTV.

**Recursos extras:**
- **Apostila 05**: 7 Telas Essenciais (deep dive na Tela 04 - Judge).
- **Apostila 08**: Rotina de Disparo (como revisar Judge todo dia).
- **Apostila 09**: Campanhas Automatizadas (modelos testados).

---

**03 · Lendo o Judge Revisor** --- Trilha Agente

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
