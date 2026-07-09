# MMN_AI-to-AI White-Label API

API REST completa para gerenciamento de instâncias White-Label da plataforma MMN_AI-to-AI.

## Características

- **CRUD de Instâncias**: Criar, listar, atualizar, suspender e ativar instâncias
- **Branding Customizável**: Cores, fontes, logos, templates de email
- **Domínios Customizados**: Gerenciamento de domínios com verificação DNS
- **Sistema de Billing**: Revisar - MMN_AI-to-AI/docs/planning
/Age.txt
- **Webhooks**: Eventos em tempo real para integrações
- **Métricas e Analytics**: Dashboard de métricas por instância
- **Autenticação via API Key**: Segurança com Bearer tokens
- **Rate Limiting**: Proteção contra abuso

## Instalação

```bash
# Clonar repositório
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI/fase7

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar
uvicorn src.api.routes:app --reload --host 0.0.0.0 --port 8000
```

## Documentação

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Endpoints Principais

### Instâncias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/whitelabel/instances` | Criar instância |
| GET | `/whitelabel/instances` | Listar instâncias |
| GET | `/whitelabel/instances/{id}` | Obter instância |
| PATCH | `/whitelabel/instances/{id}` | Atualizar instância |
| POST | `/whitelabel/instances/{id}/suspend` | Suspender |
| POST | `/whitelabel/instances/{id}/activate` | Ativar |

### Planos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/whitelabel/plans` | Listar planos |
| GET | `/whitelabel/plans/{id}` | Detalhes do plano |

### Métricas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/whitelabel/instances/{id}/metrics` | Métricas da instância |
| GET | `/whitelabel/instances/{id}/users` | Métricas de usuários |
| GET | `/whitelabel/instances/{id}/revenue` | Métricas de receita |

## Testes

```bash
# Executar testes
pytest tests/ -v

# Com coverage
pytest tests/ --cov=src --cov-report=html
```

## Estrutura do Projeto

```
fase7/
├── src/
│   ├── __init__.py
│   ├── config.py           # Configurações
│   ├── api/                # Rotas da API
│   │   ├── instances.py
│   │   ├── branding.py
│   │   ├── domains.py
│   │   ├── plans.py
│   │   ├── webhooks.py
│   │   ├── metrics.py
│   │   └── routes.py       # App principal
│   ├── models/             # Modelos Pydantic
│   │   ├── base.py
│   │   ├── instance.py
│   │   ├── plan.py
│   │   ├── branding.py
│   │   ├── domain.py
│   │   ├── api_key.py
│   │   └── webhook.py
│   ├── services/           # Lógica de negócio
│   │   ├── instance_service.py
│   │   ├── branding_service.py
│   │   ├── domain_service.py
│   │   ├── webhook_service.py
│   │   └── api_key_service.py
│   └── middleware/         # Middlewares
│       ├── auth.py
│       ├── rate_limit.py
│       └── error_handler.py
├── tests/                  # Testes unitários
├── requirements.txt
├── README.md
└── SPEC.md
```

## Planos Disponíveis

| Plano | Preço Mensal | Usuários | Domínios | Commission |
|-------|--------------|----------|----------|------------|
(MMN_AI-to-AI/docs/planning
/Age.txt)

## API Key

Para autenticação, utilize o header:

```
Authorization: Bearer wl_partner_your_api_key
```

## License

MIT License - Nexus-HUB57
