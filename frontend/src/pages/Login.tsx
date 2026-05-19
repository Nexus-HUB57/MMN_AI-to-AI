import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar para home se ja autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Verificar se ha rota de origem preservada
      const returnPath = new URLSearchParams(window.location.search).get("from") || "/";
      setLocation(returnPath);
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    // Preservar a rota de origem para redirecionamento apos login
    const returnPath = new URLSearchParams(window.location.search).get("from") || "/";
    window.location.href = getLoginUrl(returnPath);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Branding & Copy */}
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-8">
            {/* Logo & Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                  <Zap className="w-6 h-6 text-background" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">MMNAI</h1>
              </div>
              <p className="text-text-secondary text-lg max-w-md">
                Marketing Multinivel com Agentes IA
              </p>
            </div>

            {/* Value Proposition */}
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  Automatize sua rede de afiliados com IA
                </h2>
                <p className="text-text-secondary">
                  Gerencie comissoes, agentes IA e marketplaces em uma unica plataforma inteligente.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  {
                    icon: "🤖",
                    title: "Agentes IA Autonomos",
                    desc: "Crie e gerencie agentes que geram conteudo automaticamente",
                  },
                  {
                    icon: "💰",
                    title: "Comissoes Inteligentes",
                    desc: "Sistema de comissoes em ate 15 niveis com calculo automatico",
                  },
                  {
                    icon: "📊",
                    title: "Dashboard Completo",
                    desc: "Visualize performance, ganhos e rede em tempo real",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-text-secondary">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <Card className="border-accent/30 bg-card/50 backdrop-blur-md shadow-2xl">
              <div className="p-8 sm:p-10">
                {/* Form Header */}
                <div className="space-y-2 mb-8">
                  <h3 className="text-2xl font-bold text-foreground">Bem-vindo</h3>
                  <p className="text-text-secondary">
                    Faca login com sua conta Manus para comecar
                  </p>
                </div>

                {/* OAuth Login Button */}
                <div className="space-y-6">
                  <Button
                    onClick={handleLogin}
                    className="w-full h-12 gradient-btn text-base font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={isAuthenticated}
                  >
                    <span>Entrar com Manus OAuth</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-text-muted">ou</span>
                    </div>
                  </div>

                  {/* Agente IA Section */}
                  <div className="space-y-4 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                    <div>
                      <Label htmlFor="agent-id" className="text-foreground font-semibold">
                        Inserir ID do Agente IA
                      </Label>
                      <p className="text-xs text-text-secondary mt-1">
                        Se voce ja tem um agente IA configurado, insira o ID abaixo
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="agent-id"
                        type="text"
                        placeholder="ex: agent_123456"
                        className="flex-1 bg-background border-border focus:border-accent-cyan focus:ring-accent-cyan"
                      />
                      <Button
                        variant="outline"
                        className="px-4 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                      >
                        Conectar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-text-muted text-center">
                    Ao fazer login, voce concorda com nossos{" "}
                    <a href="#" className="text-accent-cyan hover:underline">
                      Termos de Servico
                    </a>
                    {" "}e{" "}
                    <a href="#" className="text-accent-cyan hover:underline">
                      Politica de Privacidade
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                Seguro com OAuth
              </div>
              <div className="w-1 h-1 rounded-full bg-border"></div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-cyan"></span>
                Criptografado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
