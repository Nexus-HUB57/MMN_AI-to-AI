import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  FileText,
  MessageCircle,
  Users,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Play,
  Clock,
  Eye,
  Zap
} from "lucide-react";

// Mock data
const eventos = [
  {
    id: 1,
    titulo: "Masterclass: Como Escalar sua Rede",
    tipo: "live",
    data: "2026-05-25",
    hora: "19:00",
    imagem: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop",
    participantes: 156,
    descricao: "Aprenda estratégias avançadas para expandir sua rede de afiliados"
  },
  {
    id: 2,
    titulo: "Workshop: Agentes IA na Prática",
    tipo: "gravado",
    data: "2026-05-20",
    hora: "14:00",
    imagem: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop",
    duracao: "45 min",
    visualizacoes: 892,
    descricao: "Tutorial completo sobre configuração de agentes IA"
  },
  {
    id: 3,
    titulo: "Palestra: O Futuro do Marketing Multinível",
    tipo: "live",
    data: "2026-05-28",
    hora: "20:00",
    imagem: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=200&fit=crop",
    participantes: 234,
    descricao: "Tendências e inovações no mercado de MMN"
  }
];

const cursos = [
  {
    id: 1,
    titulo: "Básico do IOAID · SaaS",
    modulo: 5,
    duracaoTotal: "2h 30min",
    progresso: 75,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop"
  },
  {
    id: 2,
    titulo: "Estratégias de Prospecção",
    modulo: 8,
    duracaoTotal: "4h 15min",
    progresso: 30,
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=120&fit=crop"
  },
  {
    id: 3,
    titulo: "Advanced Agentes IA",
    modulo: 12,
    duracaoTotal: "6h 45min",
    progresso: 0,
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=120&fit=crop"
  }
];

const postagens = [
  {
    id: 1,
    autor: "Maria Silva",
    avatar: "MS",
    conteudo: " acaba de compartilhar um novo material sobre estratégias de vendas! 🚀",
    tipo: "material",
    tempo: "2h atrás",
    likes: 45,
    comentarios: 12
  },
  {
    id: 2,
    autor: "João Santos",
    avatar: "JS",
    conteudo: " acabou de subir de nível para o tier Preditivo! Parabéns! 🎉",
    tipo: "conquista",
    tempo: "4h atrás",
    likes: 89,
    comentarios: 23
  },
  {
    id: 3,
    autor: "Ana Costa",
    avatar: "AC",
    conteudo: " compartilhou um novo vídeo tutorial sobre configuração de agentes.",
    tipo: "video",
    tempo: "6h atrás",
    likes: 67,
    comentarios: 18
  }
];

export default function EspacoAberto() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");

  const categorias = [
    { id: "todos", nome: "Todos", icon: Video },
    { id: "cursos", nome: "Cursos", icon: FileText },
    { id: "eventos", nome: "Eventos", icon: Calendar },
    { id: "comunidade", nome: "Comunidade", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                <Zap className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Espaço Aberto</h1>
                <p className="text-xs text-text-secondary">Aprendizado e Comunidade</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="search"
                  placeholder="Buscar cursos, eventos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>
            </div>

            <Button className="gradient-btn">
              <Video className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-accent-cyan/5 border-accent-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-text-secondary">Vídeos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent-green/5 border-accent-green/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-green/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1.2K</p>
                  <p className="text-xs text-text-secondary">Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent-purple/5 border-accent-purple/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-text-secondary">Eventos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent-orange/5 border-accent-orange/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-orange/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold">95%</p>
                  <p className="text-xs text-text-secondary">Aprendizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <Tabs defaultValue="cursos" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-muted">
                  {categorias.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="gap-2"
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.nome}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Cursos */}
              <TabsContent value="cursos" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Seus Cursos</h3>
                  <Button variant="ghost" size="sm" className="text-accent-cyan">
                    Ver todos
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cursos.map((curso) => (
                    <Card key={curso.id} className="overflow-hidden hover:border-accent-cyan/50 transition-colors cursor-pointer">
                      <div className="relative h-32">
                        <img
                          src={curso.thumbnail}
                          alt={curso.titulo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-1 bg-accent-cyan rounded text-xs font-medium">
                            {curso.modulo} módulos
                          </span>
                          <span className="px-2 py-1 bg-black/50 rounded text-xs">
                            {curso.duracaoTotal}
                          </span>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h4 className="font-semibold mb-2">{curso.titulo}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Progresso</span>
                            <span>{curso.progresso}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-cyan rounded-full transition-all"
                              style={{ width: `${curso.progresso}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Eventos */}
              <TabsContent value="eventos" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Próximos Eventos</h3>
                  <Button variant="ghost" size="sm" className="text-accent-cyan">
                    Ver calendário
                  </Button>
                </div>
                <div className="space-y-4">
                  {eventos.map((evento) => (
                    <Card key={evento.id} className="overflow-hidden hover:border-accent-cyan/50 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 h-32 md:h-auto">
                          <img
                            src={evento.imagem}
                            alt={evento.titulo}
                            className="w-full h-full object-cover"
                          />
                          {evento.tipo === "live" && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded text-xs font-bold text-white flex items-center gap-1">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              LIVE
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold mb-1">{evento.titulo}</h4>
                              <p className="text-sm text-text-secondary mb-3">
                                {evento.descricao}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {evento.data} às {evento.hora}
                                </span>
                                {evento.tipo === "live" ? (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {evento.participantes} participantes
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {evento.duracao}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button size="sm" className="gradient-btn ml-4">
                              {evento.tipo === "live" ? "Participar" : "Assistir"}
                              <Play className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Comunidade */}
              <TabsContent value="comunidade" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Atividades Recentes</h3>
                  <Button variant="ghost" size="sm" className="text-accent-cyan">
                    Ver todas
                  </Button>
                </div>
                <div className="space-y-4">
                  {postagens.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-sm font-bold text-background">
                            {post.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.autor}</span>
                              <span className="text-xs text-text-muted">{post.tempo}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">{post.conteudo}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                              <button className="flex items-center gap-1 hover:text-accent-cyan">
                                <TrendingUp className="w-3 h-3" />
                                {post.likes}
                              </button>
                              <button className="flex items-center gap-1 hover:text-accent-cyan">
                                <MessageCircle className="w-3 h-3" />
                                {post.comentarios}
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Todos */}
              <TabsContent value="todos" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Eventos em Destaque</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventos.slice(0, 2).map((evento) => (
                      <Card key={evento.id} className="overflow-hidden">
                        <div className="relative h-40">
                          <img
                            src={evento.imagem}
                            alt={evento.titulo}
                            className="w-full h-full object-cover"
                          />
                          {evento.tipo === "live" && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded text-xs font-bold text-white">
                              LIVE
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold">{evento.titulo}</h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {evento.data} - {evento.hora}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Cursos Populares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cursos.slice(0, 2).map((curso) => (
                      <Card key={curso.id} className="flex items-center gap-4 p-4">
                        <img
                          src={curso.thumbnail}
                          alt={curso.titulo}
                          className="w-20 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{curso.titulo}</h4>
                          <p className="text-xs text-text-secondary">
                            {curso.modulo} módulos • {curso.duracaoTotal}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Iniciar
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Ranking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-green" />
                  Top Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { nome: "Maria Silva", pontos: 12500, tier: "Orquestrador" },
                  { nome: "João Santos", pontos: 11200, tier: "Generativo" },
                  { nome: "Ana Costa", pontos: 9800, tier: "Generativo" },
                  { nome: "Pedro Lima", pontos: 8500, tier: "Preditivo" },
                  { nome: "Carla Rosa", pontos: 7200, tier: "Preditivo" },
                ].map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-text-muted">
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-xs font-bold text-background">
                      {user.nome.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.nome}</p>
                      <p className="text-xs text-text-muted">{user.tier}</p>
                    </div>
                    <span className="text-xs font-semibold text-accent-cyan">
                      {user.pontos.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Próximo Evento */}
            <Card className="bg-gradient-to-br from-accent-cyan/10 to-accent-green/10 border-accent-cyan/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-cyan" />
                  Próximo Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">Masterclass: Como Escalar sua Rede</h4>
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                  <span>25 Mai</span>
                  <span>19:00</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    156
                  </span>
                </div>
                <Button className="w-full gradient-btn">
                  Inscrever-se
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Links Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  <FileText className="w-4 h-4" />
                  Central de Ajuda
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  <Video className="w-4 h-4" />
                  Tutoriais em Vídeo
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Suporte ao Vivo
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}