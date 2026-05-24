# Plano de Desenvolvimento do Aplicativo Móvel Nativo (iOS/Android)

## 1. Arquitetura Técnica e Stack Tecnológico

O aplicativo móvel nativo para a plataforma MMN AI-to-AI será desenvolvido com foco em performance, escalabilidade e experiência do usuário, aproveitando as tecnologias modernas e a infraestrutura existente.

### 1.1. Stack Tecnológico

O projeto utilizará o seguinte stack tecnológico, conforme indicado pelo `app.config.ts` e as melhores práticas para desenvolvimento cross-platform:

| Categoria | Tecnologia | Detalhes | Justificativa |
| :-------- | :--------- | :------- | :------------ |
| **Framework** | **React Native** | Versão mais recente via Expo | Permite desenvolvimento multiplataforma com uma única base de código, acelerando o desenvolvimento e reduzindo custos. |
| **Ambiente** | **Expo** | Gerenciado (SDK 51+) | Simplifica o setup, build e deploy, além de fornecer acesso a APIs nativas e ferramentas de desenvolvimento. |
| **Linguagem** | **TypeScript** | Versão mais recente | Garante tipagem segura, melhora a manutenibilidade do código e reduz erros em tempo de desenvolvimento. |
| **Estilização** | **Tailwind CSS** | Versão mais recente | Abordagem utilitária para CSS, facilitando a criação de interfaces responsivas e consistentes com o design system. |
| **Componentes UI** | **Customizados / shadcn/ui** | Baseados no `design.md` | Reutilização de componentes para consistência visual e agilidade no desenvolvimento. |
| **Navegação** | **Expo Router** | Versão mais recente | Solução de roteamento baseada em arquivos, simplificando a gestão de rotas e navegação complexa. |
| **Comunicação API** | **tRPC Client** | Versão 11+ | Garante tipagem segura de ponta a ponta entre frontend e backend, reduzindo erros de integração e aumentando a produtividade. |
| **Autenticação** | **OAuth Manus** | Integração nativa | Utiliza o sistema de autenticação existente da plataforma Manus para segurança e single sign-on. |
| **Estado Global** | **Zustand / React Context** | Gerenciamento de estado leve | Soluções eficientes para gerenciar o estado da aplicação de forma reativa e performática. |
| **Cache Local** | **AsyncStorage** | React Native Community | Armazenamento persistente de dados no dispositivo para melhorar a performance e a experiência offline. |
| **Notificações** | **Expo Notifications** | Integração nativa | Permite o envio e gerenciamento de notificações push para iOS e Android. |
| **Multimídia** | **Expo Audio / Expo Video** | Plugins nativos | Suporte para reprodução de áudio e vídeo, conforme as necessidades de conteúdo gerado por IA. |

### 1.2. Arquitetura do Aplicativo

A arquitetura do aplicativo seguirá o padrão **MVVM (Model-View-ViewModel)** ou **Clean Architecture**, promovendo a separação de responsabilidades, testabilidade e manutenibilidade. A estrutura de pastas será organizada por módulos funcionais (ex: `features/auth`, `features/dashboard`, `features/agent`) e camadas (ex: `components`, `services`, `hooks`, `utils`).

*   **Camada de Apresentação (View/ViewModel)**: Responsável pela interface do usuário e lógica de apresentação. Utilizará React Native, Expo Router e componentes customizados.
*   **Camada de Domínio (Model)**: Contém a lógica de negócio e os modelos de dados. Interagirá com o tRPC Client para buscar e enviar dados ao backend.
*   **Camada de Dados (Repository)**: Abstrai a origem dos dados (API, cache local). O tRPC Client atuará como principal interface com o backend, enquanto o AsyncStorage gerenciará o cache local.

### 1.3. Configurações Essenciais (app.config.ts)

O arquivo `app.config.ts` já estabelece configurações cruciais:

*   **Bundle ID e Scheme**: Definidos para iOS e Android, garantindo a identificação única do aplicativo e suporte a deep linking.
*   **Permissões**: `POST_NOTIFICATIONS` já configurada para Android, essencial para o sistema de notificações.
*   **Plugins Expo**: `expo-router`, `expo-audio`, `expo-video`, `expo-splash-screen`, `expo-build-properties` já integrados, fornecendo funcionalidades nativas prontas para uso.
*   **New Architecture Enabled**: `newArchEnabled: true` indica que o aplicativo está configurado para a nova arquitetura do React Native, que oferece melhor performance e interoperabilidade com módulos nativos.))

## 2. Detalhamento dos Módulos Funcionais e Requisitos Técnicos por Tela

Com base no `design.md` e no `todo.md`, cada tela principal terá os seguintes requisitos técnicos e funcionais:

### 2.1. Home / Dashboard

*   **Conteúdo**: Saldo total de comissões (tRPC), status do agente IA (tRPC), últimas vendas (tRPC), botões de ação rápida.
*   **Funcionalidade**: `Pull-to-refresh` (React Native `RefreshControl`), mini-gráfico de ganhos (biblioteca de gráficos, ex: `react-native-chart-kit`).
*   **Requisitos Técnicos**: Integração com `mmn.getProfile`, `getTotalCommissions`, `getAgentStatus`, `getLatestSales` via tRPC. Gerenciamento de estado para dados do dashboard.

### 2.2. Rede (Network)

*   **Conteúdo**: Árvore hierárquica de indicados (componente customizado ou biblioteca de árvore), contagem de diretos/indiretos, comissões por nível, busca/filtro.
*   **Funcionalidade**: Expansão/colapso de nós na árvore, tap para detalhes do afiliado, compartilhamento de link de indicação.
*   **Requisitos Técnicos**: Integração com `mmn.getNetworkTree` via tRPC. Implementação de lógica de busca e filtragem no frontend. Utilização de `Share.share` do React Native para compartilhamento.

### 2.3. Agente IA

*   **Conteúdo**: Status atual do agente (tRPC), métricas (energia, saúde, criatividade, reputação - tRPC), estratégia de conteúdo (dropdown), últimas ações (tRPC).
*   **Funcionalidade**: Ativar/desativar agente (tRPC), ajustar configurações de estratégia (tRPC), ver histórico de postagens.
*   **Requisitos Técnicos**: Integração com `agent.getStatus`, `agent.updateStrategy`, `agent.getActionsLog` via tRPC. Componentes de formulário para configuração.

### 2.4. Comissões

*   **Conteúdo**: Filtro por período, lista de comissões (origem, nível, valor, status - tRPC), total acumulado.
*   **Funcionalidade**: Tap para detalhes da comissão, solicitar saque (tRPC).
*   **Requisitos Técnicos**: Integração com `commissions.getHistory`, `commissions.requestWithdrawal` via tRPC. Componentes de filtro de data e lista virtualizada para performance.

### 2.5. Marketplace

*   **Conteúdo**: Cards de produtos (imagem, título, preço, comissão, tendência - tRPC), filtro por marketplace.
*   **Funcionalidade**: Tap para detalhes do produto, botão "Compartilhar" (gerar link de afiliado), salvar favoritos.
*   **Requisitos Técnicos**: Integração com `marketplace.getTrendingProducts`, `marketplace.getProductDetails` via tRPC. Gerenciamento de estado para favoritos (AsyncStorage).

### 2.6. Perfil / Configurações

*   **Conteúdo**: Nome, Email, Código de Afiliado (tRPC), link de indicação (com botão copiar), preferências de notificação, tema (claro/escuro).
*   **Funcionalidade**: Editar perfil (tRPC), copiar link de indicação, ativar/desativar notificações por tipo (Expo Notifications API), alternar tema (gerenciamento de estado global).
*   **Requisitos Técnicos**: Integração com `user.getProfile`, `user.updateProfile` via tRPC. Utilização de `Clipboard` do React Native para copiar link. Persistência da preferência de tema (AsyncStorage).

## 3. Roadmap de Desenvolvimento e Marcos de Entrega (Milestones)

O desenvolvimento do aplicativo móvel será dividido em sprints ágeis, com marcos claros para cada fase, alinhados com o `todo.md` do projeto principal. A duração estimada é de 16 semanas, com entregas incrementais.

| Milestone | Fases Abrangidas (todo.md) | Descrição | Duração Estimada |
| :-------- | :------------------------- | :-------- | :--------------- |
| **M1: Estrutura Base e Autenticação** | Fase 9 (parcial) | Configuração do ambiente (React Native, Expo, TypeScript, Tailwind CSS), tema, componentes base, Tab Bar, integração tRPC client e implementação da página de login e logout. | 2 semanas |
| **M2: Telas Essenciais (Dashboard e Perfil)** | Fase 9 (parcial), Fase 10 (parcial) | Implementação das telas Home/Dashboard e Perfil com dados mockados/estáticos, incluindo KPIs e informações básicas do usuário. | 2 semanas |
| **M3: Telas de Rede e Agente IA** | Fase 10 (parcial), Fase 12 (parcial) | Implementação das telas Rede (árvore de indicados) e Agente IA (status, métricas) com dados mockados/estáticos. | 2 semanas |
| **M4: Telas de Comissões e Marketplace** | Fase 10 (parcial), Fase 13 (parcial) | Implementação das telas Comissões (histórico) e Marketplace (produtos recomendados) com dados mockados/estáticos. | 2 semanas |
| **M5: Integração Backend - Autenticação e Dados Essenciais** | Fase 3, Fase 4 (parcial) | Integração OAuth Manus. Conexão das telas Home e Perfil com o backend via tRPC para dados de perfil, comissões totais e status do agente. | 2 semanas |
| **M6: Integração Backend - Rede, Agente e Comissões** | Fase 4 (parcial), Fase 6 (parcial) | Conexão das telas Rede, Agente IA e Comissões com o backend via tRPC para dados dinâmicos e funcionalidades de gerenciamento. | 2 semanas |
| **M7: Integração Backend - Marketplace e Funcionalidades Avançadas** | Fase 7 (parcial), Fase 13 (parcial) | Conexão da tela Marketplace com o backend via tRPC. Implementação de compartilhamento de link de indicação, solicitação de saque e gráficos de ganhos. | 2 semanas |
| **M8: Notificações, Sincronização e Otimização** | Fase 5 (parcial), Fase 14 (parcial) | Implementação de notificações push, sincronização em background e cache local. Inclusão de funcionalidades de bônus e materiais de divulgação. | 2 semanas |
| **M9: Testes, Polimento e Preparação para Publicação** | Fase 15, Fase 16 | Testes unitários, de integração, navegação, performance e em dispositivos reais. Correção de bugs e otimizações. Preparação de metadados e certificações para publicação nas lojas. | 2 semanas |

## 4. Estratégia de Testes, CI/CD e Publicação

### 4.1. Estratégia de Testes

*   **Testes Unitários**: Utilização de `Jest` e `React Native Testing Library` para testar componentes isolados e lógicas de negócio no frontend. No backend, testes unitários serão aplicados para autenticação, lógica de comissões, agentes IA e integração com marketplaces, conforme detalhado nas Fases 3, 4, 5, 6, 7 e 15 do `todo.md`.
*   **Testes de Integração**: Foco na comunicação entre componentes e com o backend (tRPC), garantindo a tipagem segura de ponta a ponta. Testes end-to-end com `Detox` ou `Appium` serão implementados para fluxos críticos, como login, registro de indicação, solicitação de saque e compra no marketplace. Serão validados os fluxos de comissionamento e dropshipping, conforme as Fases 4, 5, 7 e 8 do `todo.md`.
*   **Testes de UI/Snapshot**: Garantir a consistência visual da interface em diferentes dispositivos e versões de OS, utilizando ferramentas como `Storybook` (se implementado) para isolar e testar componentes visuais.
*   **Testes de Performance**: Monitoramento de FPS, uso de memória e CPU para garantir uma experiência fluida, especialmente em telas com grande volume de dados (ex: árvore de rede, histórico de comissões). Serão realizados testes de carga para avaliar a responsividade da aplicação sob diferentes condições de rede e uso.
*   **Testes em Dispositivos Reais**: Utilização do Expo Go para testes rápidos durante o desenvolvimento e builds de produção para testes em dispositivos físicos e emuladores, cobrindo uma ampla gama de dispositivos iOS e Android.

### 4.2. CI/CD (Integração Contínua / Entrega Contínua)

*   **Plataforma**: GitHub Actions será utilizada para automatizar o pipeline de CI/CD, conforme as melhores práticas de DevOps.
*   **Fluxo de CI**: Cada push para o repositório disparará a execução de testes unitários (Fase 15 do `todo.md`), linting e build do aplicativo (utilizando `pnpm build` para o frontend e backend, conforme `TECHNICAL_DOCUMENTATION.md`). Serão configurados workflows para garantir a qualidade do código e a detecção precoce de erros.
*   **Fluxo de CD**: Após a aprovação em CI, builds de pré-produção serão gerados e distribuídos automaticamente para testadores (ex: Expo Prebuild, TestFlight, Google Play Internal Test Track). Builds de produção serão gerados e submetidos às lojas após aprovação manual, utilizando o `eas-cli` para gerenciar o processo de build e submissão.
*   **Ferramentas**: `eas-cli` (Expo Application Services CLI) para gerenciar builds e submissões às lojas, e `pnpm drizzle-kit push` para sincronizar o schema do banco de dados, garantindo a consistência entre o ambiente de desenvolvimento e produção.

### 4.3. Publicação nas Lojas (App Store / Google Play Store)

*   **Requisitos Legais**: Garantir conformidade com as diretrizes da Apple App Store e Google Play Store (privacidade, termos de uso, etc.).
*   **Metadados**: Preparação de ícones, screenshots, descrições e palavras-chave otimizadas para ASO (App Store Optimization), crucial para a visibilidade e descoberta do aplicativo nas lojas.
*   **Certificados e Provisionamento**: Gerenciamento de certificados de desenvolvedor e perfis de provisionamento para iOS, garantindo a assinatura correta do aplicativo.
*   **Processo de Submissão**: Utilização do `eas-cli` para automatizar o processo de submissão, mas com revisão e aprovação manual das versões finais. Após a publicação, será implementado um processo de monitoramento contínuo para avaliar o desempenho do aplicativo e coletar feedback dos usuários.

## 5. Considerações Adicionais

*   **Internacionalização**: Planejar desde o início a estrutura para suportar múltiplos idiomas, caso haja planos de expansão global, utilizando ferramentas como `expo-localization`.
*   **Acessibilidade**: Garantir que o aplicativo seja acessível para usuários com deficiência, seguindo as diretrizes de acessibilidade de iOS e Android, e utilizando os recursos de acessibilidade do React Native.
*   **Segurança**: Implementar as melhores práticas de segurança, como armazenamento seguro de dados sensíveis (ex: `expo-secure-store`), comunicação criptografada (HTTPS), validação de input via **Zod** (conforme `TECHNICAL_DOCUMENTATION.md`), e proteção contra engenharia reversa. A autenticação será gerenciada via JWT + Cookies, com RBAC para controle de acesso, conforme detalhado na `TECHNICAL_DOCUMENTATION.md`.

## Referências

[1] Expo Documentation. Disponível em: [https://docs.expo.dev/](https://docs.expo.dev/)
[2] React Native Documentation. Disponível em: [https://reactnative.dev/](https://reactnative.dev/)
[3] Apple Human Interface Guidelines. Disponível em: [https://developer.apple.com/design/human-interface-guidelines/](https://developer.apple.com/design/human-interface-guidelines/)
[4] Material Design Guidelines. Disponível em: [https://m2.material.io/design](https://m2.material.io/design)
[5] tRPC Documentation. Disponível em: [https://trpc.io/](https://trpc.io/)
[6] Tailwind CSS Documentation. Disponível em: [https://tailwindcss.com/](https://tailwindcss.com/)
[7] Zustand Documentation. Disponível em: [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
[8] React Native AsyncStorage. Disponível em: [https://react-native-async-storage.github.io/async-storage/](https://react-native-async-storage.github.io/async-storage/)
[9] Jest Documentation. Disponível em: [https://jestjs.io/](https://jestjs.io/)
[10] React Native Testing Library. Disponível em: [https://callstack.github.io/react-native-testing-library/](https://callstack.github.io/react-native-testing-library/)
[11] GitHub Actions Documentation. Disponível em: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
[12] Expo Application Services (EAS) CLI. Disponível em: [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
