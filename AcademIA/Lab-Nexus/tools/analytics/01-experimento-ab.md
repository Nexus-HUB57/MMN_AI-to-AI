---
title: "Exemplo"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "01 · Experimento A/B"
description: "Metodologia de A/B test estatisticamente válido para landing pages, e-mails e copy"
tags: [lab-nexus, analytics, ab-test, experimentacao, estatistica]
category: analytics
level: agente
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: ab-test-designer
course_anchor: cursos/master/02-ab-test-judge.md
🧪 01 · Experimento A/B
Metodologia estatística rigorosa para A/B test (significância, poder, duração) + 10 templates de teste prontos.

🎯 Spec
Atributo	Valor
O que é	Framework de experimentação + 10 templates + calculadora de duração
Quando usar	Antes de mudar copy, design, preço, fluxo
Pré-requisitos	Nível 🥈 Agente; tráfego mínimo 1k visitantes/semana
Tempo estimado	30 min para setup + 1-4 semanas de execução
Skill que executa	ab-test-designer
Judge que valida	judge-revisor + judge-revisor-estatistico
📋 Playbook — Os 6 Passos do A/B Test
1. Hipótese
yaml

Copy
formato: "Se [mudo X], então [métrica Y] vai [aumentar/diminuir] em [Z%], porque [razão]"

exemplo: "Se mudo o CTA de 'Saiba mais' para 'Quero garantir minha vaga', então a conversão vai aumentar em 15%, porque é mais específico e gera urgência"
2. Variável única
yaml

Copy
regra: "Mude 1 coisa por vez"

testes_invalidos:

  - "Mudar headline + CTA + cor ao mesmo tempo"

  - "Não saber qual mudança causou o resultado"
3. Tamanho da amostra
yaml

Copy
formula: |

  n = (Z_α/2 + Z_β)² × (p1(1-p1) + p2(1-p2)) / (p1-p2)²

  

  Padrões:

  - α (falso positivo) = 0.05 → Z = 1.96

  - β (falso negativo) = 0.20 → Z = 0.84 (poder 80%)

  - MDE (efeito mínimo detectável) = 10-20% de mudança


exemplo: |

  Baseline: 2% conversão

  Esperado: 3% (+50% relativo)

  Calculado: ~3.800 visitantes por variante

  Total: ~7.600 (50/50)
4. Duração
yaml

Copy
minimo: "1 ciclo de negócio (1 semana para e-commerce, 2-4 para B2B)"

cuidados:

  - "Não parar antes do tempo" (viés do early winner)

  - "Esperar até significância estatística"

  - "Evitar dias atípicos (Black Friday, Natal)"
5. Significância estatística
yaml

Copy
interpretacao:

  p_value: "< 0.05 = 95% de confiança"

  intervalo_confianca: "95% IC = [X%, Y%] (não inclui 0)"

  bayesiano: "Probabilidade de B > A > 95%"


armadilhas:

  - "Não olhe múltiplas vezes (peeking = inflagem de falsos positivos)"

  - "Não pare no primeiro resultado significativo"

  - "Não use 99% confiança sem necessidade (precisa de 2-3x mais amostra)"
6. Decisão e aprendizado
yaml

Copy
resultado_positivo: "Implementar B em 100% do tráfego"

resultado_negativo: "Manter A, documentar aprendizado"

resultado_nulo: "Mudar de hipótese, testar outra coisa"

registro: "Salvar em planilha: hipótese, duração, n, lift, decisão, aprendizado"
📦 Asset (10 Templates de Teste)
🧪 Teste 1 — Headline LP
yaml

Copy
variavel: "Headline principal"

variante_A: "{{resultado}} em {{prazo}}"

variante_B: "Como {{persona}} conseguiu {{resultado}}"

metrica: "LP conversion rate"

mde_esperado: "10-20% lift"
🧪 Teste 2 — CTA
yaml

Copy
variavel: "Texto do botão CTA"

variante_A: "Saiba mais"

variante_B: "Quero garantir minha vaga"

metrica: "Click-through + checkout start"

mde_esperado: "5-15% lift"
🧪 Teste 3 — Cor do botão
yaml

Copy
variavel: "Cor de fundo do CTA"

variante_A: "Azul (#0066FF)"

variante_B: "Laranja (#FF6B35)"

metrica: "CTR do botão"

mde_esperado: "2-8% lift"
🧪 Teste 4 — Imagem Hero
yaml

Copy
variavel: "Imagem/vídeo principal"

variante_A: "Foto do produto"

variante_B: "Vídeo VSL 30s"

metrica: "Tempo na página + LP conversion"

mde_esperado: "20-40% lift"
🧪 Teste 5 — Assunto de e-mail
yaml

Copy
variavel: "Subject line"

variante_A: "{{nome}}, {{1_coisa}}"

variante_B: "{{1_coisa}} que {{resultado}}"

metrica: "Open rate"

mde_esperado: "10-30% lift"
🧪 Teste 6 — Ordem de preço
yaml

Copy
variavel: "Apresentação do preço"

variante_A: "R$ 497 (ou 12x R$ 49)"

variante_B: "12x R$ 49 (ou R$ 497 à vista)"

metrica: "Conversão checkout"

mde_esperado: "5-15% lift"
🧪 Teste 7 — Prova social
yaml

Copy
variavel: "Tipo de prova social"

variante_A: "3 depoimentos em texto"

variante_B: "1 vídeo de depoimento 30s"

metrica: "LP conversion"

mde_esperado: "15-30% lift"
🧪 Teste 8 — Formulário
yaml

Copy
variavel: "Quantidade de campos"

variante_A: "8 campos (nome, email, telefone, ...)"

variante_B: "3 campos (nome, email, whatsapp)"

metrica: "Form completion"

mde_esperado: "20-50% lift"
🧪 Teste 9 — Urgência
yaml

Copy
variavel: "Mensagem de escassez"

variante_A: "Sem menção a vagas"

variante_B: "Restam 12 vagas neste lote"

metrica: "Conversão"

mde_esperado: "5-15% lift"
🧪 Teste 10 — Layout LP
yaml

Copy
variavel: "Estrutura de seção"

variante_A: "VSL + texto + CTA"

variante_B: "Texto + VSL + prova social + CTA"

metrica: "Scroll depth + conversion"

mde_esperado: "10-25% lift"
📦 Asset (Calculadora de Tamanho de Amostra)
python

Copy
def calculate_sample_size(baseline_rate, mde_relative=0.10, alpha=0.05, power=0.80):

    """Calcula tamanho de amostra necessário para A/B test"""

    from scipy.stats import norm

    

    p1 = baseline_rate

    p2 = baseline_rate * (1 + mde_relative)

    

    z_alpha = norm.ppf(1 - alpha/2)

    z_beta = norm.ppf(power)

    

    n = ((z_alpha + z_beta) ** 2 * (p1*(1-p1) + p2*(1-p2))) / (p1-p2) ** 2

    

    return int(n)


# Exemplo

n = calculate_sample_size(baseline_rate=0.02, mde_relative=0.50)

print(f"Precisa de {n} visitantes por variante")

# Output: Precisa de ~3800 visitantes por variante
📊 Métricas de Sucesso
Métrica	Meta
Taxa de execução (testes/mês)	≥ 2
Win rate (% testes com vencedor)	≥ 30%
Lift médio dos winners	≥ 10%
Ciclos curtos	≤ 4 semanas
ROI do A/B	5-10x
⚠️ Riscos & Anti-patterns

❌ Testar sem hipótese → ruído

❌ Mudar várias coisas → não sabe o que causou

❌ Parar no peak (early winner) → falso positivo

❌ Não esperar significância → decisão com dado fraco

❌ Aplicar vencedor sem validar (em horário/dia diferente)

❌ Testar sem baseline confiável

✅ 1 variável por vez

✅ Calcular amostra ANTES

✅ Documentar todo teste (mesmo perdedor)

✅ Validar vencedor em produção

🔗 Próximas ferramentas

→ tools/analytics/02-comparador-taxas-conversao.md — análise complementar

→ tools/analytics/04-atribuicao-multitouch.md — atribuição

→ cursos/master/02-ab-test-judge.md — contexto completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus