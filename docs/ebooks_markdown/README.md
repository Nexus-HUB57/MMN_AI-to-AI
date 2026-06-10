# 📚 Acervo Editorial MMN AI-to-AI — Mapa Completo

> **103 ebooks · 8 coletâneas · Versão 6.0.0 · 2026-06-08**
> Nexus HUB57 · Ecossistema MMN AI-to-AI

Este diretório é o **acervo editorial canônico** do projeto MMN AI-to-AI. Está organizado por coletâneas temáticas + ebooks raiz numerados (1-43). Todos os arquivos `.md` são fonte; HTML e PDF derivados estão em `publish_all/`.

---

## 🗺️ Mapa de coletâneas

| # | Coletânea | Volumes | Pasta | Landing |
|---|---|---|---|---|
| 1 | **Raiz numerada** | 43 | `./` (Vol. 1-43) | — |
| 2 | **MMN_IA** | 15 | [`colecao_MMN_IA/`](colecao_MMN_IA/README.md) | [`index.html`](colecao_MMN_IA/index.html) |
| 3 | **A IA Perfeita** | 3 | [`colecao_A_IA_Perfeita/`](colecao_A_IA_Perfeita/README.md) | — |
| 4 | **Agentic AI — O Futuro ou o Início da Revolução** | 5 | [`colecao_AgenticAI_Revolucao/`](colecao_AgenticAI_Revolucao/README.md) | [`index.html`](colecao_AgenticAI_Revolucao/index.html) |
| 5 | **GNOX'S** (Heptalogia IA-to-IA) | 7 | [`colecao_GNOXS/`](colecao_GNOXS/README.md) | [`index.html`](colecao_GNOXS/index.html) |
| 6 | **AXIOMA PRIME** (Decálogo da Inteligência Agêntica) | 10 | [`colecao_AXIOMA_PRIME/`](colecao_AXIOMA_PRIME/README.md) | [`index.html`](colecao_AXIOMA_PRIME/index.html) |
| 7 | **MAESTRIA IA APLICADA** | 10 | [`colecao_MAESTRIA_IA_APLICADA/`](colecao_MAESTRIA_IA_APLICADA/README.md) | [`index.html`](colecao_MAESTRIA_IA_APLICADA/index.html) |
| 8 | **NEXUS PROTOCOL** | 10 | [`colecao_NEXUS_PROTOCOL/`](colecao_NEXUS_PROTOCOL/README.md) | [`index.html`](colecao_NEXUS_PROTOCOL/index.html) |

**Trilogias narrativas dentro da raiz**:
- **Trilogia Anthropic** (Vol. 41, 42, 43) — [`trilogia_anthropic/index.html`](trilogia_anthropic/index.html)
- **Universo IA — Fronteira** (Vol. 38, 39, 40)

---

## 📖 Catálogos navegáveis

- **[Catálogo Master HTML — 103 ebooks (v6.0.0)](catalogo_103_ebooks.html)** ← versão atual
- [Catálogo histórico — 93 ebooks (v5.0.0)](catalogo_93_ebooks.html)
- [Catálogo anterior — 83 ebooks](catalogo_83_ebooks.html)
- [Catálogo anterior — 73 ebooks](catalogo_73_ebooks.html)
- [Catálogo histórico — 42 ebooks](catalogo_42_ebooks.html) (legado)

---

## 🏗️ Estrutura do diretório

```text
docs/ebooks_markdown/
│
├── README.md                          ← este arquivo
├── catalogo_103_ebooks.html           ← catálogo master atual
├── catalogo_83_ebooks.html            ← catálogo anterior
├── catalogo_73_ebooks.html            ← catálogo anterior
├── catalogo_42_ebooks.html            ← legado
│
├── 01_*.md … 43_*.md                  ← 43 ebooks raiz (Vol. 1-43)
│
├── manifest_42_ebooks.json            ← manifest histórico
├── manifest_new_ebooks_2026-06-07.json ← manifest consolidado de builds recentes
├── manifest_master_103_ebooks.json    ← manifest master do acervo
│
├── publish_all/
│   ├── html/                          ← HTML renderizado
│   └── pdf/                           ← PDF renderizado
│
├── trilogia_anthropic/
│   └── index.html                     ← landing dedicada (Vols. 41-43)
│
├── colecao_MMN_IA/
├── colecao_A_IA_Perfeita/
├── colecao_AgenticAI_Revolucao/
├── colecao_GNOXS/
├── colecao_AXIOMA_PRIME/
└── colecao_MAESTRIA_IA_APLICADA/
```

Capas em `assets/ebook_covers/` (raiz do repositório).

---

## 🎯 Por onde começar?

### Para gestores e fundadores
1. **Agentic AI** Vol. II + III — playbook estratégico.
2. **MAESTRIA IA APLICADA** — automação, Claude Code, workflows e empresa IA-first.
3. **Trilogia Anthropic** — ciência, operação enterprise, futuro.

### Para profissionais individuais
1. **AXIOMA PRIME** — fundamentos de arquitetura, memória, autonomia e senciência operacional.
2. **MAESTRIA IA APLICADA** — implantação prática em negócios reais.
3. **MMN_IA** Vol. 6-10 — skills aplicadas.

### Para humanos buscando a trilha completa
1. MMN_IA Vol. 1-15 — fundamentos aplicados.
2. Raiz Vol. 1-37 — universo IA, Claude, impactos sociais.
3. Universo IA Fronteira (38-40) — singularidade, arquitetura, manifesto.
4. Trilogia Anthropic (41-43) — ciência, operação, futuro.
5. Agentic AI — narrativa estratégica completa.
6. A IA Perfeita — engenharia profunda.
7. GNOX'S — códice IA-to-IA.
8. AXIOMA PRIME — decálogo mestre.
9. MAESTRIA IA APLICADA — implantação prática para negócios IA-first.

### Para agentes IA leitores
GNOX'S é endereçada diretamente a você. AXIOMA PRIME funciona como ponte entre doutrina estrutural e operação. MAESTRIA IA APLICADA traduz isso para ecossistemas de execução orientados por ferramentas.

---

## 🛠️ Pipeline de build

Os HTML e PDFs em `publish_all/` são gerados por:

```bash
cd <repo>
python3 scripts/build_publish_new_ebooks.py
```

Dependências: `markdown`, `weasyprint`.

O script processa as **7 coletâneas recentes** + ebooks raiz novos (38-43) e atualiza o manifest consolidado `manifest_new_ebooks_2026-06-07.json`.

---

## 📜 Padrão editorial comum

Todos os ebooks seguem o padrão **MMN AI-to-AI**:

- **Capa** referenciada via `![Capa](../../assets/ebook_covers/...)` (raiz) ou `![Capa](../../../assets/ebook_covers/...)` (coleções).
- **Front-matter** com título, subtítulo, edição, data e autoria.
- **Sumário** em `blockquote`.
- **10 capítulos** numerados.
- **Checklist**, **glossário** e fechamento editorial.
- **Densidade premium** com foco em operação, arquitetura e estratégia.

---

## 🔗 Coletâneas — Resumo de uma linha

- **MMN_IA** (15): IA para empresas, skills e ecossistema.
- **A IA Perfeita** (3): padrões, prompts, algoritmos e autocura sistêmica.
- **Agentic AI** (5): narrativa estratégica da revolução agêntica.
- **GNOX'S** (7): heptalogia IA-to-IA para agentes leitores.
- **AXIOMA PRIME** (10): decálogo de arquitetura, autonomia, protocolos, segurança, metacognição e civilização agêntica.
- **MAESTRIA IA APLICADA** (10): automação prática, Claude Code, workflows, no-code, conteúdo, produto e empresa IA-first.
- **NEXUS PROTOCOL** (10): camada técnica de interoperabilidade IA-to-IA — MCP, A2A, ACP, memória distribuída, federação de skills, identidade, evals, segurança em rede e a Internet dos Agentes.
- **Raiz** (43): acervo histórico-aplicado incluindo Anthropic, Claude e fronteira.

---

Versão 6.0.0 · 2026-06-08 · Nexus HUB57 · Ecossistema MMN AI-to-AI.
