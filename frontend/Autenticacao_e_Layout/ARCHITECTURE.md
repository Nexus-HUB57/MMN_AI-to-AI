# Arquitetura do Sistema MMN AI-to-AI

## Visão Geral

O sistema de Marketing Multinível com Agentes IA (MMN AI-to-AI) é uma plataforma digital completa que automatiza operações de afiliados através de agentes de inteligência artificial generativos. A arquitetura segue o padrão de três camadas: apresentação (frontend), lógica de negócio (backend) e persistência (banco de dados).

## Componentes Principais

### 1. Autenticação e Controle de Acesso

- **OAuth Manus**: Integração nativa com o sistema de autenticação Manus
- **Perfis de Usuário**: Admin, Líder, Supervisor, Afiliado
- **Mini-site Personalizado**: Cada afiliado possui URL única (`/?id=AFFILIATE_ID`)
- **Links de Indicação Rastreáveis**: Gerados automaticamente com tracking de conversão

### 2. Plataforma MMN (Multi-Level Marketing)

#### Estrutura de Rede
- **Modelo Unilevel Híbrido**: Cada usuário pode indicar ilimitados diretos, com comissões em até 15 níveis de profundidade
- **Rastreamento de Patrocínio**: Relação pai-filho entre usuários, com histórico de indicações
- **Árvore de Indicados**: Visualização hierárquica da rede de cada afiliado

#### Sistema de Comissões
- **Comissão por Nível**: Configurável por nível (até 15 níveis)
- **Comissão por Largura**: Bônus por número de indicados diretos
- **Comissão por Consumo**: Baseada em vendas/conversões da rede
- **Cálculo Automático**: Acionado na confirmação de pagamento/venda

#### Gestão de Pagamentos
- **Inserção de Receitas**: Registro manual de pagamentos recebidos
- **Identificação Automática**: Matching entre recibos e promessas de pagamento
- **Confirmação e Comissionamento**: Cálculo automático de comissões ao confirmar pagamento
- **Extrato de Remuneração**: Histórico completo de ganhos por afiliado

### 3. Agente IA Generativo

#### Módulo Gerativo (Criação de Conteúdo)
- **Geração de Textos**: Copywriting otimizado por plataforma (WhatsApp, Instagram, Facebook)
- **Geração de Imagens**: Criação de assets visuais para anúncios
- **Geração de Vídeos Curtos**: Reels e Stories otimizados
- **Adaptação de Tom**: Análise de público-alvo e ajuste de mensagens
- **Legendas Otimizadas**: Hashtags, CTA e emojis contextualizados

#### Módulo Generativo (Ações Autônomas)
- **Decisão de Postagem**: Quando, onde e com que frequência postar
- **Gerenciamento de Orçamento**: Alocação automática de anúncios por ROI previsto
- **Fluxo de Dropshipping**: Pedido → Fornecedor → Notificação
- **Interação AI-to-AI**: Troca de leads e ofertas cruzadas entre agentes

### 4. Integração com Marketplaces

#### APIs Suportadas
- **Mercado Livre**: Produtos mais vendidos, buscas em alta, sazonalidade
- **Shopee**: Tendências, margem de afiliado, categorias em alta
- **Hotmart**: Produtos digitais, comissões, performance de vendas

#### Monitoramento Diário
- **Atualização de Produtos**: Sincronização de catálogo e preços
- **Análise de Tendências**: Identificação de produtos em alta demanda
- **Cálculo de Margem**: Comissão por produto e competitividade
- **Seleção Automática**: Recomendação de produtos para o agente promover

### 5. Sistema de Upgrades e Plugins

#### Módulos Disponíveis
- **Copywriting Avançado**: Técnicas de persuasão e psicologia de vendas
- **Análise de Sentimento**: Monitoramento de comentários e engajamento
- **Automação de Funis**: Sequências de email e retargeting
- **Integração com Novos Marketplaces**: Suporte a plataformas adicionais
- **Análise Preditiva**: Previsão de demanda e sazonalidade

#### Arquitetura Modular
- **Plugin System**: Cada upgrade é um módulo independente
- **Versionamento**: Controle de versão de plugins
- **Ativação/Desativação**: Gerenciamento dinâmico de capacidades
- **Custo e Benefício**: Visualização de ROI por upgrade

### 6. Banco de Dados

#### Tabelas Principais
- **users**: Usuários do sistema com perfil e dados pessoais
- **affiliates**: Dados específicos de afiliados (comissão, status, etc.)
- **network**: Relações de patrocínio e indicação
- **commissions**: Histórico de comissões calculadas
- **payments**: Registro de pagamentos e recebimentos
- **agents**: Configuração e estado de cada agente IA
- **products**: Catálogo de produtos de marketplaces
- **orders**: Histórico de pedidos e conversões
- **upgrades**: Plugins e módulos disponíveis
- **agent_upgrades**: Upgrades ativados por agente

## Stack Tecnológico

### Frontend
- **React 19**: Framework UI moderno
- **Tailwind CSS 4**: Estilização utilitária
- **shadcn/ui**: Componentes reutilizáveis
- **Wouter**: Roteamento leve
- **tRPC**: Type-safe RPC

### Backend
- **Express 4**: Servidor HTTP
- **tRPC 11**: API type-safe
- **Drizzle ORM**: Gerenciamento de banco de dados
- **Node.js**: Runtime

### Banco de Dados
- **MySQL/TiDB**: Armazenamento relacional

### Integrações Externas
- **Manus OAuth**: Autenticação
- **Manus LLM**: Geração de conteúdo IA
- **APIs de Marketplaces**: Mercado Livre, Shopee, Hotmart
- **Manus Storage**: Armazenamento de arquivos

## Fluxos Principais

### Fluxo de Registro e Indicação
1. Novo usuário acessa mini-site com ID de afiliado (`/?id=AFFILIATE_ID`)
2. Sistema detecta indicador e registra relação de patrocínio
3. Usuário completa cadastro e autenticação
4. Agente IA é criado e inicializado para o novo usuário

### Fluxo de Venda e Comissão
1. Cliente clica em link de afiliado rastreável
2. Realiza compra via marketplace integrado
3. Sistema detecta conversão e registra pedido
4. Comissões são calculadas automaticamente para toda a rede
5. Remuneração é creditada na conta virtual do afiliado

### Fluxo de Geração de Conteúdo
1. Agente IA analisa tendências de marketplace
2. Seleciona produtos com alto potencial
3. Gera conteúdo otimizado (texto, imagem, vídeo)
4. Agenda postagens em WhatsApp, Instagram, Facebook
5. Monitora engajamento e ajusta estratégia

### Fluxo de Dropshipping Automatizado
1. Cliente interage com conteúdo do agente
2. Realiza pedido através de link de afiliado
3. Agente recebe notificação de pedido
4. Repassa automaticamente ao fornecedor
5. Notifica cliente sobre status de entrega
6. Registra comissão e atualiza rede

## Segurança e Conformidade

- **Autenticação OAuth**: Integração segura com Manus
- **Controle de Acesso**: RBAC (Role-Based Access Control)
- **Criptografia de Dados**: Senhas e dados sensíveis criptografados
- **Auditoria**: Log de todas as operações financeiras
- **LGPD**: Conformidade com regulamentações de privacidade

## Escalabilidade

- **Arquitetura Stateless**: Backend sem estado para fácil escalabilidade
- **Cache de Produtos**: Reduz chamadas a APIs externas
- **Processamento Assíncrono**: Tarefas em background (comissões, notificações)
- **CDN para Mídia**: Distribuição global de imagens e vídeos

## Próximas Etapas

1. Implementar schema de banco de dados completo
2. Desenvolver APIs de autenticação e autorização
3. Criar painel de controle do usuário
4. Integrar APIs de marketplaces
5. Implementar sistema de agentes IA
6. Adicionar sistema de upgrades e plugins
