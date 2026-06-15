import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";

const PERSONAS = ["Ive", "Alencar", "dupla"];
const LEVELS = ["Fundamental", "Agente", "Master", "Elite"];

const MODULES = {
  Fundamental: [
    { id: "00-boas-vindas", title: "00 · Boas-vindas ao Nexus" },
    { id: "01-entendendo-ioaid", title: "01 · Entendendo o IOAID" },
    { id: "02-sistema-sho", title: "02 · Sistema SHO" },
    { id: "03-painel-afiliado", title: "03 · Painel do Afiliado" },
  ],
  Agente: [
    { id: "00-primeiro-agente", title: "00 · Seu primeiro agente" },
    { id: "01-skills-essenciais", title: "01 · Skills Essenciais" },
    { id: "02-disparo-whatsapp", title: "02 · Disparo WhatsApp" },
    { id: "03-judge-revisor", title: "03 · Judge Revisor" },
  ],
  Master: [
    { id: "00-otimizacao-conversao", title: "00 · Otimização de Conversão" },
    { id: "01-funis-lifecycle", title: "01 · Funis e Lifecycle" },
    { id: "02-ab-test-judge", title: "02 · A/B Testing com Judge" },
    { id: "03-coortes-churn", title: "03 · Análise de Coortes e Churn" },
  ],
  Elite: [
    { id: "00-blueprints-elite", title: "00 · Blueprints Elite" },
    { id: "01-multi-tenant-whitelabel", title: "01 · Multi-tenant e White-label" },
    { id: "02-federacao-agentes", title: "02 · Federação de Agentes" },
  ],
};

export default function Create() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    persona: "",
    level: "",
    module: "",
  });

  const createMutation = trpc.video.create.useMutation({
    onSuccess: (project: any) => {
      toast.success("Projeto criado com sucesso!");
      if (project?.id) {
        setLocation(`/project/${project.id}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.persona || !formData.level || !formData.module) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      persona: formData.persona,
      level: formData.level,
      module: formData.module,
    } as any);
  };

  const selectedLevel = formData.level as keyof typeof MODULES;
  const availableModules = selectedLevel ? MODULES[selectedLevel] : [];

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-neon-cyan hover:text-neon-pink mb-8"
          >
            ← Voltar
          </Button>
          <h1
            className="text-5xl font-bold text-neon-pink mb-4"
            style={{
              textShadow:
                "0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)",
            }}
          >
            CRIAR NOVO VÍDEO
          </h1>
          <p className="text-neon-cyan text-lg">
            Configure os parâmetros do seu vídeo-aula educacional
          </p>
        </div>

        <Card className="border-2 border-neon-cyan/50 bg-black/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title and Description */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-neon-pink font-bold">
                  Título do Projeto *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Aula de Otimização de Conversão"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2 bg-black/50 border-neon-cyan/30 text-white placeholder:text-neon-cyan/40"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-neon-pink font-bold">
                  Descrição (Opcional)
                </Label>
                <Input
                  id="description"
                  placeholder="Descreva o conteúdo da aula"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-2 bg-black/50 border-neon-cyan/30 text-white placeholder:text-neon-cyan/40"
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div>
              <Label htmlFor="persona" className="text-neon-pink font-bold">
                Persona *
              </Label>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {PERSONAS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, persona: p })}
                    className={`p-4 border-2 transition-all ${
                      formData.persona === p
                        ? "border-neon-pink bg-neon-pink/10"
                        : "border-neon-cyan/30 hover:border-neon-cyan/60"
                    }`}
                  >
                    <div className="text-lg font-bold text-neon-pink">{p}</div>
                    <div className="text-xs text-neon-cyan/60 mt-2">
                      {p === "Ive"
                        ? "Sra. Nexus Ive"
                        : p === "Alencar"
                          ? "Sir. Nexus Alencar"
                          : "Dupla Harmoniosa"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <Label htmlFor="level" className="text-neon-pink font-bold">
                Nível do Curso *
              </Label>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, level, module: "" })
                    }
                    className={`p-4 border-2 transition-all ${
                      formData.level === level
                        ? "border-neon-pink bg-neon-pink/10"
                        : "border-neon-cyan/30 hover:border-neon-cyan/60"
                    }`}
                  >
                    <div className="text-sm font-bold text-neon-pink">
                      {level}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Module Selection */}
            {selectedLevel && (
              <div>
                <Label htmlFor="module" className="text-neon-pink font-bold">
                  Módulo *
                </Label>
                <Select value={formData.module} onValueChange={(value) =>
                  setFormData({ ...formData, module: value })
                }>
                  <SelectTrigger className="mt-2 bg-black/50 border-neon-cyan/30 text-white">
                    <SelectValue placeholder="Selecione um módulo" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-neon-cyan/30">
                    {availableModules.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id}>
                        <span className="text-neon-cyan">{mod.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-8">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-neon-pink text-black hover:bg-neon-pink/80 font-bold text-lg py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {createMutation.isPending ? "Criando..." : "CRIAR PROJETO"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/")}
                variant="outline"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-bold"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
