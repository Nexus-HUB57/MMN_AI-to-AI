import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Shield, User, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const ADMIN_EMAIL = "lucasmpthomaz@gmail.com";

export default function Login() {
  const { isAuthenticated, login, loginAsDemo, user } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "affiliate";

  const [email, setEmail] = useState(initialMode === "admin" ? ADMIN_EMAIL : "");
  const [name, setName] = useState(initialMode === "admin" ? "Lucas Thomaz" : "");
  const [mode, setMode] = useState<"admin" | "affiliate">(initialMode);

  const getReturnPath = () => {
    const from = searchParams.get("from");
    if (from) return from;
    return mode === "admin" ? "/admin/dashboard" : "/dashboard";
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fallbackPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      setLocation(searchParams.get("from") || fallbackPath);
    }
  }, [isAuthenticated, searchParams, setLocation, user]);

  const handleQuickAccess = async (nextMode: "admin" | "affiliate") => {
    const nextUser = await loginAsDemo(
      nextMode,
      nextMode === "admin"
        ? { name: "Lucas Thomaz", email: ADMIN_EMAIL }
        : undefined,
    );
    setLocation(searchParams.get("from") || (nextUser.role === "admin" ? "/admin/dashboard" : "/dashboard"));
  };

  const handleCredentialAccess = async () => {
    const nextUser = await login({
      email,
      name,
      role: mode,
    });
    setLocation(searchParams.get("from") || (nextUser.role === "admin" ? "/admin/dashboard" : "/dashboard"));
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
                  <Zap className="w-6 h-6 text-background" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">MMNAI</h1>
              </div>
              <p className="text-text-secondary text-lg max-w-md">
                Acesso rápido para revisão da homepage, backoffice do usuário e backoffice administrativo.
              </p>
            </div>

            <div className="space-y-5 max-w-xl">
              <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
                <p className="text-sm font-semibold text-accent-cyan">Acesso usuário</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Fluxo recomendado para revisar cadastro, login e painel do afiliado.
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10" onClick={() => handleQuickAccess("affiliate") }>
                    <User className="w-4 h-4 mr-2" />
                    Entrar como usuário
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-5">
                <p className="text-sm font-semibold text-accent-purple">Acesso administrador</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Revisão do backoffice admin usando o perfil <strong>Lucas Thomaz</strong> ({ADMIN_EMAIL}).
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="border-accent-purple/40 text-accent-purple hover:bg-accent-purple/10" onClick={() => handleQuickAccess("admin") }>
                    <Shield className="w-4 h-4 mr-2" />
                    Entrar como administrador
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Homepage com atalhos para login e revisão dos painéis",
                  "Cadastro agora redireciona para o backoffice do usuário",
                  "Login comuta entre perfil afiliado e administrador",
                  "Backoffice admin validado para Lucas Thomaz",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent-green"></span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <Card className="border-accent/30 bg-card/50 backdrop-blur-md shadow-2xl">
              <div className="p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Acessar ambiente</h3>
                  <p className="text-text-secondary">
                    Escolha o perfil para validar o fluxo e abrir o painel correspondente.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-background/60 p-2 border border-border/60">
                  <Button
                    type="button"
                    variant={mode === "affiliate" ? "default" : "ghost"}
                    className={mode === "affiliate" ? "gradient-btn" : "text-text-secondary"}
                    onClick={() => {
                      setMode("affiliate");
                      if (email === ADMIN_EMAIL) setEmail("");
                      if (name === "Lucas Thomaz") setName("");
                    }}
                  >
                    Usuário
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "admin" ? "default" : "ghost"}
                    className={mode === "admin" ? "gradient-btn" : "text-text-secondary"}
                    onClick={() => {
                      setMode("admin");
                      setEmail(ADMIN_EMAIL);
                      setName("Lucas Thomaz");
                    }}
                  >
                    Admin
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={mode === "admin" ? "Lucas Thomaz" : "Nome do usuário"}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={mode === "admin" ? ADMIN_EMAIL : "usuario@demo.mmn.ai"}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
                  <p className="font-medium text-foreground">Destino após login</p>
                  <p className="mt-1">{getReturnPath()}</p>
                </div>

                <div className="grid gap-3">
                  <Button onClick={handleCredentialAccess} className="w-full h-12 gradient-btn text-base font-semibold">
                    Entrar e abrir painel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAccess(mode)}
                    className="w-full border-border hover:bg-muted"
                  >
                    Acesso rápido do perfil atual
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
