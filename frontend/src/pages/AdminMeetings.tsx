import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Mic2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

// ──────────────────────────────────────────────
// Types & constants
// ──────────────────────────────────────────────

type MeetingStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
type MeetingTier = "all" | "iniciante" | "operador" | "estrategista" | "elite";
type Platform = "google_meet" | "zoom" | "teams" | "whereby" | "outro";

const STATUS_META: Record<MeetingStatus, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "bg-cyan-100 text-cyan-800" },
  ongoing: { label: "Em andamento", color: "bg-green-100 text-green-800" },
  completed: { label: "Concluída", color: "bg-slate-100 text-slate-700" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

const TIER_OPTIONS: { value: MeetingTier; label: string }[] = [
  { value: "all", label: "Todos os níveis" },
  { value: "iniciante", label: "Iniciante+" },
  { value: "operador", label: "Operador+" },
  { value: "estrategista", label: "Estrategista+" },
  { value: "elite", label: "Elite" },
];

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "whereby", label: "Whereby" },
  { value: "outro", label: "Outro" },
];

const STATUS_OPTIONS: { value: MeetingStatus; label: string }[] = [
  { value: "scheduled", label: "Agendada" },
  { value: "ongoing", label: "Em andamento" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

const emptyForm = {
  title: "",
  description: "",
  mentorName: "",
  scheduledAt: "",
  durationMinutes: "60",
  maxParticipants: "20",
  meetingLink: "",
  platform: "google_meet" as Platform,
  agendaRaw: "",
  tagsRaw: "",
  requiredTier: "all" as MeetingTier,
  notes: "",
  isPublished: true,
};

type FormState = typeof emptyForm;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = parseISO(iso);
  // Format: YYYY-MM-DDTHH:mm
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function fromDatetimeLocal(local: string): string {
  if (!local) return "";
  return new Date(local).toISOString();
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function AdminMeetings() {
  const [statusFilter, setStatusFilter] = useState<"all" | MeetingStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState<any | null>(null);

  // Queries
  const listQuery = trpc.meetings.listAdmin.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter },
    { refetchInterval: 30_000 },
  );
  const statsQuery = trpc.meetings.stats.useQuery();

  // Mutations
  const createMutation = trpc.meetings.create.useMutation({
    onSuccess: () => {
      toast.success("Reunião criada com sucesso!");
      listQuery.refetch();
      statsQuery.refetch();
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message || "Erro ao criar reunião"),
  });

  const updateMutation = trpc.meetings.update.useMutation({
    onSuccess: () => {
      toast.success("Reunião atualizada!");
      listQuery.refetch();
      statsQuery.refetch();
      setDialogOpen(false);
    },
    onError: (e) => toast.error(e.message || "Erro ao atualizar reunião"),
  });

  const deleteMutation = trpc.meetings.delete.useMutation({
    onSuccess: () => {
      toast.success("Reunião removida.");
      listQuery.refetch();
      statsQuery.refetch();
      setDeletingId(null);
    },
    onError: (e) => toast.error(e.message || "Erro ao remover reunião"),
  });

  const attendanceMutation = trpc.meetings.markAttendance.useMutation({
    onSuccess: () => {
      toast.success("Presença atualizada.");
      listQuery.refetch();
    },
    onError: (e) => toast.error(e.message || "Erro ao marcar presença"),
  });

  // Sync form when editing meeting changes
  useEffect(() => {
    if (!editingMeeting) {
      setFormData(emptyForm);
      return;
    }
    setFormData({
      title: editingMeeting.title ?? "",
      description: editingMeeting.description ?? "",
      mentorName: editingMeeting.mentorName ?? "",
      scheduledAt: toDatetimeLocal(editingMeeting.scheduledAt),
      durationMinutes: String(editingMeeting.durationMinutes ?? 60),
      maxParticipants: String(editingMeeting.maxParticipants ?? 20),
      meetingLink: editingMeeting.meetingLink ?? "",
      platform: editingMeeting.platform ?? "google_meet",
      agendaRaw: (editingMeeting.agenda ?? []).join("\n"),
      tagsRaw: (editingMeeting.tags ?? []).join(", "),
      requiredTier: editingMeeting.requiredTier ?? "all",
      notes: editingMeeting.notes ?? "",
      isPublished: editingMeeting.isPublished ?? true,
    });
  }, [editingMeeting]);

  const meetings = useMemo(() => listQuery.data?.meetings ?? [], [listQuery.data]);

  // ── Handlers ──

  const openCreate = () => {
    setEditingMeeting(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (meeting: any) => {
    setEditingMeeting(meeting);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const agenda = formData.agendaRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = formData.tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const scheduledAt = fromDatetimeLocal(formData.scheduledAt);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      mentorName: formData.mentorName.trim(),
      scheduledAt,
      durationMinutes: Number(formData.durationMinutes),
      maxParticipants: Number(formData.maxParticipants),
      meetingLink: formData.meetingLink.trim() || undefined,
      platform: formData.platform,
      agenda,
      tags,
      requiredTier: formData.requiredTier,
      notes: formData.notes.trim() || undefined,
      isPublished: formData.isPublished,
    };

    if (editingMeeting) {
      updateMutation.mutate({ id: editingMeeting.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleStatusChange = (meetingId: string, status: MeetingStatus) => {
    updateMutation.mutate({ id: meetingId, status });
  };

  const handleAttendance = (meetingId: string, userId: string, attended: boolean) => {
    attendanceMutation.mutate({ meetingId, userId, attended });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─────────────────────────────────────────────────────────────
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meetings · Mentoring</h1>
            <p className="mt-1 text-slate-500">
              Gerenciar sessões de mentoria ao vivo — máximo de 20 participantes por reunião.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { listQuery.refetch(); statsQuery.refetch(); }}
            >
              <RefreshCw size={16} className="mr-2" />
              Atualizar
            </Button>
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus size={16} /> Nova Reunião
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: statsQuery.data?.total ?? 0, color: "text-slate-900" },
            { label: "Agendadas", value: statsQuery.data?.scheduled ?? 0, color: "text-cyan-700" },
            { label: "Concluídas", value: statsQuery.data?.completed ?? 0, color: "text-green-700" },
            { label: "Canceladas", value: statsQuery.data?.cancelled ?? 0, color: "text-red-600" },
            { label: "Total inscritos", value: statsQuery.data?.totalParticipants ?? 0, color: "text-purple-700" },
          ].map((s) => (
            <Card key={s.label} className="bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {([
            { key: "all", label: "Todas" },
            { key: "scheduled", label: "Agendadas" },
            { key: "ongoing", label: "Em andamento" },
            { key: "completed", label: "Concluídas" },
            { key: "cancelled", label: "Canceladas" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                statusFilter === f.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <Card className="bg-white shadow-sm overflow-hidden">
          {listQuery.isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse bg-slate-50" />
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhuma reunião encontrada</p>
              <Button size="sm" className="mt-4 gap-2" onClick={openCreate}>
                <Plus size={14} /> Criar primeira reunião
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    {["Reunião", "Data/Hora", "Mentor", "Vagas", "Nível", "Status", "Ações"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {meetings.map((meeting: any) => {
                    const meta = STATUS_META[meeting.status as MeetingStatus] ?? STATUS_META.scheduled;
                    const scheduledDate = parseISO(meeting.scheduledAt);
                    return (
                      <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{meeting.title}</p>
                          {meeting.description && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{meeting.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            {format(scheduledDate, "dd/MM/yy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            {format(scheduledDate, "HH:mm")} · {meeting.durationMinutes}min
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mic2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{meeting.mentorName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Users className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className={meeting.isFull ? "text-red-600 font-semibold" : ""}>
                              {meeting.participantCount}/{meeting.maxParticipants}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700">
                            {meeting.requiredTier === "all" ? "Todos" : meeting.requiredTier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={meeting.status}
                            onValueChange={(v) => handleStatusChange(meeting.id, v as MeetingStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 gap-1"
                              onClick={() => openEdit(meeting)}
                            >
                              <Edit3 size={12} /> Editar
                            </Button>
                            {meeting.participants?.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                                onClick={() => {
                                  setAttendanceMeeting(meeting);
                                  setAttendanceOpen(true);
                                }}
                              >
                                <Users size={12} /> Presença
                              </Button>
                            )}
                            {meeting.meetingLink && (
                              <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="h-7 px-2">
                                  <ExternalLink size={12} />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
                              disabled={deleteMutation.isPending && deletingId === meeting.id}
                              onClick={() => {
                                setDeletingId(meeting.id);
                                deleteMutation.mutate({ id: meeting.id });
                              }}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Create/Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeeting ? "Editar Reunião" : "Nova Sessão de Mentoria"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Mentoria Estratégica — Tráfego Pago para Afiliados"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Sobre o que será essa sessão..."
                rows={3}
              />
            </div>

            {/* Mentor + Date row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nome do mentor *</Label>
                <Input
                  value={formData.mentorName}
                  onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                  placeholder="Ex: Lucas Thomaz"
                />
              </div>
              <div>
                <Label>Data e horário *</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              </div>
            </div>

            {/* Duration + Max participants */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Duração (minutos)</Label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                />
              </div>
              <div>
                <Label>Máximo de participantes (1–20)</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
            </div>

            {/* Platform + Tier */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Plataforma</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
                >
                  <SelectTrigger><SelectValue placeholder="Plataforma" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível mínimo</Label>
                <Select
                  value={formData.requiredTier}
                  onValueChange={(v) => setFormData({ ...formData, requiredTier: v as MeetingTier })}
                >
                  <SelectTrigger><SelectValue placeholder="Nível" /></SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meeting link */}
            <div>
              <Label>Link da reunião</Label>
              <Input
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
              />
            </div>

            {/* Agenda */}
            <div>
              <Label>Agenda (uma linha por item)</Label>
              <Textarea
                value={formData.agendaRaw}
                onChange={(e) => setFormData({ ...formData, agendaRaw: e.target.value })}
                placeholder={"Abertura e apresentações\nConteúdo principal\nPerguntas e respostas\nEncerramento"}
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tagsRaw}
                onChange={(e) => setFormData({ ...formData, tagsRaw: e.target.value })}
                placeholder="tráfego, copy, instagram, estratégia"
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Notas internas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações para a equipe admin..."
                rows={2}
              />
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3">
              <input
                id="isPublished"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
                Publicado (visível para afiliados)
              </label>
            </div>

            {/* Save */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.mentorName || !formData.scheduledAt}>
                {isSaving ? "Salvando..." : editingMeeting ? "Salvar alterações" : "Criar reunião"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Attendance Dialog ── */}
      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={18} />
              Presença — {attendanceMeeting?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {attendanceMeeting?.participants?.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                Nenhum participante inscrito ainda.
              </p>
            ) : (
              (attendanceMeeting?.participants ?? []).map((p: any, idx: number) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-400 w-5">{idx + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                      {p.email && <p className="text-xs text-slate-400 truncate">{p.email}</p>}
                    </div>
                  </div>
                  <button
                    className={`ml-4 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      p.attended
                        ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                        : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                    }`}
                    onClick={() =>
                      handleAttendance(attendanceMeeting.id, p.userId, !p.attended)
                    }
                  >
                    {p.attended ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Presente</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Ausente</>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}
