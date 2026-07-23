#!/usr/bin/env python3
"""
Nexus Academy — Gerador de slides B2 (5 slides × 19 vídeos = 95 slides)
Design: Navy #0A1628 + Gold #D4AF37 + Cyan accent #22D3EE
Layout: 1920x1080 @ HTML→PNG via Playwright
"""
import os, re, json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path("/tmp/nexus_p1")
ROTEIROS = ROOT / "roteiros"
OUT = ROOT / "slides"
OUT.mkdir(exist_ok=True)

# Manifest de metadata (extraído dos roteiros)
LESSONS = [
    ("15", "Métricas & ROI",           "Ecossistemas Distribuídos",     "Fundamental", "roi"),
    ("16", "Trilha Fundamental",       "IA do Zero ao Avançado",        "Fundamental", "trilha"),
    ("17", "SEO + IA",                 "Marketing de Conteúdo com IA",  "Master",      "seo"),
    ("18", "Pentest de Agentes",       "Segurança Ofensiva em IA",      "Elite",       "pentest"),
    ("19", "Monetização Elite",        "R$ em Escala com IA",           "Master",      "money"),
    ("20", "Elite Engenharia",         "Trilha Elite de IA Engineering","Elite",       "gears"),
    ("21", "Master Arquitetura",       "Sistemas de IA Escaláveis",     "Master",      "arch"),
    ("22", "Mentoria Master",          "Trilha Master de Mentoria",     "Master",      "mentor"),
    ("23", "RAG Prático",              "Retrieval-Augmented Generation","Curso",       "rag"),
    ("24", "Agents LangGraph",         "Orquestração de Agentes IA",    "Curso",       "agents"),
    ("25", "Prompt Engineering",       "Engenharia de Prompts Elite",   "Curso",       "prompt"),
    ("26", "Vector DB",                "Bancos Vetoriais & Embeddings", "Curso",       "vector"),
    ("27", "Voice AI",                 "Pipeline Conversacional",       "Curso",       "voice"),
    ("28", "Multimodal RAG",           "RAG com Imagem, Áudio, Vídeo",  "Curso",       "multi"),
    ("29", "A2A Protocol",             "A Internet dos Agentes",        "Fundamental", "a2a"),
    ("30", "Zero-Trust",               "Federação Segura para A2A",     "Fundamental", "shield"),
    ("31", "Observability",            "Telemetria & Métricas em IA",   "Elite",       "chart"),
    ("32", "Fine-Tuning",              "Ajuste Fino de LLMs",           "Elite",       "tune"),
    ("33", "AI Safety",                "Governança & Segurança em IA",  "Elite",       "safety"),
]

# Iconografia SVG inline (leve, escalável, sem dependência externa)
ICONS = {
    "roi":     "M3 21h18M3 10l4 4 4-6 4 8 4-12",       # linha sobe
    "trilha":  "M4 6h16M4 12h10M4 18h6",                # linhas
    "seo":     "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",  # lupa
    "pentest": "M12 2L4 6v6c0 5 3 9 8 10 5-1 8-5 8-10V6l-8-4z",# escudo
    "money":   "M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",  # $
    "gears":   "M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v3 M12 19v3 M4 12H2 M22 12h-2",  # gear
    "arch":    "M3 21V9l9-6 9 6v12H3z M9 21v-6h6v6",   # casa/arq
    "mentor":  "M12 3l9 4-9 4-9-4 9-4z M3 11l9 4 9-4 M3 15l9 4 9-4", # graduation
    "rag":     "M4 6h16v4H4z M4 12h16v4H4z M4 18h10v2H4z", # doc chunks
    "agents":  "M6 3a3 3 0 100 6 3 3 0 000-6z M18 3a3 3 0 100 6 3 3 0 000-6z M12 15a3 3 0 100 6 3 3 0 000-6z M9 8l3 4 3-4",
    "prompt":  "M3 4h18v12H8l-5 5V4z",                 # chat bubble
    "vector":  "M12 12L4 4 M12 12l8-8 M12 12L4 20 M12 12l8 8",
    "voice":   "M12 3a3 3 0 013 3v6a3 3 0 11-6 0V6a3 3 0 013-3z M8 12a4 4 0 008 0 M12 19v3",
    "multi":   "M4 6h6v6H4z M14 6h6v6h-6z M4 16h6v4H4z M14 16h6v4h-6z",
    "a2a":     "M5 12h14 M12 5l7 7-7 7",               # arrow
    "shield":  "M12 2L4 6v6c0 5 3 9 8 10 5-1 8-5 8-10V6l-8-4z M9 12l2 2 4-4",
    "chart":   "M3 20V4 M7 20V10 M11 20V6 M15 20V13 M19 20V8",
    "tune":    "M4 6h16 M4 12h8 M4 18h12 M16 4v4 M12 10v4 M18 16v4",
    "safety":  "M12 2L4 6v6c0 5 3 9 8 10 5-1 8-5 8-10V6l-8-4z M12 8v4 M12 16h.01",
}

# Palette
NAVY  = "#0A1628"
NAVY2 = "#0F1E38"
GOLD  = "#D4AF37"
GOLDL = "#F4C842"
CYAN  = "#22D3EE"
WHITE = "#F1F5F9"
GRAY  = "#94A3B8"

def parse_roteiro(md_path):
    """Extrai título + 5 cenas de um roteiro."""
    text = md_path.read_text(encoding="utf-8")
    # Extract title
    tm = re.search(r'title:\s*"([^"]+)"', text)
    title = tm.group(1) if tm else md_path.stem
    # Extract cenas (headings ##)
    scenes = re.findall(r'^##\s+(.+?)$', text, re.M)
    return {"title": title, "scenes": scenes}

def slide_hero(lesson_id, title, subtitle, trilha, icon_key):
    icon = ICONS.get(icon_key, ICONS["roi"])
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:radial-gradient(ellipse at top left,{NAVY2},{NAVY} 70%);
     font-family:'Inter',sans-serif;color:{WHITE};overflow:hidden;position:relative;padding:120px 140px}}
.grid{{position:absolute;inset:0;background-image:linear-gradient({GOLD}0d 1px,transparent 1px),linear-gradient(90deg,{GOLD}0d 1px,transparent 1px);background-size:80px 80px;opacity:.35}}
.badge{{display:inline-flex;align-items:center;gap:14px;background:rgba(212,175,55,.12);border:1px solid {GOLD};padding:14px 28px;border-radius:60px;font-family:'JetBrains Mono';font-size:22px;color:{GOLD};letter-spacing:.15em;font-weight:700}}
.trilha{{display:inline-block;margin-left:20px;padding:10px 22px;background:{CYAN}20;border:1px solid {CYAN};border-radius:40px;color:{CYAN};font-size:20px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}}
h1{{font-size:180px;font-weight:900;line-height:.95;letter-spacing:-.03em;margin-top:60px;background:linear-gradient(135deg,{WHITE} 20%,{GOLDL});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}}
.sub{{font-size:56px;color:{GRAY};margin-top:36px;font-weight:400;letter-spacing:-.01em;max-width:1400px}}
.icon-frame{{position:absolute;top:120px;right:140px;width:280px;height:280px;border:3px solid {GOLD};border-radius:32px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.06);box-shadow:0 0 80px rgba(212,175,55,.3)}}
.icon-frame svg{{width:160px;height:160px;stroke:{GOLD};stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round}}
.footer{{position:absolute;bottom:100px;left:140px;right:140px;display:flex;justify-content:space-between;align-items:flex-end;font-family:'JetBrains Mono';font-size:22px;color:{GRAY}}}
.brand{{color:{GOLD};font-weight:700;letter-spacing:.2em}}
.progress{{width:600px;height:4px;background:{NAVY2};border-radius:2px;overflow:hidden;margin-top:20px}}
.progress span{{display:block;height:100%;background:linear-gradient(90deg,{GOLD},{CYAN});width:{int(int(lesson_id)/33*100)}%;border-radius:2px}}
</style></head><body>
<div class="grid"></div>
<div class="badge">◆ NEXUS ACADEMY · AULA {lesson_id}/19</div>
<span class="trilha">TRILHA {trilha.upper()}</span>
<h1>{title}</h1>
<div class="sub">{subtitle}</div>
<div class="icon-frame"><svg viewBox="0 0 24 24"><path d="{icon}"/></svg></div>
<div class="footer">
  <div><span class="brand">ONEVERSO.COM.BR</span> · academia<div class="progress"><span></span></div></div>
  <div style="text-align:right">Cena 01 · Abertura Cinematográfica</div>
</div>
</body></html>'''

def slide_stats(lesson_id, title, stats):
    """stats: list of (big_number, unit, label)"""
    cards = ""
    for i, (n, u, l) in enumerate(stats[:3]):
        cards += f'''<div class="card"><div class="num">{n}<span class="unit">{u}</span></div><div class="lbl">{l}</div></div>'''
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:{NAVY};font-family:'Inter',sans-serif;color:{WHITE};padding:80px 120px;position:relative}}
.grid{{position:absolute;inset:0;background:linear-gradient(90deg,transparent 49%,{GOLD}08 50%,transparent 51%),linear-gradient(0deg,transparent 49%,{GOLD}08 50%,transparent 51%);background-size:120px 120px;opacity:.4}}
.header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:60px;position:relative;z-index:2}}
.tag{{font-family:'JetBrains Mono';color:{GOLD};font-size:22px;letter-spacing:.2em;font-weight:700}}
.count{{font-family:'JetBrains Mono';color:{GRAY};font-size:22px}}
h2{{font-size:96px;font-weight:900;line-height:1;letter-spacing:-.02em;position:relative;z-index:2;max-width:1500px}}
h2 span{{color:{GOLD}}}
.subtitle{{font-size:36px;color:{GRAY};margin-top:24px;position:relative;z-index:2;max-width:1500px}}
.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:80px;position:relative;z-index:2}}
.card{{background:linear-gradient(135deg,{NAVY2},{NAVY});border:1px solid {GOLD}40;border-radius:24px;padding:60px 48px;position:relative;overflow:hidden}}
.card::before{{content:'';position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,{GOLD},{CYAN})}}
.num{{font-size:140px;font-weight:900;color:{GOLDL};line-height:.9;letter-spacing:-.04em;font-family:'JetBrains Mono'}}
.unit{{font-size:56px;color:{CYAN};margin-left:8px;font-weight:700}}
.lbl{{font-size:26px;color:{GRAY};margin-top:24px;line-height:1.35;font-weight:600}}
.footer{{position:absolute;bottom:60px;left:120px;right:120px;display:flex;justify-content:space-between;font-family:'JetBrains Mono';font-size:20px;color:{GRAY}}}
.brand{{color:{GOLD};font-weight:700;letter-spacing:.2em}}
</style></head><body>
<div class="grid"></div>
<div class="header"><div class="tag">◆ CENA 02 · DATA POINTS</div><div class="count">AULA {lesson_id}/19</div></div>
<h2>Os <span>3 números</span> que mudam tudo</h2>
<div class="subtitle">{title}</div>
<div class="cards">{cards}</div>
<div class="footer"><span class="brand">NEXUS ACADEMY</span><span>oneverso.com.br/academia</span></div>
</body></html>'''

def slide_cards(lesson_id, header, items):
    """items: list of (title, desc)"""
    cards = ""
    for i, (t, d) in enumerate(items[:4]):
        cards += f'''<div class="card"><div class="num">0{i+1}</div><h3>{t}</h3><p>{d}</p></div>'''
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:{NAVY};font-family:'Inter',sans-serif;color:{WHITE};padding:80px 120px;position:relative}}
.orb{{position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient({GOLD}15,transparent 70%);top:-200px;right:-200px}}
.header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px}}
.tag{{font-family:'JetBrains Mono';color:{CYAN};font-size:22px;letter-spacing:.2em;font-weight:700}}
h2{{font-size:88px;font-weight:900;line-height:1;letter-spacing:-.02em;max-width:1600px;position:relative;z-index:2}}
h2 span{{background:linear-gradient(90deg,{GOLD},{CYAN});-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.grid{{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:32px;margin-top:70px}}
.card{{background:linear-gradient(135deg,{NAVY2},#0d1a30);border:1px solid {GOLD}30;border-radius:24px;padding:44px 48px;position:relative;overflow:hidden}}
.card::after{{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient({GOLD},{CYAN})}}
.num{{font-family:'JetBrains Mono';font-size:32px;color:{GOLD};font-weight:700;letter-spacing:.15em}}
h3{{font-size:44px;font-weight:800;margin:12px 0 16px;color:{WHITE};letter-spacing:-.01em}}
.card p{{font-size:24px;color:{GRAY};line-height:1.5;font-weight:400}}
.footer{{position:absolute;bottom:60px;left:120px;right:120px;display:flex;justify-content:space-between;font-family:'JetBrains Mono';font-size:20px;color:{GRAY}}}
.brand{{color:{GOLD};font-weight:700;letter-spacing:.2em}}
</style></head><body>
<div class="orb"></div>
<div class="header"><div class="tag">◆ CENA 03 · FRAMEWORK</div><div class="tag" style="color:{GRAY}">AULA {lesson_id}/19</div></div>
<h2>{header}</h2>
<div class="grid">{cards}</div>
<div class="footer"><span class="brand">NEXUS ACADEMY</span><span>oneverso.com.br/academia</span></div>
</body></html>'''

def slide_pyramid(lesson_id, header, layers):
    """layers: list de camadas (top-down), até 5"""
    n = len(layers)
    rows = ""
    max_w = 1200
    min_w = 280
    for i, (name, desc) in enumerate(layers):
        w = min_w + (max_w-min_w) * (i / max(1, n-1))
        rows += f'''<div class="layer" style="width:{int(w)}px"><div class="lname">{name}</div><div class="ldesc">{desc}</div></div>'''
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:{NAVY};font-family:'Inter',sans-serif;color:{WHITE};padding:80px 120px;position:relative;overflow:hidden}}
.rays{{position:absolute;inset:0;background:conic-gradient(from 90deg at 50% 100%,transparent,{GOLD}18,transparent 40%,{CYAN}12,transparent 60%);opacity:.35}}
.header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;position:relative;z-index:2}}
.tag{{font-family:'JetBrains Mono';color:{GOLD};font-size:22px;letter-spacing:.2em;font-weight:700}}
h2{{font-size:80px;font-weight:900;line-height:1;letter-spacing:-.02em;position:relative;z-index:2}}
h2 span{{color:{GOLD}}}
.pyramid{{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:60px}}
.layer{{background:linear-gradient(90deg,{GOLD}25,{CYAN}15);border:1.5px solid {GOLD};border-radius:16px;padding:22px 40px;text-align:center;transition:.3s;box-shadow:0 8px 32px rgba(212,175,55,.15)}}
.layer:nth-child(1){{background:linear-gradient(90deg,{GOLDL},{GOLD});color:{NAVY}}}
.layer:nth-child(1) .lname,.layer:nth-child(1) .ldesc{{color:{NAVY}}}
.lname{{font-size:32px;font-weight:800;color:{WHITE};letter-spacing:-.005em}}
.ldesc{{font-size:20px;color:{GRAY};margin-top:6px;font-weight:400}}
.layer:nth-child(1) .ldesc{{color:{NAVY};opacity:.75}}
.footer{{position:absolute;bottom:60px;left:120px;right:120px;display:flex;justify-content:space-between;font-family:'JetBrains Mono';font-size:20px;color:{GRAY}}}
.brand{{color:{GOLD};font-weight:700;letter-spacing:.2em}}
</style></head><body>
<div class="rays"></div>
<div class="header"><div class="tag">◆ CENA 04 · HIERARQUIA</div><div class="tag" style="color:{GRAY}">AULA {lesson_id}/19</div></div>
<h2>{header}</h2>
<div class="pyramid">{rows}</div>
<div class="footer"><span class="brand">NEXUS ACADEMY</span><span>oneverso.com.br/academia</span></div>
</body></html>'''

def slide_cta(lesson_id, title, subtitle, icon_key):
    icon = ICONS.get(icon_key, ICONS["roi"])
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:1920px;height:1080px;background:radial-gradient(ellipse at bottom right,{NAVY2},{NAVY});font-family:'Inter',sans-serif;color:{WHITE};position:relative;overflow:hidden}}
.glow{{position:absolute;width:1200px;height:1200px;border-radius:50%;background:radial-gradient({GOLD}20,transparent 60%);top:-400px;left:-400px}}
.container{{padding:120px 140px;position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:space-between}}
.badge{{display:inline-flex;align-items:center;gap:14px;background:{GOLD};color:{NAVY};padding:14px 32px;border-radius:60px;font-family:'JetBrains Mono';font-size:20px;font-weight:800;letter-spacing:.2em;width:fit-content}}
h1{{font-size:170px;font-weight:900;line-height:.9;margin-top:60px;letter-spacing:-.03em;background:linear-gradient(135deg,{WHITE},{GOLDL});-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
.sub{{font-size:52px;color:{GRAY};margin-top:36px;font-weight:400;max-width:1500px}}
.cta{{display:flex;align-items:center;gap:28px;margin-top:60px}}
.url{{background:linear-gradient(90deg,{GOLD},{GOLDL});color:{NAVY};padding:28px 56px;border-radius:20px;font-family:'JetBrains Mono';font-size:44px;font-weight:800;letter-spacing:-.01em;box-shadow:0 12px 40px rgba(212,175,55,.4)}}
.arrow{{font-size:80px;color:{GOLD}}}
.icon-frame{{position:absolute;top:120px;right:140px;width:340px;height:340px;border:4px solid {GOLD};border-radius:36px;display:flex;align-items:center;justify-content:center;background:rgba(212,175,55,.08);box-shadow:0 0 100px rgba(212,175,55,.35)}}
.icon-frame svg{{width:200px;height:200px;stroke:{GOLD};stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round}}
.footer{{display:flex;justify-content:space-between;align-items:flex-end;font-family:'JetBrains Mono';font-size:22px;color:{GRAY}}}
.brand{{color:{GOLD};font-weight:700;letter-spacing:.2em;font-size:26px}}
</style></head><body>
<div class="glow"></div>
<div class="container">
 <div>
  <div class="badge">◆ CENA 05 · CALL TO ACTION</div>
  <h1>{title}</h1>
  <div class="sub">{subtitle}</div>
  <div class="cta"><div class="url">oneverso.com.br/academia</div><div class="arrow">→</div></div>
 </div>
 <div class="footer"><span class="brand">NEXUS ACADEMY · AULA {lesson_id}/19</span><span>Baixe a apostila {lesson_id} agora</span></div>
</div>
<div class="icon-frame"><svg viewBox="0 0 24 24"><path d="{icon}"/></svg></div>
</body></html>'''

# Micro-copy por vídeo (extraído dos roteiros)
COPY = {
    "15": {"stats":[("+1100","%","ROI Direto médio"),("R$5M","/mês","GMV Marketplace"),("13k","","Tenants ativos")],
           "cards_h":"As <span>4 dimensões</span> do ROI Nexus","cards":[("Direto","Receita ÷ Custo — curto prazo, mensuração do afiliado"),("Produtividade","Tempo economizado × valor/hora — médio prazo"),("Estratégico","Opções de futuro — visão de board, longo prazo"),("Sistêmico","Externalidades positivas no ecossistema")],
           "pyr_h":"12 <span>métricas oficiais</span> Nexus","pyr":[("LTV/CAC >15","Métrica-mestre do investidor"),("GMV R$5M/mês","Movimentação do marketplace"),("p99 <200ms","SLA técnico"),("NPS >50","Amor do usuário"),("Churn <2%","Retenção")]},
    "16": {"stats":[("47","","Aulas na trilha"),("70","hrs","Carga horária"),("3","níveis","Do zero ao master")],
           "cards_h":"A <span>trilha</span> completa de IA","cards":[("Fundamental","Base conceitual — LLMs, embeddings, prompts"),("Intermediário","RAG, agents, orquestração LangGraph"),("Master","Arquitetura, fine-tuning, observability"),("Elite","Pentest, safety, monetização em escala")],
           "pyr_h":"Do <span>iniciante</span> ao especialista","pyr":[("Elite","Publicação de skills, monetização, mentoria"),("Master","Arquitetura + fine-tuning + governança"),("Avançado","Agents multi-step + vector DB + RAG"),("Intermediário","Prompt engineering + APIs LLM"),("Fundamental","Conceitos, tokens, embeddings, LLMs")]},
    "17": {"stats":[("-32","%","CTR posição #1 Google (2022→hoje)"),("+450","%","CTR fonte citada em IA"),("8","seg","Tempo médio de leitura em answer engine")],
           "cards_h":"Os <span>4 algoritmos</span> que mudaram tudo","cards":[("RAG","Retrieval-Augmented Generation cita fontes"),("RLHF","Prefere conteúdo autoritativo e estruturado"),("Citation Authority","Ranqueia domínios por grafo de menções"),("Semantic Chunk","Divide texto em blocos de 500 tokens")],
           "pyr_h":"Pirâmide <span>AEO</span> — o que a IA cita","pyr":[("Definition Content","Definições canônicas — camada 7"),("Original Research","Dados primários, surveys — camada 6"),("Expert Commentary","Opinião de especialista — camada 5"),("Guias & tutoriais","Utilitário — camada 3-4"),("Generic Content","Ignorado por IA — camadas 1-2")]},
    "18": {"stats":[("94","%","Agentes vulneráveis a prompt injection"),("$4.5M","","Custo médio de breach IA (2026)"),("18","dias","Tempo médio para detectar")],
           "cards_h":"As <span>4 famílias</span> de ataques","cards":[("Prompt Injection","Manipulação do system prompt via input"),("Jailbreak","Bypass de guardrails via engenharia social"),("Data Exfiltration","Vazamento de contexto por side-channels"),("Supply Chain","Modelo comprometido, dependência maliciosa")],
           "pyr_h":"Metodologia <span>OWASP LLM Top 10</span>","pyr":[("Governance","Políticas + auditoria + red-teaming"),("Model Security","Fine-tuning + guardrails"),("App Security","Sanitização + rate-limit + logging"),("Data Security","Encryption + PII masking"),("Infra Security","Zero-trust + WAF")]},
    "19": {"stats":[("R$50k","/mês","Top afiliado Nexus"),("15","%","Comissão média"),("800","","Skills monetizáveis")],
           "cards_h":"As <span>4 alavancas</span> de monetização","cards":[("Skills próprias","Autoria em marketplace — 60% comissão"),("Afiliação","Indicação com atribuição multi-touch"),("Consultoria","Mentoria paga via plataforma"),("White-label","Deploy customizado para empresas")],
           "pyr_h":"Escala <span>R$ 100k</span>/mês","pyr":[("R$ 100k+","White-label enterprise + saas próprio"),("R$ 50k","Consultoria + mentoria em escala"),("R$ 20k","Portfolio de 5+ skills publicadas"),("R$ 5k","Afiliação ativa + 1 skill"),("R$ 0","Consumidor da plataforma")]},
    "20": {"stats":[("18","meses","Duração média da trilha Elite"),("R$25k","salário","Média junior IA Engineer"),("120","hrs","Projetos práticos")],
           "cards_h":"As <span>4 competências</span> da elite","cards":[("Engineering","Python + APIs LLM + testing"),("Sistemas","LangGraph + vector DB + queues"),("MLOps","CI/CD + monitoring + fine-tuning"),("Domínio","Product-mindset + stakeholder mgmt")],
           "pyr_h":"Do <span>bootcamp</span> à senioridade","pyr":[("Principal Engineer","Arquitetura de plataforma + team leadership"),("Senior","Sistemas distribuídos + code reviews"),("Mid-level","Features + refatorações + docs"),("Junior","Tarefas guiadas + PR pequenas"),("Bootcamp","Fundamentos + primeiros PRs")]},
    "21": {"stats":[("99.9","%","SLA de produção"),("<200","ms","p99 latência"),("1M","","req/dia processados")],
           "cards_h":"Os <span>4 pilares</span> arquiteturais","cards":[("Escalabilidade","Horizontal scaling + auto-scaling"),("Resiliência","Circuit breaker + retry + fallback"),("Observabilidade","Logs + metrics + traces distribuídos"),("Segurança","Zero-trust + rate-limit + WAF")],
           "pyr_h":"Stack <span>enterprise</span> Nexus","pyr":[("Edge","CDN + WAF + rate-limit"),("Gateway","API gateway + auth + rate-limit"),("Orchestration","LangGraph + queues + workflows"),("Storage","Vector DB + relational + cache"),("Observability","Datadog + traces + alerting")]},
    "22": {"stats":[("1:1","","Formato da mentoria"),("12","semanas","Duração do programa"),("+94","%","Taxa de aprovação")],
           "cards_h":"Os <span>4 estágios</span> da mentoria","cards":[("Diagnóstico","Avaliação de skills + gap analysis"),("Roadmap","Plano de estudos + projetos práticos"),("Execução","Sprints semanais + code review"),("Certificação","Projeto final + review de portfolio")],
           "pyr_h":"Trilha <span>Master Mentoria</span>","pyr":[("Master Certificado","Selo Nexus + portfolio review"),("Mentee Senior","Projetos em produção supervisionados"),("Mentee Mid","Projetos com code review semanal"),("Mentee Junior","Exercícios guiados + pair programming"),("Iniciante","Diagnóstico + roadmap personalizado")]},
    "23": {"stats":[("+40","%","Precisão vs LLM puro"),("500","tokens","Chunk size ideal"),("<1s","","Latência retrieval")],
           "cards_h":"Os <span>4 componentes</span> do RAG","cards":[("Chunking","Split semântico com overlap"),("Embedding","OpenAI ada-002 ou open-source"),("Vector Store","Pinecone, Weaviate, pgvector"),("Reranking","Cross-encoder para top-K refinado")],
           "pyr_h":"Maturidade <span>RAG</span> em produção","pyr":[("Adaptive RAG","Query routing + tool use + memory"),("Hybrid RAG","Keyword + semantic + reranking"),("Advanced RAG","Chunking + metadata filtering"),("Naive RAG","Split + embed + retrieve"),("LLM puro","Zero context — baseline")]},
    "24": {"stats":[("8","","Nós em grafo típico"),("3","tools","Média por agente"),("+65","%","Task completion vs single-agent")],
           "cards_h":"Os <span>4 padrões</span> LangGraph","cards":[("Sequential","Grafo linear com tools em cadeia"),("Router","Nó condicional escolhe próximo passo"),("Human-in-loop","Interrupt para aprovação humana"),("Multi-agent","Supervisor + workers colaboram")],
           "pyr_h":"Complexidade <span>LangGraph</span>","pyr":[("Multi-agent","Supervisor + N workers + memory"),("Human-in-loop","Interrupts + resume + audit"),("Router","Condicionais + retry + fallback"),("Sequential","Cadeia linear com tools"),("Single-shot","Prompt+response — baseline")]},
    "25": {"stats":[("7","padrões","Prompts que ranqueiam bem"),("~500","tokens","Sweet spot de contexto"),("+30","%","Precisão com few-shot")],
           "cards_h":"Os <span>4 padrões</span> essenciais","cards":[("Chain-of-Thought","Raciocínio passo-a-passo explícito"),("Few-shot","2-5 exemplos before target"),("Role-based","Persona + tom + restrições"),("Structured Output","JSON schema + validação")],
           "pyr_h":"Maturidade em <span>prompt engineering</span>","pyr":[("Meta-prompting","LLM gera + refina seus próprios prompts"),("Chain-of-Thought","Raciocínio explicitado passo-a-passo"),("Few-shot + role","Exemplos + persona bem definidos"),("Zero-shot","Prompt direto sem exemplos"),("Ad-hoc","Sem estrutura, resultados inconsistentes")]},
    "26": {"stats":[("1536","dims","Embedding OpenAI ada-002"),("<50","ms","Query em 1M vetores"),("HNSW","","Index padrão")],
           "cards_h":"As <span>4 opções</span> de Vector DB","cards":[("Pinecone","SaaS gerenciado, latência baixa"),("Weaviate","Open-source, hybrid search"),("pgvector","Postgres extension, integração fácil"),("Qdrant","Rust, alta performance, self-hosted")],
           "pyr_h":"Trade-offs <span>vector DB</span>","pyr":[("Enterprise SaaS","Pinecone — velocidade + custo alto"),("Open-source cloud","Weaviate/Qdrant — flex + gestão"),("PG extension","pgvector — junto do OLTP"),("SQLite / Local","sqlite-vec para dev/POC"),("Sem vector DB","Full-scan cosine — só para POC")]},
    "27": {"stats":[("<400","ms","Latência end-to-end"),("48","kHz","Sample rate produção"),("+95","%","Precisão STT PT-BR")],
           "cards_h":"Os <span>4 estágios</span> do voice pipeline","cards":[("VAD","Voice Activity Detection segmenta"),("STT","Whisper transcreve para texto"),("LLM","Gera resposta contextual"),("TTS","ElevenLabs/MiniMax sintetiza áudio")],
           "pyr_h":"Maturidade <span>Voice AI</span>","pyr":[("Full-duplex","Interrupções + turn-taking natural"),("Streaming","STT/TTS em streams paralelos"),("Push-to-talk","VAD + STT + LLM + TTS assíncrono"),("Batch","Grava tudo → processa → responde"),("Text-only","Sem áudio, apenas chat")]},
    "28": {"stats":[("4","modalidades","Texto + Imagem + Áudio + Vídeo"),("CLIP","","Embedding cross-modal"),("+55","%","Recall vs text-only")],
           "cards_h":"Os <span>4 componentes</span> Multimodal RAG","cards":[("Text Chunks","Split + embed clássico"),("Image Chunks","CLIP embed + captioning"),("Audio Chunks","Whisper transcript + embed"),("Video Chunks","Frame extraction + description")],
           "pyr_h":"Complexidade <span>Multimodal RAG</span>","pyr":[("Cross-modal","Query texto → recupera imagem/vídeo"),("Unified index","Todas as modalidades em 1 índice"),("Modality-aware","Índices separados + fusion no rerank"),("Text-only","Descrições textuais das mídias"),("Baseline","LLM sem contexto multimodal")]},
    "29": {"stats":[("500+","","Empresas com API A2A"),("1","protocolo","Padrão emergente 2026"),("<50","ms","Handshake médio")],
           "cards_h":"Os <span>4 componentes</span> A2A","cards":[("Discovery","Agentes anunciam capabilities"),("Handshake","Autenticação mútua + capability negotiation"),("Messaging","JSON-RPC + streaming + async"),("Governance","Audit trail + rate-limit + trust")],
           "pyr_h":"Camadas <span>A2A Protocol</span>","pyr":[("Governance","Trust + audit + billing entre agentes"),("Application","Task delegation + result aggregation"),("Session","Handshake + capability + auth mútuo"),("Message","JSON-RPC + streaming + retry"),("Transport","HTTP/gRPC/WebSocket")]},
    "30": {"stats":[("0","confiança","Zero implícita entre agentes"),("mTLS","","Autenticação padrão"),("<10","ms","Overhead de auth")],
           "cards_h":"Os <span>4 pilares</span> Zero-Trust","cards":[("Verify Always","Cada request re-autentica"),("Least Privilege","Escopos mínimos por token"),("Assume Breach","Isolamento + micro-segmentação"),("Audit Everything","Log estruturado + traces")],
           "pyr_h":"Maturidade <span>Zero-Trust A2A</span>","pyr":[("Continuous verification","Behavioral analytics + risk score"),("Micro-segmentação","Isolamento por capability + tenant"),("mTLS + JWT","Autenticação + autorização mútua"),("API Key","Bearer token — mínimo aceitável"),("Sem auth","Só para dev/local — nunca produção")]},
    "31": {"stats":[("3","pilares","Logs + Metrics + Traces"),("30","dias","Retenção padrão"),("<5","%","Overhead ideal")],
           "cards_h":"Os <span>4 sinais</span> essenciais","cards":[("Latency","p50, p95, p99 por endpoint"),("Errors","Rate + tipo + stack traces"),("Traffic","Requests/segundo + payload size"),("Saturation","CPU, memória, filas, tokens LLM")],
           "pyr_h":"Stack <span>observability</span> IA","pyr":[("LLM-specific","Token usage + cost + latency + quality"),("Distributed tracing","OpenTelemetry + Datadog/Jaeger"),("Metrics","Prometheus + Grafana dashboards"),("Structured logs","JSON + índice + retenção"),("Print debug","Só para dev/local")]},
    "32": {"stats":[("+35","%","Precisão vs base model"),("1000","","Samples mínimos ideais"),("<$500","","Custo de fine-tuning")],
           "cards_h":"Os <span>4 métodos</span> de fine-tuning","cards":[("Full FT","Atualiza todos os pesos — caro"),("LoRA","Low-rank adaptation — 10x mais barato"),("QLoRA","LoRA + quantization — 40x mais barato"),("Instruction","Alinhamento com formato de tarefa")],
           "pyr_h":"Decisão <span>fine-tune vs prompt</span>","pyr":[("Full FT","Domínio novo, +10k exemplos"),("QLoRA","Domínio específico, +1k exemplos"),("LoRA","Ajuste de tom/estilo, +100 exemplos"),("Few-shot","Exemplos no prompt — 5-20 casos"),("Zero-shot","Prompt bem escrito — baseline")]},
    "33": {"stats":[("6","dimensões","Frameworks de safety"),("EU AI Act","","Vigente 2026"),("~15","%","Do budget em safety")],
           "cards_h":"Os <span>4 princípios</span> AI Safety","cards":[("Transparency","Model cards + limitações documentadas"),("Fairness","Bias testing + auditoria periódica"),("Robustness","Adversarial testing + red-teaming"),("Governance","Comitê ético + accountability")],
           "pyr_h":"Maturidade <span>AI Safety</span>","pyr":[("Governance formal","Comitê + auditoria + certificação"),("Red-teaming contínuo","Adversarial testing periódico"),("Guardrails","Filtros + rate-limit + PII masking"),("Model cards","Documentação de limitações"),("Zero safety","Deploy sem controles — proibido em produção")]},
}

def gen_all():
    results = []
    for lesson_id, title, subtitle, trilha, icon_key in LESSONS:
        c = COPY[lesson_id]
        htmls = [
            slide_hero(lesson_id, title, subtitle, trilha, icon_key),
            slide_stats(lesson_id, subtitle, c["stats"]),
            slide_cards(lesson_id, c["cards_h"], c["cards"]),
            slide_pyramid(lesson_id, c["pyr_h"], c["pyr"]),
            slide_cta(lesson_id, "Baixe a apostila agora", f"Domine {title} em 70s + apostila completa", icon_key),
        ]
        for i, h in enumerate(htmls, 1):
            html_path = OUT / f"aula-{lesson_id}-cena-{i:02d}.html"
            html_path.write_text(h, encoding="utf-8")
            results.append((lesson_id, i, html_path))
    return results

def render_all(results):
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width":1920,"height":1080}, device_scale_factor=1)
        page = ctx.new_page()
        ok=fail=0
        for lesson_id, i, html_path in results:
            png_path = html_path.with_suffix(".png")
            try:
                page.goto(f"file://{html_path}", wait_until="networkidle", timeout=15000)
                page.screenshot(path=str(png_path), full_page=False, clip={"x":0,"y":0,"width":1920,"height":1080})
                ok += 1
            except Exception as e:
                print(f"FAIL {lesson_id}-{i}: {e}")
                fail += 1
        b.close()
        return ok, fail

if __name__ == "__main__":
    print("═══ Gerando 95 HTMLs...")
    results = gen_all()
    print(f"HTMLs criados: {len(results)}")
    print("═══ Renderizando PNGs via Chromium...")
    ok, fail = render_all(results)
    print(f"OK: {ok}  FAIL: {fail}")
