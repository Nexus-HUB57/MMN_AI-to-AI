import React, { useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight, X } from "lucide-react";

const statusBadgeMeta: Record<string, string> = {
  completed: "bg-green-100 text-green-800 hover:bg-green-100",
  failed: "bg-red-100 text-red-800 hover:bg-red-100",
  processing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  pending: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

function getInitialFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") || "",
    status: params.get("status") || "all",
    jobType: params.get("jobType") || "",
    queueName: params.get("queueName") || "",
  };
}

export default function ExecutionLogs() {
  const initialFilters = useMemo(() => getInitialFilters(), []);
  const [search, setSearch] = useState(initialFilters.search);
  const [status, setStatus] = useState<string>(initialFilters.status);
  const [jobType, setJobType] = useState(initialFilters.jobType);
  const [queueName, setQueueName] = useState(initialFilters.queueName);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    setPage(0);
  }, [search, status, jobType, queueName]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (jobType) params.set("jobType", jobType);
    if (queueName) params.set("queueName", queueName);

    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [search, status, jobType, queueName]);

  const { data, isLoading, isFetching, refetch } = trpc.logs.getLogs.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: status === "all" ? undefined : (status as "pending" | "processing" | "completed" | "failed"),
    jobType: jobType || undefined,
    queueName: queueName || undefined,
  });

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  const currentPage = page + 1;
  const hasContextFilters = Boolean(jobType || queueName);

  const handleExport = () => {
    if (!data?.logs?.length) return;
    const csv = [
      ["ID", "Job ID", "Fila", "Tipo", "Status", "Início", "Conclusão", "Erro"],
      ...data.logs.map((log: any) => [
        log.id,
        log.jobId,
        log.queueName,
        log.jobType,
        log.status,
        log.startedAt,
        log.completedAt,
        log.error,
      ]),
    ]
      .map((row) => row.map((cell) => JSON.stringify(cell ?? "")).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-execucao-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearContextFilters = () => {
    setJobType("");
    setQueueName("");
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Logs de execução</h2>
            <p className="text-slate-500">Rastreabilidade de jobs, filas e processos críticos do ambiente.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="secondary" onClick={handleExport} disabled={!data?.logs?.length}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {hasContextFilters ? (
          <Card className="border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-blue-900">Contexto aplicado a partir do painel Cron</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobType ? <Badge className="bg-white text-blue-800 hover:bg-white">jobType: {jobType}</Badge> : null}
                  {queueName ? <Badge className="bg-white text-blue-800 hover:bg-white">fila: {queueName}</Badge> : null}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearContextFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar contexto
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_repeat(3,minmax(0,0.6fr))]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por Job ID, fila ou tipo"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Input placeholder="Filtrar por job type" value={jobType} onChange={(e) => setJobType(e.target.value)} />
              <Input placeholder="Filtrar por fila" value={queueName} onChange={(e) => setQueueName(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Job ID</th>
                    <th className="px-4 py-3 text-left">Fila / Tipo</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Início</th>
                    <th className="px-4 py-3 text-left">Duração</th>
                    <th className="px-4 py-3 text-left">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Carregando logs...
                      </td>
                    </tr>
                  ) : data?.logs && data.logs.length > 0 ? (
                    data.logs.map((log: any) => {
                      const start = log.startedAt ? new Date(log.startedAt) : null;
                      const end = log.completedAt ? new Date(log.completedAt) : null;
                      const duration = start && end ? `${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s` : "-";
                      const statusClassName = statusBadgeMeta[log.status] || "bg-slate-100 text-slate-700 hover:bg-slate-100";

                      return (
                        <tr key={log.id} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.jobId}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{log.queueName}</div>
                            <div className="text-xs text-slate-500">{log.jobType}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusClassName}>{log.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {start ? start.toLocaleString("pt-BR") : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{duration}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {log.error ? (
                              <span className="line-clamp-2 inline-block max-w-[320px] text-red-700">{log.error}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Nenhum log encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500">
                Mostrando {data?.logs?.length || 0} de {total} logs • página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
