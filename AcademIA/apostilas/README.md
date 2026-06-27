---
title: "README · Apostilas Academ'IA"
description: "Índice das 10 apostilas oficiais do Academ'IA — Gestão EAD"
version: "1.0.0"
date: "2026-06-12"
pattern: "MMN_IA"
---

# 📚 Apostilas Academ'IA — Gestão EAD

> **10 apostilas oficiais** para a formação completa de afiliados Nexus.
> Versão 1.0.0 · MMN AI-to-AI · 2026

Esta pasta contém as 10 apostilas oficiais do programa **Academ'IA · Gestão EAD** — o braço educacional da Nexus Affil'IA'te. As apostilas seguem o padrão MMN_IA (frontmatter, capa, sumário navegável, apêndices, rodapé padronizado) e são convertidas para PDF via Pandoc quando necessário.

## 🗺️ Índice de Apostilas

| # | Apostila | Arquivo | Tamanho |
|---|----------|---------|---------|
| 01 | Apresentação Oficial da Infraestrutura | `01-apresentacao-infraestrutura.md` | ~10KB |
| 02 | Cases Reais de Orquestração Autônoma | `02-cases-orquestracao-autonoma.md` | ~9KB |
| 03 | Infraestrutura Operacional de IA | `03-infra-operacional-ia.md` | ~9KB |
| 04 | Orquestração Híbrida de Agentes | `04-orquestracao-hibrida-agentes.md` | ~9KB |
| 05 | As 7 Telas Essenciais do Dia a Dia | `05-sete-telas-essenciais.md` | ~9KB |
| 06 | Setup Completo do Agente Pessoal | `06-setup-agente-pessoal.md` | ~8KB |
| 07 | As 18 Skills Operacionais Base | `07-18-skills-operacionais.md` | ~10KB |
| 08 | Rotina de Disparo com Agente | `08-rotina-disparo-agente.md` | ~8KB |
| 09 | Campanhas Automatizadas (Whatsapp/Instagram) | `09-campanhas-automatizadas.md` | ~9KB |
| 10 | Jornada Completa do Afiliado | `10-jornada-completa-afiliado.md` | ~8KB |

## 🎯 Mapeamento por Trilha

### 🥉 Fundamental (meses 1-3)
- Apostila 01 (visão geral)
- Apostila 05 (telas do dia a dia)
- Apostila 06 (setup do primeiro agente)

### 🥈 Operacional (meses 3-6)
- Apostila 07 (skills)
- Apostila 08 (rotina de disparo)
- Apostila 09 (campanhas)

### 🥇 Estratégico (meses 6-12)
- Apostila 02 (cases de referência)
- Apostila 03 (infra operacional)
- Apostila 04 (orquestração híbrida)
- Apostila 10 (jornada completa)

## 📂 Estrutura

```text
AcademIA/apostilas/
├── README.md                            ← este arquivo
├── 01-apresentacao-infraestrutura.md
├── 02-cases-orquestracao-autonoma.md
├── 03-infra-operacional-ia.md
├── 04-orquestracao-hibrida-agentes.md
├── 05-sete-telas-essenciais.md
├── 06-setup-agente-pessoal.md
├── 07-18-skills-operacionais.md
├── 08-rotina-disparo-agente.md
├── 09-campanhas-automatizadas.md
└── 10-jornada-completa-afiliado.md
```

## 🖼️ Capas

Todas as capas estão em `assets/ebook_covers/` com o prefixo `ACAD-apostila-`:

```text
assets/ebook_covers/
├── ACAD-apostila-01-apresentacao-infraestrutura.webp
├── ACAD-apostila-02-cases-orquestracao-autonoma.webp
├── ACAD-apostila-03-infra-operacional-ia.webp
├── ACAD-apostila-04-orquestracao-hibrida-agentes.webp
├── ACAD-apostila-05-sete-telas-essenciais.webp
├── ACAD-apostila-06-setup-agente-pessoal.webp
├── ACAD-apostila-07-18-skills-operacionais.webp
├── ACAD-apostila-08-rotina-disparo-agente.webp
├── ACAD-apostila-09-campanhas-automatizadas.webp
└── ACAD-apostila-10-jornada-completa-afiliado.webp
```

## 🔧 Como Compilar para PDF

```bash
# Requer pandoc + wkhtmltopdf
cd AcademIA/apostilas/
for f in *.md; do
  pandoc "$f" -o "../pdf/$(basename "$f" .md).pdf" \
    --pdf-engine=wkhtmltopdf \
    --css=../templates/pdf.css \
    --toc --toc-depth=2
done
```

## 📊 Estatísticas

- **Total de apostilas:** 10
- **Total de conteúdo:** ~89KB de markdown
- **Total estimado de páginas (PDF):** ~250-300 páginas
- **Idioma:** Português (pt-BR)
- **Padrão:** MMN_IA
- **Licença:** CC BY-SA 4.0

---

*Nexus Affil'IA'te · Academ'IA · 2026 · Versão 1.0.0*
