# PLANO DE FUSÃO: SISTEMA LEGACY → SISTEMA OFICIAL MMN_AI-to-AI

## Data: 2026-05-19
## Status: EM ANDAMENTO

---

## 1. ANÁLISE COMPARATIVA

### Sistema Legacy (PHP - 1470 arquivos)
| Componente | Status Legacy | Status Oficial | Ação |
|------------|---------------|----------------|------|
| Autenticação | ✅ Implementado | ✅ JWT | Manter como está |
| Cadastro de Usuários | ✅ Implementado | ✅ Implementado | Migrar validações |
| Sistema MMN/Comissões | ✅ Implementado | ✅ Implementado | Comparar e consolidar |
| Backoffice Usuário | ✅ Implementado | ✅ Implementado | Atualizar UI se necessário |
| Painel Administrativo | ✅ Implementado | ✅ Implementado | Adicionar funcionalidades faltantes |
| CMS/Páginas | ✅ Implementado | ❌ Não implementado | Implementar no sistema oficial |
| Newsletter | ✅ Implementado | ❌ Parcial | Integrar |
| Boletos/Faturas | ✅ Implementado | ⚠️ Planejado | Adicionar |
| Configurações | ✅ Implementado | ✅ Implementado | Unificar |

### Funcionalidades Exclusivas do Legacy (a migrar)
1. **Newsletter System** - mdl123_newsletter.inc.php
2. **CMS Pages** - pagina.php, quem_somos.php, etc.
3. **Boleto System** - boletos123/
4. **Configurações Admin** - area123_configuracoes.php
5. **Estatísticas Avançadas** - area123_estatisticas.php

---

## 2. ESTRATÉGIA DE FUSÃO

### Fase 1: Análise e Mapeamento ✅ CONCLUÍDA
- [x] Clonar repositórios
- [x] Analisar estrutura do sistema legacy
- [x] Analisar estrutura do sistema oficial
- [x] Acessar demos para verificação

### Fase 2: Migração de Funcionalidades
- [ ] Migrar newsletter system
- [ ] Migrar CMS pages
- [ ] Migrar configurações administrativas
- [ ] Adicionar funcionalidades faltantes

### Fase 3: Testes e Validação
- [ ] Testar funcionalidades integradas
- [ ] Verificar compatibilidade
- [ ] Validar no ambiente de demo

### Fase 4: Deploy e Atualização
- [ ] Atualizar repositório GitHub
- [ ] Deploy do sistema unificado

---

## 3. COMPONENTES A MIGRAR

### 3.1 Newsletter System
**Arquivos:**
- `legacy/mdl123_newsletter.inc.php`
- `legacy/nl_incluir.php`
- `legacy/nl_excluir.php`

**Implementação no sistema oficial:**
- Criar endpoint tRPC: `newsletter.subscribe`
- Criar endpoint tRPC: `newsletter.unsubscribe`
- Criar endpoint tRPC: `newsletter.list`
- Adicionar tabela: `newsletters`

### 3.2 CMS Pages
**Arquivos:**
- `legacy/pagina.php`
- `legacy/quem_somos.php`
- `legacy/privacidade.php`
- `legacy/termos_de_uso.php`
- `legacy/contato.php`
- `legacy/duvidas.php`

**Implementação no sistema oficial:**
- Criar router: `cmsRouter`
- Endpoints: `cms.getPage`, `cms.listPages`, `cms.createPage`
- Adicionar tabela: `cms_pages`
- Criar página React para renderização

### 3.3 Sistema de Faturas/Boletos
**Arquivos:**
- `legacy/boletos123/` (6 arquivos)
- `legacy/fatura/`

**Implementação no sistema oficial:**
- Criar router: `billingRouter`
- Endpoints: `billing.getInvoice`, `billing.listInvoices`
- Adicionar tabelas: `invoices`, `billing_history`

---

## 4. ARQUIVOS LEGACY PRESERVADOS

Serão preservados na pasta `/legacy/` para referência e migração gradual:
- Todos os arquivos PHP originais
- Estrutura de banco de dados MySQL
- Configurações e templates

---

## 5. CHECKLIST DE MIGRAÇÃO

### Backend (tRPC Routers)
- [ ] newsletterRouter.ts (criar)
- [ ] cmsRouter.ts (criar)
- [ ] billingRouter.ts (criar)
- [ ] Atualizar database schemas

### Frontend (React)
- [ ] NewsletterSubscription component
- [ ] CMSPages component
- [ ] BillingHistory component
- [ ] Atualizar navegação

### Database
- [ ] Adicionar tabela: `newsletters`
- [ ] Adicionar tabela: `cms_pages`
- [ ] Adicionar tabela: `invoices`
- [ ] Adicionar tabela: `billing_history`

---

## 6. PRÓXIMOS PASSOS

1. **Imediato:** Atualizar repositório com análises
2. **Curto prazo:** Implementar componentes de migração
3. **Médio prazo:** Testar e validar funcionalidades
4. **Longo prazo:** Descontinuar sistema legacy gradualmente

---

**Autor:** MiniMax Agent
**Data de Criação:** 2026-05-19
**Última Atualização:** 2026-05-19