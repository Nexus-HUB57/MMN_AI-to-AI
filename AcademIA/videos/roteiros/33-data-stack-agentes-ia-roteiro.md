# Roteiro · Aula 33 — Data Stack para Agentes IA

> Trilha **Elite** · Persona **alencar** · Slug `data-stack-agentes-ia` · Duração alvo ~63s

**Meta:** persona=alencar · trilha=Elite · cor=gold · lesson=elite-10

## 🎬 CENA 1 — Abertura Cinematográfica (Duração: 10s)

**Sr. Nexus Alencar:** "Data Stack para Agentes IA." O que é: contas, planos, pedidos, billing, permissões

**Visual:**
- HUD trilha Elite
- Kicker: "AULA NEXUS " + código
- Fade-in dark cinematic

## 🎬 CENA 2 — 2. Dados de sessão (Semi-structured) (Duração: 15s)

**Sr. Nexus Alencar:** O que é: estado da conversa, contexto, histórico Características: alta leitura/escrita, TTL curto, key-value Banco ideal: Redis Exemplo: o que o agente disse nos últimos 30 minutos pra esse usuário.

**Visual:**
- Slide-2: bullets do capítulo
- Motion accent gold
- Cross-dissolve 0.5s

## 🎬 CENA 3 — 3. Dados assíncronos (Queues) (Duração: 15s)

**Sr. Nexus Alencar:** O que é: jobs pendentes, retries, webhooks a processar Características: FIFO com prioridade, retry exponencial, DLQ Banco ideal: Redis + BullMQ (ou SQS) Exemplo: "enviar email de boas-vindas" ficou na fila 5min por causa de bug no SMTP.

**Visual:**
- Slide-3: bullets do capítulo
- Motion accent gold
- Cross-dissolve 0.5s

## 🎬 CENA 4 — 4. Dados semânticos (Unstructured + vectors) (Duração: 15s)

**Sr. Nexus Alencar:** O que é: conhecimento do agente, RAG, memória de longo prazo Características: similarity search, embeddings Banco ideal: Pinecone / Qdrant / Weaviate Exemplo: "em qual skill a doc fala sobre LGPD?" → busca semântica. ---

**Visual:**
- Slide-4: bullets do capítulo
- Motion accent gold
- Cross-dissolve 0.5s

## 🎬 CENA 5 — Fechamento & Chamada à Ação (Duração: 8s)

**Sr. Nexus Alencar:** Isso é Data Stack para Agentes IA na Academia Nexus. Próxima aula: continue a trilha em oneverso.com.br/academia.

**Visual:**
- CTA card: oneverso.com.br/academia
- Fade-out dark
- Marca d'água ACADEM IA NEXUS
