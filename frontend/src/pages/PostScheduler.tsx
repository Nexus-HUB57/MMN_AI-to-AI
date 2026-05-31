import { useState } from 'react';
import { Agent, ScheduledPost } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostSchedulerProps {
  agent: Agent;
}

export default function PostScheduler({ agent }: PostSchedulerProps) {
  const [formData, setFormData] = useState({
    content: '',
    platform: 'instagram' as const,
    scheduledAt: '',
    imageUrl: '',
  });

  const { data: posts = [], refetch } = trpc.agents.getScheduledPosts.useQuery(undefined, {
    enabled: !!agent,
  });

  const createMutation = trpc.agents.createScheduledPost.useMutation();
  const updateMutation = trpc.agents.updateScheduledPost.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim() || !formData.scheduledAt) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createMutation.mutateAsync({
        content: formData.content,
        platform: formData.platform,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        imageUrl: formData.imageUrl || undefined,
      });

      setFormData({
        content: '',
        platform: 'instagram',
        scheduledAt: '',
        imageUrl: '',
      });

      await refetch();
      toast.success('Postagem agendada com sucesso');
    } catch (error) {
      toast.error('Erro ao agendar postagem');
    }
  };

  const handleStatusChange = async (post: ScheduledPost, newStatus: 'agendado' | 'publicado' | 'falhou') => {
    try {
      await updateMutation.mutateAsync({
        postId: String(post.id),
        status: newStatus,
      });
      await refetch();
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'publicado':
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'falhou':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-100 text-green-800',
      instagram: 'bg-pink-100 text-pink-800',
      facebook: 'bg-blue-100 text-blue-800',
      twitter: 'bg-sky-100 text-sky-800',
      linkedin: 'bg-indigo-100 text-indigo-800',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agendar Nova Postagem</CardTitle>
          <CardDescription>Configure e agende uma postagem para suas plataformas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content */}
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Digite o conteúdo da postagem..."
                rows={4}
                className="mt-1 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Platform */}
              <div>
                <Label>Plataforma</Label>
                <Select value={formData.platform} onValueChange={(value: any) => setFormData(prev => ({ ...prev, platform: value }))}>
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

              {/* Scheduled Date/Time */}
              <div>
                <Label htmlFor="scheduledAt">Data e Hora</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
                className="mt-1"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Agendar Postagem
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Postagens Agendadas</CardTitle>
          <CardDescription>Gerenciar suas postagens agendadas</CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma postagem agendada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPlatformColor(post.platform)}>
                          {post.platform}
                        </Badge>
                        {getStatusBadge(post.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      {format(new Date(post.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                    {post.status === 'agendado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(post, 'publicado')}
                        >
                          Publicar Agora
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
