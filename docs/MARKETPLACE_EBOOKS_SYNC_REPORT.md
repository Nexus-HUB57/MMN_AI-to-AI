# Marketplace Nexus · Sync Report

- Gerado em: `2026-06-28T00:57:21Z`
- Total de ebooks no catálogo: **132**
- HTML publicados em `frontend/public/ebooks/`: **132**
- Capas SVG (fallback) em `frontend/public/ebooks/covers/`: **132**
- Capas WebP copiadas de `assets/ebook_covers/`: **0**
- PDFs placeholder gerados: **132**

Artefatos:

- `frontend/public/ebooks/<slug>.html`
- `frontend/public/ebooks/pdf/<slug>.pdf` (placeholder se WeasyPrint não rodou)
- `frontend/public/ebooks/covers/<slug>.svg` (fallback)
- `frontend/public/ebooks/covers/<slug>.webp` (quando há master em `assets/ebook_covers/`)
- `frontend/src/lib/generated-marketplace-ebooks.ts`
- `_marketplace_nexus_release/manifest_marketplace_ebooks.json`
