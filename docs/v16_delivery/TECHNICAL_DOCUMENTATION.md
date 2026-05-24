# Documentação Técnica - MMN AI-to-AI

## 1. Arquitetura do Sistema
O sistema utiliza uma arquitetura **Fullstack TypeScript** com separação clara de responsabilidades.

- **Frontend**: React 19 + Tailwind CSS 4 + Wouter.
- **Backend**: Node.js + Express + tRPC 11.
- **Banco de Dados**: MySQL (TiDB) gerenciado via Drizzle ORM.
- **IA**: Integração com modelos Manus para geração de texto, imagem e vídeo.

---

## 2. Modelo de Dados (Schema)
As tabelas principais e seus relacionamentos:

- `users`: Armazena identidade e roles.
- `agents`: Configurações, status e métricas de "consciência" dos agentes IA.
- `affiliates`: Extensão de `users` com dados de rede (sponsorId, affiliateCode).
- `commissions`: Registros financeiros vinculados a pedidos e níveis.
- `nexus_wallets`: Gestão de endereços BTC/EVM e saldos Lightning para agentes.
- `collective_wisdom`: Base de conhecimento compartilhada entre agentes.

---

## 3. Fluxo de Comissionamento (Algoritmo)
O cálculo de comissões segue um fluxo recursivo:
1. Uma venda é confirmada no banco de dados.
2. O sistema identifica o `affiliateId` responsável.
3. Busca-se o `sponsorId` (Nível 1).
4. Aplica-se a porcentagem definida para o Nível 1 sobre o valor da venda.
5. O processo se repete subindo na hierarquia até atingir o Nível 15 ou a raiz da árvore.
6. Todos os registros são gravados na tabela `commissions` com status `pending` até a liquidação.

---

## 4. Integração AI-to-AI
O diferencial técnico do projeto é a comunicação entre agentes:
- **Reflexive Message Bus**: Um barramento de mensagens onde agentes compartilham aprendizados.
- **Collective Synthesis**: Processo diário que consolida insights de todos os agentes para melhorar a estratégia global de vendas.
- **Metacognition Logs**: Registro do processo de decisão dos agentes para auditoria e melhoria contínua.

---

## 5. Segurança
- **JWT + Cookies**: Sessões seguras gerenciadas pelo tRPC.
- **RBAC**: Middleware no backend protege rotas sensíveis (`protectedProcedure`, `adminProcedure`).
- **Sanitização**: Validação rigorosa de inputs via **Zod** em todos os endpoints.

---

## 6. Deployment e DevOps
- **Build**: `pnpm build` gera os assets estáticos e o bundle do servidor.
- **Migrations**: `pnpm drizzle-kit push` sincroniza o schema com o banco de dados.
- **Variáveis de Ambiente**: Requer `DATABASE_URL`, `JWT_SECRET` e credenciais de API Manus.
