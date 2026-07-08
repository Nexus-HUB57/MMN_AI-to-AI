# 📘 Tutorial 17 · Integrar Meta Ads (Facebook + Instagram)

**Nível:** Agente → Master
**Tempo:** 35 min
**Pré-requisito:** Tutorial 10 (webhook-hotmart)

---

## 🎯 O que vamos fazer

Conectar a Nexus à **Meta Marketing API** para:
- Criar campanhas automaticamente
- Pausar/ativar baseado em performance
- Sincronizar audiências custom
- Pull de métricas em tempo real

## 📋 Pré-requisitos

- Conta Business Manager Meta ativa
- App criado em developers.facebook.com
- Marketing API access token (long-lived)
- Pixel Meta instalado no site
- Conta de anúncio com método de pagamento

## 🚀 Passo 1 — Configurar App na Meta

```bash
# Instalar CLI
npm install -g @nexus/cli

# Auth
nexus meta auth \
  --app-id "SEU_APP_ID" \
  --app-secret "SEU_APP_SECRET" \
  --access-token "LONG_LIVED_TOKEN"
```

A CLI vai:
1. Validar permissões (`ads_management`, `ads_read`, `business_management`)
2. Testar conexão com Marketing API
3. Listar contas de anúncio disponíveis

## 🚀 Passo 2 — Selecionar Conta e Pixel

```bash
nexus meta setup \
  --ad-account "act_123456789" \
  --pixel "123456789012345" \
  --page "Sua Página Business" \
  --instagram "seu.instagram"
```

Validação automática: testa criação de campanha rascunho (não publicada) e deleta.

## 🚀 Passo 3 — Sincronizar Audiências Custom

```bash
# Criar audiências baseadas em eventos do webhook
nexus meta audience create \
  --name "Leads Warm 30d" \
  --filter "lead_event >= 30 days ago" \
  --min-size 100

# Sincronizar audiências lookalike
nexus meta audience sync --type lookalike --source "Compradores 90d"
```

Audiências disponíveis na Nexus:
- **Leads Warm 7d/30d/90d**
- **Compradores 30d/90d/365d**
- **Carrinho Abandonado 7d/30d**
- **Engajados Instagram 30d**

## 🚀 Passo 4 — Configurar Pixel Events

A Nexus envia automaticamente para o Pixel:

```javascript
// Eventos padrão
nexus.meta.track('PageView');
nexus.meta.track('Lead', { value: 0, currency: 'BRL', content_name: 'Curso X' });
nexus.meta.track('InitiateCheckout', { value: 497, currency: 'BRL' });
nexus.meta.track('Purchase', { value: 497, currency: 'BRL', content_ids: ['curso-x'] });
```

Eventos customizados adicionais:
```javascript
nexus.meta.track('Qualify', { tier: 'gold' });
nexus.meta.track('Nurture', { sequence_step: 3 });
nexus.meta.track('Reactivation', { days_inactive: 45 });
```

## 🚀 Passo 5 — Criar Campanha via Nexus

```yaml
# campaigns/black-friday-2026.yaml
name: "Black Friday Nexus 2026"
objective: "CONVERSIONS"
status: "PAUSED"  # Inicia PAUSED para revisão
budget:
  type: "DAILY"
  amount: 500  # R$ 500/dia
  schedule:
    start: "2026-11-20T00:00:00-03:00"
    end: "2026-11-30T23:59:59-03:00"
targeting:
  audiences:
    - "Leads Warm 30d"      # custom audience
    - "Lookalike Compradores 90d"  # lookalike
  locations: ["Brazil"]
  age_min: 25
  age_max: 55
  devices: ["mobile", "desktop"]
creative:
  primary_text: "Variante A"
  headline: "Aprenda Marketing Digital com IA"
  cta: "LEARN_MORE"
optimization:
  conversion_event: "Purchase"
  attribution_window: "7d_click_1d_view"
```

```bash
nexus campaign create --file campaigns/black-friday-2026.yaml
nexus campaign activate --id "cmp_abc123"
```

## 🚀 Passo 6 — Ativar Otimização por AI Agent

```bash
# Ativar agente para pausar ads ruins automaticamente
nexus agent enable meta-optimizer \
  --rules "pause_if_roas < 1.5 AND spend > R$100" \
  --rules "increase_budget_if_roas > 3.0 AND spend_today > 80% of daily_budget"
```

O agente vai:
- Monitorar ROAS a cada 30 min
- Pausar ads com ROAS < 1.5 após gasto mínimo
- Aumentar budget em ads com ROAS > 3.0
- Notificar via Slack quando agir

## 📊 Dashboard e Métricas

Acesse `/admin/meta-ads` para ver:
- Performance por campanha (CTR, CPC, CPM, ROAS)
- Comparação de criativos
- Funil completo (Impression → Purchase)
- Sugestões de AI agent

## ⚠️ Troubleshooting Comum

| Erro | Causa | Solução |
|------|-------|---------|
| 403 Forbidden | Permissões faltando | Revisar `ads_management` no app |
| 400 Invalid token | Token expirado | Renovar long-lived token |
| 560 Rate limit | Muitas chamadas | Implementar batch + cache |
| Pixel não dispara | Evento mal formatado | Validar schema com Meta Pixel Helper |

---

*Acad. Nexus · 2026 · Agente → Master*
