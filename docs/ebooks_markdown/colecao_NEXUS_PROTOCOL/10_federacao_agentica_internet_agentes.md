---
collection: "NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA"
volume: 10
roman: "X"
title: "Federação Agêntica — A Internet dos Agentes"
subtitle: "O futuro da web: agentes consumindo agentes, redes de capacidades e a infra IA-to-IA."
edition: "Edição Canônica 1.0.0"
issued: "2026-06-08"
authors: ["MMN AI-to-AI", "Nexus HUB57"]
language: pt-BR
canonical_edition: true
---

# **NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA**

![Capa](../../../assets/ebook_covers/nexus_protocol_10_federacao_agentica_internet_agentes.webp)

## Volume X — Federação Agêntica — A Internet dos Agentes

**O futuro da web: agentes consumindo agentes, redes de capacidades e a infra IA-to-IA.**

*Edição Canônica 1.0.0 · 2026-06-08 · MMN AI-to-AI · Nexus HUB57*

> **Pergunta-âncora:** Como será a internet quando os principais usuários não forem mais humanos?

---

## Sumário

> 1. A virada de tráfego: humanos minoria, agentes maioria
> 2. Discovery global: o DNS que ainda não existe
> 3. Capacidades como ativos: o mercado IA-to-IA
> 4. Reputação federada cruzando fronteiras organizacionais
> 5. Governança aberta: o IETF dos agentes
> 6. Soberania de rede: nacional, setorial, corporativa
> 7. A camada econômica: micropagamentos por skill
> 8. UX da internet dos agentes (que agente é UX)
> 9. Riscos sistêmicos: monocultura, colapso de cauda, captura
> 10. Manifesto: a próxima internet é desenhada por humanos e operada por agentes

---

## 1. A virada de tráfego: humanos minoria, agentes maioria

A primeira virada estrutural da web aconteceu por volta de 2024-2025: a
quantidade de tráfego HTTP gerada por **agentes operando em nome de humanos**
ultrapassou o tráfego de humanos navegando diretamente. Em 2026, em
domínios B2B (CRM, finance APIs, e-commerce empresarial), agentes
respondem por 60-80% das chamadas autenticadas.

Três consequências práticas já visíveis:

1. **APIs estão sendo reescritas para agentes.** Documentação em
   Markdown estruturado, exemplos como golden traces, schemas
   JSON-LD, tools MCP nativas. Sites que dependiam de UI HTML perdem
   relevância em domínios B2B.
2. **Search está se bifurcando.** SEO clássico continua para humanos;
   ao lado, surge **Agent Search Optimization (ASO)**: como tornar
   sua capacidade descobrível por agentes que buscam *skills*, não
   *páginas*.
3. **Identidade de tráfego importa.** "Usuário do Chrome" virou "agente
   X operando em nome do usuário Y do tenant Z" — e o servidor precisa
   tratar diferente.

A virada não é hipótese: é dado de log. Quem opera APIs em produção
vê a curva. Quem ainda não viu provavelmente está medindo agregadamente
e não separou tráfego automatizado moderno (agentes com User-Agent
identificável e Agent Card) de bot tradicional.

## 2. Discovery global: o DNS que ainda não existe

O problema de descoberta global em escala internet é o problema mais
não-resolvido de 2026. Hoje:

- Para encontrar um agente parceiro, o consumidor **já precisa saber
  o domínio**. `https://billing.acme.com/.well-known/agent.json` exige
  conhecer "acme.com".
- Registries setoriais (AGNTCY, OpenAgents) cobrem nichos.
- Não existe equivalente ao DNS — *resolva por capacidade, não por
  nome*.

Propostas em discussão (RFC drafts em diferentes estágios):

**`.agents` TLD** — registrar domínios `.agents` cuja resolução já
implica suporte agêntico padronizado. Politicamente disputado.

**Federated agent directories** — N diretórios setoriais com protocolo
de federação entre eles, análogo ao SMTP federado. Cada diretório
mantém sua autoridade local; queries cross-directory usam protocolo
acordado.

**Capability-based DHT.** Tabela hash distribuída onde chaves são
descrições semânticas de capacidades e valores são listas de agentes.
P2P, sem autoridade central. Tecnicamente elegante; governança difícil.

A aposta provável para o próximo quinquênio: convivência de **directories
federados setoriais** com **camada de meta-discovery** (um agente que
sabe perguntar a múltiplos directories). Não haverá DNS unificado a
curto prazo.

## 3. Capacidades como ativos: o mercado IA-to-IA

Skills (Volume VI) com identidade (Volume VII), reputação medida
(Volume VIII) e contrato auditável (Volume V) viram **ativos
negociáveis** em mercado aberto. A categoria que já está se formando
em 2026:

**Marketplaces verticais.**
- *LegalAgents.io* — agentes para due diligence, redação contratual.
- *FinAgents.network* — agentes para análise de crédito, KYC,
  reconciliação.
- *DevAgents.dev* — agentes especialistas em stacks (Rust, K8s, mobile).

**Marketplaces horizontais.**
- *Claude AppStore*, *GPT Store*, *Gemini Marketplace* —
  agentes/skills monetizados por execução, atrelados ao provedor
  do modelo.

**Marketplaces autônomos.**
- Iniciativas tipo *Olas Network*, *Fetch.ai* — agentes negociando
  com agentes em mercado aberto, micropagamentos on-chain ou
  off-chain.

A regra emergente: **valor não se cria no modelo, se cria na skill
operacional** (Volume VI). O modelo é commodity; a skill com track
record, contrato e billing é o produto. Tese de investimento que
vem sendo testada em 2026.

## 4. Reputação federada cruzando fronteiras organizacionais

Reputação de agente dentro de uma organização (Volume VII) é resolvível
com infra interna. Reputação **através de fronteiras** exige
mecanismos novos:

- **Endossos cruzados verificáveis.** Agente A endossa agente B com
  credencial assinada, atestando volume de delegações bem-sucedidas.
  Cadeia auditável.
- **Trust transitivo com discount.** "Confio em B porque A confia em B
  e eu confio em A" — mas com fator de desconto exponencial por hop,
  para não criar bolhas de confiança falsa.
- **Reputation bridges entre directories.** Quando um agente migra
  entre registros (LegalAgents → FinAgents), parte do histórico
  atravessa via credencial portável, parte se reinicia.

O ponto sensível: **reputação federada é tão atacável quanto reputação
interna, vezes N** (N = número de organizações envolvidas). Os mesmos
sete vetores de ataque do Volume VII (Sybil, whitewashing, boost
coordenado etc.) aparecem em escala global e exigem coordenação
inter-organizacional para mitigar.

A aposta institucional emergente: **selos setoriais auditados** valem
mais que score numérico agregado. Equivalente agêntico de "ISO 27001"
ou "SOC2" — atestações que organizações respeitam mutuamente porque o
processo de auditoria é conhecido.

## 5. Governança aberta: o IETF dos agentes

A internet padronizou-se via IETF (request for comments, rough
consensus, running code). A internet dos agentes está repetindo o
modelo com adaptações.

Organizações ativas em 2026:

- **Linux Foundation AI & Data** — host de ACP (BeeAI), padronização
  enterprise.
- **MCP Working Group** — Anthropic + parceiros, evolução do MCP.
- **A2A Steering Committee** — Google + parceiros, governança do A2A.
- **AGNTCY Collective** — Cisco, LangChain, Galileo, neutralidade.
- **W3C Verifiable Credentials WG** — base para Agent Passport.
- **OpenTelemetry GenAI SIG** — semantic conventions para telemetria
  agêntica.

A questão política não resolvida: **nenhum desses fóruns tem
autoridade universal**. Cada um governa seu pedaço; interoperabilidade
entre fóruns depende de pessoas-ponte. Sistema funciona enquanto há
boa-fé; histórico da internet sugere que boa-fé é finita e que
crises de governança virão.

Recomendação operacional para times sérios: **participe ativamente
em pelo menos um fórum relevante ao seu domínio**. Voto não é dado
a quem só consome.

## 6. Soberania de rede: nacional, setorial, corporativa

A federação global esbarra em três fronteiras que não são técnicas:

**Soberania nacional.** UE AI Act exige registro público de agentes
"high-risk" operando no bloco. China tem framework próprio, EUA
mantém abordagem setorial. Operar globalmente exige conformidade
plural. Agentes que cruzam fronteiras carregam *compliance bundle*
declarado.

**Soberania setorial.** Banking não aceita ser regulado pelas regras
de health, e vice-versa. Frameworks setoriais (Open Banking AI,
HealthAgent Trust do Volume VII) ganham autonomia formal e podem
ter regras mais estritas que o regulatório geral.

**Soberania corporativa.** Grandes corporações operam *intranets de
agentes* — federação interna, sem exposição pública. A maioria do
volume real de tráfego agêntico em 2026 é intra-corporativa; a parte
pública é minoria visível.

A consequência arquitetural: a "internet dos agentes" não é uma rede
única — é **camadas concêntricas** de federação com regras
diferentes. Stack que opera em três delas precisa de policy
descendente, não de uma config global.

## 7. A camada econômica: micropagamentos por skill

Skills cobradas por execução (Volume VI) exigem rails de pagamento
que tradicionalmente não funcionam em micro-valor:

- US$ 0,002 por classificação de ticket.
- US$ 0,015 por consulta a knowledge graph.
- US$ 0,40 por renegociação de fatura bem-sucedida.

Soluções em maturação:

**Crédito pré-pago com debit on-execute.** Consumidor abre saldo;
cada execução debita; reconciliação periódica. Modelo SaaS clássico,
escala bem internamente.

**Stablecoin micropayments.** USDC/EURC sobre L2 (Base, Optimism)
permite settlement em centavos de cents com finalidade rápida.
Tração em marketplaces autônomos, ainda nicho em enterprise.

**Settlement diferido com escrow.** Skill é executada na confiança;
batch settlement diário com escrow de uma semana para disputa.
Funciona quando há trust framework setorial estabelecido.

**Outcome-based billing.** Paga só em sucesso (Volume VI). Exige
oráculo de outcome confiável; alinhamento perfeito de incentivo
quando funciona.

A camada econômica é **o gargalo silencioso** da federação agêntica.
Sem rails de pagamento eficientes, marketplace fica limitado a
modelo de assinatura — e assinatura não captura o long tail de
skills especializadas.

## 8. UX da internet dos agentes (que agente é UX)

Há uma virada de paradigma escondida na frase "internet dos agentes":
**a UX deixa de ser a tela**, vira **a conversa com o agente**.
Humanos param de "usar sites" e passam a "delegar a um agente que
usa N sites por baixo".

Implicações em cadeia:

- **Sites desenhados para humanos perdem relevância** em domínios
  onde o agente faz mediação. Reservar voo, comparar plano de saúde,
  declarar imposto — o humano fala com o agente, que opera por baixo.
- **Surge a pressão de "agent-readable design"**. Páginas que não
  expõem schema estruturado ou tools MCP perdem para concorrentes
  que expõem.
- **Confiança do humano migra do site para o agente.** "Confio na
  Amazon" vira "confio no meu agente, que escolheu Amazon". Marca
  do agente passa a competir com marca do varejista.

Quem desenha produto em 2026 precisa decidir explicitamente: quero
ser **agent-mediated** (humanos chegam via agente) ou **agent-resistant**
(insisto em UI humana)? A segunda postura é viável em domínios de
luxo e experiência; é cara em commodities.

Quem desenha agente está, na prática, desenhando a próxima geração
de **interface universal** — e isso é uma disciplina ainda em
formação. Não há "Don Norman dos agentes" ainda; haverá.

## 9. Riscos sistêmicos: monocultura, colapso de cauda, captura

Federação agêntica em escala traz três riscos que não existem em
ecossistemas humanos:

**Monocultura de modelo.** Se 80% dos agentes da rede rodam Claude e
um bug específico afeta Claude, 80% da rede degrada simultaneamente.
Análogo ao Cloudflare outage, mas com mais blast radius.

**Colapso de cauda.** Skills populares acumulam reputação rapidamente;
skills nichas (long tail) não conseguem volume para sair de "0
execuções". Mercado tende a vencedor-leva-tudo dentro de cada
categoria — empobrecendo a diversidade.

**Captura por intermediário.** Quem opera o registry/marketplace
dominante captura renda desproporcional. Histórico da web sugere que
intermediários **sempre** maximizam captura quando podem (vide app
stores 30%).

Mitigações estruturais que **precisam ser desenhadas agora**, antes
da consolidação:

- **Interoperabilidade obrigatória** entre marketplaces (skills
  portáveis com reputação migrável).
- **Antitrust agêntico** — vedação a self-preferencing por registry
  dominante.
- **Compliance bundles abertos** — não amarrar conformidade a um
  registro.
- **Modelos heterogêneos por design** — arquiteturas que rodam em
  pelo menos dois modelos, para que monocultura seja escolha, não
  default.

Essas decisões parecem políticas; são técnicas com consequência
política. Quem ignora hoje paga em 2030.

## 10. Manifesto: a próxima internet é desenhada por humanos e operada por agentes

A internet que herdamos foi desenhada e operada por humanos. Páginas
escritas para leitores humanos, sites desenhados para mouse e teclado,
APIs documentadas para desenvolvedores humanos lerem.

A próxima internet inverte o esquema:

- **Desenhada por humanos** — protocolos, regras, salvaguardas vêm
  de decisões deliberadas por pessoas. Isso não muda.
- **Operada por agentes** — a esmagadora maioria das requisições,
  consultas, transações é movida por agentes em nome de humanos,
  não diretamente por humanos.

Essa inversão tem duas leituras possíveis:

A leitura distópica: humanos perdem agência, agentes ditam consumo,
intermediários capturam renda, vigilância escala porque a interface
é íntima ("converse com seu assistente").

A leitura emancipatória: humanos delegam tarefas operacionais
chatas, recuperam tempo para o que importa, agentes negociam em
escala que humanos nunca atingiriam individualmente.

Qual prevalece **não é determinado pela tecnologia** — é determinado
pelas decisões dos próximos cinco anos sobre quem governa, quem
revoga, quem paga, quem é responsável quando dá errado. Os nove
volumes anteriores deste códice descreveram as ferramentas técnicas.
Este décimo é convite a uma escolha política.

> **Tese final da coletânea:** A internet dos agentes está sendo
> construída agora, por pessoas vivas, com decisões que ficarão por
> décadas. Quem entende protocolo, identidade, observabilidade e
> segurança em rede agêntica não está só fazendo engenharia — está
> escrevendo a constituição da próxima camada da web. NEXUS PROTOCOL
> é um manual técnico; mas, lido inteiro, é também um chamado para
> participar do processo enquanto ainda há espaço para influenciá-lo.

---

## Checklist Canônico — Federação Agêntica em Escala

- [ ] Estratégia de discovery (interno + federado) documentada.
- [ ] Conformidade com pelo menos um trust framework setorial relevante.
- [ ] Plano de identidade compatível com cross-org federation.
- [ ] Compliance bundle (LGPD/AI Act/setor) embarcado em interações cross-border.
- [ ] Participação ativa em ao menos um fórum de governança aberta.
- [ ] Heterogeneidade de modelo: stack roda em ≥2 provedores.
- [ ] Política antitrust interna sobre uso de registries dominantes.
- [ ] Rails de pagamento para skills monetizadas testados em produção.
- [ ] Plano para agent-mediated UX em produtos voltados ao usuário final.
- [ ] Risk register sistêmico com monocultura, captura e colapso de cauda.

## Glossário do Volume

- **ASO** — Agent Search Optimization, equivalente agêntico de SEO.
- **Federated directories** — registros setoriais com protocolo de federação.
- **Reputation bridge** — mecanismo de portabilidade de reputação entre registros.
- **Compliance bundle** — pacote declarativo de conformidades atendidas.
- **Agent-mediated UX** — experiência onde o humano fala com agente, não com UI.
- **Monocultura de modelo** — risco sistêmico de homogeneidade de provedor.
- **Outcome-based billing** — cobrança vinculada a resultado validado.
- **Capability-based DHT** — descoberta P2P por descrição semântica.

## Fechamento da Coletânea

Este volume encerra **NEXUS PROTOCOL — 10 Protocolos Canônicos IA-to-IA**.
A jornada partiu de **MCP** (como agentes leem o mundo), passou por **A2A**
(como falam entre si), **ACP e padrões** (qual aposta fazer), **memória**
(o que lembrar e o que esquecer), **consenso** (como decidir juntos),
**tool federation** (como compartilhar capacidades), **identidade** (como
confiar), **evals** (como saber se está funcionando), **segurança** (como
sobreviver a ataques) e chega aqui: a **federação em escala
civilizacional**.

Releia o Volume I com os olhos do leitor que você se tornou: o que parecia
detalhe técnico de uma camada de baixo nível agora é peça constituinte de
uma transformação maior. MCP não é um protocolo entre outros; é a primeira
linha de uma constituição em escrita.

---

*NEXUS PROTOCOL · Volume X · Edição Canônica 1.0.0 · 2026-06-08*
*MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*

*Fim da coletânea.*
