/**
 * Nexus Affil'IA'te · M8 · Admin Federation Dashboard
 *
 * Painel admin (Ravi) para gerenciar:
 *  - Nós Judge remotos (M7)
 *  - Tenants whitelabel (M8)
 *  - Avaliação SLA + promoções
 *
 * @module pages/AdminFederation
 * @author Niko Nexus · CEO/AI
 */
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Globe,
  Network,
  PlayCircle,
  Plus,
  Power,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Wifi,
  XCircle,
  Zap,
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

const TRUST_META: Record<string, { label: string; color: string }> = {
  sandbox: { label: "Sandbox", color: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  verified: { label: "Verified", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  elite: { label: "Elite", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
};

export default function AdminFederation() {
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<"remote" | "tenants">("remote");
  const [remoteDialogOpen, setRemoteDialogOpen] = useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);

  // Remote Judges (M7)
  const remoteListQuery = trpc.judgeFederation.remoteList.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const judgeStatusQuery = trpc.judgeFederation.status.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  // Tenants (M8)
  const tenantListQuery = trpc.multiTenant.list.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const tenantStatusQuery = trpc.multiTenant.status.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const evaluationsQuery = trpc.multiTenant.evaluateAll.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  // Mutations
  const remotePingMutation = trpc.judgeFederation.remotePing.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Ping OK ${data?.latencyMs}ms`, { description: data?.error ?? "voto válido recebido" });
    },
    onError: (e) => toast.error("Ping falhou", { description: e.message }),
  });
  const remoteSetActiveMutation = trpc.judgeFederation.remoteSetActive.useMutation({
    onSuccess: () => { toast.success("Status atualizado"); utils.judgeFederation.remoteList.invalidate(); },
  });
  const remoteRemoveMutation = trpc.judgeFederation.remoteRemove.useMutation({
    onSuccess: () => { toast.success("Nó removido"); utils.judgeFederation.remoteList.invalidate(); },
  });

  const tenantSetActiveMutation = trpc.multiTenant.setActive.useMutation({
    onSuccess: () => { toast.success("Tenant atualizado"); utils.multiTenant.list.invalidate(); },
  });
  const tenantPromoteMutation = trpc.multiTenant.promote.useMutation({
    onSuccess: (data: any) => { toast.success(`Promovido a ${data?.tenant?.trustLevel}`); utils.multiTenant.list.invalidate(); utils.multiTenant.evaluateAll.invalidate(); },
    onError: (e) => toast.error("Promoção falhou", { description: e.message }),
  });

  const judgeStatus = (judgeStatusQuery.data as any) ?? {};
  const tenantStatus = (tenantStatusQuery.data as any)?.stats ?? { total: 0, active: 0, byTrust: { sandbox: 0, verified: 0, elite: 0 } };
  const remoteNodes = ((remoteListQuery.data as any)?.nodes ?? []) as any[];
  const tenants = ((tenantListQuery.data as any)?.tenants ?? []) as any[];
  const evaluations = ((evaluationsQuery.data as any)?.evaluations ?? []) as any[];
  const eligibleCount = ((evaluationsQuery.data as any)?.eligibleForPromotion ?? 0) as number;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-2xl font-semibold">
              <Globe className="h-7 w-7 text-blue-500" />
              Federation Map
              <Badge variant="outline" className="ml-2 border-blue-500/40 text-blue-600 dark:text-blue-300">
                M7 · M8 LIVE
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Nós Judge remotos · Whitelabels · SLA & promoções automáticas
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setRemoteDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Nó Judge remoto
            </Button>
            <Button onClick={() => setTenantDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Tenant whitelabel
            </Button>
          </div>
        </div>

        {/* Stats unificadas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatCard icon={Network} label="Judges locais" value={judgeStatus?.nodeCount ?? 0} tone="violet" />
          <StatCard icon={Wifi} label="Judges remotos" value={judgeStatus?.remote?.total ?? 0} tone="blue" />
          <StatCard icon={Activity} label="Tenants total" value={tenantStatus.total} tone="slate" />
          <StatCard icon={CheckCircle2} label="Tenants ativos" value={tenantStatus.active} tone="emerald" />
          <StatCard icon={ShieldCheck} label="Elite" value={tenantStatus.byTrust.elite} tone="emerald" />
          <StatCard icon={Zap} label="Elegíveis promoção" value={eligibleCount} tone="amber" />
        </div>

        {/* Tabs simples */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("remote")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "remote" ? "border-blue-500 text-blue-600 dark:text-blue-300" : "border-transparent text-muted-foreground"}`}
          >
            Judges remotos ({remoteNodes.length})
          </button>
          <button
            onClick={() => setTab("tenants")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "tenants" ? "border-blue-500 text-blue-600 dark:text-blue-300" : "border-transparent text-muted-foreground"}`}
          >
            Tenants whitelabel ({tenants.length})
          </button>
        </div>

        {/* TAB · Judges remotos */}
        {tab === "remote" && (
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" />
                Nós Judge remotos (M7)
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => utils.judgeFederation.remoteList.invalidate()}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {remoteListQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : remoteNodes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum nó remoto registrado. Clique em <strong>"Nó Judge remoto"</strong> acima.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Trust</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remoteNodes.map((n: any) => {
                    const trustMeta = TRUST_META[n.trustLevel] ?? TRUST_META.sandbox;
                    return (
                      <TableRow key={n.nodeId}>
                        <TableCell className="font-mono text-xs">{n.nodeId}</TableCell>
                        <TableCell className="text-xs">{n.name}</TableCell>
                        <TableCell className="text-xs">{n.operator}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={n.endpoint}>{n.endpoint}</TableCell>
                        <TableCell><Badge variant="outline" className={trustMeta.color}>{trustMeta.label}</Badge></TableCell>
                        <TableCell>
                          {n.active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" title="Ping" onClick={() => remotePingMutation.mutate({ nodeId: n.nodeId })} disabled={remotePingMutation.isPending}>
                              <PlayCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Toggle ativo" onClick={() => remoteSetActiveMutation.mutate({ nodeId: n.nodeId, active: !n.active })}>
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Remover" onClick={() => { if (confirm(`Remover ${n.nodeId}?`)) remoteRemoveMutation.mutate({ nodeId: n.nodeId }); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {/* TAB · Tenants */}
        {tab === "tenants" && (
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                Tenants whitelabel (M8)
              </div>
              <Button size="sm" variant="ghost" onClick={() => { utils.multiTenant.list.invalidate(); utils.multiTenant.evaluateAll.invalidate(); }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {tenantListQuery.isLoading ? (
              <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : tenants.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum tenant registrado. Whitelabels podem se auto-registrar via <code>POST /api/trpc/multiTenant.register</code>.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Trust</TableHead>
                    <TableHead className="text-right">Pings ✓</TableHead>
                    <TableHead className="text-right">Votos ✓</TableHead>
                    <TableHead className="text-right">Lat. (ms)</TableHead>
                    <TableHead>Elegível</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t: any) => {
                    const trustMeta = TRUST_META[t.trustLevel] ?? TRUST_META.sandbox;
                    const evalResult = evaluations.find((e: any) => e.tenantId === t.tenantId);
                    const pingRate = t.totalPings > 0 ? (t.successfulPings / t.totalPings) * 100 : 0;
                    const voteRate = t.totalVotes > 0 ? (t.validVotes / t.totalVotes) * 100 : 0;
                    return (
                      <TableRow key={t.tenantId}>
                        <TableCell className="font-mono text-xs">{t.tenantId}</TableCell>
                        <TableCell className="text-xs">{t.name}</TableCell>
                        <TableCell><Badge variant="outline" className={trustMeta.color}>{trustMeta.label}</Badge></TableCell>
                        <TableCell className="text-right font-mono text-xs">{pingRate.toFixed(0)}% ({t.totalPings})</TableCell>
                        <TableCell className="text-right font-mono text-xs">{voteRate.toFixed(0)}% ({t.totalVotes})</TableCell>
                        <TableCell className="text-right font-mono text-xs">{t.avgLatencyMs?.toFixed(0) ?? 0}</TableCell>
                        <TableCell>
                          {evalResult?.promotionEligible ? (
                            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 gap-1">
                              <Zap className="h-3 w-3" /> → {evalResult.recommendedTrust}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground" title={(evalResult?.blockers ?? []).join(", ")}>
                              {(evalResult?.blockers?.length ?? 0)} blockers
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {evalResult?.promotionEligible && (
                              <Button size="sm" variant="outline" title={`Promover a ${evalResult.recommendedTrust}`}
                                onClick={() => tenantPromoteMutation.mutate({
                                  tenantId: t.tenantId,
                                  newTrust: evalResult.recommendedTrust,
                                  reason: `Auto-promoção via SLA: ${t.totalPings} pings, ${t.totalVotes} votos, latência ${t.avgLatencyMs?.toFixed(0)}ms`,
                                })}>
                                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" title="Toggle ativo" onClick={() => tenantSetActiveMutation.mutate({ tenantId: t.tenantId, active: !t.active })}>
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {/* Dialog: registrar nó remoto */}
        <RemoteNodeDialog
          open={remoteDialogOpen}
          onOpenChange={setRemoteDialogOpen}
          onCreated={() => { utils.judgeFederation.remoteList.invalidate(); utils.judgeFederation.status.invalidate(); }}
        />

        {/* Dialog: registrar tenant */}
        <TenantDialog
          open={tenantDialogOpen}
          onOpenChange={setTenantDialogOpen}
          onCreated={() => { utils.multiTenant.list.invalidate(); utils.multiTenant.status.invalidate(); }}
        />
      </div>
    </AdminDashboardLayout>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, tone }: any) {
  const toneClass = {
    slate: "text-slate-600 dark:text-slate-300",
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    blue: "text-blue-600 dark:text-blue-300",
    violet: "text-violet-600 dark:text-violet-300",
  }[tone as string];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}

function RemoteNodeDialog({ open, onOpenChange, onCreated }: any) {
  const [form, setForm] = useState({
    nodeId: "",
    name: "",
    operator: "",
    endpoint: "",
    publicKeyPem: "",
    trustLevel: "sandbox" as "sandbox" | "verified" | "elite",
    active: true,
  });
  const mutation = trpc.judgeFederation.remoteRegister.useMutation({
    onSuccess: () => { toast.success("Nó remoto registrado"); onCreated?.(); onOpenChange(false); setForm({ nodeId: "", name: "", operator: "", endpoint: "", publicKeyPem: "", trustLevel: "sandbox", active: true }); },
    onError: (e) => toast.error("Falha ao registrar", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wifi className="h-5 w-5 text-blue-500" /> Registrar nó Judge remoto</DialogTitle>
          <DialogDescription>Adiciona um nó externo à federação via A2A Protocol (ed25519).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Node ID</Label><Input value={form.nodeId} onChange={(e) => setForm({ ...form, nodeId: e.target.value })} placeholder="partner-judge-001" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Operator</Label><Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">Endpoint A2A</Label><Input value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="https://parceiro.com.br/api/a2a/invoke" /></div>
          <div>
            <Label className="text-xs">Public Key PEM (ed25519)</Label>
            <Textarea rows={4} value={form.publicKeyPem} onChange={(e) => setForm({ ...form, publicKeyPem: e.target.value })} placeholder="-----BEGIN PUBLIC KEY-----..." className="font-mono text-xs" />
          </div>
          <div>
            <Label className="text-xs">Trust level inicial</Label>
            <Select value={form.trustLevel} onValueChange={(v: any) => setForm({ ...form, trustLevel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TenantDialog({ open, onOpenChange, onCreated }: any) {
  const [form, setForm] = useState({
    tenantId: "",
    name: "",
    operator: "",
    contactEmail: "",
    endpoint: "",
    publicKeyPem: "",
  });
  const mutation = trpc.multiTenant.register.useMutation({
    onSuccess: () => { toast.success("Tenant registrado como sandbox"); onCreated?.(); onOpenChange(false); setForm({ tenantId: "", name: "", operator: "", contactEmail: "", endpoint: "", publicKeyPem: "" }); },
    onError: (e) => toast.error("Falha", { description: e.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-blue-500" /> Registrar tenant whitelabel</DialogTitle>
          <DialogDescription>Whitelabels começam como sandbox. Trust escala via SLA (7d → verified, 30d → elite).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Tenant ID</Label><Input value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} placeholder="tenant-acme" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Operator legal</Label><Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} /></div>
          </div>
          <div><Label className="text-xs">Email de contato</Label><Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
          <div><Label className="text-xs">Endpoint A2A</Label><Input value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="https://tenant.com.br/api/a2a/invoke" /></div>
          <div>
            <Label className="text-xs">Public Key PEM (ed25519)</Label>
            <Textarea rows={4} value={form.publicKeyPem} onChange={(e) => setForm({ ...form, publicKeyPem: e.target.value })} placeholder="-----BEGIN PUBLIC KEY-----..." className="font-mono text-xs" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? "Registrando..." : "Registrar como sandbox"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
