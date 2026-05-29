# Índice de Documentação - Nexus System AI-to-AI

**Última Atualização:** 2026-05-29
**Versão:** v1.3.0
**Repositório:** [GitHub](https://github.com/Nexus-HUB57/MMN_AI-to-AI)

---

## 🚀 Comece por Aqui

| Documento | Descrição |
|-----------|-----------|
| [README do Projeto](../README.md) | Visão geral completa do sistema |
| [CHANGELOG](../CHANGELOG.md) | Histórico de versões e entregas |
| Este índice | Navegação completa da documentação |

---

## 🏗️ Arquitetura do Sistema

```
┌───────────────────────────────────────────────┐
│               FRONTEND LAYER                 │
├───────────────────────────────────────────────┤
│ React + Vite + Tailwind + TanStack + Wouter │
│ Expo Mobile + OAuth + Theme Provider        │
└───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│                tRPC GATEWAY                  │
├───────────────────────────────────────────────┤
│ Auth │ RBAC │ Circuit Breakers │ Validation │
└───────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────┐
│              DOMAIN SERVICES                 │
├───────────────────────────────────────────────┤
│ MMN │ XP │ Billing │ Marketplace │ Agents   │
│ CMS │ Newsletter │ Finance │ Cron │ Packs  │
└───────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ MYSQL        │      │ REDIS + BULLMQ   │
│ Drizzle ORM  │      │ FILAS/WORKERS    │
└──────────────┘      └──────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ AGENTIC RUNTIME     │
                    ├─────────────────────┤
                    │ Gemini │ OpenAI    │
                    │ Memory │ Sessions │
                    │ Skills │ Upgrades  │
                    └─────────────────────┘
```

---

## 📂 Estrutura de Documentação

### 📋 Documentação Principal

| Categoria | Descrição |
|-----------|-----------|
| **Canônica** | `canonical/DOCUMENTACAO_CANONICA.md` - Referência única oficial |
| **Agentic** | `agentic/*.md` (7 arquivos) - Arquitetura e roadmap agentic |
| **Admin Backoffice** | `admin-backoffice/*.md` (17 arquivos) - Operações administrativas |

### 📊 Guias e Manuais

| Arquivo | Descrição |
|---------|-----------|
| `guias/*.md` (6 arquivos) | Guias operacionais |
| `guides/*.md` (4 arquivos) | Manuais de uso |

### 🔧 Development

| Arquivo | Descrição |
|---------|-----------|
| `AI_SYNC_SYSTEM.md` | Sistema de sincronização AI |
| `SKILLS_SYSTEM.md` | Sistema de habilidades |
| `SYSTEM_STATUS.md` | Status operacional |

### 📈 Análises e Relatórios

| Categoria | Descrição |
|-----------|-----------|
| `repository-review/*.md` | Análises técnicas |
| `roadmaps/*.md` | Planejamentos de roadmap |
| `validation-reports/*.md` | Relatórios de validação |

---

## 📦 Entregas por Domínio (v1.3.0)

### Backoffice Admin
- ✅ Sistema de Agendamentos Cron
- ✅ Alertas automáticos e persistência
- ✅ SLA Monitor
- ✅ Auditoria de Comissões
- ✅ Aprovações Administrativas

### Agentic Runtime
- ✅ Sistema de 45 Skills Operacionais
- ✅ Resiliência (Retry, Circuit Breakers)
- ✅ Persistência (Sessões, Memórias)
- ✅ Multi-Agent Orchestration

### PIX Integration
- ✅ QR Code Estático e Dinâmico
- ✅ Webhook processing
- ✅ OpenPix Integration
- ✅ Rate Limiting

### Firebase Auth
- ✅ Login Social (Google, Facebook, Apple)
- ✅ Session persistence
- ✅ Auto-login

---

## 🔗 Links Úteis

- **GitHub:** https://github.com/Nexus-HUB57/MMN_AI-to-AI
- **Deploy:** https://oneverso.com.br
- **Roadmap:** [ROADMAP.md](../ROADMAP.md)

---

## 📝 Convenções de Nomenclatura

| Prefixo | Significado |
|---------|-------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `chore:` | Manutenção |
| `refactor:` | Refatoração |
| `test:` | Testes |
| `ops:` | Operações/DevOps |

---

## 🔄 Histórico de Releases

| Data | Versão | Status |
|------|--------|--------|
| 2026-05-29 | v1.3.0 | **Atual** - Nexus Partners Skills Expansion |
| 2026-05-28 | v1.2.9 | Repositório analisado e preparado |
| 2026-05-25 | v1.2.8 | Deploy Hostgator Consolidado |
| 2026-05-24 | v1.2.0 | Fase Beta consolidada |
| 2026-05-22 | v1.1.0 | Agent Runtime + AI Sync |

---

## 📁 Pastas Especiais

| Pasta | Descrição |
|-------|-----------|
| `/ai/` | Artefatos de IA e modelos |
| `/auxiliary/` | Ferramentas e experimentos auxiliares |
| `/fase7/, `/fase8/, `/fase9/` | Histórico de fases de desenvolvimento |
| `/packs/` | Pack de agentes |
| `/white-label-config/` | Configuração white-label |

---

**Mantido por:** Nexus-HUB57
**Licença:** Proprietary
