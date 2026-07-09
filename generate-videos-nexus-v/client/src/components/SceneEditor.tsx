import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Scene {
  id: number;
  title: string;
  duration: string;
  visual: string;
  dialogs: string;
  elements: string;
}

interface SceneEditorProps {
  scene: Scene;
  onSave: (updatedScene: Scene) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SceneEditor({
  scene,
  onSave,
  onCancel,
  isSaving = false,
}: SceneEditorProps) {
  const [editedScene, setEditedScene] = useState<Scene>(scene);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDuration = (duration: string): boolean => {
    const durationRegex = /^\d{1,2}:\d{2}$/;
    return durationRegex.test(duration);
  };

  const validateScene = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedScene.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!validateDuration(editedScene.duration)) {
      newErrors.duration = "Duração deve estar no formato MM:SS";
    }

    if (!editedScene.visual.trim()) {
      newErrors.visual = "Descrição visual é obrigatória";
    }

    if (!editedScene.dialogs.trim()) {
      newErrors.dialogs = "Diálogos são obrigatórios";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateScene()) {
      onSave(editedScene);
      toast.success(`Cena ${editedScene.id} salva com sucesso!`);
    }
  };

  const handleFieldChange = (field: keyof Scene, value: string) => {
    setEditedScene((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="border-2 border-neon-pink/50 bg-black/50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-neon-pink">
          Editar Cena {editedScene.id}
        </h3>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="text-neon-cyan hover:text-neon-pink"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-2">
            Título da Cena
          </label>
          <Input
            value={editedScene.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="w-full bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/30 rounded"
            placeholder="Ex: Introdução ao Conceito"
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duração (MM:SS)
          </label>
          <Input
            value={editedScene.duration}
            onChange={(e) => handleFieldChange("duration", e.target.value)}
            className="w-full bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/30 rounded"
            placeholder="Ex: 02:30"
          />
          {errors.duration && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.duration}
            </p>
          )}
        </div>

        {/* Visual Description */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-2">
            Descrição Visual
          </label>
          <Textarea
            value={editedScene.visual}
            onChange={(e) => handleFieldChange("visual", e.target.value)}
            className="w-full h-24 bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/30 p-3 rounded"
            placeholder="Descreva o cenário, iluminação, enquadramento..."
          />
          {errors.visual && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.visual}
            </p>
          )}
        </div>

        {/* Dialogs */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-2">
            Diálogos
          </label>
          <Textarea
            value={editedScene.dialogs}
            onChange={(e) => handleFieldChange("dialogs", e.target.value)}
            className="w-full h-24 bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/30 p-3 rounded"
            placeholder="Insira os diálogos da cena..."
          />
          {errors.dialogs && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dialogs}
            </p>
          )}
        </div>

        {/* Visual Elements */}
        <div>
          <label className="block text-neon-cyan text-sm font-semibold mb-2">
            Elementos Visuais (Slides, Gráficos, etc.)
          </label>
          <Textarea
            value={editedScene.elements}
            onChange={(e) => handleFieldChange("elements", e.target.value)}
            className="w-full h-20 bg-black/50 border-2 border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/30 p-3 rounded"
            placeholder="Descreva os elementos visuais a serem exibidos..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
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
                SALVAR CENA
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
      </div>
    </Card>
  );
}
