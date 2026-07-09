import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ScriptGeneratorProps {
  projectId: number;
  persona: string;
  level: string;
  module: string;
  onScriptGenerated: (script: string) => void;
  isLoading?: boolean;
}

export function ScriptGenerator({
  projectId,
  persona,
  level,
  module,
  onScriptGenerated,
  isLoading = false,
}: ScriptGeneratorProps) {
  const [moduleContent, setModuleContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScriptMutation = trpc.video.generateScript.useMutation({
    onSuccess: (data) => {
      if (data.success && data.script) {
        onScriptGenerated(data.script.content);
        toast.success("Roteiro gerado com sucesso!");
      } else {
        toast.error(data.message || "Erro ao gerar roteiro");
      }
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar roteiro");
      setIsGenerating(false);
    },
  });

  const handleGenerate = async () => {
    if (!moduleContent.trim()) {
      toast.error("Por favor, insira o conteúdo do módulo");
      return;
    }

    setIsGenerating(true);
    await generateScriptMutation.mutateAsync({
      projectId,
      moduleContent,
    });
  };

  return (
    <Card className="border-2 border-neon-purple/50 bg-black/50 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-neon-purple" />
        <h2 className="text-2xl font-bold text-neon-purple">GERAR ROTEIRO COM IA</h2>
      </div>

      <div className="space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-neon-cyan/30 bg-black/50 p-3">
            <p className="text-neon-cyan/60 text-xs">Persona</p>
            <p className="text-neon-pink font-bold text-sm">{persona}</p>
          </Card>
          <Card className="border-neon-cyan/30 bg-black/50 p-3">
            <p className="text-neon-cyan/60 text-xs">Nível</p>
            <p className="text-neon-cyan font-bold text-sm">{level}</p>
          </Card>
          <Card className="border-neon-cyan/30 bg-black/50 p-3">
            <p className="text-neon-cyan/60 text-xs">Módulo</p>
            <p className="text-neon-cyan font-bold text-sm">{module}</p>
          </Card>
          <Card className="border-neon-cyan/30 bg-black/50 p-3">
            <p className="text-neon-cyan/60 text-xs">Status</p>
            <p className="text-yellow-400 font-bold text-sm">Pronto</p>
          </Card>
        </div>

        {/* Alert */}
        <div className="bg-purple-900/20 border border-purple-500/50 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-200 text-sm font-semibold mb-1">
              Geração de Roteiro com IA
            </p>
            <p className="text-purple-200/80 text-xs">
              Insira o conteúdo do módulo abaixo. O sistema usará as diretrizes da persona{" "}
              <span className="font-bold">{persona}</span> para gerar um roteiro estruturado em
              cenas, com duração estimada de 15-20 minutos.
            </p>
          </div>
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-3">
            Conteúdo do Módulo
          </label>
          <Textarea
            value={moduleContent}
            onChange={(e) => setModuleContent(e.target.value)}
            placeholder="Cole aqui o conteúdo do módulo que deseja transformar em roteiro de vídeo-aula..."
            className="w-full h-48 bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan p-4 rounded"
            disabled={isGenerating || isLoading}
          />
          <p className="text-neon-cyan/60 text-xs mt-2">
            {moduleContent.length} caracteres · Mínimo recomendado: 500 caracteres
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || isLoading || !moduleContent.trim()}
          className="w-full bg-neon-purple text-black hover:bg-neon-purple/80 font-bold text-lg py-6"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando Roteiro...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              GERAR ROTEIRO COM IA
            </>
          )}
        </Button>

        {/* Tips */}
        <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded p-4">
          <p className="text-neon-cyan/80 text-xs font-semibold mb-2">💡 Dicas:</p>
          <ul className="text-neon-cyan/60 text-xs space-y-1">
            <li>• Forneça conteúdo estruturado e bem organizado</li>
            <li>• Inclua exemplos práticos e casos de uso</li>
            <li>• Especifique o público-alvo e nível de complexidade</li>
            <li>• O roteiro será gerado em Markdown para fácil edição</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
