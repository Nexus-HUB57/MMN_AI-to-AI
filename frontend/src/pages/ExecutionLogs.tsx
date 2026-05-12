import React, { useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Logs de Execução</h2>
            <p className="text-slate-400">Rastreabilidade completa de jobs e processos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="secondary" onClick={handleExport} disabled={!data?.logs?.length}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por Job ID, Fila ou Tipo..."
                  className="pl-9 bg-slate-900 border-slate-700 text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="all">Todos os Status</SelectItem>
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
            <div className="rounded-md border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Job ID</th>
                    <th className="py-3 px-4 text-left">Fila / Tipo</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Início</th>
                    <th className="py-3 px-4 text-left">Duração</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Carregando logs...
                      </td>
                    </tr>
                  ) : data?.logs && data.logs.length > 0 ? (
                    data.logs.map((log: any) => {
                      const start = new Date(log.startedAt);
                      const end = log.completedAt ? new Date(log.completedAt) : null;
                      const duration = end ? ((end.getTime() - start.getTime()) / 1000).toFixed(2) + "s" : "-";

                      return (
                        <tr key={log.id} className="hover:bg-slate-700/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-slate-300">
                            {log.jobId}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{log.queueName}</div>
                            <div className="text-xs text-slate-500">{log.jobType}</div>
                          </td>
                          <td className="py-3 px-4">
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
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {start.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">{duration}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                              Detalhes
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Nenhum log encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-400">
                Mostrando {data?.logs?.length || 0} logs
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
