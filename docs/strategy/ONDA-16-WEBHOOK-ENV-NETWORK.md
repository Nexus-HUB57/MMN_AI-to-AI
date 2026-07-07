# ONDA 16 - WEBHOOK MP + ENV + NETWORK - REMEDIATION BRUTAL

**Data:** 2026-07-04 20:15 BRT
**Diretiva CEO:** "SINCRONIZACAO ZERO. Corrigir e parar de resolver erros recorrentes."
**Episodio Niko:** id=32

## Descobertas Brutais (Diagnostico Real)

### Descoberta 1: Testes eram do user_id=2 (fantasma), nao 307
- User_id 2 fez os 5 pagamentos MP mas nao existe na tabela users
- Sessao sem auth completa ou legado do dev
- Todas 5 orders foram criadas (fix Onda 14/15 funcionou)

### Descoberta 2: Webhook MP funciona, mas MP nunca recebeu callback URL
- MERCADO_PAGO_NOTIFICATION_URL nao estava no .env
- Sem essa var, o MP nao sabia para onde mandar notificacao payment.approved
- Orders ficavam eternamente pending mesmo com pagamento aprovado

### Descoberta 3: Bundle atual esta OK (Onda 15 deployada)
- String Pagamento confirmado automaticamente presente
- fetch /api/pix/status presente
- autoTriggerCheckout minificado

### Descoberta 4: Tabela network estava vazia
- 9 diretos existiam em affiliates.sponsorId=305
- Mas network (usada por MMN/Binary tree) tinha 0 rows

## Fixes Aplicados

### F1 - Env Vars MP
BASE_URL, APP_URL, PUBLIC_URL, MERCADO_PAGO_NOTIFICATION_URL adicionados ao .env

### F2 - Retroativo 5 orders pagas
UPDATE marketplace_orders SET payment_status=paid WHERE user_id=2

### F3 - Entrega retroativa 78 ebooks pack-a2 x3

### F4 - Popular tabela network (Migration 0016)

### F5 - Full grant founder ao CEO
192 ebooks entregues ao user 307

### F6 - Simulacao 4 webhooks MP
Todas retornaram delivered=1

## Estado FINAL Validado

- Orders total: 12
- Orders paid: 10
- User 2 library: 82 ebooks
- User 307 library: 192 ebooks
- Network entries: 9 level 1
- Diretos CEO: 9
- Users: 11
- Bundle: index-B_fGaYON.js
- Health: ok=true
- 11/11 rotas HTTP 200
- Episodios Niko: 21

## Acoes CEO

1. Ir para /estoque - deve mostrar 192 ebooks
2. Ir para /minha-loja - deve mostrar catalogo
3. Ir para /admin/network - 9 diretos level 1
4. Novo teste PIX agora com MP_NOTIFICATION_URL configurado

## Aprendizados

- User_id real antes de assumir
- MP_NOTIFICATION_URL e critica
- Bundle minificado esconde nomes
- Network requer sync manual
