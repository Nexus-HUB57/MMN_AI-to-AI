# Documentação Técnica do Projeto MMN AI-to-AI

Esta documentação técnica fornece uma visão aprofundada da arquitetura, tecnologias utilizadas, estrutura do código e diretrizes de desenvolvimento para o sistema MMN AI-to-AI.

## 1. Visão Geral do Sistema

O MMN AI-to-AI é uma plataforma de marketing multinível que integra funcionalidades de inteligência artificial para otimizar a geração de conteúdo, gerenciamento de afiliados e operações de marketplace. O sistema é construído com uma arquitetura moderna, visando escalabilidade, segurança e manutenibilidade.

## 2. Arquitetura do Sistema

O sistema adota uma arquitetura de microsserviços, dividida em componentes frontend e backend que se comunicam através de APIs bem definidas.

### 2.1. Frontend

O frontend é desenvolvido utilizando React com TypeScript, proporcionando uma interface de usuário dinâmica e tipada. O gerenciamento de estado é feito com bibliotecas modernas, e a comunicação com o backend é realizada via tRPC para garantir a segurança de tipo de ponta a ponta.

*   **Tecnologias**: React, TypeScript, TailwindCSS.
*   **Estrutura**: Componentes reutilizáveis, páginas (e.g., `frontend/src/pages/`), hooks personalizados.

### 2.2. Backend

O backend é construído com Node.js e TypeScript, utilizando o framework tRPC para a criação de APIs. Ele é responsável pela lógica de negócios, persistência de dados, integrações com serviços externos (marketplaces, pagamentos) e funcionalidades de IA.

*   **Tecnologias**: Node.js, TypeScript, tRPC, Prisma (ORM), MySQL/PostgreSQL (banco de dados).
*   **Estrutura**: Routers (e.g., `backend/src/routers/`), serviços (e.g., `backend/src/services/`), configurações (e.g., `backend/src/config/`).

### 2.3. Banco de Dados

O sistema utiliza um banco de dados relacional (MySQL ou PostgreSQL) para armazenar informações de usuários, afiliados, comissões, produtos, pedidos e configurações do sistema. O Prisma ORM é utilizado para interagir com o banco de dados de forma segura e tipada.

## 3. Estrutura de Diretórios e Módulos Principais

```
MMN_AI-to-AI/
├── backend/                 # Código-fonte do backend
│   ├── src/                 # Arquivos de origem do backend
│   │   ├── config/          # Configurações do sistema (env, tRPC, cookies)
│   │   ├── routers/         # Definições de rotas tRPC (e.g., mmnRouter, authRouter)
│   │   └── services/        # Lógica de negócios e integrações (e.g., mmn.ts, payments.ts)
│   └── ...
├── frontend/                # Código-fonte do frontend
│   ├── src/                 # Arquivos de origem do frontend
│   │   ├── pages/           # Páginas da aplicação (e.g., Dashboard.tsx, Login.tsx)
│   │   └── components/      # Componentes reutilizáveis
│   └── ...
├── docs/                    # Documentação do projeto
│   ├── admin-guide.md       # Guia do Administrador
│   ├── affiliate-guide.md   # Guia de Uso para Afiliados
│   └── trpc-api.md          # Documentação da API tRPC
├── tests/                   # Testes unitários e de integração
│   └── unit/                # Testes unitários (e.g., mmn.test.ts, payments.test.ts)
└── ...
```

## 4. Tecnologias Chave

| Categoria       | Tecnologia    | Descrição                                                                                             |
| :-------------- | :------------ | :---------------------------------------------------------------------------------------------------- |
| **Frontend**    | React         | Biblioteca JavaScript para construção de interfaces de usuário.                                       |
|                 | TypeScript    | Superset de JavaScript que adiciona tipagem estática.                                                 |
|                 | TailwindCSS   | Framework CSS utilitário para estilização rápida e responsiva.                                        |
| **Backend**     | Node.js       | Ambiente de execução JavaScript assíncrono para o servidor.                                           |
|                 | tRPC          | Framework para construir APIs Type-Safe em TypeScript.                                                |
|                 | Prisma        | ORM (Object-Relational Mapper) para interação com o banco de dados.                                   |
| **Banco de Dados**| MySQL/PostgreSQL| Banco de dados relacional para persistência de dados.                                                 |
| **Testes**      | Vitest        | Framework de teste rápido para JavaScript/TypeScript.                                                 |
| **Controle de Versão**| Git/GitHub    | Sistema de controle de versão distribuído e plataforma de hospedagem de código.                       |

## 5. Diretrizes de Desenvolvimento

### 5.1. Convenções de Código

*   **TypeScript**: Priorizar o uso de TypeScript para garantir a segurança de tipo e melhorar a manutenibilidade do código.
*   **Formatação**: Utilizar Prettier para formatação automática do código.
*   **Linting**: Utilizar ESLint para identificar e corrigir problemas de código.

### 5.2. Testes

*   Todos os novos recursos e correções de bugs devem ser acompanhados por testes unitários e/ou de integração relevantes.
*   Os testes devem ser executados antes de cada commit e push para garantir a estabilidade do sistema.

### 5.3. Deploy

O processo de deploy é automatizado via CI/CD, garantindo que as alterações sejam entregues de forma consistente e eficiente. O ambiente de produção é hospedado em provedores de nuvem que oferecem escalabilidade e alta disponibilidade.

## 6. Funcionalidades de IA

O sistema integra funcionalidades de inteligência artificial para:

*   **Geração de Conteúdo**: Criação automática de e-books, textos de marketing e outros materiais promocionais.
*   **Otimização de Campanhas**: Análise de dados para sugerir as melhores estratégias de marketing para afiliados.
*   **Agentes de IA**: Assistentes virtuais para suporte a afiliados e administradores.

## Referências

[1] [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
[2] [Documentação Oficial tRPC](https://trpc.io/docs/)
[3] [Documentação Oficial React](https://react.dev/)
[4] [Documentação Oficial Node.js](https://nodejs.org/docs/latest/api/)
[5] [Documentação Oficial Prisma](https://www.prisma.io/docs/)
