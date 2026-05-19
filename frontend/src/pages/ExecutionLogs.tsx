import React, { useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function ExecutionLogs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, refetch } = trpc.logs.getLogs.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: status === "all" ? undefined : (status as any),
  });

  const handleExport = () => {
    if (!data?.logs) return;
    const csv = [
      ["ID", "Job ID", "Fila", "Tipo", "Status", "Início", "Conclusão"],
      ...data.logs.map((log: any) => [
        log.id,
        log.jobId,
        log.queueName,
        log.jobType,
        log.status,
        log.startedAt,
        log.completedAt,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-execucao-${new Date().toISOString()}.csv`;
    a.click();
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
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="secondary" onClick={handleExport} disabled={!data?.logs?.length}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por Job ID, fila ou tipo"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
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
                    <th className="px-4 py-3 text-right">Ações</th>
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
                      const start = new Date(log.startedAt);
                      const end = log.completedAt ? new Date(log.completedAt) : null;
                      const duration = end ? `${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s` : "-";

                      return (
                        <tr key={log.id} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.jobId}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{log.queueName}</div>
                            <div className="text-xs text-slate-500">{log.jobType}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                log.status === "completed"
                                  ? "default"
                                  : log.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="capitalize"
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {start.toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{duration}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              Detalhes
                            </Button>
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

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">Mostrando {data?.logs?.length || 0} logs</div>
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
                  disabled={!data?.logs || data.logs.length < limit}
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
