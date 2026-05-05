import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, Eye, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export default function AffiliatePayments() {
  // Queries
  const { data: paymentHistory } = trpc.payments.getPaymentHistory.useQuery({ limit: 20 });
  const { data: statement } = trpc.payments.generateRemunerationStatement.useQuery({});

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      confirmed: { bg: "bg-green-100", text: "text-green-800" },
      failed: { bg: "bg-red-100", text: "text-red-800" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDownloadStatement = () => {
    if (!statement) return;

    // Criar CSV
    const headers = ["ID", "Tipo", "Valor", "Nível", "Status", "Data"];
    const rows = statement.commissions.map((c) => [
      c.id,
      c.source,
      formatCurrency(c.amount),
      c.level,
      c.status,
      new Date(c.createdAt).toLocaleDateString("pt-BR"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extrato-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Meus Pagamentos</h1>
          <p className="text-slate-600">Visualize seu histórico de pagamentos e extratos de remuneração</p>
        </div>

        {/* KPI Cards */}
        {statement && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ganhos Confirmados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(statement.totalConfirmed)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Pronto para saque</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ganhos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {formatCurrency(statement.totalPending)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Aguardando confirmação</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Já Sacados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(statement.totalPaid)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Transferências realizadas</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Ganhos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(statement.totalEarnings)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Confirmado + Pago</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="history" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Histórico de Pagamentos</TabsTrigger>
            <TabsTrigger value="statement">Extrato de Remuneração</TabsTrigger>
          </TabsList>

          {/* Histórico de Pagamentos */}
          <TabsContent value="history">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Todos os seus pagamentos registrados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentHistory && paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <DollarSign className="w-5 h-5 text-blue-600" />
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
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum pagamento registrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extrato de Remuneração */}
          <TabsContent value="statement">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Extrato de Remuneração</CardTitle>
                    <CardDescription>Detalhamento de todas as suas comissões</CardDescription>
                  </div>
                  <Button onClick={handleDownloadStatement} className="gap-2">
                    <Download className="w-4 h-4" />
                    Baixar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {statement && statement.commissions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Resumo */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-sm text-slate-600">Total de Comissões</p>
                        <p className="text-xl font-bold text-slate-900">
                          {statement.commissions.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Valor Total</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(
                            statement.commissions.reduce((sum, c) => sum + c.amount, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Gerado em</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(statement.generatedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {/* Tabela de Comissões */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-medium text-slate-900">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Tipo</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Nível</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Valor</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statement.commissions.map((commission) => (
                            <tr key={commission.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-600">#{commission.id}</td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className="capitalize">
                                  {commission.source}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {commission.level === 0 ? "Bônus" : `Nível ${commission.level}`}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-900">
                                {formatCurrency(commission.amount)}
                              </td>
                              <td className="py-3 px-4">{getStatusBadge(commission.status)}</td>
                              <td className="py-3 px-4 text-slate-600">
                                {new Date(commission.createdAt).toLocaleDateString("pt-BR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Sobre seu extrato</p>
                        <p>
                          Comissões pendentes ainda não foram confirmadas. Comissões confirmadas estão prontas para
                          saque. Comissões pagas já foram transferidas para sua conta.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhuma comissão registrada
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Aumente seus Ganhos
            </CardTitle>
            <CardDescription className="text-green-100">
              Indique mais pessoas e ative upgrades para aumentar suas comissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full md:w-auto">
              Ver Oportunidades
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
