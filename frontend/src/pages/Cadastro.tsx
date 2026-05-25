import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Check, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const { loginAsDemo } = useAuth();
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    sponsorCode: "",
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.name || !formData.cpf)) {
      setErrorMessage("Preencha nome completo e CPF para continuar.");
      return;
    }

    if (step === 2 && (!formData.email || !formData.phone)) {
      setErrorMessage("Preencha e-mail e telefone para continuar.");
      return;
    }

    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!formData.password || formData.password.length < 8) {
      setErrorMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("A confirmação de senha não confere.");
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage("Aceite os termos para finalizar o cadastro.");
      return;
    }

    await loginAsDemo("affiliate", {
      name: formData.name,
      email: formData.email,
    });

    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
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
                Junte-se à revisão funcional da plataforma e siga direto para o backoffice do usuário.
              </p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Crie sua conta e entre no painel</h2>
                <p className="text-text-secondary">
                  O fluxo de cadastro agora conclui a validação local e abre o dashboard do afiliado para revisão imediata.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: "✓", title: "Cadastro guiado", desc: "Fluxo em 3 etapas com validação básica" },
                  { icon: "✓", title: "Acesso imediato", desc: "Redirecionamento automático para /dashboard" },
                  { icon: "✓", title: "Backoffice revisável", desc: "Painel do usuário pronto para inspeção visual" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center text-sm flex-shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <Card className="border-accent/30 bg-card/50 backdrop-blur-md shadow-2xl">
              <div className="p-8 sm:p-10">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            s <= step ? "bg-accent-cyan text-background" : "bg-muted text-text-muted"
                          }`}
                        >
                          {s < step ? <Check className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && (
                          <div
                            className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                              s < step ? "bg-accent-cyan" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Dados</span>
                    <span className="hidden sm:block">Contato</span>
                    <span>Segurança</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {step === 1 && "Dados Pessoais"}
                    {step === 2 && "Informações de Contato"}
                    {step === 3 && "Segurança"}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {step === 1 && "Informe seus dados para abrir a conta de revisão"}
                    {step === 2 && "Precisamos do contato para personalizar o painel"}
                    {step === 3 && "Finalize o acesso local ao backoffice do usuário"}
                  </p>
                </div>

                <div className="space-y-4">
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" name="name" type="text" placeholder="Seu nome completo" value={formData.name} onChange={handleChange} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" name="cpf" type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sponsorCode">Código do Patrocinador (opcional)</Label>
                        <Input id="sponsorCode" name="sponsorCode" type="text" placeholder="Código do seu patrocinador" value={formData.sponsorCode} onChange={handleChange} className="bg-background" />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange} className="bg-background" />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} className="bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={handleChange} className="bg-background" />
                      </div>
                      <div className="flex items-start gap-2 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                        <input type="checkbox" id="acceptTerms" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} className="mt-1" />
                        <Label htmlFor="acceptTerms" className="text-sm text-text-secondary cursor-pointer">
                          Eu aceito os <a href="#" className="text-accent-cyan hover:underline">Termos de Uso</a> e a <a href="#" className="text-accent-cyan hover:underline">Política de Privacidade</a>
                        </Label>
                      </div>
                    </>
                  )}

                  {errorMessage && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    {step > 1 && (
                      <Button onClick={handlePrevStep} variant="outline" className="flex-1">
                        Voltar
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button onClick={handleNextStep} className="flex-1 gradient-btn">
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} className="flex-1 gradient-btn" disabled={!formData.acceptTerms}>
                        Finalizar Cadastro
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-text-secondary">
                    Já tem uma conta? <a href="/login" className="text-accent-cyan hover:underline">Fazer login</a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
