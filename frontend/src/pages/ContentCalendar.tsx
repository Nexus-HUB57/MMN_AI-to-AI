import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Clock,
  Filter,
  Loader2
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'month' | 'week';

interface ScheduledPost {
  id: string;
  content: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  scheduledAt: Date;
  status: 'agendado' | 'publicado' | 'falhou' | 'pendente';
  imageUrl?: string;
  createdAt: Date;
}

interface CalendarPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: Date;
  status: string;
  imageUrl?: string;
}

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    content: '',
    platform: 'instagram' as const,
    scheduledAt: '',
    scheduledTime: '09:00',
    imageUrl: '',
  });


  // ============================================================
  // NEXUS PLATFORM EVENTS — Calendario de Eventos da Plataforma
  // ============================================================
  const NEXUS_EVENTS = [
    {
      id: "evt-001",
      title: "Abertura Janela de Saque — Agosto/26",
      description: "Periodo oficial para solicitacao de saques de comissoes do mes de agosto",
      date: "2026-08-10",
      time: "00:00",
      type: "milestone" as const,
      platform: "internal",
      status: "agendado",
    },
    {
      id: "evt-002",
      title: "Live Q&A — Perguntas dos Afiliados",
      description: "Sessao de perguntas e respostas ao vivo com a equipe Nexus sobre a plataforma",
      date: "2026-08-18",
      time: "20:00",
      type: "qa" as const,
      platform: "instagram",
      status: "agendado",
    },
    {
      id: "evt-003",
      title: "Webinar: Plano de Carreira — Bonus e Comissoes",
      description: "Explicacao detalhada dos 9 tipos de bonus, tiers de progressao e motor de comissoes",
      date: "2026-08-22",
      time: "20:00",
      type: "webinar" as const,
      platform: "zoom",
      status: "agendado",
    },
    {
      id: "evt-004",
      title: "Treinamento: Como vender packs OnePack",
      description: "Treinamento pratico para afiliados venderem os 14 packs da plataforma",
      date: "2026-08-27",
      time: "19:30",
      type: "training" as const,
      platform: "youtube",
      status: "agendado",
    },
    {
      id: "evt-005",
      title: "Fechamento Ciclo Comissoes — Agosto",
      description: "Encerramento e consolidacao das comissoes do mes de agosto",
      date: "2026-09-05",
      time: "23:59",
      type: "milestone" as const,
      platform: "internal",
      status: "agendado",
    },
    {
      id: "evt-006",
      title: "Abertura Ciclo Comissoes — Setembro",
      description: "Inicio do novo ciclo de comissoes e bonus do mes de setembro",
      date: "2026-09-06",
      time: "00:00",
      type: "milestone" as const,
      platform: "internal",
      status: "agendado",
    },
    {
      id: "evt-007",
      title: "Encontro de Lideres da Rede N.O.",
      description: "Reuniao mensal de alinhamento para lideres de rede qualificados",
      date: "2026-09-08",
      time: "18:00",
      type: "meeting" as const,
      platform: "zoom",
      status: "agendado",
    },
    {
      id: "evt-008",
      title: "Workshop: Academia IA — Criacao de Conteudo",
      description: "Workshop sobre como usar a Academia IA para gerar conteudo de vendas",
      date: "2026-09-15",
      time: "19:00",
      type: "workshop" as const,
      platform: "youtube",
      status: "agendado",
    },
    {
      id: "evt-009",
      title: "Hackathon Nexus AI — Construa seu Agente",
      description: "Competicao para criar agentes de IA especializados para a rede",
      date: "2026-09-20",
      time: "09:00",
      type: "hackathon" as const,
      platform: "discord",
      status: "agendado",
    },
    {
      id: "evt-010",
      title: "Abertura Janela de Saque — Setembro/26",
      description: "Periodo oficial para solicitacao de saques consolidados de setembro",
      date: "2026-10-05",
      time: "00:00",
      type: "milestone" as const,
      platform: "internal",
      status: "agendado",
    },
    {
      id: "evt-011",
      title: "Lancamento Bônus #5 Inspiracao",
      description: "Ativacao do quinto tipo de bonus — bonus por referencias de alto impacto",
      date: "2026-10-10",
      time: "12:00",
      type: "launch" as const,
      platform: "internal",
      status: "agendado",
    },
    {
      id: "evt-012",
      title: "Convencao Nexus Anual 2026",
      description: "Evento anual de reconhecimento e lancamento de novos recursos da plataforma",
      date: "2026-10-15",
      time: "10:00",
      type: "convention" as const,
      platform: "youtube",
      status: "agendado",
    },
    {
      id: "evt-013",
      title: "Webinar: Novidades Q4/2026",
      description: "Novidades do ultimo trimestre: bonus Grafo, melhorias no Lab Nexus e roadmap",
      date: "2026-10-22",
      time: "20:00",
      type: "webinar" as const,
      platform: "zoom",
      status: "agendado",
    },
    {
      id: "evt-014",
      title: "Fechamento Ciclo Comissoes — Setembro",
      description: "Encerramento e consolidacao final das comissoes do trimestre",
      date: "2026-10-31",
      time: "23:59",
      type: "milestone" as const,
      platform: "internal",
      status: "agendado",
    },
  ]

  const EVENT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
    launch: { label: "Lancamento", color: "text-purple-700", bg: "bg-purple-100 border-purple-300" },
    webinar: { label: "Webinar", color: "text-blue-700", bg: "bg-blue-100 border-blue-300" },
    training: { label: "Treinamento", color: "text-green-700", bg: "bg-green-100 border-green-300" },
    meeting: { label: "Reuniao", color: "text-amber-700", bg: "bg-amber-100 border-amber-300" },
    milestone: { label: "Marco", color: "text-cyan-700", bg: "bg-cyan-100 border-cyan-300" },
    workshop: { label: "Workshop", color: "text-rose-700", bg: "bg-rose-100 border-rose-300" },
    hackathon: { label: "Hackathon", color: "text-indigo-700", bg: "bg-indigo-100 border-indigo-300" },
    convention: { label: "Convencao", color: "text-violet-700", bg: "bg-violet-100 border-violet-300" },
    qa: { label: "Q&A", color: "text-pink-700", bg: "bg-pink-100 border-pink-300" },
  };

  // Fetch posts from social router
  const { data: allPosts = [], refetch } = trpc.social.getContentCalendar.useQuery({});

  // Create post mutation
  const createMutation = trpc.social.scheduleContent.useMutation({
    onSuccess: () => {
      toast.success('Postagem agendada com sucesso!');
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao agendar: ${error.message}`);
    },
  });

  // Delete post mutation
  const deleteMutation = trpc.social.deleteContent.useMutation({
    onSuccess: () => {
      toast.success('Postagem removida!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      content: '',
      platform: 'instagram',
      scheduledAt: '',
      scheduledTime: '09:00',
      imageUrl: '',
    });
  };

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar data
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return allPosts.filter((post: any) => {
      const postDate = new Date(post.scheduledAt);
      return isSameDay(postDate, day);
    });
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post: any) => {
      if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false;
      if (filterStatus !== 'all' && post.status !== filterStatus) return false;
      return true;
    });
  }, [allPosts, filterPlatform, filterStatus]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('Por favor, insira o conteúdo do post');
      return;
    }

    if (!formData.scheduledAt) {
      toast.error('Por favor, selecione a data');
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`);

    try {
      await createMutation.mutateAsync({
        content: formData.content,
        platform: formData.platform,
        scheduledAt: scheduledDateTime,
        imageUrl: formData.imageUrl || undefined,
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Delete handler
  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;

    try {
      await deleteMutation.mutateAsync({ id: postId });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Platform colors
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-500',
      instagram: 'bg-pink-500',
      facebook: 'bg-blue-500',
      twitter: 'bg-sky-500',
      linkedin: 'bg-indigo-500',
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string) => {
    return platform.charAt(0).toUpperCase();
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Agendado</Badge>;
      case 'publicado':
        return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Publicado</Badge>;
      case 'falhou':
        return <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">Falhou</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendário de Posts</h1>
            <p className="text-slate-600 mt-1">Eventos da plataforma, postagens agendadas e marcos do ecossistema</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Agendar Nova Postagem</DialogTitle>
                <DialogDescription>
                  Crie e agende conteúdo para suas plataformas sociais
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Content */}
                <div>
                  <Label htmlFor="content">Conteúdo do Post</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo da sua postagem..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Platform */}
                <div>
                  <Label>Plataforma</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledAt">Data</Label>
                    <Input
                      id="scheduledAt"
                      type="date"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledTime">Horário</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="mt-1"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Agendar Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filtros:</span>
              </div>

              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="falhou">Falhou</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-slate-600">
                {filteredPosts.length} postagem{filteredPosts.length !== 1 ? 'ns' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Hoje
                </Button>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                {viewMode === 'month'
                  ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                  : `Semana de ${format(weekDays[0], 'dd/MM')} - ${format(weekDays[6], 'dd/MM/yyyy')}`
                }
              </h2>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>


        {/* Nexus Platform Events */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <CalendarIcon className="w-5 h-5" />
              Calendario de Eventos Nexus Affil'IA
            </CardTitle>
            <CardDescription className="text-purple-700">
              Eventos oficiais, lancamentos, treinamentos e marcos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEXUS_EVENTS
                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .map((event) => {
                  const evtType = EVENT_TYPES[event.type] || EVENT_TYPES.meeting;
                  const eventDate = new Date(`${event.date}T${event.time}`);
                  const isPast = eventDate < new Date();
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-4 transition-all hover:shadow-lg ${evtType.bg} ${isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className={evtType.bg + ' ' + evtType.color}>
                          {evtType.label}
                        </Badge>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {event.platform}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{event.title}</h3>
                      <p className="text-xs text-slate-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {format(eventDate, "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {viewMode === 'week' ? (
          /* Week View */
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`py-3 text-center border-r last:border-r-0 ${
                      isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-600">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${
                      isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((day) => {
                  const dayPosts = getPostsForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-r last:border-r-0 p-2 ${
                        isSameDay(day, new Date()) ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        {dayPosts.map((post: any) => (
                          <div
                            key={post.id}
                            className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow ${getPlatformColor(post.platform)} text-white`}
                            onClick={() => {
                              setSelectedPost(post);
                              setIsDialogOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                {getPlatformIcon(post.platform)}
                              </span>
                              <span className="text-[10px] opacity-75">
                                {format(new Date(post.scheduledAt), 'HH:mm')}
                              </span>
                            </div>
                            <p className="truncate font-medium">{post.content}</p>
                          </div>
                        ))}
                        {dayPosts.length === 0 && (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                            Sem posts
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Month View */
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b bg-slate-50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-semibold text-slate-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dayPosts = getPostsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[100px] border-b border-r p-2 ${
                        !isCurrentMonth ? 'bg-slate-100' : ''
                      } ${isToday ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        !isCurrentMonth ? 'text-slate-400' : isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 3).map((post: any) => (
                          <div
                            key={post.id}
                            className={`text-[10px] p-1 rounded truncate text-white ${getPlatformColor(post.platform)}`}
                            title={post.content}
                          >
                            {format(new Date(post.scheduledAt), 'HH:mm')} {post.content.substring(0, 20)}...
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            +{dayPosts.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Posts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximas Postagens
            </CardTitle>
            <CardDescription>Suas próximas postagens agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPosts.filter((p: any) => new Date(p.scheduledAt) >= new Date()).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma postagem agendada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts
                  .filter((p: any) => new Date(p.scheduledAt) >= new Date())
                  .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                  .slice(0, 10)
                  .map((post: any) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className={`w-12 h-12 rounded-lg ${getPlatformColor(post.platform)} flex items-center justify-center text-white font-bold text-lg`}>
                        {getPlatformIcon(post.platform)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{post.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">
                            {format(new Date(post.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          {getStatusBadge(post.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(post.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}