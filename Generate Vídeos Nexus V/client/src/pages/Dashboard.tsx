import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Eye, Plus, Film } from "lucide-react";

const STATUS_LABELS = {
  draft: "Rascunho",
  script_generated: "Roteiro Gerado",
  script_edited: "Roteiro Editado",
  image_generated: "Imagem Gerada",
  completed: "Concluído",
};

const STATUS_COLORS = {
  draft: "text-neon-cyan",
  script_generated: "text-neon-pink",
  script_edited: "text-neon-pink",
  image_generated: "text-neon-purple",
  completed: "text-green-400",
};

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: projects, isLoading, refetch } = trpc.video.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const deleteMutation = trpc.video.delete.useMutation({
    onSuccess: () => {
      toast.success("Projeto deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neon-cyan text-xl mb-4">Você precisa estar autenticado</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, 0.05) 25%, rgba(255, 0, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, 0.05) 75%, rgba(255, 0, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="text-neon-cyan hover:text-neon-pink mb-4"
            >
              ← Voltar
            </Button>
            <h1
              className="text-5xl font-bold text-neon-pink"
              style={{
                textShadow:
                  "0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)",
              }}
            >
              MEUS PROJETOS
            </h1>
          </div>
          <Button
            onClick={() => setLocation("/create")}
            className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold text-lg px-6 py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            NOVO PROJETO
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neon-cyan text-xl animate-pulse">
              CARREGANDO PROJETOS...
            </p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="border-2 border-neon-cyan/30 bg-black/50 p-12 text-center">
            <Film className="w-16 h-16 text-neon-pink mx-auto mb-4 opacity-50" />
            <p className="text-neon-cyan text-lg mb-6">
              Nenhum projeto criado ainda
            </p>
            <Button
              onClick={() => setLocation("/create")}
              className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold"
            >
              CRIAR PRIMEIRO PROJETO
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card
                key={project.id}
                className="border-2 border-neon-cyan/50 bg-black/50 p-6 hover:border-neon-pink/50 transition-all group"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-neon-pink mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-neon-cyan/70 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neon-cyan/60">Persona:</span>
                    <span className="text-neon-pink font-bold">{project.persona}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-cyan/60">Nível:</span>
                    <span className="text-neon-cyan">{project.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-cyan/60">Módulo:</span>
                    <span className="text-neon-cyan">{project.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neon-cyan/60">Status:</span>
                    <span
                      className={`font-bold ${
                        STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]
                      }`}
                    >
                      {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setLocation(`/project/${project.id}`)}
                    className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm("Tem certeza que deseja deletar este projeto?")) {
                        deleteMutation.mutate({ projectId: project.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    variant="outline"
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
