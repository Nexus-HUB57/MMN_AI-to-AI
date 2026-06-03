# Frontend Deploy Playbook — oneverso.com.br

_Data: 2026-06-03_

## 1) Diagnóstico cirúrgico do incidente atual

### Sintoma observado
Em produção:
- `/assets/index-CXemSza2.js` retorna **`text/html` 200 com 773 bytes**, não JavaScript.
- `/assets/style-DVpcjLpa.css` retorna **`text/html` 200 com 773 bytes**, não CSS.
- `/assets/index-an56rV7C.js` (asset antigo) retorna `text/javascript` corretamente.
- HTML publicado em `/` ainda referencia `index-an56rV7C.js` no `<script>`.

### Causa raiz
Os novos artefatos do build (`index-CXemSza2.js`, `style-DVpcjLpa.css`, `index.html` atualizado, `.htaccess` atualizado) **nunca foram sincronizados para o HostGator**. Quando o navegador requisita esses paths inexistentes, o Apache aplica o SPA fallback do `.htaccess` (`RewriteRule . /index.html [L]`) e devolve o `index.html` antigo, com `Content-Type: text/html` e 773 bytes — exatamente o tamanho do bundle antigo.

O navegador então recusa executar HTML como JavaScript, e o app não inicializa. É isso que causou a percepção de `Carregando painel...` e tela travada.

### Conclusão
Não há bug no código-fonte. Há **deploy ausente** do bundle novo no servidor de produção.

## 2) Correção estrutural aplicada

### `.htaccess` endurecido
A regra de rewrite foi reforçada para que **asset ausente retorne 404 explícito** em vez de cair no SPA fallback. Isso transforma incidentes silenciosos (HTML servido como JS) em erros visíveis (404), facilitando diagnóstico futuro.

```apache
# Asset existente é servido; asset ausente retorna 404 explícito
RewriteCond %{REQUEST_URI} ^/assets/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule . - [R=404,L]
```

## 3) Procedimento de deploy

### Opção A — FTP via script versionado (recomendado)
```bash
export HOSTGATOR_USER='<usuario_ftp>'
export HOSTGATOR_PASS='<senha_ftp>'
./scripts/deploy-hostgator-frontend.sh --build
```

O script:
1. roda `npm run build:frontend`
2. valida `frontend/dist/index.html` e `.htaccess`
3. sincroniza `frontend/dist/` → `/public_html/` via `lftp mirror --reverse --delete --parallel=4`
4. valida HTTPS pós-upload com user-agent de navegador
5. faz polling do HTML publicado até confirmar que o asset esperado está sendo servido
6. aborta se a propagação não ocorrer dentro da janela

### Opção B — VPS/SSH (deploy.sh completo)
```bash
ssh deploy@oneverso.com.br
cd /var/www/oneverso.com.br
./scripts/deploy.sh
```

### Opção C — Upload manual via cPanel
Apenas como contingência:
1. baixar `frontend/dist/` (após build local) e compactar
2. enviar para `/public_html/` no File Manager
3. extrair, sobrescrevendo arquivos antigos
4. garantir que `.htaccess` foi sobrescrito (cPanel oculta dotfiles por padrão — habilitar exibição)

## 4) Checklist pós-deploy

Rodar:
```bash
./scripts/verify_frontend_postdeploy.sh
```

Esse script verifica:
- [ ] HTML publicado referencia o asset esperado pelo dist
- [ ] `/assets/<bundle>.js` retorna `Content-Type: text/javascript` ou `application/javascript`
- [ ] `/assets/<bundle>.css` retorna `Content-Type: text/css`
- [ ] asset inexistente retorna `404` (não HTML 200)
- [ ] `/login` retorna HTML 200 via SPA fallback

Saída esperada:
```
STATUS=OK_FRONTEND_PUBLISHED
```

## 5) Validação manual complementar

Abrir em janela anônima:
- `https://oneverso.com.br/` — home renderiza, sem `Carregando painel...`
- `https://oneverso.com.br/login` — formulário de login renderiza
- DevTools → Network → confirmar que `/assets/index-*.js` carrega como `200 OK` com `Content-Type: text/javascript`
- DevTools → Console → sem erros de MIME type ou de módulo

## 6) Sinais de regressão a monitorar

- asset versionado retornando `text/html`
- HTML publicado referenciando bundle diferente do dist local
- `/login` retornando HTML mínimo (~773 bytes)
- requisição a `/assets/<random>.js` retornando 200 em vez de 404

Qualquer um desses sinais indica que o deploy não propagou corretamente ou o `.htaccess` foi sobrescrito por uma versão anterior.

## 7) Próximas iterações sugeridas

- adicionar `verify_frontend_postdeploy.sh` ao pipeline de CI para impedir merge sem deploy validado
- adicionar fingerprint SHA-256 dos arquivos críticos como gate de release
- considerar CDN/cache invalidation se o HostGator estiver atrás de proxy
