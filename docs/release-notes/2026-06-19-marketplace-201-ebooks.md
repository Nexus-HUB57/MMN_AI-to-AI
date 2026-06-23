# Nexus Affil'IA'te · IOAID · SaaS — Release Notes 2026-06-19

## Marketplace Nexus
- **201 ebooks ativos** em 19 coleções (todas contíguas 1..N).
- **Coleções novas sincronizadas**: Criadores da IA (5), IAs para Todos e Tudo (5), As Novas Profissões da IA (5), Se Eu IA Fosse Humano (6).
- **18 capas premium artísticas** para Coleção MMN_IA (símbolos temáticos únicos por título: pipeline, decision tree, orquestra, server pillars, marketplace, constelação, hexágonos, íris, teatro, cérebro).
- **6 capas artísticas SE_EU_IA** (gpt-image-2) com identidade visual filosófica única.

## Home — IOAID · SaaS
- Seção IOAIDSection como primeira divulgação pós-Hero.
- Personas oficiais Ive/Alencar publicadas em /img/personas/ com cache imutável.
- Substituição global MMNAI -> IOAID · SaaS na UI (Pix ONEVERSO MMN AI preservado).
- Bloco HomePersonasAcademia (Sir Nexus Alencar + Sra. Nexus Ive + Co-atuação).

## BLAW dissolvido em runtime
- auditZkRouter.verify ativo (LGPD Art. 20 §1º).
- pearlAttribution.attribute() decide atribuição causal em <=10 saltos.
- Tabela ledger_mirror habilita rollback O(1) por ciclo.
- ADR-013 registrado.

## UX premium
- Cache imutável Vite /assets/ (1 ano) + /img/personas/ (30 dias) + /ebooks/covers/* (30 dias).
- modulepreload + preload above-fold + preconnect.
- Skip-to-content (a11y), prefers-reduced-motion, focus-visible cyan-400.
- Meta OG + theme-color.
- sortByCategoryOrder() no MarketplaceEbooks.

## Stack
- PM2 fork mode: mmn-api + 4 workers.
- PostgreSQL marketplace_ebooks fonte única.
- Pipeline rsync seguro --exclude=/ebooks --exclude=/academia.
