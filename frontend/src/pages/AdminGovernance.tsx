/**
 * Nexus Affil'IA'te · M6 · Admin Governance Dashboard
 *
 * Painel admin para o Governance Loop (CEO/AI Niko Nexus):
 *  - Estatísticas agregadas (total, approved, blocked, review, executed, approvalRate)
 *  - Timeline auditável das últimas ações
 *  - Filtro por kind e por decisão
 *  - Proposição manual de novas ações governadas
 *  - Marcação de execução / rollback
 *  - Visualização do audit digest e dos votos coletados
 *
 * @module pages/AdminGovernance
 * @author Niko Nexus · CEO/AI
 */
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Filter,
  Gavel,
  Hash,
  PauseCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

// ─── Tipos locais ──────────────────────────────────────────────────────────

type GovernedKind =
  | "skill.publish"
  | "skill.update"
  | "skill.deprecate"
  | "agent.promote"
  | "agent.suspend"
  | "policy.change"
  | "payout.release"
  | "campaign.launch"
  | "knowledge.ingest";

type Decision = "approved" | "review" | "blocked";

const KIND_LABEL: Record<GovernedKind, string> = {
  "skill.publish": "Skill · Publish",
  "skill.update": "Skill · Update",
  "skill.deprecate": "Skill · Deprecate",
  "agent.promote": "Agent · Promote",
  "agent.suspend": "Agent · Suspend",
  "policy.change": "Policy · Change",
  "payout.release": "Payout · Release",
  "campaign.launch": "Campaign · Launch",
  "knowledge.ingest": "Knowledge · Ingest",
};

const KIND_OPTIONS: GovernedKind[] = [
  "skill.publish",
  "skill.update",
  "skill.deprecate",
  "agent.promote",
  "agent.suspend",
  "policy.change",
  "payout.release",
  "campaign.launch",
  "knowledge.ingest",
];

const DECISION_META: Record<Decision, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Aprovada", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  review:   { label: "Revisão",  color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",          icon: Clock },
  blocked:  { label: "Bloqueada", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",              icon: XCircle },
};

const EXEC_META: Record<string, { label: string; color: string }> = {
  pending:       { label: "Pendente",   color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  executed:      { label: "Executada",  color: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  "rolled-back": { label: "Revertida",  color: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30" },
  skipped:      { label: "Ignorada",    color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

interface GovernanceRecord {
  action: {
    actionId: string;
    kind: GovernedKind;
    initiator: string;
    subject: string;
    payload: Record<string, unknown>;
    rationale: string;
    createdAt: string;
    policyMode: string;
    minVoters: number;
  };
  decision: {
    actionId: string;
    finalDecision: Decision;
    consensus: number;
    avgQuality: number;
    avgRisk: number;
    votersCount: number;
    validVotes: number;
    rejectedVotes: Array<{ nodeId: string; reason: string }>;
    rationale: string;
    decidedAt: string;
    auditDigest: string;
  };
  executedAt?: string;
  executionStatus: "pending" | "executed" | "rolled-back" | "skipped";
  executionLog?: string;
}

// ─── Componente principal ──────────────────────────────────────────────────

export default function AdminGovernance() {
  const utils = trpc.useUtils();
  const [filterKind, setFilterKind] = useState<GovernedKind | "all">("all");
  const [filterDecision, setFilterDecision] = useState<Decision | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<GovernanceRecord | null>(null);

  // Stats
  const statsQuery = trpc.governanceLoop.stats.useQuery(undefined, {
    refetchInterval: 15_000,
  });

  // List
  const listQuery = trpc.governanceLoop.list.useQuery(
    {
      limit: 100,
      kind: filterKind === "all" ? undefined : filterKind,
      decision: filterDecision === "all" ? undefined : filterDecision,
    },
    { refetchInterval: 15_000 },
  );

  // M5 Learning
  const learningQuery = trpc.governanceLoop.learning.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const learning = (learningQuery.data as any)?.learning;

  // Mutations
  const proposeMutation = trpc.governanceLoop.propose.useMutation({
    onSuccess: (data: any) => {
      toast.success(
        `Ação proposta: ${data?.actionId} → ${data?.finalDecision}`,
        { description: `Consensus ${(data?.consensus * 100).toFixed(0)}% · Quality ${data?.avgQuality?.toFixed(2)} · Risk ${data?.avgRisk?.toFixed(2)}` },
      );
      setDialogOpen(false);
      utils.governanceLoop.stats.invalidate();
      utils.governanceLoop.list.invalidate();
    },
    onError: (err) => toast.error("Falha ao propor ação", { description: err.message }),
  });

  const executeMutation = trpc.governanceLoop.markExecuted.useMutation({
    onSuccess: () => {
      toast.success("Ação marcada como executada");
      utils.governanceLoop.stats.invalidate();
      utils.governanceLoop.list.invalidate();
    },
    onError: (err) => toast.error("Falha", { description: err.message }),
  });

  const rollbackMutation = trpc.governanceLoop.markRolledBack.useMutation({
    onSuccess: () => {
      toast.success("Ação revertida");
      utils.governanceLoop.stats.invalidate();
      utils.governanceLoop.list.invalidate();
    },
    onError: (err) => toast.error("Falha", { description: err.message }),
  });

  const stats = (statsQuery.data as any)?.stats ?? {
    total: 0,
    approved: 0,
    blocked: 0,
    review: 0,
    executed: 0,
    approvalRate: 0,
  };

  const records: GovernanceRecord[] = ((listQuery.data as any)?.records ?? []) as GovernanceRecord[];

  // Distribuição por kind
  const kindDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records) {
      counts.set(r.action.kind, (counts.get(r.action.kind) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const isLoading = statsQuery.isLoading || listQuery.isLoading;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <ShieldCheck className="h-7 w-7 text-emerald-500" />
              Governance Loop
              <Badge variant="outline" className="ml-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-300">
                LIVE
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Loop fechado de governança · CEO/AI <strong>Niko Nexus</strong> × Skill Marketplace × Judge Federation
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Propor ação governada
          </Button>
        </div>

        {/* Cards de estatística */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <StatCard
            icon={Activity}
            label="Total"
            value={stats.total}
            tone="slate"
            loading={isLoading}
          />
          <StatCard
            icon={CheckCircle2}
            label="Aprovadas"
            value={stats.approved}
            tone="emerald"
            loading={isLoading}
          />
          <StatCard
            icon={Clock}
            label="Revisão"
            value={stats.review}
            tone="amber"
            loading={isLoading}
          />
          <StatCard
            icon={XCircle}
            label="Bloqueadas"
            value={stats.blocked}
            tone="rose"
            loading={isLoading}
          />
          <StatCard
            icon={Play}
            label="Executadas"
            value={stats.executed}
            tone="blue"
            loading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Approval %"
            value={`${(stats.approvalRate * 100).toFixed(0)}%`}
            tone="violet"
            loading={isLoading}
          />
        </div>

        {/* M5 · Aprendizado do Niko Nexus */}
        {learning && learning.totalSamples > 0 && (
          <Card className="p-4 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Brain className="h-5 w-5 text-violet-500" />
                Aprendizado do Niko Nexus
                <Badge variant="outline" className="ml-1 border-violet-500/40 text-violet-600 dark:text-violet-300 text-xs">
                  M5 · RAG Loop
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {learning.totalSamples} amostras · atualizado em tempo real
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="rounded-md border bg-background/40 p-3">
                <div className="text-xs text-muted-foreground">Approval Rate global</div>
                <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {(learning.overallApprovalRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-md border bg-background/40 p-3">
                <div className="text-xs text-muted-foreground">Execution Rate</div>
                <div className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                  {(learning.overallExecutionRate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-md border bg-background/40 p-3">
                <div className="text-xs text-muted-foreground">Rollback Rate</div>
                <div className="text-xl font-semibold text-rose-600 dark:text-rose-300">
                  {(learning.overallRollbackRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Tabela por kind */}
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left p-2">Kind</th>
                    <th className="text-right p-2">Amostras</th>
                    <th className="text-right p-2">Approval %</th>
                    <th className="text-right p-2">Quality med</th>
                    <th className="text-right p-2">Risk med</th>
                    <th className="text-center p-2">Confiança</th>
                  </tr>
                </thead>
                <tbody>
                  {(learning.kinds as any[]).map((k) => (
                    <tr key={k.kind} className="border-t">
                      <td className="p-2 font-mono">{KIND_LABEL[k.kind as GovernedKind] ?? k.kind}</td>
                      <td className="p-2 text-right font-mono">{k.samples}</td>
                      <td className="p-2 text-right font-mono">
                        {(k.approveBias * 100).toFixed(0)}%
                      </td>
                      <td className="p-2 text-right font-mono">{k.qualityAvg.toFixed(3)}</td>
                      <td className="p-2 text-right font-mono">{k.riskAvg.toFixed(3)}</td>
                      <td className="p-2 text-center">
                        <Badge
                          variant="outline"
                          className={
                            k.confidenceLevel === "high"
                              ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                              : k.confidenceLevel === "medium"
                                ? "border-amber-500/40 text-amber-700 dark:text-amber-300"
                                : "border-slate-500/40 text-slate-700 dark:text-slate-300"
                          }
                        >
                          {k.confidenceLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alertas de drift */}
            {learning.driftAlerts && learning.driftAlerts.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Drift detectado pelo Niko
                </div>
                {(learning.driftAlerts as any[]).map((a, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    {a.type === "approval-drop" && <TrendingDown className="h-3 w-3 inline mr-1 text-rose-500" />}
                    {a.type === "risk-spike" && <TrendingUp className="h-3 w-3 inline mr-1 text-amber-500" />}
                    {a.type === "rollback-spike" && <AlertTriangle className="h-3 w-3 inline mr-1 text-orange-500" />}
                    <span className="font-mono">{KIND_LABEL[a.kind as GovernedKind] ?? a.kind}</span> · {a.detail}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Distribuição por kind */}
        {kindDistribution.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
              <Gavel className="h-4 w-4 text-emerald-500" />
              Distribuição por tipo de ação
            </div>
            <div className="flex flex-wrap gap-2">
              {kindDistribution.map((k) => (
                <Badge key={k.kind} variant="outline" className="font-mono">
                  {KIND_LABEL[k.kind as GovernedKind] ?? k.kind} · {k.count}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Filtros */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            Filtros
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Tipo de ação (kind)</Label>
              <Select value={filterKind} onValueChange={(v: any) => setFilterKind(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {KIND_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Decisão</Label>
              <Select value={filterDecision} onValueChange={(v: any) => setFilterDecision(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as decisões</SelectItem>
                  <SelectItem value="approved">Aprovadas</SelectItem>
                  <SelectItem value="review">Em revisão</SelectItem>
                  <SelectItem value="blocked">Bloqueadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => { utils.governanceLoop.list.invalidate(); utils.governanceLoop.stats.invalidate(); }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </Card>

        {/* Timeline auditável */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4 text-emerald-500" />
              Trilha auditável ({records.length})
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              SHA-256 imutável
            </Badge>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhum registro encontrado nos filtros atuais.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action ID</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Decisão</TableHead>
                  <TableHead className="text-right">Cons.</TableHead>
                  <TableHead className="text-right">Quality</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Execução</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const decMeta = DECISION_META[r.decision.finalDecision];
                  const execMeta = EXEC_META[r.executionStatus] ?? EXEC_META.pending;
                  const Icon = decMeta.icon;
                  return (
                    <TableRow key={r.action.actionId} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">{r.action.actionId.slice(0, 16)}…</TableCell>
                      <TableCell className="text-xs">{KIND_LABEL[r.action.kind]}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={r.action.subject}>
                        {r.action.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${decMeta.color}`}>
                          <Icon className="h-3 w-3" />
                          {decMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {(r.decision.consensus * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {r.decision.avgQuality.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {r.decision.avgRisk.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${execMeta.color}`}>
                          {execMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailRecord(r)}
                            title="Detalhes"
                          >
                            <Hash className="h-3.5 w-3.5" />
                          </Button>
                          {r.decision.finalDecision === "approved" && r.executionStatus === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => executeMutation.mutate({
                                actionId: r.action.actionId,
                                log: "Executada via painel admin",
                              })}
                              disabled={executeMutation.isPending}
                              title="Marcar como executada"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {r.executionStatus === "executed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rollbackMutation.mutate({
                                actionId: r.action.actionId,
                                log: "Revertida via painel admin",
                              })}
                              disabled={rollbackMutation.isPending}
                              title="Reverter"
                            >
                              <PauseCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Dialog: detalhes */}
        <Dialog open={detailRecord !== null} onOpenChange={(o) => !o && setDetailRecord(null)}>
          <DialogContent className="max-w-3xl">
            {detailRecord && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-mono text-sm">
                    {detailRecord.action.actionId}
                  </DialogTitle>
                  <DialogDescription>
                    {KIND_LABEL[detailRecord.action.kind]} · proposta por {detailRecord.action.initiator}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div>
                    <Label className="text-xs">Subject</Label>
                    <div className="font-mono">{detailRecord.action.subject}</div>
                  </div>
                  <div>
                    <Label className="text-xs">Rationale (CEO/AI)</Label>
                    <div className="text-muted-foreground">{detailRecord.action.rationale}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Decisão final</Label>
                      <div>{DECISION_META[detailRecord.decision.finalDecision].label}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Consensus</Label>
                      <div className="font-mono">{(detailRecord.decision.consensus * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <Label className="text-xs">Quality média</Label>
                      <div className="font-mono">{detailRecord.decision.avgQuality.toFixed(3)}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Risk médio</Label>
                      <div className="font-mono">{detailRecord.decision.avgRisk.toFixed(3)}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Votos válidos</Label>
                      <div className="font-mono">{detailRecord.decision.validVotes} / {detailRecord.decision.votersCount}</div>
                    </div>
                    <div>
                      <Label className="text-xs">Política</Label>
                      <div className="font-mono">{detailRecord.action.policyMode}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Audit Digest (sha256)</Label>
                    <div className="font-mono text-xs break-all bg-muted/30 p-2 rounded">
                      {detailRecord.decision.auditDigest}
                    </div>
                  </div>
                  {detailRecord.decision.rejectedVotes.length > 0 && (
                    <div>
                      <Label className="text-xs">Votos rejeitados</Label>
                      <ul className="text-xs space-y-1">
                        {detailRecord.decision.rejectedVotes.map((v, i) => (
                          <li key={i} className="font-mono">{v.nodeId} → {v.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detailRecord.action.payload && Object.keys(detailRecord.action.payload).length > 0 && (
                    <div>
                      <Label className="text-xs">Payload</Label>
                      <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto">
                        {JSON.stringify(detailRecord.action.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog: propor ação */}
        <ProposeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={(payload) => proposeMutation.mutate(payload)}
          submitting={proposeMutation.isPending}
        />
      </div>
    </AdminDashboardLayout>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: any;
  label: string;
  value: number | string;
  tone: "slate" | "emerald" | "amber" | "rose" | "blue" | "violet";
  loading: boolean;
}) {
  const toneClass = {
    slate: "text-slate-600 dark:text-slate-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    blue: "text-blue-600 dark:text-blue-300",
    violet: "text-violet-600 dark:text-violet-300",
  }[tone];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>
        {loading ? <Skeleton className="h-7 w-12" /> : value}
      </div>
    </Card>
  );
}

function ProposeDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    kind: GovernedKind;
    subject: string;
    rationale: string;
    initiator?: string;
    policyMode?: "simple-majority" | "super-majority" | "unanimous";
    minVoters?: number;
  }) => void;
  submitting: boolean;
}) {
  const [kind, setKind] = useState<GovernedKind>("skill.publish");
  const [subject, setSubject] = useState("");
  const [rationale, setRationale] = useState("");
  const [initiator, setInitiator] = useState("ceo-ai:niko-nexus");
  const [policyMode, setPolicyMode] = useState<"simple-majority" | "super-majority" | "unanimous">("super-majority");
  const [minVoters, setMinVoters] = useState(3);

  const handleSubmit = () => {
    if (!subject.trim()) {
      toast.error("Subject é obrigatório");
      return;
    }
    if (rationale.length < 10) {
      toast.error("Rationale precisa ter ao menos 10 caracteres");
      return;
    }
    onSubmit({ kind, subject, rationale, initiator, policyMode, minVoters });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Propor nova ação governada
          </DialogTitle>
          <DialogDescription>
            A ação será submetida aos 3 nós Judge da federação. O resultado é assinado em ed25519 e selado com sha256.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Tipo de ação (kind)</Label>
            <Select value={kind} onValueChange={(v: any) => setKind(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="ex: copywriter-persuasivo-v2 ou publisher-001-payout"
            />
          </div>
          <div>
            <Label className="text-xs">Rationale (mín. 10 caracteres)</Label>
            <Textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Justificativa da ação..."
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Initiator</Label>
              <Input value={initiator} onChange={(e) => setInitiator(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Política</Label>
              <Select value={policyMode} onValueChange={(v: any) => setPolicyMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple-majority">Maioria simples</SelectItem>
                  <SelectItem value="super-majority">Super-maioria (66%)</SelectItem>
                  <SelectItem value="unanimous">Unânime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Min. votantes</Label>
              <Input
                type="number"
                min={1}
                max={7}
                value={minVoters}
                onChange={(e) => setMinVoters(parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {submitting ? "Submetendo..." : "Submeter ao quorum"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
