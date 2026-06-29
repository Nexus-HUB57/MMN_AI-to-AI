# 🎨 06 · Prompt Visual para Carrossel v2

**Categoria:** design
**Nível:** Agente → Master
**Tempo estimado:** 20 min
**Quando usar:** Para gerar briefings de carrossel Instagram/LinkedIn com prompts visuais prontos para Midjourney/DALL-E/Leonardo.

---

## 🎯 O que faz

Gera **briefing estruturado** para carrossel de 5-10 slides, com:
- Conceito visual unificado
- Paleta de cores (HEX codes)
- Tipografia sugerida
- Prompts prontos para IA generativa
- Copy de cada slide
- CTA final

## 🚀 Como usar

```yaml
input:
  tema: "5 erros que 95% dos afiliados cometem"
  audiencia: "afiliados iniciantes, 25-45 anos"
  objetivo: "engajamento + salvar post"
  tom: "diretivo mas acessível"
  num_slides: 7
  estilo_visual: "minimalista com ilustrações isométricas"
  paleta: ["#FF6B6B", "#4ECDC4", "#1A1A2E"]

output:
  - slide 1: hook (capa com número chocante)
  - slide 2-6: erros um por um
  - slide 7: CTA + handle
```

## 📐 Template do Prompt Visual

```
# Carrossel: {{tema}}
Estilo: {{estilo_visual}}
Paleta: {{paleta}}
Tipografia: {{tipografia}}
Mood: profissional mas acessível

# Slide 1 — Capa
"Composição isométrica, fundo {{cor_primaria}}, número grande '95%' em destaque,
texto menor 'erros que afiliados cometem', estilo minimalista, alta legibilidade,
proporção 1:1, espaço para texto superior"

# Slide 2 — Erro #1
"..."
```

## 🎨 Prompts Pré-construídos por Estilo

### Estilo A — Isométrico Minimalista
- Fundo liso, 1 elemento isométrico 3D
- Tipografia bold sans-serif
- Cores primárias + 1 cor de destaque

### Estilo B — Editorial Sério
- Foto preto/branco de fundo
- Overlay colorido
- Tipografia serif clássica

### Estilo C — Vibrante Tech
- Gradientes neon
- Elementos holográficos
- Tipografia moderna geométrica

### Estilo D — Hand-drawn
- Ilustrações à mão
- Fundo papel kraft
- Tipografia manuscrita

## 📦 Outputs

- Briefing PDF/PNG
- Prompts em JSON para uso direto com APIs de imagem
- Sugestões de motion graphics (se for vídeo)
- Lista de fontes compatíveis (Google Fonts + Adobe Fonts)

## 🎯 Boas Práticas

1. **Gancho visual nos primeiros 3 segundos** — slide 1 precisa prender
2. **1 ideia por slide** — não sobrecarregar
3. **Hierarquia tipográfica clara** — H1 / H2 / body
4. **CTA explícito no último slide** — "Salve", "Compartilhe", "Comente"
5. **Marca d'água sutil** mas presente em todos os slides

---

*Lab-Nexus · 06 · 2026 · Skill Manifest: `carousel-brief-generator`*
