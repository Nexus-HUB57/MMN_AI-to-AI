==============================================================================
# Reorganização Cirúrgica de Capas vs Ebooks
**Data:** 2026-07-16 13:45
**Modo:** ADITIVO (nunca sobrescreve)
==============================================================================

## ETAPA 1 — Inventário Inicial

- `docs/ebooks/` (oficial): **24** capas
- `frontend/public/ebooks/covers/`: **0** capas
- `assets/ebook_covers/` (legado): **168** capas

## ETAPA 2 — Mapeamento de Ebooks

Total ebooks: **200**

## ETAPA 3 — Índice de Capas

Índice único: **179** capas (com fallback para legado)

## ETAPA 4 — Sincronização Aditiva (frontend → docs/ebooks/)

- Capas já existiam em docs/ebooks/: **0**
- Capas sincronizadas: **0**

## ETAPA 5 — Mapeamento de Capas Legadas (assets/)

- Capas em assets/ com ebook correspondente: **61**
- Capas em assets/ sem ebook direto: **107** (mantidas como legado)

## ETAPA 6 — Capas Placeholder para Ebooks sem Capa

- Capas placeholder criadas: **187**
- Falhas: **0**

**Ebooks que receberam capas placeholder:**
  - `AcademIA/apostilas/01-apresentacao-infraestrutura.md` → `ACAD-apostila-01-apresentacao-infraestrutura.webp`
  - `AcademIA/apostilas/02-cases-orquestracao-autonoma.md` → `ACAD-apostila-02-cases-orquestracao-autonoma.webp`
  - `AcademIA/apostilas/03-infra-operacional-ia.md` → `ACAD-apostila-03-infra-operacional-ia.webp`
  - `AcademIA/apostilas/04-orquestracao-hibrida-agentes.md` → `ACAD-apostila-04-orquestracao-hibrida-agentes.webp`
  - `AcademIA/apostilas/05-sete-telas-essenciais.md` → `ACAD-apostila-05-sete-telas-essenciais.webp`
  - `AcademIA/apostilas/06-setup-agente-pessoal.md` → `ACAD-apostila-06-setup-agente-pessoal.webp`
  - `AcademIA/apostilas/07-18-skills-operacionais.md` → `ACAD-apostila-07-18-skills-operacionais.webp`
  - `AcademIA/apostilas/08-rotina-disparo-agente.md` → `ACAD-apostila-08-rotina-disparo-agente.webp`
  - `AcademIA/apostilas/09-campanhas-automatizadas.md` → `ACAD-apostila-09-campanhas-automatizadas.webp`
  - `AcademIA/apostilas/10-jornada-completa-afiliado.md` → `ACAD-apostila-10-jornada-completa-afiliado.webp`
  - `AcademIA/apostilas/11-seo-marketing-conteudo-ia.md` → `ACAD-apostila-11-seo-marketing-conteudo-ia.webp`
  - `AcademIA/apostilas/11-sho-em-producao.md` → `ACAD-apostila-11-sho-em-producao.webp`
  - `AcademIA/apostilas/12-ioaid-arquitetura-profunda.md` → `ACAD-apostila-12-ioaid-arquitetura-profunda.webp`
  - `AcademIA/apostilas/12-seguranca-ofensiva-pentest-agentes-ia.md` → `ACAD-apostila-12-seguranca-ofensiva-pentest-agentes-ia.webp`
  - `AcademIA/apostilas/13-marketplace-skills.md` → `ACAD-apostila-13-marketplace-skills.webp`
  - `AcademIA/apostilas/14-multi-tenant-whitelabel.md` → `ACAD-apostila-14-multi-tenant-whitelabel.webp`
  - `AcademIA/apostilas/15-metricas-roi-ecossistema.md` → `ACAD-apostila-15-metricas-roi-ecossistema.webp`
  - `AcademIA/webinars/WB-2026-01-lancamento-ioaid.md` → `WB-2026-01-lancamento-ioaid.webp`
  - `AcademIA/webinars/WB-2026-02-sho-em-producao.md` → `WB-2026-02-sho-em-producao.webp`
  - `AcademIA/webinars/WB-2026-03-academia-open-house.md` → `WB-2026-03-academia-open-house.webp`
  - `AcademIA/webinars/WB-2026-04-ia-to-ia-federation.md` → `WB-2026-04-ia-to-ia-federation.webp`
  - `AcademIA/webinars/WB-2026-04-skills-em-producao.md` → `WB-2026-04-skills-em-producao.webp`
  - `AcademIA/webinars/WB-2026-05-multi-tenant.md` → `WB-2026-05-multi-tenant.webp`
  - `AcademIA/webinars/WB-2026-06-ab-test-estatistico.md` → `WB-2026-06-ab-test-estatistico.webp`
  - `AcademIA/webinars/WB-2026-07-lgpd-ia.md` → `WB-2026-07-lgpd-ia.webp`
  - `docs/ebooks_markdown/00_Indice_Coletanea_Nexus_Affil_IA_te.md` → `00_Indice_Coletanea_Nexus_Affil_IA_te.webp`
  - `docs/ebooks_markdown/14_Marcos_e_Conquistas_Historicas_da_IA.md` → `14_Marcos_e_Conquistas_Historicas_da_IA.webp`
  - `docs/ebooks_markdown/15_Presente_e_Futuro_da_IA.md` → `15_Presente_e_Futuro_da_IA.webp`
  - `docs/ebooks_markdown/16_Raizes_do_Claude.md` → `16_Raizes_do_Claude.webp`
  - `docs/ebooks_markdown/17_Claude_Conceitos_Fundamentais.md` → `17_Claude_Conceitos_Fundamentais.webp`
  - ... e mais 157

## ETAPA 7 — Referências em .md

- Referências OK: **188**
- Referências quebradas restantes: **3**

## ETAPA 8 — Mapa Final por Local

- `docs/ebooks/` (oficial): **211**
- `frontend/public/ebooks/covers/`: **0**
- `assets/ebook_covers/` (legado): **168**

## ETAPA 9 — Detecção de Capas Duplicadas (por conteúdo)

- Grupos de capas idênticas: **9**

**Capas duplicadas detectadas (mantidas todas - sem deletar):**
  - hash `f8e2f0e249e8`: 01_Minimax_A_IA_Revolucionaria.webp, Fundamentos_da_IA1.webp
  - hash `69062f5a6305`: 03_Genspark_A_IA_Faz_Tudo.webp, Modelos_de_Linguagem1.webp
  - hash `dbfc7b00a8d1`: 05_Como_Fazer_Dinheiro_com_IA.webp, Etica_Futuro_IA.webp
  - hash `57ed6fc2a225`: 09_Fundamentos_da_IA.webp, IA_Generativa_Criativa.webp
  - hash `d2d126a87cec`: 10_A_Revolucao_dos_Modelos_de_Linguagem.webp, Visao_Computacional1.webp
  - hash `6256021c8ef6`: 11_Raizes_da_IA.webp, Fazer_Dinheiro_com_IA1.webp
  - hash `64bc98610024`: 12_Invernos_e_Primaveras_da_IA.webp, Minimax_Skills.webp
  - hash `119253680023`: 13_Os_Modelos_que_Marcaram_Epoca.webp, Minimax_Codigo_da_Riqueza.webp
  - hash `81051bcc2cf1`: Genspark_a_Super_IA.webp, IA_Generativa_Revolucao.webp, O_Mapa_da_Riqueza.webp

## ETAPA 10 — Resumo Final

**Ebooks totais:** 200
**Capas em docs/ebooks/ (oficial):** 211
**Capas sincronizadas (frontend → docs/):** 0
**Capas placeholder criadas:** 187
**Capas em assets/ (legado):** 168
**Grupos de capas duplicadas:** 9
**Cobertura:** 13 / 200 ebooks com capa oficial

---

**Próximos passos sugeridos:**
1. Revisar manualmente as capas duplicadas em `assets/ebook_covers/` (não deletar automaticamente)
2. Atualizar o sistema de marketplace para apontar para `docs/ebooks/` como fonte canônica
3. Atualizar manualmente os paths de capas em `.md` que referenciam paths antigos
4. Considerar mover (não copiar) capas legadas para um arquivo `archive/` se confirmado não-uso

**Relatório gerado em:** relatorio_reorg_ebooks_2026_07_14.md
**Script:** `/workspace/reorg_ebooks_safe.py`