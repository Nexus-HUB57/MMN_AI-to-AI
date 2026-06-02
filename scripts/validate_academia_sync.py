#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "AcademIA" / "sync" / "skill-manifest.json"
BRIDGE_PATH = ROOT / "AcademIA" / "sync" / "agent-bridge.json"

ALLOWED_LEVELS = {"basic", "intermediate", "advanced"}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    manifest = load_json(MANIFEST_PATH)
    bridge = load_json(BRIDGE_PATH)

    skills = manifest.get("skills", [])
    declared_total = manifest.get("total_skills")
    declared_operational = manifest.get("operational")
    declared_planned = manifest.get("planned")

    actual_total = len(skills)
    actual_operational = sum(1 for s in skills if s.get("operational") is True)
    actual_planned = actual_total - actual_operational

    issues: list[str] = []
    warnings: list[str] = []

    if declared_total != actual_total:
        issues.append(
            f"total_skills inconsistente: declarado={declared_total}, real={actual_total}"
        )
    if declared_operational != actual_operational:
        issues.append(
            f"operational inconsistente: declarado={declared_operational}, real={actual_operational}"
        )
    if declared_planned != actual_planned:
        issues.append(
            f"planned inconsistente: declarado={declared_planned}, real={actual_planned}"
        )

    manifest_slugs = set()
    for skill in skills:
        slug = skill.get("slug")
        if not slug:
            issues.append("Skill sem slug no manifesto")
            continue
        if slug in manifest_slugs:
            issues.append(f"Slug duplicado no manifesto: {slug}")
        manifest_slugs.add(slug)

        level = skill.get("level")
        if level not in ALLOWED_LEVELS:
            issues.append(
                f"Level inválido em {slug}: {level!r} (esperado um de {sorted(ALLOWED_LEVELS)})"
            )

        if skill.get("operational") is True:
            code_path = skill.get("code_path")
            if not code_path:
                issues.append(f"Skill operacional sem code_path: {slug}")
            else:
                full_path = ROOT / code_path
                if not full_path.exists():
                    issues.append(
                        f"code_path inexistente para skill operacional {slug}: {code_path}"
                    )

    trirf_mapping = bridge.get("trirf_mapping", {})
    for level_name, level_cfg in trirf_mapping.items():
        for slug in level_cfg.get("skills_entitlement", []):
            if slug not in manifest_slugs:
                issues.append(
                    f"Bridge referencia skill ausente no manifesto: {slug} (nível {level_name})"
                )

    if bridge.get("agent_runtime") != "backend/src/agentic":
        warnings.append(
            f"agent_runtime inesperado no bridge: {bridge.get('agent_runtime')}"
        )

    print("== VALIDACAO ACADEMIA SYNC ==")
    print(f"manifest: {MANIFEST_PATH}")
    print(f"bridge:   {BRIDGE_PATH}")
    print(f"skills declaradas: total={declared_total}, operational={declared_operational}, planned={declared_planned}")
    print(f"skills reais:      total={actual_total}, operational={actual_operational}, planned={actual_planned}")

    if warnings:
        print("\nWARNINGS:")
        for item in warnings:
            print(f"- {item}")

    if issues:
        print("\nISSUES:")
        for item in issues:
            print(f"- {item}")
        return 1

    print("\nOK: manifesto e bridge estao consistentes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
