# Referência da API - Nexus Affil'IA'te

**Versão:** 1.0
**Última atualização:** 28/05/2026

---

## Visão Geral

Esta documentação descreve a API REST do Nexus Affil'IA'te para integração de sistemas externos e automação de processos.

### Base URL

```
Ambiente Produção: https://api.oneverso.com.br/v1
Ambiente Sandbox: https://api.sandbox.oneverso.com.br/v1
```

### Autenticação

A API utiliza **OAuth 2.0** com Bearer Token:

```
Authorization: Bearer {access_token}
```

---

## Autenticação

### POST /auth/login

Efetua login e retorna token de acesso.

**Request:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

---

## Usuários

### GET /users/me

Retorna dados do usuário autenticado.

**Response (200):**

```json
{
  "id": "usr_12345",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "status": "active",
  "referral_code": "ABC123"
}
```

---

## Comissões

### GET /commissions

Lista comissões do usuário.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| start_date | string | Data inicial (YYYY-MM-DD) |
| end_date | string | Data final (YYYY-MM-DD) |
| page | integer | Número da página |

### GET /commissions/summary

Retorna resumo de comissões.

**Response (200):**

```json
{
  "total_pending": 250.00,
  "total_available": 1250.00,
  "total_paid": 8750.00,
  "total_this_month": 1800.00
}
```

---

## Marketplaces

### GET /marketplaces

Lista marketplaces conectados.

### POST /marketplaces/{id}/sync

Força sincronização de marketplace.

---

## Webhooks

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| commission.created | Nova comissão criada |
| commission.paid | Comissão paga |
| order.created | Novo pedido |
| order.status_changed | Status alterado |
| user.registered | Novo usuário |
| agent.activity | Atividade do agente |

---

**© 2026 Nexus Affil'IA'te · oneverso.com.br**