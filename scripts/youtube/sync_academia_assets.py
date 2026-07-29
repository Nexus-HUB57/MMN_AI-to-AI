#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

DATE = '2026-07-29'

MASTER_MAPPINGS = [
    (
        'materiais/video-aulas/fundamental/00-boas-vindas/rebuild/video-00-00-boas-vindas-a-academia-nexus-master.mp4',
        'AcademIA/youtube/masters/video-00-boas-vindas-a-academia-nexus-master.mp4',
    ),
]

DIR_MAPPINGS = [
    ('youtube/descriptions', 'AcademIA/youtube/descriptions', ['*.txt']),
    ('youtube/thumbnails', 'AcademIA/youtube/thumbnails', ['*.png', '*.webp', '*.jpg', '*.jpeg']),
    ('youtube/thumbnails_yt', 'AcademIA/youtube/thumbnails_yt', ['*.jpg', '*.jpeg', '*.png', '*.webp']),
]



def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()



def copy_file(src: Path, dst: Path) -> dict[str, object]:
    dst.parent.mkdir(parents=True, exist_ok=True)
    src_hash = sha256_file(src)
    before_hash = sha256_file(dst) if dst.exists() else None
    changed = before_hash != src_hash
    if changed:
        shutil.copy2(src, dst)
    return {
        'source': str(src),
        'target': str(dst),
        'changed': changed,
        'size_bytes': src.stat().st_size,
        'sha256': src_hash,
    }



def collect_dir_files(src_dir: Path, patterns: list[str]) -> list[Path]:
    found: list[Path] = []
    for pattern in patterns:
        found.extend(sorted(src_dir.glob(pattern)))
    uniq = []
    seen = set()
    for path in found:
        key = str(path.resolve())
        if key in seen or not path.is_file():
            continue
        seen.add(key)
        uniq.append(path)
    return uniq



def main() -> int:
    parser = argparse.ArgumentParser(description='Sincroniza ativos canônicos do repositório Academ-IA para o espelho operacional do MMN_AI-to-AI.')
    parser.add_argument('--source-repo', required=True)
    parser.add_argument('--target-root', required=True)
    parser.add_argument('--report', required=True)
    args = parser.parse_args()

    source_repo = Path(args.source_repo).resolve()
    target_root = Path(args.target_root).resolve()
    report_path = Path(args.report).resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)

    report: dict[str, object] = {
        'date': DATE,
        'source_repo': str(source_repo),
        'target_root': str(target_root),
        'copied_files': [],
        'missing_sources': [],
        'summary': {'copied': 0, 'changed': 0, 'missing': 0},
    }

    copied_files: list[dict[str, object]] = []
    missing_sources: list[str] = []

    for src_rel, dst_rel in MASTER_MAPPINGS:
        src = source_repo / src_rel
        dst = target_root / dst_rel
        if not src.exists():
            missing_sources.append(str(src))
            continue
        copied_files.append(copy_file(src, dst))

    for src_rel, dst_rel, patterns in DIR_MAPPINGS:
        src_dir = source_repo / src_rel
        dst_dir = target_root / dst_rel
        if not src_dir.exists():
            missing_sources.append(str(src_dir))
            continue
        for src in collect_dir_files(src_dir, patterns):
            dst = dst_dir / src.name
            copied_files.append(copy_file(src, dst))

    report['copied_files'] = copied_files
    report['missing_sources'] = missing_sources
    report['summary'] = {
        'copied': len(copied_files),
        'changed': sum(1 for item in copied_files if item['changed']),
        'missing': len(missing_sources),
    }

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report['summary'], ensure_ascii=False))
    return 0 if not missing_sources else 0


if __name__ == '__main__':
    raise SystemExit(main())
