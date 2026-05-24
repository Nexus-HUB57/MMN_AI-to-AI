/**
 * Utilities - Página de Utilidades para Afiliados
 * Ferramentas úteis: calculadoras, conversores, geradores de links
 */

import { useState } from "react";
import { Link } from "wouter";
import {
  Calculator,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Code,
  Hash,
  Globe,
  QrCode,
  FileText,
  Zap,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";

type UtilityCategory = "calculators" | "generators" | "converters";

interface CalculatorConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof Calculator;
  inputs: { label: string; placeholder: string; suffix?: string }[];
  calculate: (values: number[]) => { result: string; breakdown: string[] };
}

const CALCULATORS: CalculatorConfig[] = [
  {
    id: "commission",
    name: "Calculadora de Comissão",
    description: "Calcule sua comissão estimada com base no volume de vendas",
    icon: TrendingUp,
    inputs: [
      { label: "Valor da Venda (R$)", placeholder: "1000" },
      { label: "Nível de Carreira (1-27)", placeholder: "5" },
    ],
    calculate: ([sale, level]) => {
      const baseCommission = sale * 0.1;
      const levelBonus = Math.min(level * 2, 50);
      const total = baseCommission * (1 + levelBonus / 100);
      return {
        result: `R$ ${total.toFixed(2)}`,
        breakdown: [
          `Comissão base (10%): R$ ${baseCommission.toFixed(2)}`,
          `Bônus por nível (${levelBonus}%): R$ ${(total - baseCommission).toFixed(2)}`,
          `Total estimado: R$ ${total.toFixed(2)}`,
        ],
      };
    },
  },
  {
    id: "network",
    name: "Calculadora de Rede",
    description: "Estime o tamanho da sua rede baseado na compressão",
    icon: Users,
    inputs: [
      { label: "Afiliados Diretos", placeholder: "10" },
      { label: "Nível de Profundidade", placeholder: "3" },
      { label: "Taxa de Conversão (%)", placeholder: "25" },
    ],
    calculate: ([direct, depth, rate]) => {
      const total = direct * Math.pow((1 + rate / 100), depth);
      const activeAffiliates = total * (rate / 100);
      return {
        result: `${Math.round(total)} afiliados potenciais`,
        breakdown: [
          `Rede direta: ${direct} afiliados`,
          `Profundidade máxima: ${depth} níveis`,
          `Taxa de conversão: ${rate}%`,
          `Afiliados ativos estimados: ${Math.round(activeAffiliates)}`,
        ],
      };
    },
  },
  {
    id: "xp",
    name: "Calculadora de XP",
    description: "Calcule quantos XP você precisa para o próximo nível",
    icon: Zap,
    inputs: [
      { label: "XP Atual", placeholder: "5000" },
      { label: "Nível Atual (1-27)", placeholder: "5" },
    ],
    calculate: ([currentXp, currentLevel]) => {
      const xpPerLevel = 1000 + currentLevel * 500;
      const xpNeeded = xpPerLevel - (currentXp % xpPerLevel);
      const monthlyRate = currentXp / 2;
      const monthsToNext = xpNeeded / monthlyRate;
      return {
        result: `${Math.round(xpNeeded)} XP para o próximo nível`,
        breakdown: [
          `XP atual: ${currentXp.toLocaleString()}`,
          `XP necessário por nível: ${xpPerLevel.toLocaleString()}`,
          `Média mensal: ${Math.round(monthlyRate).toLocaleString()} XP`,
          `Estimativa: ${monthsToNext.toFixed(1)} meses para progredir`,
        ],
      };
    },
  },
];

interface GeneratorConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof Link2;
  fields: { label: string; placeholder: string; defaultValue?: string }[];
  generate: (values: Record<string, string>) => string;
}

const GENERATORS: GeneratorConfig[] = [
  {
    id: "tracking",
    name: "Gerador de Link de Tracking",
    description: "Crie links de rastreamento com UTM para campanhas",
    icon: Link2,
    fields: [
      { label: "URL Base", placeholder: "https://exemplo.com/afiliado", defaultValue: "https://nxnja0f28xnc.space.minimax.io" },
      { label: "Campanha", placeholder: "instagram_verao_2024" },
      { label: "Fonte (Source)", placeholder: "instagram", defaultValue: "organic" },
      { label: "Medium", placeholder: "social", defaultValue: "affiliate" },
    ],
    generate: ({ base, campaign, source, medium }) => {
      const params = new URLSearchParams();
      params.set("utm_campaign", campaign);
      params.set("utm_source", source);
      params.set("utm_medium", medium);
      params.set("ref", "afiliado");
      return `${base}?${params.toString()}`;
    },
  },
  {
    id: "shortcode",
    name: "Gerador de Short Code",
    description: "Crie short codes únicos para tracking neural",
    icon: Hash,
    fields: [
      { label: "Prefixo", placeholder: "NX", defaultValue: "NX" },
      { label: "Afiliado ID", placeholder: "12345" },
    ],
    generate: ({ prefix, id }) => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${prefix}-${id}-${timestamp.slice(-4)}${random}`;
    },
  },
  {
    id: "qrcode",
    name: "Gerador de Link QR Code",
    description: "Crie URLs para gerar QR Codes de affiliates",
    icon: QrCode,
    fields: [
      { label: "URL do MiniSite", placeholder: "https://site.com/u/123" },
      { label: "Tamanho do QR (px)", placeholder: "200", defaultValue: "200" },
    ],
    generate: ({ url }) => {
      const encoded = encodeURIComponent(url);
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
    },
  },
];

const CONVERTERS = [
  {
    id: "currency",
    name: "Conversor de Moeda",
    description: "Converta valores entre moedas",
    icon: Globe,
    rates: { BRL: 1, USD: 5.0, EUR: 5.5 },
  },
  {
    id: "utm",
    name: "Conversor UTM",
    description: "Gere parâmetros UTM para URLs",
    icon: Code,
  },
  {
    id: "markdown",
    name: "Conversor de Markdown",
    description: "Converta texto para formato de post",
    icon: FileText,
  },
];

export default function Utilities() {
  const [activeCategory, setActiveCategory] = useState<UtilityCategory>("calculators");
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);
  const [calculatorValues, setCalculatorValues] = useState<Record<string, string>>({});
  const [calculatorResult, setCalculatorResult] = useState<string | null>(null);
  const [calculatorBreakdown, setCalculatorBreakdown] = useState<string[]>([]);

  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [generatorValues, setGeneratorValues] = useState<Record<string, string>>({});
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCalculator = (calculator: CalculatorConfig) => {
    const values = calculator.inputs.map((_, i) => parseFloat(Object.values(calculatorValues)[i] || "0") || 0);
    const result = calculator.calculate(values);
    setCalculatorResult(result.result);
    setCalculatorBreakdown(result.breakdown);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerator = (generator: GeneratorConfig) => {
    const result = generator.generate(generatorValues);
    setGeneratedResult(result);
  };

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Ferramentas</span>
          <h1>Utilidades para Afiliados</h1>
          <p className="lead compact">
            Ferramentas úteis para otimizar suas operações e campanhas.
          </p>
        </div>
        <div className="cta-row">
          <Link href="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <nav className="flex gap-2 mb-6">
        {[
          { id: "calculators" as UtilityCategory, label: "Calculadoras", icon: Calculator },
          { id: "generators" as UtilityCategory, label: "Geradores", icon: Link2 },
          { id: "converters" as UtilityCategory, label: "Conversores", icon: RefreshCw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id);
              setActiveCalculator(null);
              setActiveGenerator(null);
              setCalculatorResult(null);
              setGeneratedResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeCategory === tab.id
                ? "bg-primary text-white"
                : "bg-panel hover:bg-panel-hover"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Calculators */}
      {activeCategory === "calculators" && (
        <div className="grid gap-6">
          {/* Calculator Selection */}
          <div className="grid grid-cols-3 gap-4">
            {CALCULATORS.map(calc => {
              const Icon = calc.icon;
              return (
                <button
                  key={calc.id}
                  onClick={() => {
                    setActiveCalculator(calc.id);
                    setCalculatorResult(null);
                    setCalculatorBreakdown([]);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    activeCalculator === calc.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-panel hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">{calc.name}</h3>
                  <p className="text-sm text-muted mt-1">{calc.description}</p>
                </button>
              );
            })}
          </div>

          {/* Calculator Form */}
          {activeCalculator && (
            <section className="panel">
              <h2 className="mb-4">
                {CALCULATORS.find(c => c.id === activeCalculator)?.name}
              </h2>
              <div className="space-y-4">
                {CALCULATORS.find(c => c.id === activeCalculator)?.inputs.map((input, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1">{input.label}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={Object.values(calculatorValues)[i] || ""}
                        onChange={e => {
                          const newValues = { ...calculatorValues };
                          newValues[`calc_${i}`] = e.target.value;
                          setCalculatorValues(newValues);
                        }}
                        placeholder={input.placeholder}
                        className="flex-1 px-3 py-2 bg-panel border border-border rounded-lg focus:border-primary focus:outline-none"
                      />
                      {input.suffix && (
                        <span className="px-3 py-2 bg-muted rounded-lg text-sm">{input.suffix}</span>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => handleCalculator(CALCULATORS.find(c => c.id === activeCalculator)!)}
                  className="btn btn-primary w-full"
                >
                  <Calculator size={18} />
                  Calcular
                </button>
              </div>

              {/* Results */}
              {calculatorResult && (
                <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-success">Resultado</h3>
                    <button
                      onClick={() => copyToClipboard(calculatorResult, "calc-result")}
                      className="btn btn-sm btn-secondary"
                    >
                      {copiedId === "calc-result" ? <Check size={16} /> : <Copy size={16} />}
                      {copiedId === "calc-result" ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-success">{calculatorResult}</p>
                  <div className="mt-4 space-y-1">
                    {calculatorBreakdown.map((item, i) => (
                      <p key={i} className="text-sm text-muted">• {item}</p>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Generators */}
      {activeCategory === "generators" && (
        <div className="grid gap-6">
          {/* Generator Selection */}
          <div className="grid grid-cols-3 gap-4">
            {GENERATORS.map(gen => {
              const Icon = gen.icon;
              return (
                <button
                  key={gen.id}
                  onClick={() => {
                    setActiveGenerator(gen.id);
                    setGeneratedResult(null);
                    // Set default values
                    const defaults: Record<string, string> = {};
                    gen.fields.forEach(f => {
                      if (f.defaultValue) defaults[f.label] = f.defaultValue;
                    });
                    setGeneratorValues(defaults);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    activeGenerator === gen.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-panel hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-8 h-8 text-accent mb-2" />
                  <h3 className="font-semibold">{gen.name}</h3>
                  <p className="text-sm text-muted mt-1">{gen.description}</p>
                </button>
              );
            })}
          </div>

          {/* Generator Form */}
          {activeGenerator && (
            <section className="panel">
              <h2 className="mb-4">
                {GENERATORS.find(g => g.id === activeGenerator)?.name}
              </h2>
              <div className="space-y-4">
                {GENERATORS.find(g => g.id === activeGenerator)?.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={generatorValues[field.label] || field.defaultValue || ""}
                      onChange={e => {
                        setGeneratorValues({ ...generatorValues, [field.label]: e.target.value });
                      }}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-panel border border-border rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleGenerator(GENERATORS.find(g => g.id === activeGenerator)!)}
                  className="btn btn-primary w-full"
                >
                  <Zap size={18} />
                  Gerar
                </button>
              </div>

              {/* Generated Result */}
              {generatedResult && (
                <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent">Resultado</h3>
                    <button
                      onClick={() => copyToClipboard(generatedResult, "gen-result")}
                      className="btn btn-sm btn-secondary"
                    >
                      {copiedId === "gen-result" ? <Check size={16} /> : <Copy size={16} />}
                      {copiedId === "gen-result" ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-panel rounded-lg overflow-x-auto">
                    <code className="text-sm text-accent whitespace-nowrap">{generatedResult}</code>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Converters */}
      {activeCategory === "converters" && (
        <div className="grid gap-6">
          <div className="grid grid-cols-3 gap-4">
            {CONVERTERS.map(conv => {
              const Icon = conv.icon;
              return (
                <div
                  key={conv.id}
                  className="p-6 rounded-lg border bg-panel"
                >
                  <Icon className="w-8 h-8 text-warning mb-2" />
                  <h3 className="font-semibold">{conv.name}</h3>
                  <p className="text-sm text-muted mt-1">{conv.description}</p>
                  <span className="inline-block mt-3 text-xs pill bg-muted">
                    Em breve
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}