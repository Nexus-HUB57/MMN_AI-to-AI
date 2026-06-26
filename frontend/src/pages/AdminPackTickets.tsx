import { useEffect, useState } from "react";
import AdminDashboardLayout from "./AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Mail } from "lucide-react";

type Ticket = {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  pack_slug: string;
  pack_name: string;
  amount_cents: number;
  status: string;
  payment_method: string;
  created_at: string;
  admin_notes?: string | null;
};

function fmtBRL(c: number) {
  return `R$ ${(c / 100).toFixed(2).replace(".", ",")}`;
}

export default function AdminPackTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/pack-tickets?status=${statusFilter}`, { credentials: "include" });
      const j = await r.json();
      setTickets(j.tickets || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function approve(t: Ticket) {
    if (!confirm(`Aprovar e ativar Pack "${t.pack_name}" para ${t.user_email}?`)) return;
    setProcessingId(t.id);
    try {
      const r = await fetch(`/api/admin/pack-tickets/${t.id}/approve`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Aprovado via painel admin" }),
      });
      const j = await r.json();
      if (!j.ok) alert(j.error || "Falha"); else load();
    } finally { setProcessingId(null); }
  }

  async function reject(t: Ticket) {
    const reason = prompt(`Motivo da rejeição (Pack "${t.pack_name}"):`) || "";
    if (!reason) return;
    setProcessingId(t.id);
    try {
      const r = await fetch(`/api/admin/pack-tickets/${t.id}/reject`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const j = await r.json();
      if (!j.ok) alert(j.error || "Falha"); else load();
    } finally { setProcessingId(null); }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🎟️ Tickets de Pack A²</h1>
          <div className="flex gap-2">
            {(["pending","approved","rejected"] as const).map(s => (
              <Button key={s} variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s)}>
                {s === "pending" ? "Pendentes" : s === "approved" ? "Aprovados" : "Rejeitados"}
              </Button>
            ))}
            <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">Carregando tickets...</div>
        ) : tickets.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-slate-400">Nenhum ticket {statusFilter}.</CardContent></Card>
        ) : tickets.map(t => (
          <Card key={t.id} className="border border-white/10 bg-slate-950/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-white text-base">
                  Ticket #{t.id} · {t.pack_name}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <Badge className={
                t.status === "pending" ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                t.status === "approved" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                "bg-red-500/15 text-red-300 border-red-500/30"
              }>{t.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Usuário:</div><div className="text-white">{t.user_name || "—"} (ID {t.user_id})</div>
                <div className="text-slate-400">Email:</div><div className="text-white flex items-center gap-1"><Mail className="h-3 w-3" /> {t.user_email}</div>
                <div className="text-slate-400">Pack slug:</div><div className="text-white">{t.pack_slug}</div>
                <div className="text-slate-400">Valor:</div><div className="text-white font-bold">{fmtBRL(t.amount_cents)}</div>
                <div className="text-slate-400">Método:</div><div className="text-white">{t.payment_method || "—"}</div>
                {t.admin_notes && (<><div className="text-slate-400">Notas:</div><div className="text-slate-300">{t.admin_notes}</div></>)}
              </div>
              {t.status === "pending" && (
                <div className="flex gap-2 pt-3">
                  <Button disabled={processingId === t.id} onClick={() => approve(t)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar & Ativar Pack
                  </Button>
                  <Button disabled={processingId === t.id} onClick={() => reject(t)}
                    variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                    <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminDashboardLayout>
  );
}
