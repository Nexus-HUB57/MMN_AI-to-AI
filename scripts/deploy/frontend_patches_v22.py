#!/usr/bin/env python3
"""PRD v2.2 — Patches Cirúrgicos Frontend (Helena Nexus)"""
import os, shutil, sys
from datetime import datetime

FRONTEND = os.environ.get("FRONTEND_PATH", "/var/www/oneverso/current/frontend/src")
STAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
CHANGES = []

def backup(p):
    if os.path.exists(p):
        shutil.copy2(p, f"{p}.bak.prd22.{STAMP}")

def patch(path, reps, desc):
    if not os.path.exists(path):
        CHANGES.append(f"⚠️  SKIP {os.path.basename(path)}")
        return
    backup(path)
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()
    orig = c
    for old, new in reps:
        c = c.replace(old, new)
    if c != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(c)
        CHANGES.append(f"✅ {os.path.basename(path)} — {desc}")
    else:
        CHANGES.append(f"⚪ {os.path.basename(path)} — no-op")

patch(f"{FRONTEND}/pages/Login.tsx", [
    ('placeholder="Nome"', 'placeholder="Email" type="email" autoComplete="email"'),
    ('text-gray-400', 'text-gray-800 dark:text-gray-100 font-medium'),
], "email-only + labels WCAG")

patch(f"{FRONTEND}/pages/AdminUsers.tsx", [
    ('"Papel bloqueado"', '"Alterar papel"'),
    ('disabled={user.role === "admin"}', 'disabled={false}'),
], "role unlock")

patch(f"{FRONTEND}/pages/AdminAcademia.tsx", [
    ('href="#"', 'href={lesson.videoUrl || lesson.video_url || "#"}'),
    ('disabled={true}', 'disabled={!lesson.videoUrl && !lesson.video_url}'),
], "botões dinâmicos")

patch(f"{FRONTEND}/pages/AdminAcademiaAnalytics.tsx", [
    ('text-gray-400', 'text-gray-800 dark:text-gray-100'),
    ('opacity-50', 'opacity-90'),
], "contraste analytics")

patch(f"{FRONTEND}/components/DashboardLayout.tsx", [
    ('E-books (Revenda)', ''),
], "remover ebooks duplicado")

patch(f"{FRONTEND}/pages/AdminRuntime.tsx", [
    ('bg-yellow-200 text-yellow-100', 'bg-yellow-500 text-gray-900 font-bold'),
    ('bg-blue-200 text-blue-100', 'bg-blue-600 text-white font-bold'),
    ('bg-green-200 text-green-100', 'bg-green-600 text-white font-bold'),
], "runtime pills")

tokens = f"{FRONTEND}/styles/tokens.css"
os.makedirs(os.path.dirname(tokens), exist_ok=True)
with open(tokens, "w", encoding="utf-8") as f:
    f.write(""":root{--text-primary:#111827;--text-secondary:#374151;--text-muted:#4b5563}
.dark{--text-primary:#f9fafb;--text-secondary:#e5e7eb;--text-muted:#d1d5db}
.card-text{color:var(--text-primary)}.card-label{color:var(--text-secondary);font-weight:500}""")
CHANGES.append("✅ tokens.css escrito")

print("\n".join(CHANGES))
print(f"\n[PRD v2.2] {len([c for c in CHANGES if c.startswith('✅')])} arquivos alterados | timestamp {STAMP}")
