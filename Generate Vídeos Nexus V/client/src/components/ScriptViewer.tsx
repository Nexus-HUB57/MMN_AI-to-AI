import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Code, Download, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Scene {
  id: number;
  title: string;
  duration: string;
  visual: string;
  dialogs: string;
  elements: string;
}

interface ScriptViewerProps {
  scriptContent: string;
  scenes: Scene[];
  onEdit?: () => void;
  onDownload?: () => void;
}

export function ScriptViewer({
  scriptContent,
  scenes,
  onEdit,
  onDownload,
}: ScriptViewerProps) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  const calculateTotalDuration = (): string => {
    let totalSeconds = 0;
    scenes.forEach((scene) => {
      const parts = scene.duration.split(":");
      if (parts.length === 2) {
        totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    });

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent);
    toast.success("Roteiro copiado para a área de transferência!");
  };

  const getSceneStats = () => {
    const totalWords = scenes.reduce(
      (acc, scene) => acc + scene.dialogs.split(/\s+/).length,
      0
    );
    const totalCharacters = scenes.reduce(
      (acc, scene) =>
        acc + scene.visual.length + scene.dialogs.length + scene.elements.length,
      0
    );

    return { totalWords, totalCharacters };
  };

  const stats = getSceneStats();

  return (
    <Card className="border-2 border-neon-cyan/50 bg-black/50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neon-pink">ROTEIRO</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode(viewMode === "preview" ? "code" : "preview")}
            variant="outline"
            size="sm"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
          >
            {viewMode === "preview" ? (
              <>
                <Code className="w-4 h-4 mr-2" />
                Ver Código
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Ver Preview
              </>
            )}
          </Button>
          <Button
            onClick={handleCopyToClipboard}
            variant="outline"
            size="sm"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          {onDownload && (
            <Button
              onClick={onDownload}
              variant="outline"
              size="sm"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card className="border-neon-cyan/30 bg-black/50 p-3">
          <p className="text-neon-cyan/60 text-xs">Cenas</p>
          <p className="text-neon-pink font-bold text-lg">{scenes.length}</p>
        </Card>
        <Card className="border-neon-cyan/30 bg-black/50 p-3">
          <p className="text-neon-cyan/60 text-xs">Duração</p>
          <p className="text-neon-cyan font-bold text-lg">{calculateTotalDuration()}</p>
        </Card>
        <Card className="border-neon-cyan/30 bg-black/50 p-3">
          <p className="text-neon-cyan/60 text-xs">Palavras</p>
          <p className="text-neon-cyan font-bold text-lg">{stats.totalWords}</p>
        </Card>
        <Card className="border-neon-cyan/30 bg-black/50 p-3">
          <p className="text-neon-cyan/60 text-xs">Caracteres</p>
          <p className="text-neon-cyan font-bold text-lg">{stats.totalCharacters}</p>
        </Card>
        <Card className="border-neon-cyan/30 bg-black/50 p-3">
          <p className="text-neon-cyan/60 text-xs">Status</p>
          <p className="text-green-400 font-bold text-lg">Pronto</p>
        </Card>
      </div>

      {/* Content View */}
      {viewMode === "preview" ? (
        <div className="space-y-4">
          {scenes.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-sm">
                Nenhuma cena encontrada no roteiro. Verifique o formato do Markdown.
              </p>
            </div>
          ) : (
            scenes.map((scene, idx) => (
              <Card
                key={scene.id}
                className="border-l-4 border-l-neon-pink border-neon-cyan/30 bg-black/30 p-6 hover:bg-black/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-neon-pink">
                      Cena {scene.id}: {scene.title}
                    </h3>
                    <p className="text-neon-cyan/60 text-sm">⏱️ {scene.duration}</p>
                  </div>
                  <span className="text-neon-cyan/40 text-sm font-mono">
                    {idx + 1}/{scenes.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/50 p-4 rounded border border-neon-cyan/20">
                    <p className="text-neon-cyan/60 text-xs font-bold mb-2 uppercase">
                      🎬 Visual
                    </p>
                    <p className="text-neon-cyan text-sm leading-relaxed whitespace-pre-wrap">
                      {scene.visual}
                    </p>
                  </div>
                  <div className="bg-black/50 p-4 rounded border border-neon-cyan/20">
                    <p className="text-neon-cyan/60 text-xs font-bold mb-2 uppercase">
                      🎤 Diálogos
                    </p>
                    <p className="text-neon-cyan text-sm leading-relaxed whitespace-pre-wrap">
                      {scene.dialogs}
                    </p>
                  </div>
                  <div className="bg-black/50 p-4 rounded border border-neon-cyan/20">
                    <p className="text-neon-cyan/60 text-xs font-bold mb-2 uppercase">
                      ✨ Elementos
                    </p>
                    <p className="text-neon-cyan text-sm leading-relaxed whitespace-pre-wrap">
                      {scene.elements}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="bg-black/30 p-6 rounded border-l-4 border-neon-pink">
          <pre className="text-neon-cyan text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {scriptContent}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      {onEdit && (
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onEdit}
            className="flex-1 bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold"
          >
            EDITAR ROTEIRO
          </Button>
        </div>
      )}
    </Card>
  );
}
