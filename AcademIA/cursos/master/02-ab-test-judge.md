---
title: "02 · A/B testing com Judge"
level: master
duration: 45min
prerequisites: ["01-funis-lifecycle"]
tags: [ab-test, judge, validacao, significancia, otimizacao]
last_updated: 2026-06-15
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — A/B testing com Judge](../../assets/ebook_covers/ACAD-apostila-07-18-skills-operacionais.webp)

**02 · A/B testing com Judge**

*Trilha Master · 45 minutos · Pré-requisito: 01-Funis e Lifecycle*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

A/B testing é o método científico aplicado a marketing. Hipótese, variação, controle, resultado. Em 45 minutos, você vai aprender a rodar A/B tests rigorosos, evitar os erros que invalidam 80% dos testes caseiros, e usar o Judge Revisor como ferramenta de validação automática. Ao final, você vai rodar seu primeiro teste A/B com significância estatística.

**Sumário**

> **•** 1. O que é A/B testing
> **•** 2. Quando usar e quando NÃO usar
> **•** 3. Anatomia de um teste válido
> **•** 4. Significância estatística explicada simples
> **•** 5. O papel do Judge no A/B test
> **•** 6. Como rodar o primeiro teste
> **•** 7. Análise e decisão
> **•** 8. Erros que invalidam testes
> **•** 9. Quando parar de testar
> **•** 10. Próximo curso

---

**1. O que é A/B testing**

A/B testing é **comparar duas versões** de algo (copy, horário, coorte) e medir qual performa melhor, com **significância estatística**.

É a única forma de saber se a "melhora" que você viu é real ou acaso.

**2. Quando usar e quando NÃO usar**

**✅ Use quando:**
- Tem volume suficiente (> 1.000 leads).
- A diferença esperada é > 5%.
- Quer validar uma hipótese específica.

**❌ NÃO use quando:**
- Volume baixo (< 200 leads). Ruído estatístico é alto.
- A diferença é < 5%. Não vale o esforço.
- Está testando 5 variáveis ao mesmo tempo. Você não vai saber qual funcionou.

**3. Anatomia de um teste válido**

```
[Nome do teste]: Reativação_Natal_CopyV2
[Hipótese]: "Adicionar '20% off' aumenta conversão em 30%"
[Variante A - Controle]: Copy original
[Variante B - Teste]: Copy com "20% off"
[Randomização]: 50% A, 50% B (sorteio por contato)
[Tamanho mínimo]: 1.000 leads (500 em cada)
[Métrica primária]: Taxa de conversão em 7 dias
[Critério de parada]: 95% de significância estatística
[Quem decide]: Skill analytics-ab-test (automatizado)
```

**4. Significância estatística explicada simples**

A "significância estatística" é a confiança de que a diferença observada não é acaso.

- **90%**: razoável, mas com risco de falso positivo.
- **95%**: padrão-ouro da indústria.
- **99%**: altíssima confiança, mas exige muito volume.

**Regra prática:** se você tem 1.000 leads e a conversão A é 5% e B é 7%, isso é ~90% significativo. Espere mais 200 leads para chegar a 95%.

**5. O papel do Judge no A/B test**

O Judge tem 3 papéis importantes no A/B test:

**A — Validar que ambas as variantes são aceitáveis**
- Se Judge reprova uma variante > 30%, ela está contaminada. Exclua.
- Se Judge aprova ambas, o teste é limpo.

**B — Garantir que o teste é justo**
- Judge padroniza: ambas variantes devem passar pelo mesmo filtro.
- Sem Judge, uma variante pode ter 5% de "spam" e outra 0%. Teste viesa.

**C — Detectar viés em tempo real**
- Se Judge reprova mais uma variante que outra (apesar de ambas serem "limpas"), pode haver viés não intencional.

**6. Como rodar o primeiro teste**

**Passo 1**: Vá em `/dashboard/ab-test/new`.

**Passo 2**: Defina:
- **Hipótese** clara: "mudar X causa Y em Z%".
- **Variante A** (controle): versão atual.
- **Variante B** (teste): versão com mudança.
- **Tamanho da amostra**: calculado automaticamente (target 95% de significância).

**Passo 3**: Anexe à campanha:
- Selecione a campanha.
- 50% dos disparos vão para A, 50% para B.
- Randomização por contato (mesmo contato vê sempre a mesma variante).

**Passo 4**: Acompanhe em `/dashboard/ab-test/<id>`:
- Significância atual.
- Vencedor parcial (se houver).
- Estimativa de tempo até conclusão.

**Passo 5**: Aguarde 95% (não menos, mesmo que pareça vencedor).

**7. Análise e decisão**

Quando o teste atinge 95%:

- **Se vencedor claro** (B > A com 95%): promova B para 100% do tráfego.
- **Se perdedor claro** (A > B com 95%): descarte B, mantenha A.
- **Se inconclusivo** (diferença < 5%): mantenha A, crie nova hipótese.
- **Se vencedor com ressalva** (B > A mas Judge reprovou mais B): investigue antes de promover.

**8. Erros que invalidam testes**

- **Erro 1**: Parar cedo. "Já tem vencedor" com 80% de significância = falso positivo em 20% dos casos.
- **Erro 2**: Mudar variantes durante o teste. Você contaminou o teste.
- **Erro 3**: Misturar audiências. Variante A para frios, variante B para ativos = teste viesa.
- **Erro 4**: Ignorar sazonalidade. Testar "Black Friday copy" em março não diz nada.
- **Erro 5**: Olhar para 1 métrica só. Conversão alta com Judge reprovando muito = armadilha.
- **Erro 6**: Reutilizar leads entre testes. Lead viu A no teste 1 e B no teste 2 = contaminado.

**9. Quando parar de testar**

Você está testando demais quando:
- Não tem mais hipóteses (já convergiu).
- A diferença entre variantes é < 2% (margem do ruído).
- O Judge está reprovando mais de 30% de ambas (testes que não prestam).

Regra: **máximo 3 testes simultâneos por agente**. Mais que isso, e nenhum converge com qualidade.

**10. Próximo curso**

👉 [`03-coortes-churn.md`](03-coortes-churn.md) — Análise de coortes e churn · 45 min

**Recursos extras:**
- **Apostila 07**: Skill `analytics-ab-test` (detalhes técnicos).
- **Apostila 09**: 3 modelos de campanha (cada uma testada com 95%+).

---

**02 · A/B testing com Judge** --- Trilha Master

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
