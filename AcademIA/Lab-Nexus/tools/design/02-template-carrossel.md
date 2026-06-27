---
title: "02-template-carrossel"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "02 · Template de Carrossel Instagram"
description: "Estrutura visual + specs técnicos + 3 templates prontos para carrossel IG"
tags: [lab-nexus, design, instagram, carrossel, template]
category: design
level: fundamental
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: copywriter-persuasivo
course_anchor: cursos/fundamental/03-painel-afiliado.md
📱 02 · Template de Carrossel Instagram
3 templates visuais prontos (educativo, vendas, autoridade) + specs técnicos + guia de design.

🎯 Spec
Atributo	Valor
O que é	3 templates (Figma + PNG) + especificações técnicas + boas práticas
Quando usar	Criar carrossel educativo, vendas, autoridade
Pré-requisitos	Nível 🥉 Fundamental; Figma ou Canva; copy pronta
Tempo estimado	20 min para customizar 1 template
Skill que executa	copywriter-persuasivo
Judge que valida	judge-revisor
📋 Playbook — Especificações Técnicas
📐 Dimensões Canônicas
yaml

Copy
principal:

  dimensao: "1080x1350px (4:5)"

  uso: "Feed Instagram — máxima visibilidade"

  dpi: 72

  formato: "PNG (estático) ou MP4 (animado)"


alternativos:

  quadrado: "1080x1080 (1:1) — Stories, Facebook"

  stories: "1080x1920 (9:16) — Stories, Reels"

  cover: "1080x1080 — capa do carrossel (1º slide)"


quantidade_slides:

  minimo: 5

  ideal: 7-10

  maximo: 20

  sweet_spot: 8
🎨 Paleta Nexus (Padrão)
yaml

Copy
primarias:

  roxo_nexus: "#6B2DCF"

  branco: "#FFFFFF"

  preto: "#1A1A1A"

secundarias:

  cinza_claro: "#F5F5F5"

  cinza_escuro: "#333333"

  verde_sucesso: "#10B981"

gradientes:

  - "Roxo → Rosa (#6B2DCF → #EC4899)"

  - "Roxo → Azul (#6B2DCF → #3B82F6)"
✍️ Tipografia Padrão
yaml

Copy
headline:

  fonte: "Montserrat Bold"

  tamanho: "80-120pt (depende do texto)"

  cor: "Branco (sobre fundo escuro) ou Preto"


subheadline:

  fonte: "Montserrat SemiBold"

  tamanho: "40-60pt"

  cor: "Branco 80% (transparência)"


corpo:

  fonte: "Inter Regular"

  tamanho: "24-36pt"

  cor: "Branco 90%"
📦 Asset (3 Templates Prontos)
📊 Template 1 — Educativo ("Como fazer X")
yaml

Copy
slide_1_gancho:

  fundo: "Gradiente roxo → azul"

  texto_principal: "{{5 erros que matam seu funil}}"

  texto_secundario: "Deslize pra ver →"

  elementos: "Logo Nexus inferior direito, ícone de seta"


slide_2_problema:

  fundo: "Branco"

  texto: "{{Erro 1: Headline sem especificidade}}"

  icone: "❌ vermelho"

  numero_pagina: "2/8"


slides_3_7_conteudo:

  fundo: "Branco"

  layout: "Título topo + corpo meio + ícone inferior"

  texto_titulo: "{{Erro X: ...}}"

  texto_corpo: "{{Explicação em 2-3 frases curtas}}"

  icone: "✅ verde (solução) ou ❌ vermelho (erro)"

  numero_pagina: "X/8"


slide_8_cta:

  fundo: "Gradiente roxo → rosa"

  texto_principal: "{{Salva esse post pra revisar depois}}"

  texto_secundario: "{{Marca alguém que precisa ver 👇}}"

  elementos: "@seu.perfil, QR code, ícone salvar"
📊 Template 2 — Vendas (Lançamento)
yaml

Copy
slide_1_hook:

  fundo: "Imagem do produto + overlay escuro 60%"

  texto: "{{O método que dobrou meu faturamento em 90 dias}}"

  texto_menor: "{{Sem trabalhar 14h/dia}}"

  elementos: "Logo Nexus, badge 'NOVO'"


slide_2_dor:

  fundo: "Vermelho escuro + texto branco"

  texto_grande: "{{Você trabalha muito, mas não cresce?}}"

  icone: "😩"


slide_3_solucao:

  fundo: "Verde escuro + texto branco"

  texto_grande: "{{Apresentamos: {{nome_produto}}}}"

  texto_menor: "{{O sistema X-Y-Z}}"


slides_4_5_o_que_inclui:

  fundo: "Branco"

  layout: "Cards de features (3 por slide)"

  conteudo: |

    ✅ {{Feature 1}}

    ✅ {{Feature 2}}

    ✅ {{Feature 3}}


slide_6_prova_social:

  fundo: "Foto do cliente (se permitido)"

  texto: "{{De R$ 15k para R$ 60k em 90 dias}}"

  elementos: "Foto, cargo, depoimento curto"


slide_7_oferta:

  fundo: "Dourado/premium"

  texto: "{{De R$ 997 por apenas R$ 497}}"

  elementos: "Selo garantia, badge 'vagas limitadas'"


slide_8_cta:

  fundo: "Gradiente forte"

  texto: "{{QUERO PARTICIPAR AGORA}}"

  botao: "Link na bio"

  elementos: "@seu.perfil, QR code, seta animada"
📊 Template 3 — Autoridade (Estudo de Caso)
yaml

Copy
slide_1_hook:

  fundo: "Foto profissional + overlay"

  texto: "{{Como a {{empresa}} multiplicou {{métrica}} em {{prazo}}}}"

  elementos: "Logo empresa cliente"


slide_2_contexto:

  fundo: "Branco"

  texto: "{{Empresa X tinha o desafio Y}}"

  icone: "🎯"


slide_3_estrategia:

  fundo: "Branco"

  texto: "{{Implementamos Z, que fez A, B, C}}"

  elementos: "Print/dashboard"


slides_4_5_resultados:

  fundo: "Verde (positivo)"

  texto: |

    +{{X}}% em {{métrica}}

    +{{Y}}% em {{métrica}}

    ROI: {{Z}}x

  elementos: "Gráficos visuais"


slide_6_depoimento:

  fundo: "Foto + texto"

  texto: "{{Citação do cliente}}"

  elementos: "Foto, cargo, empresa"


slide_7_cta:

  fundo: "Gradiente"

  texto: "{{Quer resultado similar?}}"

  botao: "{{Agendar diagnóstico}}"

  elementos: "Calendly link"
📦 Asset (Elementos Visuais Reutilizáveis)
🎨 Ícones Padrão
yaml

Copy
navegacao:

  - "Seta direita: indica 'próximo'"

  - "Número de página: '3/8'"

  - "Indicador de progresso: barra no topo"


status:

  - "✅ verde: acerto / solução"

  - "❌ vermelho: erro"

  - "⚠️ amarelo: atenção"

  - "🎁 presente: bônus / brinde"

  - "🔒 cadeado: segurança / garantia"

  - "⭐ estrela: avaliação"

  - "🎯 alvo: objetivo"

  - "⏰ relógio: urgência"


cta:

  - "👇 dedo apontando para baixo"

  - "🔗 link"

  - "📩 envelope"

  - "📞 telefone"
📦 Asset (Ferramentas Recomendadas)
yaml

Copy
design:

  figma: "Ideal para templates reutilizáveis (grátis)"

  canva: "Bom para iniciantes (templates prontos)"

  photoshop: "Para designers avançados"

  sketch: "Alternativa ao Figma (Mac only)"


mockup:

  smartmockups: "Colocar design em mockup de celular"

  previewed: "Alternativa para mockups"


animacao:

  canva: "Animações simples (preset)"

  after_effects: "Animações complexas"

  capcut: "Edição de vídeo + texto animado"
📊 Métricas de Sucesso
Métrica	Meta
Alcance	5-15% dos seguidores
Saves	≥ 2% do alcance
Compartilhamentos	≥ 0.3%
CTR para bio	≥ 1%
Engajamento médio	≥ 3%
Tempo médio de leitura (7+ slides)	≥ 5s/slide
⚠️ Riscos & Anti-patterns

❌ Texto pequeno demais (ilegível em mobile)

❌ Mais de 12 palavras por slide → cognitivo

❌ Misturar estilos diferentes em 1 carrossel

❌ Cores fora da paleta (quebra marca)

❌ Sem CTA final (apenas entrega conteúdo)

❌ Logo grande demais (poluição visual)

✅ **Hierarquia clara: título > corpo"

✅ **1 ideia por slide"

✅ **Consistência visual (paleta + tipografia)"

✅ **CTA único no último slide"

✅ **Logo discreto (10-15% do slide)"

🔗 Próximas ferramentas

→ tools/design/01-briefing-criativo.md — briefing

→ tools/design/03-thumb-youtube.md — thumb YouTube

→ tools/copy/07-post-instagram.md — copy

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus