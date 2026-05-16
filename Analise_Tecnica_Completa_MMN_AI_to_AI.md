# ANÁLISE TÉCNICA FUNDAMENTALISTA DO REPOSITÓRIO MMN_AI-to-AI

**Autor:** MiniMax Agent
**Data:** 16 de maio de 2026
**Versão do Documento:** 1.0

---

## EXECUTIVE SUMMARY

O repositório MMN_AI-to-AI representa uma solução complexa e multifacetada que combina marketing multinível (MMN) com inteligência artificial autônoma. Trata-se de um monorepo completo que integra frontend web em React + Vite, backend em Node.js + TypeScript com tRPC, banco de dados relacional MySQL com Drizzle ORM, sistema de filas com Redis + BullMQ, integração com múltiplos marketplaces (Mercado Livre, Shopee, Hotmart), e um sistema sofisticado de agentes IA que operam 24/7 em nome dos usuários. A arquitetura demonstra um alto nível de sofisticação técnica, implementando conceitos avançados de sistemas distribuídos, processamento assíncrono, e orquestração de agentes multi-nível.

---

## 1. ARQUITETURA DO SISTEMA

### 1.1 Visão Geral da Estrutura Monorepo

O projeto adota uma estrutura de monorepo gerenciada por npm workspaces, organizando os componentes principais em três diretórios distintas que compartilham dependências e configurações. A arquitetura segue um modelo cliente-servidor clássico, onde o frontend web e o aplicativo mobile consomem APIs tipadas expostas pelo backend através do framework tRPC, garantindo segurança de tipos de ponta a ponta. O sistema foi projetado para escalar horizontalmente, com workers especializados processando tarefas em background através do sistema de filas BullMQ, permitindo que operações pesadas como geração de conteúdo e sincronização de marketplaces não impactem a experiência do usuário final.

A estrutura do monorepo contempla seis diretórios principais que desempenham funções específicas na arquitetura geral. O diretório frontend contém a aplicação web responsiva construída com React e Vite, responsável pela interface do usuário e consumo das APIs tRPC. O diretório backend concentra toda a lógica de negócios, serviços de IA, roteadores tRPC e integrações externas, sendo o núcleo operacional do sistema. O diretório mobile abriga a aplicação React Native com Expo Router, permitindo que usuários acessem funcionalidades através de dispositivos móveis. O diretório database contém os esquemas Drizzle que definem a estrutura do banco de dados MySQL, enquanto o diretório infra mantém configurações de infraestrutura como Docker Compose e ferramentas de deployment. Por fim, o diretório tests garante a qualidade do código através de testes unitários e de integração.

### 1.2 Stack Tecnológica Principal

A stack tecnológica foi cuidadosamente selecionada para atender aos requisitos de performance, escalabilidade e manutenibilidade do sistema. No frontend web, a combinação de React 18 com Vite como bundler oferece tempos de build extremamente rápidos e excelente experiência de desenvolvimento, enquanto wouter fornece roteamento leve sem a complexidade do React Router. A integração com TanStack Query (anteriormente React Query) permite gerenciamento eficiente de estado servidor, com cache inteligente e sincronização automática de dados. O uso de TailwindCSS com plugin tailwind-merge e class-variance-authority facilita a construção de componentes UI consistentes e responsivos, enquanto Radix UI fornece componentes primitivos acessíveis ecustomizáveis. A visualização de dados é handled por Recharts, uma biblioteca poderosa para gráficos responsivos que se integra perfeitamente com o ecossistema React.

No backend, Node.js com TypeScript fornece uma base sólida para desenvolvimento backend com tipagem forte e tooling moderno. O framework tRPC elimina a necessidade de documentação de API manual, permitindo que frontend e backend compartilhem tipos automaticamente e garantindo que mudanças em um lado do sistema sejam imediatamente refletidas no outro. Drizzle ORM oferece uma abordagem type-safe para interação com MySQL, com migrações versionadas e schema-as-code que facilita o controle de versão do banco de dados. O sistema de filas BullMQ com Redis como broker permite processamento assíncrono de tarefas pesadas, com suporte a retries automáticos, priorização de jobs e escalonamento horizontal de workers. A integração com Genkit (framework de IA do Google) permite uso de modelos Gemini com fallback para OpenAI GPT-4, criando uma camada de abstração sobre provedores de IA que facilita trocas entre provedores e otimização de custos.

### 1.3 Padrões Arquiteturais Implementados

O sistema implementa diversos padrões arquiteturais que contribuem para sua robustez e manutenibilidade. O padrão Repository é utilizado extensivamente através dos módulos de database, onde cada entidade do domínio possui seu próprio repositório que abstrai detalhes de acesso ao banco de dados. O padrão Service Layer organiza a lógica de negócios em serviços especializados como commissions.ts para cálculo de comissões, dropshippingService.ts para operações de dropshipping, e llm-v2.ts para roteamento de requisições de IA. O padrão Router no contexto tRPC organiza endpoints em módulos coesos como mmnRouter, agentsRouter, marketplaceRouter, permitindo que cada domínio de negócio seja desenvolvido e testado independentemente.

O padrão Worker/Queue implementa processamento assíncrono de tarefas pesadas através de quatro workers especializados: contentGenerationWorker para geração de conteúdo automatizado, commissionProcessingWorker para cálculo e distribuição de comissões, marketplaceSyncWorker para sincronização com plataformas externas, e orderProcessingWorker para tratamento de pedidos de dropshipping. Este padrão permite que operações que levariam segundos ou minutos não bloqueiem a resposta ao usuário, sendo processadas em background com notificações de conclusão. O padrão Circuit Breaker está mencionado na documentação como requisito de segurança, implementando proteções automáticas quando métricas de fraude ou baixa performance são detectadas.

---

## 2. MODELAGEM DO BANCO DE DADOS

### 2.1 Esquema Principal (schema-final.ts)

O banco de dados do MMN_AI-to-AI é modelado através de múltiplos esquemas Drizzle que capturam a complexidade do domínio de negócio. A tabela users representa a entidade central do sistema, armazenando informações básicas de autenticação incluindo email, password_hash, name, CPF para validação brasileira, além de metadados de criação e atualização. O controle de roles é implementado através do campo role que suporta diferentes tipos de usuários como user e admin, permitindo diferentes níveis de permissão no sistema.

A tabela affiliates é crucial para o funcionamento do MMN, representando o perfil de afiliado associado a cada usuário. Seus campos incluem affiliate_code como identificador único para links de referência, id do patrocinador (sponsor_id) que estabelece a relação hierárquica na rede, e commission_percentage que permite customização de taxas de comissão por afiliado. Os campos de acumulação totalEarnings e pendingEarnings rastreiam o histórico financeiro de cada afiliado, enquanto status controla se o afiliado está ativo, suspenso ou inativo. O campo rank atual permite que o sistema acompanhe a posição atual do afiliado no plano de carreira, armazenando categorias como affiliate_level_1, affiliate_level_2, predictive_level_1 e assim por diante.

A tabela network modela a árvore genealógica do MMN, com cada registro representando uma relação entre um usuário e seu upline. Os campos principais incluem user_id para identificar o membro, sponsor_id para referenciar o patrocinador direto, e level para controlar a profundidade na rede (suportando até 5 níveis de profundidade conforme especificado no plano de carreira). O campo depth permite consultas eficientes para algoritmos de distribuição de comissões que precisam alcançar uplines em múltiplos níveis. A estrutura também suporta a lógica de compressão que mencionará quando um afiliado inativo é "comprimido" na rede, mantendo a integridade da árvore hierárquica.

As tabelas products e orders implementam a funcionalidade de e-commerce e dropshipping do sistema. Products armazena o catálogo com campos para título, descrição, preço, informações de fornecedor, além de integração com marketplaces através de campos como mercado_libre_id, shopee_id e hotmart_product_id. Orders gerencia pedidos realizados, com campos para rastrear o afiliado responsável (referral_affiliate_id), status do pedido (pending, confirmed, shipped, delivered, cancelled), valores de comissões geradas e links de rastreamento. A integração com o sistema de comissões é evidenciada pela presença de campos como commission_amount e commission_status.

### 2.2 Tabelas de Comissões e Pagamentos

A tabela commissions é projetada para rastrear todos os tipos de comissões geradas no sistema. Seus campos principais incluem user_id para identificar o beneficiário, order_id para referenciar a venda que originou a comissão, affiliate_id para identificar o afiliado responsável pela referência, e commission_type que categoriza a comissão em tipos como direct_sale, network_bonus, width_bonus e consumption_commission. Os campos from_user_id e from_affiliate_id permitem rastrear a origem da comissão na rede de afiliados, essencial para auditorias e transparência. Os campos amount e status rastreiam o valor e estado de pagamento, com suporte a múltiplos status como pending, approved, paid e rejected.

A tabela payments implementa o sistema de recompensas via PIX mencionado na especificação. Seus campos principais incluem user_id para identificar o destinatário, amount para o valor da transferência, payment_method que inicial suporta apenas PIX, status para controlar o ciclo de vida do pagamento, e transaction_hash que garante a imutabilidade do ledger através de hashes de transação. A presença de campos como scheduled_date e processed_at sugere um sistema de agendamento de pagamentos mensais, consolidando comissões pendentes em uma data fixada para processamento.

### 2.3 Entidades de IA e Sistema de Agentes

As tabelas agents e agent_upgrades suportam a funcionalidade central de IA do sistema. A tabela agents armazena a configuração de cada agente virtual associado a um usuário, com campos para nome, status (active, paused, inactive), classification que armazena o nível do agente (afiliado, preditivo, generativo, orquestrador, ia_agêntica), e configuration que guarda um JSON com as configurações específicas do agente. O campo prompt_base referencia o prompt fundamental que define o comportamento e capacidades do agente, permitindo upgrades de personalidade e especialização.

A tabela agent_upgrades implementa o sistema de habilidades e upgrades mencionado na especificação, onde usuários podem "comprar" novos conhecimentos e capacidades para seus agentes. Seus campos incluem agent_id para referenciar o agente dono do upgrade, upgrade_type que categoriza em tipos como skills, knowledge_base, platform_access e automation_features. O campo level indica o nível do upgrade (1, 2 ou 3), enquanto price e xp_cost rastreiam o investimento necessário. A presença de campos de configuração dinâmica permite que upgrades adicionem capacidades específicas ao agente sem necessidade de desenvolvimento de código.

---

## 3. LÓGICA DE NEGÓCIOS E SERVIÇOS

### 3.1 Sistema de Comissões MMN

A lógica de MMN é implementada no serviço services/commissions.ts, sendo um dos componentes mais críticos do sistema. A função calculateCommissionsForPayment implementa a distribuição de comissões em cascata, processando pagamentos confirmados e distribuindo comissões para toda a rede ascendente do afiliado. O algoritmo suporta até 15 níveis de profundidade, embora o plano de carreira oficial especifique 5 níveis operacionais, demonstrando flexibilidade para expansões futuras. A taxa de comissão para cada nível é calculada com base no percentual configurado na tabela de affiliate_commission_rates, permitindo que diferentes níveis tenham diferentes percentuais de participação.

A função calculateWidthCommission implementa o bônus por largura mencionado no plano de carreira, recompensando afiliados que atingem um número mínimo de indicações diretas. Este bônus incentiva a expansão horizontal da rede, complementando os bônus de profundidade que recompensam construção vertical. O cálculo considera tanto o número de indicados diretos quanto o volume de vendas gerado por eles, criando um incentivo poderoso para construção de rede sustentável. A função calculateConsumptionCommission gera comissões para vendas de produtos via dropshipping, identificando o afiliado responsável através do link de referência e calculando a comissão baseada na configuração do produto.

O processamento de comissões é executado assincronamente através do commissionProcessingWorker, que escuta filas no BullMQ para processar comissões pendentes. O worker implementa lógica de retry automático para falhas transitórias, circuitos de proteção para evitar processamento duplicado, e logging detalhado para auditoria. A separação entre cálculo e distribuição permite que o sistema escale independentemente para volumes muito altos de transações sem impacto na experiência do usuário.

### 3.2 Sistema de Dropshipping

O serviço services/dropshippingService.ts implementa a funcionalidade de dropshipping que conecta afiliados a marketplaces externos. A função registerDropshippingOrder é o ponto de entrada principal, sendo chamada quando um cliente realiza uma compra através de um link de afiliado. O fluxo inclui identificação do afiliado responsável, cálculo de comissão baseada no produto e categoria, geração de notificação para o afiliado e seu upline, e criação do registro de pedido no sistema. Quando o status do pedido é atualizado para "delivered", o sistema automaticamente confirma e credita a comissão ao afiliado, completando o ciclo de monetização.

A integração com marketplaces é handled através de módulos especializados em integrations/. O módulo hotmart.ts conecta com a API da Hotmart para gestão de produtos digitais, sincronizando informações de produtos, processando webhooks de vendas, e recuperando dados de comissões. O módulo mercadoLibre.ts implementa integração com a API do Mercado Livre para produtos físicos, gerenciando publicações, preços, estoques e logística. O módulo shopee.ts segue padrão similar para integração com Shopee, outra plataforma de e-commerce relevante para o mercado brasileiro.

### 3.3 Orquestração de Agentes IA

O serviço services/llm-v2.ts implementa o roteador dinâmico de modelos de linguagem que alimenta todo o sistema de IA. A arquitetura utiliza um padrão Strategy onde diferentes provedores de IA (Google Gemini via Genkit, OpenAI GPT-4) podem ser selecionados baseado em critérios como custo, disponibilidade, e adequação ao tipo de tarefa. O serviço abstrai detalhes de implementação de cada provedor, expondo uma interface统一的 que permite troca de provedores sem impacto no código cliente. Funcionalidades incluem rate limiting para evitar exceder quotas, fallback automático para provedores secundários em caso de falhas, e cache de respostas para reduzir custos em requisições repetidas.

O módulo services/genkit-integration.ts configura e gerencia o framework Genkit do Google, permitindo uso de modelos Gemini para tarefas de geração de conteúdo, análise de sentimento, e otimização de textos de marketing. A integração suporte streaming de respostas para experiência mais fluida em geração de conteúdo longo. O módulo services/content-recommendation-service.ts utiliza capacidades de IA para analisar tendências de mercado e recomendar produtos aos afiliados, processando dados de APIs do Mercado Livre, Shopee e Hotmart para identificar produtos com alto potencial de venda e comissões atrativas.

### 3.4 Processamento de Conteúdo e Workers

O sistema implementa quatro workers especializados que processam tarefas em background através do BullMQ. O contentGenerationWorker escuta filas de geração de conteúdo, processando requisições para criação de posts de marketing, variações de anúncios, e análises de sentimento. O worker implementa rate limiting para evitar exceder quotas de APIs de IA, retry com backoff exponencial para falhas transitórias, e deduplicação para evitar geração de conteúdo duplicado. O marketplaceSyncWorker sincroniza periodicamente informações de produtos entre o sistema e marketplaces externos, atualizando preços, estoques e disponibilidade. O orderProcessingWorker gerencia o ciclo de vida de pedidos, processando confirmações de pagamento, atualizações de status, e geração de notificações.

---

## 4. FRONTEND E INTERFACE DO USUÁRIO

### 4.1 Estrutura da Aplicação Web

O frontend em React + Vite segue uma arquitetura baseada em componentes com separação clara de responsabilidades. O diretório src/components contém componentes reutilizáveis da interface, organizados por domínio funcional. O diretório src/pages contém as páginas principais da aplicação, cada uma implementando uma view específica como Dashboard, AffiliateProfile, Marketplace, e AffiliateMiniSite. O diretório src/contexts implementa gerenciadores de estado global usando React Context API, com AuthContext gerenciando autenticação e estado do usuário logado.

A estrutura de roteamento utiliza wouter, uma biblioteca de roteamento leve e declarativa que não depende de contextos ou hooks do React Router. As rotas principais incluem / para landing page, /dashboard para o painel de controle do afiliado, /afiliado/:code para mini sites públicos de afiliados, /marketplace para navegação de produtos, e /admin para funcionalidades administrativas. O cliente tRPC configurado em src/lib/trpc.ts conecta com o backend, permitindo chamadas tipadas a procedures tRPC com inferência automática de tipos.

### 4.2 Dashboard do Afiliado

O componente Dashboard.tsx serve como centro de controle principal para afiliados, consumindo dados do backend via tRPC para exibir métricas e funcionalidades críticas. A interface apresenta métricas principais incluindo totalEarnings para ganhos acumulados, pendingEarnings para comissões pendentes, e directReferrals para número de indicações diretas. Gráficos de performance (implementados com Recharts) visualizam evolução de comissões ao longo do tempo e novas indicações, permitindo que afiliados acompanhem seu progresso. A seção de gestão de rede exibe lista de indicados diretos com seus respectivos ganhos, facilitando identificação de membros mais produtivos da equipe.

### 4.3 Mini Sites de Afiliados

O componente AffiliateMiniSite.tsx gera páginas públicas para cada afiliado, acessíveis através de URLs formatadas como /afiliado/:code. Estas páginas funcionam como landing pages para atração de novos membros, exibindo informações do patrocinador como nome, foto, ganhos, e benefícios do programa. A página inclui call-to-action para registro, permitindo que novos usuários se afiliem diretamente através do link do afiliado. A geração dinâmica de conteúdo garante que cada afiliado tenha presença online personalizada sem necessidade de desenvolvimento customizado.

---

## 5. BACKEND E SERVIDORES API

### 5.1 Estrutura de Routers tRPC

O backend organiza endpoints em routers especializados que implementam a separação por domínio de negócio. O mmnRouter expõe funcionalidades relacionadas ao marketing multinível, incluindo getAffiliateByCode para consulta de afiliados por código, getNetworkTree para recuperação da árvore de rede, calculatePosition para determinar posição na rede, e getCommissionsHistory para histórico de comissões. O agentsRouter gerencia ciclo de vida de agentes IA, com endpoints para createAgent, updateAgentConfig, purchaseUpgrade, e getAgentStatus. O marketplaceRouter implementa operações de marketplace, enquanto dropshippingRouter gerencia pedidos e comissões de dropshipping.

### 5.2 Sistema de Autenticação

A autenticação é implementada através de JWTs gerados pelo módulo jose, com cookies httpOnly para armazenamento seguro no cliente. O fluxo inclui login via email/senha com hash bcrypt, geração de access token e refresh token, e validação de tokens em cada requisição via middleware tRPC. O AuthContext no frontend gerencia estado de autenticação e fornece informações do usuário logado para toda a aplicação. O sistema está preparado para integração futura com Firebase Auth e Next-Auth conforme roadmap, embora estas integrações ainda não estejam implementadas.

### 5.3 Sistema de Notificações

O módulo _core/notification.ts implementa um sistema de notificações que conecta o backend com clientes frontend através de Server-Sent Events (SSE) ou polling. O sistema permite que usuários recebam notificações em tempo real sobre eventos importantes como novas vendas, comissões creditadas, atualizações de status de pedidos, e mensagens da rede. A arquitetura suporta múltiplos canais de entrega incluindo notificações in-app, emails, e webhooks para integrações externas.

---

## 6. APLICAÇÃO MOBILE

### 6.1 Arquitetura com Expo Router

A aplicação mobile em mobile/ utiliza Expo Router, um framework de roteamento文件系统-based para React Native que permite navegação através de diretórios e arquivos. Esta abordagem simplifica a navegação em comparação com React Navigation tradicional, usando a estrutura de diretórios como configuração de rotas. O arquivo app/_layout.tsx define o layout raiz que inclui bottom tabs para navegação principal, enquanto arquivos app/*.tsx representam páginas da aplicação.

### 6.2 Integração com Backend

A aplicação mobile conecta com o backend através de um cliente tRPC configurado em server/_core/, utilizando os mesmos tipos compartilhados do frontend web. O servidor Express integrado ao app permite que a aplicação mobile também funcione como Progressive Web App (PWA) através de react-native-web, compartilhando código entre plataformas mobile e web. O uso de @tanstack/react-query no mobile garante cache inteligente e sincronização de dados similar ao frontend web.

---

## 7. INFRAESTRUTURA E DEPLOYMENT

### 7.1 Configuração Docker

O diretório infra/ contém configuração Docker para deploy do sistema. O docker-compose.yml configura serviços de MySQL 8 e Redis 7, permitindo que desenvolvedores subam infraestrutura local com um único comando. O Dockerfile define a imagem de produção para o backend, incluindoMulti-stage builds para otimização de tamanho e cache de dependências npm.

### 7.2 Scripts de automação

O diretório scripts/ contém utilitários para automação de tarefas. O script generate_qr.mjs gera QR codes para configuração de conexões mobile, enquanto extract_finetuning_data.py processa dados para fine-tuning de modelos de IA. O diretório tests/ implementa suite de testes utilizando Vitest, com testes unitários cobrindo lógica de comissões, dropshipping, e serviços de IA.

---

## 8. ANÁLISE DE PONTOS CRÍTICOS

### 8.1 Pontos Fortes Identificados

A arquitetura demonstra vários pontos fortes significativos. A utilização de tRPC para comunicação client-server garante type-safety de ponta a ponta, eliminando uma classe inteira de bugs relacionados a incompatibilidade de tipos entre frontend e backend. A separação em workers especializados permite escalonamento independente de componentes, com workers podendo ser replicados horizontalmente para suportar volumes crescentes de processamento. A integração com múltiplos provedores de IA (Gemini, GPT-4) através de roteador dinâmico oferece resiliência contra falhas de provedores individuais e flexibilidade para otimização de custos.

O uso de Drizzle ORM com migrações versionadas facilita controle de versão do schema do banco de dados, permitindo rollback em caso de problemas e revisão de mudanças através de git. A documentação extensiva no README.md, incluindo análise técnica e especificação do plano de carreira, demonstra compromisso com clareza e transparência do sistema. A estrutura monorepo facilita gestão de dependências e garante consistência de versões entre frontend, backend e mobile.

### 8.2 Pontos de Atenção e Melhoria

A análise identificou beberapa pontos que requerem atenção. A configuração do cliente tRPC no frontend web utiliza AppRouter = any em src/lib/trpc.ts, significando que o frontend não está beneficiando-se completamente do type-safety oferecido pelo tRPC. Este ponto deveria ser corrigido importando o tipo real exportado pelo backend, garantindo que mudanças no backend sejam imediatamente refletidas em erros de TypeScript no frontend.

Durante análise, foram identificadas inconsistências entre o que componentes frontend consomem e o que o backend expõe. O componente AffiliateMiniSite.tsx tenta consumir trpc.affiliate.getAffiliateByCode, enquanto o backend expõe esta funcionalidade em trpc.mmn.getAffiliateByCode. Similarmente, componentes referenciam campos como totalEarnings e totalNetworkSize que não estão presentes no schema do banco de dados ou no retorno da API. Estas inconsistências precisam ser resolvidas para garantir funcionalidade correta.

O README menciona integrações Firebase Auth e Next-Auth como "previstas no roadmap" mas "ainda não implementadas", sugerindo que o sistema atual depende exclusivamente de autenticação JWT customizada. A implementação de provedores de autenticação estabelecidos como Firebase Auth fortaleceria a segurança e reduziria esforço de desenvolvimento na área de autenticação.

### 8.3 Recomendações de Melhoria

Para evolução do sistema, recomenda-se as seguintes melhorias priorizadas. Primero, corrigir a configuração do cliente tRPC para utilizar tipos reais do backend, eliminando a configuração AppRouter = any. Segundo, resolver as inconsistências de nomenclatura entre frontend e backend, padronizando em um namespace consistente. Terceiro, implementar autenticação multifator (MFA) para proteger contas de afiliados com valores financeiros significativos. Quarto, adicionar testes de integração para validar fluxos completos como registro de afiliado, realização de compra, e distribuição de comissões.

---

## 9. CONSIDERAÇÕES DE SEGURANÇA

### 9.1 Autenticação e Autorização

O sistema implementa autenticação baseada em JWT com cookies httpOnly para proteção contra XSS. O campo role na tabela users permite implementação de controle de acesso baseado em papéis (RBAC), com diferentes permissões para usuários comuns e administradores. O modelo de permissões mencionado na especificação garante que agentes não possam alterar chave PIX do usuário nem acessar dados bancários sensíveis, implementando separação de responsabilidades.

### 9.2 Proteção de Dados e Compliance

A documentação menciona requisitos de conformidade com LGPD (Lei Geral de Proteção de Dados brasileira) e CCPA (California Consumer Privacy Act), embora a implementação específica destes requisitos não tenha sido verificada no código analisado. O sistema deve implementar anonimização de dados para análise, consentimento explícito para coleta de dados, e mecanismos de exercício de direitos dos titulares (acesso, correção, exclusão). O ledger de transações imutável através de hashes mencionado na especificação suporta requisitos de auditoria e compliance.

---

## 10. CONCLUSÕES

O repositório MMN_AI-to-AI representa um projeto ambicioso e tecnicamente sofisticado que combina marketing multinível com inteligência artificial autônoma. A arquitetura demonstra boa separação de responsabilidades, com frontend, backend, mobile e workers funcionando como componentes independentes mas integrados. A utilização de tecnologias modernas como tRPC, Drizzle ORM, BullMQ, e Genkit posiciona o projeto de forma competitiva no mercado de plataformas de afiliados com IA.

O sistema implementa uma lógica de negócio complexa que suporta múltiplos níveis de carreira, comissões em cascata, e sistema de upgrades de agentes, criando um ecossistema rico para usuários que desejam monetizar sua rede de contatos através de agentes IA operando 24/7. A documentação extensiva e estrutura de código organizado facilitam onboarding de novos desenvolvedores e manutenção do sistema.

Pontos de atenção identificados focam principalmente em consistência de tipos entre frontend e backend, e necessidade de implementação de funcionalidades de segurança pendientes como MFA e compliance com regulamentações de proteção de dados. A resolução destas questões fortalecerá o sistema e preparará para escalamento em produção.

---

## APÊNDICE: TECNOLOGIAS UTILIZADAS

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Frontend Web | React | 18.3.1 |
| | Vite | 5.4.8 |
| | TypeScript | 5.6.3 |
| | TailwindCSS | 3.4.13 |
| | wouter | 3.3.5 |
| | TanStack Query | 5.59.0 |
| | tRPC | 11.0.0 |
| Backend | Node.js | >=20 |
| | TypeScript | 5.6.3 |
| | tRPC | 11.17.0 |
| | Drizzle ORM | 0.45.2 |
| | BullMQ | 5.21.2 |
| | Genkit | 1.0.0 |
| | OpenAI SDK | 4.68.0 |
| Mobile | React Native | 0.81.5 |
| | Expo | 54.0.29 |
| | Expo Router | 6.0.19 |
| Database | MySQL | 8 |
| | Redis | 7 |
| Testing | Vitest | 2.1.9 |