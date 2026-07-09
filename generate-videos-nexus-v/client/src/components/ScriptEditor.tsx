import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Edit2, Save, X, Eye, Code } from "lucide-react";
import { toast } from "sonner";

interface Scene {
  id: number;
  title: string;
  duration: string;
  visual: string;
  dialogs: string;
  elements: string;
}

interface ScriptEditorProps {
  scriptContent: string;
  isEditing: boolean;
  onEdit: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ScriptEditor({
  scriptContent,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
}: ScriptEditorProps) {
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [scenes, setScenes] = useState<Scene[]>(parseScenes(scriptContent));

  function parseScenes(content: string): Scene[] {
    // Simples parser para extrair cenas do markdown
    const sceneRegex = /## Cena (\d+):(.*?)(?=## Cena|\Z)/gs;
    const scenes: Scene[] = [];
    let match;

    while ((match = sceneRegex.exec(content)) !== null) {
      const sceneNum = parseInt(match[1]);
      const sceneContent = match[2];

      const titleMatch = sceneContent.match(/\*\*Título:\*\*\s*(.+?)(?:\n|$)/);
      const durationMatch = sceneContent.match(/\*\*Duração:\*\*\s*(.+?)(?:\n|$)/);
      const visualMatch = sceneContent.match(/\*\*Visual:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
      const dialogsMatch = sceneContent.match(/\*\*Diálogos:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
      const elementsMatch = sceneContent.match(/\*\*Elementos Visuais:\*\*\s*([\s\S]*?)(?=\*\*|$)/);

      scenes.push({
        id: sceneNum,
        title: titleMatch ? titleMatch[1].trim() : `Cena ${sceneNum}`,
        duration: durationMatch ? durationMatch[1].trim() : "0:00",
        visual: visualMatch ? visualMatch[1].trim() : "",
        dialogs: dialogsMatch ? dialogsMatch[1].trim() : "",
        elements: elementsMatch ? elementsMatch[1].trim() : "",
      });
    }

    return scenes;
  }

  function calculateTotalDuration(): string {
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
  }

  if (!isEditing) {
    return (
      <Card className="border-2 border-neon-cyan/50 bg-black/50 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neon-pink">ROTEIRO</h2>
          <Button
            onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
            variant="outline"
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
        </div>

        {viewMode === "preview" ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-neon-cyan/30 bg-black/50 p-4">
                <p className="text-neon-cyan/60 text-sm">Total de Cenas</p>
                <p className="text-neon-pink font-bold text-lg">{scenes.length}</p>
              </Card>
              <Card className="border-neon-cyan/30 bg-black/50 p-4">
                <p className="text-neon-cyan/60 text-sm">Duração Total</p>
                <p className="text-neon-cyan font-bold text-lg">{calculateTotalDuration()}</p>
              </Card>
              <Card className="border-neon-cyan/30 bg-black/50 p-4">
                <p className="text-neon-cyan/60 text-sm">Status</p>
                <p className="text-green-400 font-bold text-lg">Pronto</p>
              </Card>
            </div>

            {/* Scenes */}
            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <Card
                  key={scene.id}
                  className="border-l-4 border-l-neon-pink border-neon-cyan/30 bg-black/30 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-neon-pink">
                        Cena {scene.id}: {scene.title}
                      </h3>
                      <p className="text-neon-cyan/60 text-sm">Duração: {scene.duration}</p>
                    </div>
                    <span className="text-neon-cyan/40 text-sm">
                      {idx + 1} de {scenes.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-neon-cyan/60 text-xs mb-2">VISUAL</p>
                      <p className="text-neon-cyan text-sm leading-relaxed">{scene.visual}</p>
                    </div>
                    <div>
                      <p className="text-neon-cyan/60 text-xs mb-2">DIÁLOGOS</p>
                      <p className="text-neon-cyan text-sm leading-relaxed">{scene.dialogs}</p>
                    </div>
                    <div>
                      <p className="text-neon-cyan/60 text-xs mb-2">ELEMENTOS</p>
                      <p className="text-neon-cyan text-sm leading-relaxed">{scene.elements}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/30 p-6 rounded border-l-4 border-neon-pink">
            <pre className="text-neon-cyan text-sm overflow-auto max-h-96 font-mono whitespace-pre-wrap break-words">
              {scriptContent}
            </pre>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="border-2 border-neon-cyan/50 bg-black/50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neon-pink">EDITAR ROTEIRO</h2>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-neon-cyan/30">
          <TabsTrigger
            value="editor"
            className="data-[state=active]:bg-neon-pink data-[state=active]:text-black"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-500/50 rounded p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-200 text-sm">
              Edite o conteúdo do roteiro em Markdown. As alterações serão salvas automaticamente.
            </p>
          </div>

          <Textarea
            value={scriptContent}
            onChange={(e) => onEdit(e.target.value)}
            className="w-full h-96 bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan p-4 font-mono rounded"
            placeholder="Edite o roteiro aqui..."
          />

          <div className="flex gap-4">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 bg-neon-pink text-black hover:bg-neon-pink/80 font-bold"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  SALVAR ALTERAÇÕES
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
            >
              <X className="w-4 h-4 mr-2" />
              CANCELAR
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Total de Cenas</p>
              <p className="text-neon-pink font-bold text-lg">{scenes.length}</p>
            </Card>
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Duração Total</p>
              <p className="text-neon-cyan font-bold text-lg">{calculateTotalDuration()}</p>
            </Card>
            <Card className="border-neon-cyan/30 bg-black/50 p-4">
              <p className="text-neon-cyan/60 text-sm">Status</p>
              <p className="text-yellow-400 font-bold text-lg">Editando</p>
            </Card>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {scenes.map((scene, idx) => (
              <Card
                key={scene.id}
                className="border-l-4 border-l-neon-pink border-neon-cyan/30 bg-black/30 p-4"
              >
                <h4 className="text-lg font-bold text-neon-pink mb-2">
                  Cena {scene.id}: {scene.title}
                </h4>
                <p className="text-neon-cyan/60 text-xs mb-3">Duração: {scene.duration}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-neon-cyan/60 mb-1">VISUAL</p>
                    <p className="text-neon-cyan">{scene.visual.substring(0, 100)}...</p>
                  </div>
                  <div>
                    <p className="text-neon-cyan/60 mb-1">DIÁLOGOS</p>
                    <p className="text-neon-cyan">{scene.dialogs.substring(0, 100)}...</p>
                  </div>
                  <div>
                    <p className="text-neon-cyan/60 mb-1">ELEMENTOS</p>
                    <p className="text-neon-cyan">{scene.elements.substring(0, 100)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
