# FAQ - Perguntas Frequentes

Este documento responde às dúvidas mais comuns sobre o projeto MMN AI-to-AI, organizado por perfil de usuário. Se você não encontrar a resposta aqui, consulte a documentação técnica ou entre em contato com o suporte.

---

## Para Administradores

### Como configurar comissões?

A configuração de comissões é feita no painel Admin > Configurações de MMN. Você pode definir a porcentagem para cada um dos 15 níveis da rede, bem como configurar bônus de liderança que premiam afiliados que atingem metas de equipe. As porcentagens são aplicadas automaticamente sobre o valor de cada venda confirmada, e o sistema calcula recursivamente quanto cada nível recebe até atingir o topo da árvore ou o limite de 15 níveis configurado.

### Como gerenciar usuários?

No menu **Admin > Usuários**, você tem controle total sobre a base de usuários. É possível visualizar todos os membros, alterar níveis de acesso (Afiliado, Supervisor, Líder ou Admin), ajustar manualmente patrocinadores em casos de erros de migração, e também bloquear ou suspender contas que violem os termos de uso da plataforma. Qualquer alteração feita nessa seção entra em vigor imediatamente.

### Como funciona a confirmação de pagamentos?

Acesse **Admin > Pagamentos** para visualizar todas as faturas pendentes. Ao receber um comprovante de pagamento de um usuário, verifique o valor e clique em "Confirmar Recebimento". O sistema calculará instantaneamente as comissões devidas para até 15 níveis acima do usuário que realizou a compra, atualizando os saldos em tempo real. Apenas pagamentos confirmados disparam o processo de comissionamento automático.

### Como auditar comissões?

O menu **Admin > Comissões** oferece um log completo de todos os cálculos realizados pelo sistema. Cada registro mostra exatamente quanto foi creditado para cada nível por uma venda específica, permitindo auditorias detalhadas. Você pode filtrar por período, usuário ou número do pedido para facilitar a investigação de qualquer inconsistência reporteda por afiliados.

### Como configurar taxas de saque?

As taxas e valores mínimos para saques são configurados em **Admin > Configurações de MMN**, na seção "Taxas de Saque". Defina o valor mínimo para processamento (geralmente R$ 50,00) e a taxa percentual cobrada por transação (comumente entre 2% e 5%). Essas configurações afetam todos os usuários simultaneamente.

### Como gerenciar marketplaces?

No painel Admin > Marketplaces, você pode forçar a sincronização de preços e estoque dos produtos integrados, bem como marcar itens específicos como "Destaque" para que todos os agentes da rede priorizem sua divulgação. O sistema suporta integração nativa com Mercado Livre, Shopee e Hotmart, e permite adicionar novas plataformas através do manual de integração.

### Onde verificar a saúde do servidor?

O monitoramento do servidor está disponível em **Admin > Monitoramento**. Você pode verificar latência, status do banco de dados, uso de memória e CPU. Logs de erro são exibidos em tempo real, incluindo falhas em gerações de IA e problemas de integração com marketplaces. Notificações críticas são enviadas automaticamente para o `notifyOwner` quando instabilidades são detectadas.

### Como adicionar novos plugins ou upgrades?

Acesse **Admin > Upgrades** para gerenciar o catálogo de plugins disponíveis para os afiliados. Você pode adicionar novos módulos, definir preços em créditos ou moeda real (BRL), e monitorar a taxa de adoção de cada upgrade. Os afiliados visualizarão os upgrades disponíveis em seu painel pessoal.

---

## Para Afiliados

### Como funciona o sistema de agente?

O Agente IA é seu parceiro de vendas disponível 24 horas por dia, 7 dias por semana. Ele trabalha de forma autônoma para gerar tráfego e conversões, produzindo textos, imagens e vídeos automaticamente e postando em suas redes sociais vinculadas. No painel "Agente", você pode definir a estratégia de conteúdo entre três modos: agressiva, informativa ou consultiva. Monitore sempre a Energia e Saúde do seu agente através do dashboard.

### Como acompanhar minhas comissões?

No menu "Comissões" do seu painel, você visualiza um histórico completo de todos os ganhos. As comissões são geradas de três formas: Venda Direta (quando alguém compra pelo seu link), Bônus de Rede (porcentagem sobre vendas realizadas pela sua equipe), e Upgrades (comissões sobre aquisição de plugins por sua rede). Os valores aparecem como pendentes até a confirmação do pagamento do cliente.

### Como funciona o sistema de indicados?

Quando uma pessoa se cadastra pelo seu link personalizado (`https://plataforma.com/?id=SEU_ID`), ela se torna seu indicado direto. No menu "Rede", você visualiza toda a sua árvore de indicados em até 15 níveis: os diretos são pessoas que se cadastraram diretamente pelo seu link, enquanto os indiretos são pessoas cadastradas por seus indicados. Cada nível contribui para suas comissões de rede.

### Quais marketplaces estão disponíveis?

O sistema integra-se com **Mercado Livre, Shopee e Hotmart**. O Agente IA analisa automaticamente quais produtos estão em alta (Trending) e prioriza a divulgação deles. Você também pode sugerir produtos específicos para seu agente promover através do catálogo disponível no painel. A curadoria de produtos administradores pode marcar itens como "Destaque".

### Como funciona o dropshipping automatizado?

Quando uma venda é realizada através do seu link, o sistema detecta automaticamente o pedido e processa a ordem junto ao fornecedor. Você e o cliente recebem o código de rastreio automaticamente por e-mail. Sua comissão é creditada na sua conta assim que o pagamento é confirmado pelo administrador. Todo o processo é automático e não requer intervenção manual.

### Como melhorar meu nível na rede?

Para subir de nível (de Afiliado para Supervisor, ou de Supervisor para Líder), você precisa atingir as metas estabelecidas pelo administrador. Estas metas geralmente envolvem volume de vendas, quantidade de indicados diretos ativos, ou valor acumulado de comissões. Ao atingir a meta, o sistema promove você automaticamente e você passa a receber bônus de liderança sobre as vendas da sua equipe.

### Como configurar meu mini-site?

Na primeira vez que você acessa a plataforma, seu mini-site é criado automaticamente com seu ID de afiliado. Para personalizar sua URL de divulgação, acesse o menu "Configurações" e defina um código personalizado (se disponível). Use o link `https://plataforma.com/?id=SEU_ID_AFILIADO` para compartilhar em suas redes sociais e acompanhar todas as vendas e cadastros originados dessa URL.

### Como adquirir upgrades para meu agente?

No menu "Upgrades" do seu painel, você encontra plugins disponíveis como "Copywriting Avançado" ou "Análise de Sentimento". Esses plugins aumentam drasticamente a performance do seu agente de IA. Para adquirir, clique no upgrade desejado e siga as instruções de pagamento. O custo pode ser debitado do seu saldo de comissões ou pago via cartão de crédito.

---

## Para Desenvolvedores

### Como fazer o deploy do sistema?

O processo de deploy segue estes passos: primeiro, execute `pnpm build` para gerar os assets estáticos e o bundle do servidor; em seguida, execute `pnpm drizzle-kit push` para sincronizar o schema do banco de dados com o MySQL (TiDB); finalmente, configure as variáveis de ambiente necessárias (`DATABASE_URL`, `JWT_SECRET` e credenciais de API Manus) antes de iniciar o servidor. O build gera um diretório `dist/` que pode ser servido por qualquer hospedagem Node.js.

### Como integrar novos marketplaces?

Consulte o **Manual de Integração** (`/workspace/docs/v16_delivery/INTEGRATION_MANUAL.md`) para detalhes completos. Resumidamente: adicione o novo enum em `products.marketplace` no arquivo `schema.ts`; crie uma nova procedure em `marketplacesRouter.ts` para autenticação e busca de produtos; implemente uma função de sincronização que mapeie os campos externos para o modelo interno (externalId, commissionPercentage). No frontend, adicione o logo e cores no componente `ProductCard` e atualize os filtros de busca.

### Como funciona a autenticação?

O sistema utiliza JWT com cookies para gerenciamento de sessões seguras. No backend, o tRPC valida tokens através do middleware `protectedProcedure` para rotas autenticadas e `adminProcedure` para rotas administrativas. No frontend, o contexto de autenticação gerencia o estado do usuário. A sanitização de inputs é feita via **Zod** em todos os endpoints, garantindo que dados maliciosos sejam bloqueados antes do processamento.

### Como adicionar novos campos ao schema?

Edite o arquivo `schema.ts` no diretório do backend para adicionar novas tabelas ou colunas. Após a alteração, execute `pnpm drizzle-kit generate` para criar o arquivo de migração, e depois `pnpm drizzle-kit push` para aplicar as mudanças ao banco de dados. Certifique-se de criar testes unitários para validar que a nova estrutura não quebra queries existentes.

### Como funciona o fluxo de comissionamento?

O algoritmo funciona assim: uma venda é confirmada no banco de dados; o sistema identifica o `affiliateId` responsável; busca-se o `sponsorId` (Nível 1); aplica-se a porcentagem definida para o Nível 1 sobre o valor da venda; o processo se repete subindo na hierarquia até atingir o Nível 15 ou a raiz da árvore. Todos os registros são gravados na tabela `commissions` com status `pending` até a liquidação, e podem ser auditados via Admin > Comissões.

### Como configurar webhooks externos?

O sistema está preparado para receber notificações de vendas externas no endpoint `POST /api/webhooks/conversion`. O payload esperado inclui `affiliate_id`, `product_id`, `amount`, `currency` e `status`. A segurança é garantida através do cabeçalho `X-Webhook-Secret` que deve ser enviado em todas as requisições. Validate o payload no router correspondente antes de processar.

### Como funciona a integração AI-to-AI?

O sistema possui três componentes principais: o **Reflexive Message Bus** é um barramento de mensagens onde agentes compartilham aprendizados entre si; o **Collective Synthesis** é um processo diário que consolida insights de todos os agentes para melhorar a estratégia global de vendas; os **Metacognition Logs** registram o processo de decisão dos agentes para auditoria e melhoria contínua. Esses componentes são gerenciados pelo `CollectiveWisdomModule` no backend.

### Quais são os requisitos de variáveis de ambiente?

O sistema requer: `DATABASE_URL` (string de conexão MySQL/TiDB); `JWT_SECRET` (chave secreta para assinatura de tokens JWT); `MANUS_API_KEY` (chave da API Manus para integração de IA); `MANUS_API_URL` (URL base da API Manus). Opcionalmente: `REDIS_URL` para cache; `SMTP_*` para envio de e-mails; `WEBHOOK_SECRET` para validação de webhooks externos.

---

## Perguntas Gerais

### O sistema é gratuito?

O acesso básico à plataforma é gratuito para todos os afiliados. However, alguns upgrades e plugins são pagos. As comissões de vendas são integralmente creditadas ao afiliado, sem deductions ocultas além das taxas de saque configuradas pelo administrador. O custo de aquisição de upgrades é debitado do saldo ou pago via cartão.

### Como posso reportar bugs?

Se você encontrar um bug, primeiro verifique se já existe uma solução na documentação de Troubleshooting. Para reportar um novo problema, entre em contato com o suporte pelo e-mail oficial fornecido pela administração, incluindo steps to reproduce, evidências (prints de tela ou logs), e a versão do sistema que você está utilizando. Bugs críticos são tratados com prioridade máxima.

### Posso usar a plataforma em dispositivos móveis?

Sim, o frontend foi desenvolvido com React e é responsivo, funcionando em desktop, tablet e smartphones. Contudo, algumas funcionalidades avançadas de configuração de agente são mais удобны no ambiente desktop. O painel administrativo é otimizado para telas maiores. Aplicativo nativo para iOS e Android está em fase de planejamento conforme o roadmap do projeto.

### Como funciona o suporte técnico?

O suporte técnico está disponível através do menu "Ajuda" no painel da plataforma. Você pode abrir tickets de suporte, acessar a base de conhecimento, ou entrar em contato via chat em horário comercial. Administradores têm acesso prioritário ao suporte de segundo nível, que inclui acesso aos logs do servidor e capacidade de depurar problemas complexos.