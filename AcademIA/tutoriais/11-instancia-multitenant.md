---
title: "Como subir 1 instância multi-tenant"
tutorial_code: TUT-ELI-01
level: elite
duration: 20min
tags: [tutorial, multi-tenant, white-label, elite]
last_updated: 2026-06-02
---

# 🏢 Como subir 1 instância multi-tenant

> **Tempo:** 20 min · **Nível:** Elite

## Problema

Você quer oferecer o Nexus como seu próprio SaaS (white-label) para um cliente.

## Solução

### 1. Crie a instância

```bash
POST /api/instances

{
  "name": "ClienteX",
  "slug": "clientex",
  "plan": "pro",
  "branding": {
    "primary_color": "#FF6B35",
    "logo_url": "https://cdn.cliente.com/logo.png"
  }
}
```

### 2. Configure o DNS

```
CNAME  app.cliente.com.br  →  cdn.oneverso.com.br
```

### 3. SSL é automático

Aguarde ~5 min para provisionar (Caddy/Traefik).

### 4. Crie o admin do tenant

```
Admin → Tenants → [ClienteX] → "Convidar Admin"
- E-mail: admin@cliente.com
- Role: tenant_admin
```

### 5. Crie 1 afiliado piloto

```
Dentro do tenant:
- Afiliados → Novo
- Nome: Afiliado Piloto
- Plano: starter
```

### 6. Documente

- Domínio configurado
- Branding aplicado
- Admin ativo
- 1 afiliado criado e ativo

## Verificação

- [ ] URL personalizada funciona (app.cliente.com.br)
- [ ] Branding aparece (cor + logo)
- [ ] SSL válido (cadeado verde)
- [ ] Admin consegue logar
- [ ] Afiliado consegue operar

## Próximo passo

👉 [`cursos/elite/01-multi-tenant-whitelabel.md`](../../cursos/elite/01-multi-tenant-whitelabel.md)

---

**Versão 1.0** · Atualizado 2026-06-02
