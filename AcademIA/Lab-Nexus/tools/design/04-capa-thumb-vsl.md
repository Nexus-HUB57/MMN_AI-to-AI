---
title: "04-capa-thumb-vsl"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "04 · Capa e Thumbnail de VSL"
description: "Thumb de Video Sales Letter (VSL) para YouTube + LP de vendas"
tags: [lab-nexus, design, vsl, video, capa, thumb]
category: design
level: master
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: funnel-architect
course_anchor: cursos/master/00-otimizacao-conversao.md
🎥 04 · Capa e Thumbnail de VSL
Thumb para VSL YouTube + capa para página de vendas + thumbnails de remarketing.

🎯 Spec
Atributo	Valor
O que é	3 tipos de thumb (YouTube VSL, LP capa, social proof) + templates
Quando usar	Antes de publicar VSL, criar LP, fazer remarketing
Pré-requisitos	Nível 🥇 Master; VSL gravada; LP pronta
Tempo estimado	20 min para criar 3 thumbs
Skill que executa	funnel-architect
Judge que valida	judge-revisor
📋 Playbook — 3 Tipos de Thumbnail de VSL
1. 🖥️ Thumb YouTube (Topo de Funil)
yaml

Copy
objetivo: "Atrair clic para assistir VSL"

caracteristicas:

  - "Mobile-first (aparece no YouTube Shorts, busca)"

  - "Curiosidade + emoção"

  - "Pode ser clickbait moderado (YOUTUBE TOLERA MAIS QUE META)"

  - "Texto 2-4 palavras"

  

limitacoes:

  - "Não pode ser exatamente igual ao criativo Meta (canibalização)"

  - "Pode ser mais 'livre' que LP"
2. 🏠 Capa de LP (Fundo do VSL)
yaml

Copy
objetivo: "Engajar quem caiu na página de vendas"

caracteristicas:

  - "Frame atrativo do VSL (não o início chato)"

  - "Loop visual (auto-play, sem som)"

  - "Overlay com CTA visível"

  - "Compatível com hero (above the fold)"
3. 📱 Thumb Remarketing (Retargeting)
yaml

Copy
objetivo: "Re-impactar quem viu mas não comprou"

caracteristicas:

  - "Mais direto (já viu o conteúdo)"

  - "Pode ser mais 'vendoso'"

  - "Mostra oferta/garantia"

  - "Custom audience: 'viewers 50%+'"
📦 Asset (10 Thumbs para VSL)
🖥️ Thumb YouTube — VSL Genérica
yaml

Copy
thumb_01_antes_depois:

  layout: "Split screen 50/50 + seta"

  texto: "DE R$ 0 PARA R$ 100k"

  cor: "Cinza + verde (sucesso)"

  ctr_benchmark: "10-15%"


thumb_02_resultado_chocante:

  layout: "Rosto + número grande + check verde"

  texto: "R$ 100k em 90 dias"

  cor: "Branco + verde"

  ctr_benchmark: "12-18%"


thumb_03_segredo:

  layout: "Rosto sério + cadeado + texto"

  texto: "O SEGREDO que {{nicho}} não conta"

  cor: "Roxo + branco"

  ctr_benchmark: "8-12%"


thumb_04_erro:

  layout: "Rosto indignado + X vermelho"

  texto: "NUNCA faça isso"

  cor: "Vermelho + branco"

  ctr_benchmark: "10-15%"


thumb_05_passo:

  layout: "Rosto + número 3 + check"

  texto: "3 PASSOS para {{resultado}}"

  cor: "Azul + amarelo"

  ctr_benchmark: "9-13%"
🏠 Capa LP — Frame VSL
yaml

Copy
lp_cover_01_frame_inicio:

  uso: "VSL que abre com pergunta provocativa"

  exemplo_frame: "Você sabia que {{estatistica_chocante}}?"

  overlay: "CTA 'Assista e descubra'"


lp_cover_02_frame_dor:

  uso: "VSL que começa com problema"

  exemplo_frame: "Pessoa expressando frustração (close-up)"

  overlay: "Você sente isso?"


lp_cover_03_frame_solucao:

  uso: "VSL que mostra resultado"

  exemplo_frame: "Pessoa celebrando / mostrando dashboard"

  overlay: "Isso é possível. Veja como."


lp_cover_04_loop_dinamico:

  uso: "VSL longo, criar loop visual"

  exemplo_frame: "Cortes de 1s intercalados (auto-play sem som)"

  overlay: "Play no centro"
📱 Thumb Remarketing — VSL Específico
yaml

Copy
remarketing_01_garantia:

  layout: "VSL + selo 30 dias"

  texto: "30 DIAS DE GARANTIA"

  cor: "Dourado premium"

  ctr_benchmark: "5-10%"


remarketing_02_bonus:

  layout: "VSL + presente emoji"

  texto: "BÔNUS exclusivo pra quem assistir"

  cor: "Rosa + branco"

  ctr_benchmark: "5-10%"


remarketing_03_vagas:

  layout: "VSL + cronômetro"

  texto: "ÚLTIMAS VAGAS"

  cor: "Vermelho + branco"

  ctr_benchmark: "6-12%"


remarketing_04_prova:

  layout: "VSL + screenshot de depoimento"

  texto: "{{cliente}} conseguiu R$ {{valor}}"

  cor: "Verde (prova)"

  ctr_benchmark: "7-12%"
📦 Asset (Especificações Técnicas)
📐 Dimensões por Canal
yaml

Copy
youtube:

  thumb: "1280x720px (16:9)"

  minimo_qualidade: "alta"

  formato: "JPG, PNG, GIF (estático), BMP"

  tamanho_max: "2MB"


lp_capa:

  thumb: "1920x1080px (16:9)"

  responsivo: "true (carregar 2x para retina)"

  formato: "JPG ou WebP (otimizado)"

  tamanho_max: "300KB (performance)"


remarketing_meta:

  thumb: "1080x1080 (1:1) ou 1080x1350 (4:5)"

  formato: "JPG ou MP4"

  tamanho_max: "30MB (vídeo) ou 30MB (imagem)"
📦 Asset (Frame Loop — Como Criar)
🎬 Técnica de Frame Loop para VSL
yaml

Copy
objetivo: "Criar thumb que se mexe (auto-play sem som)"


passo_a_passo:

  1. "Selecione 3-5 frames-chave do VSL"

  2. "Crie cortes de 1-2s"

  3. "Use After Effects ou CapCut para intercalar"

  4. "Adicione overlay sutil (loop contínuo)"

  5. "Exporte como MP4 (até 30s) ou GIF"


ferramentas:

  - "After Effects (pro)"

  - "CapCut (grátis, fácil)"

  - "Premiere Pro (pro)"


cuidado: "Não usar áudio (auto-play mudo é padrão)"
📊 Métricas de Sucesso
Métrica	Meta
CTR YouTube (VSL)	≥ 8%
CTR LP (imagem)	≥ 25% (assistir VSL)
Watch time do VSL	≥ 50% (10+ min)
VSL completion rate	≥ 30%
Conversão VSL → checkout	≥ 8%
ROAS remarketing	≥ 3x
⚠️ Riscos & Anti-patterns

❌ Thumb igual ao do YouTube (canibalização)

❌ Frame ruim do VSL (momento de tédio, frame técnico)

❌ Sem overlay de CTA (LP cover)

❌ Texto não-legível em mobile

❌ Atraso no carregamento (LP)

✅ **Selecionar frame emocional (não técnico)"

✅ **Testar 3+ variantes"

✅ **Mobile-first (testar em 320px)"

✅ **WebP ou otimizado (performance < 300KB)"

🔗 Próximas ferramentas

→ tools/design/03-thumb-youtube.md — thumb YouTube geral

→ tools/design/01-briefing-criativo.md — briefing

→ tools/copy/06-video-script.md — script VSL

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus