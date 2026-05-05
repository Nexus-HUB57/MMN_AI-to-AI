import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu } from "lucide-react";

export default function Agent() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Agente IA
          </h1>
          <p className="text-text-secondary">
            Configure e gerencie seu agente de inteligencia artificial
          </p>
        </div>

        {/* Placeholder */}
        <Card className="border-accent-cyan/30 bg-card/50 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
              <Cpu className="w-8 h-8 text-background" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Secao em Desenvolvimento
          </h2>
          <p className="text-text-secondary mb-6">
            O painel de agentes IA esta sendo desenvolvido. Volte em breve!
          </p>
          <Button
            onClick={() => window.history.back()}
            className="gradient-btn"
          >
            Voltar
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
