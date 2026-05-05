import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, DollarSign, TrendingDown, Plus, Eye } from "lucide-react";

export default function PaymentManagement() {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [showInsertForm, setShowInsertForm] = useState(false);

  // Queries
  const { data: pendingPayments, refetch: refetchPending } = trpc.payments.listPendingPayments.useQuery();
  const { data: delinquent } = trpc.payments.getDelinquentAffiliates.useQuery({ daysOverdue: 30 });
  const { data: paymentDetails } = trpc.payments.getPaymentDetails.useQuery(
    { paymentId: selectedPayment! },
    { enabled: !!selectedPayment }
  );

  // Mutations
  const confirmMutation = trpc.payments.confirmPayment.useMutation({
    onSuccess: () => {
      refetchPending();
      setSelectedPayment(null);
    },
  });

  const cancelMutation = trpc.payments.cancelPayment.useMutation({
    onSuccess: () => {
      refetchPending();
      setSelectedPayment(null);
    },
  });

  const identifyMutation = trpc.payments.identifyPayment.useMutation({
    onSuccess: () => {
      refetchPending();
    },
  });

  const handleConfirmPayment = (paymentId: number) => {
    if (confirm("Confirmar este pagamento? As comissões serão calculadas automaticamente.")) {
      confirmMutation.mutate({ paymentId });
    }
  };

  const handleCancelPayment = (paymentId: number) => {
    if (confirm("Cancelar este pagamento? As comissões serão revertidas.")) {
      cancelMutation.mutate({ paymentId });
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle },
      confirmed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      failed: { bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestão de Pagamentos</h1>
          <p className="text-slate-600">Gerenciar receitas, comissões e inadimplentes</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingPayments?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Inadimplentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{delinquent?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Vencidos há 30+ dias</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(
                  (pendingPayments || []).reduce((sum, p) => sum + p.amount, 0)
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Valor em aberto</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="delinquent">Inadimplentes</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          {/* Pagamentos Pendentes */}
          <TabsContent value="pending">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pagamentos Pendentes</CardTitle>
                    <CardDescription>Pagamentos aguardando confirmação e comissionamento</CardDescription>
                  </div>
                  <Button onClick={() => setShowInsertForm(!showInsertForm)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Pagamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showInsertForm && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-4">Inserir Novo Pagamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Valor (centavos)
                        </label>
                        <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Método
                        </label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                          <option>boleto</option>
                          <option>cartao</option>
                          <option>deposito</option>
                          <option>transferencia</option>
                          <option>pix</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Código do Banco
                        </label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Número
                        </label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1">Inserir Pagamento</Button>
                      <Button variant="outline" onClick={() => setShowInsertForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {pendingPayments && pendingPayments.length > 0 ? (
                  <div className="space-y-3">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <DollarSign className="w-5 h-5 text-amber-600" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {payment.method} • {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayment(payment.id)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleConfirmPayment(payment.id)}
                            disabled={confirmMutation.isPending}
                            className="gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum pagamento pendente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inadimplentes */}
          <TabsContent value="delinquent">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Afiliados Inadimplentes</CardTitle>
                <CardDescription>Pagamentos vencidos há 30+ dias</CardDescription>
              </CardHeader>
              <CardContent>
                {delinquent && delinquent.length > 0 ? (
                  <div className="space-y-3">
                    {delinquent.map((item) => (
                      <div
                        key={item.affiliateId}
                        className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {item.affiliateCode}
                            </p>
                            <p className="text-sm text-slate-600">
                              {item.pendingCount} pagamento(s) • {item.daysOverdue} dias vencido
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              {formatCurrency(item.totalAmount)}
                            </p>
                            <p className="text-xs text-slate-500">
                              desde {new Date(item.oldestPaymentDate).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Contatar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum afiliado inadimplente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detalhes do Pagamento */}
          <TabsContent value="details">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Detalhes do Pagamento</CardTitle>
                <CardDescription>
                  {selectedPayment ? `Pagamento #${selectedPayment}` : "Selecione um pagamento"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPayment && paymentDetails ? (
                  <div className="space-y-6">
                    {/* Informações do Pagamento */}
                    <div>
                      <h3 className="font-medium text-slate-900 mb-4">Informações do Pagamento</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Valor</p>
                          <p className="font-medium text-slate-900">
                            {formatCurrency(paymentDetails.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Método</p>
                          <p className="font-medium text-slate-900 capitalize">
                            {paymentDetails.method}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <p className="mt-1">{getStatusBadge(paymentDetails.status)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Data do Pagamento</p>
                          <p className="font-medium text-slate-900">
                            {new Date(paymentDetails.paymentDate || paymentDetails.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dados Bancários */}
                    {(paymentDetails.bankCode || paymentDetails.bankNumber) && (
                      <div>
                        <h3 className="font-medium text-slate-900 mb-4">Dados Bancários</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {paymentDetails.bankCode && (
                            <div>
                              <p className="text-sm text-slate-600">Código do Banco</p>
                              <p className="font-medium text-slate-900">{paymentDetails.bankCode}</p>
                            </div>
                          )}
                          {paymentDetails.bankNumber && (
                            <div>
                              <p className="text-sm text-slate-600">Número</p>
                              <p className="font-medium text-slate-900">{paymentDetails.bankNumber}</p>
                            </div>
                          )}
                          {paymentDetails.agency && (
                            <div>
                              <p className="text-sm text-slate-600">Agência</p>
                              <p className="font-medium text-slate-900">{paymentDetails.agency}</p>
                            </div>
                          )}
                          {paymentDetails.account && (
                            <div>
                              <p className="text-sm text-slate-600">Conta</p>
                              <p className="font-medium text-slate-900">{paymentDetails.account}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Comissões Relacionadas */}
                    {paymentDetails.relatedCommissions && paymentDetails.relatedCommissions.length > 0 && (
                      <div>
                        <h3 className="font-medium text-slate-900 mb-4">Comissões Geradas</h3>
                        <div className="space-y-2">
                          {paymentDetails.relatedCommissions.map((commission) => (
                            <div
                              key={commission.id}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  Nível {commission.level}
                                </p>
                                <p className="text-xs text-slate-500">{commission.status}</p>
                              </div>
                              <p className="font-medium text-slate-900">
                                {formatCurrency(commission.amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    {paymentDetails.status === "pending" && (
                      <div className="flex gap-2 pt-4 border-t border-slate-200">
                        <Button
                          onClick={() => handleConfirmPayment(paymentDetails.id)}
                          disabled={confirmMutation.isPending}
                          className="flex-1 gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmar Pagamento
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelPayment(paymentDetails.id)}
                          disabled={cancelMutation.isPending}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Selecione um pagamento na aba "Pendentes" para ver detalhes
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
