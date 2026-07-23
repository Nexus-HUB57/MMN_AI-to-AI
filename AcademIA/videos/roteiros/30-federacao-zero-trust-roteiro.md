---
title: "Federação Zero-Trust — Segurança Avançada para Agentes A2A"
persona: "dupla"
trilha: "Fundamental"
lesson: "fund-30"
total_duracao: 70
---

# Roteiro 30 — Federação Zero-Trust

## 🎬 Abertura Cinematográfica (10s)
- **Visual**: Logo + cadeado animado + código `30/19`
- **Narração Ive**:
  > "Você não vai aprender mais um framework de segurança. Você vai descobrir como agentes de plataformas diferentes se comunicam sem confiar em ninguém."

## 🔒 Cena 2 — Por que Zero-Trust importa para A2A (15s)
- **Visual**: 3 problemas (não controla o outro agente / não controla a rede / não controla o usuário) + 4 riscos (agente malicioso · MITM · replay · skill abuse)
- **Narração Alencar**:
  > "Zero-Trust — nunca confiar, sempre verificar — é o padrão corporativo desde dois mil e vinte. Mas a maioria das implementações é para humanos e serviços internos. Em comunicação A2A, três problemas aparecem: você não controla o outro agente, pode ser de qualquer vendor. Não controla a rede, passa por internet pública. E não controla o usuário final. Quatro riscos específicos: agente malicioso fingindo ser legítimo, man-in-the-middle interceptando comunicação, replay attack repetindo request válido, e skill abuse chamando skill com parâmetros maliciosos. A solução é Zero-Trust mais criptografia forte — mTLS, JWS — mais autenticação por skill."

## 🛡️ Cena 3 — Os 6 pilares do Zero-Trust aplicado a A2A (15s)
- **Visual**: Tabela central com 6 pilares e implementação A2A (Identidade mTLS+DIDs · Auth contínua com token rotation · Autorização JWT scope · Auditoria OpenTelemetry · Criptografia TLS 1.3 · Menor privilégio via Agent Card)
- **Narração Alencar**:
  > "Seis pilares sustentam Zero-Trust aplicado a A2A. Identidade verificável via mTLS e DIDs — Decentralized Identifiers. Autenticação contínua, não basta logar uma vez, token rotation a cada uma hora. Autorização por recurso, cada skill tem seu scope no JWT. Auditoria distribuída, todo request logado em OpenTelemetry. Criptografia everywhere, TLS 1.3 mínimo, mTLS em federation. E menor privilégio, o agente só vê o que foi declarado no Agent Card. A regra é clara: tratar cada request como se viesse de uma rede pública hostile."

## 🔐 Cena 4 — Identidade verificável (mTLS + DIDs) (15s)
- **Visual**: Código Python "A2AServer com ssl.create_default_context" + snippet JSON de DID "did:nexus:agent-abc123" com JsonWebKey2020
- **Narração Alencar**:
  > "Identidade verificável na prática. mTLS — Mutual TLS — exige que ambos os lados da conexão apresentem certificado, não só o servidor como em HTTPS. Em código, isso vira ssl.create_default_context com Purpose CLIENT_AUTH e load_cert_chain do certificado do agente. E DIDs — Decentralized Identifiers — padrão W3C para identidade auto-soberana. Cada agente ganha um DID único, did:nexus:agent-abc123, com verification method JsonWebKey2020 e service endpoint do tipo A2AService. Benefício: identidade verificável criptograficamente, sem precisar de Certificate Authority central."

## ⚖️ Cena 5 — Autorização por skill (scope-based) + auditoria (8s)
- **Visual**: JWT com "scope: skills:consultar-produto skills:enviar-mensagem" + tabela de rate limits + log imutável com trace_id, caller_did, callee_did, skill, duration_ms
- **Narração Alencar**:
  > "Cada skill tem seu próprio scope no JWT. O agente que chama precisa ter aquele scope específico, com rate limit próprio. consultar-produto até cem por hora. enviar-mensagem até cinquenta por hora. Servidor verifica scope e rate limit antes de executar. E todo request fica logado de forma imutável — trace id, caller DID, callee DID, método, skill, hashes de input e output, duração em milissegundos. Retenção: noventa dias hot, sete anos cold. Está tudo pronto para compliance."

## 🎯 CTA de Fechamento (7s)
- **Narração Ive**:
  > "Acesse oneverso.com.br/academia e baixe a apostila 30 completa."
