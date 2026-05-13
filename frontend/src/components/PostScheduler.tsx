import React, { useState } from 'react';
import { Clock, Calendar, Send, Plus, Trash2 } from 'lucide-react';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export const PostScheduler: React.FC = () => {
  const [showNewPost, setShowNewPost] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      title: 'Promoção de Primavera',
      content: 'Aproveite nossa promoção especial de primavera com até 50% de desconto em produtos selecionados!',
      platforms: ['Instagram', 'Facebook', 'Twitter'],
      scheduledFor: '2026-05-15 10:00',
      status: 'scheduled',
      createdAt: '2026-05-13',
    },
    {
      id: '2',
      title: 'Dica de Marketing',
      content: 'Sabia que posts com imagens geram 80% mais engajamento? Comece a usar imagens em seus posts!',
      platforms: ['Twitter', 'LinkedIn'],
      scheduledFor: '2026-05-14 14:30',
      status: 'scheduled',
      createdAt: '2026-05-13',
    },
    {
      id: '3',
      title: 'Webinar Ao Vivo',
      content: 'Junte-se a nós em um webinar exclusivo sobre estratégias de vendas online. Inscrições abertas!',
      platforms: ['Instagram', 'Facebook'],
      scheduledFor: '2026-05-13 18:00',
      status: 'published',
      createdAt: '2026-05-12',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platforms: [] as string[],
    date: '',
    time: '',
  });

  const platforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'];

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleAddPost = () => {
    if (formData.title && formData.content && formData.platforms.length > 0 && formData.date && formData.time) {
      const newPost: ScheduledPost = {
        id: String(posts.length + 1),
        title: formData.title,
        content: formData.content,
        platforms: formData.platforms,
        scheduledFor: `${formData.date} ${formData.time}`,
        status: 'scheduled',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPosts([newPost, ...posts]);
      setFormData({ title: '', content: '', platforms: [], date: '', time: '' });
      setShowNewPost(false);
    }
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-900 text-blue-200';
      case 'published':
        return 'bg-green-900 text-green-200';
      case 'failed':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-slate-700 text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '⏱️ Agendado';
      case 'published':
        return '✓ Publicado';
      case 'failed':
        return '✗ Falha';
      default:
        return status;
    }
  };

  return (
    <div className="post-scheduler bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Agendador de Posts
        </h3>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Post
        </button>
      </div>

      <div className="space-y-4">
        {/* Novo post */}
        {showNewPost && (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
            <h4 className="text-sm font-semibold text-white">Agendar Novo Post</h4>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do post"
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Conteúdo
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escreva o conteúdo do post"
                rows={4}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.content.length}/280 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plataformas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      formData.platforms.includes(platform)
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddPost}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Agendar Post
              </button>
              <button
                onClick={() => setShowNewPost(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de posts agendados */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Posts Agendados</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {posts.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum post agendado</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-700 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-white">{post.title}</h5>
                      <p className="text-xs text-gray-400 mt-1">{post.content.substring(0, 100)}...</p>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1 hover:bg-slate-600 rounded transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`font-medium px-2 py-1 rounded ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.scheduledFor}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="bg-slate-600 text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-orange-900 border border-orange-700 rounded-lg p-3">
          <p className="text-sm text-orange-200">
            💡 <strong>Dica:</strong> Agende seus posts nos horários de pico para máximo engajamento. 
            Geralmente entre 10-14h e 18-22h.
          </p>
        </div>
      </div>
    </div>
  );
};
