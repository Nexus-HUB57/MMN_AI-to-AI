/**
 * PostSchedulerAdvanced - Agendador avançado de posts
 * Sprint 4: IA Content Hub Avançado
 * 
 * Features:
 * - Agendamento de posts para múltiplas plataformas
 * - Integração com sistema de filas BullMQ
 * - Visualização de posts agendados
 * - Edição e cancelamento de posts
 * - Análise de melhor horário para publicação
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Send,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Share2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  createdAt: Date;
  mediaUrls?: string[];
  engagement?: number;
  views?: number;
}

interface FormData {
  title: string;
  content: string;
  platforms: string[];
  date: string;
  time: string;
}

const PLATFORMS = ["Instagram", "TikTok", "Twitter", "LinkedIn", "Facebook", "WhatsApp"];

const BEST_TIMES = [
  { time: "10:00", label: "10:00 AM - Manhã" },
  { time: "14:00", label: "14:00 (2:00 PM) - Tarde" },
  { time: "18:00", label: "18:00 (6:00 PM) - Noite" },
  { time: "20:00", label: "20:00 (8:00 PM) - Noite Tardia" },
];

export default function PostSchedulerAdvanced() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    platforms: [],
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
  });

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleAddPost = async () => {
    if (!formData.title.trim() || !formData.content.trim() || formData.platforms.length === 0) {
      toast.error("Preencha todos os campos e selecione pelo menos uma plataforma");
      return;
    }

    setIsScheduling(true);
    try {
      // Simular chamada ao backend
      // TODO: Substituir por chamada real ao backend
      // const response = await trpc.aiContentHub.schedulePost.mutate({...});

      const newPost: ScheduledPost = {
        id: `post_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        scheduledFor: `${formData.date} ${formData.time}`,
        status: "scheduled",
        createdAt: new Date(),
      };

      setPosts([newPost, ...posts]);
      setFormData({
        title: "",
        content: "",
        platforms: [],
        date: new Date().toISOString().split("T")[0],
        time: "14:00",
      });
      setShowNewPost(false);
      toast.success("Post agendado com sucesso!");
    } catch (error) {
      console.error("Erro ao agendar post:", error);
      toast.error("Erro ao agendar post");
    } finally {
      setIsScheduling(false);
    }
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success("Post removido");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900 text-blue-200 border-blue-700";
      case "published":
        return "bg-green-900 text-green-200 border-green-700";
      case "failed":
        return "bg-red-900 text-red-200 border-red-700";
      case "cancelled":
        return "bg-gray-900 text-gray-200 border-gray-700";
      default:
        return "bg-slate-700 text-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "published":
        return "Publicado";
      case "failed":
        return "Falha";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "published":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Posts Agendados</p>
                <p className="text-2xl font-bold text-white">
                  {posts.filter((p) => p.status === "scheduled").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Publicados</p>
                <p className="text-2xl font-bold text-white">
                  {posts.filter((p) => p.status === "published").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{posts.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão para novo post */}
      {!showNewPost && (
        <Button
          onClick={() => setShowNewPost(true)}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Post
        </Button>
      )}

      {/* Formulário de novo post */}
      {showNewPost && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Agendar Novo Post</CardTitle>
            <CardDescription className="text-slate-400">
              Crie e agende um novo post para suas plataformas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
              <Input
                placeholder="Título do post"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 text-white border-slate-600 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Conteúdo</label>
              <Textarea
                placeholder="Escreva seu conteúdo aqui..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-700 text-white border-slate-600 placeholder-gray-500 min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plataformas</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      formData.platforms.includes(platform)
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-700 text-white border-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hora</label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {BEST_TIMES.map((t) => (
                      <SelectItem key={t.time} value={t.time}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddPost}
                disabled={isScheduling}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isScheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Agendar Post
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowNewPost(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de posts agendados */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Posts Agendados</CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie seus posts agendados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum post agendado</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{post.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1">{getStatusLabel(post.status)}</span>
                      </Badge>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.scheduledFor}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        className="bg-slate-600 text-gray-300 text-xs"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  {post.status === "published" && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-600 rounded p-2">
                        <p className="text-gray-400">Visualizações</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </p>
                      </div>
                      <div className="bg-slate-600 rounded p-2">
                        <p className="text-gray-400">Engajamento</p>
                        <p className="text-white font-semibold">{post.engagement || 0}%</p>
                      </div>
                      <div className="bg-slate-600 rounded p-2">
                        <p className="text-gray-400">Compartilhamentos</p>
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          0
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-700">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-2">💡 Dicas para Melhor Engajamento</p>
              <ul className="text-sm text-cyan-100 space-y-1">
                <li>✓ Publique entre 10-14h ou 18-22h para máximo alcance</li>
                <li>✓ Use hashtags relevantes e emojis apropriados</li>
                <li>✓ Mantenha consistência em horários de publicação</li>
                <li>✓ Adapte conteúdo para cada plataforma</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
