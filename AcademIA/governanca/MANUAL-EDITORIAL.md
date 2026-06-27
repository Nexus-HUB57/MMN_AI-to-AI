---
title: "Manual Editorial · Academ'IA"
description: "Padrões profissionais para apostilas, roteiros, webinars, playbooks e materiais de marca da Academ'IA Nexus"
tags: [editorial, padrao, brand, academia, qualidade]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

<!-- placeholders-doc -->

# 📐 Manual Editorial · Academ'IA Nexus

## 1. Identidade da marca

- **Nome oficial:** Academ'IA Nexus (sempre com apóstrofo curvo e capitalização exata)
- **Ecossistema:** Nexus Affil'IA'te
- **Pilares:** IOAID · SHO · Judge · Lab Nexus · Lib Nexus
- **Personas oficiais:** Ive Nexus (host estratégico) e Nexus Alencar (co-host técnico)

## 2. Paleta e tipografia

| Token | Hex | Uso |
|---|---|---|
| Quantum Cyan | `#00E5FF` | destaques primários |
| Quantum Purple | `#8B5CF6` | gradiente e badges |
| Quantum Lime | `#84CC16` | sucessos e novidades |
| Base Dark | `#0B1220` | fundo |
| Slate 300 | `#CBD5E1` | texto secundário |

Tipografia: sans-serif moderna (Inter/Geist no front, equivalente premium em PDF).

## 3. Frontmatter obrigatório

Todo `.md` da Academ'IA deve ter:

```yaml
---
title: "..."
description: "..."
tags: [..., academia]
version: 1.0.0
last_updated: YYYY-MM-DD
status: draft|review|official|archived
---
```

Para aulas e apostilas, incluir também:

```yaml
lesson_id: "<id-do-catalogo>"
track: fundamental|agente|master|elite|treinamento|webinar|playbook
personas: ["Ive Nexus", "Nexus Alencar"]
```

## 4. Estrutura mínima de apostila profissional

Toda apostila deve conter exatamente as 7 seções abaixo, nesta ordem:

1. **Resumo executivo** (3-5 linhas, problema → resultado)
2. **Conceitos-chave** (tabela)
3. **Passo a passo operacional**
4. **Exemplo prático aplicado**
5. **Checklist de execução**
6. **Erros comuns e mitigação**
7. **Próximo passo** (link para a próxima lição)

Padrão mínimo de qualidade:
- ≥ 110 linhas
- ≥ 1 tabela de conceitos
- ≥ 1 checklist
- frontmatter completo
- CTA com link funcional

## 5. Estrutura mínima de roteiro de vídeo aula

1. Hook (Ive Nexus)
2. Mapa da aula
3. Conceito (Ive ou Alencar conforme natureza)
4. Operação (Nexus Alencar)
5. Checklist e erro comum
6. Síntese e CTA (Ive Nexus)

Sempre com:
- duração-alvo declarada
- visual sugerido por cena
- corte curto recomendado
- CTA final apontando aula seguinte

## 6. Tom de voz oficial

- direto, técnico, premium
- evita superlativos vagos ("incrível", "sensacional")
- prefere verbos de ação ("configure", "valide", "execute")
- evita jargão sem definição
- evita promessas irreais ou linguagem de hype

## 7. Anti-padrões proibidos

- conteúdo lorem ipsum em produção
- placeholders `TODO`, `XXX`, `???`
- títulos sem CTA
- aulas sem `next_lesson`
- materiais sem frontmatter
- materiais com `status: draft` enviados a produção

## 8. Versionamento

- SemVer: MAJOR.MINOR.PATCH
- alterações editoriais leves → PATCH
- novos blocos, exemplos ou tabelas → MINOR
- reestruturação de currículo → MAJOR
- toda mudança altera `last_updated`

## 9. Publicação no produto

Toda aula publicada deve:
1. ter `videoUrl` ou justificativa (`status: text-only`)
2. ter `pdfUrl` da apostila correspondente
3. constar em `frontend/src/lib/academia-ead.ts`
4. passar pelo validador (`scripts/academia/validate.mjs`)

## 10. Personas — uso correto

- **Ive Nexus** sempre abre e fecha aulas. Linguagem de direção, oportunidade, resultado.
- **Nexus Alencar** comanda blocos técnicos. Linguagem de processo, validação, evidência.
- Nunca usar uma persona em função da outra.
- Nunca inventar uma terceira persona em material oficial.

---

**Versão 1.0.0** · Documento normativo · Academ'IA Nexus
