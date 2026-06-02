# 🚀 Caminho A — Plataforma de verdade no ar

> **Status:** 🔴 Pendente (depende 100% de intervenção manual em painéis web)
> **Tempo estimado:** 1-2 horas
> **Pré-requisito:** você logado no painel Render **E** no painel HostGator

Este documento empacota todas as ações de **Caminho A** da análise técnica.
Cada item é independente — pode ser feito em qualquer ordem, mas a ordem
recomendada abaixo evita callback loops.

---

## 1. Garantir `nexus-saas-backend` "Live" no Render

**Painel:** https://dashboard.render.com/

### Verificar

1. Abra o serviço `nexus-saas-backend` (ou o nome que você deu).
2. Confirme que o status é **"Live"** (verde).
3. Se estiver "Suspended" ou "Sleeping":
   - Plano Free/Starter do Render hiberna após 15 min sem tráfego.
   - O cold start demora ~30-60s.
   - **Ação**: faça um `curl` qualquer pra acordar antes de continuar.

### Acordar (se estiver dormindo)

```bash
curl -fsSL https://nexus-saas-backend.onrender.com/health
# Deve retornar JSON com status. Pode demorar ~1min na 1a vez.
```

### Se não estiver "Live" de jeito nenhum

- Veja os logs: o último deploy pode ter falhado.
- Se o último commit for o `d7e1e94` (Academ'IA v1.1.0), ele não mexeu no
  backend, então o serviço deve estar bem.
- Se precisar re-deploy manual: **Manual Deploy → Deploy latest commit**.

---

## 2. Apontar `api.oneverso.com.br` para o Render

**Objetivo:** o subdomínio `api.oneverso.com.br` precisa resolver para a URL
do Render (`nexus-saas-backend.onrender.com`).

### Passo 1 — Render: adicionar Custom Domain

1. Painel Render → serviço `nexus-saas-backend` → **Settings** → **Custom Domains**.
2. Clique em **Add Custom Domain**.
3. Digite `api.oneverso.com.br`.
4. O Render vai mostrar um registro CNAME que você precisa criar. Vai ser
   tipo:

   ```
   api.oneverso.com.br  CNAME  nexus-saas-backend.onrender.com
   ```

   (o target exato aparece no painel — copie de lá, não daqui).

5. Anote o target. Vai levar até 5-15 min pra propagar depois do passo 2.

### Passo 2 — HostGator: criar o CNAME

1. **cPanel HostGator** → **Zone Editor** (ou **Advanced DNS Zone Editor**).
2. Selecione o domínio `oneverso.com.br`.
3. **Add Record**:
   - **Tipo:** CNAME
   - **Nome/Host:** `api`
   - **Destino/Value:** o target que o Render te deu (copie do painel Render)
   - **TTL:** 3600 (ou automático)
4. Salvar.

### Verificar propagação

```bash
# Linux/Mac
dig api.oneverso.com.br +short

# Windows
nslookup api.oneverso.com.br
```

Deve retornar o domínio do Render. Pode levar até 1h em alguns casos.

### No Render: confirmar SSL

- Depois que propagar, volte ao Render → Custom Domains.
- O certificado SSL (Let's Encrypt) é provisionado automaticamente.
- Pode demorar mais ~5-10 min depois do CNAME propagar.

---

## 3. Liberar ModSecurity para User-Agent vazio

**Problema:** o smoke-test do CI usa um `User-Agent` válido (Chrome 137),
mas **monitores externos** (UptimeRobot, Pingdom, etc) frequentemente usam
UA vazio ou "curl/x.y" — e o ModSecurity da HostGator bloqueia com
"ModSecurity Action Not Acceptable" (406).

### Passo 1 — Desabilitar globalmente (rápido, mas agressivo)

Não recomendo. Pula pro passo 2.

### Passo 2 — Whitelist por regra (correto)

1. **cPanel HostGator** → **Security** → **ModSecurity**.
2. **Desativar** ModSecurity **apenas para `oneverso.com.br`** enquanto
   você configura a regra — depois reativa.
3. Acesse a aba **Rules** (ou edite `/usr/local/apache/conf/modsec-cpanel.conf`).
4. Procure regras com `REQUEST_HEADERS:User-Agent` ou use a ferramenta
   **"Search Rules"** do cPanel.
5. Crie uma **whitelist rule** (cPanel → ModSecurity → "Add Rule"):

   ```
   SecRule REQUEST_HEADERS:User-Agent "@rx ^$" \
     "id:100001,phase:1,nolog,allow,ctl:ruleEngine=DetectionOnly"
   ```

   Isso libera UA vazio **sem desabilitar** o resto do WAF.

6. Reative ModSecurity.
7. Teste:

   ```bash
   curl -fsSL -A "" -H "Accept: application/json" \
     https://oneverso.com.br/api/health
   ```

   Deve retornar JSON, não 406.

### Passo 3 (alternativa) — Usar cPanel "User Agent Blocker"

Mais simples mas menos cirúrgico:

1. **cPanel** → **Security** → **ModSecurity** → **User Agent Blocker List**.
2. Remova `^$` (UA vazio) da blacklist se estiver lá.
3. Salve.

---

## 4. Criar health endpoint público em `https://oneverso.com.br/api/health`

**Diagnóstico atual:** o `curl` retorna HTML da SPA em vez de JSON.
**Causa provável:** o proxy da HostGator (ou um `.htaccess` no
`public_html/`) está redirecionando `/api/*` para o index.html do React,
antes de chegar no backend.

### Diagnóstico

```bash
# Ver o que está acontecendo
curl -vL -A "Mozilla/5.0" -H "Accept: application/json" \
  https://oneverso.com.br/api/health 2>&1 | head -30
```

Procure por:
- `Location:` no header 301/302 → rewrite pra `/` (SPA fallback)
- `X-Powered-By:` indicando Vite/React → proxy reverso errado
- `404 Not Found` → não está roteando pra lugar nenhum

### Solução (arquivo `.htaccess` no public_html)

Adicione **antes** da regra de SPA fallback:

```apache
# API: encaminha para o backend (Render)
RewriteEngine On
RewriteCond %{HTTP_HOST} ^oneverso\.com\.br$ [NC]
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^api/(.*)$ https://api.oneverso.com.br/$1 [P,L]

# Health: serve direto do backend
RewriteCond %{HTTP_HOST} ^oneverso\.com\.br$ [NC]
RewriteCond %{REQUEST_URI} ^/api/health$ [NC]
RewriteRule ^api/health$ https://api.oneverso.com.br/health [P,L]

# SPA fallback (DEPOIS das regras de API)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

**Atenção:** `[P]` requer `mod_proxy` habilitado. Em cPanel compartilhado
da HostGator, normalmente está habilitado, mas confirme.

### Solução alternativa (proxy reverso Nginx na HostGator)

Se a HostGator permitir (verificar plano):

```nginx
# /etc/nginx/conf.d/oneverso.conf
location /api/ {
    proxy_pass https://api.oneverso.com.br/;
    proxy_set_header Host api.oneverso.com.br;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Verificação

```bash
# 1. Health direto do subdomínio (deve funcionar DEPOIS do CNAME propagar)
curl -fsSL https://api.oneverso.com.br/health
# Esperado: {"status":"ok","timestamp":"..."} ou similar

# 2. Health via domínio principal
curl -fsSL https://oneverso.com.br/api/health
# Esperado: mesmo JSON do passo 1

# 3. Health com User-Agent vazio (teste ModSecurity)
curl -fsSL -A "" https://oneverso.com.br/api/health
# Esperado: mesmo JSON, sem 406
```

---

## 5. Validação final (smoke-test manual)

Rode esses curls na ordem. Tudo tem que voltar JSON ou HTML, nunca 406/500.

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# 1. Portal raiz
curl -sL -A "$UA" -w "\n[code: %{http_code}]\n" \
  https://oneverso.com.br | tail -5

# 2. SPA fallback
curl -sL -A "$UA" -w "\n[code: %{http_code}]\n" \
  https://oneverso.com.br/login | tail -5

# 3. Asset JS principal (extrai do HTML do passo 1)
asset=$(curl -sL -A "$UA" https://oneverso.com.br | \
        grep -oE 'src="/assets/index-[^"]+\.js"' | head -1 | sed 's/src="//;s/"//')
curl -fsSIL -A "$UA" "https://oneverso.com.br$asset"

# 4. API health (subdomínio)
curl -fsSL https://api.oneverso.com.br/health

# 5. API health (via domínio principal)
curl -fsSL https://oneverso.com.br/api/health

# 6. API health com UA vazio (teste ModSecurity)
curl -fsSL -A "" https://oneverso.com.br/api/health
```

Todos devem dar 200, exceto o passo 1 e 2 que retornam HTML (200 com `<html>`).

---

## ✅ Checklist final

- [ ] `nexus-saas-backend` está **Live** no Render
- [ ] CNAME `api.oneverso.com.br → <render-target>` criado na HostGator
- [ ] Render mostra `api.oneverso.com.br` como **verified** com SSL
- [ ] ModSecurity libera UA vazio (smoke-test do CI passa)
- [ ] `https://oneverso.com.br/api/health` retorna JSON (não HTML)
- [ ] `https://api.oneverso.com.br/health` retorna JSON
- [ ] Smoke-tests do CI (`smoke-tests.yml`) passam verde

---

## 🆘 Se algo der errado

| Sintoma | Causa provável | Fix |
|---|---|---|
| 502 Bad Gateway em `api.oneverso.com.br` | CNAME não propagou | `dig api.oneverso.com.br +short`, esperar 1h |
| 404 em `/api/health` | Proxy não configurado | Ver passo 4 |
| 406 Not Acceptable | ModSecurity bloqueando | Ver passo 3 |
| HTML em vez de JSON | `.htaccess` com SPA fallback antes do proxy | Reordenar regras (ver passo 4) |
| SSL warning no browser | Render ainda provisionando certificado | Esperar 5-10 min, hard refresh |
| Render mostra "Invalid Certificate" | Domínio não verificado | Re-check CNAME; Render leva 1-2 min pra re-verificar |

---

**Criado:** 2026-06-02 · v1.1.1 · Equipe Nexus
