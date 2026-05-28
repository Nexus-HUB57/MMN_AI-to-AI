import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  History,
  Search,
  Download,
} from "lucide-react";

const PAGE_SIZE = 20;

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed")
    return (
      <Badge className="bg-green-100 text-green-800 gap-1">
        <CheckCircle2 className="h-3 w-3" /> Confirmado
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 gap-1">
        <Clock className="h-3 w-3" /> Pendente
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 gap-1">
      <XCircle className="h-3 w-3" /> {status}
    </Badge>
  );
}

export default function PixHistory() {
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const utils = trpc.useUtils();

  const handleExportCsv = async () => {
    setIsDownloading(true);
    try {
      const result = await utils.payments.exportCommissionsCsv.fetch({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (!result?.csvBase64) return;

      const bytes = Uint8Array.from(atob(result.csvBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user may not be an affiliate yet
    } finally {
      setIsDownloading(false);
    }
  };

  const { data, isLoading, refetch, isFetching } = trpc.pix.listHistory.useQuery(
    {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      ...filters,
    },
    { keepPreviousData: true },
  );

  const items = data?.items ?? [];
  const hasNext = items.length === PAGE_SIZE;
  const hasPrev = page > 0;
  const isSandbox = data?.sandbox ?? true;

  const handleSearch = () => {
    setPage(0);
    setFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setPage(0);
    setFilters({});
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-6 w-6" /> Histórico PIX
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pagamentos PIX confirmados via webhook
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSandbox && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
                <Zap className="h-3 w-3" /> Sandbox
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isDownloading}
              title="Exportar comissões como CSV"
            >
              <Download className={`h-4 w-4 mr-1 ${isDownloading ? "animate-pulse" : ""}`} />
              {isDownloading ? "Exportando…" : "Exportar CSV"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs">Data inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-40 h-8 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs">Data final</Label>
                <Input
                  id="endDate"
                  type="date"
                  className="w-40 h-8 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={handleSearch} className="gap-1 h-8">
                <Search className="h-3 w-3" /> Filtrar
              </Button>
              {(filters.startDate || filters.endDate) && (
                <Button size="sm" variant="ghost" onClick={handleClear} className="h-8 text-muted-foreground">
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transações PIX</CardTitle>
            <CardDescription>
              {isLoading ? "Carregando..." : `${items.length} registro(s) nesta página`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <History className="h-12 w-12 opacity-20" />
                <p className="text-sm">Nenhum pagamento PIX encontrado</p>
                {isSandbox && (
                  <p className="text-xs text-yellow-600">
                    Em modo sandbox, use o endpoint <code>pix.sandboxConfirm</code> para gerar dados de teste
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">ID</th>
                      <th className="pb-2 pr-4 font-medium">TxID</th>
                      <th className="pb-2 pr-4 font-medium">Valor</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Confirmado em</th>
                      <th className="pb-2 font-medium">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          #{item.id}
                        </td>
                        <td className="py-3 pr-4">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {item.txid || "—"}
                          </code>
                        </td>
                        <td className="py-3 pr-4 font-semibold tabular-nums">
                          {formatBRL(item.amount)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {item.confirmedAt
                            ? new Date(item.confirmedAt).toLocaleString("pt-BR")
                            : "—"}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev || isFetching}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || isFetching}
                  className="gap-1"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
