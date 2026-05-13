/**
 * Home Page - Glassmorphism Futurista
 * Design: Vidro fosco com efeitos neon, paleta ciano/roxo, tipografia Space Mono
 * Componentes: Cards com glow, botões com efeito neon, gradientes suaves
 */

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400 glow-text-cyan" />
            <h1 className="text-2xl font-bold text-white font-mono">MMN AI-to-AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-cyan-400 transition-colors"
              >
                Dashboard
              </Button>
            </Link>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold glow-cyan transition-all"
            >
              Entrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full backdrop-blur-sm">
            <p className="text-cyan-400 text-sm font-mono font-semibold">✨ Powered by IA</p>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 font-mono leading-tight">
            Sistema de Afiliados <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              com Agente IA
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Ganhe comissões promovendo produtos de alta demanda. Seu agente de IA gera conteúdo, analisa tendências e otimiza suas vendas 24/7 enquanto você dorme.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold glow-cyan transition-all"
              >
                Começar Agora <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Feature 1 */}
          <div className="group glass rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-all">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-mono">Comissões Altas</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Ganhe até 15% de comissão em cada venda, com bônus por indicações em múltiplos níveis da sua rede.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group glass rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-all">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-mono">Agente IA Dedicado</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Seu agente de IA gera conteúdo otimizado, analisa tendências de mercado e otimiza suas vendas automaticamente.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group glass rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-all">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-mono">Rede Ilimitada</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Indique quantas pessoas quiser e ganhe comissões de toda a sua rede em profundidade sem limites.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass rounded-3xl p-12 mb-20 border-cyan-500/20">
          <h3 className="text-4xl font-bold text-white mb-12 text-center font-mono">Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Registre-se", desc: "Crie sua conta e receba seu código único" },
              { step: 2, title: "Compartilhe", desc: "Distribua seu link com amigos e seguidores" },
              { step: 3, title: "Ganhe", desc: "Receba comissões de cada venda realizada" },
              { step: 4, title: "Escale", desc: "Indique outros afiliados e ganhe em profundidade" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 font-mono font-bold text-slate-950 text-lg glow-cyan">
                  {item.step}
                </div>
                <h4 className="font-bold text-white mb-2 font-mono">{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass rounded-3xl p-12 text-center border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-4 font-mono">Pronto para começar?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg">
              Junte-se a centenas de afiliados que estão ganhando dinheiro com nosso programa revolucionário de IA
            </p>
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold glow-cyan transition-all"
            >
              Registrar Agora <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 bg-slate-950/40 backdrop-blur-md mt-20 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-slate-400">
          <p>&copy; 2026 MMN AI-to-AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
