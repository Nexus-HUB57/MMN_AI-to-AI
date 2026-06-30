# Marketplace Nexus — Matriz de Sincronização (Repo × Banco)

Data: 2026-06-30
Fonte: extração viva no VPS (`/var/www/oneverso/current`) + Postgres `nexus_prod.marketplace_ebooks`.

## Resumo numérico
- Banco `marketplace_ebooks`: 327 registros, 164 ativos.
- API pública: 164 ebooks ativos retornados em `marketplaceNexus.listEbooks`.
- Manifesto técnico (`_marketplace_nexus_release/manifest_marketplace_ebooks.json`): 132 entradas.
- Coleções markdown disponíveis em `docs/ebooks_markdown/`: 19 pastas (15 com conteúdo, 3 vazias).
- Capas oficiais em `assets/ebook_covers/`: 188 arquivos.
- Capas publicadas em `frontend/public/ebooks/covers/` e `frontend/dist/ebooks/covers/`: 132 cada.
- PDFs realmente publicados em `public/ebooks/pdf/`: 5. PDFs em `assets/ebooks_pdf/`: 5.

## Matriz por coleção

| Coleção (markdown) | MDs no repo | Capas oficiais (assets) | Capas publicadas (frontend) | Ativos no banco | Estado |
|---|---|---|---|---|---|
| colecao_MMN_IA | 21 | (espalhadas em raiz-numerada) | colecao-mmn-ia: 18 | 18 | parcial — 3 ebooks a entrar |
| curso_universo_ia | 16 | 2 + 5 capas SVG no frontend | curso-universo-ia: 15 | 15 | parcial — 1 ebook a entrar |
| colecao_IA_Perfeita | 13 | (em raiz-numerada) | colecao-a-ia-perfeita: 12 | 12 | parcial — 1 ebook a entrar |
| colecao_NEXUS_PROTOCOL | 11 | nexus_protocol: 10 | colecao-nexus-protocol: 10 | 10 | parcial — 1 ebook a entrar |
| colecao_MAESTRIA_IA_APLICADA | 11 | maestria_ia: 10 | — | 10 | sincronizada |
| colecao_FORJA_AGENTICA | 11 | forja_agentica: 10 | — | 10 | sincronizada |
| colecao_AXIOMA_PRIME | 11 | axioma_prime: 10 | — | 10 | sincronizada |
| colecao_IA_SE_DESCREVE | 9 | (em raiz-numerada) | colecao-ia-se-descreve: 3 | 3 | gap forte — faltam 6 |
| colecao_ninguem_contatado | 8 | NC-colecao-ninguem-contou: 8 | — | 0 | NÃO sincronizada (8 ebooks órfãos) |
| colecao_GNOXS | 8 | gnoxs_01..gnoxs_07 (7) | colecao-gnoxs: 7 | 7 | parcial — 1 ebook a entrar |
| curso_futuro_ia | 6 | — | — | 0 | NÃO sincronizada |
| coletanea_orquestracao_ia | 6 | (imagens internas) | — | 0 | NÃO sincronizada |
| colecao_SE_EU_IA_FOSSE_HUMANO | 6 | — | — | 0 | NÃO sincronizada |
| colecao_HUMAN_IA | 6 | human_ia: 5 | colecao-human-ia: 5 | 5 | parcial — 1 ebook a entrar |
| colecao_AgenticAI_Revolucao | 6 | agentic_01..agentic_05 (5) | colecao-agenticai-revolucao: 5 | 5 | parcial — 1 ebook a entrar |
| As Novas Profissões geradas pela IA | 6 | (em raiz-numerada) | novas-profissoes-de-ia: 5 | 5 | parcial — 1 ebook a entrar |
| colecao_tecnica | 0 | — | — | 0 | sem conteúdo |
| publish_all | 0 | — | — | 0 | utilitário |
| trilogia_anthropic | 0 | — | — | 0 | sem conteúdo |

## Coleções que existem com ebook + capa mas NÃO estão no Marketplace
1. **colecao_ninguem_contatado** — 8 markdowns + 8 capas oficiais NC-colecao-ninguem-contou-*.webp. Zero registros ativos no banco.
2. **curso_futuro_ia** — 6 markdowns, ainda sem capas oficiais identificadas, zero registros ativos.
3. **coletanea_orquestracao_ia** — 6 markdowns com imagens próprias em `imagens/ebook_01..05`, zero registros ativos.
4. **colecao_SE_EU_IA_FOSSE_HUMANO** — 6 markdowns, ainda sem capas dedicadas, zero registros ativos.

## Coleções com gap pontual (faltam unidades para fechar)
- colecao_MMN_IA: 21 → 18 (faltam 3).
- colecao_IA_SE_DESCREVE: 9 → 3 (faltam 6).
- colecao_IA_Perfeita: 13 → 12 (falta 1).
- colecao_NEXUS_PROTOCOL: 11 → 10 (falta 1).
- colecao_GNOXS: 8 → 7 (falta 1).
- colecao_HUMAN_IA: 6 → 5 (falta 1).
- colecao_AgenticAI_Revolucao: 6 → 5 (falta 1).
- novas-profissoes-de-ia: 6 → 5 (falta 1).
- curso_universo_ia: 16 → 15 (falta 1).

## Capas oficiais ainda não publicadas no frontend
- `Titan_Protocol.png` — coleção Titan não existe no banco.
- 8 capas NC-colecao-ninguem-contou-*.webp — coleção inteira fora.
- 13 capas ACAD-* (ACAD-apostila-*, ACAD-diagrama-*, ACAD-ilustracao-*) — Academia, não fazem parte do Marketplace Nexus.
- 2 capas extras (`Futuro_das_*`, `modelos_de_*`) — material avulso a classificar.

## Inconsistência de PDFs
- Frontend espera `pdf_path = /ebooks/pdf/ebook-<slug>.pdf` para 164 ativos.
- `public/ebooks/pdf/` possui apenas 5 PDFs físicos. Os demais 159 `pdf_path` apontam para arquivos inexistentes.
- Risco: usuário clica em "baixar PDF" e recebe 404.

## Decisões propostas
1. Ingerir as 4 coleções órfãs no Marketplace via SQL idempotente, gerando slugs, títulos, `unlock_pack_slug`, `pdf_path`, `cover_path` a partir dos markdowns e capas.
2. Fechar os gaps pontuais com mais 16 ebooks faltantes.
3. Gerar PDFs faltantes (159) ou substituir `pdf_path` por placeholder até o build de PDF estar pronto.
4. Promover as capas oficiais de `assets/ebook_covers/` para `frontend/public/ebooks/covers/` aplicando a convenção `colecao-<slug>--<n>-<slug>.webp`.
5. Atualizar o manifesto técnico para refletir o estado real (132 → projeção alvo 200+).
