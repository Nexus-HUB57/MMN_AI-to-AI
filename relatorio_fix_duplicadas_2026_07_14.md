==============================================================================
# Fix de Capas Duplicadas (mesmo conteúdo, nomes errados)
**Data:** 2026-07-16 13:46
**Modo:** ADITIVO - copia capas para nomes corretos, nunca deleta
==============================================================================

Total ebooks mapeados: 200
Capas oficiais esperadas: 200

## ETAPA 1 — Detecção de Duplicatas por Hash

Total grupos de capas idênticas: **11**

## ETAPA 2 — Resolução de Conflitos


- Capas corrigidas (criadas com nome correto): **0**
- Já estavam OK: **22**
- Grupos não resolvidos: **11**

**Grupos de capas idênticas onde NENHUM nome casa com um ebook:**

  Hash `f8e2f0e249e8`:
    - docs/ebooks/01_Minimax_A_IA_Revolucionaria.webp
    - docs/ebooks/Fundamentos_da_IA1.webp
    - assets/ebook_covers/09_Fundamentos_da_IA.webp
  Hash `69062f5a6305`:
    - docs/ebooks/03_Genspark_A_IA_Faz_Tudo.webp
    - docs/ebooks/Modelos_de_Linguagem1.webp
    - assets/ebook_covers/03_Genspark_A_IA_Faz_Tudo.webp
    - assets/ebook_covers/10_A_Revolucao_dos_Modelos_de_Linguagem.webp
    - assets/ebook_covers/modelos_de_linguagem.webp
  Hash `f1b150c8cc6e`:
    - docs/ebooks/04_Genspark_A_Super_IA.webp
    - assets/ebook_covers/04_Genspark_A_Super_IA.webp
  Hash `dbfc7b00a8d1`:
    - docs/ebooks/05_Como_Fazer_Dinheiro_com_IA.webp
    - docs/ebooks/Etica_Futuro_IA.webp
    - assets/ebook_covers/08_Etica_e_Futuro_da_IA.webp
  Hash `1d7e7531d8f6`:
    - docs/ebooks/06_Visao_Computacional.webp
    - assets/ebook_covers/06_Visao_Computacional.webp
  Hash `57ed6fc2a225`:
    - docs/ebooks/09_Fundamentos_da_IA.webp
    - docs/ebooks/IA_Generativa_Criativa.webp
    - assets/ebook_covers/07_IA_Generativa_Criativa.webp
  Hash `d2d126a87cec`:
    - docs/ebooks/10_A_Revolucao_dos_Modelos_de_Linguagem.webp
    - docs/ebooks/Visao_Computacional1.webp
  Hash `6256021c8ef6`:
    - docs/ebooks/11_Raizes_da_IA.webp
    - docs/ebooks/Fazer_Dinheiro_com_IA1.webp
    - assets/ebook_covers/05_Como_Fazer_Dinheiro_com_IA.webp
    - assets/ebook_covers/11_Raizes_da_IA.webp
  Hash `64bc98610024`:
    - docs/ebooks/12_Invernos_e_Primaveras_da_IA.webp
    - docs/ebooks/Minimax_Skills.webp
    - assets/ebook_covers/02_Minimax_Como_Construir_Skills_Vencedoras.webp
  Hash `119253680023`:
    - docs/ebooks/13_Os_Modelos_que_Marcaram_Epoca.webp
    - docs/ebooks/Minimax_Codigo_da_Riqueza.webp
    - assets/ebook_covers/01_Minimax_A_IA_Revolucionaria.webp
    - assets/ebook_covers/13_Os_Modelos_que_Marcaram_Epoca.webp
  Hash `81051bcc2cf1`:
    - docs/ebooks/Genspark_a_Super_IA.webp
    - docs/ebooks/IA_Generativa_Revolucao.webp
    - docs/ebooks/O_Mapa_da_Riqueza.webp

> Sugestão: revisão manual para decidir qual nome é o correto (provavelmente o que casa com o título do ebook).

## ETAPA 3 — Verificação Final

Total capas em docs/ebooks/ agora: **211**

Ebooks sem capa: **0**

==============================================================================
# Resumo
==============================================================================

**Modo:** ADITIVO (nenhum arquivo foi deletado)
**Capas corrigidas:** 0
**Capas duplicadas remanescentes (mantidas como histórico):** 11 grupos
**Ebooks sem capa após fix:** 0

**Próximos passos manuais recomendados:**
1. Revisar os grupos `unresolved` e decidir manualmente qual nome é o correto
2. Para cada `sem_capa`, criar capa específica (placeholder colorido + título)
3. Atualizar referências em `.md` para apontar para `docs/ebooks/`
4. Considerar mover capas em `assets/ebook_covers/` para `archive/` após validação final