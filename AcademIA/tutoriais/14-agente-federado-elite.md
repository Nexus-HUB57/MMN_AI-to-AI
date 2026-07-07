---
title: "Conectar Agente a uma Federação Multi-node"
tutorial_code: TUT-ELI-02
level: elite
duration: 28min
tags: [tutorial, federacao, multi-node, mTLS, agentic, elite]
last_updated: 2026-06-28
prerequisites: ["TUT-ELI-01-deploy-multi-tenant-elite"]
---

# 🌐 Conectar Agente a uma Federação Multi-node

> **Tempo:** 28 min · **Nível:** Elite · **Pré-requisitos:** Plataforma multi-tenant em produção

## Problema

Você tem uma plataforma white-label rodando com 50+ clientes. Cada cliente tem suas skills customizadas. Mas:
- Skills duplicadas entre clientes desperdiçam esforço
- Um cliente poderia se beneficiar das skills de outro
- Não existe rede de compartilhamento
- Você quer oferecer **Skill Exchange** como produto adicional

## Solução

### 1. Conceito de Federação

Uma federação é um conjunto de **nós Elite** (cada um uma instância multi-tenant) que compartilham skills de forma segura.

```
        ┌─────────────┐
        │   HUB       │
        │ (registry)  │
        └──────┬──────┘
               │
       ┌───────┼───────┐
       │       │       │
   ┌───▼──┐ ┌─▼───┐ ┌─▼───┐
   │Nó A  │ │Nó B │ │Nó C │
   │Elite │ │Elite│ │Elite│
   └──────┘ └─────┘ └─────┘
       │       │       │
   [skills A] [skills B] [skills C]
```

### 2. mTLS para Autenticação entre Nós

```bash
# Gerar par de chaves para o nó
openssl genrsa -out node_key.pem 4096
openssl req -new -x509 -days 365 -key node_key.pem \
  -out node_cert.pem -subj "/CN=node-elite-001"

# CA do hub de federação
curl -o hub_ca.pem https://hub.nexus-federation.com/ca.pem
```

```python
# federation/mtls_client.py
import ssl
import httpx

class FederationClient:
    """Cliente mTLS para consumir skills federadas."""

    def __init__(self, node_cert: str, node_key: str, hub_ca: str):
        self.client = httpx.Client(
            cert=(node_cert, node_key),
            verify=hub_ca,
            timeout=30.0,
        )

    def call_skill(
        self,
        target_node: str,
        skill_name: str,
        input_data: dict,
        user_token: str,
    ) -> dict:
        """
        Chama skill em nó federado.
        """
        response = self.client.post(
            f"https://{target_node}.nexus-federation.com/v1/skills/{skill_name}/execute",
            json=input_data,
            headers={
                "Authorization": f"Bearer {user_token}",
                "X-Federation-Source": "node-elite-001",
                "X-Request-ID": str(uuid.uuid4()),
            },
        )
        response.raise_for_status()
        return response.json()
```

### 3. Registro no Hub de Federação

```bash
# Registrar nó no hub
curl -X POST https://hub.nexus-federation.com/v1/nodes/register \
  --cert node_cert.pem --key node_key.pem \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "node-elite-001",
    "endpoint": "https://node-001.nexus-federation.com",
    "skills_offered": [
      "audience_segmenter_pro",
      "copywriter_persuasive",
      "whatsapp_dispatcher_safe"
    ],
    "pricing_per_call": {
      "audience_segmenter_pro": 0.10,
      "copywriter_persuasive": 0.08
    },
    "sla_uptime": 99.9,
    "compliance": ["LGPD", "GDPR"]
  }'
```

### 4. Publicar Skill no Marketplace Federado

```python
# federation/publish_skill.py
from dataclasses import dataclass

@dataclass
class FederatedSkill:
    name: str
    version: str
    description: str
    input_schema: dict
    output_schema: dict
    pricing_per_call: float
    sla_uptime: float
    max_concurrent_calls: int
    allowed_consumers: list[str]  # tenant_ids ou "all"
    pii_handling: str  # "none", "anonymized", "consent_required"

def publish_to_federation(skill: FederatedSkill, hub_client):
    """
    Publica skill no marketplace federado.
    """
    response = hub_client.post(
        "/v1/skills/publish",
        json=skill.__dict__,
    )
    return response.json()

# Exemplo
skill = FederatedSkill(
    name="audience_segmenter_pro",
    version="2.1.0",
    description="Segmenta audiência com 12 dimensões comportamentais",
    input_schema={
        "type": "object",
        "properties": {
            "contacts": {"type": "array", "minItems": 1, "maxItems": 100000},
            "dimensions": {"type": "array", "default": ["engagement", "ltv", "channel_pref"]},
        },
    },
    output_schema={
        "type": "object",
        "properties": {
            "segments": {"type": "array"},
        },
    },
    pricing_per_call=0.10,
    sla_uptime=99.5,
    max_concurrent_calls=100,
    allowed_consumers=["all"],
    pii_handling="anonymized",
)

publish_to_federation(skill, hub_client)
```

### 5. Consumir Skill Federada

```python
# No seu agente local
class FederatedSkillRegistry:
    """Registro local de skills federadas consumidas."""

    def __init__(self, federation_client, hub_client):
        self.federation = federation_client
        self.hub = hub_client

    def discover_skill(self, query: str) -> list[FederatedSkill]:
        """Busca skills no marketplace."""
        response = self.hub.get(
            "/v1/skills/search",
            params={"q": query, "compliance": "LGPD"}
        )
        return [FederatedSkill(**s) for s in response.json()["results"]]

    def use_skill(self, skill_name: str, input_data: dict,
                  user_token: str) -> dict:
        """Resolve qual nó tem a skill e chama."""
        # 1. Descobrir nós que oferecem
        skills = self.discover_skill(skill_name)
        if not skills:
            raise ValueError(f"Skill {skill_name} não encontrada na federação")

        # 2. Escolher nó por menor latência + melhor pricing
        best_skill = sorted(
            skills,
            key=lambda s: (s.pricing_per_call, -s.sla_uptime)
        )[0]

        # 3. Executar com mTLS
        result = self.federation.call_skill(
            target_node=best_skill.node_endpoint,
            skill_name=skill_name,
            input_data=input_data,
            user_token=user_token,
        )

        # 4. Logar para billing
        self._log_billing(skill_name, best_skill, user_token)

        return result
```

### 6. Billing & Settlement

```python
# federation/billing.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class FederationTransaction:
    timestamp: datetime
    source_node: str
    consumer_node: str
    skill_name: str
    cost_brl: float
    settlement_status: str  # "pending", "settled", "disputed"

class FederationBilling:
    """Gerencia billing e settlement entre nós federados."""

    def __init__(self):
        self.balance = {}  # node_id -> balance_brl

    def record_transaction(self, tx: FederationTransaction):
        """Registra transação e atualiza saldos."""
        if tx.source_node not in self.balance:
            self.balance[tx.source_node] = 0.0
        if tx.consumer_node not in self.balance:
            self.balance[tx.consumer_node] = 0.0

        # Source recebe, consumer paga
        self.balance[tx.source_node] += tx.cost_brl
        self.balance[tx.consumer_node] -= tx.cost_brl

    def settle_daily(self):
        """Roda settlement diário: nós com saldo positivo recebem PIX."""
        for node, balance in self.balance.items():
            if abs(balance) > 10.0:  # mínimo R$10 para liquidar
                # TODO: integrar com sistema de pagamento
                print(f"Settling R${balance:.2f} for {node}")
                # Reset após settlement
                self.balance[node] = 0.0
```

### 7. Governança: Comitê de 7 Eleitos

```yaml
# governance/federation_council.yaml
council:
  members: 7
  election_period_months: 12
  current_members:
    - id: 1
      node: "node-elite-001"
      representative: "João Silva"
      joined: "2026-01-01"
      votes_cast: 47
    - id: 2
      node: "node-elite-002"
      representative: "Maria Santos"
      joined: "2026-01-01"
  decisions_log:
    - id: 1
      date: "2026-06-15"
      proposal: "Adicionar SHA-3 como algoritmo de hash para skills"
      votes_for: 6
      votes_against: 1
      status: approved
    - id: 2
      date: "2026-06-22"
      proposal: "Pricing mínimo de R$ 0.05 por chamada"
      votes_for: 5
      votes_against: 2
      status: approved
```

## Verificação

✅ Seu nó tem certificado mTLS emitido por CA da federação
✅ Suas skills estão publicadas no marketplace federado
✅ Você consome skills de outros nós federados
✅ Billing está sendo registrado e settlement diário roda
✅ Você participa do conselho de governança (se aplicável)

## Próximos passos

- Configurar smart contracts para settlement automático
- Implementar reputation system
- Estudar Tutorial 15 (Auditoria LGPD automatizada)
