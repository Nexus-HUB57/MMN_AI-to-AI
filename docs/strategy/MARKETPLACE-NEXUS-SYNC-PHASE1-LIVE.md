# Marketplace Nexus — Sync Phase 1 LIVE

Data: 2026-06-30

## Resultado
- Endpoint `marketplaceNexus.listEbooks` agora retorna **186 ebooks** ativos (antes: 164).
- 4 coleções órfãs foram oficialmente ingeridas no Marketplace, com capas oficiais do repo:
  - Tudo aquilo que ninguém contou sobre IA — 7 ebooks (prefixo `nc-`) · capas oficiais `NC-colecao-ninguem-contou-001..007.webp`.
  - Curso Futuro IA — 5 ebooks (prefixo `cf-`) · capas oficiais `43_Futuro_Segundo_a_Anthropic.webp` + `axioma_prime_10_civilizacao_agentica_e_o_grande_pacto.webp`.
  - Coletânea Orquestração IA — 5 ebooks (prefixo `orq-`) · capas oficiais das próprias pastas `imagens/ebook_NN/capa_ebook_NN.webp`.
  - Se eu IA fosse humano — 5 ebooks (prefixo `sih-`) · capas oficiais `60_capa..64_capa.webp`.
- Total: 22 ebooks reais + capas oficiais publicados.

## Operações executadas
1. Backup `pg_dump` da tabela `marketplace_ebooks` antes de qualquer mudança.
2. Seed SQL idempotente (`ON CONFLICT (slug) DO UPDATE`) aplicado.
3. Cópia das capas oficiais de `assets/ebook_covers/` (188 originais) para `frontend/public/ebooks/covers/` com convenção `colecao-<id>--<n>-<slug>.<ext>`.
4. Limpeza de placeholders de 2 bytes (capa fantasma `Futuro_das_Skills.png`) e substituição por capa real.
5. Atualização de `cover_path` no banco para refletir extensão real do arquivo.
6. Rebuild Vite (5–6 s), rsync para `/var/www/oneverso/public/`, flush do cache Redis `d17:ebooks:v1`.

## Validação live
- `marketplaceNexus.listEbooks` (HTTP 200): 186 ativos.
- Capas oficiais novas servindo via HTTPS:
  - `nc-04 → 324 KB`, `orq-03 → 1.1 MB`, `sih-62 → 70 KB`, `cf-01/02 → 2.4 MB`, `cf-03/04/05 → 2.0 MB`.
- `bootstrap.status` continua expondo `marketplaceNexus: true`.

## Pendências da próxima fase
1. **Gaps pontuais** (9 ebooks faltantes em 9 coleções) ainda a fechar:
   - colecao_MMN_IA: 21 → 18 (faltam 3).
   - colecao_IA_SE_DESCREVE: 9 → 3 (faltam 6).
   - colecao_IA_Perfeita: 13 → 12 (falta 1).
   - colecao_NEXUS_PROTOCOL: 11 → 10 (falta 1).
   - colecao_GNOXS: 8 → 7 (falta 1).
   - colecao_HUMAN_IA: 6 → 5 (falta 1).
   - colecao_AgenticAI_Revolucao: 6 → 5 (falta 1).
   - novas-profissoes-de-ia: 6 → 5 (falta 1).
   - curso_universo_ia: 16 → 15 (falta 1).
2. **PDFs físicos**: dos 186 ativos, apenas 5 PDFs reais em `public/ebooks/pdf/`. O `pdf_path` dos demais ainda retorna 404. Necessário pipeline de build PDF.
3. **Manifesto técnico**: atualizar `_marketplace_nexus_release/manifest_marketplace_ebooks.json` de 132 → 186 para refletir o estado real.
4. **Capas órfãs**: 2 capas extras (`modelos_de_linguagem.webp`, `diagrama_ecossistema_nexus.png`) e 13 capas ACAD- pertencem à Academia, não ao Marketplace.

## Decisões deixadas como guardrail
- `cover_path` no banco está sempre alinhado com a extensão real do arquivo.
- Convenção `colecao-<id>--<n>-<slug>.<ext>` para todas as capas servidas.
- Backup `pg_dump` automático antes de qualquer seed.
- Cache Redis `d17:ebooks:v1` flushed sempre que o catálogo muda (TTL 5 min de fallback).
