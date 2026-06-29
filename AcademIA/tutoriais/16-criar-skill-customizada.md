# 🛠️ Tutorial 16 · Criar uma Skill Customizada

**Nível:** Master → Elite
**Tempo:** 60 min
**Pré-requisito:** Curso agente 01-skills-essenciais

---

## 🎯 O que é uma Skill Custom?

Skill customizada é uma função específica do seu negócio que não vem pronta na plataforma. Pode ser:
- **Integração** com sistema interno (CRM próprio, ERP)
- **Lógica de domínio** (cálculo de comissão específico, scoring proprietário)
- **Workflow proprietário** (processo único da sua operação)

## 📋 Estrutura de uma Skill

```
skills/
└── minha-skill-custom/
    ├── SKILL.md           # Especificação (obrigatório)
    ├── handler.ts         # Implementação
    ├── tests/             # Testes unitários
    └── examples/          # Exemplos de uso
```

## 🚀 Passo 1 — Criar SKILL.md

```yaml
---
title: "Calculadora de Comissão Customizada"
slug: "comissao-custom"
version: "1.0.0"
author: "Sua Empresa"
description: "Calcula comissão baseada em tier + performance + sazonalidade"
level: "master"
category: "finance"
trilha_academia: "cursos/master/"
inputs:
  - name: "vendedor_id"
    type: "string"
    required: true
  - name: "valor_venda"
    type: "number"
    required: true
  - name: "mes"
    type: "integer"
    required: true
outputs:
  - name: "comissao_final"
    type: "number"
  - name: "componentes"
    type: "object"
guards:
  - name: "valor_positivo"
    type: "validation"
    rule: "valor_venda > 0"
---

# Skill: Calculadora de Comissão Customizada

## Descrição
Aplica regras customizadas de comissão baseadas em:
- **Tier** (Silver/Gold/Platinum/Diamond)
- **Performance** (volume acumulado no mês)
- **Sazonalidade** (boost em meses de campanha)

## Algoritmo
```
comissao_base = valor_venda * taxa_tier(vendedor.tier)
boost_performance = 1.0 + (volume_mes / meta_mes) * 0.10  # até +10%
boost_sazonal = 1.15 if mes in [11, 12] else 1.0  # Natal
comissao_final = comissao_base * boost_performance * boost_sazonal
```

## Limites
- Comissão mínima: R$ 10
- Comissão máxima: R$ 50.000
- Aprovação humana se: comissao_final > R$ 20.000
```

## 🚀 Passo 2 — Implementar handler.ts

```typescript
import { SkillHandler, SkillContext } from '@nexus/types';

interface ComissaoInput {
  vendedor_id: string;
  valor_venda: number;
  mes: number;
}

interface ComissaoOutput {
  comissao_final: number;
  componentes: {
    base: number;
    boost_performance: number;
    boost_sazonal: number;
  };
}

const TAXAS_TIER = {
  silver: 0.05,
  gold: 0.08,
  platinum: 0.12,
  diamond: 0.15
};

export const handler: SkillHandler<ComissaoInput, ComissaoOutput> = {
  async execute(input: ComissaoInput, ctx: SkillContext) {
    // 1. Validação
    if (input.valor_venda <= 0) {
      throw new Error('valor_venda deve ser positivo');
    }

    // 2. Buscar tier do vendedor
    const vendedor = await ctx.db.vendedores.findUnique({
      where: { id: input.vendedor_id }
    });
    const taxa = TAXAS_TIER[vendedor.tier];

    // 3. Calcular componentes
    const base = input.valor_venda * taxa;
    
    const volumeMes = await ctx.db.vendas.aggregate({
      where: { vendedor_id: input.vendedor_id, mes: input.mes },
      sum: { valor: true }
    });
    const metaMes = vendedor.meta_mensal;
    const boostPerf = Math.min(1.10, 1.0 + (volumeMes / metaMes) * 0.10);
    
    const boostSazonal = [11, 12].includes(input.mes) ? 1.15 : 1.0;

    // 4. Aplicar boosts
    let comissaoFinal = base * boostPerf * boostSazonal;

    // 5. Aplicar limites
    comissaoFinal = Math.max(10, Math.min(50000, comissaoFinal));

    // 6. Se alto valor, requer aprovação humana
    if (comissaoFinal > 20000) {
      await ctx.queueHumanApproval({
        tipo: 'comissao_alta',
        valor: comissaoFinal,
        vendedor_id: input.vendedor_id
      });
    }

    // 7. Audit log
    await ctx.audit.log({
      skill: 'comissao-custom',
      input,
      output: { comissao_final: comissaoFinal, componentes: { base, boostPerf, boostSazonal } },
      approver: comissaoFinal > 20000 ? 'human_required' : 'autonomous'
    });

    return {
      comissao_final: comissaoFinal,
      componentes: { base, boost_performance: boostPerf, boost_sazonal: boostSazonal }
    };
  }
};

export default handler;
```

## 🚀 Passo 3 — Testes

```typescript
// tests/comissao-custom.test.ts
import { handler } from '../handler';

describe('Comissão Customizada', () => {
  test('Vendedor Silver, venda R$ 1.000, mês 6', async () => {
    const result = await handler.execute({
      vendedor_id: 'v_123',
      valor_venda: 1000,
      mes: 6
    }, mockContext);
    
    expect(result.comissao_final).toBe(50); // 5% * 1000
    expect(result.componentes.boost_sazonal).toBe(1.0);
  });

  test('Vendedor Gold, venda R$ 10.000, mês 12 (Natal)', async () => {
    const result = await handler.execute({
      vendedor_id: 'v_456',
      valor_venda: 10000,
      mes: 12
    }, mockContext);
    
    expect(result.comissao_final).toBe(920); // 800 * 1.0 * 1.15
  });

  test('Vendedor Diamond, valor que requer aprovação', async () => {
    const result = await handler.execute({
      vendedor_id: 'v_789',
      valor_venda: 200000,
      mes: 6
    }, mockContext);
    
    expect(mockContext.queueHumanApproval).toHaveBeenCalled();
  });
});
```

## 🚀 Passo 4 — Registrar e Deployar

```bash
# Validar schema
nexus skill validate ./minha-skill-custom/

# Registrar na plataforma
nexus skill register ./minha-skill-custom/

# Deployar para produção
nexus skill deploy --slug comissao-custom --env production

# Smoke test
nexus skill test --slug comissao-custom
```

## 📊 Monitoramento Pós-Deploy

```bash
# Ver execuções
nexus skill logs --slug comissao-custom --tail 100

# Métricas
nexus skill metrics --slug comissao-custom --window 24h
```

Métricas esperadas:
- p50 latência: < 200ms
- p95 latência: < 500ms
- Taxa de aprovação humana: < 5%
- Taxa de erro: < 0.5%

---

*Acad. Nexus · 2026 · Master → Elite*
