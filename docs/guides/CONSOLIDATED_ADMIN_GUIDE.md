# Guia do Administrador - MMN AI-to-AI - Versão Consolidada

> Baseado em: v16_delivery/ADMIN_GUIDE.md + guides-archive/admin-guide.md
> Última atualização: 2026-05-28
> Autor: MiniMax Agent

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Gestão de Usuários e Rede](#2-gestão-de-usuários-e-rede)
3. [Gestão de Conteúdo e Materiais Promocionais](#3-gestão-de-conteúdo-e-materiais-promocionais)
4. [Gestão Financeira e Pagamentos](#4-gestão-financeira-e-pagamentos)
5. [Configurações de MMN](#5-configurações-de-mmn)
6. [Gestão de Marketplaces](#6-gestão-de-marketplaces)
7. [Monitoramento do Sistema](#7-monitoramento-do-sistema)
8. [Manutenção de Upgrades](#8-manutenção-de-upgrades)
9. [Segurança e Auditoria](#9-segurança-e-auditoria)

---

## 1. Visão Geral

Este manual é destinado aos operadores do sistema com privilégios de `admin`. O painel administrativo permite o controle total sobre a rede, finanças e configurações globais. O sistema oferece funcionalidades completas para gerenciamento de usuários, conteúdo, finanças e integrações com marketplaces externos.

---

## 2. Gestão de Usuários e Rede

No menu **Admin > Usuários**, você pode visualizar a lista completa de membros e realizar diversas operações de controle. A seção de **Usuários** (`frontend/src/pages/AdminUsers.tsx`) permite o controle total sobre as contas registradas.

### 2.1. Operações de Gestão de Usuários

O controle sobre quem acessa o sistema e como eles interagem com ele é fundamental:

- **Visualizar lista de membros**: Acesso completo a todos os usuários registrados no sistema.
- **Alterar níveis de acesso**: Modifique funções entre Afiliado, Supervisor, Líder e Admin.
- **Ajuste manual de patrocinadores**: Corrija erros de migração alterando ouplink de membros.
- **Bloquear ou suspender contas**: Conta desativadas perdem o acesso ao sistema, útil para violações de termos de serviço ou inatividade prolongada.
- **Redefinição de senha**: Envie links de redefinição ou defina senhas temporárias para usuários que perderam acesso.

### 2.2. Funções e Níveis de Acesso

Atribua e modifique funções de usuário. As funções típicas incluem:

| Função | Descrição |
|--------|-----------|
| Administrador | Acesso total a todas as configurações e dados do sistema |
| Afiliado | Acesso ao painel de afiliados, links de divulgação e relatórios de comissão |
| Supervisor | Permissões intermediárias para gestão de equipe |
| Líder | Permissões elevadas para liderança de rede |
| Usuário Comum | Acesso restrito, geralmente apenas para compras ou visualização de conteúdo público |

### 2.3. Gestão de Afiliados e Rede

A seção de **Rede** (`frontend/src/pages/AdminNetwork.tsx`) é dedicada ao gerenciamento do ecossistema de marketing multinível:

- **Aprovação de Afiliados**: Revise e aprove (ou rejeite) novos registros de afiliados, garantindo que apenas parceiros qualificados entrem na rede.
- **Gerenciamento de Códigos**: Visualize, gere ou modifique os códigos únicos de afiliado usados para rastreamento.
- **Visualização da Árvore da Rede**: Acesse a estrutura completa da rede de afiliados. Isso permite entender a hierarquia, identificar líderes (Top Sponsors) e analisar o fluxo de comissões.
- **Monitoramento de Desempenho**: Acompanhe o desempenho individual e de equipe, incluindo volume de vendas, número de indicações ativas e taxas de conversão.
- **Top Patrocinadores**: A página de **Top Patrocinadores** (`frontend/src/pages/TopSponsors.tsx`) destaca os afiliados com melhor desempenho.

---

## 3. Gestão de Conteúdo e Materiais Promocionais

Fornecer materiais de alta qualidade é essencial para o sucesso dos afiliados.

### 3.1. Gerenciador de Banners

Acesse a seção de **Materiais** (`frontend/src/pages/AdminMaterials.tsx`) para gerenciar os recursos visuais:

- **Upload e Publicação**: Faça upload de novos banners promocionais em diversos formatos (JPEG, PNG, GIF) e tamanhos padronizados (ex: 300x250, 728x90, 1080x1080).
- **Edição e Exclusão**: Atualize links de destino, modifique descrições ou remova banners de campanhas encerradas.
- **Categorização**: Organize os banners por campanha (ex: "Black Friday", "Lançamento de Produto") ou por nicho de mercado, facilitando a busca pelos afiliados.

### 3.2. Gerenciador de E-books e Conteúdo Educacional

- **Upload de E-books**: Adicione novos e-books (geralmente em formato PDF) à biblioteca do sistema.
- **Controle de Acesso**: Defina quem pode acessar cada material:
  - *Público*: Disponível para todos os visitantes.
  - *Premium*: Requer cadastro ou um nível específico de afiliado.
  - *Exclusivo*: Apenas para membros VIP ou líderes de rede.
- **Metadados**: Edite título, autor, descrição detalhada e imagem de capa para tornar o material atraente.

### 3.3. Materiais de Divulgação Diversos

- **Criação de Conteúdo**: Adicione textos persuasivos (copywriting), links para vídeos promocionais (YouTube, Vimeo) e templates de e-mail marketing.
- **Organização**: Classifique os materiais por tipo (texto, vídeo, imagem) e objetivo (atração de leads, fechamento de vendas).

---

## 4. Gestão Financeira e Pagamentos

O sistema requer a confirmação manual de recebimentos para disparar o comissionamento automático.

### 4.1. Confirmando Pagamentos

1. Acesse **Admin > Pagamentos**.
2. Localize a fatura ou recibo enviado pelo usuário.
3. Verifique o valor e clique em **"Confirmar Recebimento"**.
4. O sistema calculará instantaneamente as comissões para até 15 níveis acima e atualizará os saldos.

### 4.2. Auditoria de Comissões

Em **Admin > Comissões** (`frontend/src/pages/AdminCommissions.tsx`), você tem um log completo de todos os cálculos realizados, permitindo rastrear exatamente quanto cada nível recebeu por uma venda específica. Acesse o histórico completo de todas as transações financeiras (comissões geradas, bônus pagos, saques realizados) e gere relatórios para contabilidade e auditoria.

### 4.3. Configuração do Plano de Compensação

Acesse as configurações de **Comissões** para definir as regras do jogo:

- **Percentuais de Comissão**: Defina as taxas de comissão para vendas diretas e para cada nível da rede (ex: Nível 1: 10%, Nível 2: 5%, Nível 3: 2%).
- **Configuração de Bônus**: Estabeleça as regras e metas para os diversos bônus oferecidos:
  - *Bônus de Início Rápido*: Requisitos de tempo e volume.
  - *Prêmio Esmeralda*: Metas de faturamento global.
  - *Bônus de Liderança*: Critérios de qualificação baseados no tamanho e desempenho da equipe.

### 4.4. Processamento de Pagamentos e Saques

A seção de **Pagamentos** (`frontend/src/pages/AdminPayments.tsx`) permite o controle do fluxo de caixa:

- **Revisão de Solicitações de Saque**: Analise as solicitações feitas pelos afiliados. Verifique se há saldo suficiente e se as regras de saque (ex: valor mínimo) foram cumpridas.
- **Aprovação e Execução**: Aprove os pagamentos e registre as transações no sistema após a transferência dos fundos (via PIX, transferência bancária, etc.).
- **Gestão de Inadimplentes**: Acompanhe usuários com pagamentos pendentes ou assinaturas atrasadas na seção de **Inadimplentes** (`frontend/src/pages/AdminDelinquents.tsx`).

---

## 5. Configurações de MMN

Você pode ajustar as regras de negócio globais através do painel administrativo:

- **Porcentagem por Nível**: Defina quanto cada nível (1 a 15) recebe nas comissões em cascata.
- **Bônus de Liderança**: Configure metas para mudança automática de perfil (ex: Afiliado -> Supervisor).
- **Taxas de Saque**: Defina valores mínimos e taxas para processamento de retiradas.
- **Limites de Rede**: Configure profundidade máxima da rede (até 15 níveis).
- **Períodos de Carência**: Defina períodos para consolidação de comissões.

---

## 6. Gestão de Marketplaces

- **Sincronização**: Força a atualização de preços e estoque dos produtos integrados.
- **Curadoria**: Marque produtos específicos como "Destaque" para que todos os agentes da rede priorizem sua divulgação.
- **Configuração de APIs**: Insira chaves de API e credenciais para conectar o sistema a plataformas externas como Mercado Livre, Shopee, Hotmart, Monetizze, etc.
- **Sincronização de Produtos**: Configure rotinas automáticas ou manuais para importar produtos, preços e estoques dos marketplaces para o sistema MMN.
- **Mapeamento de Comissões Externas**: Defina como as comissões recebidas dessas plataformas externas serão distribuídas na rede de afiliados interna.

---

## 7. Monitoramento do Sistema

- **Saúde do Servidor**: Verifique latência e status do banco de dados.
- **Logs de Erro**: Acompanhe falhas em gerações de IA ou falhas de integração com marketplaces.
- **Notificações Críticas**: O sistema enviará alertas automáticos para o `notifyOwner` em caso de instabilidades.
- **Monitoramento de Desempenho**: Acompanhe o desempenho individual e de equipe, incluindo volume de vendas, número de indicações ativas e taxas de conversão.

---

## 8. Manutenção de Upgrades

Gerencie o catálogo de plugins disponíveis para os afiliados:

- Adicionar novos módulos ao sistema.
- Definir preços em créditos ou moeda real.
- Monitorar a taxa de adoção de cada upgrade.
- Configurar condições de elegibilidade para upgrades.

---

## 9. Segurança e Auditoria

- **Controle de Acesso Baseado em Funções (RBAC)**: Garanta que cada administrador ou gerente tenha acesso apenas às áreas necessárias para sua função.
- **Logs de Auditoria**: O sistema registra ações críticas (ex: alteração de comissões, aprovação de pagamentos, exclusão de usuários). Monitore esses logs para identificar atividades suspeitas e garantir a integridade do sistema.
- **Backups**: Certifique-se de que as rotinas de backup do banco de dados estejam configuradas e funcionando corretamente para prevenir perda de dados.
- **Proteção de Credenciais**: Nunca exponha chaves de API ou tokens de acesso em código frontend ou repositórios públicos.

---

## Histórico de Versões

| Versão | Data | Origem | Mudanças |
|--------|------|--------|----------|
| 1.0 | 2026-05-28 | Consolidação | v16_delivery/ADMIN_GUIDE.md + guides-archive/admin-guide.md |

---

## Referências

- [MMN_AI-to-AI GitHub Repository](https://github.com/Nexus-HUB57/MMN_AI-to-AI)
- [Documentação Oficial tRPC](https://trpc.io/docs/)