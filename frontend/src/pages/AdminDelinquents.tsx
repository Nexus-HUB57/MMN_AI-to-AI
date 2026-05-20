import { useMemo, useState } from "react";
import { AlertCircle, BellRing, RefreshCw, ShieldAlert, Wallet } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type DelinquentStatus = "all" | "active" | "inactive" | "suspended";
type RouterDelinquentStatus = Exclude<DelinquentStatus, "all">;
type ReminderTemplate = "first" | "second" | "final" | "custom";

const statusMeta: Record<RouterDelinquentStatus, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-amber-100 text-amber-800" },
  inactive: { label: "Inativo", className: "bg-slate-200 text-slate-700" },
  suspended: { label: "Suspenso", className: "bg-red-100 text-red-800" },
};

const formatCurrency = (value: number | string | null | undefined) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminDelinquents() {
  const [statusFilter, setStatusFilter] = useState<DelinquentStatus>("all");
  const [daysFilter, setDaysFilter] = useState("all");
  const [selectedDelinquent, setSelectedDelinquent] = useState<{
    id: number;
    status: RouterDelinquentStatus;
  } | null>(null);
  const [reminderTargetId, setReminderTargetId] = useState<number | null>(null);
  const [reminderTemplate, setReminderTemplate] = useState<ReminderTemplate>("first");

  const delinquentsQuery = trpc.delinquents.list.useQuery({
    page: 1,
    limit: 50,
    minDaysOverdue: daysFilter === "all" ? undefined : Number(daysFilter),
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statsQuery = trpc.delinquents.getStats.useQuery();

  const updateStatusMutation = trpc.delinquents.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do inadimplente atualizado com sucesso");
      delinquentsQuery.refetch();
      statsQuery.refetch();
      setSelectedDelinquent(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status do inadimplente");
    },
  });

  const sendReminderMutation = trpc.delinquents.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Lembrete enviado com sucesso");
      setReminderTargetId(null);
      setReminderTemplate("first");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar lembrete");
    },
  });

  const delinquents = delinquentsQuery.data || [];

  const visibleSummary = useMemo(
    () => ({
      totalOutstanding: delinquents.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0),
      active: delinquents.filter((item) => item.status === "active").length,
      suspended: delinquents.filter((item) => item.status === "suspended").length,
      averageAttempts: delinquents.length
        ? Math.round(delinquents.reduce((sum, item) => sum + Number(item.contactAttempts || 0), 0) / delinquents.length)
        : 0,
    }),
    [delinquents]
  );

  const getSeverityClass = (daysOverdue: number) => {
    if (daysOverdue >= 90) return "bg-red-100 text-red-800";
    if (daysOverdue >= 30) return "bg-orange-100 text-orange-800";
    return "bg-amber-100 text-amber-800";
  };

  const handleUpdateStatus = () => {
    if (!selectedDelinquent) return;

    updateStatusMutation.mutate({
      delinquentId: selectedDelinquent.id,
      status: selectedDelinquent.status,
    });
  };

  const handleSendReminder = () => {
    if (!reminderTargetId) return;

    sendReminderMutation.mutate({
      delinquentId: reminderTargetId,
      template: reminderTemplate,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inadimplência operacional</h1>
            <p className="mt-2 text-slate-600">
              Supervisão administrativa de afiliados com pendências financeiras, com filtros, atualização de status e disparo de lembretes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              delinquentsQuery.refetch();
              statsQuery.refetch();
            }}
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar dados
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Wallet size={18} />
              <span className="text-sm">Saldo em atraso</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              R$ {formatCurrency(statsQuery.data?.totalOutstanding)}
            </p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle size={18} />
              <span className="text-sm">Inadimplentes ativos</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{statsQuery.data?.byStatus.active ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldAlert size={18} />
              <span className="text-sm">Suspensos</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-700">{statsQuery.data?.byStatus.suspended ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <BellRing size={18} />
              <span className="text-sm">Média de dias</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{statsQuery.data?.averageDaysOverdue ?? 0}</p>
          </Card>
        </section>

        <Card className="bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[220px_220px_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: DelinquentStatus) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Dias mínimos em atraso</p>
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dias em atraso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sem corte</SelectItem>
                  <SelectItem value="7">7+ dias</SelectItem>
                  <SelectItem value="30">30+ dias</SelectItem>
                  <SelectItem value="60">60+ dias</SelectItem>
                  <SelectItem value="90">90+ dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Na página</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{delinquents.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Volume visível</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">R$ {formatCurrency(visibleSummary.totalOutstanding)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Média de contatos</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleSummary.averageAttempts}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Lista operacional de inadimplentes</h2>
            <p className="text-sm text-slate-500">Atualização via domínio dedicado <code>trpc.delinquents.*</code>.</p>
          </div>

          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">Afiliado</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Código</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Saldo em atraso</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Dias</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Último pagamento</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Tentativas</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {delinquentsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-36" /></td>
                  </tr>
                ))
              ) : delinquents.length > 0 ? (
                delinquents.map((delinquent) => {
                  const status = delinquent.status as RouterDelinquentStatus;
                  return (
                    <tr key={delinquent.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{delinquent.name}</p>
                          <p className="text-sm text-slate-500">{delinquent.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{delinquent.affiliateCode}</td>
                      <td className="px-4 py-4 font-semibold text-red-700">
                        R$ {formatCurrency(delinquent.outstandingAmount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getSeverityClass(delinquent.daysOverdue)}`}>
                          {delinquent.daysOverdue} dias
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {delinquent.lastPaymentDate
                          ? new Date(delinquent.lastPaymentDate).toLocaleDateString("pt-BR")
                          : "Sem registro"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{delinquent.contactAttempts || 0}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusMeta[status]?.className || "bg-slate-100 text-slate-700"}`}>
                          {statusMeta[status]?.label || delinquent.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDelinquent({ id: delinquent.id, status })}
                          >
                            Atualizar status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReminderTargetId(delinquent.id)}
                          >
                            Lembrete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Nenhum inadimplente encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {selectedDelinquent ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Atualizar status do inadimplente #{selectedDelinquent.id}
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_auto] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                <Select
                  value={selectedDelinquent.status}
                  onValueChange={(value: RouterDelinquentStatus) =>
                    setSelectedDelinquent((current) =>
                      current ? { ...current, status: value } : current
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? "Salvando..." : "Salvar alteração"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedDelinquent(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {reminderTargetId ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Enviar lembrete para #{reminderTargetId}</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_auto] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Template</p>
                <Select value={reminderTemplate} onValueChange={(value: ReminderTemplate) => setReminderTemplate(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">Primeiro lembrete</SelectItem>
                    <SelectItem value="second">Segundo lembrete</SelectItem>
                    <SelectItem value="final">Lembrete final</SelectItem>
                    <SelectItem value="custom">Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSendReminder} disabled={sendReminderMutation.isPending}>
                  {sendReminderMutation.isPending ? "Enviando..." : "Enviar lembrete"}
                </Button>
                <Button variant="outline" onClick={() => setReminderTargetId(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
