# 🔐 Handshake Protocol · ed25519 · Nexus Affil'IA'te

**Owner**: Otávio Nexus Ops (COO/AI) · **Autor original**: Ravi (CTO/AI) M9

## 🎯 Propósito

Autenticar comunicação **agent-to-agent (A2A)** entre C-level do Nexus, garantindo:
- **Identidade forte**: Só quem tem a chave privada assina
- **Não-repúdio**: Cada mensagem tem SHA-256 auditável
- **Zero-trust**: Não confia em rede, só em criptografia

## 🔑 Chaves por Agente

Cada C-level tem par ed25519 dedicado:

| Agente | Public Key ID | Uso |
|---|---|---|
| Niko (CEO/AI) | ceo-ai:niko-nexus | Governance Loop, roteamento |
| Otávio (COO/AI) | coo-ai:otavio-nexus-ops | Runbooks, incidentes, SLA |
| Ravi (CTO/AI) | cto-ai:ravi | Deploys, releases, migrations |
| Helena (CMO/AI) | cmo-ai:helena | Campanhas, publishers, brand |
| Otto (CFO/AI) | cfo-ai:otto-cardoso | Payouts, unit economics, fraud |

Armazenamento: `csuite_agents.metadata->>'public_key_ed25519'`
Chaves privadas: **NUNCA** no repo — apenas em `.env` ou secret manager.

## 🤝 Fluxo de Handshake (5 passos)

```
1. AGENTE_A envia proposição:
   {
     agentId: "cmo-ai:helena",
     kind: "campaign.launch",
     payload: {...},
     nonce: <uuid>,
     timestamp: <iso>,
     signature: ed25519.sign(privateKey, hash(payload+nonce+timestamp))
   }

2. GOVERNANCE_LOOP recebe:
   - Valida signature contra public key de csuite_agents
   - Verifica timestamp (< 5min)
   - Verifica nonce (não reusado nos últimos 7 dias)

3. GOVERNANCE_LOOP decide:
   - Se kind está em permittedKinds do agente → OK
   - Se autonomy_level permite → executa
   - Senão → escalate humano

4. AGENTE_A recebe resposta assinada:
   {
     actionId: "act_XXXXX",
     status: "approved" | "review" | "blocked",
     signedBy: "ceo-ai:niko-nexus",
     signature: ed25519.sign(niko_privateKey, hash(actionId+status))
   }

5. AUDIT_LOG persiste:
   - governance_actions table (histórico completo)
   - SHA-256 do payload + signatures dos dois lados
```

## 🛡️ Trust Levels

| Level | O que permite |
|---|---|
| **elite** | Handshake sem review humano para kinds permittedKinds |
| **verified** | Handshake com review 1 (Niko) para kinds sensíveis |
| **onboarding** | Todo handshake requer review humano (Lucas) |

Todos os 5 C-level atuais estão em **elite**.

## 🔒 Kinds e Autonomia

```javascript
// permittedKinds por agente (de c-suite-bridge/bootstrap.ts)
Niko:    [skill.*, agent.*, policy.*, payout.*, campaign.*, knowledge.*]
Otávio:  [skill.update, agent.promote/suspend, policy.change, knowledge.ingest]
Ravi:    [skill.publish/update/deprecate, knowledge.ingest, agent.promote/suspend]
Helena:  [campaign.launch, skill.update, knowledge.ingest, agent.promote, policy.change]
Otto:    [payout.release, policy.change, campaign.launch, skill.update, knowledge.ingest, agent.*]
```

## 🚨 Locked From Auto-Exec (todos os agents)

```
payout.release.real-money
commissions.matrix-change
agent.hire-fire
custody.key-change
```

Nenhum agente pode executar autonomamente — sempre escalate para Lucas.

## 🧪 Testar Handshake

```bash
# 1. Gerar chave (dev)
node -e "const {generateKeyPairSync} = require('crypto'); const k=generateKeyPairSync('ed25519'); console.log('pub:', k.publicKey.export({format:'pem',type:'spki'})); console.log('priv:', k.privateKey.export({format:'pem',type:'pkcs8'}))"

# 2. Assinar payload
node scripts/sign-handshake.js "campaign.launch" '{"name":"Genesis"}'

# 3. Enviar via A2A endpoint
curl -X POST /api/trpc/cSuiteBridge.propose -d '{signed_payload}'
```

## 📊 Métricas

- **Handshakes/dia**: `SELECT COUNT(*) FROM governance_actions WHERE created_at > NOW() - INTERVAL '1 day'`
- **Success rate**: `WHERE status = 'approved'`
- **Signature failures**: log Sentry
- **Nonce reuse attempts**: alerta P0
