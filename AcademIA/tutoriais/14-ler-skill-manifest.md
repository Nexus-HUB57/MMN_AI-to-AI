---
title: "Como ler e usar o skill-manifest.json"
tutorial_code: TUT-AG-08
level: agente
duration: 12min
prerequisites: ["04-criar-primeiro-agente.md"]
tags: [tutorial, skill-manifest, runtime, agentes, sincronizacao]
last_updated: 2026-06-02
---

# 🧬 Como ler e usar o skill-manifest.json

> **Tempo:** 12 min · **Nível:** Agente · **Pré-requisito:** TUT-AG-04 (primeiro agente)

## Problema

Você precisa entender quais skills estão operacionais, quais estão planejadas, e como elas se conectam aos cursos da Academ'IA — mas a lista de skills está espalhada (código, docs, painel). O `skill-manifest.json` é o ponto único de verdade entre a Academ'IA e o runtime.

## Onde está

```
AcademIA/sync/skill-manifest.json
```

Esse arquivo é carregado pelo `CentralOrchestrator` durante o bootstrap do runtime. Qualquer skill nova tem que aparecer aqui antes de ser roteada.

## Estrutura (top-level)

```json
{
  "manifest_version": "1.0.0",
  "total_skills": 16,
  "operational": 15,
  "planned": 1,
  "skills": [ /* ... */ ]
}
```

| Campo | Significado |
|---|---|
| `manifest_version` | Versão do schema do manifesto. Bump = breaking change. |
| `total_skills` | Tamanho do catálogo (operational + planned) |
| `operational` | Quantas estão realmente prontas no runtime |
| `planned` | Quantas estão anunciadas mas ainda em desenvolvimento |
| `skills[]` | Lista detalhada de cada skill |

## Anatomia de uma skill

```json
{
  "slug": "copywriter-persuasivo",
  "name": "Copywriter Persuasivo",
  "category": "copy",
  "level": "basic",
  "price_brl": 24,
  "trilha_academia": "fundamental",
  "course_anchor": "cursos/fundamental/03-painel-afiliado.md",
  "operational": true,
  "code_path": "backend/src/agentic/skills/copywriterPersuasivo.ts"
}
```

| Campo | Significado |
|---|---|
| `slug` | Identificador técnico único (camelCase, sem espaço) |
| `name` | Nome exibido no painel |
| `category` | Categoria: `copy`, `marketing`, `analytics`, `automation`, `sales`, `quality`, `infrastructure` |
| `level` | Nível de habilidade: `basic`, `intermediary`, `advanced` |
| `price_brl` | Preço de revenda (afiliado compra) em R$ |
| `trilha_academia` | Trilha de curso que ensina a skill |
| `course_anchor` | Curso específico onde a skill é ensinada |
| `operational` | `true` = rodando em produção; `false` = planejada |
| `code_path` | Onde está o código no monorepo |
| `planned_release` (opcional) | Janela de lançamento quando `operational: false` |
| `spec_path` (opcional) | Caminho da spec canônica (quando a skill ainda não tem `.ts`) |

## Como usar (3 cenários)

### Cenário 1 — Auditoria: "quais skills estão operacionais hoje?"

```bash
cd AcademIA/sync
cat skill-manifest.json | jq '.skills[] | select(.operational == true) | .slug' | wc -l
# Saída: 15
```

### Cenário 2 — Mapeamento: "qual curso ensina a skill X?"

```bash
cat skill-manifest.json | jq '.skills[] | select(.slug == "roi-attributor") | {course: .course_anchor, trilha: .trilha_academia}'
# Saída:
# {
#   "course": "cursos/master/00-otimizacao-conversao.md",
#   "trilha": "master"
# }
```

### Cenário 3 — Calcular receita potencial de uma trilha

```bash
# Soma os preços de todas as skills da trilha "master"
cat skill-manifest.json | jq '
  [.skills[] | select(.trilha_academia == "master" and .operational == true) | .price_brl] | add
'
# Saída: 564
```

## Como saber se a skill está disponível para você

A skill aparece no painel do afiliado se:

1. `operational == true` no manifest
2. O usuário tem status compatível (`agents.skills_entitlement` no `agent-bridge.json`)
3. O usuário completou o `course_anchor` (verificado pelo progress na trilha)

Mapa de status → skills permitidas está em:

```
AcademIA/sync/agent-bridge.json → trirf_mapping
```

## Como adicionar uma skill nova

1. Implemente o handler em `backend/src/agentic/skills/<slug>.ts`
2. Crie/atualize o curso-âncora em `AcademIA/cursos/<trilha>/<curso>.md`
3. Adicione o `course_anchor` ao curso (link reverso)
4. Edite `skill-manifest.json`:
   ```json
   {
     "slug": "minha-skill-nova",
     "name": "Minha Skill Nova",
     "category": "marketing",
     "level": "intermediary",
     "price_brl": 50,
     "trilha_academia": "agente",
     "course_anchor": "cursos/agente/<novo-curso>.md",
     "operational": true,
     "code_path": "backend/src/agentic/skills/minhaSkillNova.ts"
   }
   ```
5. Bump `total_skills` e `operational`/`planned`
6. Bump `manifest_version` (minor: `1.0.0` → `1.1.0`)
7. Commit e abra PR — CI valida schema e paths

## Como saber se uma skill está quebrada (apontando pra path inexistente)

```bash
# Lista paths que não existem
cd /workspace/MMN_AI-to-AI
jq -r '.skills[].code_path // empty' AcademIA/sync/skill-manifest.json | while read p; do
  [ -e "$p" ] || echo "❌ $p"
done
```

Esse mesmo check roda no CI em `checks/skill-manifest-integrity.yml`.

## Verificação

- [ ] Sei onde está o `skill-manifest.json`
- [ ] Entendo os campos top-level e por-skill
- [ ] Sei listar skills operacionais da minha trilha
- [ ] Sei mapear uma skill para o curso-âncora
- [ ] Sei o que fazer para adicionar uma skill nova

## Próximo passo

👉 [`04-criar-primeiro-agente.md`](04-criar-primeiro-agente.md) — se ainda não criou seu primeiro agente
👉 [`sync/agent-bridge.json`](../sync/agent-bridge.json) — entenda o mapeamento status ↔ skills

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
