# AcademIA Nexus · Padrão Permanente de Produção de Vídeos

**Estabelecido em:** Onda 33 (2026-07-09)
**Válido para:** Toda produção de vídeos futura da AcademIA · sem necessidade de re-pergunta

---

## 1. Formato Padrão (Híbrido)

Todos os vídeos AcademIA seguem esta estrutura obrigatória:

| Bloco | Duração | Conteúdo |
|-------|---------|----------|
| **Abertura** | 5-15 segundos | IA generativa (Seedance 2.0 ou Kling v3) com Sra. Nexus Ive, Sir Nexus Alencar ou ambos, apresentando o tema |
| **Corpo** | 60-120 segundos | Slides motion-graphics profissionais com narração TTS voice-cloned na voz das personas |
| **CTA final** | Últimos 6-10 segundos | Slide de fechamento com URL e próximo passo |

**Duração total padrão:** 60-140 segundos (formato teaser)

---

## 2. Assets Canônicos das Personas

### Sra. Nexus Ive (matriarcal, estratégica)
- **Imagem oficial:** `AcademIA/personas/ive/ive_nexus_ref.png`
- **Voz clonável:** `AcademIA/personas/ive/audio/official_voice.wav` (32.7s, 24kHz mono PCM)
- **Visual:** 35 anos, cabelo curto negro liso, blazer vinho escuro/preto/verde oliva, colar pingente triangular dourado, tatuagem Nexus abaixo do olho
- **Voz:** serena, articulada, sotaque sulista leve, rouquidão suave

### Sir Nexus Alencar (técnico, didático)
- **Imagem oficial:** `AcademIA/personas/alencar/assets/alencar_reference.png`
- **Voz clonável:** `AcademIA/personas/alencar/voz_sir_nexus_alencar.wav` (29.2s)
- **Visual:** 35-40 anos, terno azul-marinho/azul-aço/grafite, cenário com fluxos de dados azuis ao fundo
- **Voz:** serena, autoritária, didática, precisa

### Dupla (celebrações, aberturas especiais)
- **Imagem oficial:** `AcademIA/personas/dupla/assets/celebration_ive_alencar.png`
- **Áudio de diálogo:** `AcademIA/personas/ive/audio/` (69.9s)

---

## 3. Paleta e Identidade Visual dos Slides

```
BG_DARK    = #0A0F1E   (deep navy)
BG_MID     = #12192D   (mid navy)
ACCENT_TEAL = #46B4C3  (trilha Master · fundamentos · agente)
ACCENT_GOLD = #D7AF5A  (trilha Elite)
TEXT_WHITE  = #F0F0F5
TEXT_MUTED  = #B4B4C3
```

**Elementos obrigatórios em cada slide:**
- Barra fina superior (4px) com cor da trilha
- Barra vertical de acento à esquerda (8px)
- Pill "TRILHA {SÉRIE}" no canto superior esquerdo
- Título grande (76-96px, DejaVuSans-Bold)
- Subtítulo (42-56px, DejaVuSans regular, cor da trilha)
- Bullets com bolinha na cor da trilha
- Rodapé: `oneverso.com.br/academia · @NexusAffilIAte`
- Marca d'água canto inferior direito: `ACADEM IA NEXUS`

---

## 4. Padrão de Pós-produção e Publicação

- **Renderização:** 1280x720 @ 25fps, H.264 CRF 23, AAC 192kbps
- **Loudnorm:** I=-16 LUFS, TP=-1.5, LRA=11
- **Fade in/out:** 0.5s entrada · 0.8s saída
- **Publicação inicial:** **PRIVATE** no YouTube (só owner vê) → aprovação humana → mudança para unlisted em lote
- **Canal:** `@NexusAffilIAte-w9p`
- **Sincronização automática:** popular `youtube_video_id` no DB após aprovação

---

## 5. Diretrizes de Voz das Personas

**Sra. Ive** usa expressões: "Veja bem…", "Compreenda…", "Respire fundo…", "O caminho para a escala estruturada começa no…"

**Sir Alencar** usa expressões: "Sejam bem-vindos de volta.", "Convido vocês a mergulharem comigo em…", "Excelente pergunta.", "Pensem nele como…", "Hoje, vamos…"

Tom por trilha:
| Nível | Ive | Alencar |
|-------|-----|---------|
| Fundamentos | Acolhedor, paciente | Didático, passo a passo |
| Agente | Instrutivo | Instrutivo, direto |
| Master | Estratégico, analítico | Analítico, preciso |
| Elite | Parceria de alto nível | Técnico profundo |

---

## 6. Pipeline Reprodutível

```bash
# 1. Gerar narrações voice-cloned (Minimax Voice Clone)
python3 scripts/youtube/build_narrations.py

# 2. Compor vídeos (slides + narração)
python3 scripts/youtube/compose_videos.py

# 3. Deploy para VPS
scp video-*.mp4 root@143.95.213.237:/var/www/oneverso/current/public/academia/videos/

# 4. Sincronizar DB
sudo -u postgres psql nexus_prod -c "UPDATE academia_lessons SET video_url='...', duration_s=... WHERE lesson_id='...';"

# 5. Upload YouTube como PRIVATE
python3 scripts/youtube/upload_academia_youtube.py --limit 5
```

---

**Este documento é o contrato permanente de produção. Não deve ser re-perguntado ao usuário em ondas futuras.**
