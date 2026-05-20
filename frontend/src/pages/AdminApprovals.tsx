import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileSearch, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ApprovalType = "new_affiliate" | "profile_update" | "career_upgrade" | "special_request";
type ApprovalPriority = "low" | "medium" | "high" | "urgent";
type ProcessedStatus = "approved" | "rejected";

type PendingApproval = {
  id: number;
  type: ApprovalType;
  priority: ApprovalPriority;
  status: "pending";
  userId: number;
  userName: string;
  userEmail: string;
  affiliateCode?: string;
  sponsorName?: string;
  submittedAt?: string | Date;
  data?: Record<string, unknown>;
};

type ProcessedApproval = {
  id: number;
  type: string;
  status: ProcessedStatus;
  userId: number;
  userName: string;
  userEmail: string;
  processedBy?: string;
  processedAt?: string | Date;
  notes?: string;
};

const typeLabel: Record<ApprovalType, string> = {
  new_affiliate: "Novo afiliado",
  profile_update: "Atualização de perfil",
  career_upgrade: "Upgrade de carreira",
  special_request: "Solicitação especial",
};

const priorityMeta: Record<ApprovalPriority, { label: string; className: string }> = {
  low: { label: "Baixa", className: "bg-slate-200 text-slate-700" },
  medium: { label: "Média", className: "bg-blue-100 text-blue-800" },
  high: { label: "Alta", className: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", className: "bg-red-100 text-red-800" },
};

const processedMeta: Record<ProcessedStatus, { label: string; className: string }> = {
  approved: { label: "Aprovada", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejeitada", className: "bg-red-100 text-red-800" },
};

export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending");
  const [pendingTypeFilter, setPendingTypeFilter] = useState<"all" | ApprovalType>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ApprovalPriority>("all");
  const [processedStatusFilter, setProcessedStatusFilter] = useState<"all" | ProcessedStatus>("all");
  const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [infoField, setInfoField] = useState("");
  const [infoQuestion, setInfoQuestion] = useState("");

  const pendingQuery = trpc.approvals.listPending.useQuery(
    {
      page: 1,
      limit: 50,
      type: pendingTypeFilter === "all" ? undefined : pendingTypeFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
    },
    {
      enabled: activeTab === "pending",
    }
  );

  const processedQuery = trpc.approvals.listProcessed.useQuery(
    {
      page: 1,
      limit: 50,
      status: processedStatusFilter === "all" ? undefined : processedStatusFilter,
    },
    {
      enabled: activeTab === "processed",
    }
  );

  const statsQuery = trpc.approvals.getStats.useQuery();

  const detailsQuery = trpc.approvals.getById.useQuery(
    { id: selectedApprovalId || 0 },
    { enabled: selectedApprovalId !== null }
  );

  const approveMutation = trpc.approvals.approve.useMutation({
    onSuccess: () => {
      toast.success("Solicitação aprovada com sucesso");
      pendingQuery.refetch();
      processedQuery.refetch();
      statsQuery.refetch();
      detailsQuery.refetch();
      setApprovalNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar solicitação");
    },
  });

  const rejectMutation = trpc.approvals.reject.useMutation({
    onSuccess: () => {
      toast.success("Solicitação rejeitada com sucesso");
      pendingQuery.refetch();
      processedQuery.refetch();
      statsQuery.refetch();
      detailsQuery.refetch();
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao rejeitar solicitação");
    },
  });

  const requestInfoMutation = trpc.approvals.requestInfo.useMutation({
    onSuccess: () => {
      toast.success("Solicitação de informações enviada");
      setInfoField("");
      setInfoQuestion("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao solicitar mais informações");
    },
  });

  const pendingApprovals = (pendingQuery.data?.approvals || []) as PendingApproval[];
  const processedApprovals = (processedQuery.data?.approvals || []) as ProcessedApproval[];

  const currentRows = activeTab === "pending" ? pendingApprovals : processedApprovals;

  const visibleSummary = useMemo(() => {
    if (activeTab === "pending") {
      return {
        total: pendingApprovals.length,
        highPriority: pendingApprovals.filter((item) => item.priority === "high" || item.priority === "urgent").length,
        urgent: pendingApprovals.filter((item) => item.priority === "urgent").length,
      };
    }

    return {
      total: processedApprovals.length,
      approved: processedApprovals.filter((item) => item.status === "approved").length,
      rejected: processedApprovals.filter((item) => item.status === "rejected").length,
    };
  }, [activeTab, pendingApprovals, processedApprovals]);

  const handleApprove = () => {
    if (!selectedApprovalId) return;
    approveMutation.mutate({ id: selectedApprovalId, notes: approvalNotes || undefined });
  };

  const handleReject = () => {
    if (!selectedApprovalId) return;
    if (!rejectReason.trim()) {
      toast.error("Informe o motivo da rejeição");
      return;
    }

    rejectMutation.mutate({ id: selectedApprovalId, reason: rejectReason });
  };

  const handleRequestInfo = () => {
    if (!selectedApprovalId) return;
    if (!infoField.trim() || !infoQuestion.trim()) {
      toast.error("Preencha o campo e a pergunta para solicitar mais informações");
      return;
    }

    requestInfoMutation.mutate({
      id: selectedApprovalId,
      questions: [
        {
          field: infoField,
          question: infoQuestion,
        },
      ],
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Aprovações administrativas</h1>
            <p className="mt-2 text-slate-600">
              Fila operacional para revisão de novos afiliados, upgrades, atualizações de perfil e solicitações especiais.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              pendingQuery.refetch();
              processedQuery.refetch();
              statsQuery.refetch();
              if (selectedApprovalId) {
                detailsQuery.refetch();
              }
            }}
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar dados
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock3 size={18} />
              <span className="text-sm">Pendentes totais</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{statsQuery.data?.pending.total ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldX size={18} />
              <span className="text-sm">Urgentes</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-700">{statsQuery.data?.pending.byPriority.urgent ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <ShieldCheck size={18} />
              <span className="text-sm">Processadas hoje</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-700">{statsQuery.data?.processed.today ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 size={18} />
              <span className="text-sm">Taxa de aprovação</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {Math.round(Number(statsQuery.data?.approvalRate || 0) * 100)}%
            </p>
          </Card>
        </section>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "processed")}> 
          <TabsList>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="processed">Processadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[240px_240px_1fr] lg:items-end">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Tipo</p>
                  <Select value={pendingTypeFilter} onValueChange={(value: "all" | ApprovalType) => setPendingTypeFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="new_affiliate">Novo afiliado</SelectItem>
                      <SelectItem value="profile_update">Atualização de perfil</SelectItem>
                      <SelectItem value="career_upgrade">Upgrade de carreira</SelectItem>
                      <SelectItem value="special_request">Solicitação especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Prioridade</p>
                  <Select value={priorityFilter} onValueChange={(value: "all" | ApprovalPriority) => setPriorityFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as prioridades</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Na fila</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleSummary.total}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Alta/Urgente</p>
                    <p className="mt-2 text-2xl font-semibold text-orange-700">{visibleSummary.highPriority ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Urgentes</p>
                    <p className="mt-2 text-2xl font-semibold text-red-700">{visibleSummary.urgent ?? 0}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-x-auto bg-white p-6 shadow-sm">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-900">Solicitante</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Prioridade</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Afiliado</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Patrocinador</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Envio</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQuery.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : pendingApprovals.length > 0 ? (
                    pendingApprovals.map((approval) => (
                      <tr key={approval.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{approval.userName}</p>
                            <p className="text-sm text-slate-500">{approval.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{typeLabel[approval.type]}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${priorityMeta[approval.priority].className}`}>
                            {priorityMeta[approval.priority].label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{approval.affiliateCode || "Sem código"}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{approval.sponsorName || "N/A"}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {approval.submittedAt ? new Date(approval.submittedAt).toLocaleDateString("pt-BR") : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <Button variant="outline" size="sm" onClick={() => setSelectedApprovalId(approval.id)}>
                            Revisar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        Nenhuma aprovação pendente encontrada para os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="processed" className="space-y-6">
            <Card className="bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-end">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Status processado</p>
                  <Select value={processedStatusFilter} onValueChange={(value: "all" | ProcessedStatus) => setProcessedStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="approved">Aprovadas</SelectItem>
                      <SelectItem value="rejected">Rejeitadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Na página</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleSummary.total}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Aprovadas</p>
                    <p className="mt-2 text-2xl font-semibold text-green-700">{visibleSummary.approved ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Rejeitadas</p>
                    <p className="mt-2 text-2xl font-semibold text-red-700">{visibleSummary.rejected ?? 0}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-x-auto bg-white p-6 shadow-sm">
              <table className="w-full min-w-[920px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-900">Solicitante</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Processado por</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Data</th>
                    <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {processedQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : processedApprovals.length > 0 ? (
                    processedApprovals.map((approval) => (
                      <tr key={approval.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{approval.userName}</p>
                            <p className="text-sm text-slate-500">{approval.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{approval.type}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${processedMeta[approval.status].className}`}>
                            {processedMeta[approval.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{approval.processedBy || "N/A"}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {approval.processedAt ? new Date(approval.processedAt).toLocaleDateString("pt-BR") : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <Button variant="outline" size="sm" onClick={() => setSelectedApprovalId(approval.id)}>
                            Ver detalhes
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        Nenhuma aprovação processada encontrada para os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileSearch size={18} className="text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Detalhes e ações</h2>
          </div>

          {!selectedApprovalId ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Selecione uma solicitação para revisar detalhes e acionar o fluxo administrativo.
            </div>
          ) : detailsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailsQuery.data ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Solicitante</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{detailsQuery.data.userName}</p>
                  <p className="text-sm text-slate-500">{detailsQuery.data.userEmail}</p>
                  <p className="mt-2 text-sm text-slate-500">Código: {detailsQuery.data.affiliateCode || "N/A"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Contexto</p>
                  <p className="mt-2 text-sm text-slate-700">Tipo: {String(detailsQuery.data.type)}</p>
                  <p className="text-sm text-slate-700">Prioridade: {String(detailsQuery.data.priority || "n/a")}</p>
                  <p className="text-sm text-slate-700">Patrocinador: {detailsQuery.data.sponsorName || "N/A"}</p>
                  <p className="text-sm text-slate-700">
                    Enviado em: {detailsQuery.data.submittedAt ? new Date(detailsQuery.data.submittedAt).toLocaleString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">Payload da solicitação</p>
                  <pre className="overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
{JSON.stringify(detailsQuery.data.data || {}, null, 2)}
                  </pre>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-700">Histórico</p>
                  {detailsQuery.data.history?.length ? (
                    <div className="space-y-3">
                      {detailsQuery.data.history.map((item: any, index: number) => (
                        <div key={`${item.action}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-medium text-slate-900">{item.action}</p>
                          <p className="text-slate-500">por {item.by}</p>
                          <p className="text-slate-500">{item.at ? new Date(item.at).toLocaleString("pt-BR") : "Sem data"}</p>
                          <p className="mt-1 text-slate-600">{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Sem histórico disponível.</p>
                  )}
                </div>
              </div>

              {activeTab === "pending" ? (
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="border border-green-200 bg-green-50 p-4 shadow-none">
                    <h3 className="text-base font-semibold text-green-900">Aprovar</h3>
                    <p className="mt-2 text-sm text-green-800">Opcionalmente registre uma observação operacional antes de aprovar.</p>
                    <Textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Observações da aprovação"
                      className="mt-3 bg-white"
                    />
                    <Button className="mt-3 w-full" onClick={handleApprove} disabled={approveMutation.isPending}>
                      {approveMutation.isPending ? "Aprovando..." : "Confirmar aprovação"}
                    </Button>
                  </Card>

                  <Card className="border border-red-200 bg-red-50 p-4 shadow-none">
                    <h3 className="text-base font-semibold text-red-900">Rejeitar</h3>
                    <p className="mt-2 text-sm text-red-800">Informe um motivo para manter rastreabilidade da decisão.</p>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Motivo da rejeição"
                      className="mt-3 bg-white"
                    />
                    <Button variant="destructive" className="mt-3 w-full" onClick={handleReject} disabled={rejectMutation.isPending}>
                      {rejectMutation.isPending ? "Rejeitando..." : "Rejeitar solicitação"}
                    </Button>
                  </Card>

                  <Card className="border border-blue-200 bg-blue-50 p-4 shadow-none">
                    <h3 className="text-base font-semibold text-blue-900">Solicitar mais informações</h3>
                    <p className="mt-2 text-sm text-blue-800">Abra um ciclo de revisão pedindo evidências ou esclarecimentos adicionais.</p>
                    <Input
                      value={infoField}
                      onChange={(e) => setInfoField(e.target.value)}
                      placeholder="Campo ou área a revisar"
                      className="mt-3 bg-white"
                    />
                    <Textarea
                      value={infoQuestion}
                      onChange={(e) => setInfoQuestion(e.target.value)}
                      placeholder="Pergunta ao solicitante"
                      className="mt-3 bg-white"
                    />
                    <Button variant="outline" className="mt-3 w-full" onClick={handleRequestInfo} disabled={requestInfoMutation.isPending}>
                      {requestInfoMutation.isPending ? "Enviando..." : "Solicitar informações"}
                    </Button>
                  </Card>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Esta solicitação já está processada. Use os dados acima para auditoria e conferência.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Não foi possível carregar os detalhes da solicitação selecionada.
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
