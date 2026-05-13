# Roadmap de Fusão MMN AI-to-AI

## Persona e Contexto
Liderança da fusão entre o sistema legado PHP e o moderno MMN AI-to-AI, preservando regras de negócio e evoluindo a tecnologia.

## Sistemas Envolvidos
- **Novo sistema MMN AI-to-AI**: Next.js 15, Tailwind, tRPC, Drizzle ORM, Google Genkit.
- **Sistema legado PHP**: Localizado em `Legado_PHP/`. Referência demo: [Painel Afiliado](https://demo.br20.net/marketing/painel/) / [Painel ADM](https://demo.br20.net/marketing/adm/).

## Fase 0: Mapeamento e Análise (EM EXECUÇÃO)
| Funcionalidade (Legado PHP) | Referência | Destino no Novo Sistema | Status |
| :--- | :--- | :--- | :--- |
| Página inicial / landing page | index.php | frontend/src/pages/landing | Pendente |
| Painel do Afiliado | /painel | frontend/src/components/Dashboard.tsx | Em Análise |
| Painel Administrativo | /adm | frontend/src/pages/admin | Em Análise |
| Lógica de Comissões | inc123/pgto_functions.php | backend/src/services/commissions.ts | Mapeado |
| Rede de Afiliados | clientes/ | backend/src/routers/mmnRouter.ts | Pendente |
| Sistema de Pagamentos/Faturas | fatura/, boletos123/ | backend/src/routers/paymentRouter.ts | Pendente |
| Geração de Conteúdo IA | Não existia | backend/src/services/llm-v2.ts | Novo! |

## Fase 1: Fundação e Banco de Dados
- Migração de dados respeitando o schema `database/schemas/schema-final.ts`.
- Autenticação híbrida (Firebase Auth + Next-Auth).

## Fase 2: Migração de Regras de Negócio e Backend
- Motor MMN: Refinar `commissions.ts` com regras legadas.
- Tracking Neural: Adaptação do rastreamento de links.
- Processamento assíncrono via BullMQ/Redis.

## Fase 3: Modernização do Frontend
- Reconstrução das páginas com ShadCN UI e Tailwind.
- Interfaces para IA Content Hub.

## Fase 4: Testes e Validação Final
- Simulação no Sandbox Nexus.
- Testes de regressão e documentação final.

## Fase 5: Atualização Contínua
- Commits atômicos e push em tempo real para a branch main.
