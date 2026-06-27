---
title: "🎯 10 · ICP Detector (Ideal Customer Profile)"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# 🎯 10 · ICP Detector (Ideal Customer Profile)

**Categoria:** marketing
**Nível:** Agente → Master
**Tempo estimado:** 35 min
**Quando usar:** No início de cada campanha ou quando precisa recalibrar targeting de audência.

---

## 🎯 O que faz

Detecta automaticamente o **Ideal Customer Profile (ICP)** de uma oferta, combinando:
- Dados de quem JÁ converteu (positivos)
- Dados de quem saiu antes de converter (negativos)
- Sinais comportamentais e demográficos
- Análise de coortes de alto LTV

Gera segmentação detalhada para uso em campanhas Meta Ads, Google Ads, TikTok Ads.

## 🧪 Modelo de Análise

```
ICP_score(lead) = 
    0.35 * demographic_match       # idade, localização, renda
  + 0.25 * behavioral_match        # engajamento, intenção
  + 0.20 * psychographic_match    # valores, dores, desejos
  + 0.15 * timing_match            # momento de compra
  + 0.05 * channel_match           # canal preferido
```

## 🚀 Como usar

```yaml
input:
  oferta: "Curso de Marketing Digital para Afiliados"
  preco: "R$ 497"
  publico_alvo_inicial: "empreendedores digitais iniciantes"
  dados_historicos: "data/clientes_2025.csv"  # opcional

output:
  icp_primario:
    - perfil: "Homens 28-42, renda R$ 5-15k/mês"
      canais: ["instagram_reels", "youtube_ads"]
      dores: ["não sabe gerar leads", "depende de indicação"]
      desejos: ["escalar vendas", "ter equipe"]
      copy_angles: ["autoridade técnica", "case de sucesso"]
      icp_score_target: 0.85+
  
  icp_secundario:
    - perfil: "Mulheres 25-35, renda R$ 3-8k/mês"
      canais: ["instagram_stories", "tiktok"]
      ...
  
  anti_icp:
    - perfil: "acadêmicos puros, sem orçamento"
      red_flags: ["perfil só teórico", "sem histórico de compra"]
      exclude_em: ["meta_ads", "google_ads"]
```

## 📊 Sinais Analisados

### Demográficos
- Faixa etária
- Localização (cidade, estado, país)
- Renda estimada
- Escolaridade
- Estado civil / Filhos

### Comportamentais
- Engajamento em redes
- Tempo no site
- Páginas visitadas
- Downloads de lead-magnet
- Participação em webinars

### Psicográficos
- Valores declarados
- Dores verbalizadas
- Desejos verbalizados
- Medos / Objeções
- Sonhos / Aspirações

### Timing
- Dia da semana
- Hora do dia
- Estação do ano
- Eventos pessoais (aniversário, formatura)
- Contexto econômico

## 🎯 Outputs Prontos para Ads

```json
{
  "meta_ads": {
    "audience": {
      "age_range": "28-42",
      "genders": ["M"],
      "locations": ["Brasil: SP, RJ, MG, RS, PR"],
      "interests": ["marketing digital", "afiliados", "empreendedorismo"],
      "behaviors": ["engaged shoppers", "small business owners"]
    },
    "placements": ["instagram_reels", "facebook_feed", "audience_network"],
    "budget_split": {"TOFU": 0.6, "MOFU": 0.3, "BOFU": 0.1}
  }
}
```

## 📈 Refinamento Contínuo

A cada 14 dias, o ICP Detector re-analisa:
- Quem comprou vs quem viu
- Ajusta pesos do score
- Recomenda expansão ou redução de audência

---

*Lab-Nexus · 10 · 2026 · Skill Manifest: `icp-detector`*
