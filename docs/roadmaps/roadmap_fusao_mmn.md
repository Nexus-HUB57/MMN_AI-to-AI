# Roadmap de Fusão MMN AI-to-AI

## Contexto
Este roadmap orienta a fusão entre o **sistema legado PHP** e o **MMN AI-to-AI**, preservando regras de negócio críticas enquanto a plataforma moderna assume gradualmente a operação.

## Sistemas envolvidos
- **Novo sistema MMN AI-to-AI**: React 18 + Vite + wouter no frontend; Node.js + Express + tRPC no backend; Drizzle ORM + MySQL 8; Redis/BullMQ; Genkit.
- **Sistema legado PHP**: localizado em `legacy/`, com módulos administrativos, autenticação histórica, afiliados, comissões e pagamentos ainda em fase de mapeamento técnico.

## Princípios da fusão
1. **Strangler Fig**: substituir o legado por domínio, não por reescrita total.
2. **Backend como camada anti-corrupção**: o frontend moderno deve falar apenas com o backend novo.
3. **Fonte da verdade explícita**: cada domínio deve ter ownership definido durante a transição.
4. **Reconciliação antes de corte**: pagamentos, comissões, upgrades e árvore MMN exigem validação comparativa.

## Fase 0 — Mapeamento e análise
| Domínio | Origem legada | Destino no sistema novo | Status |
|---|---|---|---|
| Usuários / clientes | arquivos e tabelas legadas | `users` / `affiliates` | Parcialmente mapeado |
| Patrocínio / rede | regras MMN antigas | `network`, `affiliates.sponsorId` | Em análise |
| Comissões | lógica PHP histórica | `backend/src/services/commissions.ts` | Parcialmente mapeado |
| Pagamentos / faturas | módulos legados | `payments`, `orders`, `commissions` | Pendente |
| Conteúdo / IA | não existia no legado | `backend/src/services/llm-v2.ts`, Genkit | Nativo do sistema novo |

## Fase 1 — Fundação técnica
- Bootstrap mínimo validado para frontend e backend.
- Documentação alinhada ao código real.
- `.gitignore` e versionamento saneados para evitar artefatos locais no repositório.
- Resultado documentado em `docs/VALIDACAO_FUSAO_FASE1.md`.

## Fase 2 — Reintrodução controlada dos módulos
- Reativar routers reais de forma incremental (`system`, `mmn`, `dashboard`, `payments`).
- Normalizar middlewares de autenticação e contexto.
- Remover placeholders de tipagem entre frontend e backend.
- Criar testes de contrato para namespaces tRPC reintroduzidos.

## Fase 3 — Compatibilidade de dados
- Criar tabela de equivalência entre IDs do legado e IDs do sistema novo.
- Migrar e reconciliar usuários, afiliados, patrocinadores, pedidos e comissões.
- Implementar jobs BullMQ para sincronização e auditoria.

## Fase 4 — Validação operacional
- Homologar runtime ponta a ponta.
- Validar `/health`, `/trpc/system.health`, autenticação, CORS e workers.
- Executar reconciliação entre resultados do legado e do sistema novo (shadow mode).

## Fase 5 — Cutover progressivo
- Definir data de corte por domínio.
- Desligar módulos PHP apenas após validação funcional e monitoramento.
- Manter rollback e trilha de auditoria durante toda a transição.
