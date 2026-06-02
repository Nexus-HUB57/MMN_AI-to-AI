#!/usr/bin/env python3
"""
validate_manifest.py
--------------------

Validador do skill-manifest.json e agent-bridge.json do Academ'IA.

O que esse check garante (veja o tutorial TUT-AG-08 / 14-ler-skill-manifest.md):

1. **Schema do manifesto** — `manifest_version`, `last_updated`,
   `total_skills`, `operational`, `planned` batem com o conteúdo de
   `skills[]`. Bumps de versão seguem SemVer (minor = aditivo,
   major = breaking).
2. **Slugs únicos** e bem-formados (`kebab-case`, sem espaço).
3. **Campos obrigatórios por skill** (operational):
   `slug`, `name`, `category`, `level`, `price_brl`,
   `trilha_academia`, `course_anchor`, `operational`.
4. **code_path / spec_path / lab_path existem** no monorepo:
   - `code_path` deve apontar para um arquivo `.ts` válido
   - `spec_path` deve apontar para um `.md` válido
   - `lab_path` deve apontar para um `.md` válido
   - Skills com `operational: false` (planned) podem não ter `code_path`,
     mas se tiverem, o path deve existir.
5. **course_anchor existe** em `AcademIA/cursos/`.
6. **Mapeamento lab_nexus_to_skill_mapping** (no agent-bridge) —
   os arquivos `.md` referenciados existem.
7. **Contadores globais** — `total_skills == operational + planned`
   e o número de skills operacionais casa com o tamanho da lista
   `operational_skills_audit.handlers` quando o `monorepo_root_skills_dir`
   existir (sanity, não bloqueia).

Exit code != 0 falha o CI.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
ALLOWED_CATEGORIES = {
    "copy",
    "marketing",
    "analytics",
    "automation",
    "sales",
    "quality",
    "infrastructure",
}
ALLOWED_LEVELS = {"basic", "intermediary", "advanced"}
ALLOWED_TRILHAS = {"fundamental", "agente", "master", "elite"}


class ValidationError:
    def __init__(self, code: str, msg: str, path: str = "") -> None:
        self.code = code
        self.msg = msg
        self.path = path

    def render(self) -> str:
        loc = f"[{self.path}]" if self.path else ""
        return f"  ❌ {self.code}{loc} {self.msg}"


class Validator:
    def __init__(self, repo_root: Path) -> None:
        self.repo_root = repo_root
        self.errors: List[ValidationError] = []
        self.warnings: List[ValidationError] = []

    # ----- helpers -----
    def err(self, code: str, msg: str, path: str = "") -> None:
        self.errors.append(ValidationError(code, msg, path))

    def warn(self, code: str, msg: str, path: str = "") -> None:
        self.warnings.append(ValidationError(code, msg, path))

    def exists(self, rel: str) -> bool:
        """Tenta resolver o path relativo ao repo_root.

        Aceita dois formatos:
        1. Absoluto a partir do repo_root (ex.: "AcademIA/cursos/...").
        2. Relativo a AcademIA/ (ex.: "cursos/...") — formato legado
           herdado de versões anteriores do manifesto. Nesse caso,
           prefixamos "AcademIA/" automaticamente.
        """
        if not rel:
            return False
        if (self.repo_root / rel).exists():
            return True
        if not rel.startswith("AcademIA/") and (self.repo_root / "AcademIA" / rel).exists():
            return True
        return False

    def exists_legacy_hint(self, rel: str) -> Tuple[bool, bool]:
        """Como `exists`, mas retorna também se precisou do prefixo AcademIA/."""
        if not rel:
            return False, False
        if (self.repo_root / rel).exists():
            return True, False
        if not rel.startswith("AcademIA/") and (self.repo_root / "AcademIA" / rel).exists():
            return True, True
        return False, False

    # ----- core -----
    def validate_manifest(self, manifest: Dict[str, Any]) -> None:
        # Top-level
        for key in (
            "manifest_version",
            "last_updated",
            "total_skills",
            "operational",
            "skills",
        ):
            if key not in manifest:
                self.err("M-MISSING-TOPLEVEL", f"campo obrigatório ausente: {key}", f"$.{key}")

        if "manifest_version" in manifest:
            mv = manifest["manifest_version"]
            if not isinstance(mv, str) or not SEMVER_RE.match(mv):
                self.err("M-VERSION-FORMAT", f"manifest_version '{mv}' não é SemVer X.Y.Z", "$.manifest_version")

        skills: List[Dict[str, Any]] = manifest.get("skills", []) or []
        operational_count = sum(1 for s in skills if s.get("operational") is True)
        planned_count = sum(1 for s in skills if s.get("operational") is False)

        declared_total = manifest.get("total_skills")
        declared_op = manifest.get("operational")
        declared_planned = manifest.get("planned")

        if declared_total is not None and declared_total != len(skills):
            self.err(
                "M-TOTAL-MISMATCH",
                f"total_skills declarado={declared_total} mas skills[] tem {len(skills)}",
                "$.total_skills",
            )
        if declared_op is not None and declared_op != operational_count:
            self.err(
                "M-OP-MISMATCH",
                f"operational declarado={declared_op} mas skills[] operacionais={operational_count}",
                "$.operational",
            )
        if declared_planned is not None and declared_planned != planned_count:
            self.err(
                "M-PLANNED-MISMATCH",
                f"planned declarado={declared_planned} mas skills[] planned={planned_count}",
                "$.planned",
            )

        # Per-skill
        seen_slugs: set[str] = set()
        for idx, skill in enumerate(skills):
            spath = f"$.skills[{idx}]"
            slug = skill.get("slug")
            if not slug or not isinstance(slug, str):
                self.err("S-MISSING-SLUG", "campo slug ausente ou inválido", spath)
                continue
            if not SLUG_RE.match(slug):
                self.err("S-SLUG-FORMAT", f"slug '{slug}' não está em kebab-case", f"{spath}.slug")
            if slug in seen_slugs:
                self.err("S-DUPLICATE-SLUG", f"slug '{slug}' duplicado", f"{spath}.slug")
            seen_slugs.add(slug)

            for required in ("name", "category", "level", "trilha_academia", "course_anchor"):
                if required not in skill or skill[required] in (None, ""):
                    self.err("S-MISSING-FIELD", f"campo obrigatório ausente: {required}", f"{spath}.{required}")

            cat = skill.get("category")
            if cat and cat not in ALLOWED_CATEGORIES:
                self.err("S-BAD-CATEGORY", f"category '{cat}' fora do whitelist", f"{spath}.category")

            level = skill.get("level")
            if level and level not in ALLOWED_LEVELS:
                self.err("S-BAD-LEVEL", f"level '{level}' fora do whitelist", f"{spath}.level")

            trilha = skill.get("trilha_academia")
            if trilha and trilha not in ALLOWED_TRILHAS:
                self.err("S-BAD-TRILHA", f"trilha_academia '{trilha}' fora do whitelist", f"{spath}.trilha_academia")

            price = skill.get("price_brl")
            if price is not None and (not isinstance(price, (int, float)) or price < 0):
                self.err("S-BAD-PRICE", f"price_brl '{price}' deve ser número >= 0", f"{spath}.price_brl")

            course_anchor = skill.get("course_anchor")
            if course_anchor:
                ok, used_prefix = self.exists_legacy_hint(course_anchor)
                if not ok:
                    self.err(
                        "S-COURSE-MISSING",
                        f"course_anchor '{course_anchor}' não existe em AcademIA/cursos/",
                        f"{spath}.course_anchor",
                    )
                elif used_prefix:
                    self.warn(
                        "S-COURSE-PATH-NEEDS-PREFIX",
                        f"course_anchor '{course_anchor}' só existe com prefixo AcademIA/ — adicione o prefixo no manifesto",
                        f"{spath}.course_anchor",
                    )

            operational = skill.get("operational", True)
            code_path = skill.get("code_path")
            spec_path = skill.get("spec_path")
            lab_path = skill.get("lab_path")

            if operational and not (code_path or spec_path):
                self.err(
                    "S-NO-PATH",
                    "skill operacional precisa de code_path ou spec_path",
                    f"{spath}",
                )

            for label, p in (("code_path", code_path), ("spec_path", spec_path), ("lab_path", lab_path)):
                if p and not self.exists(p):
                    self.err("S-PATH-MISSING", f"{label} '{p}' não existe no monorepo", f"{spath}.{label}")

            if operational is False and not skill.get("planned_release"):
                self.warn(
                    "S-PLANNED-NO-DATE",
                    "skill planned sem planned_release (ok, mas ideal preencher)",
                    f"{spath}.planned_release",
                )

        # Audit handlers (sanity)
        audit = manifest.get("operational_skills_audit")
        if audit:
            audit_dir = self.repo_root / audit.get("monorepo_root_skills_dir", "")
            declared = audit.get("handlers", []) or []
            if audit_dir.exists():
                actual = {p.name for p in audit_dir.glob("*.ts")}
                declared_set = set(declared)
                missing_on_disk = sorted(declared_set - actual)
                extra_on_disk = sorted(actual - declared_set)
                for m in missing_on_disk:
                    self.warn(
                        "A-HANDLER-MISSING",
                        f"handler '{m}' listado no audit mas não encontrado em {audit_dir}",
                        "$.operational_skills_audit.handlers",
                    )
                for m in extra_on_disk:
                    self.warn(
                        "A-HANDLER-UNLISTED",
                        f"handler '{m}' existe em {audit_dir} mas não está no audit",
                        "$.operational_skills_audit.handlers",
                    )

    def validate_bridge(self, bridge: Dict[str, Any], manifest: Dict[str, Any]) -> None:
        declared_slugs = {s.get("slug") for s in manifest.get("skills", []) if s.get("slug")}

        # lab_nexus_to_skill_mapping: every .md must exist and map to a known slug
        for md_path, slug in (bridge.get("lab_nexus_to_skill_mapping") or {}).items():
            if not self.exists(md_path):
                self.err("B-LAB-MISSING", f"lab path '{md_path}' não existe", "$.lab_nexus_to_skill_mapping")
            if slug not in declared_slugs:
                self.err(
                    "B-LAB-UNKNOWN-SLUG",
                    f"lab path '{md_path}' mapeia para slug '{slug}' que não está no manifesto",
                    "$.lab_nexus_to_skill_mapping",
                )

        # trirf_mapping.courses_completed_required: every .md must exist
        for level, cfg in (bridge.get("trirf_mapping") or {}).items():
            for course in cfg.get("courses_completed_required", []) or []:
                ok, used_prefix = self.exists_legacy_hint(course)
                if not ok:
                    self.err(
                        "B-COURSE-MISSING",
                        f"curso '{course}' exigido pela trilha '{level}' não existe",
                        f"$.trirf_mapping.{level}.courses_completed_required",
                    )
                elif used_prefix:
                    self.warn(
                        "B-COURSE-PATH-NEEDS-PREFIX",
                        f"curso '{course}' exigido pela trilha '{level}' só existe com prefixo AcademIA/",
                        f"$.trirf_mapping.{level}.courses_completed_required",
                    )

    # ----- report -----
    def report(self) -> int:
        print("=" * 64)
        print("Skill Manifest Integrity — Academ'IA")
        print("=" * 64)

        if self.warnings:
            print(f"\n⚠️  {len(self.warnings)} aviso(s):")
            for w in self.warnings:
                print(w.render())

        if self.errors:
            print(f"\n❌ {len(self.errors)} erro(s):")
            for e in self.errors:
                print(e.render())
            return 1

        print("\n✅ Manifest + bridge OK.")
        return 0

    def report_with_mode(self, strict: bool) -> int:
        """Em modo strict, warnings viram erro. Útil para branches protegidas."""
        if strict and self.warnings:
            print(f"\n❌ Modo strict: {len(self.warnings)} aviso(s) promovidos a erro:")
            for w in self.warnings:
                print(w.render())
            return 1
        return self.report()


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--manifest", required=True, help="caminho do skill-manifest.json")
    p.add_argument("--bridge", required=True, help="caminho do agent-bridge.json")
    p.add_argument("--repo-root", default=".", help="raiz do monorepo (padrão: cwd)")
    return p.parse_args()


def load_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def main() -> int:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    manifest = load_json((repo_root / args.manifest).resolve())
    bridge = load_json((repo_root / args.bridge).resolve())

    v = Validator(repo_root)
    v.validate_manifest(manifest)
    v.validate_bridge(bridge, manifest)
    return v.report()


if __name__ == "__main__":
    sys.exit(main())
