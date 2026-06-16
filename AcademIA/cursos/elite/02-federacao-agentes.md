---
title: "02 · Federação de Agentes"
level: elite
duration: 60min
prerequisites: ["01-multi-tenant-whitelabel"]
tags: [federacao, agentes, mTLS, multi-node, escalacao]
last_updated: 2026-06-15
version: "2.0.0"
pattern: "MMN_IA"
---

![Capa — Federação de Agentes](../../assets/ebook_covers/ACAD-apostila-04-orquestracao-hibrida-agentes.webp)

**02 · Federação de Agentes**

*Trilha Elite · 60 minutos · Pré-requisito: 01-Multi-tenant*

**Por Equipe Nexus · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este curso**

Federação de agentes é a capacidade de **múltiplos nós Nexus conversarem** entre si, formando uma rede distribuída. É o que permite escalar além de um único afiliado, compartilhar skills entre equipes, e consultar dados de outros nós com consentimento. Em 60 minutos, você vai entender como funciona o mTLS, os 3 níveis de confiança, e como configurar federação para sua operação.

**Sumário**

> **•** 1. O que é federação de agentes
> **•** 2. A diferença entre multi-tenant e federação
> **•** 3. Como funciona o mTLS
> **•** 4. Os 3 níveis de confiança
> **•** 5. Como adicionar um nó à federação
> **•** 6. Operações cross-nó
> **•** 7. Segurança e compliance
> **•** 8. Quando NÃO federar
> **•** 9. Federação para 3+ nós (avançado)
> **•** 10. Próximos passos na trilha Elite

---

**1. O que é federação de agentes**

**Federação** = 2 ou mais nós Nexus autônomos que se comunicam entre si de forma segura e autorizada.

Cada nó:
- É **independente**: pode cair sem derrubar os outros.
- É **autônomo**: tem suas próprias skills, agentes, dados.
- É **conectado**: pode consultar/processar dados de outros nós (com permissão).

**Benefício:** você não precisa centralizar tudo em 1 servidor. Distribui carga, isola falhas, e permite colaboração entre afiliados.

**2. A diferença entre multi-tenant e federação**

**Multi-tenant:**
- 1 operador, N marcas.
- Dados isolados por RLS.
- Operador tem controle total.

**Federação:**
- N operadores, cada um com sua marca.
- Dados isolados por design.
- Operadores têm autonomia, mas trocam dados com consentimento.

**Quando usar cada:**
- **Multi-tenant**: você oferece serviço para várias marcas.
- **Federação**: você quer colaborar com outros afiliados.

**3. Como funciona o mTLS**

**mTLS (Mutual TLS)** = autenticação bidirecional com certificados.

Em TLS normal (HTTPS), só o servidor se autentica. Em mTLS, **cliente E servidor se autenticam mutuamente**. Isso garante que:
- Cliente sabe que está falando com o servidor certo.
- Servidor sabe que está falando com o cliente certo.

**Na prática:** cada nó Nexus tem um par de chaves (pública + privada) emitido por uma **CA Nexus**. Quando 2 nós federam, eles trocam chaves públicas. Toda comunicação é criptografada E autenticada.

**Benefício:** impossível um nó se passar por outro. Mesmo que um atacante intercepte, ele não tem a chave privada.

**4. Os 3 níveis de confiança**

**Nível 1 — Leitura pública**
- Nó A consulta nó B para dados públicos (catálogo, marketplace).
- Sem aprovação necessária (pode ser feito automaticamente).
- Latência: < 500ms.
- Exemplo: "esse produto existe no marketplace?"

**Nível 2 — Leitura autorizada**
- Nó A consulta nó B para dados do nó (vendas, funis) com consentimento.
- Requer aprovação de ambos os lados.
- Latência: < 2s.
- Exemplo: "esse lead já foi atendido por outro afiliado?"

**Nível 3 — Escrita autorizada**
- Nó A escreve em nome do nó B (campanha conjunta, divisão de comissão).
- Requer aprovação de ambos os lados + auditoria.
- Latência: < 5s.
- Exemplo: "publicar campanha em 2 nós simultaneamente".

**Todo nó começa no Nível 1. A subida de nível exige aprovação mútua.**

**5. Como adicionar um nó à federação**

**Caminho:** `/dashboard/federation/invite`

**Passo 1**: você emite um convite para o outro nó.
- Especifica: tenant_id, nó alvo, nível de confiança solicitado.

**Passo 2**: o outro nó aceita.
- Confirma: tenant_id, autoridade, logs de auditoria.

**Passo 3**: ambos os nós trocam chaves mTLS.
- Automático via CA Nexus.

**Passo 4**: teste de comunicação.
- Ping federado, request teste, validação de resposta.

**Passo 5**: produção.
- Habilita as operações cross-nó.

**Tempo total:** ~1h se ambos os admins estão disponíveis.

**6. Operações cross-nó**

**Operação 1 — Deduplicação de leads**
- Antes de disparar, consulta: "esse lead existe em outro nó?"
- Se sim, oferece o mesmo produto OU redireciona.
- Custo: R$ 0,005 por consulta.

**Operação 2 — Skills compartilhadas**
- Nó A usa skill `copywriter` do nó B (que tem versão melhor).
- Cobrança: % da receita gerada pela skill compartilhada.
- Custo: variável.

**Operação 3 — Campanhas conjuntas**
- 2 nós lançam a mesma campanha simultaneamente, com públicos não-concorrentes.
- Comissão: dividida conforme acordo.
- Custo: nenhum (split).

**Operação 4 — Catálogo unificado**
- 2 nós compartilham catálogo de produtos.
- Cada nó vê os produtos do outro.
- Custo: nenhum.

**7. Segurança e compliance**

**Boas práticas:**
- mTLS com rotação de chaves a cada 90 dias.
- Auditoria de operações federadas (quem consultou o quê, quando).
- Limite de Nível 2 (consulta de dados) por hora/dia (anti-exfiltração).
- Alerta se nó começar a fazer consultas anômalas.

**Compliance:**
- LGPD: consentimento explícito do lead antes de compartilhar entre nós.
- Auditoria: log imutável de toda operação federada (90 dias).
- Reversibilidade: capacidade de revogar acesso a qualquer momento.

**8. Quando NÃO federar**

**Não federe se:**
- Você é solo e o nó vizinho é solo também (custo > benefício).
- Os 2 nós têm públicos 100% concorrentes (canibalização).
- Você não tem admin para gerenciar federação (sozinho é inviável).
- Sua receita mensal é < R$ 10k (foco errado).

**Federe se:**
- Você tem R$ 20k+ consistente.
- O nó vizinho tem público não-concorrente.
- Vocês podem se dividir a sobrecarga técnica.
- Ambos têm admin dedicado.

**9. Federação para 3+ nós (avançado)**

**Com 3+ nós, a complexidade cresce.** Você precisa decidir:

**Topologia Estrela**: 1 nó central coordena. (simples, mas ponto único de falha).
**Topologia Mesh**: cada nó fala com todos. (complexo, mas robusto).
**Topologia Hierárquica**: nós regionais + nó central. (balanceado).

**Recomendação:** comece com Estrela (2-3 nós), migre para Hierárquica (4-10 nós), Mesh apenas para 10+ nós.

**Pinned mTLS**: cada nó tem certificado pinned (não renovável sem aprovação). Para 3+ nós, **essencial**.

**Health checks**: cada nó verifica os outros a cada 60s. Se nó X está down, roteia para fallback.

**10. Próximos passos na trilha Elite**

Você completou a **Trilha Elite**. Os próximos passos são:

**Curto prazo (30 dias):**
- Aplicar 1 blueprint (A, B, ou C).
- Mentorear 1 afiliado iniciante.
- Publicar 1 case no blog.

**Médio prazo (90 dias):**
- Configurar federação com 1 nó vizinho.
- Operar 2 tenants em white-label (se aplicável).
- Atingir R$ 30k+/mês consistente.

**Longo prazo (12 meses):**
- Ser referência na rede (Top 5%).
- Construir produto próprio (curso, comunidade, evento).
- Ajudar a treinar a próxima geração.

**Recursos extras (cursos Elite):**
- **Apostila 01**: Apresentação da Infraestrutura (mTLS, SHO, fed).
- **Apostila 02**: Cases Reais (Marina, Carlos, Equipe Prime).
- **Apostila 04**: Orquestração Híbrida.
- **Certificação CEN+**: caminho formal para validar conhecimento Elite.

---

**02 · Federação de Agentes** --- Trilha Elite · Última Trilha

*MMN AI-to-AI · 2026 · Todos os direitos reservados · Licença: CC BY-SA 4.0*
