# Guia do Administrador: MMN AI-to-AI

Este guia fornece uma visão abrangente das funcionalidades, responsabilidades e ferramentas disponíveis para o administrador no sistema MMN AI-to-AI. O painel de administração é o centro de controle para gerenciar usuários, conteúdo, finanças e configurações do sistema.

## 1. Gerenciamento de Usuários e Afiliados

O controle sobre quem acessa o sistema e como eles interagem com ele é fundamental.

### 1.1. Gestão de Usuários

A seção de **Usuários** (`frontend/src/pages/AdminUsers.tsx`) permite o controle total sobre as contas registradas:

*   **Criação e Edição**: Adicione novos usuários manualmente ou edite informações de perfis existentes, como nome, e-mail e dados de contato.
*   **Controle de Acesso (Funções)**: Atribua e modifique funções de usuário. As funções típicas incluem:
    *   *Administrador*: Acesso total a todas as configurações e dados do sistema.
    *   *Afiliado*: Acesso ao painel de afiliados, links de divulgação e relatórios de comissão.
    *   *Usuário Comum*: Acesso restrito, geralmente apenas para compras ou visualização de conteúdo público.
*   **Status da Conta**: Ative ou desative contas de usuário. Contas desativadas perdem o acesso ao sistema, útil para lidar com violações de termos de serviço ou inatividade prolongada.
*   **Redefinição de Senha**: Envie links de redefinição de senha ou defina senhas temporárias para usuários que perderam o acesso.

### 1.2. Gestão de Afiliados e Rede

A seção de **Rede** (`frontend/src/pages/AdminNetwork.tsx`) é dedicada ao gerenciamento do ecossistema de marketing multinível:

*   **Aprovação de Afiliados**: Revise e aprove (ou rejeite) novos registros de afiliados, garantindo que apenas parceiros qualificados entrem na rede.
*   **Gerenciamento de Códigos**: Visualize, gere ou modifique os códigos únicos de afiliado usados para rastreamento.
*   **Visualização da Árvore da Rede**: Acesse a estrutura completa da rede de afiliados. Isso permite entender a hierarquia, identificar líderes (Top Sponsors) e analisar o fluxo de comissões.
*   **Monitoramento de Desempenho**: Acompanhe o desempenho individual e de equipe, incluindo volume de vendas, número de indicações ativas e taxas de conversão.

## 2. Gerenciamento de Conteúdo e Materiais Promocionais

Fornecer materiais de alta qualidade é essencial para o sucesso dos afiliados.

### 2.1. Gerenciador de Banners

Acesse a seção de **Materiais** (`frontend/src/pages/AdminMaterials.tsx`) para gerenciar os recursos visuais:

*   **Upload e Publicação**: Faça upload de novos banners promocionais em diversos formatos (JPEG, PNG, GIF) e tamanhos padronizados (ex: 300x250, 728x90, 1080x1080).
*   **Edição e Exclusão**: Atualize links de destino, modifique descrições ou remova banners de campanhas encerradas.
*   **Categorização**: Organize os banners por campanha (ex: "Black Friday", "Lançamento de Produto") ou por nicho de mercado, facilitando a busca pelos afiliados.

### 2.2. Gerenciador de E-books e Conteúdo Educacional

*   **Upload de E-books**: Adicione novos e-books (geralmente em formato PDF) à biblioteca do sistema.
*   **Controle de Acesso**: Defina quem pode acessar cada material:
    *   *Público*: Disponível para todos os visitantes.
    *   *Premium*: Requer cadastro ou um nível específico de afiliado.
    *   *Exclusivo*: Apenas para membros VIP ou líderes de rede.
*   **Metadados**: Edite título, autor, descrição detalhada e imagem de capa para tornar o material atraente.

### 2.3. Materiais de Divulgação Diversos

*   **Criação de Conteúdo**: Adicione textos persuasivos (copywriting), links para vídeos promocionais (YouTube, Vimeo) e templates de e-mail marketing.
*   **Organização**: Classifique os materiais por tipo (texto, vídeo, imagem) e objetivo (atração de leads, fechamento de vendas).

## 3. Gerenciamento Financeiro: Comissões e Pagamentos

O coração do sistema MMN é o seu motor financeiro.

### 3.1. Configuração do Plano de Compensação

Acesse as configurações de **Comissões** (`frontend/src/pages/AdminCommissions.tsx`) para definir as regras do jogo:

*   **Percentuais de Comissão**: Defina as taxas de comissão para vendas diretas e para cada nível da rede (ex: Nível 1: 10%, Nível 2: 5%, Nível 3: 2%).
*   **Configuração de Bônus**: Estabeleça as regras e metas para os diversos bônus oferecidos:
    *   *Bônus de Início Rápido*: Requisitos de tempo e volume.
    *   *Prêmio Esmeralda*: Metas de faturamento global.
    *   *Bônus de Liderança*: Critérios de qualificação baseados no tamanho e desempenho da equipe.

### 3.2. Processamento de Pagamentos e Saques

A seção de **Pagamentos** (`frontend/src/pages/AdminPayments.tsx`) permite o controle do fluxo de caixa:

*   **Revisão de Solicitações de Saque**: Analise as solicitações de saque feitas pelos afiliados. Verifique se há saldo suficiente e se as regras de saque (ex: valor mínimo) foram cumpridas.
*   **Aprovação e Execução**: Aprove os pagamentos e registre as transações no sistema após a transferência dos fundos (via PIX, transferência bancária, etc.).
*   **Histórico e Relatórios**: Acesse o histórico completo de todas as transações financeiras (comissões geradas, bônus pagos, saques realizados) e gere relatórios para contabilidade e auditoria.
*   **Gestão de Inadimplentes**: Acompanhe usuários com pagamentos pendentes ou assinaturas atrasadas na seção de **Inadimplentes** (`frontend/src/pages/AdminDelinquents.tsx`).

## 4. Integrações e Configurações do Sistema

### 4.1. Integração com Marketplaces

*   **Configuração de APIs**: Insira chaves de API e credenciais para conectar o sistema a plataformas externas como Mercado Livre, Shopee, Hotmart, Monetizze, etc.
*   **Sincronização de Produtos**: Configure rotinas automáticas ou manuais para importar produtos, preços e estoques dos marketplaces para o sistema MMN.
*   **Mapeamento de Comissões Externas**: Defina como as comissões recebidas dessas plataformas externas serão distribuídas na rede de afiliados interna.

### 4.2. Segurança e Auditoria

*   **Controle de Acesso Baseado em Funções (RBAC)**: Garanta que cada administrador ou gerente tenha acesso apenas às áreas necessárias para sua função.
*   **Logs de Auditoria**: O sistema registra ações críticas (ex: alteração de comissões, aprovação de pagamentos, exclusão de usuários). Monitore esses logs para identificar atividades suspeitas e garantir a integridade do sistema.
*   **Backups**: Certifique-se de que as rotinas de backup do banco de dados estejam configuradas e funcionando corretamente para prevenir perda de dados.

## Referências

[1] [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
[2] [Documentação Oficial tRPC](https://trpc.io/docs/)
