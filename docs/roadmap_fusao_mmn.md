# Roadmap de Fusão: Legado PHP para Sistema MMN AI-to-AI

**Objetivo**: Migrar as funcionalidades do sistema legado PHP (mantido como referência em `Legado_PHP/`) para a nova arquitetura full-stack do MMN AI-to-AI, garantindo a modernização sem perda das regras de negócio originais.

## Fase 0: Mapeamento e Análise
- [ ] **Auditoria completa do `Legado_PHP`**: Listar todas as funcionalidades (páginas, painéis, lógicas de comissão, gestão de usuários).
- [ ] **Cruzamento com o novo sistema**: Mapear cada funcionalidade do legado com seu equivalente no novo sistema (`backend`, `frontend`, `database`).

| Funcionalidade (Legado PHP) | Arquivo/Diretório de Referência | Módulo Destino no Novo Sistema (MMN AI-to-AI) | Status |
| :--- | :--- | :--- | :--- |
| Página inicial / landing page | `index.php` | `frontend/src/pages/landing` | Pendente |
| Painel do Afiliado (Backoffice) | `/painel` | `frontend/src/components/Dashboard.tsx` | Pendente |
| Painel Administrativo | `/adm` | `frontend/src/pages/admin` | Pendente |
| Lógica de Comissões | `inc123/` | `backend/src/services/commissions.ts` | Pendente |
| Rede de Afiliados | `clientes/` | `backend/src/routers/mmnRouter.ts` | Pendente |
| Sistema de Pagamentos/Faturas | `fatura/`, `boletos123/` | `backend/src/routers/paymentRouter.ts` (a criar) | Pendente |
| Geração de Conteúdo IA | Não existia | `backend/src/services/llm-v2.ts` | **Novo!** |

## Fase 1: Fundação e Banco de Dados
- [ ] **Migração de Dados (PHP -> MySQL)**: Criar scripts para migrar dados de usuários, rede e comissões do sistema legado para o banco de dados `MySQL` do novo sistema, respeitando o schema definido em `database/schemas/schema-final.ts`.
- [ ] **Autenticação**: Substituir a autenticação antiga do PHP pela nova camada de autenticação híbrida (`Firebase Auth` + `Next-Auth`) garantindo a migração segura de senhas.

## Fase 2: Migração de Regras de Negócio e Backend
- [ ] **Motor MMN**: Refinar o serviço `commissions.ts` (já existente) para suportar integralmente as regras de negócio do sistema legado, como percentuais de bônus e compressão dinâmica.
- [ ] **Tracking Neural**: Implementar ou adaptar o sistema de rastreamento de links (`anunciar.php`) usando o `Tracking Neural` do novo sistema.
- [ ] **Processamento Assíncrono**: Criar filas (BullMQ/Redis) para tarefas que no PHP eram síncronas (ex: geração de boletos, disparo de emails).

## Fase 3: Modernização do Frontend
- [ ] **Reconstrução de Páginas**: Migrar as interfaces de usuário do `painel/` e `adm/` para componentes React/Next.js, consumindo as novas APIs tRPC.
- [ ] **UI e Experiência**: Aplicar a identidade visual do novo sistema (ShadCN UI/Tailwind) nas novas páginas.
- [ ] **Integração com IA**: Criar interfaces para o `IA Content Hub` e o painel de orquestração de agentes, funcionalidades inexistentes no legado.

## Fase 4: Testes e Validação Final
- [ ] **Sandbox de Testes**: Utilizar o `Sandbox Nexus` para simular operações e validar a integridade da migração.
- [ ] **Testes de Regressão**: Validar se todas as funcionalidades mapeadas do legado operam conforme o esperado no novo sistema.
- [ ] **Documentação**: Atualizar o `README.md` principal com as novas instruções e funcionalidades.

## Fase 5: Atualização Contínua do Repositório
- [ ] **Ação Crítica**: A cada modificação ou inserção de módulo, fazer commit e push para o repositório `main` com uma mensagem clara.
*Última atualização: 2026-05-13*

Análise de Engenharia: O Salto Tecnológico
A fusão do Legado_PHP com o MMN AI-to-AI representa a transição da "Web 2.0 Operacional" para a "Web 3.0 Autônoma".
1. Desafios da Camada de Dados (Data Layer)
O legado utiliza uma estrutura de tabelas PHP/MySQL convencional. O novo sistema utiliza Drizzle ORM com um schema tipado em TypeScript.Ação: Implementaremos um adapter de migração. O arquivo database/schemas/schema-final.ts deve ser estendido para suportar campos legados de "Data de Cadastro" e "Hierarquia de Indicação" (Upline/Downline) sem perda de integridade referencial.

2. Transição de Lógica de Negócio (Comissionamento)
No PHP, a lógica de comissão costuma ser processada via scripts síncronos. No novo sistema, utilizaremos o BullMQ com Redis para processar o motor de comissões de forma assíncrona.Vantagem: Isso evita o timeout do servidor em redes de grande escala e permite o Rastreamento Neural para identificar fraudes em tempo real.

3. Orquestração IA-to-AI
Diferente do legado, onde o usuário fazia tudo, o novo sistema introduz agentes que gerenciam a rede. O Google Genkit atuará como o "Cérebro" que analisa o desempenho da rede legada e sugere estratégias de bônus baseadas em XP.

Roadmap de Fusão Detalhado (docs/roadmap_fusao_mmn.md)

Estrutura para o commit. O foco inicial será a Fase 0 e Fase 1.
Tabela de Prioridades Imediatas
| Módulo Legado | Tecnologia Nova | Estratégia de Fusão |
| :--- | :--- | :--- |
| `inc123/funcoes.php` | `backend/src/services/commissions.ts` | Portabilidade: Converter algoritmos PHP para funções puras TS. |
| `painel/` (Bootstrap) | `frontend/src/app/(dashboard)` | Componentização: Usar ShadCN para recriar widgets de saldo. |
| `adm/config.php` | `backend/src/config/env.ts` | Segurança: Migrar variáveis globais para variáveis de ambiente (Vercel/Docker). |
| `fatura/` | `backend/src/routers/paymentRouter.ts` | Integração: Implementar Webhooks para confirmação automática via IA. |

Próximos Passos (Snapshot de Hoje):
[x] Análise de arquitetura completa.
[ ] Inicializar docs/roadmap_fusao_mmn.md.
[ ] Mapear as tabelas do banco de dados demo.br20.net para o Drizzle Schema.
[ ] Iniciar o Refactoring da lógica de comissões de Legado_PHP para Node.js/tRPC.

Próximos Passos Imediatos
Iniciar o Repositório Local:

```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI
```
Criar o Roadmap: Copie o conteúdo da seção 3 acima para um novo arquivo chamado docs/roadmap_fusao_mmn.md na sua máquina local.

Primeiro Commit da Fusão:

```bash
git add docs/roadmap_fusao_mmn.md
git commit -m "docs: Adiciona roadmap detalhado para a fusão do Legado PHP"
git push origin main
```
Iniciar a Fase 0: Comece a auditar a pasta Legado_PHP em seu computador e preencha a coluna "Status" na tabela do roadmap.
