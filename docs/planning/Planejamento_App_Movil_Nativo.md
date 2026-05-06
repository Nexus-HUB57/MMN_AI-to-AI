# Planejamento Estratégico: Desenvolvimento do Aplicativo Móvel Nativo (iOS/Android)

## 1. Visão Geral e Objetivos

O desenvolvimento de um aplicativo móvel nativo para iOS e Android é crucial para expandir o alcance da plataforma MMN AI-to-AI, oferecendo uma experiência otimizada e acessível aos afiliados. O objetivo principal é consolidar as funcionalidades existentes da plataforma web em um formato móvel intuitivo, com foco em gerenciamento de rede, monitoramento de agentes IA, acompanhamento de comissões e acesso a ferramentas de geração de conteúdo.

O aplicativo será construído utilizando **Expo e React Native**, aproveitando a configuração inicial já presente no arquivo `app.config.ts` e seguindo as diretrizes de design detalhadas em `design.md`.

## 2. Análise do Estado Atual

A análise dos arquivos `todo.md`, `design.md` e `app.config.ts` revela um bom ponto de partida para o desenvolvimento do aplicativo móvel:

*   **Estrutura de Projeto**: O `app.config.ts` indica que um projeto Expo/React Native já foi inicializado, com configurações de `bundleId`, `scheme`, `permissions` (incluindo `POST_NOTIFICATIONS`), e plugins essenciais como `expo-router`, `expo-audio`, `expo-video`, e `expo-splash-screen`.
*   **Design Detalhado**: O `design.md` fornece uma especificação funcional completa, incluindo:
    *   **Orientação e Usabilidade**: Foco em retrato, uso com uma mão e aderência ao Apple Human Interface Guidelines.
    *   **Telas Principais**: Home/Dashboard, Rede, Agente IA, Comissões, Marketplace e Perfil/Configurações, com conteúdo e funcionalidades esperadas para cada uma.
    *   **Fluxos de Usuário**: Três fluxos principais (Novo Afiliado, Indicar Novo Afiliado, Acompanhar Comissões) que guiarão a implementação.
    *   **Paleta de Cores e Componentes Reutilizáveis**: Definição de cores e componentes como Card, Button, Badge, Chart, Avatar e Tab Bar, que facilitarão a consistência visual.
    *   **Considerações de Performance**: Lazy loading, cache local com AsyncStorage, sincronização em background e notificações push já estão previstos.
*   **Lista de Tarefas (todo.md)**: O arquivo `todo.md` já descreve fases de desenvolvimento para o mobile, que serão a base para este planejamento:
    *   Fase 1: Estrutura Base e Navegação (Configurar tema, componentes base, Tab Bar, integrar tRPC client).
    *   Fase 2: Telas Principais (Home, Rede, Agente IA, Comissões, Marketplace, Perfil).
    *   Fase 3: Funcionalidades Principais (Autenticação OAuth Manus, Pull-to-refresh, Busca/Filtro, Compartilhamento, Saque, Gráficos).
    *   Fase 4: Integração com Backend (Conectar queries tRPC para todas as telas).
    *   Fase 5: Notificações e Sincronização (Push notifications, Sincronização em background, Cache local, Atualização automática de status).
    *   Fase 6: Testes e Polimento (Testes unitários, integração, navegação, performance, testes em iOS/Android).

## 3. Plano de Desenvolvimento Detalhado

O desenvolvimento seguirá as fases já delineadas no `todo.md`, com aprofundamento das tarefas e tecnologias envolvidas:

### Fase 1: Estrutura Base e Navegação

*   **Configuração de Ambiente**: Validar e configurar o ambiente de desenvolvimento Expo/React Native, incluindo dependências e ferramentas.
*   **Tema e Estilização**: Implementar o tema e a paleta de cores (`design.md`) utilizando Tailwind CSS (conforme `app.config.ts` e `ARCHITECTURE.md`) e `shadcn/ui` para componentes estilizados.
*   **Componentes Base**: Desenvolver os componentes reutilizáveis (Card, Button, Badge, Avatar) conforme especificado em `design.md`.
*   **Navegação (Tab Bar)**: Implementar a navegação principal com 5 abas (Home, Rede, Agente, Comissões, Perfil) utilizando `expo-router`.
*   **Integração tRPC Client**: Configurar o cliente tRPC para comunicação com o backend, garantindo tipagem segura das chamadas de API.

### Fase 2: Telas Principais

*   **Home/Dashboard**: Desenvolver a tela principal com saldo, status do agente IA, últimas vendas e mini-gráfico de ganhos. Implementar `pull-to-refresh`.
*   **Rede**: Criar a tela de visualização da rede, incluindo a árvore hierárquica (com expansão/colapso), contagem de diretos/indiretos e filtro por nome/ID.
*   **Agente IA**: Desenvolver a tela de monitoramento e configuração do agente, exibindo status, métricas (energia, saúde, criatividade, reputação), seleção de estratégia e log de ações.
*   **Comissões**: Implementar a tela de histórico de comissões com filtros por período, detalhamento por origem/nível/valor/status e funcionalidade de solicitação de saque.
*   **Marketplace**: Criar a tela de produtos em alta, exibindo cards com imagem, título, preço, comissão e tendência. Incluir filtros por marketplace e funcionalidade de salvar favoritos.
*   **Perfil/Configurações**: Desenvolver a tela de perfil com dados pessoais, link de indicação (com compartilhamento), preferências de notificação e tema (claro/escuro).

### Fase 3: Funcionalidades Principais

*   **Autenticação OAuth Manus**: Integrar o fluxo de autenticação OAuth com o sistema Manus, conforme `ARCHITECTURE.md`.
*   **Compartilhamento de Links**: Implementar a funcionalidade de compartilhamento de links de indicação.
*   **Solicitação de Saque**: Desenvolver a interface e a lógica para solicitar saque de comissões.
*   **Gráficos de Ganhos**: Integrar uma biblioteca de gráficos (ex: Recharts, se compatível com React Native, ou alternativa nativa) para exibir o histórico de ganhos.

### Fase 4: Integração com Backend (tRPC)

*   **Conexão de Dados**: Conectar todas as telas do aplicativo às queries e mutations tRPC correspondentes no backend, garantindo que os dados exibidos sejam dinâmicos e atualizados em tempo real.

### Fase 5: Notificações e Sincronização

*   **Notificações Push**: Implementar notificações push para eventos importantes (novas comissões, atualizações de status do agente, etc.) utilizando `expo-notifications`.
*   **Sincronização em Background**: Configurar a sincronização de dados em background para manter as informações atualizadas mesmo quando o aplicativo não está em uso ativo.
*   **Cache Local**: Utilizar AsyncStorage para cache local de dados, melhorando a performance e a experiência offline.
*   **Atualização Automática de Status do Agente**: Implementar a lógica para que o status do agente seja atualizado automaticamente no aplicativo.

### Fase 6: Testes e Polimento

*   **Testes Unitários**: Desenvolver testes unitários para os componentes e lógicas de negócio do aplicativo.
*   **Testes de Integração**: Realizar testes de integração com o backend tRPC para garantir a comunicação correta.
*   **Testes de Navegação**: Validar todos os fluxos de navegação e usabilidade do aplicativo.
*   **Testes de Performance**: Otimizar o desempenho do aplicativo, garantindo fluidez e responsividade.
*   **Testes em Dispositivos Reais**: Realizar testes extensivos em dispositivos iOS e Android (via Expo Go e builds de produção) para garantir compatibilidade e corrigir bugs específicos de plataforma.

## 4. Cronograma e Recursos

| Fase | Descrição | Duração Estimada | Recursos Necessários |
| :--- | :--- | :--- | :--- |
| 1 | Estrutura Base e Navegação | 2 semanas | Desenvolvedor Mobile (React Native/Expo), Designer UX/UI |
| 2 | Telas Principais | 4 semanas | Desenvolvedor Mobile (React Native/Expo), Designer UX/UI |
| 3 | Funcionalidades Principais | 3 semanas | Desenvolvedor Mobile (React Native/Expo), Desenvolvedor Backend |
| 4 | Integração com Backend (tRPC) | 2 semanas | Desenvolvedor Mobile (React Native/Expo), Desenvolvedor Backend |
| 5 | Notificações e Sincronização | 2 semanas | Desenvolvedor Mobile (React Native/Expo) |
| 6 | Testes e Polimento | 3 semanas | Desenvolvedor Mobile (React Native/Expo), QA Tester |

## 5. Impacto Esperado

O aplicativo móvel nativo trará os seguintes benefícios:

*   **Aumento do Engajamento**: Maior facilidade de acesso e usabilidade, incentivando o uso diário da plataforma pelos afiliados.
*   **Melhora da Produtividade**: Ferramentas de gerenciamento e geração de conteúdo acessíveis a qualquer momento e lugar.
*   **Vantagem Competitiva**: Oferecer uma experiência móvel de alta qualidade diferencia a plataforma no mercado.
*   **Notificações em Tempo Real**: Manter os afiliados informados sobre eventos críticos, como novas comissões e status do agente, aumentando a proatividade.
