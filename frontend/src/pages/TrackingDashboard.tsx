import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Link2,
  Plus,
  Copy,
  ExternalLink,
  MousePointer,
  Eye,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Search,
  Trash2,
  Edit,
  Share2,
  QrCode
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrackingLink {
  id: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  platform: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  createdAt: Date;
  lastClickedAt?: Date;
  isActive: boolean;
}

interface ConversionEvent {
  id: string;
  trackingLinkId: string;
  linkName: string;
  eventType: string;
  value: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export default function TrackingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    originalUrl: '',
    platform: 'instagram',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
  });

  // Fetch tracking links
  const { data: trackingLinks = [], refetch: refetchLinks } = trpc.social.getTrackingLinks.useQuery({});

  // Fetch conversion events
  const { data: conversionEvents = [], refetch: refetchEvents } = trpc.social.getConversionEvents.useQuery({});

  // Fetch performance metrics
  const { data: performanceMetrics } = trpc.social.getPerformanceMetrics.useQuery();

  // Create tracking link mutation
  const createMutation = trpc.social.createTrackingLink.useMutation({
    onSuccess: () => {
      toast.success('Link de rastreamento criado com sucesso!');
      setIsCreateDialogOpen(false);
      resetForm();
      refetchLinks();
    },
    onError: (error) => {
      toast.error(`Erro ao criar link: ${error.message}`);
    },
  });

  // Delete tracking link mutation
  const deleteMutation = trpc.social.deleteTrackingLink.useMutation({
    onSuccess: () => {
      toast.success('Link removido!');
      refetchLinks();
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  // Record conversion mutation
  const recordConversionMutation = trpc.social.recordConversion.useMutation({
    onSuccess: () => {
      toast.success('Conversão registrada!');
      refetchEvents();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      originalUrl: '',
      platform: 'instagram',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    });
  };

  // Generate short code
  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  // Build tracking URL
  const buildTrackingUrl = (link: typeof formData) => {
    const baseUrl = `https://mmn-ai-to-ai.com/track/${generateShortCode()}`;
    const params = new URLSearchParams();

    if (link.utmSource) params.append('utm_source', link.utmSource);
    if (link.utmMedium) params.append('utm_medium', link.utmMedium);
    if (link.utmCampaign) params.append('utm_campaign', link.utmCampaign);

    return `${baseUrl}?${params.toString()}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.originalUrl.trim()) {
      toast.error('Por favor, preencha o nome e URL de destino');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        originalUrl: formData.originalUrl,
        platform: formData.platform,
        utmSource: formData.utmSource || undefined,
        utmMedium: formData.utmMedium || undefined,
        utmCampaign: formData.utmCampaign || undefined,
      });
    } catch (error) {
      console.error('Error creating tracking link:', error);
    }
  };

  // Delete handler
  const handleDelete = async (linkId: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;

    try {
      await deleteMutation.mutateAsync({ id: linkId });
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  // Filter links
  const filteredLinks = useMemo(() => {
    return trackingLinks.filter((link: any) => {
      if (filterPlatform !== 'all' && link.platform !== filterPlatform) return false;
      if (searchQuery && !link.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [trackingLinks, filterPlatform, searchQuery]);

  // Platform colors
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-500',
      instagram: 'bg-pink-500',
      facebook: 'bg-blue-500',
      twitter: 'bg-sky-500',
      linkedin: 'bg-indigo-500',
      google: 'bg-red-500',
      email: 'bg-purple-500',
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string) => {
    return platform.charAt(0).toUpperCase();
  };

  // Calculate totals
  const totals = useMemo(() => {
    return trackingLinks.reduce((acc: any, link: any) => {
      acc.clicks += link.clicks || 0;
      acc.uniqueClicks += link.uniqueClicks || 0;
      acc.conversions += link.conversions || 0;
      acc.revenue += link.totalRevenue || 0;
      return acc;
    }, { clicks: 0, uniqueClicks: 0, conversions: 0, revenue: 0 });
  }, [trackingLinks]);

  // Calculate conversion rate
  const overallConversionRate = totals.clicks > 0
    ? ((totals.conversions / totals.clicks) * 100).toFixed(2)
    : '0.00';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tracking Neural</h1>
            <p className="text-slate-600 mt-1">Acompanhe seus links, cliques e conversões em tempo real</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Criar Link de Rastreamento</DialogTitle>
                <DialogDescription>
                  Crie links rastreáveis com UTM parameters para medir o desempenho
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Nome do Link</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Post Instagram Banner 01"
                    className="mt-1"
                  />
                </div>

                {/* Original URL */}
                <div>
                  <Label htmlFor="originalUrl">URL de Destino</Label>
                  <Input
                    id="originalUrl"
                    type="url"
                    value={formData.originalUrl}
                    onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                    placeholder="https://seusite.com/produto"
                    className="mt-1"
                  />
                </div>

                {/* Platform */}
                <div>
                  <Label>Plataforma de Origem</Label>
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
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* UTM Parameters */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="utmSource">UTM Source</Label>
                    <Input
                      id="utmSource"
                      value={formData.utmSource}
                      onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                      placeholder="instagram"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="utmMedium">UTM Medium</Label>
                    <Input
                      id="utmMedium"
                      value={formData.utmMedium}
                      onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                      placeholder="banner"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="utmCampaign">UTM Campaign</Label>
                    <Input
                      id="utmCampaign"
                      value={formData.utmCampaign}
                      onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                      placeholder="verao2024"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Preview */}
                {formData.originalUrl && (
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Preview do link:</p>
                    <p className="text-sm font-mono break-all">
                      {buildTrackingUrl(formData)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Criar Link
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MousePointer className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Cliques</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.clicks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Cliques Únicos</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.uniqueClicks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Conversões</p>
                  <p className="text-2xl font-bold text-slate-900">{totals.conversions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Receita</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="conversions">Conversões</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Performing Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Links com Melhor Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum link criado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...filteredLinks]
                      .sort((a: any, b: any) => (b.clicks || 0) - (a.clicks || 0))
                      .slice(0, 5)
                      .map((link: any) => (
                        <div key={link.id} className="flex items-center gap-4 p-4 rounded-lg border bg-white">
                          <div className={`w-12 h-12 rounded-lg ${getPlatformColor(link.platform)} flex items-center justify-center text-white font-bold text-lg`}>
                            {getPlatformIcon(link.platform)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{link.name}</p>
                            <p className="text-sm text-slate-500 truncate">{link.originalUrl}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-2xl font-bold text-slate-900">{link.clicks || 0}</p>
                              <p className="text-xs text-slate-500">Cliques</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-900">{link.conversions || 0}</p>
                              <p className="text-xs text-slate-500">Conversões</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {link.conversionRate?.toFixed(1) || '0.0'}%
                              </p>
                              <p className="text-xs text-slate-500">Taxa</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Conversions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Conversões Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversionEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversão registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversionEvents.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border bg-white">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{event.eventType}</p>
                          <p className="text-sm text-slate-500">
                            Link: {event.linkName} • {format(new Date(event.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(event.value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
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
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar links..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="ml-auto text-sm text-slate-600">
                    {filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Links List */}
            <Card>
              <CardContent className="p-0">
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum link encontrado</p>
                    <Button
                      variant="link"
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="mt-2"
                    >
                      Criar primeiro link
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLinks.map((link: any) => (
                      <div key={link.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg ${getPlatformColor(link.platform)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                            {getPlatformIcon(link.platform)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{link.name}</h3>
                              {link.isActive ? (
                                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
                                  Inativo
                                </Badge>
                              )}
                            </div>

                            <div className="mt-2 p-3 bg-slate-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <code className="text-sm font-mono break-all">
                                  {`https://mmn-ai-to-ai.com/track/${link.shortCode}`}
                                </code>
                                <div className="flex gap-1 shrink-0 ml-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(`https://mmn-ai-to-ai.com/track/${link.shortCode}`)}
                                    className="gap-1"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                  >
                                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* UTM Info */}
                            {(link.utmSource || link.utmMedium || link.utmCampaign) && (
                              <div className="flex gap-2 mt-2">
                                {link.utmSource && (
                                  <Badge variant="secondary">source: {link.utmSource}</Badge>
                                )}
                                {link.utmMedium && (
                                  <Badge variant="secondary">medium: {link.utmMedium}</Badge>
                                )}
                                {link.utmCampaign && (
                                  <Badge variant="secondary">campaign: {link.utmCampaign}</Badge>
                                )}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mt-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{link.clicks || 0}</p>
                                <p className="text-xs text-slate-600">Cliques</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{link.uniqueClicks || 0}</p>
                                <p className="text-xs text-slate-600">Únicos</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{link.conversions || 0}</p>
                                <p className="text-xs text-slate-600">Conversões</p>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">
                                  R$ {(link.totalRevenue / 100).toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-600">Receita</p>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-3">
                              Criado em {format(new Date(link.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {link.lastClickedAt && (
                                <span> • Último clique em {format(new Date(link.lastClickedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                              )}
                            </p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(link.id)}
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversions Tab */}
          <TabsContent value="conversions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Conversões</CardTitle>
                <CardDescription>Histórico completo de conversões registradas</CardDescription>
              </CardHeader>
              <CardContent>
                {conversionEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversão registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversionEvents.map((event: any) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg border bg-white">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{event.eventType}</p>
                          <p className="text-sm text-slate-500">
                            Link: {event.linkName} • {format(new Date(event.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(event.value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            {performanceMetrics && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conversão Geral</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-slate-900">{overallConversionRate}%</p>
                      <Progress value={parseFloat(overallConversionRate)} className="mt-4" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Valor por Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-4xl font-bold text-slate-900">
                        {formatCurrency(totals.conversions > 0 ? totals.revenue / totals.conversions : 0)}
                      </p>
                      <p className="text-sm text-slate-500 mt-2">média por conversão</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Conversion by Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Conversões por Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin'].map((platform) => {
                    const platformLinks = trackingLinks.filter((l: any) => l.platform === platform);
                    const platformClicks = platformLinks.reduce((sum: number, l: any) => sum + (l.clicks || 0), 0);
                    const platformConversions = platformLinks.reduce((sum: number, l: any) => sum + (l.conversions || 0), 0);
                    const percentage = totals.clicks > 0 ? (platformClicks / totals.clicks) * 100 : 0;

                    return (
                      <div key={platform} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${getPlatformColor(platform)} flex items-center justify-center text-white font-bold`}>
                          {getPlatformIcon(platform)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{platform}</span>
                            <span className="text-sm text-slate-500">{platformClicks} cliques</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}