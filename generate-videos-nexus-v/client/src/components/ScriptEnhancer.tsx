import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Lightbulb, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface EnhancementSuggestion {
  id: string;
  type: "grammar" | "clarity" | "engagement" | "pacing" | "tone";
  scene: number;
  original: string;
  suggestion: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

interface ScriptEnhancerProps {
  scriptContent: string;
  onApplySuggestion?: (suggestion: EnhancementSuggestion) => void;
}

export function ScriptEnhancer({
  scriptContent,
  onApplySuggestion,
}: ScriptEnhancerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(
    new Set()
  );

  const handleAnalyze = async () => {
    if (!scriptContent.trim()) {
      toast.error("Por favor, insira um roteiro para analisar");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulated analysis - in production, this would call an API
      // For now, we'll create mock suggestions based on common patterns
      const mockSuggestions: EnhancementSuggestion[] = [
        {
          id: "1",
          type: "engagement",
          scene: 1,
          original: "Introdução ao conceito",
          suggestion: "Comece com uma pergunta envolvente para captar atenção",
          reason: "Aumenta o engajamento do espectador",
          severity: "medium",
        },
        {
          id: "2",
          type: "pacing",
          scene: 2,
          original: "Explicação detalhada",
          suggestion: "Divida em duas cenas menores para melhor ritmo",
          reason: "Melhora o ritmo de visualização",
          severity: "low",
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuggestions(mockSuggestions);
      toast.success(`${mockSuggestions.length} sugestões encontradas!`);
    } catch (error) {
      toast.error("Erro ao analisar roteiro");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (suggestion: EnhancementSuggestion) => {
    setAppliedSuggestions((prev) => new Set(prev).add(suggestion.id));
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
    toast.success("Sugestão aplicada!");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-900/20 border-red-500/50 text-red-200";
      case "medium":
        return "bg-yellow-900/20 border-yellow-500/50 text-yellow-200";
      case "low":
        return "bg-blue-900/20 border-blue-500/50 text-blue-200";
      default:
        return "bg-gray-900/20 border-gray-500/50 text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grammar":
        return "✏️";
      case "clarity":
        return "🔍";
      case "engagement":
        return "⚡";
      case "pacing":
        return "⏱️";
      case "tone":
        return "🎭";
      default:
        return "💡";
    }
  };

  return (
    <Card className="border-2 border-neon-purple/50 bg-black/50 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-neon-purple" />
        <h2 className="text-2xl font-bold text-neon-purple">MELHORADOR DE ROTEIRO</h2>
      </div>

      <div className="space-y-6">
        {/* Info Alert */}
        <div className="bg-purple-900/20 border border-purple-500/50 rounded p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-200 text-sm font-semibold mb-1">
              Análise Inteligente de Roteiro
            </p>
            <p className="text-purple-200/80 text-xs">
              O sistema analisará seu roteiro em busca de oportunidades de melhoria em
              gramática, clareza, engajamento, ritmo e tom. As sugestões são opcionais e
              você pode aplicá-las conforme desejar.
            </p>
          </div>
        </div>

        {/* Analyze Button */}
        {suggestions.length === 0 && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-neon-purple text-black hover:bg-neon-purple/80 font-bold text-lg py-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analisando Roteiro...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                ANALISAR ROTEIRO
              </>
            )}
          </Button>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-neon-cyan">
                {suggestions.length} Sugestões Encontradas
              </h3>
              <Button
                onClick={() => {
                  setSuggestions([]);
                  setAppliedSuggestions(new Set());
                }}
                variant="outline"
                size="sm"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
              >
                Analisar Novamente
              </Button>
            </div>

            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className={`border-l-4 border-l-neon-pink p-4 ${getSeverityColor(
                  suggestion.severity
                )} border rounded`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <div>
                      <p className="font-semibold text-sm capitalize">
                        {suggestion.type} - Cena {suggestion.scene}
                      </p>
                      <p className="text-xs opacity-80">{suggestion.reason}</p>
                    </div>
                  </div>
                  {appliedSuggestions.has(suggestion.id) && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="bg-black/30 p-3 rounded text-xs">
                    <p className="text-gray-400 mb-1">Original:</p>
                    <p className="text-white line-through">{suggestion.original}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded text-xs">
                    <p className="text-neon-cyan mb-1">Sugestão:</p>
                    <p className="text-neon-cyan">{suggestion.suggestion}</p>
                  </div>
                </div>

                {!appliedSuggestions.has(suggestion.id) && (
                  <Button
                    onClick={() => handleApplySuggestion(suggestion)}
                    size="sm"
                    className="w-full bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold text-xs"
                  >
                    APLICAR SUGESTÃO
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded p-4">
          <p className="text-neon-cyan/80 text-xs font-semibold mb-2">💡 Dicas:</p>
          <ul className="text-neon-cyan/60 text-xs space-y-1">
            <li>• Use a análise para melhorar a qualidade do roteiro</li>
            <li>• Nem todas as sugestões são obrigatórias - use seu julgamento</li>
            <li>• Considere o tom e estilo da persona ao avaliar sugestões</li>
            <li>• Salve antes de aplicar múltiplas sugestões</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
