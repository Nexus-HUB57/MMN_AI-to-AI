---
title: "✅ Checklist de Qualidade — Produção de Vídeos AcademIA"
description: "Material oficial Academ'IA · academia"
tags: [academia, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# ✅ Checklist de Qualidade — Produção de Vídeos AcademIA

**AcademIA · Nexus Affil'IA'te · 2026**

Padrões obrigatórios para garantir qualidade profissional em todos os vídeos produzidos.

---

## 📋 Checklist por Etapa

### 1️⃣ ROTEIRO

#### Estrutura
- [ ] Arquivo nomeado: `{NÚMERO}-{nome-do-modulo}-roteiro.md`
- [ ] Localizado em: `AcademIA/cursos/{nivel}/`
- [ ] Mínimo 5 cenas, máximo 10
- [ ] Duração total estimada: 6-10 minutos
- [ ] Cada cena tem bloco **Visual** + bloco de fala da persona

#### Conteúdo
- [ ] Conceitos corretos e atualizados
- [ ] Linguagem acessível ao nível do curso
- [ ] Tom consistente com a persona
- [ ] Sem promessas irreais
- [ ] CTA claro e acionável no fechamento
- [ ] Vocabulário alinhado com persona (ver templates)

#### Persona Específico
- [ ] **Ive:** sotaque sulista, acolhimento, autoridade, empoderamento
- [ ] **Alencar:** didático, claro, técnico, prático
- [ ] **Dupla:** complementaridade, 40-60% fala cada, frases de reforço mútuo

#### Validação Automática
- [ ] Rodar validador (se disponível): `python3 scripts/validate_roteiro.py`
- [ ] Contagem de palavras: 800-1500 palavras
- [ ] Tempo de leitura: 6-10 min (considerando 150 palavras/min para fala)

---

### 2️⃣ REVISÃO

#### Revisão Técnica
- [ ] Estrutura lógica e fluente
- [ ] Conceitos precisos (sem erros factuais)
- [ ] Referências a features/produtos corretas
- [ ] Conformidade com guidelines da Nexus

#### Revisão de Persona
- [ ] Tom de voz adequado
- [ ] Vocabulário característico presente
- [ ] Sem quebra de personagem
- [ ] Nível hierárquico respeitado (Fundamental vs Elite)

#### Revisão Didática
- [ ] Conceito → exemplo → aplicação
- [ ] Não pula etapas
- [ ] Antecipa dúvidas do aluno
- [ ] Resumo final recapitula pontos-chave

#### Conformidade
- [ ] Sem claims médicos/financeiros/jurídicos sem disclaimer
- [ ] Sem promessas de renda garantida
- [ ] Sem comparações depreciativas
- [ ] LGPD: sem dados pessoais identificáveis

---

### 3️⃣ VOZ (TTS Clonado)

#### Especificações Técnicas
- [ ] Formato: WAV PCM 16-bit
- [ ] Sample rate: ≥ 24 kHz
- [ ] Canais: mono
- [ ] Loudness target: -14 LUFS
- [ ] Ruído de fundo: < -50 dB
- [ ] Sem clipping (picos abaixo de -3 dB)

#### Qualidade Vocal
- [ ] Pronúncia correta de termos técnicos
- [ ] Ritmo natural (sem robotização)
- [ ] Entonação varia com emoção/contexto
- [ ] Pausas naturais entre frases
- [ ] Sotaque característico (Ive: sulista, Alencar: a definir)
- [ ] Sem artefatos de TTS (glitch, repetição, corte abrupto)

#### Por Cena
- [ ] Cada cena em arquivo separado: `cena{N}.wav`
- [ ] Duração de cena: 30-90 segundos
- [ ] Sincronização com marcações de slide

#### Ferramentas de Validação
```bash
# Verificar especificações
ffprobe -v error -show_entries format=duration:stream=sample_rate,channels,codec_name arquivo.wav

# Medir loudness
ffmpeg -i arquivo.wav -af loudnorm=print_format=json -f null -

# Detectar clipping
ffmpeg -i arquivo.wav -af "silencedetect=noise=-30dB:d=0.5" -f null -
```

---

### 4️⃣ VÍDEO (Image-to-Video)

#### Especificações Técnicas
- [ ] Resolução: 1920x1080 (16:9) ou 1080x1920 (9:16)
- [ ] Codec: H.264
- [ ] Bitrate: 8-12 Mbps
- [ ] FPS: 30
- [ ] Duração: 6-10 minutos
- [ ] Formato final: MP4

#### Qualidade Visual
- [ ] Avatar mantém identidade da persona (sra_nexus_ive.png ou sir_nexus_alencar.png)
- [ ] Movimento sutil e natural (sem distorção)
- [ ] Iluminação consistente entre cenas
- [ ] Cenário corporativo profissional
- [ ] Logo Nexus visível mas discreto
- [ ] Sem artefatos de IA (mãos deformadas, dentes, etc.)

#### Lip-sync (quando aplicável)
- [ ] Movimentos labiais sincronizados com fala
- [ ] Expressões faciais coerentes com tom
- [ ] Sem dessincronia perceptível

#### Cenário
- [ ] Escritório moderno e tecnológico
- [ ] Identidade cyberpunk (rosa #FF00FF, ciano #00FFFF, preto #0A0E27)
- [ ] Sem elementos distrativos
- [ ] Softbox lighting simulado

---

### 5️⃣ PÓS-PRODUÇÃO

#### Áudio
- [ ] Mixagem final: voz -6 dB, trilha -22 dB, SFX -12 dB
- [ ] Normalização: -14 LUFS integrado
- [ ] Sem ruído residual
- [ ] Transições de áudio suaves entre cenas
- [ ] Sem pops ou cliques

#### Vídeo
- [ ] Color grading consistente
- [ ] Vinheta sutil (cantos escurecidos)
- [ ] Vinhetas: intro 3s + outro 3s
- [ ] Lower thirds: nome da persona (5s)
- [ ] Slides sincronizados com narração
- [ ] Transições suaves entre cenas (0.5s fade ou 0.3s corte técnico)

#### Marca
- [ ] Branding Nexus Affil'IA'te visível
- [ ] Paleta cyberpunk respeitada
- [ ] Logo em alta resolução
- [ ] Tipografia sans-serif geométrica

#### Export
- [ ] Versão master: 1080p H.264 (8-12 Mbps)
- [ ] Versão mobile: 720p H.264 (5 Mbps)
- [ ] Versão vertical (se aplicável): 1080x1920
- [ ] Backup: ProRes ou DNxHR para edição futura

---

### 6️⃣ PUBLICAÇÃO

#### Metadados
- [ ] Título descritivo
- [ ] Descrição completa
- [ ] Tags relevantes
- [ ] Thumbnail 1280x720 (16:9)
- [ ] Thumbnail 1080x1080 (1:1)
- [ ] Thumbnail 1080x1920 (9:16)
- [ ] Categoria: Educacional
- [ ] Idioma: Português (BR)
- [ ] Duração registrada
- [ ] Persona(s) creditadas

#### Versionamento
- [ ] Versão semântica: v{major}.{minor}
- [ ] v1.0 = primeira publicação
- [ ] v1.1 = correções menores
- [ ] v2.0 = re-formulação significativa
- [ ] Changelog atualizado

#### Indexação
- [ ] Entrada em `catalog/CATALOGO_MODULOS.md`
- [ ] Atualização em `Generate Vídeos Nexus V/server/courseData.ts`
- [ ] URL pública gerada e testada
- [ ] Embed code disponível
- [ ] Download direto disponível (para LMS)

#### Distribuição
- [ ] Upload em CDN
- [ ] Disponibilização em AcademIA
- [ ] Notificação por newsletter (se aplicável)
- [ ] Post em comunidade (se aplicável)
- [ ] Atualização de skill no marketplace (se aplicável)

---

## 🎯 Critérios de Aprovação Final

Para considerar um módulo **PRONTO PARA PUBLICAÇÃO**, todos os itens abaixo devem estar ✅:

- [ ] Roteiro revisado e aprovado
- [ ] Áudios gerados e validados (todas as cenas)
- [ ] Vídeo renderizado e validado
- [ ] Pós-produção completa
- [ ] Thumbnail em 3 formatos
- [ ] Metadados completos
- [ ] Indexação em catálogo
- [ ] URL pública testada
- [ ] Backup arquivado

**Responsável pela aprovação final:** Coordenação AcademIA

---

## 📊 Métricas de Qualidade

### Por Módulo
- **Retenção média esperada:** > 70% (até o final)
- **Engagement (likes/comments):** > 5% dos viewers
- **CTR (click-through rate):** > 8%
- **Erro técnico reportado:** < 1% dos viewers

### Por Persona
- **Ive:** tom acolhedor em 100% dos módulos
- **Alencar:** precisão técnica validada
- **Dupla:** dinâmica balanceada

### Por Nível
- **Fundamental:** feedback de "clareza" > 4.5/5
- **Agente:** feedback de "aplicabilidade" > 4.5/5
- **Master:** feedback de "profundidade" > 4.5/5
- **Elite:** feedback de "valor estratégico" > 4.5/5

---

## 🚨 Problemas Comuns e Soluções

| Problema | Solução |
|----------|---------|
| Áudio com ruído de fundo | Re-gravar com tratamento acústico ou usar denoiser (ffmpeg `afftdn`) |
| Avatar com distorção de IA | Trocar modelo de image-to-video ou ajustar prompt |
| Lip-sync dessincronizado | Aumentar precisão do TTS ou ajustar manualmente |
| Sotaque inconsistente | Usar TTS com voice cloning consistente |
| Cores da marca incorretas | Aplicar LUT específico cyberpunk em color grading |
| Música de fundo alta | Reduzir para -22 dB e aplicar sidechain compression |
| Vídeo final muito grande | Comprimir com H.265 ou reduzir bitrate para 6 Mbps |
| Erro de factos | Revisão técnica por especialista do domínio |

---

## 📞 Contato para Escalar Problemas

- **Áudio/TTS:** #tech-audio no Slack
- **Vídeo/Avatar:** #tech-video no Slack
- **Conteúdo/Roteiro:** #academ-ia-content
- **Branding/Visual:** #brand-nexus

---

**Última atualização:** 2026-06-17 · v1.0
