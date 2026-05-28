# Guia de Troubleshooting

Este documento concentra os problemas mais comuns encontrados no projeto MMN AI-to-AI, com sintomas, soluções passo a passo e procedimentos de verificação. Para problemas não cobertos aqui, consulte a documentação técnica ou entre em contato com o suporte.

---

## Problemas Comuns

### Agente IA não responde

**Sintomas:** O agente não gera conteúdo, não posta em redes sociais, ou exibe status "Offline" no dashboard. Mensagens de erro relacionadas a timeout ou falha de conexão com a API Manus podem aparecer nos logs.

**Solução:**
1. Verifique se a chave `MANUS_API_KEY` está configurada corretamente no arquivo de variáveis de ambiente.
2. Reinicie o serviço do agente através do comando `pnpm start` no servidor.
3. Verifique se há rate limiting na API Manus (verifique sua quota no dashboard da Manus).
4. Se o problema persistir, redefina o agente através do painel do afiliado > Agente > Resetar Agente.

**Verificar:**
- Logs em `/backend/logs/agent-*.log`
- Status da API Manus em `https://status.manus.im`
- Conectividade de rede do servidor para `api.manus.im`

---

### Comissões não calculadas após pagamento confirmado

**Sintomas:** O administrador confirmou o recebimento do pagamento, mas as comissões não aparecem na conta dos afiliados. Níveis superiores não recebem os valores devidos.

**Solução:**
1. Acesse Admin > Comissões e verifique se há registros com status `pending`.
2. Confirme que o `affiliateId` está corretamente atribuído ao pedido no banco de dados.
3. Execute manualmente o job de cálculo de comissões via Admin > Ferramentas > Recalcular Comissões.
4. Verifique se a configuração de porcentagens por nível não está zerada em Admin > Configurações de MMN.

**Verificar:**
- Tabela `commissions` no banco de dados
- Tabela `orders` para confirmar `affiliateId` válido
- Logs de jobs em `/backend/logs/cron-*.log`

---

### Usuário não consegue fazer login

**Sintomas:** A tela de login não responde, exibe "Credenciais inválidas" mesmo com senha correta, ou redireciona para tela de erro.

**Solução:**
1. Limpe o cache do navegador e cookies do site da plataforma.
2. Tente fazer login com autenticação Social (Manus OAuth) ao invés de e-mail/senha.
3. Solicite recuperação de senha através do link "Esqueci minha senha".
4. Se o problema persistir, o administrador pode redefinir a senha manualmente em Admin > Usuários.

**Verificar:**
- Se a conta foi suspensa ou bloqueada em Admin > Usuários > Status.
- Se o JWT está expirando prematuramente (verificar `JWT_EXPIRES_IN` no `.env`).
- Logs de autenticação em `/backend/logs/auth-*.log`

---

### Sincronização de produtos marketplace falhando

**Sintomas:** Produtos desatualizados no catálogo, mensagens de erro "Sync Failed", ou contagem de produtos diferente do marketplace de origem.

**Solução:**
1. Acesse Admin > Marketplaces e clique em "Forçar Sincronização" para o marketplace específico.
2. Verifique se as credenciais de API do marketplace estão atualizadas (chaves de API, tokens de acesso).
3. Verifique os logs de sincronização em `/backend/logs/marketplace-sync-*.log`.
4. Se o erro persistir, pode ser uma falha temporária da API do marketplace; aguarde 30 minutos e tente novamente.

**Verificar:**
- Status da API do marketplace (Mercado Livre, Shopee, Hotmart).
- Quota de requisições da API (rate limits).
- Formato dos dados retornados (alterações na API do marketplace podem quebrar o parser).

---

### Agente IA gerando conteúdo inadequado

**Sintomas:** O agente posta conteúdo ofensivo, incorreto ou fora da estratégia definida. Afiliados reportam posts inapropriados nas redes sociais.

**Solução:**
1. Imediatamente desative o agente através do painel do afiliado > Agente > Desativar.
2. Revise e ajuste a estratégia de conteúdo para o modo "Informativa" ou "Consultiva".
3. Limpe o histórico de conteúdo gerado através do painel > Agente > Histórico > Limpar Cache.
4. Se o problema foi causado por um upgrade específico, desative-o temporariamente.

**Verificar:**
- Configurações de estratégia do agente em `agents.strategy` no banco de dados.
- Histórico de posts em `agent_logs.content_generated`.
- Filtros de conteúdo ativados nas configurações do agente.

---

### Erro de conexão com banco de dados

**Sintomas:** A aplicação exibe "Erro de conexão com o banco" ou "Database unavailable". Páginas não carregam, APIs retornam erro 500.

**Solução:**
1. Verifique se o serviço MySQL/TiDB está em execução.
2. Confirme que a variável `DATABASE_URL` no `.env` está correta e acessível.
3. Execute `pnpm drizzle-kit push` para verificar a conexão com o banco.
4. Reinicie o servidor backend.

**Verificar:**
- Status do serviço MySQL: `systemctl status mysql` ou similar.
- Logs de conexão em `/backend/logs/db-*.log`.
- Latência de rede entre o servidor da aplicação e o banco de dados.

---

### Upload de arquivos falhando

**Sintomas:** Erro ao enviar imagens de perfil, documentos ou uploads diversos. Mensagem "Upload failed" ou timeout.

**Solução:**
1. Verifique se o diretório de uploads tem permissões corretas (geralmente `chmod 755`).
2. Confirme que o limite de tamanho de arquivo no servidor permite o upload (default: 10MB).
3. Verifique o espaço em disco disponível no servidor.
4. Limpe arquivos temporários antigos no diretório `/tmp` se o disco estiver cheio.

**Verificar:**
- Configuração de `MAX_FILE_SIZE` no tRPC router.
- Logs de upload em `/backend/logs/upload-*.log`.
- Espaço em disco: `df -h`

---

### Webhook não processando conversões

**Sintomas:** Vendas externas não aparecem no sistema, comissões não são creditadas. Logs mostram "Webhook received" mas sem processamento.

**Solução:**
1. Verifique se o cabeçalho `X-Webhook-Secret` está sendo enviado corretamente pelo sistema externo.
2. Confirme que o payload segue o formato esperado: `{affiliate_id, product_id, amount, currency, status}`.
3. Valide manualmente o webhook usando curl ou Postman para identificar erros de parsing.
4. Verifique se o `affiliate_id` existe no banco de dados e está ativo.

**Verificar:**
- Logs de webhook em `/backend/logs/webhook-*.log`.
- Tabela `webhook_events` para eventos pendentes.
- Validade do `X-Webhook-Secret` em Admin > Configurações > Webhooks.

---

### Saldo incorreto ou comissões duplicadas

**Sintomas:** Afiliado reporta valor de saldo diferente do esperado, ou recebeu a mesma comissão múltiplas vezes.

**Solução:**
1. Acesse Admin > Comissões e identifique registros duplicados ou valores incorretos.
2. Execute uma reconciliação manual através de Admin > Ferramentas > Reconciliar Saldos.
3. Se houver duplicidade, corrija manualmente os valores na tabela `commissions`.
4. Para saldos negativa incorretamente, o admin pode ajustar manualmente em Admin > Usuários > Ajustar Saldo.

**Verificar:**
- Tabela `commissions` para registros duplicados (`orderId` igual).
- Tabela `nexus_wallets` para valores inconsistentes.
- Logs de cálculo em `/backend/logs/commission-calc-*.log`.

---

### Interface lenta ou com timeouts frequentes

**Sintomas:** Páginas demoram a carregar, queries expiram, experiência do usuário degradada.

**Solução:**
1. Verifique o uso de recursos do servidor (CPU, memória, disco).
2. Analise queries lentas no logs de banco de dados.
3. Limpe o cache da aplicação se configurado (Redis ou similar).
4. Considere escalar horizontalmente adicionando instâncias do servidor.

**Verificar:**
- `top` ou `htop` para uso de CPU e memória.
- Logs de queries lentas em `/backend/logs/slow-query.log`.
- Latência do banco de dados: `SHOW PROCESSLIST` no MySQL.

---

## Recursos de Debug

### Logs do Sistema

Os logs estão organizados por módulo em `/backend/logs/`:
- `agent-*.log` - Operações do agente IA
- `auth-*.log` - Autenticação e sessões
- `commission-calc-*.log` - Cálculo de comissões
- `cron-*.log` - Jobs agendados (Cron)
- `db-*.log` - Conexões e queries de banco
- `marketplace-sync-*.log` - Sincronização de marketplaces
- `upload-*.log` - Upload de arquivos
- `webhook-*.log` - Processamento de webhooks

### Status do Sistema

O painel de status administrativo está disponível em `/admin/status` e mostra:
- Saúde do servidor (CPU, memória, disco)
- Status do banco de dados
- Latência de APIs externas
- Filas de jobs pendentes
- Alertas críticos ativos

### Comandos Úteis

```bash
# Ver logs do agente em tempo real
tail -f /backend/logs/agent-*.log

# Ver erros do banco de dados
grep "ERROR" /backend/logs/db-*.log

# Verificar jobs pendentes
curl -X GET http://localhost:3000/api/health/jobs

# Testar conexão com banco
pnpm drizzle-kit check

# Reiniciar serviço do agente
pm2 restart agent-service
```

### Variáveis de Ambiente Críticas

Verifique sempre estas variáveis no `.env`:
- `DATABASE_URL` - String de conexão do banco
- `JWT_SECRET` - Chave secreta do JWT
- `MANUS_API_KEY` - Chave da API Manus
- `REDIS_URL` - URL do Redis (se usado)
- `NODE_ENV` - ambiente (development/production)

---

## Procedimentos de Escalação

Se o problema persistir após seguir os passos de troubleshooting:

1. **Colete evidências:** Screenshots, logs relevantes, horário exato do problema.
2. **Verifique o impacto:** Quantos usuários foram afetados? É um problema isolado ou generalizado?
3. **Documente:** Crie um relatório com steps to reproduce.
4. **Escalone:** Entre em contato com a equipe de desenvolvimento com todos os dados coletados.

---

## Problemas Conhecidos

###这个问题已被识别并正在修复中

A equipe está ciente dos seguintes problemas e trabalha ativamente para resolvê-los:

- **Sincronização Shopee instável**: A API da Shopee apresenta inconsistências; um novo conector está em desenvolvimento.
- **Tempo limite em uploads grandes**: O timeout de 30s pode ser insuficiente para uploads de vídeo; ajuste conforme necessidade.
- **Memory leak em jobs longos**: Jobs de sincronização muito longos podem causar vazamento de memória; reinicie o serviço periodicamente como workaround.

---

*Última atualização: Maio 2026*