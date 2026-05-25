# Especificação Técnica - Fase 8 Beta Launch Program

## Visão Geral

Implementação da **Fase 8** com **Beta Launch Program** para preparação do lançamento público da plataforma MMN_AI-to-AI.

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | FastAPI | 0.109.0 |
| Server | Uvicorn | 0.27.0 |
| Validação | Pydantic | 2.5.3 |
| HTTP Client | aiohttp | 3.9.1 |
| Testes | pytest | 7.4.4 |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Programs │  │ Testers │  │Feedbacks │  │   Bugs   │     │
│  │  Router  │  │  Router │  │  Router  │  │  Router  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │              │
│       └─────────────┴─────────────┴─────────────┘             │
│                           │                                   │
│  ┌─────────────────────────┴─────────────────────────────┐   │
│  │                  BetaService                          │   │
│  │  • Program Management                                  │   │
│  │  • Tester Management                                  │   │
│  │  • Feedback Collection                                 │   │
│  │  • Bug Tracking                                        │   │
│  │  • Survey Management                                   │   │
│  │  • Metrics & Analytics                                │   │
│  └─────────────────────────┬─────────────────────────────┘   │
│                            │                               │
│  ┌─────────────────────────┴─────────────────────────────┐   │
│  │                  Models (Pydantic)                    │   │
│  │  BetaProgram │ BetaTester │ Feedback │ BugReport        │   │
│  │  BetaInvite │ BetaSurvey │ BetaMetrics               │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Modelos de Dados

### BetaProgram

```python
{
    "id": "beta_abc123def456",
    "name": "Beta v2.0 - MMN AI Platform",
    "version": "2.0.0",
    "description": "Programa beta para nova versão...",
    "status": "open",  # planning, open, closed, evaluating, completed
    "max_testers": 100,
    "current_testers": 45,
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-08-01T00:00:00Z",
    "target_features": ["Nova Dashboard", "API v2", "Agent Skills"],
    "rewards_enabled": true,
    "reward_description": "Desconto de 30% no plano anual"
}
```

### BetaTester

```python
{
    "id": "tester_xyz789",
    "user_id": "user_123",
    "program_id": "beta_abc123",
    "status": "active",  # pending, approved, active, suspended, removed
    "email": "tester@example.com",
    "name": "João Silva",
    "company": "Tech Corp",
    "experience_level": "advanced",
    "feedback_count": 5,
    "bug_reports_count": 2,
    "acceptance_rate": 0.8,
    "created_at": "2026-06-01T10:00:00Z"
}
```

### FeedbackSubmission

```python
{
    "id": "fb_123abc",
    "tester_id": "tester_xyz789",
    "program_id": "beta_abc123",
    "title": "Dashboard carrega lentamente",
    "content": "Descrição detalhada do problema...",
    "severity": "high",  # critical, high, medium, low, suggestion
    "status": "acknowledged",  # submitted, acknowledged, in_progress, resolved, closed
    "rating": 4,
    "response": "Obrigado pelo feedback!"
}
```

### BugReport

```python
{
    "id": "bug_456def",
    "tester_id": "tester_xyz789",
    "program_id": "beta_abc123",
    "title": "Erro 500 ao criar afiliado",
    "description": "Ao preencher formulário...",
    "steps_to_reproduce": ["Passo 1", "Passo 2", "Passo 3"],
    "expected_behavior": "Deveria criar afiliado",
    "actual_behavior": "Retorna erro 500",
    "severity": "critical",
    "status": "reported",  # reported, triaged, assigned, in_review, fixed, verified, closed
    "category": "api",  # ui, api, performance, security, other
    "tags": ["afiliado", "cadastro", "erro500"]
}
```

## Endpoints Implementados

### Programas Beta

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/programs` | POST | Criar programa beta |
| `/beta/programs` | GET | Listar programas |
| `/beta/programs/{program_id}` | GET | Detalhes do programa |
| `/beta/programs/{program_id}` | PATCH | Atualizar programa |
| `/beta/programs/{program_id}/open` | POST | Abrir inscrições |
| `/beta/programs/{program_id}/close` | POST | Encerrar programa |
| `/beta/programs/{program_id}/metrics` | GET | Métricas do programa |

### Testadores

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/testers` | POST | Adicionar testador |
| `/beta/testers` | GET | Listar testadores |
| `/beta/testers/{tester_id}` | GET | Detalhes do testador |
| `/beta/testers/{tester_id}/status` | PATCH | Atualizar status |
| `/beta/testers/{tester_id}` | DELETE | Remover testador |
| `/beta/testers/{tester_id}/metrics` | GET | Métricas do testador |

### Feedback

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/feedback` | POST | Submeter feedback |
| `/beta/feedback` | GET | Listar feedbacks |
| `/beta/feedback/{feedback_id}` | GET | Detalhes do feedback |
| `/beta/feedback/{feedback_id}/status` | PATCH | Atualizar status |

### Bugs

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/bugs` | POST | Reportar bug |
| `/beta/bugs` | GET | Listar bugs |
| `/beta/bugs/{bug_id}` | GET | Detalhes do bug |
| `/beta/bugs/{bug_id}/status` | PATCH | Atualizar status |

### Convites

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/invites` | POST | Criar convite |
| `/beta/invites/validate/{token}` | GET | Validar token |
| `/beta/invites/accept/{token}` | POST | Aceitar convite |

### Pesquisas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/beta/surveys` | POST | Submeter pesquisa |
| `/beta/surveys/program/{program_id}` | GET | Listar pesquisas |

## Status do Programa Beta

| Status | Descrição |
|--------|-----------|
| `planning` | Programa em planejamento |
| `open` | Aceitando inscrições |
| `closed` | Inscrições encerradas |
| `evaluating` | Em avaliação |
| `completed` | Programa concluído |

## Status do Testador

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando aprovação |
| `approved` | Aprovado |
| `active` | Ativo no programa |
| `suspended` | Suspenso |
| `removed` | Removido |

## Severidade de Issues

| Severidade | Descrição |
|------------|-----------|
| `critical` | Bloca uso do sistema |
| `high` | Impacta significativamente |
| `medium` | Impacta parcialmente |
| `low` | Impacto menor |
| `suggestion` | Sugestão de melhoria |

## Métricas do Programa

| Métrica | Descrição |
|---------|-----------|
| `total_testers` | Total de testadores |
| `active_testers` | Testadores ativos |
| `total_feedback` | Total de feedbacks |
| `total_bugs` | Total de bugs reportados |
| `critical_bugs` | Bugs críticos |
| `resolved_bugs` | Bugs resolvidos |
| `resolution_rate` | Taxa de resolução |
| `average_satisfaction` | Satisfação média |

## Dependências

- Fase 5: Packs e Modularização
- Fase 6: Revisão e Otimização
- Fase 7: White-Label Module (Completo)

## Status

| Sprint | Status | Entregas |
|--------|--------|----------|
| Fase 8: Beta Launch | ✅ Em Desenvolvimento | Programas, Testadores, Feedback, Bugs, Convites, Métricas |

**Versão**: 1.0.0
**Data**: 2026-05-25
**Autor**: Nexus-HUB57 / MiniMax Agent