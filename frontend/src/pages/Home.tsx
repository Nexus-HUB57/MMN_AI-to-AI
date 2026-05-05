import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Zap, Users, TrendingUp } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">N.OS Affiliate</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button 
                asChild
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sistema de Afiliados com <span className="text-indigo-400">Agente IA</span>
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Ganhe comissões promovendo produtos de alta demanda. Seu agente de IA faz o trabalho pesado enquanto você dorme.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  Ir para Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                asChild
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <a href={getLoginUrl()}>
                  Começar Agora <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Comissões Altas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Ganhe até 15% de comissão em cada venda, com bônus por indicações em múltiplos níveis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Agente IA Dedicado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Seu agente de IA gera conteúdo, analisa tendências e otimiza suas vendas 24/7.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-800 text-white hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Rede Ilimitada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Indique quantas pessoas quiser e ganhe comissões de toda a sua rede em profundidade.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800 rounded-lg p-12 mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-bold text-white mb-2">Registre-se</h4>
              <p className="text-slate-400 text-sm">Crie sua conta e receba seu código único de afiliado</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-bold text-white mb-2">Compartilhe</h4>
              <p className="text-slate-400 text-sm">Distribua seu link único com amigos e seguidores</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-bold text-white mb-2">Ganhe</h4>
              <p className="text-slate-400 text-sm">Receba comissões de cada venda realizada</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">4</span>
              </div>
              <h4 className="font-bold text-white mb-2">Escale</h4>
              <p className="text-slate-400 text-sm">Indique outros afiliados e ganhe em profundidade</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de afiliados que estão ganhando dinheiro com nosso programa
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              asChild
              className="gap-2 bg-white text-indigo-600 hover:bg-slate-100"
            >
              <a href={getLoginUrl()}>
                Registrar Agora <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-slate-400">
          <p>&copy; 2026 N.OS Affiliate System. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
