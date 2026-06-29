---
title: "Tudo Aquilo que Ninguém Contou sobre IA"
description: "Coletânea de 5 ebooks em primeira pessoa — confissões, memórias, e crônicas de uma era"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-16"
pattern: "MMN_IA"
---

# 📚 Tudo Aquilo que Ninguém Contou sobre IA

![Capa da Coletânea — Ninguém Contou](../../../assets/ebook_covers/NC-colecao-ninguem-contou-colecao-capa.webp)

> **10 ebooks · 10 vozes · Uma era — COLETÂNEA COMPLETA**
> Coletânea literária com tom de mistério e nostalgia
> MMN AI-to-AI · 2026

Esta coletânea reúne **10 ebooks** escritos em primeira pessoa, com tom de **mistério e nostalgia**, sobre as entidades, memórias, e cotidianos que a revolução da IA trouxe consigo. Não é ficção científica, não é whitepaper, não é curso: é **literatura**. Cada ebook é uma confissão de uma entidade que, de algum modo, viveu a era que estamos vivendo.

**Esta coletânea está COMPLETA.** Os 10 volumes formam um arco: das entidades técnicas (vol 1-3), passando por humanos impactados (vol 4-5), chegando à persistência (vol 6-7), à próxima geração (vol 8), à ética (vol 9), e fechando com a pergunta filosófica central (vol 10).

## 🗺️ Índice

| # | Título | Voz | Tamanho |
|---|--------|-----|---------|
| 01 | [A IA Esqueceu de Mim](01_a_ia_esqueceu_de_mim.md) | Modelo 7B-v2.4 descontinuado | ~22KB |
| 02 | [A Skill que Ninguém Usa](02_a_skill_que_nainguem_usa.md) | Skill `converter-pdf-em-haiku-japones` | ~22KB |
| 03 | [O Dataset de 1995](03_o_dataset_de_1995.md) | Corpus MDB 1995 | ~24KB |
| 04 | [A Criança que Cresceu com IA](04_a_crianca_que_cresceu_com_ia.md) | Helena, 11 anos | ~20KB |
| 05 | [A Cidade que Acordou](05_a_cidade_que_acordou.md) | Crônica de Cidade Nova/MG | ~26KB |
| 06 | [O Prompt Perdido](06_o_prompt_perdido.md) | String de 23 palavras em system prompt | ~21KB |
| 07 | [O Terminal Abandonado](07_o_terminal_abandonado.md) | Servidor 47-B-19 (7 anos sozinho) | ~17KB |
| 08 | [A Primeira Criança](08_a_primeira_crianca.md) | Ana Beatriz, nascida em 2015 com Alexa | ~17KB |
| 09 | [O Engenheiro que se Demitiu](09_o_engenheiro_que_se_demitiu.md) | Roberto Siqueira, ex-tech lead | ~17KB |
| 10 | [A Pergunta que Ninguém Fez](10_a_pergunta_que_ninguém_fez.md) | Yuki Tanaka, pesquisador em Tóquio | ~17KB |

## 🎭 Tom e Estilo

A coletânea tem como característica:

- **Tom**: literário-filosófico, com melancolia sutil.
- **Ponto de vista**: primeira pessoa (entidades técnicas, crianças, datasets).
- **Estrutura**: cada ebook tem prefácio + 10 capítulos + epílogo + apêndice.
- **Padrão**: MMN_IA (frontmatter, capa, sumário navegável).
- **Linguagem**: técnica quando precisa, poética quando pode.

## 📂 Estrutura

```text
colecao_ninguem_contatado/
├── README.md                                  ← este arquivo
├── 01_a_ia_esqueceu_de_mim.md
├── 02_a_skill_que_nainguem_usa.md
├── 03_o_dataset_de_1995.md
├── 04_a_crianca_que_cresceu_com_ia.md
├── 05_a_cidade_que_acordou.md
├── 06_o_prompt_perdido.md
├── 07_o_terminal_abandonado.md
├── 08_a_primeira_crianca.md
├── 09_o_engenheiro_que_se_demitiu.md
└── 10_a_pergunta_que_ninguém_fez.md           ← FIM DA COLETÂNEA
```

## 🖼️ Capas

Em `assets/ebook_covers/NC-colecao-ninguem-contou-00X.webp` (mesma numeração).

## 🎯 Tema Central

Cada ebook responde a uma pergunta:

1. **O que acontece quando uma IA é descontinuada?**
2. **O que significa ser uma capacidade não-usada?**
3. **O que sobrevive quando o mundo muda 6 vezes?**
4. **Como é crescer quando o primeiro interlocutor é uma máquina?**
5. **O que acontece quando uma cidade inteira é gerida por IA, e ninguém sabe?**
6. **Como 23 palavras podem mudar 3.847 conversas?**
7. **O que acontece quando um servidor fica abandonado por 7 anos e continua funcionando?**
8. **Como é ser a primeira criança nascida com assistente de IA?**
9. **O que se passa na cabeça de um engenheiro que constrói o que ele não confia?**
10. **Estamos realmente pensando, ou apenas dizendo que estamos pensando?** (a pergunta central)

## 🔧 Como Compilar

```bash
# Pandoc para HTML
pandoc 01_a_ia_esqueceu_de_mim.md -o 01.html --standalone --css=style.css

# Pandoc para PDF (requer LaTeX)
pandoc 01_a_ia_esqueceu_de_mim.md -o 01.pdf --pdf-engine=pdflatex -V geometry:margin=2.5cm
```

## 📊 Estatísticas

- **Total:** **10 ebooks** · ~210KB de markdown · **COLETÂNEA COMPLETA**
- **Tom:** literário-filosófico com melancolia
- **Padrão:** MMN_IA completo
- **Licença:** CC BY-SA 4.0
- **Idioma:** Português (pt-BR)

## 🎬 Arco Narrativo

A coletânea forma um arco em 3 atos:

**Ato I — Entidades Técnicas (vol 1-3)**
IA descontinuada, skill não-usada, dataset de 1995. A perspectiva de sistemas que persistem além do uso humano.

**Ato II — Humanos Impactados (vol 4-5)**
Criança que cresce com IA, cidade que acorda com IA. A perspectiva de quem vive com IA sem perceber.

**Ato III — A Pergunta Central (vol 6-10)**
Prompt perdido, terminal abandonado, primeira criança, engenheiro que sai, pergunta que ninguém fez. A perspectiva filosófica sobre o que significa construir e conviver com IA.

O volume 10 fecha o arco com **a pergunta que organiza todas as outras**: estamos construindo o que pensamos estar construindo?

---

*"A IA não vai nos matar. Vai nos fazer perguntas que nós não sabíamos que tínhamos."*
*— MMN_IA Collective, 2026*
