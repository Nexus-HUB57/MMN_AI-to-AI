# Documentação de Integração Técnica - White-Label

## Visão Geral

Este documento fornece informações técnicas para integração da plataforma MMN_AI-to-AI White-Label.

## Opções de Integração

| Método | Complexidade | Uso Recomendado |
|--------|--------------|-----------------|
| API REST | Média | Integrações customizadas |
| SDK JavaScript | Baixa | Frontend web |
| SDK Python | Baixa | Backend Python |
| Webhooks | Baixa | Automação de eventos |
| iPaaS (Zapier) | Muito baixa | Automação sem código |

---

## 1. Integração via API REST

### Configuração Inicial

```python
import requests

class MMNWhiteLabelAPI:
    BASE_URL = "https://api.mmn-ai-to-ai.com/v1"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

    def create_instance(self, brand_name: str, plan: str, admin_email: str):
        """Criar nova instância white-label"""
        response = self.session.post(
            f"{self.BASE_URL}/whitelabel/instances",
            json={
                "brand_name": brand_name,
                "brand_slug": brand_name.lower().replace(" ", "-"),
                "plan": plan,
                "admin_email": admin_email
            }
        )
        return response.json()

    def update_branding(self, instance_id: str, colors: dict):
        """Atualizar branding da instância"""
        response = self.session.patch(
            f"{self.BASE_URL}/whitelabel/instances/{instance_id}/branding",
            json={"colors": colors}
        )
        return response.json()
```

### Exemplo: Criar Instância

```python
# Initialize client
api = MMNWhiteLabelAPI(api_key="wl_live_your_api_key")

# Create new instance
new_instance = api.create_instance(
    brand_name="Minha Empresa",
    plan="professional",
    admin_email="admin@minhaempresa.com"
)

print(f"Instance ID: {new_instance['instance_id']}")
print(f"Dashboard URL: {new_instance['dashboard_url']}")
```

---

## 2. SDK JavaScript (Browser)

### Instalação

```bash
npm install @mmn-ai/whitelabel-sdk
# ou
yarn add @mmn-ai/whitelabel-sdk
```

### Uso Básico

```javascript
import { MMNWhiteLabel } from '@mmn-ai/whitelabel-sdk';

// Inicializar
const mmn = new MMNWhiteLabel({
  instanceId: 'inst_abc123def456',
  apiKey: 'wl_live_your_api_key'
});

// Obter usuário atual
const user = await mmn.auth.getCurrentUser();
console.log(user.name, user.email);

// Listar réseau
const network = await mmn.network.getTree({
  depth: 3,
  includeStats: true
});

// Criar novo usuário
const newUser = await mmn.users.create({
  email: 'novo.usuario@empresa.com',
  name: 'Novo Usuario',
  parentId: user.id
});

// Atualizar perfil
await mmn.users.updateProfile({
  name: 'Nome Atualizado',
  phone: '+5511987654321'
});
```

### Componentes React

```jsx
import { MMNProvider, LoginForm, Dashboard, NetworkTree } from '@mmn-ai/whitelabel-sdk/react';

// Provider
<MMNProvider instanceId="inst_abc123def456" apiKey="wl_live_...">
  <App />
</MMNProvider>

// Componentes
function App() {
  return (
    <Router>
      <Route path="/login" component={LoginForm} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/network" component={NetworkTree} />
    </Router>
  );
}
```

---

## 3. SDK Python

### Instalação

```bash
pip install mmn-whitelabel-sdk
```

### Uso com FastAPI

```python
from fastapi import FastAPI
from mmn_whitelabel import MMNClient

app = FastAPI()
mmn = MMNClient(api_key="wl_live_your_api_key")

@app.post("/webhooks/mmn")
async def mmn_webhook(payload: dict):
    event_type = payload.get("event_type")

    if event_type == "user.signup":
        await handle_new_user(payload["data"])
    elif event_type == "commission.credited":
        await process_commission(payload["data"])

    return {"status": "received"}

async def handle_new_user(user_data: dict):
    email = user_data["email"]
    # Lógica customizada
    pass
```

### Uso com Django

```python
# settings.py
MMN_WHITELABEL = {
    'API_KEY': env('WL_API_KEY'),
    'INSTANCE_ID': env('WL_INSTANCE_ID'),
}

# views.py
from mmn_whitelabel import MMNClient

mmn = MMNClient(
    api_key=settings.MMN_WHITELABEL['API_KEY'],
    instance_id=settings.MMN_WHITELABEL['INSTANCE_ID']
)

def dashboard_view(request):
    metrics = mmn.analytics.get_dashboard()
    return render(request, 'dashboard.html', {'metrics': metrics})
```

---

## 4. Webhooks

### Configuração de Webhooks

```python
# Criar webhook via API
webhook = mmn.webhooks.create(
    url="https://seudominio.com/webhooks/mmn",
    events=[
        "user.signup",
        "user.activation",
        "commission.credited",
        "commission.paid",
        "order.completed"
    ],
    secret="whsec_seu_secret"
)
```

### Exemplo de Handler (Flask)

```python
from flask import Flask, request, abort
import hmac
import hashlib

app = Flask(__name__)

def verify_webhook_signature(payload: bytes, signature: str, secret: str):
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

@app.route('/webhooks/mmn', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-MMN-Signature', '')
    payload = request.get_data()

    if not verify_webhook_signature(payload, signature, 'whsec_seu_secret'):
        abort(403)

    event = request.json
    event_type = event.get('event_type')
    data = event.get('data', {})

    if event_type == 'user.signup':
        print(f"Novo usuário: {data['email']}")
    elif event_type == 'commission.credited':
        print(f"Comissão creditada: R$ {data['amount']}")

    return {'status': 'ok'}, 200
```

### Eventos Disponíveis

| Evento | Descrição | Payload |
|--------|-----------|---------|
| instance.activated | Instância ativada | instance_id, brand_name |
| instance.suspended | Instância suspensa | instance_id, reason |
| user.signup | Novo usuário registrado | user_id, email, name |
| user.activation | Usuário ativou conta | user_id |
| user.login | Login realizado | user_id, ip |
| commission.credited | Comissão creditada | user_id, amount, type |
| commission.paid | Comissão paga | user_id, amount, method |
| order.completed | Pedido concluído | order_id, user_id, total |
| rank.upgraded | Rank atualizado | user_id, old_rank, new_rank |

---

## 5. Integração via Zapier

### Configuração

1. Acesse [Zapier](https://zapier.com)
2. Pesquise por "MMN AI-to-AI"
3. Autentique com sua API Key
4. Configure o trigger

### Zaps de Exemplo

#### Novo Usuário → Adicionar ao CRM

```
Trigger: MMN - New User Signup
  └─ Action: HubSpot - Create Contact
      └─ email: {{email}}
      └─ first_name: {{name}}
      └─ custom_field_1: {{instance_name}}
```

#### Comissão Creditada → Notificar no Slack

```
Trigger: MMN - Commission Credited
  └─ Action: Slack - Send Channel Message
      └─ channel: #comissoes
      └─ message: "R$ {{amount}} creditado para {{user_name}}!"
```

#### Pedido Completo → Atualizar Planilha

```
Trigger: MMN - Order Completed
  └─ Action: Google Sheets - Add Row to Spreadsheet
      └─ spreadsheet: Vendas
      └─ columns: data, usuario, valor, status
```

---

## 6. SSO (Single Sign-On)

### SAML 2.0

```yaml
# Configuração SAML
sso:
  provider: "saml"
  entity_id: "https://seudominio.com/saml/metadata"
  sso_url: "https://idp.exemplo.com/saml/sso"
  certificate: "/path/to/cert.pem"
  attribute_mapping:
    email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
```

### OIDC (OpenID Connect)

```yaml
# Configuração OIDC
sso:
  provider: "oidc"
  client_id: "your-client-id"
  client_secret: "your-client-secret"
  issuer: "https://idp.exemplo.com"
  scopes: "openid profile email"
```

### Implementação

```python
from authlib.integrations.flask_client import OAuth

oauth = OAuth(app)
oauth.register(
    name='mmn',
    client_id='your-client-id',
    client_secret='your-client-secret',
    server_metadata_url='https://idp.exemplo.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid profile email'}
)

@app.route('/login')
def login():
    return oauth.mmn.authorize_redirect(redirect_uri=url_for('callback', _external=True))

@app.route('/callback')
def callback():
    token = oauth.mmn.authorize_access_token()
    user_info = token['userinfo']
    # Criar/sincronizar usuário
    user = sync_user(user_info)
    login_user(user)
    return redirect('/dashboard')
```

---

## 7. Sandbox e Testes

### Ambiente de Sandbox

```python
# Usar API de sandbox para testes
class SandboxAPI(MMNWhiteLabelAPI):
    BASE_URL = "https://api.sandbox.mmn-ai-to-ai.com/v1"

# Criar instância de testes
sandbox = SandboxAPI(api_key="wl_test_your_test_key")
test_instance = sandbox.create_instance(
    brand_name="Test Company",
    plan="professional",
    admin_email="test@test.com"
)
```

### Dados de Teste

| Recurso | Descrição |
|---------|-----------|
| `test_user@test.com` | Usuário de teste padrão |
| `test_admin@test.com` | Admin de teste |
| Senha para todos | `Test@123` |

---

## 8. Boas Práticas

### Segurança

- [ ] Armazenar API Keys em variáveis de ambiente
- [ ] Usar HTTPS em todas as requisições
- [ ] Implementar retry com backoff exponencial
- [ ] Validar webhooks com assinatura HMAC
- [ ] Rate limiting client-side

### Performance

```python
# Implementar cache local
from functools import lru_cache

class MMNWhiteLabelAPI:
    @lru_cache(maxsize=128)
    def get_plans(self):
        """Cachear lista de planos"""
        return self.session.get(f"{self.BASE_URL}/whitelabel/plans").json()
```

### Error Handling

```python
import time
from requests.exceptions import RateLimitError

def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            wait = (2 ** attempt) * 1  # backoff exponencial
            time.sleep(wait)
    raise Exception("Max retries exceeded")
```

---

**Versão**: 1.0
**Última Atualização**: 2026-05-24
**Mantido por**: Nexus-HUB57