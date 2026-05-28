import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ensureAffiliateMarketplaceProfile } from "@/lib/nexus-marketplace";

interface FormState {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  sponsorCode: string;
  acceptTerms: boolean;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  password: "",
  confirmPassword: "",
  sponsorCode: "",
  acceptTerms: false,
};

const STEPS = [
  {
    number: 1,
    title: "Identificação",
    description: "Comece pelo essencial",
    icon: User,
  },
  {
    number: 2,
    title: "Segurança",
    description: "Defina seu acesso",
    icon: Shield,
  },
  {
    number: 3,
    title: "Confirmação",
    description: "Patrocinador e termos",
    icon: CheckCircle2,
  },
] as const;

const BENEFITS = [
  "Painel completo do afiliado com métricas em tempo real",
  "Marketplace integrado com Hotmart, Shopee e Mercado Livre",
  "Agentes IA operacionais para conteúdo, prospecção e follow-up",
  "Rede binária com comissionamento transparente",
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const { loginAsDemo } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const validateStep = (current: 1 | 2 | 3): string | null => {
    if (current === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 3) {
        return "Nome completo obrigatório (mínimo 3 caracteres).";
      }
      if (!isValidEmail(formData.email)) {
        return "E-mail inválido.";
      }
      if (formData.phone.replace(/\D/g, "").length < 10) {
        return "Telefone inválido (mínimo 10 dígitos).";
      }
      if (!isValidCpf(formData.cpf)) {
        return "CPF inválido (11 dígitos).";
      }
      return null;
    }
    if (current === 2) {
      if (formData.password.length < 8) {
        return "Senha precisa ter ao menos 8 caracteres.";
      }
      if (formData.password !== formData.confirmPassword) {
        return "Confirmação de senha não confere.";
      }
      return null;
    }
    if (current === 3) {
      if (!formData.acceptTerms) {
        return "Você precisa aceitar os termos para continuar.";
      }
      return null;
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    setStep((current) => (current < 3 ? ((current + 1) as 1 | 2 | 3) : current));
  };

  const handlePrevious = () => {
    setErrorMessage(null);
    setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3) : current));
  };

  const handleSubmit = async () => {
    const error = validateStep(3);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await loginAsDemo("affiliate", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ""),
      });
      ensureAffiliateMarketplaceProfile({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: formData.cpf.replace(/\D/g, ""),
      });
      setLocation("/marketplaces");
    } catch (submitError) {
      setErrorMessage(
        submitError instanceof Error ? submitError.message : "Erro ao concluir cadastro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (() => {
    const password = formData.password;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  })();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-purple/10 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start">
          {/* Lado esquerdo · valor da plataforma */}
          <div className="space-y-6 lg:sticky lg:top-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar para a Home
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple">
                <Zap className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">IOAID · SaaS</h1>
                <p className="text-xs text-text-secondary font-mono uppercase tracking-widest">
                  Nexus Affil'IA'te
                </p>
              </div>
            </div>

            <p className="text-base text-text-secondary max-w-md">
              Crie sua conta de afiliado em 3 passos e ganhe acesso imediato ao ecossistema
              completo de tecnologia e governança comercial.
            </p>

            <div className="space-y-3 max-w-md">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-xs text-text-secondary max-w-md">
              <p className="flex items-center gap-2 text-foreground font-medium mb-1">
                <Sparkles className="h-4 w-4 text-accent-purple" /> Test-drive da plataforma
              </p>
              <p>
                Este cadastro cria uma conta operacional. Você sai do cadastro com acesso ao
                painel, marketplace e agentes IA prontos para uso.
              </p>
            </div>
          </div>

          {/* Lado direito · formulário em steps */}
          <Card className="border-accent/30 bg-card/60 backdrop-blur-md shadow-2xl">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Stepper visual */}
              <div className="flex items-center justify-between">
                {STEPS.map((stepInfo, index) => {
                  const isActive = step === stepInfo.number;
                  const isComplete = step > stepInfo.number;
                  return (
                    <div key={stepInfo.number} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                            isActive
                              ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                              : isComplete
                                ? "border-accent-green bg-accent-green/20 text-accent-green"
                                : "border-border bg-background text-text-secondary"
                          }`}
                        >
                          {isComplete ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <stepInfo.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className="mt-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                          {stepInfo.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition ${
                            step > stepInfo.number ? "bg-accent-green" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  {STEPS[step - 1].title}
                </h2>
                <p className="text-sm text-text-secondary">{STEPS[step - 1].description}</p>
              </div>

              {/* STEP 1 · Identificação */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="João Pereira da Silva"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail principal</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="voce@email.com"
                        autoComplete="email"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                          placeholder="(19) 99269-1954"
                          autoComplete="tel"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => updateField("cpf", formatCpf(e.target.value))}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 · Segurança */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                    />
                    {formData.password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`h-1 flex-1 rounded-full transition ${
                                passwordStrength >= bar
                                  ? passwordStrength === 1
                                    ? "bg-red-500"
                                    : passwordStrength === 2
                                      ? "bg-yellow-500"
                                      : passwordStrength === 3
                                        ? "bg-accent-cyan"
                                        : "bg-accent-green"
                                  : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-text-secondary">
                          {passwordStrength <= 1 && "Senha fraca — adicione números e símbolos."}
                          {passwordStrength === 2 && "Senha média — considere adicionar maiúsculas."}
                          {passwordStrength === 3 && "Senha boa — quase forte."}
                          {passwordStrength === 4 && "Senha forte ✓"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-[11px] text-text-secondary">
                    <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                      <Shield className="h-3 w-3 text-accent-cyan" /> Sua senha fica criptografada
                    </p>
                    <p>Nunca enviamos sua senha em texto puro. Use uma senha única e robusta.</p>
                  </div>
                </div>
              )}

              {/* STEP 3 · Confirmação */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sponsorCode">Código do patrocinador (opcional)</Label>
                    <Input
                      id="sponsorCode"
                      value={formData.sponsorCode}
                      onChange={(e) => updateField("sponsorCode", e.target.value.toUpperCase())}
                      placeholder="NEXUS-XXXX"
                    />
                    <p className="text-[11px] text-text-secondary">
                      Se você foi indicado por um afiliado, informe o código dele para vincular a
                      indicação.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Resumo do cadastro</p>
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>
                        <strong className="text-foreground">Nome:</strong> {formData.name || "—"}
                      </p>
                      <p>
                        <strong className="text-foreground">E-mail:</strong> {formData.email || "—"}
                      </p>
                      <p>
                        <strong className="text-foreground">Telefone:</strong>{" "}
                        {formData.phone || "—"}
                      </p>
                      <p>
                        <strong className="text-foreground">CPF:</strong> {formData.cpf || "—"}
                      </p>
                      <p>
                        <strong className="text-foreground">Patrocinador:</strong>{" "}
                        {formData.sponsorCode || "Sem indicação"}
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border/60 bg-background/40 p-3 hover:border-accent-cyan/40 transition">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateField("acceptTerms", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border text-accent-cyan"
                    />
                    <span className="text-xs text-text-secondary">
                      Li e aceito os{" "}
                      <a href="/termos" className="text-accent-cyan hover:underline">
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a href="/privacidade" className="text-accent-cyan hover:underline">
                        Política de Privacidade
                      </a>{" "}
                      da Nexus Affil'IA'te.
                    </span>
                  </label>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {step > 1 ? (
                  <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                  </Button>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs text-text-secondary hover:text-foreground"
                  >
                    Já tem conta? Entrar
                  </Link>
                )}
                {step < 3 ? (
                  <Button onClick={handleNext} className="gradient-btn">
                    Continuar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.acceptTerms}
                    className="gradient-btn"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {isSubmitting ? "Criando conta..." : "Concluir cadastro"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
