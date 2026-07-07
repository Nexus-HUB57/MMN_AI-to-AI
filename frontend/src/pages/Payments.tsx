import { useState } from 'react';
import { trpc } from '../lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import BRLBTCConverter from '@/components/payments/BRLBTCConverter';
import BtcCustodyPanel from "@/components/BtcCustodyPanel";
import { Wallet, Plus, Trash2, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight, RefreshCw } from 'lucide-react';

type TabType = 'balance' | 'accounts' | 'withdraw' | 'history';
type AccountType = 'checking' | 'savings';
type PIXType = 'email' | 'cpf' | 'phone' | 'random';

export default function Payments() {
  const [activeTab, setActiveTab] = useState<TabType>('balance');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Form states
  const [newAccount, setNewAccount] = useState({
    bankCode: '',
    bankName: '',
    accountType: 'checking' as AccountType,
    agency: '',
    accountNumber: '',
    accountDigit: '',
    pixKey: '',
    pixKeyType: 'cpf' as PIXType,
    holderName: '',
    holderDocument: '',
  });

  const [withdrawForm, setWithdrawForm] = useState({
    bankAccountId: 0,
    amount: '',
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = trpc.banking.getBalance.useQuery();
  const { data: bankAccounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.banking.listBankAccounts.useQuery();
  const { data: withdrawals, isLoading: withdrawalsLoading } = trpc.banking.listWithdrawals.useQuery({ limit: 20 });
  const { data: transactions, isLoading: transactionsLoading } = trpc.banking.getTransactionHistory.useQuery({ limit: 50 });

  // Mutations
  const addAccountMutation = trpc.banking.addBankAccount.useMutation({
    onSuccess: () => {
      refetchAccounts();
      setShowAddAccount(false);
      setNewAccount({
        bankCode: '',
        bankName: '',
        accountType: 'checking',
        agency: '',
        accountNumber: '',
        accountDigit: '',
        pixKey: '',
        pixKeyType: 'cpf',
        holderName: '',
        holderDocument: '',
      });
    },
  });

  const deleteAccountMutation = trpc.banking.deleteBankAccount.useMutation({
    onSuccess: () => refetchAccounts(),
  });

  const setPrimaryMutation = trpc.banking.setPrimaryBankAccount.useMutation({
    onSuccess: () => refetchAccounts(),
  });

  const withdrawMutation = trpc.banking.requestWithdrawal.useMutation({
    onSuccess: () => {
      refetchBalance();
      refetchAccounts();
      setShowWithdraw(false);
      setWithdrawForm({ bankAccountId: 0, amount: '' });
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-900/50 text-yellow-200', text: 'Pendente', icon: <Clock className="w-3 h-3" /> },
      approved: { bg: 'bg-blue-900/50 text-blue-200', text: 'Aprovado', icon: <CheckCircle className="w-3 h-3" /> },
      processing: { bg: 'bg-purple-900/50 text-purple-200', text: 'Processando', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      completed: { bg: 'bg-green-900/50 text-green-200', text: 'Concluído', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { bg: 'bg-red-900/50 text-red-200', text: 'Rejeitado', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { bg: 'bg-gray-700/50 text-gray-300', text: 'Cancelado', icon: <XCircle className="w-3 h-3" /> },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.bg}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      commission: <ArrowDownRight className="w-4 h-4 text-green-400" />,
      withdrawal: <ArrowUpRight className="w-4 h-4 text-red-400" />,
      bonus: <ArrowDownRight className="w-4 h-4 text-yellow-400" />,
      fee: <ArrowUpRight className="w-4 h-4 text-orange-400" />,
      blocked: <AlertCircle className="w-4 h-4 text-yellow-400" />,
      unblocked: <CheckCircle className="w-4 h-4 text-green-400" />,
    };
    return icons[type] || <CreditCard className="w-4 h-4 text-gray-400" />;
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      commission: 'Comissão',
      withdrawal: 'Saque',
      bonus: 'Bônus',
      fee: 'Taxa',
      blocked: 'Bloqueado',
      unblocked: 'Desbloqueado',
      deposit: 'Depósito',
      adjustment: 'Ajuste',
      refund: 'Estorno',
    };
    return labels[type] || type;
  };

  const primaryAccount = bankAccounts?.find(a => a.isPrimary);

  const tabs = [
    { id: 'balance', label: 'Saldo', icon: PiggyBank },
    { id: 'accounts', label: 'Contas', icon: CreditCard },
    { id: 'withdraw', label: 'Sacar', icon: ArrowUpRight },
    { id: 'history', label: 'Histórico', icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            BeYour Banker
          </h1>
          <p className="text-gray-400">
            Gerencie suas finanças, saques e dados bancários
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-300 text-sm font-medium">Saldo Disponível</span>
                  <PiggyBank className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {balanceLoading ? '...' : formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-6 border border-yellow-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-yellow-300 text-sm font-medium">Saldo em Processamento</span>
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {balanceLoading ? '...' : formatCurrency(balance?.pendingBalance || 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl p-6 border border-orange-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-300 text-sm font-medium">Total Ganho</span>
                  <ArrowDownRight className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {balanceLoading ? '...' : formatCurrency(balance?.totalEarned || 0)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowWithdraw(true);
                  setActiveTab('withdraw');
                }}
                className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">Solicitar Saque</h3>
                    <p className="text-gray-400 text-sm">Transforme seu saldo em dinheiro</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" />
              </button>

              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-semibold">Adicionar Conta</h3>
                    <p className="text-gray-400 text-sm">Cadastre sua conta para receber</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
              </button>
            </div>
            {/* D14-BTC converter */}
            <div className="mt-2">
              <BtcCustodyPanel />
            </div>

          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Add Account Button */}
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Conta
            </button>

            {/* Add Account Form */}
            {showAddAccount && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-white">Nova Conta Bancária</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Código do Banco</label>
                    <input
                      type="text"
                      value={newAccount.bankCode}
                      onChange={e => setNewAccount({ ...newAccount, bankCode: e.target.value })}
                      placeholder="341"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome do Banco</label>
                    <input
                      type="text"
                      value={newAccount.bankName}
                      onChange={e => setNewAccount({ ...newAccount, bankName: e.target.value })}
                      placeholder="Banco Bradesco"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Agência</label>
                    <input
                      type="text"
                      value={newAccount.agency}
                      onChange={e => setNewAccount({ ...newAccount, agency: e.target.value })}
                      placeholder="1234"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Conta</label>
                    <input
                      type="text"
                      value={newAccount.accountNumber}
                      onChange={e => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                      placeholder="56789"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Dígito</label>
                    <input
                      type="text"
                      value={newAccount.accountDigit}
                      onChange={e => setNewAccount({ ...newAccount, accountDigit: e.target.value })}
                      placeholder="0"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo de Conta</label>
                    <select
                      value={newAccount.accountType}
                      onChange={e => setNewAccount({ ...newAccount, accountType: e.target.value as AccountType })}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="checking">Conta Corrente</option>
                      <option value="savings">Poupança</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo PIX</label>
                    <select
                      value={newAccount.pixKeyType}
                      onChange={e => setNewAccount({ ...newAccount, pixKeyType: e.target.value as PIXType })}
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Chave PIX</label>
                    <input
                      type="text"
                      value={newAccount.pixKey}
                      onChange={e => setNewAccount({ ...newAccount, pixKey: e.target.value })}
                      placeholder="chave@email.com"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome do Titular</label>
                    <input
                      type="text"
                      value={newAccount.holderName}
                      onChange={e => setNewAccount({ ...newAccount, holderName: e.target.value })}
                      placeholder="Nome completo"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addAccountMutation.mutate(newAccount)}
                    disabled={addAccountMutation.isPending}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {addAccountMutation.isPending ? 'Salvando...' : 'Salvar Conta'}
                  </button>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Accounts List */}
            <div className="space-y-3">
              {accountsLoading ? (
                <p className="text-gray-400">Carregando...</p>
              ) : bankAccounts?.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma conta cadastrada</p>
                </div>
              ) : (
                bankAccounts?.map(account => (
                  <div
                    key={account.id}
                    className={`bg-gray-800/50 rounded-xl p-4 border ${
                      account.isPrimary ? 'border-green-600' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          account.isPrimary ? 'bg-green-600/20' : 'bg-gray-700'
                        }`}>
                          <CreditCard className={`w-5 h-5 ${account.isPrimary ? 'text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold">{account.bankName}</h4>
                            {account.isPrimary && (
                              <span className="px-2 py-0.5 bg-green-600/20 text-green-300 text-xs rounded">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {account.accountType === 'checking' ? 'Conta Corrente' : 'Poupança'} • Ag. {account.agency} • CC {account.accountNumber}{account.accountDigit ? `-${account.accountDigit}` : ''}
                          </p>
                          {account.pixKey && (
                            <p className="text-gray-500 text-xs mt-1">
                              PIX: {account.pixKeyType?.toUpperCase()} • {account.pixKey}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!account.isPrimary && (
                          <button
                            onClick={() => setPrimaryMutation.mutate({ bankAccountId: account.id })}
                            className="px-3 py-1 text-sm text-orange-400 hover:bg-orange-600/20 rounded transition-colors"
                          >
                            Definir Principal
                          </button>
                        )}
                        <button
                          onClick={() => deleteAccountMutation.mutate({ bankAccountId: account.id })}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            {/* Withdraw Form */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold text-white">Solicitar Saque</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Conta de Destino</label>
                  <select
                    value={withdrawForm.bankAccountId}
                    onChange={e => setWithdrawForm({ ...withdrawForm, bankAccountId: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                  >
                    <option value={0}>Selecione uma conta</option>
                    {bankAccounts?.filter(a => a.status === 'active').map(account => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber} {account.isPrimary ? '(Principal)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    placeholder="100.00"
                    min="10"
                    step="0.01"
                    className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {withdrawForm.amount && (
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor do saque:</span>
                    <span className="text-white">{formatCurrency(parseFloat(withdrawForm.amount) * 100)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Taxa (2%):</span>
                    <span className="text-orange-400">- {formatCurrency(Math.max(200, parseFloat(withdrawForm.amount) * 100 * 0.02))}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between">
                    <span className="text-gray-400 font-medium">Valor líquido:</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(parseFloat(withdrawForm.amount) * 100 - Math.max(200, parseFloat(withdrawForm.amount) * 100 * 0.02))}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => withdrawMutation.mutate({
                  bankAccountId: withdrawForm.bankAccountId,
                  amount: parseFloat(withdrawForm.amount) * 100,
                })}
                disabled={!withdrawForm.bankAccountId || !withdrawForm.amount || withdrawMutation.isPending}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawMutation.isPending ? 'Processando...' : 'Solicitar Saque'}
              </button>

              {withdrawMutation.error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {withdrawMutation.error.message}
                </div>
              )}
            </div>

            {/* Recent Withdrawals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Saques Recentes</h3>
              <div className="space-y-3">
                {withdrawalsLoading ? (
                  <p className="text-gray-400">Carregando...</p>
                ) : withdrawals?.length === 0 ? (
                  <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700">
                    <ArrowUpRight className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Nenhum saque solicitado</p>
                  </div>
                ) : (
                  withdrawals?.map(withdrawal => (
                    <div key={withdrawal.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{formatCurrency(withdrawal.netAmount)}</p>
                          <p className="text-gray-400 text-sm">
                            Solicitado em {formatDateTime(withdrawal.requestedAt)}
                          </p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      {withdrawal.rejectionReason && (
                        <p className="text-red-400 text-sm mt-2">
                          Motivo: {withdrawal.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Histórico de Transações</h3>
            <div className="space-y-2">
              {transactionsLoading ? (
                <p className="text-gray-400">Carregando...</p>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma transação registrada</p>
                </div>
              ) : (
                transactions?.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{getTransactionLabel(tx.type)}</p>
                        <p className="text-gray-400 text-sm">
                          {tx.description || 'Sem descrição'} • {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}