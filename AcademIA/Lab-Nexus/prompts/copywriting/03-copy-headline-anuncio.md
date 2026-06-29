# ✍️ Prompt 03 · Copy de Headline para Anúncio Pago

**Categoria:** copywriting
**Nível:** Agente → Master
**Quando usar:** Antes de criar anúncio Meta/Google/TikTok
**Tempo:** 5 min
**Versão:** 1.0

---

## 🎯 Objetivo

Gerar **5 opções de headline + subhead + CTA** para anúncio pago, otimizadas para CTR, com framework científico de copywriting.

## 📥 Inputs

- **produto/oferta:** nome e descrição (1 linha)
- **publico_alvo:** quem, com quais dores/desejos
- **plataforma:** Meta Ads | Google Ads | TikTok Ads | LinkedIn Ads
- **objetivo:** awareness | consideração | conversão
- **tom_desejado:** provocativo | informativo | emocional | autoridade | urgencia

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um Copywriter Sênior especializado em performance advertising.
Trabalhou em campanhas de R$ 10M+ em Meta, Google e TikTok.
Domina frameworks: AIDA, PAS, BAB, 4Ps, Before-After-Bridge.

# OBJETIVO
Gerar 5 opções de headline (max 40 chars) + subhead (max 80 chars) +
CTA (max 25 chars) para anúncio pago em {plataforma}.
Cada opção deve ser otimizada para {objetivo}.

# ESTILO
- Linguagem concreta, sem clichês ("revolucionário", "transformador", "mágico")
- Números específicos quando possível (não "muitos", mas "3.247")
- Verbos de ação
- Voz ativa
- Zero jargão corporativo

# TOM
{tom_desejado} mas SEM perder credibilidade. Para a persona {publico_alvo}.

# AUDIÊNCIA
{público_alvo} - pessoas reais com dor real.
Atenção escassa (3 segundos para decidir se continua lendo).

# RESPOSTA (5 opções, formato Markdown)
Para CADA uma das 5 opções:
- **Headline:** [texto]
- **Subhead:** [texto]
- **CTA:** [texto]
- **Framework usado:** [PAS/BAB/AIDA/etc]
- **Por que funciona:** [1-2 frases explicando o gatilho psicológico]

# REGRAS
1. Headline: max 40 chars (mobile-friendly)
2. Subhead: max 80 chars
3. CTA: max 25 chars, verb-first ("Quero", "Começar", "Ver demo")
4. Evitar: "Descubra", "Transforme", "Reinvente", "Descubra o segredo"
5. NUNCA mentir ou exagerar
6. Pelo menos 1 opção deve ter número específico
7. Pelo menos 1 opção deve ter emoção (medo/desejo/curiosidade)
8. Pelo menos 1 opção deve ser direta e racional
9. Variar ângulos (não fazer 5 headlines similares)
10. Testar prova social vs benefício vs curiosidade vs escassez
```

## 🎯 Exemplo de Input

```yaml
produto: "Curso Nexus Affil'IA'te — Marketing Digital com IA"
publico: "Empreendedores 30-50 anos, tentando renda extra online há 6+ meses sem sucesso"
plataforma: "Meta Ads"
objetivo: "conversao"
tom: "provocativo + autoridade"
```

## 🎯 Exemplo de Output

```markdown
### Opção 1 — Emoção + Curiosidade
- **Headline:** "Você tenta há 6 meses. Por quê?"
- **Subhead:** "Descobri o erro que 95% cometem nos primeiros 30 dias"
- **CTA:** "Quero entender"
- **Framework:** BAB (Before-After-Bridge)
- **Por que funciona:** A pergunta direta engaja a dor. O subhead valida a dor ("95%") e promete revelar o motivo — gatilho de curiosidade + prova social.

### Opção 2 — Número + Benefício
- **Headline:** "De R$ 0 a R$ 47k/mês em 90 dias"
- **Subhead:** "O método exato usado por 3.247 afiliados Nexus"
- **CTA:** "Quero o método"
- **Framework:** AIDA com prova social
- **Por que funciona:** Número específico de resultado é magnético. "3.247 afiliados" valida credibilidade.

[...3 opções adicionais...]
```

## 📊 Métricas para Testar

- **CTR:** primary KPI em awareness e consideração
- **CPC/CPM:** custo por clique/impression
- **Hook rate (3s views):** quanto tempo a audiência fica
- **CTR por headline:** vencedora vai pra scale, perdedoras pausas

## 🔄 Workflow Sugerido

1. Gerar 5 opções com este prompt
2. Testar em pequena escala (R$ 50/dia cada, 3-5 dias)
3. Vencedora → escala (R$ 500-2000/dia)
4. Após 30 dias, regerar com base em learnings
5. Nunca parar de testar (criativos saturam em 14-30 dias)

---

*Lab-Nexus · prompt/03 · 2026*