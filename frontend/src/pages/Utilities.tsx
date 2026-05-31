import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  Check,
  Copy,
  Hash,
  Link2,
  QrCode,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type CategoryKey = "calculators" | "generators";

interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  inputs: { label: string; placeholder: string; suffix?: string }[];
  calculate: (values: number[]) => { result: string; breakdown: string[] };
}

const CALCULATORS: CalculatorConfig[] = [
  {
    id: "commission",
    name: "Calculadora de Comissão",
    description: "Estima sua comissão com base no volume de vendas e no nível atual.",
    icon: TrendingUp,
    inputs: [
      { label: "Valor da venda (R$)", placeholder: "1000" },
      { label: "Nível de carreira (1-15)", placeholder: "5" },
    ],
    calculate: ([sale, level]) => {
      const base = sale * 0.1;
      const bonusPct = Math.min(level * 2, 50);
      const total = base * (1 + bonusPct / 100);
      return {
        result: `R$ ${total.toFixed(2)}`,
        breakdown: [
          `Comissão base (10%): R$ ${base.toFixed(2)}`,
          `Bônus por nível (${bonusPct}%): R$ ${(total - base).toFixed(2)}`,
          `Total estimado: R$ ${total.toFixed(2)}`,
        ],
      };
    },
  },
  {
    id: "network",
    name: "Calculadora de Rede",
    description: "Projeta o crescimento da sua rede a partir dos diretos.",
    icon: Users,
    inputs: [
      { label: "Afiliados diretos", placeholder: "10" },
      { label: "Profundidade (níveis)", placeholder: "3" },
      { label: "Taxa de conversão (%)", placeholder: "25" },
    ],
    calculate: ([direct, depth, rate]) => {
      const total = direct * Math.pow(1 + rate / 100, depth);
      const active = total * (rate / 100);
      return {
        result: `${Math.round(total)} afiliados potenciais`,
        breakdown: [
          `Rede direta: ${direct} afiliados`,
          `Profundidade: ${depth} níveis`,
          `Taxa de conversão: ${rate}%`,
          `Afiliados ativos estimados: ${Math.round(active)}`,
        ],
      };
    },
  },
  {
    id: "xp",
    name: "Calculadora de XP",
    description: "Quanto XP falta para você alcançar o próximo nível.",
    icon: Zap,
    inputs: [
      { label: "XP atual", placeholder: "5000" },
      { label: "XP do próximo nível", placeholder: "10000" },
      { label: "Média mensal de XP", placeholder: "2500" },
    ],
    calculate: ([currentXp, targetXp, monthlyRate]) => {
      const remaining = Math.max(0, targetXp - currentXp);
      const months = monthlyRate > 0 ? remaining / monthlyRate : Infinity;
      return {
        result: `${Math.round(remaining).toLocaleString("pt-BR")} XP para o próximo nível`,
        breakdown: [
          `XP atual: ${currentXp.toLocaleString("pt-BR")}`,
          `XP alvo: ${targetXp.toLocaleString("pt-BR")}`,
          `Média mensal: ${monthlyRate.toLocaleString("pt-BR")} XP`,
          Number.isFinite(months)
            ? `Estimativa: ${months.toFixed(1)} meses até atingir o nível`
            : "Defina uma média mensal para estimar o tempo restante.",
        ],
      };
    },
  },
];

interface GeneratorConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  fields: { label: string; placeholder: string; defaultValue?: string }[];
  generate: (values: Record<string, string>) => string;
}

const GENERATORS: GeneratorConfig[] = [
  {
    id: "tracking",
    name: "Gerador de link UTM",
    description: "Cria links com parâmetros UTM para campanhas.",
    icon: Link2,
    fields: [
      { label: "URL base", placeholder: "https://oneverso.com.br/afiliado/SEU-ID" },
      { label: "Campanha", placeholder: "lancamento_pack_a2" },
      { label: "Fonte", placeholder: "instagram", defaultValue: "organic" },
      { label: "Canal", placeholder: "social", defaultValue: "affiliate" },
    ],
    generate: (values) => {
      const base = values["URL base"] || "";
      if (!base) return "";
      const params = new URLSearchParams();
      if (values["Campanha"]) params.set("utm_campaign", values["Campanha"]);
      if (values["Fonte"]) params.set("utm_source", values["Fonte"]);
      if (values["Canal"]) params.set("utm_medium", values["Canal"]);
      params.set("ref", "afiliado");
      return `${base}?${params.toString()}`;
    },
  },
  {
    id: "shortcode",
    name: "Gerador de Short Code",
    description: "Cria identificadores curtos para rastreamento.",
    icon: Hash,
    fields: [
      { label: "Prefixo", placeholder: "NX", defaultValue: "NX" },
      { label: "Identificador", placeholder: "12345" },
    ],
    generate: (values) => {
      const prefix = values["Prefixo"] || "NX";
      const id = values["Identificador"] || "0001";
      const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${prefix}-${id}-${timestamp}${random}`;
    },
  },
  {
    id: "qrcode",
    name: "Link para QR Code",
    description: "Gera uma URL pronta para criar um QR Code do seu link.",
    icon: QrCode,
    fields: [
      { label: "URL do mini-site", placeholder: "https://oneverso.com.br/afiliado/SEU-ID" },
      { label: "Tamanho", placeholder: "200", defaultValue: "200" },
    ],
    generate: (values) => {
      const url = values["URL do mini-site"] || "";
      if (!url) return "";
      const size = values["Tamanho"] || "200";
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    },
  },
];

export default function Utilities() {
  const [category, setCategory] = useState<CategoryKey>("calculators");
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [calcValues, setCalcValues] = useState<Record<string, string>>({});
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [calcBreakdown, setCalcBreakdown] = useState<string[]>([]);
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [genValues, setGenValues] = useState<Record<string, string>>({});
  const [genResult, setGenResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCalculator = (calc: CalculatorConfig) => {
    const values = calc.inputs.map((_, idx) => {
      const raw = calcValues[`${calc.id}-${idx}`] ?? "";
      const parsed = Number.parseFloat(raw.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : 0;
    });
    const result = calc.calculate(values);
    setCalcResult(result.result);
    setCalcBreakdown(result.breakdown);
  };

  const handleGenerator = (gen: GeneratorConfig) => {
    const result = gen.generate(genValues);
    setGenResult(result || "Preencha os campos para gerar o resultado.");
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,255,178,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                Ferramentas
              </Badge>
              <Badge className="border border-white/10 bg-white/5 text-slate-200">Operação rápida</Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Utilidades para sua operação
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Pequenas ferramentas para acelerar o dia a dia comercial: calculadoras, geradores de links e atalhos úteis.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {([
            { id: "calculators", label: "Calculadoras", icon: Calculator },
            { id: "generators", label: "Geradores", icon: Link2 },
          ] as { id: CategoryKey; label: string; icon: React.ElementType }[]).map((tab) => {
            const Icon = tab.icon;
            const isActive = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? "border-quantum-cyan/60 bg-quantum-cyan/15 text-quantum-cyan"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {category === "calculators" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {CALCULATORS.map((calc) => {
                const Icon = calc.icon;
                const isActive = activeCalculator === calc.id;
                return (
                  <button
                    key={calc.id}
                    type="button"
                    onClick={() => {
                      setActiveCalculator(calc.id);
                      setCalcValues({});
                      setCalcResult(null);
                      setCalcBreakdown([]);
                    }}
                    className={`rounded-2xl border p-5 text-left transition ${
                      isActive
                        ? "border-quantum-cyan/40 bg-quantum-cyan/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Icon className="h-8 w-8 text-quantum-cyan" />
                    <p className="mt-3 text-base font-semibold text-white">{calc.name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{calc.description}</p>
                  </button>
                );
              })}
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeCalculator ? CALCULATORS.find((c) => c.id === activeCalculator)?.name : "Escolha uma calculadora"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {activeCalculator
                    ? "Preencha os campos abaixo para visualizar o resultado."
                    : "Selecione uma das calculadoras ao lado para começar."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCalculator && (
                  <>
                    {CALCULATORS.find((c) => c.id === activeCalculator)!.inputs.map((input, idx) => (
                      <div key={`${activeCalculator}-${idx}`} className="space-y-1.5">
                        <Label>{input.label}</Label>
                        <Input
                          type="number"
                          value={calcValues[`${activeCalculator}-${idx}`] ?? ""}
                          placeholder={input.placeholder}
                          onChange={(event) =>
                            setCalcValues((current) => ({
                              ...current,
                              [`${activeCalculator}-${idx}`]: event.target.value,
                            }))
                          }
                          className="border-white/10 bg-white/5 text-white"
                        />
                      </div>
                    ))}
                    <Button
                      className="gradient-btn w-full"
                      onClick={() => handleCalculator(CALCULATORS.find((c) => c.id === activeCalculator)!)}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Calcular
                    </Button>

                    {calcResult && (
                      <div className="rounded-2xl border border-quantum-lime/30 bg-quantum-lime/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-quantum-lime">Resultado</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => handleCopy(calcResult, "calc-result")}
                          >
                            {copiedId === "calc-result" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copiedId === "calc-result" ? "Copiado" : "Copiar"}
                          </Button>
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{calcResult}</p>
                        <ul className="mt-3 space-y-1 text-sm text-slate-300">
                          {calcBreakdown.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {category === "generators" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {GENERATORS.map((gen) => {
                const Icon = gen.icon;
                const isActive = activeGenerator === gen.id;
                return (
                  <button
                    key={gen.id}
                    type="button"
                    onClick={() => {
                      setActiveGenerator(gen.id);
                      const defaults: Record<string, string> = {};
                      gen.fields.forEach((field) => {
                        if (field.defaultValue) defaults[field.label] = field.defaultValue;
                      });
                      setGenValues(defaults);
                      setGenResult(null);
                    }}
                    className={`rounded-2xl border p-5 text-left transition ${
                      isActive
                        ? "border-quantum-cyan/40 bg-quantum-cyan/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <Icon className="h-8 w-8 text-quantum-purple" />
                    <p className="mt-3 text-base font-semibold text-white">{gen.name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{gen.description}</p>
                  </button>
                );
              })}
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeGenerator ? GENERATORS.find((g) => g.id === activeGenerator)?.name : "Escolha um gerador"}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {activeGenerator
                    ? "Preencha os campos abaixo para gerar o resultado."
                    : "Selecione um dos geradores ao lado para começar."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeGenerator && (
                  <>
                    {GENERATORS.find((g) => g.id === activeGenerator)!.fields.map((field, idx) => (
                      <div key={`${activeGenerator}-${idx}`} className="space-y-1.5">
                        <Label>{field.label}</Label>
                        <Input
                          value={genValues[field.label] ?? field.defaultValue ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setGenValues((current) => ({ ...current, [field.label]: event.target.value }))
                          }
                          className="border-white/10 bg-white/5 text-white"
                        />
                      </div>
                    ))}
                    <Button
                      className="gradient-btn w-full"
                      onClick={() => handleGenerator(GENERATORS.find((g) => g.id === activeGenerator)!)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Gerar resultado
                    </Button>

                    {genResult && (
                      <div className="rounded-2xl border border-quantum-purple/30 bg-quantum-purple/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-quantum-purple">Resultado</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => handleCopy(genResult, "gen-result")}
                          >
                            {copiedId === "gen-result" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copiedId === "gen-result" ? "Copiado" : "Copiar"}
                          </Button>
                        </div>
                        <pre className="mt-3 whitespace-pre-wrap break-all rounded-xl bg-black/30 p-3 text-xs text-quantum-purple">
                          {genResult}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
