import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { loadMarketplaceProfile } from "@/lib/nexus-marketplace";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  useAuth,
  ADMIN_ACCESS_LABEL,
  ADMIN_RESTRICTED_NOTICE,
} from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Shield, User, Zap, Lock, AlertTriangle } from "lucide-react";

function SocialLoginDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border/60" />
      <span className="text-xs text-text-secondary">ou continue com</span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

interface SocialLoginButtonsProps {
  disabled?: boolean;
}

function SocialLoginButtons({ disabled }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();

  const handleSocial = async (provider: "Google" | "Facebook" | "Apple") => {
    setSocialError(null);
    setLoading(provider);
    try {
      const { signInWithGoogle, signInWithFacebook, signInWithApple } = await import("@/lib/firebase");
      const signInFn = provider === "Google" ? signInWithGoogle : provider === "Facebook" ? signInWithFacebook : signInWithApple;
      const profile = await signInFn();

      let socialPayload: {
        provider: "Google" | "Facebook" | "Apple";
        uid: string;
        email: string | null;
        sessionId: string;
        tokenId: string;
        user: { id: number; name: string | null; email: string | null; role: string; picture?: string | null };
      };

      try {
        const { trpc: trpcClient } = await import("@/lib/trpc");
        const session = await trpcClient.auth.loginWithFirebaseToken.mutate({
          idToken: profile.idToken,
          provider: profile.provider,
        });

        socialPayload = {
          provider,
          uid: profile.uid,
          email: profile.email,
          sessionId: session.sessionId,
          tokenId: session.tokenId,
          user: session.user,
        };
      } catch {
        socialPayload = {
          provider,
          uid: profile.uid,
          email: profile.email,
          sessionId: `local-social-${profile.provider}-${profile.uid}`,
          tokenId: `local-token-${Date.now()}`,
          user: {
            id: Date.now(),
            name: profile.displayName ?? profile.email ?? `${provider} User`,
            email: profile.email,
            role: "affiliate",
            picture: profile.photoURL,
          },
        };
      }

      window.dispatchEvent(
        new CustomEvent("mmn:social-login", {
          detail: socialPayload,
        }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSocialError(msg.includes("não está instalado") || msg.includes("não configurado")
        ? `Login social requer configuração Firebase. Contate o administrador.`
        : `Erro ao entrar com ${provider}: ${msg.split('\n')[0]}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      {!firebaseReady && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-200">
          Login social em ativação segura. Google, Facebook e Apple serão liberados assim que a configuração Firebase for concluída.
        </div>
      )}
      {socialError && (
        <p className="text-xs text-red-500 text-center">{socialError}</p>
      )}
      {firebaseReady && (
        <p className="text-[11px] text-center text-text-secondary">
          Se a validação server-side estiver indisponível, o acesso social continua em modo seguro local para o painel do afiliado.
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 border-border/60 text-text-secondary hover:border-[#4285F4]/60 hover:text-[#4285F4] hover:bg-[#4285F4]/5 transition-colors"
        disabled={disabled || !!loading || !firebaseReady}
        onClick={() => {
          if (firebaseReady) void handleSocial("Google");
        }}
        title={firebaseReady ? "Entrar com Google" : "Login Google indisponível até a configuração do Firebase"}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="sr-only sm:not-sr-only text-xs">Google</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 border-border/60 text-text-secondary hover:border-[#1877F2]/60 hover:text-[#1877F2] hover:bg-[#1877F2]/5 transition-colors"
        disabled={disabled || !!loading || !firebaseReady}
        onClick={() => {
          if (firebaseReady) void handleSocial("Facebook");
        }}
        title={firebaseReady ? "Entrar com Facebook" : "Login Facebook indisponível até a configuração do Firebase"}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1877F2]" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="sr-only sm:not-sr-only text-xs">Facebook</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 border-border/60 text-text-secondary hover:border-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
        disabled={disabled || !!loading || !firebaseReady}
        onClick={() => {
          if (firebaseReady) void handleSocial("Apple");
        }}
        title={firebaseReady ? "Entrar com Apple" : "Login Apple indisponível até a configuração do Firebase"}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        <span className="sr-only sm:not-sr-only text-xs">Apple</span>
      </Button>
    </div>
    </div>
  );
}

export default function Login() {
  const { isAuthenticated, login, loginAsDemo, loginAdmin, user } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = useMemo(
    () => (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()),
    [],
  );
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "affiliate";

  const [mode, setMode] = useState<"admin" | "affiliate">(initialMode);
  const [email, setEmail] = useState("");
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
                <h1 className="text-4xl font-bold gradient-text">IOAID · SaaS</h1>
              </div>
              <p className="text-text-secondary text-lg max-w-md">
                Acesso ao Painel do Afiliado e ao BackOffice Administrador Restrito.
              </p>
            </div>

            <div className="space-y-5 max-w-xl">
              <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
                <p className="text-sm font-semibold text-accent-cyan">Acesso Afiliado</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Painel do Afiliado: Sistema, Marketplace, Packs, Agente(s), Clube de Vantagens e mais.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
                    onClick={handleAffiliateQuickAccess}
                    disabled={isSubmitting}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Conhecer o Sistema Nexus Afil&apos;IA&apos;te (Conta Demo)
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/5 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-accent-purple">
                  <Lock className="h-4 w-4" /> BackOffice Administrador Restrito
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  <strong>{ADMIN_RESTRICTED_NOTICE}</strong>. Requer e-mail e senha autorizados.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Cadastro com Redirecionamento Automático para o Backoffice",
                  "Pack Agente Afiliado A² — Pacote Inicial de Acesso",
                  "Rede Binária de Alto Fluxo e Produtos de Alta Demanda e Tendência",
                  "Sessão persistida com Checagem de Integridade do Papel",
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
                  <h3 className="text-2xl font-bold text-foreground">Acessar Ambiente Digital</h3>
                  <p className="text-text-secondary">
                    {mode === "admin"
                      ? `Insira o e-mail e a senha autorizados da ${ADMIN_ACCESS_LABEL} para abrir o BackOffice.`
                      : "Acesse o Painel do Afiliado para Gerenciar Agentes e Acessar Marketplaces."}
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
                      setEmail("");
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
                      // Não pré-preencher email/nome do administrador na UI
                      setEmail("");
                      setName("");
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
                      placeholder={mode === "admin" ? `E-mail autorizado da ${ADMIN_ACCESS_LABEL}` : "usuario@demo.mmn.ai"}
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
                    <>
                      <SocialLoginDivider />
                      <SocialLoginButtons disabled={isSubmitting} />
                    </>
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
