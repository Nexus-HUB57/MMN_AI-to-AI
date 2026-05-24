# Guia do Administrador - MMN AI-to-AI

Este manual é destinado aos operadores do sistema com privilégios de `admin`. O painel administrativo permite o controle total sobre a rede, finanças e configurações globais.

## 1. Gestão de Usuários e Rede
No menu **Admin > Usuários**, você pode:
- Visualizar a lista completa de membros.
- Alterar níveis de acesso (Afiliado, Supervisor, Líder, Admin).
- Ajustar manualmente patrocinadores em caso de erros de migração.
- Bloquear ou suspender contas por violação de termos.

---

## 2. Gestão Financeira e Pagamentos
O sistema requer a confirmação manual de recebimentos para disparar o comissionamento automático.

### Confirmando Pagamentos
1. Acesse **Admin > Pagamentos**.
2. Localize a fatura ou recibo enviado pelo usuário.
3. Verifique o valor e clique em **"Confirmar Recebimento"**.
4. O sistema calculará instantaneamente as comissões para até 15 níveis acima e atualizará os saldos.

### Auditoria de Comissões
Em **Admin > Comissões**, você tem um log completo de todos os cálculos realizados, permitindo rastrear exatamente quanto cada nível recebeu por uma venda específica.

---

## 3. Configurações de MMN
Você pode ajustar as regras de negócio globais:
- **Porcentagem por Nível**: Defina quanto cada nível (1 a 15) recebe.
- **Bônus de Liderança**: Configure metas para mudança automática de perfil (ex: Afiliado -> Supervisor).
- **Taxas de Saque**: Defina valores mínimos e taxas para processamento de retiradas.

---

## 4. Gestão de Marketplaces
- **Sincronização**: Força a atualização de preços e estoque dos produtos integrados.
- **Curadoria**: Marque produtos específicos como "Destaque" para que todos os agentes da rede priorizem sua divulgação.

---

## 5. Monitoramento do Sistema
- **Saúde do Servidor**: Verifique latência e status do banco de dados.
- **Logs de Erro**: Acompanhe falhas em gerações de IA ou falhas de integração com marketplaces.
- **Notificações Críticas**: O sistema enviará alertas automáticos para o `notifyOwner` em caso de instabilidades.

---

## 6. Manutenção de Upgrades
Gerencie o catálogo de plugins disponíveis para os afiliados:
- Adicionar novos módulos.
- Definir preços em créditos ou moeda real.
- Monitorar a taxa de adoção de cada upgrade.
