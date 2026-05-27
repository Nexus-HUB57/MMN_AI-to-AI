import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Copy,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMarketplaceProfile } from "@/hooks/useMarketplaceProfile";
import { updateMarketplaceProfile, getLevelLabel } from "@/lib/nexus-marketplace";

type PixType = "cpf" | "email" | "telefone" | "aleatoria";

export default function AffiliateProfile() {
  const { user } = useAuth();
  const { profile, refresh } = useMarketplaceProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState(profile.cpf ?? "");
  const [pixType, setPixType] = useState<PixType>("cpf");
  const [pixKey, setPixKey] = useState(profile.pixKey ?? "");
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setCpf(profile.cpf ?? "");
    setPixKey(profile.pixKey ?? "");
  }, [user?.name, user?.email, profile.cpf, profile.pixKey]);

  const affiliateCode = (user?.id ?? "nexus-peer").slice(0, 12);
  const affiliateUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/afiliado/${affiliateCode}`
      : `/afiliado/${affiliateCode}`;

  const copyToClipboard = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateMarketplaceProfile({
      userName: name,
      userEmail: email,
      cpf,
      pixKey,
    });
    refresh();
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 3000);
  };

  const pixHelp: Record<PixType, string> = {
    cpf: "Digite somente números do CPF, sem pontos ou traços.",
    email: "Digite o e-mail cadastrado como chave PIX no seu banco.",
    telefone: "Digite o telefone no formato +55 (DDD) 99999-9999.",
    aleatoria: "Cole a chave PIX aleatória gerada pelo seu banco (UUID).",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Configurações da conta
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Meu perfil Nexus</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Atualize seus dados pessoais e a <strong className="text-quantum-cyan">chave PIX</strong> que será usada para receber as solicitações de saque (withdrawal). Os dados são vinculados ao titular pelo CPF e mantidos em conformidade com a LGPD.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">nível atual</p>
              <p className="mt-2 text-lg font-semibold text-white">{getLevelLabel(profile.currentLevel)}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-quantum-cyan" />
                Dados pessoais
              </CardTitle>
              <CardDescription className="text-slate-400">
                Informações vinculadas ao titular da conta (CPF).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nome completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> E-mail
                </Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
                <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300 inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Telefone
                </Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="bg-background" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-quantum-cyan/30 bg-quantum-cyan/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <KeyRound className="h-5 w-5 text-quantum-cyan" />
                Chave PIX para saques
              </CardTitle>
              <CardDescription className="text-slate-400">
                Esta é a chave PIX que será usada para receber suas <strong className="text-quantum-cyan">solicitações de saque (withdrawal)</strong> da carteira BeYour Banker.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de chave PIX</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["cpf", "email", "telefone", "aleatoria"] as PixType[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPixType(option)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        pixType === option
                          ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixKey" className="text-slate-300">Chave PIX</Label>
                <Input
                  id="pixKey"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder={
                    pixType === "cpf"
                      ? "000.000.000-00"
                      : pixType === "email"
                        ? "voce@exemplo.com"
                        : pixType === "telefone"
                          ? "+55 (00) 00000-0000"
                          : "00000000-0000-0000-0000-000000000000"
                  }
                  className="bg-background"
                />
                <p className="text-xs text-slate-400">{pixHelp[pixType]}</p>
              </div>
              <div className="rounded-xl border border-quantum-cyan/30 bg-quantum-cyan/5 p-3 text-sm text-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-quantum-cyan" />
                      Autorizar Saque Automático
                    </p>
                    <p className="text-xs text-slate-300">Retirada Mensal Automática.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoWithdraw}
                    onClick={() => setAutoWithdraw((v) => !v)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition ${
                      autoWithdraw
                        ? "border-quantum-cyan/60 bg-quantum-cyan/40"
                        : "border-white/15 bg-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        autoWithdraw ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300 space-y-1">
                <p className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-quantum-lime" />
                  Os saques só são processados para a chave PIX cadastrada e validada pelo titular do CPF.
                </p>
                <p className="text-slate-400">
                  As retiradas acontecem <strong className="text-slate-200">entre o dia 10 e 15 de cada mês</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5 text-quantum-cyan" />
              Seu link de indicação
            </CardTitle>
            <CardDescription className="text-slate-400">
              Compartilhe este link para indicar novos afiliados ao seu Networking Operacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={affiliateUrl} readOnly className="bg-background" />
              <Button onClick={copyToClipboard} variant="outline" className="gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10">
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-300">
            {savedAt ? (
              <span className="inline-flex items-center gap-2 text-quantum-lime">
                <CheckCircle className="h-4 w-4" /> Alterações salvas localmente.
              </span>
            ) : (
              <span className="text-slate-400">As alterações são salvas no perfil Nexus do navegador.</span>
            )}
          </p>
          <Button onClick={handleSave} className="gradient-btn">
            <Save className="mr-2 h-4 w-4" /> Salvar alterações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
