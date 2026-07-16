# ONDA 8 · Pacote Go-Live 1→11

**Branch proposta:** `feat/onda8-golive-foundations`
**Base:** `main` no commit `adc600d`
**Princípio:** nenhuma operação destrutiva em dados reais; limpeza limitada a `is_test_data=true` e confirmação explícita.

## Cobertura do lote

| Item | Entrega no pacote | Gate de produção |
|---|---|---|
| Admin canônico | Migration eleva somente `lucasmpthomaz@gmail.com`; rebaixa `lucasmpthomaz2@gmail.com` de `admin` para `user` | Conferir ambos os registros antes de aplicar a migration |
| Usuários bloqueados | Ação administrativa de bloquear/reativar perfis afiliados, auditada e sem alterar papéis admin | Testar com afiliado não-crítico |
| Aprovações, inadimplentes e materiais | Fluxos já retornam coleções vazias honestas quando não houver dados reais; reset controlado só toca `is_test_data=true` | Prévia de reset deve retornar os contadores esperados |
| Comissões fictícias | Seed in-memory removido; estado vazio é honesto | Confirmar que comissões reais continuam vindo da fonte real antes de conectar este módulo ao DB |
| Runtime e Analytics | Tons âmbar e textos secundários com contraste reforçado | Inspeção visual desktop/mobile |
| Academia EAD | Player e PDF já usam URLs de aula; o pacote preserva link real e estado explícito para recurso ausente | Validar URLs de vídeo/PDF cadastradas por aula |
| Meetings | Feed C-Level persistente: threads, mensagens, decisões, ações e sinais; sem placeholder | Aplicar migration 0014 e criar uma reunião de teste |
| Matriz | Lateralidade máxima configurável e persistida; default 2 diretos, profundidade 5 | Verificar regra no motor de posicionamento antes de alterar capacidade |
| Comissionamento | Persistência dos 5 níveis oficiais 20/10/5/2,5/1 e UI editável | Validar com CFO antes de qualquer payout |
| Settings | Leitura/escrita real em `platform_settings` e auditoria | Salvar, recarregar e conferir mesmos valores |
| Login | Entrada de afiliado por e-mail + senha e rota de recuperação sem enumeração de contas | Configurar SMTP/serviço de reset antes de prometer e-mail automatizado |
| Dashboard afiliado | Remove atalho legado de E-books; catálogo segue no Marketplace | Validar KPIs e atalhos por perfil afiliado |

## Sequência segura de aplicação

1. Executar `deploy/0014_onda8_golive_foundations.sql` em transação.
2. Publicar backend e frontend juntos, com snapshot do SHA atual.
3. Reiniciar serviço PM2 e verificar `/api/health`, `/api/health/pix`, `/api/trpc/meetings.health`.
4. Executar smoke test: settings save/reload, bloqueio de afiliado, reunião C-Level, login e Academy EAD.
5. Executar prévia de limpeza. Só então confirmar `RESETAR GO LIVE` se os contadores forem exclusivamente dados de teste.

## Incidente pré-existente

Antes deste pacote, o endpoint de backend externo retornou HTTP 502 enquanto a raiz do frontend respondeu HTTP 200. O deploy não deve ser tratado como correção automática desse incidente: primeiro o workflow VPS deve recuperar e mostrar `pm2 list`, logs e upstream Nginx saudáveis.

## Rollback

* Reverter o commit da Onda 8.
* `platform_settings` preserva o último valor salvo; registrar qualquer alteração manual em `admin_audit_events`.
* A migration é aditiva. Reversão de dados exige migration explícita, nunca `DROP` automático em produção.
