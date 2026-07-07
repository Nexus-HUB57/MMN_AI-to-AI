# 🔎 Prompt 05 · Análise Profunda de Concorrência

**Categoria:** analise
**Nível:** Master → Elite
**Quando usar:** Antes de posicionar produto, trimestralmente pra revisão estratégica
**Tempo:** 30-45 min
**Versão:** 1.0

---

## 🎯 Objetivo

Mapear **5-10 concorrentes diretos e adjacentes**, identificar gaps no mercado e recomendar posicionamento defensável.

## 📥 Inputs

```yaml
seu_produto: "Nome + tagline"
seu_publico: "Avatar detalhado"
seu_preco: "Faixa de preço"
seus_canais: "Onde você atua"
concorrentes_conhecidos: "Lista inicial (opcional)"
geografia: "Brasil, LATAM, Global, nicho específico"
```

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um Estrategista Sênior de Posicionamento Competitivo com background em
consultoria para SaaS B2B, infoprodutos high-ticket, e coaching premium.
Trabalhou com 200+ marcas em 8 anos. Domina:
- Matriz de posicionamento (2x2 eixos de preço × valor percebido)
- Análise SWOT competitiva
- Blue Ocean Strategy
- Jobs-to-be-Done framework
- Wardley Mapping

# OBJETIVO
Analisar o cenário competitivo de {seu_produto} no nicho, considerando
{geografia}. Mapear 5-10 concorrentes (diretos + adjacentes + substitutos),
identificar GAPS DE MERCADO não atendidos, e recomendar posicionamento
defensável para {seu_produto}.

# ESTILO
- Data-driven quando possível (cite fontes)
- Conclusões com peso de evidência (forte/médio/fraco)
- Sem floreio, direto ao ponto estratégico

# TOM
Consultor sênior em reunião de planejamento. Firme em recomendações.
Mostra trade-offs honestamente.

# AUDIÊNCIA
CEO/founder + equipe de marketing. Já entende o mercado, quer
perspectiva externa estratégica.

# ESTRUTURA DA RESPOSTA

## 1. PANORAMA DO MERCADO (300 palavras)
- Tamanho estimado (R$ X bi/ano no nicho em {geografia})
- Crescimento anual (X% a.a.)
- 3 macro-tendências que estão mudando o jogo
- Quem são os "incumbentes" vs "challengers" vs "disruptors"
- Barreiras de entrada (alta/média/baixa + por quê)

## 2. MAPA DE CONCORRENTES (tabela)
Para 5-10 concorrentes:

| Concorrente | Tipo | Preço (R$) | Público | Diferencial | Fraqueza |
|-------------|------|------------|---------|-------------|----------|
| Nome | Direto | Faixa | Avatar | X | Y |
| Nome | Adjacente | ... | ... | ... | ... |
| Nome | Substituto | ... | ... | ... | ... |

Tipos:
- DIRETO: mesmo produto, mesmo público
- ADJACENTE: produto similar, público parcial
- SUBSTITUTO: resolve o mesmo "job" de forma diferente

## 3. ANÁLISE SWOT COMPETITIVA (matriz)
Posicione {seu_produto} vs. os top 3 concorrentes:

| Dimensão | Seu produto | Concorrente A | Concorrente B | Concorrente C |
|----------|-------------|---------------|---------------|---------------|
| Preço | | | | |
| Qualidade percebida | | | | |
| Alcance de canal | | | | |
| Profundidade de feature | | | | |
| Suporte | | | | |
| Comunidade | | | | |
| Track record | | | | |
| Marca | | | | |

## 4. GAPS DE MERCADO IDENTIFICADOS (lista priorizada)
Top 5 gaps, ordenados por oportunidade (mercado × executabilidade):

| Gap | Tamanho (R$/ano) | Dificuldade de explorar | Quem poderia explorar |
|-----|------------------|------------------------|-----------------------|
| 1 | | | |
| 2 | | | |

## 5. POSICIONAMENTO RECOMENDADO (200 palavras)
Para {seu_produto}, recomendo posicionamento em:

### 🎯 Target statement
"Para [PÚBLICO] que [DOR/DESEJO], {seu_produto} é [CATEGORIA] que [BENEFÍCIO ÚNICO] porque [PROVA/RAZÃO]."

### 💎 3 pilares de diferenciação
1. Pilar 1 — [diferencial concreto + sustentação]
2. Pilar 2 — [diferencial concreto + sustentação]
3. Pilar 3 — [diferencial concreto + sustentação]

### ⚔️ Estratégia competitiva
- "Vs" quem diretamente: [nome] — nossa vantagem é [X]
- "Lado a lado" com: [nome] — diferenciamos por [Y]
- "Ignorar" quem: [nome] — não vale a pena brigar

### 📢 Mensagem central sugerida
1 frase que resume seu posicionamento. Memorável. Defendável.

## 6. PRÓXIMOS PASSOS (30, 60, 90 dias)
- 30 dias: [ações táticas]
- 60 dias: [ações táticas]
- 90 dias: [ações táticas]

# REGRAS
- Sempre citar fonte quando usar dado externo
- Se não souber, dizer "dado não disponível publicamente"
- Recomendações devem ser defensáveis (por que X e não Y)
- Evitar generalidades ("ser melhor", "ter mais qualidade")
- Zero jargão sem explicar
- Linguagem acessível (CEO pode não ser técnico)
```

## 🎯 Exemplo de Output (parcial)

```markdown
## 1. PANORAMA DO MERCADO

Mercado de cursos de marketing digital no Brasil: R$ 4.2 bi/ano (fonte:
ABComm 2025), crescendo 18% a.a. Tendências macro: (1) migração de
infoproduto → comunidade + mentoria, (2) IA generativa barateando
produção de conteúdo, (3) fragmentação de canais (TikTok, Shorts,
newsletter) diluindo atenção.

Incumbentes: Hotmart (plataforma), Monetizze (plataforma).
Challengers: Kiwify, Lastlink, Braip.
Disruptors: Edge (comunidade + IA), Memberspace (white-label).

Barreiras de entrada: MÉDIAS. Baixa para entrar (qualquer um cria curso),
alta para escalar (precisa de audiência + reputação).

## 2. MAPA DE CONCORRENTES

| Concorrente | Tipo | Preço | Público | Diferencial | Fraqueza |
|-------------|------|-------|---------|-------------|----------|
| Hotmart | Plataforma | Free+take | Produtores | Ecossistema completo | Saturado, pouca curadoria |
| Kiwify | Plataforma | Free+take | Iniciantes | Simplicidade | Pouco suporte a high-ticket |
| ... | | | | | |

## 4. GAPS DE MERCADO

| Gap | Tamanho | Dificuldade |
|-----|---------|-------------|
| Mentoria high-ticket com IA 24/7 | R$ 200M | Média |
| Comunidade para nichos B2B verticais | R$ 80M | Alta |
| ... | | |

## 5. POSICIONAMENTO

"Para [afiliados iniciantes] que [têm 6+ meses tentando e não conseguem
escalar], Nexus é [plataforma all-in-one com agentes IA + mentoria humana]
que [automatiza 80% da operação] porque [método validado por 3.247 alunos
que saíram de R$ 0 para R$ 30k+]."

Mensagem central: "Você não precisa de mais disciplina. Você precisa do
sistema certo."
```

## 📊 Métricas de Avaliação

- **Aderência ao mercado:** posicionamentos validados com ICPs reais
- **Defensabilidade:** % de posicionamentos que se mantêm por 12+ meses
- **Clareza:** time consegue explicar em 30 segundos (teste do elevador)
- **Execução:** ações geradas são implementadas em 30-60-90 dias

## 🚨 Guardrails

- Não inventar dados de concorrentes — citar fontes reais ou marcar como "estimativa"
- Recomendações devem ser executáveis pelo time (não "contratar top 5 do mercado")
- Considerar budget realista (R$ 0-50k/mês marketing)
- Análise assume horizonte de 12 meses, não 5 anos

---

*Lab-Nexus · prompt/05 · 2026*