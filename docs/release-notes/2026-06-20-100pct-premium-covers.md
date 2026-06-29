# Release Notes — 2026-06-20 · 100% Capas Premium + UX Refinements

## 🎯 Conquista: 201/201 capas premium ativas

Sincronização final completa: **todos os 201 ebooks** do Marketplace Nexus agora têm capas premium (≥80KB, qualidade ebook profissional).

### Capas geradas neste ciclo (9 finais)

| # | Slug | Coleção | Tamanho |
|---:|---|---|---:|
| 55 | a-consciencia-hibrida | Nexus Affil'IA'te Store | 291 KB |
| 56 | prometeu-digital | Nexus Affil'IA'te Store | 302 KB |
| 57 | o-codigo-vivo | Nexus Affil'IA'te Store | 284 KB |
| 58 | meditacoes-do-operador | Nexus Affil'IA'te Store | 283 KB |
| 59 | a-sinfonia-dos-transformers | Nexus Affil'IA'te Store | 237 KB |
| 62 | se-eu-ia-soubesse-amar | Se Eu IA Fosse Humano | 212 KB |
| 63 | se-eu-ia-tivesse-consciencia-moral | Se Eu IA Fosse Humano | 184 KB |
| 64 | se-eu-ia-fosse-mortal | Se Eu IA Fosse Humano | 232 KB |
| – | se-eu-ia-fosse-humano-readme | Se Eu IA Fosse Humano | 274 KB |

### Resumo absoluto

| Métrica | Valor |
|---|---:|
| Total de ebooks ativos | 201 |
| Capas premium (≥80KB) | **201 (100%)** ✅ |
| Capas faltando | 0 |
| Capas genéricas restantes | 0 |
| Coleções contíguas | 19 |
| Peso total das capas | ~180 MB (WebP otimizado) |

### Melhorias de UX aplicadas

1. **Lazy loading** — `<img loading="lazy" decoding="async">` em todas as capas
2. **Hover suave** — cards com `transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20`
3. **Cache Nginx imutável** — `/ebooks/covers/*.webp` 30 dias `immutable`
4. **WebP otimizado** — qualidade 88%, redução média de **89%** vs PNG original (19 MB → 2.2 MB)

### Stack de validação

- API tRPC: `marketplaceNexus.listEbooks` → 201 itens · 19 coleções
- HTTP 200 em todas as rotas (home, marketplace, dashboard, profile, skills, upgrades, api/health)
- HTTP 200 + tamanho correto em todas as URLs de capa verificadas
- PM2 fork mode estável (mmn-api + 4 workers)
- Bundle Vite atualizado com transições suaves
