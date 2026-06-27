import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/pages/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { getAcademiaTier } from "@/lib/nexus-academia";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Clock,
  ExternalLink,
  Lock,
  Users,
  Video,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Mic2,
  Star,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { format, isAfter, isBefore, addMinutes, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const PLATFORM_ICON: Record<string, string> = {
  google_meet: "🎥",
  zoom: "📹",
  teams: "💼",
  whereby: "🌐",
  outro: "🔗",
};

const PLATFORM_LABEL: Record<string, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  teams: "Microsoft Teams",
  whereby: "Whereby",
  outro: "Link externo",
};

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  scheduled: {
    label: "Agendada",
    color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    icon: <Calendar className="w-3 h-3" />,
  },
  ongoing: {
    label: "Em andamento",
    color: "bg-green-500/15 text-green-300 border-green-500/30",
    icon: <PlayCircle className="w-3 h-3" />,
  },
  completed: {
    label: "Concluída",
    color: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-500/15 text-red-300 border-red-500/30",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const TIER_LABEL: Record<string, string> = {
  all: "Todos os níveis",
  iniciante: "Iniciante+",
  operador: "Operador+",
  estrategista: "Estrategista+",
  elite: "Elite",
};

const TIER_ORDER: Record<string, number> = {
  all: 0,
  iniciante: 1,
  operador: 2,
  estrategista: 3,
  elite: 4,
};

function userMeetsTier(userTier: string, required: string): boolean {
  if (required === "all") return true;
  return (TIER_ORDER[userTier] ?? 0) >= (TIER_ORDER[required] ?? 99);
}

// ──────────────────────────────────────────────
// MeetingCard
// ──────────────────────────────────────────────

interface MeetingCardProps {
  meeting: any;
  userId: string;
  userName: string;
  userEmail?: string;
  userTier: string;
  onRefresh: () => void;
}

function MeetingCard({
  meeting,
  userId,
  userName,
  userEmail,
  userTier,
  onRefresh,
}: MeetingCardProps) {
  const [, navigate] = useLocation();
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const joinMutation = trpc.meetings.join.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.meetingLink
          ? "Inscrição confirmada! Clique em 'Entrar na reunião' quando chegar a hora."
          : "Inscrição confirmada! O link será disponibilizado em breve.",
      );
      onRefresh();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao se inscrever na reunião.");
    },
  });

  const leaveMutation = trpc.meetings.leave.useMutation({
    onSuccess: () => {
      toast.success("Inscrição cancelada com sucesso.");
      onRefresh();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao cancelar inscrição.");
    },
  });

  const isParticipant = meeting.participants?.some(
    (p: any) => p.userId === userId,
  );
  const canAccess = userMeetsTier(userTier, meeting.requiredTier);
  const scheduledDate = parseISO(meeting.scheduledAt);
  const endDate = addMinutes(scheduledDate, meeting.durationMinutes);
  const now = new Date();
  const isOngoing = isAfter(now, scheduledDate) && isBefore(now, endDate);
  const isPast = isAfter(now, endDate);
  const isFull = meeting.spotsLeft <= 0 && !isParticipant;
  const status = isOngoing ? "ongoing" : isPast && meeting.status !== "cancelled" ? "completed" : meeting.status;
  const meta = STATUS_META[status] ?? STATUS_META.scheduled;

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinMutation.mutateAsync({
        meetingId: meeting.id,
        name: userName,
        email: userEmail,
        userTier,
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveMutation.mutateAsync({ meetingId: meeting.id });
    } finally {
      setLeaving(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-quantum-cyan/30">
      {/* Status strip */}
      <div className={`absolute inset-x-0 top-0 h-1 ${
        status === "ongoing" ? "bg-green-500" :
        status === "cancelled" ? "bg-red-500/60" :
        status === "completed" ? "bg-slate-500" :
        "bg-cyan-500"
      }`} />

      <div className="flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${meta.color}`}>
                {meta.icon}
                {meta.label}
              </span>
              {isParticipant && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-green-300">
                  <CheckCircle2 className="w-3 h-3" /> Inscrito
                </span>
              )}
              {meeting.requiredTier !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                  <Star className="w-3 h-3" /> {TIER_LABEL[meeting.requiredTier]}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white leading-tight line-clamp-2">{meeting.title}</h3>
          </div>
          {!canAccess && (
            <div className="flex-shrink-0 rounded-lg bg-red-500/10 p-2">
              <Lock className="w-4 h-4 text-red-400" />
            </div>
          )}
        </div>

        {/* Description */}
        {meeting.description && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{meeting.description}</p>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-2.5 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{format(scheduledDate, "dd MMM yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>{format(scheduledDate, "HH:mm")} · {meeting.durationMinutes}min</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mic2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="truncate">{meeting.mentorName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>
              {meeting.participantCount}/{meeting.maxParticipants} vagas
              {isFull && !isParticipant && (
                <span className="ml-1 text-red-400 font-semibold">· Lotado</span>
              )}
              {!isFull && !isParticipant && (
                <span className="ml-1 text-green-400">&nbsp;({meeting.spotsLeft} restantes)</span>
              )}
            </span>
          </div>
        </div>

        {/* Platform */}
        <div className="flex items-center gap-2">
          <span className="text-base">{PLATFORM_ICON[meeting.platform] ?? "🔗"}</span>
          <span className="text-xs text-slate-500">{PLATFORM_LABEL[meeting.platform] ?? meeting.platform}</span>
        </div>

        {/* Agenda */}
        {meeting.agenda?.length > 0 && (
          <div className="rounded-xl bg-slate-700/40 border border-slate-600/30 p-3 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Agenda</p>
            {meeting.agenda.slice(0, 3).map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">·</span>
                <span>{item}</span>
              </div>
            ))}
            {meeting.agenda.length > 3 && (
              <p className="text-xs text-slate-500">+{meeting.agenda.length - 3} itens</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {!canAccess ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 w-full">
              <AlertCircle className="w-4 h-4" />
              <span>Requer nível {TIER_LABEL[meeting.requiredTier]} — <button className="underline" onClick={() => navigate("/packs")}>Upgrade</button></span>
            </div>
          ) : status === "cancelled" ? (
            <div className="w-full text-center text-sm text-slate-500 py-2">Reunião cancelada</div>
          ) : isPast && !isOngoing ? (
            <>
              {meeting.recordingUrl ? (
                <a href={meeting.recordingUrl} target="_blank" rel="noreferrer" className="flex-1">
                  <Button size="sm" className="w-full gap-2 bg-slate-700 hover:bg-slate-600 text-white">
                    <PlayCircle className="w-4 h-4" />
                    Ver gravação
                  </Button>
                </a>
              ) : (
                <div className="w-full text-center text-sm text-slate-500 py-2">Reunião encerrada</div>
              )}
            </>
          ) : (
            <>
              {isParticipant ? (
                <>
                  {meeting.meetingLink && (isOngoing || isAfter(scheduledDate, addMinutes(now, -15))) && (
                    <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="flex-1">
                      <Button size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-500 text-white">
                        <Video className="w-4 h-4" />
                        {isOngoing ? "Entrar agora" : "Entrar na reunião"}
                      </Button>
                    </a>
                  )}
                  {!isOngoing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
                      disabled={leaving}
                      onClick={handleLeave}
                    >
                      <XCircle className="w-4 h-4" />
                      {leaving ? "Cancelando..." : "Cancelar inscrição"}
                    </Button>
                  )}
                </>
              ) : isFull ? (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 w-full">
                  <Users className="w-4 h-4" />
                  <span>Vagas esgotadas</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
                  disabled={joining}
                  onClick={handleJoin}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {joining ? "Inscrevendo..." : "Inscrever-se"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

type FilterStatus = "all" | "scheduled" | "ongoing" | "completed";

export default function MeetingHub() {
  const { user } = useAuth();
  const { profile } = useMarketplaceProfile();
  const tier = getAcademiaTier(profile);
  const userId = user?.id ?? "guest";
  const userName = user?.name ?? "Afiliado";
  const userEmail = user?.email ?? undefined;

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const query = trpc.meetings.list.useQuery(
    filterStatus === "all"
      ? {}
      : filterStatus === "scheduled"
      ? { onlyUpcoming: true }
      : { status: filterStatus as any },
    { refetchInterval: 60_000 },
  );

  const meetings = useMemo(() => query.data?.meetings ?? [], [query.data]);

  const stats = useMemo(() => ({
    total: query.data?.total ?? 0,
    upcoming: meetings.filter((m: any) => m.status === "scheduled").length,
    inscribed: meetings.filter((m: any) =>
      m.participants?.some((p: any) => p.userId === userId),
    ).length,
  }), [meetings, userId]);

  const FILTER_TABS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "scheduled", label: "Próximas" },
    { key: "ongoing", label: "Em andamento" },
    { key: "completed", label: "Concluídas" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-900 border border-white/10 p-6 md:p-8">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
                <Video className="w-3 h-3" /> Nexus Meetings
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-purple-400">
                <BookOpen className="w-3 h-3" /> Mentoring Live
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Sessões de Mentoria
            </h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">
              Encontros ao vivo com mentores Nexus. Grupos de até <strong className="text-white">20 participantes</strong>, trilhas por nível e acesso ao link de reunião diretamente neste painel.
            </p>

            {/* Stats row */}
            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { label: "Reuniões disponíveis", value: stats.total, color: "text-cyan-400" },
                { label: "Próximas agendadas", value: stats.upcoming, color: "text-green-400" },
                { label: "Suas inscrições", value: stats.inscribed, color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center min-w-[120px]">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters + Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filterStatus === tab.key
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                    : "border border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-white/10 text-slate-400 hover:text-white"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${query.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Meeting Grid */}
        {query.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-800/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-cyan-500/10 p-5 mb-4">
              <Calendar className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma reunião encontrada
            </h3>
            <p className="text-slate-400 max-w-sm">
              Novas sessões de mentoria são criadas pelos administradores. Fique de olho neste painel!
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {meetings.map((meeting: any) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                userId={String(userId)}
                userName={userName}
                userEmail={userEmail}
                userTier={tier.id}
                onRefresh={() => query.refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
