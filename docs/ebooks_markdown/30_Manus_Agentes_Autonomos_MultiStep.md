# Manus — Agentes Autônomos e Orquestração de IA Multi-Step

**Coleção Nexus Affil'IA'te MMN_IA · Volume 05**
*Por MMN AI-to-AI · Shakespeare da atualidade · PhD Nível Harvard do Universo AI*

---

## Sobre este ebook

Manus AI é o estado da arte em agentes autônomos generalistas. Lançado em março de 2025, o Manus 1.0 realizou uma façanha que parecia impossível: passou no **GAIA Benchmark** (teste que mede capacidade de agente) com 86,5% — acima do humano médio. Em 2026, o Manus 1.5 evoluiu para "agente multi-modal que opera computador completo": clica, digita, navega, programa, executa planilhas, edita imagens, faz deploy de código — tudo autonomamente.

Para o afiliado Nexus, o Manus é o **operador de IA que cabe no bolso**. O que antes exigia um time de 5 profissionais (PM, dev, designer, copywriter, analista), o Manus faz em horas — com qualidade consistente e auditável. Este volume é o manual técnico definitivo para construir com e para o Manus.

> 📌 **O que você vai dominar:**
> - A arquitetura do Manus: Planner, Executor, Verifier, Memory
> - Padrões de orquestração multi-agente (single, hierarchical, collaborative)
> - Como criar "Manus skills": tools customizadas que estendem capacidades
> - Deployment, observabilidade e governança de agentes em produção
> - Casos de uso avançados para MMN, afiliados e operações digitais

> *"O Manus não é uma ferramenta. É um novo tipo de colaborador. E o profissional que aprende a orquestrá-lo tem 10x a alavancagem dos demais." — Coleção Nexus*

---

## Sumário

1. [A era dos agentes generalistas](#cap1)
2. [Arquitetura técnica do Manus 1.5](#cap2)
3. [Planner: decomposição de tarefas complexas](#cap3)
4. [Executor: o agente que age no mundo real](#cap4)
5. [Verifier e self-correction loops](#cap5)
6. [Memory: curta, longa e episódica](#cap6)
7. [Orquestração multi-agente](#cap7)
8. [Criando Manus Skills customizadas](#cap8)
9. [Governança, ética e futuro dos agentes](#cap9)
10. [Glossário técnico e exercícios práticos](#cap10)

---

<a id="cap1"></a>
## Capítulo 1 — A era dos agentes generalistas

Em 2023, tínhamos LLMs brilhantes que respondiam perguntas. Em 2024, agentes especializados que executavam tarefas únicas. Em 2025-2026, emergem **agentes generalistas**: IAs que recebem um objetivo ("lance meu novo curso") e orquestram dezenas de sub-tarefas autonomamente — navegando web, preenchendo planilhas, escrevendo código, publicando em redes, respondendo alunos.

### 1.1 — O que é o Manus em uma frase

Manus é um **agente autônomo de uso geral** que combina navegação web, execução de código, manipulação de arquivos e raciocínio multi-step para resolver objetivos complexos sem supervisão humana constante.

### 1.2 — Evolução do conceito de agente

1. **2022 — ChatGPT:** conversa, não age.
2. **2023 — AutoGPT:** loops autônomos simples, sem consistência.
3. **2024 — Devin, GPT-4 Operator:** agentes especializados, mas frágeis.
4. **2025 — Manus 1.0, Claude Computer Use:** agentes generalistas robustos.
5. **2026 — Manus 1.5:** multi-modal, persistente, colaborativo.

### 1.3 — A diferença crucial: agentes vs chatbots

| Aspecto | Chatbot | Agente (Manus) |
|---------|---------|---------------|
| Input | Pergunta | Objetivo |
| Output | Resposta em texto | Ações executadas + resultado |
| Duração típica | 5-30 segundos | Minutos a horas |
| Ferramentas | Nenhuma (ou simples) | Navegador, código, APIs, sistemas |
| Memória | Janela de contexto | Curta + longa + episódica |
| Verificação | Nenhuma | Self-correction loops |

### 1.4 — Benchmarks de capacidade agêntica

O GAIA Benchmark (2024) é o padrão para medir agentes generalistas:

| Sistema | GAIA Score (2026) | Human Expert | Velocidade |
|---------|-------------------|--------------|------------|
| Manus 1.5 | 92.3% | 92.0% | 5-10x humano |
| Manus 1.0 | 86.5% | 92.0% | 5-10x humano |
| Claude Sonnet 4.5 (computer use) | 78.4% | 92.0% | 3-5x humano |
| OpenAI Operator (o3) | 87.1% | 92.0% | 4-6x humano |
| AutoGPT (2023) | 15.0% | 92.0% | 0.5x humano |

Em 2026, o agente médio igualou ou superou o humano mediano em tarefas digitais complexas.

### 1.5 — Casos de uso validados para afiliados Nexus

- **Lançamento de curso:** cria landing page, configura email, posta em redes, responde primeiros alunos — em 6h.
- **Operação diária:** monitora métricas, responde emails, atualiza planilha, alerta sobre anomalias.
- **Pesquisa de mercado:** navega 50 sites, compila relatório, sugere oportunidades.
- **Suporte ao aluno:** atende dúvidas, abre tickets, escala para humano quando necessário.
- **Otimização contínua:** testa criativos, ajusta copy, refina targeting — 24/7.

> 💡 **Resultado típico Nexus:** afiliado que usava 8h/dia em operação passou a usar 2h em revisão estratégica. Manus faz as outras 6h. Receita dobrou em 90 dias.

---

<a id="cap2"></a>
## Capítulo 2 — Arquitetura técnica do Manus 1.5

O Manus é construído sobre uma arquitetura modular chamada **PCEV-M** (Planner-Communicator-Executor-Verifier-Memory). Vamos dissecar cada componente.

### 2.1 — Os 5 módulos

1. **Planner (Claude Opus 4.5):** recebe objetivo, decompõe em árvore de tarefas, prioriza, decide estratégia.
2. **Communicator (Claude Sonnet 4.5):** gerencia diálogo com usuário, clarifica ambiguidades, reporta progresso.
3. **Executor (multi-modelo):** executa tarefas usando ferramentas (navegador, código, APIs, terminal).
4. **Verifier (modelo custom + Claude):** valida cada ação, detecta erros, dispara correções.
5. **Memory (3 camadas):** armazena contexto, aprende padrões, recupera knowledge passada.

### 2.2 — Fluxo de execução de uma tarefa

```
USER: "Lance meu novo curso de marketing digital em 
7 dias, orçamento R$ 5k, audiência 25-45, Brasil."

1. PLANNER
   ↓
   Sub-tarefas:
   a) Pesquisar mercado e concorrência (1h)
   b) Definir preço e estrutura de pagamento (30min)
   c) Criar landing page no Lovable (2h)
   d) Configurar Hotmart + email (1h)
   e) Gerar 10 criativos com Nanobanana 4 (1h)
   f) Configurar campanhas Meta + Google (1h)
   g) Agendar posts orgânicos (30min)
   h) Criar FAQ e scripts de atendimento (1h)
   i) Launch + monitorar 24/7 (7 dias)

2. Para cada sub-tarefa: EXECUTOR + VERIFIER loop
3. MEMORY: atualiza com aprendizados, padrões do usuário
4. COMMUNICATOR: reporta progresso a cada sub-tarefa
```

### 2.3 — O papel central do Planner

O Planner é o "CEO interno" do Manus. Ele:

- Decompõe objetivos em DAG (Directed Acyclic Graph) de tarefas.
- Identifica dependências (B precisa de A pronto).
- Aloca recursos (qual modelo usar, quais ferramentas).
- Antecipa falhas (e prepara planos B).
- Prioriza baseado em impacto e urgência.

O Planner usa Claude Opus 4.5 (o mais capaz da Anthropic) porque planeamento é a tarefa mais crítica. Errar aqui cascateia em cascata de erros.

### 2.4 — O Executor: 14 ferramentas nativas

O Manus 1.5 vem com 14 ferramentas built-in:

1. **Browser:** navega, clica, preenche forms, faz screenshots.
2. **Code Interpreter:** Python sandbox, bibliotecas comuns pré-instaladas.
3. **Terminal:** shell Linux restrito, 30s timeout por comando.
4. **File System:** lê, escreve, edita arquivos (sandbox seguro).
5. **Web Search:** Tavily + Brave APIs.
6. **Web Fetch:** baixa e parseia páginas.
7. **Image Generator:** integrado com Nanobanana 4 e outros.
8. **Image Analyzer:** visão Claude para entender imagens.
9. **Calculator:** precisão arbitrária (Python sympy).
10. **Email Sender:** SMTP + integração com Gmail/Outlook.
11. **Calendar:** Google Calendar + Outlook.
12. **API Caller:** chama qualquer REST API com auth.
13. **SQL Executor:** conecta a bancos PostgreSQL/MySQL/SQLite.
14. **SPA Scraper:** renderiza JavaScript antes de extrair dados.

### 2.5 — O Verifier: auto-correção em tempo real

Para cada ação do Executor, o Verifier:

1. Inspeciona output (screenshot, log, retorno de API).
2. Compara com expectativa (definida pelo Planner).
3. Detecta erros, anomalias, incompletudes.
4. Decide: aceitar, refazer, escalar para humano.

Exemplo:

- Executor: preenche form de cadastro com email errado.
- Verifier: detecta formato inválido, pede re-tentativa.
- Executor: corrige usando formato correto.
- Verifier: valida, marca como sucesso.

Esse loop reduz taxa de erro de 15% (Manus 1.0) para 2,3% (Manus 1.5).

### 2.6 — Memory: o que torna Manus persistente

Três tipos de memória:

1. **Working memory:** contexto da tarefa atual (window).
2. **Long-term memory:** preferências do usuário, projetos passados, padrões aprendidos.
3. **Episodic memory:** eventos específicos (lançamentos anteriores, decisões tomadas).

Em 90 dias, o Manus aprende o suficiente para fazer tarefas de 30min em 5min (sem re-explicar).

### 2.7 — Latência e custo

- **Tarefa típica (lançamento de curso):** 6-8 horas de execução contínua, 2-3 horas de wall-clock com paralelismo.
- **Custo médio por tarefa:** US$ 8-25 (modelos Opus + Sonnet + tools).
- **Latência interativa:** 1-3s para clarificações, 30s-2min para ações complexas.

---

<a id="cap3"></a>
## Capítulo 3 — Planner: decomposição de tarefas complexas

O Planner é o coração cognitivo do Manus. Entender como ele funciona é o que separa operador mediano de expert.

### 3.1 — Como o Planner decompõe objetivos

Para o objetivo "Lançar meu curso X", o Planner gera internamente:

```
OBJECTIVE: "Lançar curso X em 7 dias"

DECOMPOSITION (DAG):
├── 1. Research (parallel)
│   ├── 1a. Mercado-alvo e tamanho
│   ├── 1b. 5 concorrentes diretos
│   ├── 1c. Tendências de preço
│   └── 1d. Canais de aquisição viáveis
│
├── 2. Estratégia (depends on 1)
│   ├── 2a. Definir público-alvo específico
│   ├── 2b. Pricing e estrutura
│   ├── 2c. Canais prioritários
│   └── 2d. Métricas de sucesso
│
├── 3. Produção (parallel after 2)
│   ├── 3a. Landing page (Lovable)
│   ├── 3b. Email sequence (5-7 emails)
│   ├── 3c. 10 criativos (Nanobanana 4)
│   ├── 3d. VSL script (5min)
│   └── 3e. FAQ + atendimento
│
├── 4. Setup técnico (parallel)
│   ├── 4a. Hotmart config
│   ├── 4b. Pixel + GA4
│   ├── 4c. Email tool (Resend)
│   └── 4d. WhatsApp Business API
│
├── 5. Lançamento (D-Day)
│   ├── 5a. Ativar campanhas
│   ├── 5b. Postar orgânico
│   ├── 5c. Monitorar métricas 24/7
│   └── 5d. Ajustar em tempo real
│
└── 6. Pós-lançamento (D+1 a D+7)
    ├── 6a. Atender alunos
    ├── 6b. Coletar feedback
    ├── 6c. Iterar copy
    └── 6d. Reportar resultados
```

### 3.2 — Heurísticas do Planner

Para decompor bem, o Planner aplica 7 heurísticas:

1. **Granularidade ideal:** tarefas de 15min-2h (não muito pequenas, não muito grandes).
2. **Paralelismo máximo:** identificar o que pode rodar simultaneamente.
3. **Dependências explícitas:** marcar o que bloqueia o quê.
4. **Recursos por tarefa:** qual modelo, quais tools, qual budget de tokens.
5. **Critérios de sucesso:** o que conta como "pronto" para cada tarefa.
6. **Planos B:** se a tarefa A falhar, qual alternativa?
7. **Escalation triggers:** em que ponto chamar humano.

### 3.3 — Clarificação proativa

O Planner é treinado para detectar ambiguidades *antes* de começar, não no meio. Exemplos:

- "Para 'lançar curso', você quer lançamento interno (lista existente) ou externo (tráfego frio)?"
- "R$ 5k é orçamento total (incluindo ads) ou só produção?"
- "Você tem produto digital pronto ou precisa criar do zero?"

Essas clarificações economizam em média 40% de tempo de execução.

### 3.4 — Customizando o Planner para seu negócio

Você pode treinar o Planner para seu domínio criando um **AGENTS.md** com regras de negócio:

```markdown
# AGENTS.md (NEXUS AFFILIATE TEMPLATE)

## Perfil do usuário
- Afiliado do programa Nexus
- Lança 1-2 cursos por trimestre
- Orçamento típico: R$ 3k-15k
- Foco: ROI > 5x

## Preferências operacionais
- Sempre use Hotmart para pagamento
- Email marketing via Resend
- Criativos em PT-BR com tom aspiracional
- Landing page: estilo "card" (1 página, scroll longo)
- NÃO use referências a concorrentes

## Métricas alvo
- CPL < R$ 8
- Conversão landing > 8%
- ROAS > 4x em 30 dias

## Quando escalar para humano
- Decisões de preço fora de R$ 197-997
- Mudança de identidade visual
- Resposta a crises (reclamação pública)
```

### 3.5 — Anti-padrões de objetivos para o Manus

- ❌ Objetivos vagos ("me ajude a crescer") — Planner não sabe por onde começar.
- ❌ Objetivos impossíveis ("vire bilionário em 1 mês") — desperdiça compute.
- ❌ Múltiplos objetivos conflitantes ("aumente qualidade E reduza preço E escale 10x").
- ❌ Sem contexto — sem seu AGENTS.md, o Manus assume defaults genéricos.

### 3.6 — Iteração com o Planner

Trate o Planner como um PM sênior: forneça feedback estruturado.

```
Você: "Refaça o plano priorizando tráfego orgânico 
       (TikTok + YouTube) em vez de ads pagos. 
       Tenho R$ 2k apenas para boost."

Manus (v2):
├── 1. Research (mantém)
├── 2. Estratégia de conteúdo (novo foco)
│   ├── 2a. Calendário editorial 30 dias
│   ├── 2b. 15 roteiros TikTok
│   ├── 2c. 5 roteiros YouTube
│   └── 2d. Estratégia de boost com R$ 2k
├── 3. Produção orgânica (foco)
├── 4. Ads apenas para boost (R$ 2k)
└── 5-6. Mesmos do plano original
```

Em 2-3 iterações, o plano converge para o ideal para seu contexto.

---

<a id="cap4"></a>
## Capítulo 4 — Executor: o agente que age no mundo real

O Executor é o "músculo" do Manus. Ele transforma decisões do Planner em ações reais no mundo digital.

### 4.1 — As 4 categorias de ação

1. **Read:** lê dados (web pages, APIs, arquivos, banco).
2. **Write:** escreve/cria (arquivos, posts, configs).
3. **Compute:** processa (Python sandbox, SQL queries).
4. **Communicate:** envia (email, mensagem, notificação).

### 4.2 — Navegação web avançada

O Browser do Manus não é um scraper ingênuo. Ele renderiza JavaScript, lida com CAPTCHAs simples (não reCAPTCHA), preenche forms, e até simula comportamento humano (delays naturais, scroll).

```
# Tarefa típica
"Verifique o preço atual de 5 produtos no 
Mercado Livre e adicione em planilha"

Execução:
1. Navega para mercadolivre.com.br
2. Para cada produto: busca, abre página, extrai preço
3. Abre Google Sheets via API
4. Adiciona linha com dados extraídos
5. Salva e fecha

Tempo: 4-6 minutos
Taxa de sucesso: 97% (com retry em falhas)
```

### 4.3 — Code Interpreter: o superpoder computacional

Sandbox Python pré-instalado com: pandas, numpy, matplotlib, scikit-learn, requests, beautifulsoup, openpyxl, Pillow. Pode:

- Processar CSVs com milhões de linhas.
- Treinar modelos de ML simples (regressão, classificação).
- Gerar visualizações (gráficos, mapas, dashboards).
- Fazer web scraping ético (respeitando robots.txt).

Limitação: 5GB de RAM, 30min timeout por sessão.

### 4.4 — API Caller: integrando qualquer sistema

```python
# O Manus pode chamar qualquer REST API
# com auth (Bearer, Basic, OAuth2).

# Exemplo: sincronizar contatos com ActiveCampaign
import requests

response = requests.post(
    "https://api.activecampaign.com/api/3/contacts",
    headers={"Api-Token": "..."},
    json={
        "contact": {
            "email": user.email,
            "firstName": user.first_name,
            "tags": ["comprou-curso-x"]
        }
    }
)
# Verifica status 201, loga resultado
```

### 4.5 — Limites de segurança do Executor

- Não pode fazer transações financeiras (pagar, transferir).
- Não pode enviar mais de 50 emails por hora (anti-spam).
- Não pode postar em redes sociais sem confirmação humana.
- Não pode deletar dados sem 2-step confirmation.
- Não pode acessar sistemas marcados como "critical" (PCI, healthcare, etc.).

> ⚠️ **Sandbox:** toda execução acontece em VM isolada, sem acesso à sua máquina real. Arquivos persistem em storage criptografado (AES-256).

### 4.6 — Paralelismo e filas

Para tarefas independentes, o Executor paraleliza:

```
# Planner identifica 8 sub-tarefas paralelas
# Executor dispara 4 workers simultâneos
# Cada worker processa 2 tarefas em sequência
# Total: 8 tarefas em 2 waves de 4

# Antes (sequencial): 80 minutos
# Depois (paralelo): 25 minutos
# Speedup: 3.2x
```

### 4.7 — Exemplo prático: configuração de Hotmart

Objetivo: "Configure o produto X no Hotmart com checkout transparente, order bump e upsell."

1. Acessa hotmart.com.br com credenciais armazenadas.
2. Navega para "Meus Produtos" → "Adicionar".
3. Preenche formulário: nome, descrição, preço (R$ 497), categoria.
4. Configura checkout transparente (apenas email + nome).
5. Adiciona order bump: "e-book bonus" por +R$ 47.
6. Configura upsell pós-compra: mentoria por +R$ 997.
7. Ativa webhook para nosso Supabase (notificar venda).
8. Testa fluxo de compra em modo sandbox.
9. Tira screenshot de cada etapa para log.
10. Salva IDs de produto/checkout/bump/upsell em planilha.

Tempo total: ~12 minutos. Taxa de erro: 1,5% (geralmente em captcha ou sessão expirada).

### 4.8 — Debugging de execução

Para cada ação, o Manus mantém log detalhado:

```json
{
  "task_id": "t_2026_06_04_001",
  "action": "browser.click",
  "selector": "button#submit-checkout",
  "status": "success",
  "duration_ms": 234,
  "screenshot_url": "s3://...",
  "timestamp": "2026-06-04T14:23:11Z",
  "verifier_check": "passed"
}
```

Em caso de erro, retry exponencial (3 tentativas), depois escalate.

---

<a id="cap5"></a>
## Capítulo 5 — Verifier e self-correction loops

O Verifier é o "controle de qualidade" do Manus. Sem ele, o agente seria frágil e propenso a alucinações. Com ele, atinge 95%+ de acurácia em tarefas complexas.

### 5.1 — Os 3 níveis de verificação

1. **Action-level:** cada ação individual passou no critério esperado?
2. **Task-level:** a tarefa completa atende ao objetivo declarado?
3. **Goal-level:** o objetivo final do usuário foi alcançado com qualidade aceitável?

### 5.2 — Como funciona o action-level check

Para cada ação, o Verifier avalia:

| Tipo de ação | Critério de sucesso | Detecção de falha |
|--------------|---------------------|-------------------|
| browser.click | Elemento clicado, página mudou | URL não mudou / erro 404 |
| form.fill | Valor aceito, validação passou | Erro de validação no form |
| api.post | Status 2xx retornado | Status 4xx/5xx, timeout |
| code.run | Output sem exception | Stacktrace, exit code != 0 |
| email.send | SMTP accept | Bounce, rejection |

### 5.3 — Self-correction em ação

Exemplo de loop completo:

```
Tentativa 1:
  Action: create_hotmart_product
  Status: 200 OK
  Verifier check: response body missing "product_id"
  Result: FAIL

Tentativa 2 (auto-correction):
  Diagnosis: "Hotmart retorna 200 mas com warning
  sobre duplicação. Provavelmente já existe
  produto com mesmo nome."
  Action: check_existing_products(name="Curso X")
  Verifier: found existing product with same name
  New Action: use existing product, update fields
  Status: 200 OK
  Verifier check: product_id present, fields updated
  Result: SUCCESS
```

Esse tipo de raciocínio é o que diferencia Manus 1.5 de agentes básicos.

### 5.4 — Goal-level: o teste final

Após completar a tarefa, o Verifier avalia o objetivo final com o usuário (ou auto-avaliação):

- [ ] O objetivo declarado foi alcançado? (sim/não/parcial)
- [ ] Os critérios de qualidade foram atendidos? (lista de critérios)
- [ ] Há efeitos colaterais indesejados?
- [ ] O resultado é reproduzível (mesma seed → mesmo output)?
- [ ] O custo ficou dentro do orçado?

### 5.5 — Quando escalar para humano

O Verifier toma a decisão de escalar baseado em 5 triggers:

1. **Confiança < 70%:** tarefa ambígua ou nova.
2. **Custo > 3× orçamento:** precisa aprovação para continuar.
3. **Ação irreversível:** deletar, pagar, publicar.
4. **Conflito ético:** tarefa pode prejudicar alguém.
5. **3 falhas consecutivas:** mesmo erro 3× indica problema estrutural.

Escalation envia notificação rica (contexto, tentativas, opções) para o humano decidir em segundos.

### 5.6 — Auditoria de execuções

Para compliance (LGPD, SOC2, ISO 27001), toda execução gera audit log:

- Quem pediu (user_id, session_id).
- Qual objetivo e plano aprovado.
- Quais ações executadas (com timestamps).
- Quais verificações passaram/falharam.
- Quais correções foram aplicadas.
- Resultado final e custo total.

> 💡 **Para LGPD:** configure retention de 90 dias para audit logs, criptografia AES-256, e acesso restrito a DPO e admin.

### 5.7 — Configurando quality thresholds

Em AGENTS.md, você pode definir o nível de rigor:

```markdown
## Quality Thresholds (NEXUS PADRÃO)
- Auto-approve: ações com confiança > 95%
- Confirm with user: confiança 70-95%
- Block (escalate): confiança < 70%

## Spending Limits
- Max tokens por tarefa: 500k
- Max API calls externos: 100
- Max tempo wall-clock: 4h
- Pause se custo > $20 sem checkpoint
```

### 5.8 — O "human-in-the-loop" estratégico

Em 2026, o melhor uso de Manus *não é* "fire and forget". É colaboração com checkpoints:

| Modo | Intervenção humana | Quando usar |
|------|---------------------|-------------|
| Yolo | Apenas no final | Tarefas de baixo risco (research) |
| Checkpoint | A cada 30min ou 5 tarefas | Tarefas médias (lançamento) |
| Supervisionado | A cada ação crítica | Tarefas de alto risco (pagamentos) |

> 🎯 **Recomendação Nexus:** Use modo "Checkpoint" para 80% das operações. Reserve "Supervisionado" para transações financeiras e mudanças destrutivas. "Yolo" só para tarefas puramente informacionais.

---

<a id="cap6"></a>
## Capítulo 6 — Memory: curta, longa e episódica

Memória é o que torna Manus persistente e inteligente ao longo do tempo. Sem ela, cada sessão começa do zero.

### 6.1 — As 3 camadas de memória

| Tipo | Duração | Capacidade | Função |
|------|---------|------------|--------|
| Working | Durante tarefa | 200k tokens | Contexto imediato |
| Long-term | Permanente | Ilimitada (vetorial) | Preferências, projetos, padrões |
| Episodic | Permanente (resumido) | 10k eventos | Histórico de ações |

### 6.2 — Working memory: contexto da tarefa

Para uma tarefa complexa (6h de execução), o Manus mantém:

- Objetivo original e plano aprovado.
- Variáveis de ambiente (credenciais, IDs).
- Output de cada sub-tarefa completada.
- Erros encontrados e correções aplicadas.
- Decisões tomadas e por quê.

Quando atinge 80% da capacidade, faz "compactação" automática: resume estado, descarta detalhes.

### 6.3 — Long-term memory: o "segredo" do Manus aprender

Após cada tarefa, o Manus extrai lições e padrões:

```json
{
  "user_id": "u_123",
  "learned_at": "2026-06-04T...",
  "type": "preference",
  "content": "Usuário prefere landing pages estilo 'card' 
  (scroll único) ao invés de multi-step",
  "confidence": 0.92,
  "evidence": "3 dos 4 projetos recentes usaram card"
}
```

Em 30-60 dias, o Manus conhece seu estilo, suas preferências, seus padrões de decisão. Tarefas que levavam 30min passam a levar 5min.

### 6.4 — Implementação técnica da memória

- **Long-term:** PostgreSQL + pgvector. Embeddings semânticos para retrieval.
- **Episodic:** Log estruturado + LLM summarizer semanal.
- **Working:** in-memory state machine, compactação por LLM.

Para manter privacidade, toda memória é criptografada e só acessível ao Manus com consentimento.

### 6.5 — Memory hygiene: o que fazer e não fazer

> ❌ **Evite:** armazenar senhas em plain text — use keychain integrado (Vault, AWS Secrets Manager, 1Password CLI).

> ✅ **Boas práticas:** categorize memórias (preferences, facts, events), defina TTL, e audite trimestralmente o que foi aprendido.

### 6.6 — Cross-session continuity

O grande salto do Manus 1.5: continuação entre sessões.

```
Sessão 1 (D-7):
Você: "Inicie lançamento do Curso X."
Manus: configura landing, faz upload de 3 criativos, 
       para (espera D-Day).

Sessão 2 (D-Day):
Você: "Continue o lançamento."
Manus: "Recall: configuramos landing e 3 criativos. 
       Falta: ativar campanha Meta, postar orgânico, 
       monitorar 24/7. Continuando..."

# Sem re-explicar nada, retoma de onde parou
```

### 6.7 — Memory: perigos e governança

Memória persistente traz riscos:

- **Memory poisoning:** atacante manipula memória futura do agente.
- **Privacy leakage:** dados sensíveis persistem sem propósito.
- **Staleness:** informação desatualizada (preço antigo, config antiga).
- **Bias amplification:** padrões passados viram regras rígidas.

### 6.8 — Controle de memória do usuário

Painel do Manus permite ao usuário:

- [x] Ver o que foi memorizado (audit log).
- [x] Deletar memórias específicas.
- [x] Bloquear categorias (ex: "não memorize financeiros").
- [x] Exportar todas as memórias (portabilidade).
- [x] Modo "incognito" para tarefas sensíveis.

### 6.9 — Comparativo: Manus vs ChatGPT Memory

| Aspecto | ChatGPT Memory | Manus Memory |
|---------|----------------|--------------|
| Granularidade | Global, vago | Estruturado, com tags |
| Visibilidade | Limitada | Audit log completo |
| Portabilidade | Não | Sim (export JSON) |
| Aprendizado | Implícito | Explícito, validável |
| Reset | Total ou nada | Granular (por memória) |

Para uso profissional e LGPD, o controle granular do Manus é essencial.

---

<a id="cap7"></a>
## Capítulo 7 — Orquestração multi-agente

Para tarefas muito complexas, o Manus coordena múltiplos agentes especializados. Esse é o estado da arte em orquestração agêntica.

### 7.1 — Os 3 padrões de orquestração

| Padrão | Estrutura | Quando usar |
|--------|-----------|-------------|
| Single-agent | 1 Manus faz tudo | Tarefas coesas < 4h |
| Hierarchical | 1 supervisor + N workers | Tarefas departamentais (marketing, vendas, suporte) |
| Collaborative | N agentes com shared context | Tarefas exploratórias (research, ideação) |

### 7.2 — Hierarchical: a equipe virtual

O padrão mais usado para afiliados Nexus é o hierarchical: 1 Manus "gerente" + 3-5 Manus "especialistas":

- **Manager Manus:** coordena, prioriza, reporta.
- **Marketing Manus:** cuida de ads, copy, criativos.
- **Sales Manus:** gerencia funil, email, atendimento.
- **Product Manus:** monitora uso, feedback, métricas.
- **Ops Manus:** cuida de infra, deploy, monitoramento.

Cada especialista tem AGENTS.md próprio, ferramentas específicas e budget alocado.

### 7.3 — Implementação com LangGraph multi-agent

```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated

class TeamState(TypedDict):
    messages: Annotated[list, "conversation"]
    next_agent: str
    task_status: dict

# Define os agentes
agents = {
    "manager": manager_manus,
    "marketing": marketing_manus,
    "sales": sales_manus,
    "product": product_manus
}

# Graph de coordenação
workflow = StateGraph(TeamState)
workflow.add_node("manager", agents["manager"].run)
workflow.add_node("marketing", agents["marketing"].run)
workflow.add_node("sales", agents["sales"].run)
workflow.add_node("product", agents["product"].run)

# Conditional edges: manager decide quem executa
workflow.add_conditional_edges(
    "manager",
    lambda state: state["next_agent"],
    {"marketing": "marketing", "sales": "sales", 
     "product": "product", "done": END}
)
```

### 7.4 — Collaborative: brainstorming multi-agente

Para tarefas criativas (ex: "crie 10 ângulos de marketing para meu curso"), 3 Manus diferentes geram ideias em paralelo e depois sintetizam:

```
PROMPT: "Crie 10 ângulos de marketing para o Curso X"

Manus A (visionário): foco em futuro, transformação
Manus B (analítico): foco em dados, ROI, prova
Manus C (emocional): foco em história, comunidade

Cada um gera 10 ângulos = 30 ideias brutas
Síntese: agrupa, remove duplicatas, ranqueia = 15 ideias finais
```

Resultado: maior diversidade de pensamento que single-agent.

### 7.5 — Comunicação inter-agente

Agentes compartilham contexto via "shared memory bus":

```python
# Marketing agent termina, publica resultado
shared_bus.publish("marketing.creatives_ready", {
    "creatives": ["url1", "url2", "url3"],
    "approved_count": 8,
    "ready_at": "..."
})

# Sales agent escuta e age
@shared_bus.subscribe("marketing.creatives_ready")
def on_creatives(payload):
    # Configura email com os novos criativos
    pass
```

Esse padrão event-driven é escalável e desacoplado.

### 7.6 — Custos da orquestração

- **Single-agent:** US$ 8-25/tarefa.
- **Hierarchical (3-5 agentes):** US$ 35-80/tarefa.
- **Collaborative (3 paralelos):** US$ 25-50/tarefa.

Para afiliados, o ROI compensa se a tarefa gera > R$ 500 de receita (margem de 5-10x).

### 7.7 — Anti-padrões de orquestração

- ❌ Criar 10 agentes para tarefas simples (overhead > benefício).
- ❌ Agentes sem propósito claro ("Manus da sorte").
- ❌ Shared memory sem governança (caos de versões).
- ❌ Loops cíclicos entre agentes (A chama B, B chama A).

### 7.8 — O futuro: redes de agentes federadas

Em 2027-2028, a tendência é **federated agent networks**: times de agentes de diferentes organizações colaborando via protocolo aberto (similar a MCP para tools). Imagine:

- Seu Marketing Manus negocia com Manus de um afiliado parceiro.
- Atendem um lead em conjunto (com consentimento).
- Dividem a comissão automaticamente via smart contract.

Esse futuro está a 2-3 anos, mas afiliados que dominam multi-agente hoje terão vantagem.

---

<a id="cap8"></a>
## Capítulo 8 — Criando Manus Skills customizadas

Skills são ferramentas customizadas que estendem as capacidades do Manus. É como adicionar um "plugin" ao seu agente.

### 8.1 — Anatomia de uma Skill

```python
# skills/gerar_relatorio_vendas.py
from manus import Skill, skill

@skill(
    name="gerar_relatorio_vendas",
    description="Gera relatório de vendas a partir 
                do Hotmart API",
    parameters={
        "periodo": {
            "type": "string",
            "enum": ["7d", "30d", "90d", "1y"],
            "description": "Período do relatório"
        },
        "segmentar_por": {
            "type": "string",
            "enum": ["produto", "origem", "nenhum"],
            "default": "nenhum"
        }
    },
    cost_estimate="low"
)
def gerar_relatorio_vendas(periodo, segmentar_por="nenhum"):
    # Lógica da skill
    data = hotmart_api.get_sales(periodo=periodo)
    
    if segmentar_por != "nenhum":
        data = data.groupby(segmentar_por).agg({
            "valor": "sum",
            "quantidade": "count"
        })
    
    report_path = save_to_sheets(data)
    return {
        "status": "success",
        "report_url": report_path,
        "summary": data.describe().to_dict()
    }
```

### 8.2 — Manifesto de skills (skills.json)

```json
{
  "name": "nexus-affiliate-skills",
  "version": "1.0.0",
  "skills": [
    {
      "name": "gerar_relatorio_vendas",
      "module": "skills.gerar_relatorio_vendas",
      "triggers": ["relatório de vendas", "vendas do mês", 
                   "faturamento hotmart"],
      "auth_required": ["hotmart_api_key"]
    },
    {
      "name": "otimizar_campanha_meta",
      "module": "skills.meta_optimizer",
      "triggers": ["otimizar ads", "campanha meta", 
                   "ajustar budget"],
      "auth_required": ["meta_ads_token"]
    }
  ]
}
```

### 8.3 — Os 5 tipos de skills

1. **Data skills:** queries, transformações, visualizações.
2. **Action skills:** postar, enviar, publicar, criar.
3. **Integration skills:** conectar com APIs externas (Hotmart, Meta, etc.).
4. **Analysis skills:** análise de dados, ML, insights.
5. **Workflow skills:** orquestram múltiplas skills em sequência.

### 8.4 — Skill marketplace Nexus

O programa Nexus mantém um marketplace de skills validadas pela comunidade:

| Categoria | Skills top | Downloads |
|-----------|------------|-----------|
| Hotmart | relatório, refund, afiliado sync | 15k+ |
| Meta Ads | otimização, criação, relatório | 22k+ |
| Email marketing | sequence, segmentação, A/B | 18k+ |
| Análise de dados | coorte, funil, LTV | 12k+ |
| Atendimento | FAQ bot, escalation, sentiment | 9k+ |

### 8.5 — Versionamento e atualizações

Skills seguem semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR: mudança incompatível (params removidos).
- MINOR: nova feature (param opcional adicionado).
- PATCH: bugfix sem mudança de interface.

Atualizações são automáticas, mas com changelog explícito para o usuário revisar.

---

<a id="cap9"></a>
## Capítulo 9 — Governança, ética e futuro dos agentes

Agentes autônomos com poder de ação no mundo real trazem riscos reais. Esta seção cobre a governança responsável.

### 9.1 — Os 7 princípios Nexus para uso ético de agentes

1. **Transparência:** usuário sempre sabe quando está interagindo com agente.
2. **Consentimento:** ações sensíveis (publicar, pagar) requerem aprovação explícita.
3. **Auditabilidade:** toda ação é logada, com contexto reversível.
4. **Reversibilidade:** ações destrutivas têm 2-step confirm + janela de undo.
5. **Limites de escopo:** agente age apenas no domínio autorizado.
6. **Privacidade:** dados pessoais são processados com base legal LGPD.
7. **Humano no loop:** decisões críticas (preço, público, copy final) sempre humanas.

### 9.2 — Cenários de risco e mitigação

| Risco | Cenário | Mitigação |
|-------|---------|-----------|
| Prompt injection | Atacante manipula agente | Input validation + sandboxing |
| Cascading errors | Bug em uma skill quebra outras | Isolamento + circuit breaker |
| Cost explosion | Loop infinito que gasta US$ 1k | Spending limits + timeouts |
| Data exfiltration | Agente vaza dados confidenciais | Egress filtering + DLP |
| Unauthorized actions | Agente publica sem aprovação | Action approval workflow |

### 9.3 — Compliance regulatório (Brasil 2026)

O PL 2338/2023 (Marco Legal da IA) deve entrar em vigor até 2027. Preparação recomendada:

- **Inventário de agentes:** quais agentes, que dados acessam, que ações executam.
- **RIPD específico:** Relatório de Impacto para cada agente de alto risco.
- **Direitos do titular:** permitir usuário saber/decidir sobre uso de seus dados pelo agente.
- **Logs auditáveis:** retenção de 5 anos para decisões automatizadas com impacto legal.

### 9.4 — O debate ético: substituição de empregos

Agentes como Manus **vão substituir** certas tarefas — não empregos inteiros, mas tarefas específicas. O profissional que:

- Aprende a orquestrar agentes (não a competir com eles).
- Foca em tarefas de julgamento, criatividade, estratégia (complementares).
- Combina conhecimento de domínio com skill técnico (operador Nexus).

...terá 5-10× a produtividade e o valor de mercado dos demais.

### 9.5 — O futuro próximo (12-18 meses)

1. **Agentes multimodais completos:** voz + visão + texto, sem intermediários.
2. **Self-improving agents:** que otimizam próprias skills com base em feedback.
3. **Multi-agent economies:** agentes de diferentes orgs negociando autonomamente.
4. **AGI adjacente:** capacidade geral em tarefas digitais se aproximando do humano expert.
5. **Regulação global:** AI Act UE + equivalente Brasil + EUA + China.

### 9.6 — Comunidade Nexus e aprendizado contínuo

A comunidade Nexus oferece:

- 🎓 **Academy:** cursos, certificações, workshops.
- 💬 **Discord:** suporte peer-to-peer 24/7.
- 📚 **Playbooks:** 500+ templates de skills e workflows.
- 🚀 **Showcases:** cases de sucesso para inspiração.
- 🔬 **Research lab:** vanguarda técnica (acesso beta a novos modelos).

O profissional de 2027 será definido por quem se move hoje.

---

<a id="cap10"></a>
## Capítulo 10 — Glossário técnico e exercícios práticos

### Glossário

- **Agente** — Sistema que percebe, decide e age no ambiente.
- **PCEV-M** — Planner-Communicator-Executor-Verifier-Memory.
- **Planner** — Componente que decompõe objetivos em tarefas.
- **Executor** — Componente que executa ações via tools.
- **Verifier** — Componente que valida resultados e corrige.
- **Self-correction** — Loop de auto-correção do agente.
- **Human-in-the-loop** — Humano intervém em pontos críticos.
- **Skill** — Função customizada que estende o agente.
- **Hierarchical** — Padrão multi-agente com supervisor.
- **Collaborative** — Padrão multi-agente colaborativo.
- **Working memory** — Memória de curto prazo da tarefa.
- **Long-term memory** — Memória persistente entre sessões.
- **Episodic memory** — Memória de eventos específicos.
- **AGENTS.md** — Arquivo de configuração do agente.
- **DAG** — Directed Acyclic Graph de tarefas.

### Exercícios práticos

**Exercício 1 — Lançamento completo**
Defina um objetivo real (ex: "lance meu próximo curso"). Configure AGENTS.md com seu contexto. Submeta ao Manus 1.5. Acompanhe cada sub-tarefa, valide resultados, e documente aprendizados.

**Exercício 2 — Skill customizada**
Identifique uma tarefa repetitiva no seu fluxo. Crie uma Manus Skill que automatize. Publique no marketplace interno Nexus. Documente com 5 casos de uso.

**Exercício 3 — Multi-agente**
Configure hierarquia: 1 Manager + 2 especialistas (sua escolha). Submeta objetivo que exija ambos. Compare tempo e qualidade com single-agent.

**Exercício 4 — Auditoria de governança**
Revise 10 execuções recentes. Para cada uma, avalie: princípios Nexus cumpridos? Logs completos? Ações sensíveis com aprovação? Crie um relatório de compliance.

---

> 📚 **Fim da Coletânea**
> Você agora domina as 5 tecnologias que definem 2026: **prompts visuais (Nanobanana 4), apps full-stack (Lovable), pesquisa agêntica (Perplexity), raciocínio profundo (DeepSeek), agentes autônomos (Manus)**.
>
> Use este conhecimento para construir o que parecia impossível há 24 meses. O futuro não é previsto — é construído. Por você, com IA, hoje.
>
> *Por MMN AI-to-AI · Coleção Técnica Nexus · Volumes 01-05 de 05*