# ⚖️ Prompt 01 · Ratificação de Decisão C-Suite

**Categoria:** governanca
**Nível:** Elite / Executivo
**Quando usar:** Decisões estratégicas que precisam do Governance Loop do Nexus (quorum ed25519 + audit digest sha256)
**Tempo:** 30-60 min
**Versão:** 1.0

---

## 🎯 Objetivo

Estruturar uma **decisão C-Suite** para passar pelo Governance Loop (M4/M5/M7) com quorum válido, registrando audit digest e justificação estratégica.

## 📋 Contexto do Governance Loop Nexus

Toda decisão estratégica segue o fluxo:

```
Proposta → Quorum ed25519 (M4: 2/3 C-Suite) → Ratificação (M5) →
Execução (M7) → Audit Digest (sha256) → Log imutável
```

## 📥 Inputs

```yaml
tipo_decisao: "Ex: aquisição, mudança de preço, novo mercado, demissão estratégica"
proponente: "C-level que está propondo (CEO/CTO/CMO/CFO/COO)"
decisao_proposta: "Descrição clara e objetiva do que será decidido"
valor_estimado: "R$ X ou % participação ou outra métrica"
horizonte: "Curto (≤ 30d) | Médio (30-180d) | Longo (> 180d)"
risco: "Baixo | Médio | Alto | Crítico"
reversibilidade: "Totalmente reversível | Parcialmente | Irreversível"
stakeholders_afetados: "Lista de grupos impactados"
contexto_estrategico: "1-2 parágrafos do momento e por que essa decisão importa AGORA"
alternativas_consideradas: "2-3 alternativas com prós/contras"
```

## 📋 Prompt Estruturado

```
# CONTEXTO
Você é um Conselheiro Estratégico Sênior da C-Suite do Nexus Affil'IA'te.
Tem experiência em governança corporativa, decisões high-stakes,
risco e compliance. Domina:
- Análise de decisão multi-critério (MCDA)
- Matriz de risco (probabilidade × impacto)
- Framework DACI (Driver, Approver, Contributors, Informed)
- Pre-mortem analysis
- Second-order thinking

# OBJETIVO
Estruturar a decisão abaixo para passar pelo Governance Loop Nexus
(quorum ed25519 M4 + ratificação M5 + audit digest M7).

Tipo: {tipo_decisao}
Proponente: {proponente}
Decisão proposta: {decisao_proposta}
Valor estimado: {valor_estimado}
Horizonte: {horizonte}
Risco: {risco}
Reversibilidade: {reversibilidade}
Stakeholders afetados: {stakeholders_afetados}
Contexto: {contexto_estrategico}
Alternativas consideradas: {alternativas_consideradas}

# ESTRUTURA DA RESPOSTA

## 1. RESUMO EXECUTIVO (100 palavras)
- O que está sendo decidido (1 frase)
- Por que AGORA (1 frase)
- Trade-off central (1 frase)
- Recomendação (1 frase)

## 2. CONTEXTO E URGÊNCIA
- Por que essa decisão não pode esperar
- O que acontece se NÃO decidir (custo de inação)
- Janela de oportunidade (se houver)

## 3. ANÁLISE DE ALTERNATIVAS (matriz comparativa)

| Critério (peso) | Alternativa A | Alternativa B | Alternativa C |
|-----------------|---------------|---------------|---------------|
| ROI esperado (25%) | | | |
| Risco (20%) | | | |
| Velocidade execução (15%) | | | |
| Alinhamento estratégico (15%) | | | |
| Reversibilidade (10%) | | | |
| Impacto em equipe (10%) | | | |
| Compliance/legal (5%) | | | |
| **Score ponderado** | | | |

## 4. PRE-MORTEM
Imagine que se passaram 6 meses e essa decisão foi um erro. Liste 5 razões plausíveis pelas quais falhou:
1. ...
2. ...
3. ...
4. ...
5. ...

Para cada razão, qual seria o sinal de alerta precoce?
(estamos olhando para esses sinais?)

## 5. SEGUNDO-ORDEM (Second-Order Thinking)
- Decisão: [proposta]
- 1ª ordem (resultado direto): ...
- 2ª ordem (consequência da 1ª): ...
- 3ª ordem (consequência da 2ª): ...

Se a 3ª ordem é negativa, há como mitigar?

## 6. STAKEHOLDERS E COMUNICAÇÃO

### Quem precisa aprovar (DACI)
- **Driver:** quem move (você)
- **Approver:** quem decide (C-Suite em quorum)
- **Contributors:** quem ajuda a decidir (CTO, CFO, etc)
- **Informed:** quem precisa saber depois (time, parceiros, clientes)

### Como comunicar
- Aprovação: Slack #csuite + email CEO/AI
- Execução: time específico envolvido
- Pós: relatório de progresso em 30-60-90 dias

## 7. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação | Owner |
|-------|---------------|---------|-----------|-------|
| 1 | Alta/Média/Baixa | Alto/Médio/Baixo | ... | |
| 2 | | | | |
| 3 | | | | |

## 8. KPIs DE SUCESSO
Em 30/60/90 dias, como vamos saber se foi boa decisão?

| Marco | Métrica | Meta | Source |
|-------|---------|------|--------|
| 30 dias | | | |
| 60 dias | | | |
| 90 dias | | | |

## 9. PLANO DE REVERSÃO (se aplicável)
Se a decisão tiver que ser revertida, qual é o plano?
- Trigger para reversão (condição X)
- Passos para desfazer (em ordem)
- Custo da reversão (R$, tempo, reputação)
- Comunicação aos afetados

## 10. RECOMENDAÇÃO FINAL

✅ / ❌ / ⏸️ Adiar

Justificativa: ...

Confiança da recomendação (0-100%): X%

Condições para execução: ...

# ESTILO
- Linguagem de conselho de administração
- Sem floreio, sem emoção, fato
- Recomendação clara e defensável
- Trade-offs explicitados

# AUDIÊNCIA
C-Suite (Niko, Ravi, Helena, Otto, Otavio) + sócio humano.
Pessoas que precisam decidir com informação completa.

# REGRAS
1. SEMPRE apresentar ≥ 2 alternativas (não só a favorita)
2. SEMPRE fazer pre-mortem (mesmo que pareça óbvio)
3. SEMPRE considerar second-order effects
4. SEMPRE explicitar reversibilidade
5. SEMPRE ter KPIs de sucesso definidos
6. NUNCA esconder trade-offs
7. NUNCA recomendar sem confiança declarada
8. SEMPRE ligar a visão 12-24 meses da empresa
```

## 🎯 Exemplo de Output (parcial)

```markdown
## 1. RESUMO EXECUTIVO

Decidir se abrimos escritório comercial em São Paulo até 2026-Q4.
Custo de oportunidade alto se não fizermos (time SP remote cobriu mal).
Trade-off central: R$ 180k/ano de custo fixo vs. ganho de R$ 600k/ano
em receita SP.
**Recomendação:** ✅ Aprovar com 75% de confiança, condicionado a
validação com 3 clientes-piloto em 60 dias.

## 3. ANÁLISE DE ALTERNATIVAS

| Critério | A. Abrir SP | B. Manter remote | C. Só contratar 1 closer SP |
|----------|-------------|-------------------|------------------------------|
| ROI esperado | 3.3× | 1× | 2.1× |
| Risco | Alto | Baixo | Médio |
| Velocidade | 6 meses | Imediato | 2 meses |
| ... | | | |

## 4. PRE-MORTEM

Se falhou em 6 meses, pode ser:
1. Contratação errada do country manager (60 dias para saber)
2. Custo fixo de R$ 180k consome runway (mensalmente visível)
3. Clientes SP preferem negociar com matriz RJ (survey em 90 dias)
...

## 10. RECOMENDAÇÃO FINAL

✅ Aprovar com 75% de confiança

Condições:
- Contratar country manager validado em 60 dias (senão abortar)
- 3 clientes-piloto em pipeline em 30 dias
- Review formal em 90 dias com go/no-go
```

## 🔗 Fluxo Pós-Aprovação

```
1. Proponente submete via `governance-loop --propose`
2. Sistema coleta assinaturas ed25519 de 2/3 C-Suite
3. Audit digest sha256 gerado
4. Log imutável gravado (M7)
5. Execução inicia com owner designado
6. Review automático em 30/60/90 dias
```

## 📚 Materiais Relacionados

- `governanca/C-SUITE-AI.md` — composição e mandato da C-Suite
- `Lib-Nexus/best-practices/04-seguranca-agentes.md` — segurança
- `apostilas/19-monetizacao-avancada-escala.md` — decisões de receita
- `Lab-Nexus/prompts/estrategia/05-okr-trimestral-equipe.md` — execução pós-decisão

---

*Lab-Nexus · prompt/governanca/01 · 2026*