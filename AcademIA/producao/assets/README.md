# 🎨 Assets de Produção — AcademIA

**Nexus Affil'IA'te · MMN_IA · 2026**

Biblioteca de assets reutilizáveis para produção de vídeo-aulas com personas IA.

---

## 📁 Estrutura de Diretórios

```
AcademIA/producao/assets/
├── avatares/         # Imagens de referência das personas
├── cenarios/         # Fundos e cenários corporativos
├── vinhetas/         # Intro, outro, transições
├── slides/           # Templates de slides
├── transicoes/       # Efeitos de transição
├── icons/            # Ícones do ecossistema Nexus
└── branding/         # Logo, paleta, tipografia
```

---

## 🎭 Avatares das Personas

### Sra. Nexus Ive
- **Arquivo:** `AcademIA/personas/sra_nexus_ive.png`
- **Resolução:** 1632x2176 (alta)
- **Uso:** Image-to-video, slide de abertura, thumbnail
- **Cenas disponíveis:** 7 cenas (00-boas-vindas) com este avatar

### Sir. Nexus Alencar
- **Status:** 🔄 Aguardando envio
- **Arquivo previsto:** `AcademIA/personas/sir_nexus_alencar.png`

---

## 🏢 Cenários

### Cenário 1: Escritório Moderno
- **Descrição:** Fundo de escritório com janela, luz natural, móveis minimalistas
- **Paleta:** Cinza claro, branco, toques de madeira
- **Uso:** Aulas técnicas, demos
- **Status:** 📋 A gerar

### Cenário 2: Escritório Cyberpunk
- **Descrição:** Fundo escuro com elementos neon, gradiente rosa/ciano
- **Paleta:** Preto (#0A0E27), rosa neon (#FF00FF), ciano (#00FFFF)
- **Uso:** Aulas conceituais, lançamentos
- **Status:** 📋 A gerar

### Cenário 3: Setup Técnico
- **Descrição:** Monitor ao fundo, código na tela, periféricos tech
- **Paleta:** Azul escuro, preto, luz de tela
- **Uso:** Módulos Agente/Master, demos
- **Status:** 📋 A gerar

---

## 🎬 Vinhetas

### Intro Nexus (3 segundos)
- **Descrição:** Logo Nexus Affil'IA'te com animação de entrada
- **Elementos:** Logo + tagline "Inteligência Operacional Distribuída"
- **Trilha:** Som ambiente sutil com nota musical
- **Status:** 📋 A gerar

### Outro Nexus (3 segundos)
- **Descrição:** Logo Nexus + chamada para próximo módulo
- **Elementos:** Logo + "Continue sua jornada" + seta
- **Status:** 📋 A gerar

### Transição de Cena (0.5s)
- **Descrição:** Fade suave ou corte técnico
- **Uso:** Entre cenas do mesmo módulo
- **Status:** 📋 A gerar

---

## 📊 Slides

### Template de Slide Cyberpunk
- **Paleta:** Preto profundo + rosa neon + ciano elétrico
- **Tipografia:** Sans-serif geométrica bold
- **Elementos:** Linhas HUD, colchetes de canto
- **Layout:** Título centralizado + bullet points

### Template de Slide Corporativo
- **Paleta:** Branco + azul + cinza
- **Tipografia:** Sans-serif clean
- **Layout:** Título + conteúdo + footer com logo

### Template de Slide Técnico
- **Paleta:** Escuro + código com syntax highlighting
- **Uso:** Módulos Agente/Master
- **Elementos:** Terminal snippet, diagramas

---

## 🔄 Transições

| Tipo | Duração | Uso |
|------|---------|-----|
| Fade suave | 0.5s | Transições conceituais, mudanças de tópico |
| Corte seco | 0.0s | Demos técnicas, sequência rápida |
| Wipe horizontal | 0.3s | Mudança de seção, divisão clara |
| Zoom in/out | 0.4s | Ênfase em detalhe |
| Glitch cyberpunk | 0.3s | Efeito especial, módulos Elite |

---

## 🎯 Ícones do Ecossistema

- 🤖 Agente IA
- ⚡ Skill
- 🛡️ Judge
- 🌐 SHO (Sistema Híbrido de Orquestração)
- 💎 IOAID (Infraestrutura Operacional de Inteligência Distribuída)
- 📚 Academ'IA
- 🧪 Lab Nexus
- 📖 Lib Nexus
- 📋 Playbook
- 🎬 Treinamento
- 🚀 Webinar
- 👤 Persona (Ive/Alencar)

---

## 🎨 Branding

### Paleta Oficial
| Cor | Hex | Uso |
|-----|-----|-----|
| Preto profundo | `#0A0E27` | Background principal |
| Rosa neon | `#FF00FF` | Destaque, acentos |
| Ciano elétrico | `#00FFFF` | Destaque secundário |
| Branco puro | `#FFFFFF` | Texto, contraste |
| Cinza médio | `#6B7280` | Texto secundário |
| Verde olive | `#556B2F` | Acento da persona Ive |
| Azul aço | `#4682B4` | Acento da persona Alencar |

### Tipografia
- **Títulos:** Sans-serif geométrica bold (ex: Orbitron, Audiowide)
- **Corpo:** Sans-serif clean (ex: Inter, Roboto)
- **Código:** Monospace (ex: Fira Code, JetBrains Mono)

### Logo
- **Arquivo:** `assets/branding/logo_nexus.webp`
- **Versões:** Light, dark, monocromático
- **Uso:** Vinhetas, slides, thumbnails, watermarks

---

## 📋 Padrão de Nomenclatura

```
{nivel}_{numero}_{modulo}_{tipo}_{versao}.{extensao}

Exemplos:
- fundamental_00_boas_vindas_roteiro_v1.md
- fundamental_00_boas_vindas_cena1_v1.wav
- fundamental_00_boas_vindas_video_v1.mp4
- thumbnail_fundamental_00_v1.webp
```

---

## 🔗 Assets Externos (referências)

- **Áudios brutos (TTS):** `AcademIA/cursos/{nivel}/{modulo}-cena{N}.wav`
- **Imagens de persona:** `AcademIA/personas/{persona}.png`
- **Áudios de referência para clone:** `AcademIA/personas/voz_*.wav`

---

## 📊 Status da Biblioteca

| Categoria | Itens disponíveis | Itens pendentes |
|-----------|-------------------|-----------------|
| Avatares | 1/2 (Ive) | Alencar |
| Cenários | 0/3 | 3 |
| Vinhetas | 0/3 | 3 |
| Slides templates | 0/3 | 3 |
| Transições | 0/5 | 5 |
| Ícones | 0/12 | 12 |
| Branding | 0/3 | 3 |
| **Total** | **1/31** | **30** |

---

## 🚀 Próximas Ações

1. **Receber Sir. Nexus Alencar** (avatar + áudio de referência)
2. **Gerar 3 cenários cyberpunk** (escritório moderno, cyberpunk, setup técnico)
3. **Criar vinhetas** (intro, outro, transição)
4. **Criar templates de slide** (3 variações)
5. **Gerar ícones** (12 ícones do ecossistema)
6. **Documentar logo** e assets de marca

---

**Última atualização:** 2026-06-17 · v1.0
