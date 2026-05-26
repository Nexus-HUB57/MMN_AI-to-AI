import { useAuth, ADMIN_EMAIL } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Shield, User, Zap, Lock, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { loadMarketplaceProfile } from "@/lib/nexus-marketplace";

export default function Login() {
  const { isAuthenticated, login, loginAsDemo, loginAdmin, user } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = useMemo(
    () => (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()),
    [],
  );
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "affiliate";

  const [mode, setMode] = useState<"admin" | "affiliate">(initialMode);
  const [email, setEmail] = useState(initialMode === "admin" ? ADMIN_EMAIL : "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAffiliateEntryPath = () => {
    const profile = loadMarketplaceProfile();
    return profile.activePackSlugs.length === 0 ? "/marketplaces" : "/dashboard";
  };

  const getReturnPath = () =>
    searchParams.get("from") ??
    (mode === "admin" ? "/admin/dashboard" : getAffiliateEntryPath());

  useEffect(() => {
    if (isAuthenticated) {
      const fallbackPath = user?.role === "admin" ? "/admin/dashboard" : getAffiliateEntryPath();
      setLocation(searchParams.get("from") || fallbackPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAffiliateQuickAccess = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const nextUser = await loginAsDemo("affiliate");
      setLocation(searchParams.get("from") || getAffiliateEntryPath());
      void nextUser;
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginAdmin(email, password);
      setLocation(searchParams.get("from") || "/admin/dashboard");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAffiliateLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login({ email, name, role: "affiliate" });
      setLocation(searchParams.get("from") || getAffiliateEntryPath());
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "admin") return handleAdminLogin();
    return handleAffiliateLogin();
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
                Acesso ao painel do afiliado e ao backoffice administrativo restrito.
              </p>
            </div>

            <div className="space-y-5 max-w-xl">
              <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
                <p className="text-sm font-semibold text-accent-cyan">Acesso usuário</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Painel completo do afiliado: marketplace, packs, agentes, recompensas e mais.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
                    onClick={handleAffiliateQuickAccess}
                    disabled={isSubmitting}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Entrar como usuário (demo)
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-accent-purple">
                  <Lock className="h-4 w-4" /> Acesso administrador (restrito)
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Backoffice administrativo é exclusivo do administrador <strong>Lucas Thomaz</strong> ({ADMIN_EMAIL}). Acesso requer e-mail e senha.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Cadastro redireciona automaticamente para o Marketplace",
                  "Acesso de afiliado libera apenas o Pack A² inicialmente",
                  "Backoffice admin protegido por senha e e-mail registrado",
                  "Sessão persistida com checagem de integridade do papel",
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
                    {mode === "admin"
                      ? "Insira o e-mail e a senha do administrador para abrir o backoffice."
                      : "Acesse o painel do afiliado para gerenciar agentes e marketplace."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-background/60 p-2 border border-border/60">
                  <Button
                    type="button"
                    variant={mode === "affiliate" ? "default" : "ghost"}
                    className={mode === "affiliate" ? "gradient-btn" : "text-text-secondary"}
                    onClick={() => {
                      setMode("affiliate");
                      setPassword("");
                      setErrorMessage(null);
                      if (email === ADMIN_EMAIL) setEmail("");
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
                      setErrorMessage(null);
                    }}
                  >
                    Admin
                  </Button>
                </div>

                <div className="space-y-4">
                  {mode === "affiliate" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Nome do usuário"
                        className="bg-background"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={mode === "admin" ? ADMIN_EMAIL : "usuario@demo.mmn.ai"}
                      className="bg-background"
                      autoComplete="email"
                    />
                  </div>
                  {mode === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Senha do administrador"
                        className="bg-background"
                        autoComplete="current-password"
                      />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm text-text-secondary">
                  <p className="font-medium text-foreground">Destino após login</p>
                  <p className="mt-1">{getReturnPath()}</p>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 gradient-btn text-base font-semibold"
                  >
                    {mode === "admin" ? <Shield className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                    {mode === "admin" ? "Entrar no backoffice admin" : "Entrar no painel do afiliado"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {mode === "affiliate" && (
                    <Button
                      variant="outline"
                      onClick={handleAffiliateQuickAccess}
                      disabled={isSubmitting}
                      className="w-full border-border hover:bg-muted"
                    >
                      Acesso rápido (demo)
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
