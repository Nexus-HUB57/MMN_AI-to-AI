---
title: "Agent Spec · Copy Persuasivo"
agent_code: AGENT-COPY-PERSUASIVO
version: "1.0.0"
category: copywriting
status: stable
owner: AcademIA / Marketing Vertical
last_updated: 2026-06-28
pattern: "MMN_IA"
---

# ✍️ Agent Spec — Copy Persuasivo (AGENT-COPY-PERSUASIVO)

> **Agente especializado em gerar copy persuasivo** para múltiplos canais (WhatsApp, Instagram, e-mail, landing pages, anúncios pagos), com calibração de voz, LGPD-compliance embutido, e A/B testing nativo.

## 📋 Resumo

| Aspecto | Detalhe |
|---|---|
| **Função primária** | Gerar copy persuasivo adaptado a canal, audiência e objetivo |
| **Modelos preferidos** | Claude Sonnet 4.5 (criatividade), Claude Haiku (variações) |
| **Skills requeridas** | whatsapp-copy-v3, instagram-reels-script-v2, ab-test-judge |
| **Latência alvo** | <3s para copy simples, <10s para variações múltiplas |
| **Custo por execução** | R$0.05-0.20 |
| **Compliance** | LGPD, código de conduta publicitário, Meta/Google ad policies |

## 🎯 Casos de uso

- Gerar copy para campanha de WhatsApp marketing.
- Criar variações A/B para teste de anúncios pagos.
- Adaptar copy longo (e-mail) para copy curto (push notification).
- Reescrever copy existente com tom mais persuasivo.
- Gerar sequência de nurture (D+1, D+3, D+7, D+14).
- Criar headlines e CTAs otimizados para conversão.

## 🔧 Inputs

```typescript
interface CopyInput {
  // Contexto
  produto: string;              // ex: "curso de marketing digital"
  publico_alvo: string;         // ex: "mulheres 30-45, classe B, SP"
  objetivo: 'venda' | 'lead' | 'recompra' | 'engajamento' | 'awareness';
  
  // Canal
  canal: 'whatsapp' | 'instagram' | 'email' | 'landing_page' | 'ads' | 'push';
  tom: 'urgente' | 'acolhedor' | 'direto' | 'curioso' | 'autoritativo' | 'empático';
  
  // Constraints
  max_caracteres?: number;      // ex: 500 para WhatsApp
  variacoes_count?: number;     // padrão: 3
  incluir_cta: boolean;
  incluir_disclaimer_lgpd: boolean;
  
  // Contexto adicional
  beneficios_chave?: string[];  // ex: ["economia de tempo", "resultado em 7 dias"]
  objecoes_conhecidas?: string[]; // ex: ["muito caro", "não tenho tempo"]
  copy_referencia?: string;     // exemplo de copy que funcionou
}
```

## 📤 Outputs

```typescript
interface CopyOutput {
  copy_principal: string;          // copy principal
  variacoes: string[];             // N variações para A/B
  cta_sugerido: string;
  horario_sugerido?: string;       // ex: "19:00-21:00"
  canal_otimizado: string;         // confirmação do canal
  caracteres_total: number;
  disclaimer_lgpd?: string;        // se solicitado
  metricas_estimadas?: {
    taxa_abertura_estimada: number;
    taxa_clique_estimada: number;
    confianca_estimativa: number;  // 0-1
  };
  explicacao: string;              // por que esse copy funciona
}
```

## 🧠 Comportamento detalhado

### Fase 1 — Análise de Input
1. Validar produto (não vazio, não perigoso).
2. Validar público-alvo (específico o suficiente).
3. Identificar **categoria** do produto (digital, físico, serviço, evento).
4. Identificar **estágio do funil** baseado no objetivo.

### Fase 2 — Geração
1. Carregar **template de copy** baseado no canal.
2. Aplicar **framework persuasivo** (AIDA, PAS, BAB — vide skill whatsapp-copy).
3. Gerar **copy principal**.
4. Gerar **N variações** com ângulos diferentes.
5. Calibrar **tom** baseado no input.
6. Adicionar **CTA** específico.
7. Adicionar **disclaimer LGPD** se solicitado.

### Fase 3 — Validação
1. **Policy check** — bloqueia termos proibidos.
2. **Compliance check** — LGPD, código publicitário.
3. **Quality check** — comprimento, clareza, persuasão.
4. **A/B-ready check** — variacoes_count >= 2.

### Fase 4 — Estimativa
1. Comparar com histórico de copies do tenant.
2. Estimar métricas baseado em padrões do mercado.
3. Marcar confiança da estimativa (0-1).

## 🔌 Skills integradas

| Skill | Uso |
|-------|-----|
| `whatsapp-copy-v3` | Geração principal para WhatsApp |
| `instagram-reels-script-v2` | Adaptação para Instagram |
| `ab-test-judge` | Avaliação de qualidade |
| `cohort-analyzer` | Análise de público-alvo |

## 🛡️ Policy

**Bloqueado:**
- Produtos: tabaco, armas, jogos de azar, conteúdo adulto.
- Claims médicos sem disclaimer.
- "100% garantido", "sem risco", "milagroso".
- Comparações diretas com concorrentes sem fonte.

**Requer aprovação humana:**
- Qualquer produto da categoria "saúde" ou "financeiro".
- Copy com claim de resultado numérico específico.
- Copy para público vulnerável (idosos, doentes, endividados).

**Rate limit:**
- 1000 gerações/dia por tenant (default).
- 100 gerações/hora por usuário.
- Configurável por tier.

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Latência p99 | <10s |
| Acceptance rate (sem edição) | >70% |
| Performance uplift vs. baseline | >15% |
| Policy violation rate | <1% |
| Customer satisfaction (CSAT) | >4.3 |

## 🧪 Testes

- [ ] test_basic_whatsapp_copy
- [ ] test_instagram_reels_script
- [ ] test_email_long_form
- [ ] test_ads_meta_policies
- [ ] test_lgpd_disclaimer
- [ ] test_blocked_categories
- [ ] test_approval_required_categories
- [ ] test_variation_diversity
- [ ] test_cta_optimization

## 🔁 Versioning

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2026-06-28 | Release inicial |
| 0.9.0 | 2026-05-15 | Beta com 50 tenants |
| 0.5.0 | 2026-04-01 | Alpha com 10 tenants |

## 📂 Recursos

- **Skill principal:** [`/skills/whatsapp-copy-v3/SKILL.md`](../../skills/)
- **Padrão editorial:** [`Lib-Nexus/best-practices/00-prompt-engineering.md`](../best-practices/00-prompt-engineering.md)
- **Compliance:** [`/playbooks/PB-LGPD-direitos-titular.md`](../../playbooks/PB-LGPD-direitos-titular.md)

## 👥 Ownership

- **Owner:** AcademIA / Marketing Vertical
- **Reviewers:** Alencar (Persona), DPO Nexus
- **Slack:** `#agent-copy-persuasivo`

---

*Nexus Affil'IA'te · AGENT-COPY-PERSUASIVO · v1.0.0 · Junho 2026*
