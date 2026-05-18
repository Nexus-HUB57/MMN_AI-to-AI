import json
import os
import re
import sys
import urllib.request
import urllib.error

OWNER = "Nexus-HUB57"
REPO = "MMN_AI-to-AI"
API = f"https://api.github.com/repos/{OWNER}/{REPO}"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    print("Missing GITHUB_TOKEN", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": "mmn-agentic-issue-bootstrap"
}

LABELS = [
    ("type:epic", "5319e7"),
    ("type:feature", "0e8a16"),
    ("type:tech-debt", "d4c5f9"),
    ("type:security", "b60205"),
    ("type:compliance", "fbca04"),
    ("type:observability", "1d76db"),
    ("type:docs", "0075ca"),
    ("area:frontend", "c5def5"),
    ("area:backend", "bfd4f2"),
    ("area:database", "f9d0c4"),
    ("area:mobile", "c2e0c6"),
    ("area:agentic", "7057ff"),
    ("area:integrations", "fef2c0"),
    ("area:security", "b60205"),
    ("area:observability", "1d76db"),
    ("area:infra", "d4c5f9"),
    ("priority:P0", "d93f0b"),
    ("priority:P1", "fbca04"),
    ("priority:P2", "0e8a16"),
    ("priority:P3", "cccccc"),
    ("status:ready", "0e8a16"),
    ("status:blocked", "b60205"),
    ("status:in-progress", "1d76db"),
    ("status:needs-spec", "fbca04"),
    ("status:waiting-review", "5319e7"),
]

EPICS = [
    {
        "key": "EPIC-01",
        "title": "[EPIC-01] Estabilização dos contratos e runtime",
        "body": "## Objetivo\nFechar inconsistências entre frontend, backend, mobile, tipos compartilhados e runtime mínimo para criar uma base previsível para a evolução agentic.\n\n## Resultado esperado\n- build previsível\n- contratos tRPC coerentes\n- runtime mínimo estável\n- documentação alinhada ao estado real\n\n## Critérios de aceite\n- build web/backend/mobile sem erros bloqueantes\n- rotas críticas tRPC coerentes\n- remoção dos `any` críticos do cliente tRPC\n- health checks e workers básicos funcionando de forma previsível\n- documentação refletindo o estado real do runtime\n\n## Labels\n`type:epic`, `area:frontend`, `area:backend`, `area:mobile`, `priority:P0`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:frontend", "area:backend", "area:mobile", "priority:P0"]
    },
    {
        "key": "EPIC-02",
        "title": "[EPIC-02] Fundação do Control Plane Agentic",
        "body": "## Objetivo\nCriar a fundação mínima da camada agentic com estado, auditoria, fila dedicada e um primeiro fluxo orquestrado.\n\n## Resultado esperado\n- tabelas agentic criadas\n- queue/worker dedicados\n- primeiro fluxo orquestrado funcional\n- auditoria de execução disponível\n\n## Critérios de aceite\n- tabelas básicas da camada agentic criadas\n- queue/worker agentic operando separadamente das filas existentes\n- primeiro orquestrador funcional com fluxo simples\n- toda execução persistida em auditoria\n- dashboard mínimo de status disponível\n\n## Labels\n`type:epic`, `area:agentic`, `area:backend`, `area:database`, `priority:P0`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:agentic", "area:backend", "area:database", "priority:P0"]
    },
    {
        "key": "EPIC-03",
        "title": "[EPIC-03] Policy Engine, Judge e Human-in-the-Loop",
        "body": "## Objetivo\nCriar governança de risco antes de permitir ação externa relevante.\n\n## Resultado esperado\n- decisão pré-ação estruturada\n- gates de policy e budget\n- revisão humana para alto risco\n- saídas do judge persistidas e observáveis\n\n## Critérios de aceite\n- decisão pré-ação implementada\n- política e budget gates funcionando\n- revisão humana para ações de maior risco\n- saída do judge persistida e observável\n\n## Labels\n`type:epic`, `area:agentic`, `area:security`, `area:compliance`, `priority:P0`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:agentic", "area:security", "type:compliance", "priority:P0"]
    },
    {
        "key": "EPIC-04",
        "title": "[EPIC-04] Integrações externas e Tools Layer",
        "body": "## Objetivo\nEstruturar a camada de tools e conectar os primeiros canais externos de forma segura e observável.\n\n## Resultado esperado\n- contrato padronizado para tools\n- integração inicial com canal social e mensageria\n- retries e classificação de falhas\n- suppress list e governança de outbound\n\n## Critérios de aceite\n- contrato padronizado para tools\n- pelo menos um canal social e um canal de mensageria integrados em modo controlado\n- retries e falhas classificadas por provider\n- suppress list e conformidade mínima aplicadas onde necessário\n\n## Labels\n`type:epic`, `area:integrations`, `area:agentic`, `priority:P1`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:integrations", "area:agentic", "priority:P1"]
    },
    {
        "key": "EPIC-05",
        "title": "[EPIC-05] Memória, contexto e personalização",
        "body": "## Objetivo\nAdicionar memória operacional e semântica para melhorar coerência e personalização dos agentes.\n\n## Resultado esperado\n- memória episódica básica\n- recuperação semântica\n- personalização por afiliado/tenant/lead\n- integração com contexto interno\n\n## Critérios de aceite\n- memória episódica básica funcionando\n- estratégia de recuperação definida\n- personalização por contexto suportada\n- integração com orquestrador mínima viável\n\n## Labels\n`type:epic`, `area:agentic`, `area:database`, `priority:P1`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:agentic", "area:database", "priority:P1"]
    },
    {
        "key": "EPIC-06",
        "title": "[EPIC-06] Observabilidade, SRE e operação",
        "body": "## Objetivo\nDar visibilidade operacional ao sistema para que a camada agentic possa ser medida, operada e corrigida em produção.\n\n## Resultado esperado\n- métricas essenciais emitidas\n- dashboards mínimos publicados\n- alertas básicos funcionando\n- runbooks iniciais documentados\n\n## Critérios de aceite\n- métricas essenciais emitidas\n- dashboards mínimos publicados\n- alertas básicos funcionando\n- runbooks iniciais documentados\n\n## Labels\n`type:epic`, `area:observability`, `area:infra`, `priority:P0`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:observability", "area:infra", "priority:P0"]
    },
    {
        "key": "EPIC-07",
        "title": "[EPIC-07] Segurança, compliance e rollout produtivo",
        "body": "## Objetivo\nPreparar a camada agentic para uso real com consentimento, limites de risco, segurança operacional e rollout progressivo.\n\n## Resultado esperado\n- consentimento e opt-out incorporados\n- segredos e acessos endurecidos\n- rollout híbrido/supervisionado/controlado modelado\n- KPIs de beta definidos e acompanháveis\n\n## Critérios de aceite\n- consentimento e opt-out incorporados ao fluxo\n- segredos e acessos endurecidos\n- rollout híbrido/supervisionado/controlado modelado\n- KPIs de beta definidos e acompanháveis\n\n## Labels\n`type:epic`, `area:security`, `area:infra`, `priority:P0`\n\n## Checklist de issues filhas\n_Será preenchido automaticamente após criação das issues._",
        "labels": ["type:epic", "area:security", "area:infra", "priority:P0"]
    },
]

ISSUES = [
    {
        "key": "AG-01", "epic": "EPIC-01", "title": "[AG-01] Fechar type-safety tRPC no frontend e mobile",
        "labels": ["type:tech-debt", "area:frontend", "area:mobile", "area:backend", "priority:P0", "status:ready"],
        "body": "## Contexto\nSubstituir contratos frouxos por importação do `AppRouter` real e alinhar os clientes tRPC web/mobile ao contrato exportado pelo backend.\n\n## Escopo\n- revisar `frontend/src/lib/trpc.ts`\n- alinhar provider(s) web/mobile\n- validar exportação do `AppRouter` no backend\n\n## Critérios de aceite\n- `AppRouter = any` inexistente no frontend\n- hooks tRPC tipados sem casts manuais nos fluxos principais\n- cliente mobile alinhado ao mesmo contrato\n- `npm run build` sem erro de tipo relacionado ao cliente tRPC\n\n## Dependência\nEpic-pai: EPIC-01"
    },
    {
        "key": "AG-02", "epic": "EPIC-01", "title": "[AG-02] Corrigir divergências de rotas e payloads entre frontend e backend",
        "labels": ["type:tech-debt", "area:frontend", "area:backend", "priority:P0", "status:ready"],
        "body": "## Contexto\nMapear e corrigir rotas consumidas pelo frontend que divergem dos routers efetivamente expostos pelo backend, incluindo nomes, paths e formatos de retorno.\n\n## Critérios de aceite\n- documento de mapeamento contrato-atual vs contrato-correto anexado à issue\n- telas principais não dependem mais de rotas inexistentes\n- payloads retornados cobrem os campos realmente consumidos\n- smoke test das telas Home, Dashboard e conteúdo principal concluído\n\n## Dependência\nEpic-pai: EPIC-01"
    },
    {
        "key": "AG-03", "epic": "EPIC-01", "title": "[AG-03] Alinhar schema, queries e campos usados nas telas principais",
        "labels": ["type:feature", "area:database", "area:frontend", "area:backend", "priority:P0", "status:ready"],
        "body": "## Contexto\nRevisar campos usados por dashboard, perfil de afiliado e minissites para garantir aderência ao schema real ou criar projeções/aggregates consistentes.\n\n## Critérios de aceite\n- campos como totais, métricas de rede e earnings têm origem clara\n- nenhuma tela principal depende de campo fantasma\n- se necessário, novos endpoints agregados foram criados no backend\n- consultas documentadas no PR\n\n## Dependência\nEpic-pai: EPIC-01"
    },
    {
        "key": "AG-04", "epic": "EPIC-01", "title": "[AG-04] Endurecer autenticação e sessão para baseline operacional",
        "labels": ["type:security", "area:backend", "area:frontend", "area:security", "priority:P0", "status:ready"],
        "body": "## Contexto\nConsolidar a implementação atual de JWT/contexto tRPC, padronizando expiração, renovação, cookies, middleware e tratamento de sessão inválida.\n\n## Critérios de aceite\n- login/logout e recuperação de sessão com comportamento previsível\n- middlewares protegem rotas privadas de forma consistente\n- cookies e headers documentados\n- erros de autenticação retornam códigos e mensagens coerentes\n\n## Dependência\nEpic-pai: EPIC-01"
    },
    {
        "key": "AG-05", "epic": "EPIC-01", "title": "[AG-05] Validar runtime mínimo e saúde dos workers atuais",
        "labels": ["type:feature", "area:backend", "area:infra", "priority:P1", "status:ready"],
        "body": "## Contexto\nExecutar uma rodada de validação operacional do backend bootstrap, workers BullMQ e endpoints críticos, produzindo checklist de runtime.\n\n## Critérios de aceite\n- `/health` e rotas tRPC críticas validadas\n- workers sobem sem crash inicial\n- filas essenciais conseguem processar um job de teste\n- checklist anexado no PR ou issue\n\n## Dependência\nEpic-pai: EPIC-01"
    },
    {
        "key": "AG-06", "epic": "EPIC-02", "title": "[AG-06] Criar schema Drizzle da camada agentic",
        "labels": ["type:feature", "area:database", "area:agentic", "priority:P0", "status:ready"],
        "body": "## Contexto\nAdicionar schemas/migrações para `agent_sessions`, `agent_action_audit`, `agent_policies` e estrutura inicial de `agent_memories`.\n\n## Critérios de aceite\n- novas tabelas modeladas com chaves e índices mínimos\n- migrações geradas e aplicáveis\n- relacionamentos com `users` e `agents` definidos\n- documentação do schema incluída no PR\n\n## Dependência\nEpic-pai: EPIC-02"
    },
    {
        "key": "AG-07", "epic": "EPIC-02", "title": "[AG-07] Criar queue e worker dedicados para a camada agentic",
        "labels": ["type:feature", "area:backend", "area:agentic", "area:infra", "priority:P0", "status:ready"],
        "body": "## Contexto\nImplementar uma fila BullMQ própria para ciclos agentic, com retries, backoff, DLQ e controle de concorrência.\n\n## Critérios de aceite\n- queue agentic separada das filas de conteúdo/comissões\n- worker registra sucesso, retry e falha final\n- idempotência documentada\n- teste manual com job de exemplo executado com sucesso\n\n## Dependência\nEpic-pai: EPIC-02"
    },
    {
        "key": "AG-08", "epic": "EPIC-02", "title": "[AG-08] Implementar Marketing Orchestrator mínimo viável",
        "labels": ["type:feature", "area:agentic", "area:backend", "priority:P0", "status:ready"],
        "body": "## Contexto\nCriar o primeiro orquestrador com fluxo simples: análise -> geração -> avaliação -> decisão -> registro.\n\n## Critérios de aceite\n- orquestrador executa um fluxo mínimo ponta a ponta\n- estado da sessão é persistido\n- output do fluxo fica acessível para revisão operacional\n- erros não quebram o processo inteiro sem registro\n\n## Dependência\nEpic-pai: EPIC-02"
    },
    {
        "key": "AG-09", "epic": "EPIC-02", "title": "[AG-09] Registrar trilha auditável de todas as ações agentic",
        "labels": ["type:feature", "area:database", "area:agentic", "priority:P0", "status:ready"],
        "body": "## Contexto\nGarantir que cada ação tentada, aprovada, bloqueada ou executada gere um registro de auditoria com contexto mínimo.\n\n## Critérios de aceite\n- auditoria registra ação, payload resumido, resultado e decisão\n- vínculo com usuário/agente/sessão preservado\n- trilha pode ser consultada por endpoint interno ou tela administrativa\n- política de retenção inicial descrita\n\n## Dependência\nEpic-pai: EPIC-02"
    },
    {
        "key": "AG-10", "epic": "EPIC-02", "title": "[AG-10] Expor status agentic via tRPC e dashboard mínimo",
        "labels": ["type:feature", "area:frontend", "area:backend", "area:agentic", "priority:P1", "status:ready"],
        "body": "## Contexto\nCriar endpoint(s) tRPC para listar sessões, últimas ações e estado do agente, com tela mínima de monitoramento.\n\n## Critérios de aceite\n- operador consegue ver última execução e status atual do agente\n- dashboard exibe ações recentes e resultado básico\n- estados bloqueado/falha/executado aparecem visualmente\n- consultas não exigem acesso direto ao banco\n\n## Dependência\nEpic-pai: EPIC-02"
    },
    {
        "key": "AG-11", "epic": "EPIC-03", "title": "[AG-11] Implementar Judge pré-ação com decisão estruturada",
        "labels": ["type:feature", "area:agentic", "area:security", "priority:P0", "status:ready"],
        "body": "## Contexto\nCriar serviço de judge pré-ação com saída estruturada: `decision`, `risk_level`, `policy_hits`, `estimated_cost`, `needs_human_review`, `safe_rewrite`.\n\n## Critérios de aceite\n- saída validada por schema\n- estados approve/revise/block/escalate suportados\n- decisões persistidas em auditoria\n- integração com o orquestrador mínima viável\n\n## Dependência\nEpic-pai: EPIC-03"
    },
    {
        "key": "AG-12", "epic": "EPIC-03", "title": "[AG-12] Implementar Policy Gate configurável por tenant/agente",
        "labels": ["type:feature", "area:agentic", "area:database", "type:compliance", "priority:P0", "status:ready"],
        "body": "## Contexto\nCriar camada de políticas parametrizáveis para canais permitidos, quiet hours, temas bloqueados, revisão humana e limites de ação.\n\n## Critérios de aceite\n- políticas persistidas em banco\n- leitura aplicada em tempo de execução\n- bloqueios deixam rastro legível\n- configuração por tenant ou agente suportada\n\n## Dependência\nEpic-pai: EPIC-03"
    },
    {
        "key": "AG-13", "epic": "EPIC-03", "title": "[AG-13] Implementar Budget Gate para custo e volume diário",
        "labels": ["type:feature", "area:agentic", "area:observability", "priority:P0", "status:ready"],
        "body": "## Contexto\nCriar guardas para impedir estouro de orçamento ou excesso de ações por janela de tempo.\n\n## Critérios de aceite\n- limites por tenant/agente definidos\n- tentativa acima do orçamento resulta em bloqueio rastreável\n- counters de custo/volume são atualizados\n- mensagens operacionais explicam o motivo do bloqueio\n\n## Dependência\nEpic-pai: EPIC-03"
    },
    {
        "key": "AG-14", "epic": "EPIC-03", "title": "[AG-14] Criar Human-in-the-Loop para ações de risco médio/alto",
        "labels": ["type:feature", "area:frontend", "area:agentic", "area:security", "priority:P1", "status:ready"],
        "body": "## Contexto\nAdicionar mecanismo de revisão humana para ações marcadas como `revise` ou `escalate`, com fila de aprovação e decisão final.\n\n## Critérios de aceite\n- ações pendentes ficam acessíveis para revisão\n- aprovador consegue aprovar, rejeitar ou solicitar ajuste\n- decisão humana atualiza a trilha auditável\n- fluxo não depende de edição manual no banco\n\n## Dependência\nEpic-pai: EPIC-03"
    },
    {
        "key": "AG-15", "epic": "EPIC-04", "title": "[AG-15] Padronizar contrato da Tools Layer",
        "labels": ["type:feature", "area:agentic", "area:integrations", "priority:P1", "status:ready"],
        "body": "## Contexto\nCriar contrato único de retorno para tools externas e adaptadores para providers futuros.\n\n## Critérios de aceite\n- interface `ToolExecutionResult` definida e aplicada\n- tools retornam status consistente\n- erros retriáveis e não-retriáveis distinguidos\n- documentação de integração criada\n\n## Dependência\nEpic-pai: EPIC-04"
    },
    {
        "key": "AG-16", "epic": "EPIC-04", "title": "[AG-16] Integrar Instagram/Facebook Business em modo controlado",
        "labels": ["type:feature", "area:integrations", "area:agentic", "priority:P1", "status:ready"],
        "body": "## Contexto\nImplementar publicação controlada para Meta Business, incluindo criação/publicação, tratamento de erro e rastreabilidade.\n\n## Critérios de aceite\n- publicação de teste em conta business/sandbox\n- falhas de mídia/token/status são tratadas\n- ação é bloqueável pelo judge/policy gate\n- resultado é persistido em auditoria\n\n## Dependência\nEpic-pai: EPIC-04"
    },
    {
        "key": "AG-17", "epic": "EPIC-04", "title": "[AG-17] Integrar WhatsApp Business Cloud API com governança de janela e template",
        "labels": ["type:feature", "area:integrations", "type:compliance", "priority:P1", "status:ready"],
        "body": "## Contexto\nCriar tool de mensageria para WhatsApp Business respeitando template policy, janela de atendimento, opt-in e suppress list.\n\n## Critérios de aceite\n- envio bloqueado fora das regras configuradas\n- templates aprovados suportados quando exigidos\n- opt-out impede novas mensagens\n- logs/auditoria incluem status por mensagem\n\n## Dependência\nEpic-pai: EPIC-04"
    },
    {
        "key": "AG-18", "epic": "EPIC-05", "title": "[AG-18] Conectar Tools Layer a marketplace/CRM internos",
        "labels": ["type:feature", "area:integrations", "area:backend", "priority:P2", "status:ready"],
        "body": "## Contexto\nCriar adaptadores internos para que o orquestrador possa acionar dados/ações ligadas a pedidos, leads e catálogo sem furar o core.\n\n## Critérios de aceite\n- tools internas invocam services oficiais, não acessos ad hoc\n- rastreamento de chamada interna disponível\n- documentação de dependências criada\n- pelo menos um fluxo de consulta e um de ação interna implementados\n\n## Dependência\nEpic-pai: EPIC-05"
    },
    {
        "key": "AG-19", "epic": "EPIC-05", "title": "[AG-19] Implementar memória episódica operacional",
        "labels": ["type:feature", "area:agentic", "area:database", "priority:P1", "status:ready"],
        "body": "## Contexto\nPersistir fatos úteis de execuções anteriores, decisões, campanhas e interações relevantes para reuso posterior.\n\n## Critérios de aceite\n- registro de memórias por tipo/contexto\n- memória recuperável por agente/usuário\n- política mínima de expiração/limpeza documentada\n- uso prático em pelo menos um nó do orquestrador\n\n## Dependência\nEpic-pai: EPIC-05"
    },
    {
        "key": "AG-20", "epic": "EPIC-05", "title": "[AG-20] Integrar vector store para recuperação semântica",
        "labels": ["type:feature", "area:agentic", "area:infra", "priority:P2", "status:ready"],
        "body": "## Contexto\nAdicionar mecanismo dedicado de busca vetorial para memória semântica, evitando depender apenas de JSON em MySQL.\n\n## Critérios de aceite\n- provider vetorial escolhido e documentado\n- pipeline de ingestão/consulta implementado\n- busca por similaridade funcional\n- fallback seguro caso o provider esteja indisponível\n\n## Dependência\nEpic-pai: EPIC-05"
    },
    {
        "key": "AG-21", "epic": "EPIC-05", "title": "[AG-21] Implementar personalização por afiliado, tenant e lead",
        "labels": ["type:feature", "area:agentic", "area:backend", "priority:P2", "status:ready"],
        "body": "## Contexto\nPermitir que campanhas e decisões considerem nicho, histórico, tom de marca, restrições e estágio do lead.\n\n## Critérios de aceite\n- contexto de tenant/agente/lead consolidado em objeto consumível\n- prompts/decisões usam esse contexto\n- diferenças de comportamento entre perfis ficam demonstráveis\n- documentação de precedência de contexto criada\n\n## Dependência\nEpic-pai: EPIC-05"
    },
    {
        "key": "AG-22", "epic": "EPIC-06", "title": "[AG-22] Instrumentar métricas da camada agentic com OpenTelemetry/Prometheus",
        "labels": ["type:observability", "area:observability", "area:agentic", "priority:P0", "status:ready"],
        "body": "## Contexto\nEmitir counters, histograms e gauges para ciclos, judge, tools, tokens, falhas e workers.\n\n## Critérios de aceite\n- métricas prioritárias do documento de operação emitidas\n- labels mínimas padronizadas\n- custo e latência por ciclo observáveis\n- documentação de nomes e semântica publicada\n\n## Dependência\nEpic-pai: EPIC-06"
    },
    {
        "key": "AG-23", "epic": "EPIC-06", "title": "[AG-23] Publicar dashboards mínimos de operação agentic",
        "labels": ["type:observability", "area:observability", "area:infra", "priority:P1", "status:ready"],
        "body": "## Contexto\nCriar dashboards de visão geral, camada agentic, integrações externas e negócio.\n\n## Critérios de aceite\n- dashboards versionados no repositório\n- painéis principais alimentados por dados reais\n- time de operação consegue identificar falhas sem consultar banco diretamente\n- screenshots ou evidências anexadas no PR\n\n## Dependência\nEpic-pai: EPIC-06"
    },
    {
        "key": "AG-24", "epic": "EPIC-06", "title": "[AG-24] Configurar alertas operacionais mínimos",
        "labels": ["type:observability", "area:observability", "priority:P1", "status:ready"],
        "body": "## Contexto\nConfigurar alertas para judge score baixo, bloqueios em alta, falha de worker, latência alta e estouro de orçamento.\n\n## Critérios de aceite\n- alertas disparam em cenário de teste\n- limiares documentados\n- severidade e roteamento definidos\n- runbook vinculado aos alertas principais\n\n## Dependência\nEpic-pai: EPIC-06"
    },
    {
        "key": "AG-25", "epic": "EPIC-06", "title": "[AG-25] Criar runbooks e playbooks de incidentes agentic",
        "labels": ["type:docs", "area:observability", "area:security", "priority:P1", "status:ready"],
        "body": "## Contexto\nDocumentar resposta para fila travada, custo alto, provider indisponível, excesso de bloqueio do judge e incidente de compliance.\n\n## Critérios de aceite\n- pelo menos cinco runbooks versionados\n- cada runbook contém detecção, triagem, contenção e rollback\n- links para dashboards/alertas incluídos\n- documento validado por responsável técnico\n\n## Dependência\nEpic-pai: EPIC-06"
    },
    {
        "key": "AG-26", "epic": "EPIC-07", "title": "[AG-26] Implementar consentimento, opt-in, opt-out e suppress list",
        "labels": ["type:compliance", "area:database", "priority:P0", "status:ready"],
        "body": "## Contexto\nCriar base mínima para governança de contatos e impedir comunicações indevidas por agentes.\n\n## Critérios de aceite\n- opt-in e opt-out persistidos\n- suppress list consultada antes de ação outbound\n- ações impedidas ficam registradas\n- política mínima LGPD documentada junto ao fluxo\n\n## Dependência\nEpic-pai: EPIC-07"
    },
    {
        "key": "AG-27", "epic": "EPIC-07", "title": "[AG-27] Endurecer secrets management, escopos e MFA para operadores críticos",
        "labels": ["type:security", "area:security", "area:infra", "priority:P0", "status:ready"],
        "body": "## Contexto\nReforçar segurança operacional para integrações externas e perfis administrativos.\n\n## Critérios de aceite\n- segredos não ficam expostos em código ou envs inseguros\n- escopos mínimos por provider documentados\n- MFA ou plano equivalente implementado para usuários críticos\n- rotação e revogação de credenciais possuem procedimento claro\n\n## Dependência\nEpic-pai: EPIC-07"
    },
    {
        "key": "AG-28", "epic": "EPIC-07", "title": "[AG-28] Estruturar rollout híbrido -> supervisionado -> autônomo controlado",
        "labels": ["type:feature", "area:agentic", "type:compliance", "priority:P1", "status:ready"],
        "body": "## Contexto\nModelar modos de execução da camada agentic, habilitando autonomia gradativa por tenant ou feature flag.\n\n## Critérios de aceite\n- modo de execução configurável por ambiente/tenant\n- ações de alto risco forçam revisão em modos iniciais\n- transição entre modos é auditável\n- documentação operacional do rollout publicada\n\n## Dependência\nEpic-pai: EPIC-07"
    },
    {
        "key": "AG-29", "epic": "EPIC-07", "title": "[AG-29] Definir beta operacional e governança de KPIs",
        "labels": ["type:feature", "area:agentic", "area:observability", "priority:P1", "status:ready"],
        "body": "## Contexto\nCriar o plano de beta produtivo com coorte inicial, KPIs, critérios de entrada/saída e rotina de revisão.\n\n## Critérios de aceite\n- coorte beta e responsáveis definidos\n- KPIs e baseline publicados\n- rituais de revisão semanal descritos\n- critérios para ampliar ou pausar rollout documentados\n\n## Dependência\nEpic-pai: EPIC-07"
    },
]

def request(method, url, data=None):
    req = urllib.request.Request(url, method=method, headers=HEADERS)
    if data is not None:
        payload = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        req.data = payload
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code} {method} {url}: {body}")


def paginate(url):
    page = 1
    while True:
        sep = '&' if '?' in url else '?'
        data = request("GET", f"{url}{sep}per_page=100&page={page}")
        if not data:
            break
        for item in data:
            yield item
        if len(data) < 100:
            break
        page += 1


def ensure_labels():
    existing = {item['name'] for item in paginate(f"{API}/labels")}
    created = 0
    for name, color in LABELS:
        if name in existing:
            continue
        request("POST", f"{API}/labels", {"name": name, "color": color, "description": name})
        created += 1
    return created


def get_open_issues_index():
    index = {}
    for item in paginate(f"{API}/issues?state=open"):
        if 'pull_request' in item:
            continue
        title = item['title']
        m = re.match(r"\[(EPIC-\d+|AG-\d+)\]", title)
        if m:
            index[m.group(1)] = item
    return index


def create_or_get_issue(defn, existing_index):
    key = defn['key']
    if key in existing_index:
        return existing_index[key]
    created = request("POST", f"{API}/issues", {
        "title": defn['title'],
        "body": defn['body'],
        "labels": defn['labels']
    })
    existing_index[key] = created
    return created


def update_issue_body(number, body):
    return request("PATCH", f"{API}/issues/{number}", {"body": body})


def main():
    created_labels = ensure_labels()
    existing_index = get_open_issues_index()

    epic_numbers = {}
    for epic in EPICS:
        issue = create_or_get_issue(epic, existing_index)
        epic_numbers[epic['key']] = issue['number']

    child_numbers = {}
    epic_children = {epic['key']: [] for epic in EPICS}
    for issue_def in ISSUES:
        issue = create_or_get_issue(issue_def, existing_index)
        child_numbers[issue_def['key']] = issue['number']
        epic_children[issue_def['epic']].append((issue_def['key'], issue['number'], issue_def['title']))

    for epic in EPICS:
        lines = [
            epic['body'].split("## Checklist de issues filhas")[0].rstrip(),
            "## Checklist de issues filhas"
        ]
        for key, number, title in epic_children[epic['key']]:
            lines.append(f"- [ ] #{number} {title}")
        lines.append("")
        lines.append("## Observação")
        lines.append("Checklist gerado automaticamente a partir do backlog agentic versionado no repositório.")
        update_issue_body(epic_numbers[epic['key']], "\n".join(lines))

    print(json.dumps({
        "created_labels": created_labels,
        "epics": epic_numbers,
        "issues": child_numbers,
        "total_opened_or_reused": len(epic_numbers) + len(child_numbers)
    }, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
