# Release Notes — 2026-06-20 · Collection Ranking customizado

## Marketplace Nexus — Ordem oficial das coleções

Aplicada ordem customizada solicitada pelo usuário para o Marketplace Nexus.
Coluna `collection_rank` adicionada à tabela `marketplace_ebooks`.

### Sequência oficial (19 coleções, 201 ebooks)
1. Nexus Affil'IA'te Store (54)
2. Coleção MAESTRIA IA APLICADA (10)
3. Coleção GNOXS (7)
4. Coleção AXIOMA PRIME (10)
5. Coleção AgenticAI Revolução (5)
6. Curso Futuro IA (5)
7. Coleção Criadores da IA (5)
8. Coleção HUMAN_IA (5)
9. Coleção Se Eu IA Fosse Humano (6)
10. Coleção NEXUS PROTOCOL (10)
11. Coletânea Orquestração IA (5)
12. Coleção IAs para Todos e Tudo (5)
13. Coleção As Novas Profissões da IA (5)
14. Coleção A IA Perfeita (12)
15. Coleção IA se Descreve (9)
16. Coleção Ninguém Contatado (5)
17. Coleção FORJA AGÊNTICA (10)
18. Coleção MMN_IA (18)
19. Curso Universo IA (15)

### Mudanças técnicas
- DB: `marketplace_ebooks.collection_rank` + índice composto
- Backend: `listEbooks()` ordenando por `collection_rank`, `order`
- Frontend: helper `collectionRanking.ts`
- Validação: 201 ebooks, 19 coleções contíguas, rotas principais HTTP 200
