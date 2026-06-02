# Release Notes — Academ'IA v1.1.1

**Data:** 2026-06-02
**Tipo:** Patch (sub-release da v1.1.0)
**Compatibilidade:** 100% compatível com v1.1.0 — apenas correções de integridade

---

## Resumo executivo

Esta é uma release de **hygiene de manifestos**. Não entrega nenhuma skill nova de negócio. O que ela entrega é a **rede de segurança** que impede futuras releases de quebrar o catálogo sem ninguém perceber:

1. **GitHub Action novo** (`checks/skill-manifest-integrity.yml`) que valida o `skill-manifest.json` e o `agent-bridge.json` em todo PR.
2. **Validador Python standalone** (`checks/lib/validate_manifest.py`) que faz a checagem real, sem dependências externas.
3. **Correções no manifesto** que pegaram bugs que estavam latentes desde a v1.1.0:
   - 2 skills ditas "operacionais" mas sem handler `.ts` (agora marcadas como `planned`).
   - 3 skills com handler `.ts` existente mas ausentes do manifesto (agora catalogadas).
   - Paths relativos ambíguos (`cursos/...` vs `AcademIA/cursos/...`) prefixados em todos os lugares.

---

## O que mudou (diff resumido)

### Adicionado

| Arquivo | Tipo | Descrição |
|---|---|---|
| `checks/skill-manifest-integrity.yml` | workflow | CI que valida manifestos em todo PR |
| `checks/lib/validate_manifest.py` | script | Validador Python (~250 linhas, sem deps) |
| `RELEASE_NOTES_v1.1.1.md` | doc | Este arquivo |

### Modificado

| Arquivo | Mudança |
|---|---|
| `AcademIA/sync/skill-manifest.json` | Bump 1.1.0 → 1.1.1; 3 skills adicionadas; 2 reclassificadas para planned; `types.ts` adicionado ao audit; 16 `course_anchor` prefixados; bump `total_handlers` 27 → 28 |
| `AcademIA/sync/agent-bridge.json` | 12 `lab_nexus_to_skill_mapping` paths prefixados; 15 `courses_completed_required` paths prefixados |
| `CHANGELOG.md` (raiz) | Entrada v1.1.1 adicionada |
| `AcademIA/CHANGELOG.md` | Entrada v1.1.1 adicionada com métricas |

---

## Por que essa release importa

Sem o workflow novo, o time pode acidentalmente:

- Marcar uma skill como `operational: true` sem ter o handler
- Esquecer de adicionar uma skill nova no manifesto
- Deixar um `course_anchor` apontando para um arquivo que foi renomeado
- Criar uma skill nova no `backend/src/agentic/skills/` sem catalogar

Nenhum desses cenários quebra o build — eles quebram o **runtime**, **silenciosamente**, na primeira vez que o usuário clica. O workflow novo transforma tudo isso em falha vermelha de PR.

---

## Checklist de validação (rodar localmente)

```bash
# 1. Validar manifestos
python3 checks/lib/validate_manifest.py \
  --manifest AcademIA/sync/skill-manifest.json \
  --bridge AcademIA/sync/agent-bridge.json \
  --repo-root .

# Saída esperada: "✅ Manifest + bridge OK."

# 2. Validar JSON syntax
jq . AcademIA/sync/skill-manifest.json > /dev/null
jq . AcademIA/sync/agent-bridge.json > /dev/null

# 3. Conferir que o workflow é YAML válido
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/skill-manifest-integrity.yml'))"
```

---

## Próximos passos

- **v1.1.2 (próximo patch)**: implementar os 3 handlers faltantes
  (`sms-conversacional.ts`, `plano-conteudo-90d.ts`, `backupEncryption.ts`)
  para fechar o ciclo das skills `planned`.
- **v1.2.0 (próxima minor)**: roadmap público do CHANGELOG
  (WS-04 SHO Avançado, WS-05 Federação hands-on, 4 tools, 3 templates,
  sync/audit-log-schema).

---

**Compat:** 100% retrocompatível · **Breaking change:** nenhum
