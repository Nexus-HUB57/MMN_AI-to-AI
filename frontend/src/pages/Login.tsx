import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { loadMarketplaceProfile } from "@/lib/nexus-marketplace";
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
  const [modal, setModal] = useState<null | { provider: "Google" | "Facebook" | "Apple" | "Microsoft"; email: string; name: string }>(null);

  const KEYS: Record<string, "google" | "facebook" | "apple" | "microsoft"> = {
    Google: "google", Facebook: "facebook", Apple: "apple", Microsoft: "microsoft",
  };

  useEffect(() => {
    if (!socialError) return;
    const tm = window.setTimeout(() => setSocialError(null), 5000);
    return () => window.clearTimeout(tm);
  }, [socialError]);

  async function submit(provider: "Google" | "Facebook" | "Apple" | "Microsoft", email: string, name: string) {
    setLoading(provider); setSocialError(null);
    try {
      const { trpc: trpcClient } = await import("@/lib/trpc");
      let session: any = null;
      try {
        session = await trpcClient.auth.socialLoginNative.mutate({
          provider: KEYS[provider], email: email.trim(), name: name.trim() || undefined,
        });
      } catch {
        session = {
          sessionId: `local-social-${provider}-${Date.now()}`,
          tokenId: `local-token-${Date.now()}`,
          user: { id: Date.now(), name: name.trim() || email.split("@")[0], email, role: "affiliate", picture: null },
        };
      }
      window.dispatchEvent(new CustomEvent("mmn:social-login", {
        detail: {
          provider, uid: `${KEYS[provider]}:${email.toLowerCase()}`, email,
          sessionId: session.sessionId, tokenId: session.tokenId, user: session.user,
        },
      }));
      setModal(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSocialError(`Nao foi possivel entrar com ${provider}: ${msg.split("\n")[0]}`);
    } finally {
      setLoading(null);
    }
  }

  function openModal(provider: "Google" | "Facebook" | "Apple" | "Microsoft") {
    let email = "";
    try { email = (document.getElementById("loginEmail") as HTMLInputElement | null)?.value ?? ""; } catch {}
    setModal({ provider, email, name: "" });
  }

  const styles: Record<string, string> = {
    Google: "hover:border-[#4285F4]/60 hover:text-[#4285F4] hover:bg-[#4285F4]/5",
    Facebook: "hover:border-[#1877F2]/60 hover:text-[#1877F2] hover:bg-[#1877F2]/5",
    Apple: "hover:border-foreground/60 hover:text-foreground hover:bg-foreground/5",
    Microsoft: "hover:border-[#0078D4]/60 hover:text-[#0078D4] hover:bg-[#0078D4]/5",
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-center text-text-secondary">
        Use o e-mail da sua conta social para entrar instantaneamente.
      </p>
      {socialError && <p className="text-xs text-red-500 text-center">{socialError}</p>}
      <div className="grid grid-cols-4 gap-2">
        <Button type="button" variant="outline" disabled={disabled || !!loading} onClick={() => openModal("Google")}
          className={`h-10 gap-2 border-border/60 text-text-secondary transition-colors ${styles.Google}`} title="Entrar com Google">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="sr-only sm:not-sr-only text-xs">Google</span>
        </Button>
        <Button type="button" variant="outline" disabled={disabled || !!loading} onClick={() => openModal("Facebook")}
          className={`h-10 gap-2 border-border/60 text-text-secondary transition-colors ${styles.Facebook}`} title="Entrar com Facebook">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1877F2]" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="sr-only sm:not-sr-only text-xs">Facebook</span>
        </Button>
        <Button type="button" variant="outline" disabled={disabled || !!loading} onClick={() => openModal("Microsoft")}
          className={`h-10 gap-2 border-border/60 text-text-secondary transition-colors ${styles.Microsoft}`} title="Entrar com Microsoft">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <rect x="2" y="2" width="9" height="9" fill="#F25022"/>
            <rect x="13" y="2" width="9" height="9" fill="#7FBA00"/>
            <rect x="2" y="13" width="9" height="9" fill="#00A4EF"/>
            <rect x="13" y="13" width="9" height="9" fill="#FFB900"/>
          </svg>
          <span className="sr-only sm:not-sr-only text-xs">Microsoft</span>
        </Button>
        <Button type="button" variant="outline" disabled={disabled || !!loading} onClick={() => openModal("Apple")}
          className={`h-10 gap-2 border-border/60 text-text-secondary transition-colors ${styles.Apple}`} title="Entrar com Apple">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          <span className="sr-only sm:not-sr-only text-xs">Apple</span>
        </Button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-quantum-cyan">Entrar com {modal.provider}</p>
              <p className="mt-1 text-sm text-slate-300">Use o e-mail da sua conta {modal.provider} para acessar o painel.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void submit(modal.provider, modal.email, modal.name); }} className="space-y-3 px-5 py-4">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-400">E-mail {modal.provider}</label>
                <input type="email" required autoFocus value={modal.email}
                  onChange={(e) => setModal((m) => m ? { ...m, email: e.target.value } : m)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white focus:border-quantum-cyan/40 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-400">Nome (opcional)</label>
                <input type="text" value={modal.name}
                  onChange={(e) => setModal((m) => m ? { ...m, name: e.target.value } : m)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-white focus:border-quantum-cyan/40 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setModal(null)}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10">Cancelar</Button>
                <Button type="submit" disabled={!!loading || !modal.email.includes("@")} className="gradient-btn font-semibold">
                  {loading ? "Entrando..." : `Entrar com ${modal.provider}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
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

  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => setErrorMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

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
  }, [isAuthenticated]);

  const handleAffiliateQuickAccess = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const nextUser = await loginAsDemo("affiliate");
      // Correção #7 — botão Demo SEMPRE entra em /marketplaces,
      // independentemente de pacotes ativos do perfil demo carregado.
      setLocation("/marketplaces");
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
      if (!email.trim()) throw new Error("Informe o e-mail cadastrado.");
      if (!password) throw new Error("Informe sua senha.");
      await login({ email, name: name.trim() || email.split("@")[0], password, role: "affiliate" });
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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,255,178,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(0,229,255,0.16),transparent_28%),linear-gradient(180deg,#020617,#0f172a)] text-foreground">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-green">
                  Loja Virtual Nexus
                </span>
                <span className="inline-flex rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-cyan">
                  Packs + E-books + Checkout
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Zap className="w-6 h-6 text-background" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">Nexus Store Access</h1>
              </div>
              <p className="text-text-secondary text-lg max-w-xl leading-8">
                Entre no ecossistema comercial com uma experiência mais premium para afiliados, biblioteca digital, packs evolutivos e acesso administrativo restrito.
              </p>
            </div>

            <div className="space-y-5 max-w-xl">
              <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 p-5">
                <p className="text-sm font-semibold text-accent-cyan">Acesso Afiliado</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Entre no painel comercial do afiliado para explorar a loja virtual, packs, e-books, estoque operacional, agente IA e atalhos de venda.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
                    onClick={handleAffiliateQuickAccess}
                    disabled={isSubmitting}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Explorar demo → Marketplaces
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
                  "Entrada guiada para Marketplace, packs, bibliotecas e checkout digital",
                  "Pack Agente Afiliado A² como porta de entrada operacional",
                  "Experiência otimizada para conversão com Pix e Mercado Pago",
                  "Sessão persistida com checagem de integridade e papel de acesso",
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
                  <h3 className="text-2xl font-bold text-foreground">Entrar no ambiente Nexus</h3>
                  <p className="text-text-secondary leading-7">
                    {mode === "admin"
                      ? `Insira o e-mail e a senha autorizados da ${ADMIN_ACCESS_LABEL} para abrir o BackOffice.`
                      : "Acesse sua Loja Virtual Nexus para gerenciar packs, e-books, agente IA, checkout e operação comercial."}
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
Afiliado
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
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="affiliate-email">E-mail</Label>
                        <Input
                          id="affiliate-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="E-mail cadastrado"
                          className="bg-background"
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="affiliate-password">Senha</Label>
                        <Input
                          id="affiliate-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Senha do afiliado"
                          className="bg-background"
                          autoComplete="current-password"
                        />
                      </div>
                    </>
                  )}
                  {mode === "admin" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="loginEmail" type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder={`E-mail autorizado da ${ADMIN_ACCESS_LABEL}`}
                          className="bg-background"
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Senha</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Senha do administrador"
                          className="bg-background"
                          autoComplete="current-password"
                        />
                      </div>
                    </>
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
                    <div className="text-center text-sm">
                      <Link href="/recuperar-senha" className="font-medium text-cyan-600 hover:underline">Esqueci minha senha</Link>
                    </div>
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
