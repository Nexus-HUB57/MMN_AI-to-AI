# Templates de Configuração - White-Label

## Visão Geral

Este diretório contém templates de configuração para rápida implementação de instâncias White-Label.

## Estrutura de Templates

```
templates/
├── starter/
│   ├── config.yaml
│   ├── branding.json
│   ├── emails/
│   └── landing_pages/
├── professional/
│   └── ...
└── enterprise/
    └── ...
```

## Template Starter

### config.yaml

```yaml
instance:
  name: "Template Starter"
  plan: "starter"
  max_users: 1000
  max_domains: 1

branding:
  colors:
    primary: "#2563EB"
    secondary: "#1E40AF"
    accent: "#F59E0B"
    background: "#FFFFFF"
    text: "#1F2937"
    success: "#10B981"
    error: "#EF4444"
    warning: "#F59E0B"

features:
  ai_communication: true
  analytics: true
  monetization: true
  training: false
  integrations:
    - whatsapp
    - telegram

limits:
  api_calls_per_month: 100000
  storage_gb: 10
  bandwidth_gb: 100
```

### branding.json

```json
{
  "brand": {
    "name": "Minha Empresa",
    "tagline": "Transformando negócios com IA",
    "description": "Descrição da empresa",
    "logo": {
      "primary": "/assets/logo.svg",
      "secondary": "/assets/logo-small.svg",
      "favicon": "/assets/favicon.ico",
      "og_image": "/assets/og-image.png"
    },
    "social": {
      "facebook": "https://facebook.com/minhaempresa",
      "instagram": "https://instagram.com/minhaempresa",
      "linkedin": "https://linkedin.com/company/minhaempresa"
    }
  },
  "design": {
    "colors": {
      "primary": "#2563EB",
      "secondary": "#1E40AF",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "text": "#1F2937",
      "muted": "#9CA3AF",
      "border": "#E5E7EB"
    },
    "fonts": {
      "primary": "Inter, system-ui, sans-serif",
      "headings": "Poppins, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "spacing": {
      "base": "4px",
      "scale": "1.25"
    },
    "border_radius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "full": "9999px"
    }
  },
  "emails": {
    "sender_name": "Minha Empresa",
    "sender_email": "naoresponda@minhaempresa.com",
    "reply_to": "contato@minhaempresa.com",
    "template_header": "/emails/header.html",
    "template_footer": "/emails/footer.html"
  }
}
```

---

## Template Professional

### config.yaml

```yaml
instance:
  name: "Template Professional"
  plan: "professional"
  max_users: 10000
  max_domains: 3

branding:
  colors:
    primary: "#2563EB"
    secondary: "#1E40AF"
    accent: "#F59E0B"
    background: "#FFFFFF"
    text: "#1F2937"
    success: "#10B981"
    error: "#EF4444"
    warning: "#F59E0B"

features:
  ai_communication: true
  analytics: true
  monetization: true
  training: true
  white_label_dashboard: true
  custom_emails: true
  integrations:
    - whatsapp
    - telegram
    - discord
    - mailchimp

limits:
  api_calls_per_month: 1000000
  storage_gb: 50
  bandwidth_gb: 500
  custom_domains: 3
```

---

## Template Enterprise

### config.yaml

```yaml
instance:
  name: "Template Enterprise"
  plan: "enterprise"
  max_users: -1  # Ilimitado
  max_domains: -1  # Ilimitado

branding:
  colors:
    primary: "#2563EB"
    secondary: "#1E40AF"
    accent: "#F59E0B"
    background: "#FFFFFF"
    text: "#1F2937"
    success: "#10B981"
    error: "#EF4444"
    warning: "#F59E0B"

features:
  ai_communication: true
  analytics: true
  monetization: true
  training: true
  white_label_dashboard: true
  custom_emails: true
  dedicated_support: true
  custom_integrations: true
  webhook_advanced: true
  integrations:
    - whatsapp
    - telegram
    - discord
    - mailchimp
    - hubspot
    - salesforce
    - zapier

limits:
  api_calls_per_month: -1  # Ilimitado
  storage_gb: -1  # Ilimitado
  bandwidth_gb: -1  # Ilimitado
  custom_domains: -1  # Ilimitado
  api_rate_limit: 10000

advanced:
  dedicated_infra: true
  sla_99_99: true
  dedicated_account_manager: true
  custom_development: true
```

---

## Template de E-mail Transacional

### Email Welcome (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{brand.name}} - Boas-vindas!</title>
    <style>
        body { font-family: {{brand.fonts.primary}}; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: {{brand.colors.primary}}; padding: 20px; text-align: center; }
        .header img { max-width: 150px; }
        .content { padding: 30px 20px; background: #fff; }
        .button { display: inline-block; padding: 12px 30px; background: {{brand.colors.primary}}; color: #fff; text-decoration: none; border-radius: 8px; }
        .footer { padding: 20px; text-align: center; color: {{brand.colors.muted}}; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{brand.logo.primary}}" alt="{{brand.name}}">
        </div>
        <div class="content">
            <h1>Bem-vindo(a) ao {{brand.name}}!</h1>
            <p>Olá {{user.name}},</p>
            <p>Você foi cadastrado(a) com sucesso na plataforma {{brand.name}}. Sua conta está pronta para uso!</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{activation_url}}" class="button">Ativar Conta</a>
            </p>
            <p>Após ativar sua conta, você terá acesso a:</p>
            <ul>
                <li>Dashboard personalizado</li>
                <li>Ferramentas de IA para crescimento</li>
                <li>Rede de parceiros e networking</li>
            </ul>
        </div>
        <div class="footer">
            <p>{{brand.name}} - {{brand.tagline}}</p>
            <p>Este e-mail foi enviado para {{user.email}}</p>
            <p><a href="{{unsubscribe_url}}">Cancelar inscrição</a></p>
        </div>
    </div>
</body>
</html>
```

---

## Template de Landing Page

### Launch Landing Page (HTML)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{brand.name}} - {{brand.tagline}}</title>
    <meta property="og:title" content="{{brand.name}}">
    <meta property="og:description" content="{{brand.description}}">
    <meta property="og:image" content="{{brand.logo.og_image}}">
    <style>
        :root {
            --color-primary: {{brand.colors.primary}};
            --color-secondary: {{brand.colors.secondary}};
            --color-accent: {{brand.colors.accent}};
            --color-text: {{brand.colors.text}};
            --color-muted: {{brand.colors.muted}};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: {{brand.fonts.primary}}; color: var(--color-text); line-height: 1.6; }
        .hero { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; padding: 80px 20px; text-align: center; }
        .hero h1 { font-family: {{brand.fonts.headings}}; font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.25rem; max-width: 600px; margin: 0 auto 30px; }
        .cta-button { display: inline-block; padding: 16px 40px; background: var(--color-accent); color: #fff; font-weight: bold; text-decoration: none; border-radius: 50px; font-size: 1.1rem; transition: transform 0.2s; }
        .cta-button:hover { transform: scale(1.05); }
        .features { padding: 60px 20px; max-width: 1000px; margin: 0 auto; }
        .features h2 { text-align: center; margin-bottom: 40px; font-family: {{brand.fonts.headings}}; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .feature-card { padding: 30px; border: 1px solid var(--color-muted); border-radius: 12px; }
        .feature-card h3 { color: var(--color-primary); margin-bottom: 10px; }
        .pricing { background: #f9fafb; padding: 60px 20px; }
        .pricing h2 { text-align: center; margin-bottom: 40px; font-family: {{brand.fonts.headings}}; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }
        .price-card { background: #fff; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .price-card.featured { border: 2px solid var(--color-primary); transform: scale(1.05); }
        .price { font-size: 2.5rem; font-weight: bold; color: var(--color-primary); }
        .price span { font-size: 1rem; color: var(--color-muted); }
    </style>
</head>
<body>
    <section class="hero">
        <h1>{{brand.name}}</h1>
        <p>{{brand.tagline}}</p>
        <a href="{{signup_url}}" class="cta-button">Começar Agora</a>
    </section>

    <section class="features">
        <h2>Recursos Principais</h2>
        <div class="features-grid">
            <div class="feature-card">
                <h3>IA Avançada</h3>
                <p>Comunicação inteligente entre agentes de IA para automação completa.</p>
            </div>
            <div class="feature-card">
                <h3>Rede de Parcerias</h3>
                <p>Construa sua rede de parceiros e monetize seu negócio.</p>
            </div>
            <div class="feature-card">
                <h3>Analytics em Tempo Real</h3>
                <p>Métricas e insights para tomar as melhores decisões.</p>
            </div>
        </div>
    </section>

    <section class="pricing">
        <h2>Planos</h2>
        <div class="pricing-grid">
            <div class="price-card">
                <h3>Starter</h3>
                <p class="price">R$ 2.997<span>/mês</span></p>
                <ul>
                    <li>1.000 usuários</li>
                    <li>1 domínio</li>
                    <li>Suporte por email</li>
                </ul>
            </div>
            <div class="price-card featured">
                <h3>Professional</h3>
                <p class="price">R$ 7.997<span>/mês</span></p>
                <ul>
                    <li>10.000 usuários</li>
                    <li>3 domínios</li>
                    <li>Suporte prioritário</li>
                </ul>
            </div>
        </div>
    </section>

    <footer style="padding: 40px 20px; text-align: center;">
        <p>&copy; 2026 {{brand.name}}. Todos os direitos reservados.</p>
    </footer>
</body>
</html>
```

---

## Checklist de Configuração

### Setup Inicial

- [ ] Definir brand_name e brand_slug
- [ ] Configurar cores (primary, secondary, accent)
- [ ] Upload de logo (primary, secondary, favicon, og_image)
- [ ] Configurar fontes (primary, headings, mono)
- [ ] Definir sender de emails
- [ ] Configurar domínios customizados
- [ ] Testar landing page
- [ ] Validar emails transacionais
- [ ] Configurar webhooks
- [ ] Testar integração de pagamento

### Validação Final

- [ ] Screenshot de todas as páginas
- [ ] Teste de responsividade
- [ ] Teste de performance (Lighthouse)
- [ ] Teste de segurança (headers CSP)
- [ ] Validação de SEO (meta tags, sitemap)

---

**Versão**: 1.0
**Última Atualização**: 2026-05-24
**Mantido por**: Nexus-HUB57