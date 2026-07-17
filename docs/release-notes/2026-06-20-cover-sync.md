# Release Notes — 2026-06-20 · Sincronização de Capas Oficiais

## Marketplace Nexus — Capas premium restauradas

Sincronização das capas oficiais do repositório `assets/ebook_covers/` com o catálogo de produção em `https://oneverso.com.br/marketplaces`.

### Antes vs Depois

| Métrica | Antes | Depois |
|---|---:|---:|
| Total ebooks | 201 | 201 |
| Capas premium (≥80KB) | 162 | **192** |
| Capas genéricas Pillow (<80KB) | 39 | 0 |
| Capas oficiais pequenas do repo | 0 | 9 (preservadas como estão no repo) |
| Capas faltando | 0 | 0 |

### Coleções com capas restauradas

| Coleção | Capas Restauradas |
|---|---:|
| Nexus Affil'IA'te Store (Claude + Genspark) | 6 |
| Coleção MMN_IA | 18 |
| Coleção A IA Perfeita (vol1 + vol2 V1 premium) | 2 |
| Coleção As Novas Profissões da IA | 5 |
| Coleção IAs para Todos e Tudo (capas geradas via gpt-image-2) | 5 |

### Estratégia técnica

1. **Auditoria**: detectados 39 ebooks com capas Pillow genéricas (<80KB) versus 217 capas premium oficiais no diretório `assets/ebook_covers/` do repo.
2. **Mapeamento manual**: 33 slugs mapeados 1:1 com arquivos premium do repositório (Claude #17–22, MMN_IA #01–15 e #38–40, Novas Profissões #44–48, A IA Perfeita v1).
3. **Download autenticado**: usado `Bearer token` com `raw.githubusercontent.com` (repo privado).
4. **Capas IA-geradas**: 5 capas premium criadas para "IAs para Todos e Tudo" (Nanobanana, Lovable, Perplexity, DeepSeek, Manus) — geradas via `gpt-image-2`, 768×1024, convertidas para WebP @88% (168KB–268KB cada).
5. **Capas oficiais preservadas**: 9 capas pequenas (~60KB) são as **mesmas presentes no repositório oficial** — não substituídas para manter fidelidade.

### Validação

- API tRPC `marketplaceNexus.listEbooks`: 201 ebooks, 19 coleções contíguas
- HTTP 200 em todas as URLs de capa (validação amostral 5–10 URLs por coleção)
- Backup das capas antigas em `/var/backups/oneverso/covers_pre_sync_*/`
- Coluna `cover_path` atualizada para 38 slugs no `marketplace_ebooks`
