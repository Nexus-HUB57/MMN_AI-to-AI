# Fase 5: Backend - Gestão de Pagamentos - Resumo de Implementação

## Visão Geral

A **Fase 5** implementa o sistema completo de gestão de pagamentos e comissões para a plataforma MMN AI-to-AI. O sistema segue o modelo descrito no `manual_marketing_de_rede.txt` com as etapas: **Inserir** → **Identificar** → **Conferir** (Confirmar) → **Extrato**.

## Arquivos Criados/Modificados

### Backend

#### 1. **paymentsRouter.ts** (Novo)
Router tRPC com 10 procedures para gestão de pagamentos:

- **insertPayment**: Inserir novo pagamento (receita)
  - Input: `affiliateId` (opcional), `amount`, `method`, `bankCode`, `bankNumber`, `agency`, `account`, `paymentDate`
  - Output: Payment com ID gerado
  - Permissão: Admin ou Afiliado (próprio)

- **listPendingPayments**: Listar pagamentos pendentes
  - Output: Array de payments com status "pending"
  - Permissão: Admin

- **identifyPayment**: Associar pagamento a um afiliado
  - Input: `paymentId`, `affiliateId`
  - Output: `{ success: true }`
  - Permissão: Admin

- **confirmPayment**: Confirmar pagamento e calcular comissões
  - Input: `paymentId`
  - Ações:
    - Atualiza status para "confirmed"
    - Calcula comissões em cascata (até 15 níveis)
    - Confirma comissões criadas
    - Atualiza totais do afiliado
    - Cria notificação
  - Output: Payment confirmado
  - Permissão: Admin

- **cancelPayment**: Cancelar pagamento e reverter comissões
  - Input: `paymentId`
  - Ações:
    - Atualiza status para "cancelled"
    - Cancela comissões associadas
    - Atualiza totais do afiliado
  - Output: `{ success: true }`
  - Permissão: Admin

- **generateRemunerationStatement**: Gerar extrato de remuneração
  - Input: `affiliateId` (opcional - usa do usuário se não informado)
  - Output: Objeto com:
    - `totalConfirmed`: Comissões confirmadas
    - `totalPending`: Comissões pendentes
    - `totalPaid`: Comissões já pagas
    - `totalEarnings`: Total confirmado + pago
    - `commissions`: Array com todas as comissões
  - Permissão: Afiliado (próprio) ou Admin

- **getDelinquentAffiliates**: Listar afiliados inadimplentes
  - Input: `daysOverdue` (padrão: 30)
  - Output: Array com:
    - `affiliateId`, `affiliateCode`
    - `totalAmount`: Valor em aberto
    - `pendingCount`: Número de pagamentos pendentes
    - `oldestPaymentDate`: Data do pagamento mais antigo
    - `daysOverdue`: Dias vencidos
  - Permissão: Admin

- **getPaymentHistory**: Listar histórico de pagamentos
  - Input: `limit` (padrão: 20)
  - Output: Array de payments do afiliado
  - Permissão: Afiliado (próprio)

- **getPaymentDetails**: Obter detalhes de um pagamento
  - Input: `paymentId`
  - Output: Payment com `relatedCommissions`
  - Permissão: Admin ou Afiliado (próprio)

#### 2. **db.ts** (Modificado)
Adicionados 3 helpers de banco de dados:

```typescript
export async function getPaymentsByAffiliate(affiliateId: number, limit: number = 20)
export async function getPaymentById(paymentId: number)
export async function getConfirmedPaymentsByAffiliate(affiliateId: number)
```

#### 3. **routers.ts** (Modificado)
- Importado `paymentsRouter` de `./paymentsRouter`
- Adicionado ao `appRouter`: `payments: paymentsRouter`

### Frontend

#### 4. **PaymentManagement.tsx** (Novo)
Página admin para gerenciar pagamentos:

**Abas:**
1. **Pendentes**: Lista de pagamentos aguardando confirmação
   - Visualizar detalhes
   - Confirmar pagamento
   - Cancelar pagamento
   - Inserir novo pagamento (formulário)

2. **Inadimplentes**: Lista de afiliados com pagamentos vencidos
   - Visualizar dados de inadimplência
   - Botão para contatar

3. **Detalhes**: Visualizar detalhes completo de um pagamento
   - Informações do pagamento
   - Dados bancários
   - Comissões geradas
   - Ações (confirmar/cancelar)

**KPIs:**
- Pagamentos Pendentes (count)
- Inadimplentes (count)
- Total Pendente (valor)

#### 5. **AffiliatePayments.tsx** (Novo)
Página para afiliados visualizarem seus pagamentos:

**Abas:**
1. **Histórico de Pagamentos**: Lista de todos os pagamentos
   - Valor, método, data, status
   - Botão para ver detalhes

2. **Extrato de Remuneração**: Detalhamento de comissões
   - Resumo (total, valor, data)
   - Tabela com todas as comissões
   - Botão para baixar CSV
   - Info box explicativo

**KPIs:**
- Ganhos Confirmados (pronto para saque)
- Ganhos Pendentes (aguardando confirmação)
- Já Sacados (transferências realizadas)
- Total de Ganhos (confirmado + pago)

#### 6. **App.tsx** (Modificado)
Adicionadas 2 novas rotas:
- `/admin/payments` → PaymentManagement (admin only)
- `/payments` → AffiliatePayments (authenticated)

### Testes

#### 7. **payments.test.ts** (Novo)
Suite de testes com Vitest cobrindo:
- Inserção de pagamentos
- Listagem de pendentes
- Identificação de pagamentos
- Confirmação e comissionamento
- Cancelamento
- Geração de extratos
- Rastreamento de inadimplentes
- Histórico de pagamentos
- Detalhes de pagamentos
- **Fluxo completo**: Inserir → Identificar → Confirmar → Extrato

## Fluxo de Uso

### Admin: Processar Pagamento

1. **Inserir Receita**
   ```typescript
   await trpc.payments.insertPayment.mutate({
     amount: 50000,
     method: "boleto",
     bankCode: "001",
     bankNumber: "12345678",
   })
   ```

2. **Identificar Pagamento** (se necessário)
   ```typescript
   await trpc.payments.identifyPayment.mutate({
     paymentId: 1,
     affiliateId: 5,
   })
   ```

3. **Confirmar Pagamento** (calcula comissões automaticamente)
   ```typescript
   await trpc.payments.confirmPayment.mutate({
     paymentId: 1,
   })
   ```

### Afiliado: Visualizar Ganhos

1. **Ver Histórico de Pagamentos**
   ```typescript
   const { data } = trpc.payments.getPaymentHistory.useQuery({ limit: 20 })
   ```

2. **Gerar Extrato de Remuneração**
   ```typescript
   const { data } = trpc.payments.generateRemunerationStatement.useQuery({})
   ```

## Integração com Comissões

O sistema de pagamentos integra-se perfeitamente com a Fase 4 (Lógica MMN e Comissões):

1. Quando um pagamento é **confirmado**, o sistema:
   - Chama `calculateCommissionsForPayment()` para calcular comissões em cascata
   - Confirma as comissões criadas
   - Atualiza totais do afiliado

2. O cálculo respeita:
   - Até 15 níveis de profundidade
   - Percentual de comissão por afiliado
   - Status de comissões (pending → confirmed → paid)

## Segurança e Validações

- **Autenticação**: Todas as procedures protegidas requerem autenticação
- **Autorização**: 
  - Admin: Acesso total a todos os pagamentos
  - Afiliado: Acesso apenas aos seus próprios dados
- **Validações Zod**: Todos os inputs validados
- **Tratamento de Erros**: TRPCError com mensagens claras

## Próximas Fases

A Fase 5 prepara o terreno para:
- **Fase 6**: Agentes IA e Upgrades (já iniciada)
- **Fase 7**: Integração com Marketplaces
- **Fase 8**: Dropshipping Automatizado
- **Fase 9+**: Frontend e Testes

## Instruções de Deploy

1. **Verificar imports**: Confirmar que `paymentsRouter` está importado corretamente em `routers.ts`

2. **Executar migrations**: Se houver mudanças no schema
   ```bash
   pnpm drizzle-kit migrate
   ```

3. **Testar procedures**: Executar suite de testes
   ```bash
   pnpm test payments.test.ts
   ```

4. **Integrar no frontend**: As páginas `PaymentManagement.tsx` e `AffiliatePayments.tsx` estão prontas para uso

5. **Adicionar navegação**: Adicionar links nas barras de navegação:
   - Admin: `/admin/payments`
   - Afiliado: `/payments`

## Notas Importantes

- O sistema usa centavos como unidade (R$ 100,00 = 10000)
- Comissões são calculadas automaticamente ao confirmar pagamento
- Pagamentos cancelados revertam todas as comissões associadas
- Extratos de remuneração podem ser baixados em CSV
- Inadimplentes são identificados por pagamentos pendentes com mais de 30 dias

## Referências

- Manual: `manual_marketing_de_rede.txt`
- Schema: `schema.ts`
- Comissões: `commissions.ts`
- Documentação Técnica: `TECHNICAL_GUIDE.md`
