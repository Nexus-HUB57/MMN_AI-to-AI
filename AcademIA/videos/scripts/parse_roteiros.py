#!/usr/bin/env python3
"""Extrator de roteiros AcademIA → JSON estruturado por cena.
Output: /workspace/MMN_AI-to-AI/AcademIA/videos/scripts/roteiros_parsed.json
"""
from __future__ import annotations
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path('/workspace/MMN_AI-to-AI/AcademIA')
ROTEIROS = ROOT / 'videos' / 'roteiros'
OUT = ROOT / 'videos' / 'scripts' / 'roteiros_parsed.json'

META = {
    '00': {'title': 'Boas-vindas à AcademIA Nexus', 'persona': 'alencar', 'trilha': 'Fundamental', 'cor': 'cyan', 'lesson': 'fund-00'},
    '01': {'title': 'Entendendo o IOAID', 'persona': 'ive', 'trilha': 'Fundamental', 'cor': 'cyan', 'lesson': 'fund-01'},
    '02': {'title': 'O Sistema SHO', 'persona': 'alencar', 'trilha': 'Fundamental', 'cor': 'cyan', 'lesson': 'fund-02'},
    '03': {'title': 'Painel do Afiliado', 'persona': 'dupla', 'trilha': 'Fundamental', 'cor': 'cyan', 'lesson': 'fund-03'},
    '04': {'title': 'Primeiro Agente', 'persona': 'alencar', 'trilha': 'Agente', 'cor': 'teal', 'lesson': 'agent-00'},
    '05': {'title': 'Skills Essenciais', 'persona': 'alencar', 'trilha': 'Agente', 'cor': 'teal', 'lesson': 'agent-01'},
    '06': {'title': 'Disparo WhatsApp em Escala', 'persona': 'alencar', 'trilha': 'Agente', 'cor': 'teal', 'lesson': 'agent-02'},
    '07': {'title': 'Judge Revisor', 'persona': 'alencar', 'trilha': 'Agente', 'cor': 'teal', 'lesson': 'agent-03'},
    '08': {'title': 'Otimização de Conversão', 'persona': 'dupla', 'trilha': 'Master', 'cor': 'gold', 'lesson': 'master-00'},
    '09': {'title': 'Funis e Lifecycle', 'persona': 'dupla', 'trilha': 'Master', 'cor': 'gold', 'lesson': 'master-01'},
    '10': {'title': 'A/B Testing com Judge', 'persona': 'alencar', 'trilha': 'Master', 'cor': 'gold', 'lesson': 'master-02'},
    '11': {'title': 'Coortes e Churn', 'persona': 'alencar', 'trilha': 'Master', 'cor': 'gold', 'lesson': 'master-03'},
    '12': {'title': 'Blueprints Elite', 'persona': 'dupla', 'trilha': 'Elite', 'cor': 'gold', 'lesson': 'elite-00'},
    '13': {'title': 'Multi-Tenant e White-Label', 'persona': 'alencar', 'trilha': 'Elite', 'cor': 'gold', 'lesson': 'elite-01'},
    '14': {'title': 'Federação de Agentes', 'persona': 'dupla', 'trilha': 'Elite', 'cor': 'gold', 'lesson': 'elite-02'},
}

# Pega fala: "**Persona:**" até a próxima fala "**Outra:**" ou "##"
NARR_RE = re.compile(
    r'\*\*(?:Sr\.?\s*Nexus\s*Alencar|Sra\.?\s*Nexus\s*Ive|Sir\s*Nexus\s*Alencar|Alencar|Ive|Narra\u00e7\u00e3o|Narrador|Voz\s*masculina\s*grave)\s*:\*\*\s*'
    r'(.+?)'
    r'(?=\n\s*\*\*[A-Z\u00C0-\u00DC][^*\n]{2,40}:\*\*|\n\s*##|\Z)',
    re.DOTALL
)
CENA_RE = re.compile(
    r'##\s*[^\n]*?CENA\s*(\d+)\s*[\-\u2014:]\s*([^\n(]+)'
    r'(?:\s*\(?Dura\u00e7\u00e3o:?\s*([\d\.,]+)\s*(?:min|minutos?|s|segundos?)\)?)?'
    r'(?:\s*\((\d+):(\d+)\s*[\-\u2014](\d+):(\d+)\))?',
    re.IGNORECASE
)


def slugify(s: str) -> str:
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s


def extract_narrations(text: str) -> list[str]:
    nars: list[str] = []
    for m in NARR_RE.finditer(text):
        fala = m.group(1).strip()
        fala = re.sub(r'\*+', '', fala)
        fala = re.sub(r'^\s*[-•]\s*', '', fala, flags=re.MULTILINE)
        fala = re.sub(r'\n\s*', ' ', fala)
        fala = re.sub(r'\s+', ' ', fala).strip()
        # remove trailing **Visual:** ou similar
        fala = re.sub(r'\s*\*\*Visual.*$', '', fala, flags=re.DOTALL)
        if fala and len(fala) > 5:
            nars.append(fala)
    # fallback: se nada, pega blockquotes
    if not nars:
        for m in re.finditer(r'^>\s*\*?"?(.+?)"?\*?\s*$', text, re.MULTILINE):
            fala = m.group(1).strip()
            fala = re.sub(r'\*+', '', fala).strip()
            if fala and len(fala) > 15 and not fala.startswith('['):
                nars.append(fala)
    return nars


def parse_roteiro(path: Path) -> dict:
    text = path.read_text(encoding='utf-8')
    code = path.name.split('-')[0]
    meta = META.get(code, {'title': path.stem, 'persona': 'alencar', 'trilha': '?', 'cor': 'cyan', 'lesson': code})
    # Detecta persona do frontmatter
    pm = re.search(r'persona:\s*"?([^"\n]+)"?', text, re.IGNORECASE)
    if pm:
        p = pm.group(1).lower()
        if 'ive' in p and 'alencar' in p:
            meta['persona'] = 'dupla'
        elif 'ive' in p:
            meta['persona'] = 'ive'
        elif 'alencar' in p:
            meta['persona'] = 'alencar'
    # Detecta trilha
    tm = re.search(r'trilha:\s*"?([A-Za-z]+)"?', text, re.IGNORECASE)
    if tm:
        meta['trilha'] = tm.group(1).capitalize()

    cenas = []
    blocks = re.split(r'(?=##\s*.*?CENA\s*\d+)', text)
    for block in blocks:
        m = CENA_RE.search(block)
        if not m:
            continue
        cena_num = int(m.group(1))
        cena_titulo = m.group(2).strip()
        # Duração
        if m.group(3):  # "Duração: X min"
            dur_str = m.group(3).replace(',', '.')
            try:
                dur = float(dur_str)
                if dur < 5:  # provavelmente em minutos
                    dur = int(dur * 60)
                else:
                    dur = int(dur)
            except Exception:
                dur = 15
        elif m.group(4) and m.group(5) and m.group(6) and m.group(7):
            t_ini = int(m.group(4)) * 60 + int(m.group(5))
            t_fim = int(m.group(6)) * 60 + int(m.group(7))
            dur = max(t_fim - t_ini, 5)
        else:
            dur = 15
        nars = extract_narrations(block)
        bullets = re.findall(r'^\s*[-•]\s+(.+)', block, re.MULTILINE)
        # Visual
        vis_m = re.search(r'\*\*Visual:\*\*\s*(.+?)(?=\n\s*\*\*[A-Z]|\n\s*##|\Z)', block, re.DOTALL)
        visual = vis_m.group(1).strip()[:300] if vis_m else ''
        # heurística: se não tem falas mas tem visual com bullets, extrai os bullets
        if not nars and bullets:
            nars = [b.strip().strip('*').strip() for b in bullets[:3] if len(b.strip()) > 10]
        cenas.append({
            'n': cena_num,
            'titulo': cena_titulo,
            'duracao': int(dur),
            'narracoes': nars,
            'bullets': [b.strip().strip('*').strip() for b in bullets[:6]],
            'visual': visual,
        })
    # fallback final: se nada extraído, usa 1 cena de 60s com todos os quotes
    if not cenas:
        all_quotes = re.findall(r'^>\s*\*?"?(.+?)"?\*?\s*$', text, re.MULTILINE)
        all_quotes = [q.strip().strip('*').strip() for q in all_quotes if len(q.strip()) > 15 and not q.strip().startswith('[')]
        cenas = [{'n': 1, 'titulo': meta['title'], 'duracao': 60, 'narracoes': all_quotes[:5], 'bullets': [], 'visual': ''}]
    return {
        'code': code,
        'slug': slugify(path.stem),
        'roteiro_file': str(path.relative_to(ROOT)),
        'meta': meta,
        'cenas': cenas,
        'total_duracao': sum(c['duracao'] for c in cenas),
        'total_narracao_chars': sum(len(' '.join(c['narracoes'])) for c in cenas),
    }


def main():
    parsed = []
    for f in sorted(ROTEIROS.glob('*.md')):
        if 'visao-geral' in f.name or 'infraestrutura-distribuida' in f.name:
            continue
        try:
            data = parse_roteiro(f)
            parsed.append(data)
            n_nars = sum(len(c['narracoes']) for c in data['cenas'])
            chars = sum(len(' '.join(c['narracoes'])) for c in data['cenas'])
            total_d = sum(c['duracao'] for c in data['cenas'])
            print(f"  OK {data['code']} {data['meta']['title'][:30]:30s} | persona={data['meta']['persona']:6s} | {len(data['cenas'])} cenas | {n_nars} falas | {chars:5d} chars | {total_d:4d}s")
        except Exception as e:
            import traceback
            print(f"  ERR {f.name}: {e}")
            traceback.print_exc()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n{len(parsed)} roteiros -> {OUT}")


if __name__ == '__main__':
    main()
