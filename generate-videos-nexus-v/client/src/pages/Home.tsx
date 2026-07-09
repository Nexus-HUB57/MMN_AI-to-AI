import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Sparkles, Zap, Film } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neon-pink text-2xl font-bold animate-pulse">
          NEXUS INITIALIZING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background grid effect */}
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

      {/* Header */}
      <header className="relative z-10 border-b border-neon-cyan/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-neon-pink flex items-center justify-center">
              <Film className="w-6 h-6 text-neon-pink" />
            </div>
            <h1 className="text-2xl font-bold text-neon-pink" style={{
              textShadow: "0 0 10px rgba(255, 0, 255, 0.8), 0 0 20px rgba(255, 0, 255, 0.4)"
            }}>
              NEXUS VIDEO GENERATOR
            </h1>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-neon-cyan">{user?.name}</span>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold"
              >
                DASHBOARD
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold"
            >
              CONECTAR
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-5xl lg:text-6xl font-bold mb-6 text-neon-pink leading-tight"
                style={{
                  textShadow:
                    "0 0 20px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.2)",
                }}
              >
                CRIE VÍDEOS EDUCACIONAIS COM IA
              </h2>
              <p className="text-xl text-neon-cyan mb-8 leading-relaxed">
                Plataforma de geração de vídeo-aulas inteligentes com personas
                especializadas. Roteiros automáticos, imagens personalizadas e
                gerenciamento completo de projetos.
              </p>
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => setLocation("/create")}
                      className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold text-lg px-8 py-6"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      CRIAR VÍDEO
                    </Button>
                    <Button
                      onClick={() => setLocation("/dashboard")}
                      variant="outline"
                      className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 font-bold text-lg px-8 py-6"
                    >
                      MEUS PROJETOS
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="bg-neon-pink text-black hover:bg-neon-pink/80 font-bold text-lg px-8 py-6"
                  >
                    COMEÇAR AGORA
                  </Button>
                )}
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative h-96 border-2 border-neon-cyan/50 bg-black/50 p-8 flex items-center justify-center">
              <div className="absolute inset-0 border-l-2 border-t-2 border-neon-pink/30 m-4" />
              <div className="absolute inset-0 border-r-2 border-b-2 border-neon-cyan/30 m-4" />
              <div className="relative z-10 text-center">
                <Film className="w-24 h-24 text-neon-pink mx-auto mb-4 animate-pulse" />
                <p className="text-neon-cyan text-lg font-bold">
                  INTERFACE FUTURISTA
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h3
            className="text-3xl font-bold text-neon-pink mb-12 text-center"
            style={{
              textShadow:
                "0 0 15px rgba(255, 0, 255, 0.6), 0 0 30px rgba(255, 0, 255, 0.3)",
            }}
          >
            FUNCIONALIDADES PRINCIPAIS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "ROTEIROS AUTOMÁTICOS",
                description:
                  "Geração inteligente de roteiros via LLM com diretrizes de persona",
                icon: "✦",
              },
              {
                title: "PERSONAS ESPECIALIZADAS",
                description:
                  "Ive, Alencar e dupla com características únicas e complementares",
                icon: "◆",
              },
              {
                title: "MÚLTIPLOS NÍVEIS",
                description:
                  "Fundamental, Agente, Master e Elite com conteúdo específico",
                icon: "▲",
              },
              {
                title: "EDITOR DE ROTEIRO",
                description: "Edição inline com visualização em tempo real",
                icon: "◇",
              },
              {
                title: "GERAÇÃO DE IMAGENS",
                description:
                  "Thumbnails personalizadas com tema do módulo e persona",
                icon: "★",
              },
              {
                title: "PAINEL DE PROJETOS",
                description:
                  "Histórico completo com status de geração e gerenciamento",
                icon: "◈",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="border-2 border-neon-cyan/50 bg-black/50 p-6 hover:border-neon-pink/50 transition-all duration-300 group"
              >
                <div className="text-4xl text-neon-pink mb-4 group-hover:text-neon-cyan transition-colors">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-neon-pink mb-2">
                  {feature.title}
                </h4>
                <p className="text-neon-cyan/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-2 border-neon-pink/50 bg-black/50 p-12 text-center">
          <h3
            className="text-3xl font-bold text-neon-pink mb-4"
            style={{
              textShadow:
                "0 0 15px rgba(255, 0, 255, 0.6), 0 0 30px rgba(255, 0, 255, 0.3)",
            }}
          >
            PRONTO PARA COMEÇAR?
          </h3>
          <p className="text-neon-cyan mb-8 text-lg">
            Junte-se à revolução da educação com IA. Crie vídeos incríveis em
            minutos.
          </p>
          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              ACESSAR PLATAFORMA
            </Button>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neon-cyan/30 bg-black/50 backdrop-blur-sm mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-neon-cyan/60 text-sm">
          <p>
            © 2026 Nexus Video Generator. Desenvolvido com IA para a AcademIA
            Nexus.
          </p>
        </div>
      </footer>
    </div>
  );
}
