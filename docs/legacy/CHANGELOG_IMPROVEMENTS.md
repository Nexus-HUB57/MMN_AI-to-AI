# MMN AI-to-AI - Changelog de Melhorias

## Atualizações de UI - Dashboard Components

### Data: 23/05/2026

---

## Componentes UI Aprimorados

### 1. Button Component (`/frontend/src/components/ui/button.tsx`)
- Adicionadas novas variantes: `gradient`, `subtle`
- Adicionados novos tamanhos: `xl` para botões de destaque
- Suporte para ícones com props `leftIcon` e `rightIcon`
- Estado de loading integrado com spinner
- Efeito de scale ativo para feedback visual
- Componentes derivados: `ButtonGroup`, `TooltipButton`

### 2. Card Component (`/frontend/src/components/ui/card.tsx`)
- Adicionadas variantes: `elevated`, `outline`, `ghost`, `gradient`
- Sistema de padding configurável: `sm`, `default`, `lg`, `none`
- Novo componente `StatCard` para métricas de dashboard:
  - Suporte para tendência (up/down/neutral)
  - Ícone decorativo
  - Barra de gradiente decorativa
  - Estado de loading com skeleton
- Novo componente `MetricCard` com barra de progresso integrada

### 3. Badge Component (`/frontend/src/components/ui/badge.tsx`)
- Adicionadas novas variantes: `success`, `warning`, `gradient`, `subtle`
- Estilos de gradiente para badges destacados
- Suporte a cores semânticas (sucesso, warning, perigo)

### 4. Input Component (`/frontend/src/components/ui/input.tsx`)
- Adicionadas variantes: `error`, `success`, `ghost`, `filled`
- Tamanhos: `sm`, `default`, `lg`
- Estados visuais para feedback de validação
- Transições suaves de foco

### 5. Progress Component (`/frontend/src/components/ui/progress.tsx`)
- Variantes de cor: `default`, `success`, `warning`, `danger`, `gradient`
- Tamanhos configuráveis: `sm`, `default`, `lg`, `xl`
- Label opcional com porcentagem
- Animação de progresso configurável
- Novo componente `CircularProgress`:
  - Visual circular para métricas
  - Label central opcional
  - Gradientes configuráveis

### 6. Skeleton Component (`/frontend/src/components/ui/skeleton.tsx`)
- Variantes: `default`, `primary`, `secondary`, `gradient`
- Componentes pré-formatados:
  - `SkeletonText`: linhas de texto
  - `SkeletonCard`: cards com placeholder
  - `SkeletonTable`: tabelas com linhas
  - `SkeletonAvatar`: avatares circulares
  - `SkeletonStats`: grids de estatísticas

---

## Cobertura de Testes

### Novo arquivo de testes: `/tests/unit/ui-components.test.ts`
- Testes unitários para todos os componentes UI
- Testes de renderização e props
- Testes de estados (loading, disabled)
- Testes de integração entre componentes
- Configuração Vitest com cobertura V8

### Configuração Vitest: `/tests/vitest.config.ts`
- Provider de cobertura: v8
- Reporters: text, json, html
- Alias para imports (@/ e @mmn/shared)
- Include patterns para testes

---

## Validação Mobile

### Configuration Updates: `/mobile/app.config.ts`
- Bundle ID: `space.manus.mmn.mobile.app.t20260506095644`
- Deep Link Scheme: `manus20260506095644`
- New Architecture Enabled
- Suporte para áudio e vídeo
- Splash screen configurado

### TypeScript Configuration: `/mobile/tsconfig.json`
- Adicionado `ignoreDeprecations: "6.0"`
- Suporte para nativewind/types

---

## Como Usar os Novos Componentes

```tsx
import { Button, StatCard, MetricCard } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Progress, CircularProgress } from "@/components/ui/progress";
import { SkeletonCard, SkeletonStats } from "@/components/ui/skeleton";

// Botão com loading state
<Button loading={isSubmitting}>Enviar</Button>

// Card de estatística
<StatCard
  title="Total de Vendas"
  value="R$ 12.500"
  trend="up"
  trendValue="+15%"
/>

// Progress circular
<CircularProgress value={75} showValue label="Complete" />

// Skeleton para loading
<SkeletonStats count={4} />
```

---

## Próximos Passos

1. Executar build do frontend com `npm run build`
2. Executar testes com `npm run test`
3. Deploy do frontend
4. Testar aplicação mobile com Expo