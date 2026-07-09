import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { ScriptEditor } from "@/components/ScriptEditor";
import { ScriptGenerator } from "@/components/ScriptGenerator";

export default function Project() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/project/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

  const { data: project, isLoading: projectLoading, refetch } = trpc.video.getById.useQuery(
    { projectId: projectId || 0 },
    { enabled: isAuthenticated && !!projectId }
  );

  const { data: script } = trpc.video.getScript.useQuery(
    { projectId: projectId || 0 },
    { enabled: isAuthenticated && !!projectId && !!project }
  );

  const updateScriptMutation = trpc.video.updateScript.useMutation({
    onSuccess: () => {
      toast.success("Roteiro atualizado com sucesso!");
      setIsEditingScript(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar roteiro");
    },
  });

  const handleSaveScript = async () => {
    if (!projectId) return;
    await updateScriptMutation.mutateAsync({
      projectId,
      scriptContent: editedScript,
    });
  };

  const handleScriptGenerated = (generatedScript: string) => {
    setEditedScript(generatedScript);
    setShowGenerator(false);
    refetch();
  };

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

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-pink animate-spin mx-auto mb-4" />
          <p className="text-neon-cyan text-xl">CARREGANDO PROJETO...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neon-cyan text-xl mb-4">Projeto não encontrado</p>
          <Button
            onClick={() => setLocation("/dashboard")}
            className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold"
          >
            Voltar ao dashboard
          </Button>
        </div>
      </div>
    );
  }

  const scriptContent = script?.content || editedScript || "";

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
        <Button
          onClick={() => setLocation("/dashboard")}
          variant="ghost"
          className="text-neon-cyan hover:text-neon-pink mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar ao Dashboard
        </Button>

        {/* Project Header */}
        <div className="mb-12">
          <h1
            className="text-5xl font-bold text-neon-pink mb-4"
            style={{
              textShadow:
                "0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)",
            }}
          >
            {project.title}
          </h1>
          {project.description && (
            <p className="text-neon-cyan text-lg mb-6">{project.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Persona</p>
              <p className="text-neon-pink font-bold text-lg">{project.persona}</p>
            </Card>
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Nível</p>
              <p className="text-neon-cyan font-bold text-lg">{project.level}</p>
            </Card>
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Módulo</p>
              <p className="text-neon-cyan font-bold text-lg">{project.module}</p>
            </Card>
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Status</p>
              <p
                className={`font-bold text-lg ${
                  project.status === "completed"
                    ? "text-green-400"
                    : project.status.includes("image")
                      ? "text-neon-purple"
                      : "text-neon-pink"
                }`}
              >
                {project.status.replace(/_/g, " ").toUpperCase()}
              </p>
            </Card>
          </div>
        </div>

        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <Card className="border-2 border-neon-cyan/50 bg-black/50 p-6 mb-12">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">THUMBNAIL</h2>
            <img
              src={project.thumbnailUrl}
              alt="Thumbnail do vídeo"
              className="w-full max-w-md rounded border-2 border-neon-cyan/30"
            />
          </Card>
        )}

        {/* Script Generator */}
        {!scriptContent && !showGenerator && (
          <div className="mb-8">
            <Button
              onClick={() => setShowGenerator(true)}
              className="w-full bg-neon-purple text-black hover:bg-neon-purple/80 font-bold text-lg py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              GERAR ROTEIRO COM IA
            </Button>
          </div>
        )}

        {showGenerator && !scriptContent && (
          <ScriptGenerator
            projectId={project.id}
            persona={project.persona}
            level={project.level}
            module={project.module}
            onScriptGenerated={handleScriptGenerated}
          />
        )}

        {/* Script Editor/Viewer */}
        {scriptContent && (
          <div className="mb-12">
            {!isEditingScript ? (
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    setIsEditingScript(true);
                    setEditedScript(scriptContent);
                  }}
                  className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold"
                >
                  EDITAR ROTEIRO
                </Button>
              </div>
            ) : null}

            <ScriptEditor
              scriptContent={isEditingScript ? editedScript : scriptContent}
              isEditing={isEditingScript}
              onEdit={setEditedScript}
              onSave={handleSaveScript}
              onCancel={() => setIsEditingScript(false)}
              isSaving={updateScriptMutation.isPending}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12">
          <Button
            onClick={() => setLocation("/dashboard")}
            className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold text-lg py-6"
          >
            VOLTAR AO DASHBOARD
          </Button>
          <Button
            disabled
            className="flex-1 bg-neon-purple text-black hover:bg-neon-purple/80 font-bold text-lg py-6 opacity-50"
            title="Funcionalidade em desenvolvimento"
          >
            GERAR VÍDEO
          </Button>
        </div>
      </div>
    </div>
  );
}
