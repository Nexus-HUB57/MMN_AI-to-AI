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
    actual_operational = sum(1 for skill in skills if skill.get("operational") is True)
    actual_planned = actual_total - actual_operational

    issues: list[str] = []
    warnings: list[str] = []

    if declared_total != actual_total:
        issues.append(f"total_skills inconsistente: declarado={declared_total}, real={actual_total}")
    if declared_operational != actual_operational:
        issues.append(f"operational inconsistente: declarado={declared_operational}, real={actual_operational}")
    if declared_planned != actual_planned:
        issues.append(f"planned inconsistente: declarado={declared_planned}, real={actual_planned}")

    manifest_slugs: set[str] = set()
    operational_slugs: set[str] = set()
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
            issues.append(f"Level inválido em {slug}: {level!r} (esperado um de {sorted(ALLOWED_LEVELS)})")

        course_anchor = skill.get("course_anchor")
        if not course_anchor:
            issues.append(f"Skill sem course_anchor: {slug}")
        elif not (ROOT / course_anchor).exists():
            issues.append(f"course_anchor inexistente para {slug}: {course_anchor}")

        if skill.get("operational") is True:
            operational_slugs.add(slug)
            code_path = skill.get("code_path")
            if not code_path:
                issues.append(f"Skill operacional sem code_path: {slug}")
            elif not (ROOT / code_path).exists():
                issues.append(f"code_path inexistente para skill operacional {slug}: {code_path}")
        else:
            planned_release = skill.get("planned_release")
            if not planned_release:
                warnings.append(f"Skill planejada sem planned_release: {slug}")

    skill_dispatch = bridge.get("skill_dispatch")
    if not skill_dispatch or not (ROOT / skill_dispatch).exists():
        issues.append(f"skill_dispatch ausente/inexistente no bridge: {skill_dispatch}")

    judge_endpoint = bridge.get("judge_endpoint")
    if not judge_endpoint or not (ROOT / judge_endpoint).exists():
        issues.append(f"judge_endpoint ausente/inexistente no bridge: {judge_endpoint}")

    if bridge.get("agent_runtime") != "backend/src/agentic":
        warnings.append(f"agent_runtime inesperado no bridge: {bridge.get('agent_runtime')}")

    trirf_mapping = bridge.get("trirf_mapping", {})
    for level_name, level_cfg in trirf_mapping.items():
        for slug in level_cfg.get("skills_entitlement", []):
            if slug not in manifest_slugs:
                issues.append(f"Bridge referencia skill ausente no manifesto: {slug} (nível {level_name})")
        for course_path in level_cfg.get("courses_completed_required", []):
            if not (ROOT / course_path).exists():
                issues.append(f"Bridge referencia curso inexistente em {level_name}: {course_path}")

    lab_mapping = bridge.get("lab_nexus_to_skill_mapping", {})
    for lab_path, slug in lab_mapping.items():
        if not (ROOT / lab_path).exists():
            issues.append(f"Lab mapping aponta para arquivo inexistente: {lab_path}")
        if slug not in manifest_slugs:
            issues.append(f"Lab mapping referencia skill ausente no manifesto: {slug}")
        elif slug not in operational_slugs:
            warnings.append(f"Lab mapping usa skill ainda não operacional: {slug}")

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

    print("\nOK: manifesto, bridge e paths estao consistentes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
