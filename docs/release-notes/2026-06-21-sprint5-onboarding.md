# Sprint 5 — Onboarding & Primeira Vitória

## Resumo
Conjunto integrado de componentes de onboarding visando levar o novo usuário
do cadastro à primeira venda em menos de 5 minutos.

## Componentes implementados (`OnboardingBundle.tsx`)

### 1. WelcomeTour
Walkthrough guiado em 5 passos no primeiro login:
- Boas-vindas
- Agente IA pessoal (25 skills)
- Marketplace (201 ebooks, 19 coleções)
- Pack A² R$ 10 via PIX
- Loja Virtual pronta

Persistência em localStorage (`nexus_welcome_tour_completed_v1`).
Botão "pular tour" e indicador visual de passos.

### 2. ProgressChecklist
Sidebar lateral fixa (bottom-right) com 5 marcos:
- ✅ Cadastro concluído
- ✅ Agente IA ativo
- ⬜ Pack A² ativado (detecta via `packEntitlements.listMyGrants`)
- ⬜ Loja compartilhada (próximo: rastrear cliques de share)
- ⬜ Primeira venda (próximo: rastrear `marketplace_orders`)

Barra de progresso animada, modo colapsado (badge flutuante),
botão dismiss persistente.

### 3. RealtimeToasts
Sistema global de notificações em tempo real:
- Polling automático de `packEntitlements.listMyGrants` (15s)
- Detecta novos grants e dispara toast "🎉 Pack ativado!"
- Auto-dismiss em 6s
- API global `fireNexusToast()` para outros componentes dispararem

### 4. EmptyStateHero
Componente reutilizável para empty states ricos:
- Ícone customizável
- Título + body
- CTA principal + opcional video link
- Pronto para uso em /skills, /estoque, /marketplaces

### 5. OnboardingBundle
Wrapper que monta WelcomeTour + ProgressChecklist + RealtimeToasts
em uma única importação. Injetado em `DashboardLayout` automaticamente.

## Integração
- Componente: `frontend/src/components/OnboardingBundle.tsx` (14.5 KB)
- Injeção em `frontend/src/pages/DashboardLayout.tsx` (marker `NEXUS_ONBOARDING_V2`)
- Imports usados: `lucide-react`, `wouter Link`, `trpc`, `Button`, `Badge`

## Validação
- Build: ✅ index-BDXGrynV.js (973.80 KB)
- TSC: 0 erros
- HTTP smoke: 8/8 rotas em 200
- API Pack Entitlements: ✅ quotaTable retorna 15 packs
- Strings no bundle:
  - "Sua jornada" ×1
  - "passos concluídos" ×1
  - "Loja Virtual" ×6
  - "Pack A" ×90 (cobertura ampla)

## Próximas iterações (Sprint 5+)
- [ ] Rastrear cliques no botão Compartilhar Loja (marco "Loja compartilhada")
- [ ] Rastrear primeira ordem de venda paga (marco "Primeira venda")
- [ ] Adicionar URLs de vídeos curtos (Loom/YT) em EmptyStateHero
- [ ] Migrar polling para WebSocket (reduz carga)
- [ ] A/B test do Wizard de Ativação Pack A² (3-step modal)

