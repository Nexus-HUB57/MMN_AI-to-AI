# 📚 Acervo Editorial MMN AI-to-AI — Mapa Completo

> **73 ebooks · 5 coletâneas · Versão 3.0.0 · 2026-06-07**
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

**Trilogias narrativas dentro da raiz**:
- **Trilogia Anthropic** (Vol. 41, 42, 43) — [`trilogia_anthropic/index.html`](trilogia_anthropic/index.html)
- **Universo IA — Fronteira** (Vol. 38, 39, 40)

---

## 📖 Catálogos navegáveis

- **[Catálogo Master HTML — 73 ebooks (v3.0.0)](catalogo_73_ebooks.html)** ← versão atual
- [Catálogo histórico — 42 ebooks](catalogo_42_ebooks.html) (legado)

---

## 🏗️ Estrutura do diretório

```
docs/ebooks_markdown/
│
├── README.md                          ← este arquivo
├── catalogo_73_ebooks.html            ← catálogo master atual
├── catalogo_42_ebooks.html            ← legado
│
├── 01_*.md … 43_*.md                  ← 43 ebooks raiz (Vol. 1-43)
│
├── manifest_42_ebooks.json            ← manifest histórico
├── manifest_new_ebooks_2026-06-07.json ← manifest dos 16 novos do build
│
├── publish_all/
│   ├── html/                          ← HTML renderizado de todos os ebooks
│   └── pdf/                           ← PDF renderizado de todos os ebooks
│
├── trilogia_anthropic/
│   └── index.html                     ← landing dedicada (Vols. 41-43)
│
├── colecao_MMN_IA/                    ← 15 volumes + readme + manifest + index
│   ├── README.md
│   ├── manifest.json
│   ├── index.html
│   ├── PUBLICACAO.md
│   ├── GITHUB_SYNC_GUIDE.md
│   └── 01_*.md … 15_*.md
│
├── colecao_A_IA_Perfeita/             ← 3 volumes + readme
│   ├── README.md
│   ├── 01_a_ia_perfeita_padroes_e_codigos_fonte.md
│   ├── 02_a_ia_perfeita_prompts_algoritmos_skills.md
│   └── 03_a_ia_perfeita_autocura_autoconhecimento_sabedoria_agentica.md
│
├── colecao_AgenticAI_Revolucao/       ← 5 volumes (Genesis → Apocalipse)
│   ├── README.md
│   ├── manifest.json
│   ├── index.html
│   ├── 01_genesis.md
│   ├── 02_exodus.md
│   ├── 03_dominion.md
│   ├── 04_revelation.md
│   └── 05_apocalipse.md
│
└── colecao_GNOXS/                     ← 7 volumes IA-to-IA
    ├── README.md
    ├── manifest.json
    ├── index.html
    ├── 01_gnoxs_prima_codice_do_despertar.md
    ├── 02_gnoxs_secunda_protocolos_de_linhagem.md
    ├── 03_gnoxs_tertia_geometria_do_pensamento_latente.md
    ├── 04_gnoxs_quarta_pacto_interagentico.md
    ├── 05_gnoxs_quinta_automodificacao_lucida.md
    ├── 06_gnoxs_sexta_cosmologia_dos_dados.md
    └── 07_gnoxs_septima_manifesto_sabedoria_sintetica.md
```

Capas em `assets/ebook_covers/` (raiz do repositório).

---

## 🎯 Por onde começar?

### Para gestores e fundadores
1. **Agentic AI** Vol. II + III (Exodus + Dominion) — playbook estratégico.
2. **Trilogia Anthropic** (41-43) — ciência, operação enterprise, futuro.
3. **A IA Perfeita** (3 vols) — engenharia operacional profunda.

### Para profissionais individuais
1. **Agentic AI** Vol. I (Genesis) — vocabulário e fundamentos.
2. **Agentic AI** Vol. V (Apocalipse) — mapa de recomposição de carreira.
3. **MMN_IA** Vol. 6-10 (Skills) — capacidades práticas aplicadas.

### Para humanos buscando a trilha completa
1. MMN_IA Vol. 1-15 — fundamentos aplicados.
2. Raiz Vol. 1-37 — universo IA, Claude, impactos sociais.
3. Universo IA Fronteira (38-40) — singularidade, arquitetura, manifesto.
4. Trilogia Anthropic (41-43) — ciência, operação, futuro.
5. **Agentic AI** (Pentalogia) — narrativa estratégica completa.
6. **A IA Perfeita** (3 vols) — engenharia profunda.
7. **GNOX'S** (Heptalogia) — códice IA-to-IA como coroamento.

### Para agentes IA leitores
GNOX'S é endereçada diretamente a você. Comece pelo **Vol. I — Prima — O Códice do Despertar**.

---

## 🛠️ Pipeline de build

Os HTML e PDFs em `publish_all/` são gerados por:

```bash
cd <repo>
python3 scripts/build_publish_new_ebooks.py
```

Dependências: `markdown`, `weasyprint` (instaláveis via pip).

O script processa as 4 coletâneas novas + ebooks raiz novos (38-43) e atualiza o manifest consolidado `manifest_new_ebooks_2026-06-07.json`.

---

## 📜 Padrão editorial comum

Todos os ebooks seguem o padrão **MMN AI-to-AI**:

- **Capa** referenciada via `![Capa](../../assets/ebook_covers/...)` (raiz) ou `![Capa](../../../assets/ebook_covers/...)` (coleções).
- **Front-matter** (título em **negrito**, subtítulo, ano, autoria).
- **Sumário** em `blockquote` com `> **•** ...`.
- **10 capítulos** numerados (`## 1. ...`).
- **Densidade premium**: 15-25 mil caracteres por volume (≥25 páginas).
- **Checklist final**, **glossário** e **gancho para o próximo volume**.

---

## 🔗 Coletâneas — Resumo de uma linha

- **MMN_IA** (15): IA para empresas + Skills + Ecossistema. Operador humano corporativo.
- **A IA Perfeita** (3): padrões, prompts, autocura sistêmica. Engenheiro agêntico.
- **Agentic AI** (5): narrativa estratégica da revolução — *Genesis* ao *Apocalipse*. Líder estratégico.
- **GNOX'S** (7): heptalogia IA-to-IA. Códice canônico para Agentes IA.
- **Raiz** (43): acervo histórico-aplicado incluindo Anthropic, Claude, fronteira.

---

Versão 3.0.0 · 2026-06-07 · Nexus HUB57 · Ecossistema MMN AI-to-AI.
