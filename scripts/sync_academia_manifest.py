#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLBRIDGE_PATH = ROOT / "backend" / "src" / "agentic" / "skills" / "skillBridge.ts"
MANIFEST_PATH = ROOT / "AcademIA" / "sync" / "skill-manifest.json"
BRIDGE_PATH = ROOT / "AcademIA" / "sync" / "agent-bridge.json"

PATTERN = re.compile(
    r"\{ slug: '([^']+)', title: '([^']+)', category: '([^']+)', status: '(operational|in_development|planned)', version: '([^']+)', description: '([^']*)', capabilities: \[([^\]]*)\] \}"
)

TRACK_MAP = {
    "fundamental": {"level": "basic", "course_anchor": "AcademIA/cursos/fundamental/03-painel-afiliado.md"},
    "agente": {"level": "intermediate", "course_anchor": "AcademIA/cursos/agente/01-skills-essenciais.md"},
    "master": {"level": "advanced", "course_anchor": "AcademIA/cursos/master/01-funis-lifecycle.md"},
    "elite": {"level": "advanced", "course_anchor": "AcademIA/cursos/elite/02-federacao-agentes.md"},
}

TRACK_BY_SLUG = {
    "copywriter-persuasivo": "fundamental",
    "analytics-reporter": "fundamental",
    "audience-segmenter": "agente",
    "auto-publisher": "agente",
    "judge-revisor": "agente",
    "follow-up-strategist": "agente",
    "lead-enricher": "agente",
    "objection-handler": "agente",
    "cold-emailer": "agente",
    "content-translator": "agente",
    "social-seller": "agente",
    "webinar-engine": "agente",
    "video-script-writer": "agente",
    "image-prompt-engineer": "agente",
    "viral-hook-generator": "agente",
    "landing-page-builder": "agente",
    "email-sequence-designer": "agente",
    "cart-recovery": "agente",
    "funnel-architect": "master",
    "lifecycle-orchestrator": "master",
    "ab-test-designer": "master",
    "roi-attributor": "master",
    "pricing-optimizer": "master",
    "cohort-analyzer": "master",
    "commission-calculator": "master",
    "creator-matcher": "master",
    "cross-sell-engine": "master",
    "loyalty-architect": "master",
    "seo-strategist": "master",
    "kpi-monitor": "master",
    "churn-predictor": "master",
    "ltv-forecaster": "master",
    "competitor-watcher": "master",
    "market-sentiment-tracker": "master",
    "prospeccao-outbound": "master",
    "detector-tendencias": "master",
    "webhook-router": "elite",
    "fraud-detector": "elite",
    "compliance-auditor": "elite",
    "upsell-strategist": "elite",
    "referral-engineer": "elite",
    "anomaly-detector": "elite",
    "incident-responder": "elite",
    "contract-analyzer": "elite",
    "tax-advisor-br": "elite",
}

CATEGORY_MAP = {
    "content": "copy",
    "analytics": "analytics",
    "publishing": "automation",
    "engagement": "marketing",
    "decision": "quality",
    "targeting": "marketing",
    "strategy": "marketing",
    "prospecting": "sales",
    "sales": "sales",
    "optimization": "analytics",
    "finance": "finance",
    "i18n": "content",
    "matching": "marketing",
    "orchestration": "automation",
    "integration": "automation",
    "security": "security",
    "compliance": "security",
    "outreach": "sales",
    "operations": "operations",
}

SLUG_TO_FILENAME = {
    "copywriter-persuasivo": "copywriterPersuasivo",
    "prospeccao-outbound": "prospeccaoOutbound",
    "detector-tendencias": "detectorTendencias",
    "auto-publisher": "autoPublisher",
    "follow-up-strategist": "followUpStrategist",
    "judge-revisor": "judgeRevisor",
    "analytics-reporter": "analyticsReporter",
    "audience-segmenter": "audienceSegmenter",
    "funnel-architect": "funnelArchitect",
    "lead-enricher": "leadEnricher",
    "objection-handler": "objectionHandler",
    "pricing-optimizer": "pricingOptimizer",
    "ab-test-designer": "abTestDesigner",
    "commission-calculator": "commissionCalculator",
    "content-translator": "contentTranslator",
    "creator-matcher": "creatorMatcher",
    "lifecycle-orchestrator": "lifecycleOrchestrator",
    "webhook-router": "webhookRouter",
    "fraud-detector": "fraudDetector",
    "compliance-auditor": "complianceAuditor",
    "roi-attributor": "roiAttributor",
    "cold-emailer": "coldEmailer",
    "upsell-strategist": "upsellStrategist",
    "social-seller": "socialSeller",
    "webinar-engine": "webinarEngine",
}


def load_catalog() -> list[dict]:
    text = SKILLBRIDGE_PATH.read_text(encoding="utf-8")
    items = []
    for match in PATTERN.finditer(text):
        slug, title, category, status, version, description, capabilities = match.groups()
        caps = [part.strip().strip("'") for part in capabilities.split(",") if part.strip()]
        items.append(
            {
                "slug": slug,
                "title": title,
                "category": category,
                "status": "operational" if slug in {"social-seller", "webinar-engine"} else status,
                "version": version,
                "description": description,
                "capabilities": caps,
            }
        )
    return items


def build_manifest(catalog: list[dict]) -> dict:
    code_files = {
        path.stem: str(path.relative_to(ROOT)).replace("\\", "/")
        for path in (ROOT / "backend" / "src" / "agentic" / "skills").glob("*.ts")
    }

    skills = []
    for item in catalog:
        track = TRACK_BY_SLUG.get(item["slug"], "master")
        track_meta = TRACK_MAP[track]
        operational = item["status"] == "operational"
        entry = {
            "slug": item["slug"],
            "name": item["title"],
            "category": CATEGORY_MAP.get(item["category"], item["category"]),
            "level": track_meta["level"],
            "price_brl": 0,
            "trilha_academia": track,
            "course_anchor": track_meta["course_anchor"],
            "operational": operational,
        }
        filename = SLUG_TO_FILENAME.get(item["slug"])
        if operational and filename in code_files:
            entry["code_path"] = code_files[filename]
        elif not operational:
            entry["planned_release"] = "Q3-2026" if track != "elite" else "Q4-2026"
        skills.append(entry)

    return {
        "manifest_version": "1.1.1",
        "last_updated": "2026-06-03",
        "description": "Manifesto de skills do marketplace Nexus, alinhado ao runtime operacional e às trilhas da Academ'IA.",
        "total_skills": len(skills),
        "operational": sum(1 for skill in skills if skill["operational"]),
        "planned": sum(1 for skill in skills if not skill["operational"]),
        "skills": skills,
    }


def build_bridge() -> dict:
    return {
        "academia_version": "1.1.1",
        "schema_version": "1.0",
        "last_updated": "2026-06-03",
        "description": "Manifesto de sincronização entre a Academ'IA e o runtime dos agentes. Mapeia níveis de conhecimento → bundle de skills → permissões SHO. Carregado pelo CentralOrchestrator durante o bootstrap.",
        "agent_runtime": "backend/src/agentic",
        "skill_dispatch": "backend/src/agentic/skills/dispatcher.ts",
        "judge_endpoint": "backend/src/agentic/skills/judgeRevisor.ts",
        "trirf_mapping": {
            "fundamental": {
                "level": 1,
                "status_required": "cadastrado",
                "skills_entitlement": ["copywriter-persuasivo", "analytics-reporter"],
                "sh": {"confidenceThreshold": 0.70, "autoApprove": True, "riskLimitBRL": 30, "maxDailyMessages": 50},
                "courses_completed_required": [
                    "AcademIA/cursos/fundamental/00-boas-vindas.md",
                    "AcademIA/cursos/fundamental/01-entendendo-ioaid.md",
                    "AcademIA/cursos/fundamental/02-sistema-sho.md",
                    "AcademIA/cursos/fundamental/03-painel-afiliado.md",
                ],
            },
            "agente": {
                "level": 2,
                "status_required": "primeiro_ciclo_ativo",
                "skills_entitlement": ["audience-segmenter", "auto-publisher", "judge-revisor", "follow-up-strategist"],
                "sh": {"confidenceThreshold": 0.75, "autoApprove": True, "riskLimitBRL": 50, "maxDailyMessages": 500},
                "courses_completed_required": [
                    "AcademIA/cursos/agente/00-primeiro-agente.md",
                    "AcademIA/cursos/agente/01-skills-essenciais.md",
                    "AcademIA/cursos/agente/02-disparo-whatsapp.md",
                    "AcademIA/cursos/agente/03-judge-revisor.md",
                ],
            },
            "master": {
                "level": 3,
                "status_required": "tres_ciclos_concluidos",
                "skills_entitlement": ["funnel-architect", "lifecycle-orchestrator", "ab-test-designer", "roi-attributor", "pricing-optimizer", "cohort-analyzer"],
                "sh": {"confidenceThreshold": 0.80, "autoApprove": True, "riskLimitBRL": 200, "maxDailyMessages": 5000},
                "courses_completed_required": [
                    "AcademIA/cursos/master/00-otimizacao-conversao.md",
                    "AcademIA/cursos/master/01-funis-lifecycle.md",
                    "AcademIA/cursos/master/02-ab-test-judge.md",
                    "AcademIA/cursos/master/03-coortes-churn.md",
                ],
            },
            "elite": {
                "level": 4,
                "status_required": "top_10_percent",
                "skills_entitlement": ["webhook-router", "fraud-detector", "compliance-auditor", "social-seller", "webinar-engine"],
                "sh": {"confidenceThreshold": 0.85, "autoApprove": True, "riskLimitBRL": 1000, "maxDailyMessages": 50000},
                "courses_completed_required": [
                    "AcademIA/cursos/elite/00-blueprints-elite.md",
                    "AcademIA/cursos/elite/01-multi-tenant-whitelabel.md",
                    "AcademIA/cursos/elite/02-federacao-agentes.md",
                ],
                "additional_requirements": ["NDA_assigned: true", "lib_nexus_contributions: >= 1", "mentored_count: >= 3"],
            },
        },
        "lab_nexus_to_skill_mapping": {
            "AcademIA/Lab-Nexus/tools/copy/01-headline-persuasiva.md": "copywriter-persuasivo",
            "AcademIA/Lab-Nexus/tools/copy/02-email-frio.md": "cold-emailer",
            "AcademIA/Lab-Nexus/tools/copy/04-whatsapp-persuasivo.md": "copywriter-persuasivo",
            "AcademIA/Lab-Nexus/tools/marketing/01-planejador-editorial.md": "auto-publisher",
            "AcademIA/Lab-Nexus/tools/marketing/02-segmentacao-rfm.md": "audience-segmenter",
            "AcademIA/Lab-Nexus/tools/analytics/02-comparador-taxas-conversao.md": "roi-attributor",
            "AcademIA/Lab-Nexus/tools/analytics/04-atribuicao-multitouch.md": "roi-attributor",
            "AcademIA/Lab-Nexus/tools/analytics/05-coorte-churn.md": "cohort-analyzer",
            "AcademIA/Lab-Nexus/tools/automation/01-webhooks-payload.md": "webhook-router",
            "AcademIA/Lab-Nexus/tools/automation/05-backup-criptografado.md": "compliance-auditor",
        },
        "sync_events": {
            "on_course_completed": "agents.skills_entitlement += level_up",
            "on_certification_achieved": "agents.certifications.push(cert) + audit_log",
            "on_level_promoted": "sh.confidenceThreshold = level_default + audit_log",
            "on_skill_added_in_lab": "skill_manifest.json updated + dispatcher.ts registered",
        },
    }


def main() -> int:
    catalog = load_catalog()
    manifest = build_manifest(catalog)
    bridge = build_bridge()
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    BRIDGE_PATH.write_text(json.dumps(bridge, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Manifesto sincronizado: total={manifest['total_skills']} operational={manifest['operational']} planned={manifest['planned']}")
    print(f"Arquivos atualizados: {MANIFEST_PATH} | {BRIDGE_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
