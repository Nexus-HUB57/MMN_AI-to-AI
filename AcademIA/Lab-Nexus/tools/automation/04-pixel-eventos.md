---
title: "04-pixel-eventos"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "04 · Pixel e Tracking de Eventos"
description: "Setup completo de pixel (Meta, Google, TikTok) + eventos customizados + consent mode"
tags: [lab-nexus, automation, pixel, tracking, meta-pixel, gtag]
category: automation
level: agente
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: webhook-router
course_anchor: cursos/agente/01-skills-essenciais.md
📡 04 · Pixel e Tracking de Eventos
Setup completo de 4 pixels (Meta, Google, TikTok, Pinterest) + eventos customizados + Google Consent Mode v2 + LGPD.

🎯 Spec
Atributo	Valor
O que é	Guia de setup + snippets de código + mapeamento de eventos
Quando usar	Lançamento de campanha, migração de site, atualização LGPD
Pré-requisitos	Nível 🥈 Agente; acesso ao site (CMS ou código)
Tempo estimado	30 min para setup básico
Skill que executa	webhook-router
Judge que valida	compliance-auditor
⚠️ LGPD — Consentimento é Obrigatório
yaml

Copy
requisitos_legais:

  - "Banner de consentimento ANTES de qualquer pixel"

  - "Opt-in explícito para marketing"

  - "Opt-out fácil (botão sempre visível)"

  - "Não usar dados sem consentimento"


consequencias:

  - "Multa LGPD: até 2% do faturamento (limitada a R$ 50M por infração)"

  - "Bloqueio de domínio nas plataformas"

  - "Perda de otimização de campanhas"
📋 Playbook — Os 4 Pixels Principais
1. Meta Pixel (Facebook + Instagram)
yaml

Copy
objetivo: "Tracking de conversões + otimização de campanhas Meta"

plataforma: "Facebook Ads Manager"

setup_tempo: "15 min"

eventos_padrao: ["PageView", "ViewContent", "Lead", "AddToCart", "InitiateCheckout", "Purchase"]
2. Google Ads Conversion Tag
yaml

Copy
objetivo: "Tracking de conversões + Google Analytics 4"

plataforma: "Google Ads + GA4"

setup_tempo: "20 min"

eventos_padrao: ["purchase", "sign_up", "generate_lead", "begin_checkout", "add_to_cart"]
3. TikTok Pixel
yaml

Copy
objetivo: "Tracking + otimização de campanhas TikTok"

plataforma: "TikTok Ads Manager"

setup_tempo: "15 min"

eventos_padrao: ["ViewContent", "ClickButton", "Search", "AddToCart", "InitiateCheckout", "CompletePayment", "CompleteRegistration"]
4. Pinterest Tag
yaml

Copy
objetivo: "Tracking de conversões Pinterest Ads"

plataforma: "Pinterest Ads Manager"

setup_tempo: "15 min"

eventos_padrao: ["pagevisit", "signup", "checkout", "lead", "search"]
📦 Asset (Snippets Prontos)
📊 Meta Pixel (com Consent Mode)
html

Copy

Preview
<!-- 1. Carregar pixel (SÓ após consentimento) -->

<script>

window.addEventListener('consentChanged', (e) => {

  if (e.detail.analytics) {

    !function(f,b,e,v,n,t,s)

    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?

    n.callMethod.apply(n,arguments):n.queue.push(arguments)};

    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';

    n.queue=[];t=b.createElement(e);t.async=!0;

    t.src=v;s=b.getElementsByTagName(e)[0];

    s.parentNode.insertBefore(t,s)}(window, document,'script',

    'https://connect.facebook.net/en_US/fbevents.js');

    

    fbq('init', '{{PIXEL_ID}}');

    fbq('track', 'PageView');

  }

});

</script>


<!-- 2. Evento customizado: Lead -->

<script>

function trackLead(email, value = 0) {

  if (typeof fbq !== 'undefined') {

    fbq('track', 'Lead', {

      content_name: 'Newsletter Signup',

      value: value,

      currency: 'BRL'

    });

  }

}

</script>


<!-- 3. Evento customizado: Purchase -->

<script>

function trackPurchase(orderId, value, items) {

  if (typeof fbq !== 'undefined') {

    fbq('track', 'Purchase', {

      content_ids: items.map(i => i.id),

      content_type: 'product',

      value: value,

      currency: 'BRL',

      num_items: items.length

    });

  }

}

</script>
📊 Google Tag (gtag.js) + Consent Mode v2
html

Copy

Preview
<!-- 1. Carregar com consent mode -->

<script async src="https://www.googletagmanager.com/gtag/js?id={{GA4_ID}}"></script>

<script>

  window.dataLayer = window.dataLayer || [];

  function gtag(){dataLayer.push(arguments);}

  

  gtag('consent', 'default', {

    'ad_storage': 'denied',

    'ad_user_data': 'denied',

    'ad_personalization': 'denied',

    'analytics_storage': 'denied',

    'wait_for_update': 500

  });

  

  gtag('js', new Date());

  gtag('config', '{{GA4_ID}}');

  gtag('config', '{{ADS_ID}}');

</script>


<!-- 2. Atualizar consent após opt-in -->

<script>

function acceptCookies() {

  gtag('consent', 'update', {

    'ad_storage': 'granted',

    'ad_user_data': 'granted',

    'ad_personalization': 'granted',

    'analytics_storage': 'granted'

  });

}


function denyCookies() {

  gtag('consent', 'update', {

    'ad_storage': 'denied',

    'ad_user_data': 'denied',

    'ad_personalization': 'denied',

    'analytics_storage': 'denied'

  });

}

</script>
📊 TikTok Pixel
html

Copy

Preview
<script>

!function (w, d, t) {

  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];

  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];

  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};

  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);

  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};

  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};

    var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;

    var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

  

  ttq.load('{{TIKTOK_PIXEL_ID}}');

  ttq.page();

}(window, document, 'ttq');

</script>
📦 Asset (Mapeamento de Eventos Canônicos)
📊 Tabela de Eventos — Alinhamento entre Plataformas
yaml

Copy
acao_negocio:

  "Page View":

    meta: "PageView"

    google: "page_view (automático)"

    tiktok: "page"

    pinterest: "pagevisit"

  

  "Lead Capturado":

    meta: "Lead"

    google: "generate_lead"

    tiktok: "SubmitForm"

    pinterest: "lead"

  

  "Add to Cart":

    meta: "AddToCart"

    google: "add_to_cart"

    tiktok: "AddToCart"

    pinterest: "AddToCart"

  

  "Checkout Iniciado":

    meta: "InitiateCheckout"

    google: "begin_checkout"

    tiktok: "InitiateCheckout"

    pinterest: "checkout"

  

  "Compra":

    meta: "Purchase"

    google: "purchase"

    tiktok: "CompletePayment"

    pinterest: "checkout"  # + value
📦 Asset (Google Consent Mode v2)
🛡️ Implementação Completa
html

Copy

Preview
<!-- Banner de consentimento (exemplo minimalista) -->

<div id="cookie-banner" style="position:fixed;bottom:0;left:0;right:0;background:#000;color:#fff;padding:20px;z-index:9999">

  <p>Usamos cookies para análise e personalização. Você aceita?</p>

  <button onclick="acceptAll()">Aceitar todos</button>

  <button onclick="denyAll()">Recusar</button>

  <button onclick="customSettings()">Configurar</button>

</div>


<script>

function acceptAll() {

  gtag('consent', 'update', {

    ad_storage: 'granted',

    ad_user_data: 'granted',

    ad_personalization: 'granted',

    analytics_storage: 'granted'

  });

  document.getElementById('cookie-banner').remove();

  // Disparar evento de consent

  window.dispatchEvent(new CustomEvent('consentChanged', { detail: { analytics: true, marketing: true }}));

}


function denyAll() {

  gtag('consent', 'update', {

    ad_storage: 'denied',

    ad_user_data: 'denied',

    ad_personalization: 'denied',

    analytics_storage: 'denied'

  });

  document.getElementById('cookie-banner').remove();

  window.dispatchEvent(new CustomEvent('consentChanged', { detail: { analytics: false, marketing: false }}));

}

</script>
📊 Métricas de Sucesso
Métrica	Meta
Eventos trackeados	100% dos canônicos
Latência do evento	≤ 2s
Taxa de consent	≥ 60%
Conversões atribuídas	≥ 80%
Dados de qualidade (Meta)	≥ 7/10
⚠️ Riscos & Anti-patterns

❌ Pixel sem consentimento → LGPD + bloqueio

❌ Pixel mal instalado (dispara 2x) → dados duplicados

❌ Não testar antes da campanha → otimização falha

❌ Ignorar Enhanced Conversions (Google) → 30% perde dados

❌ Cookies sem TTL definido → LGPD

✅ Sempre ter banner de consentimento

✅ Testar com Meta Pixel Helper / Google Tag Assistant

✅ Server-side tracking (API Conversions) — mais robusto

✅ Documentar todos os eventos

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — receber conversões

→ tools/analytics/06-dashboard-kpis.md — visualizar dados

→ Lib-Nexus/knowledge-base/03-conformidade-lgpd.md — LGPD completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus