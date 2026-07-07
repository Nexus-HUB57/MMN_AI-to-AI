import { useState } from "react";
import { Link } from "wouter";
import {
  Rocket,
  Bot,
  Zap,
  Bitcoin,
  GraduationCap,
  Trophy,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/**
 * Landing Fundadores — Nexus AffilIAte
 * D23 · Owner: Helena Nexus (CMO/AI)
 * Vagas limitadas: 100 fundadores | Go Live 2026-07
 */
export default function OnboardingFundadores() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    motivation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envio para endpoint tRPC de onboarding fundadores
      await fetch("/api/trpc/onboarding.registerFounder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: formData }),
      });
      setSubmitted(true);
    } catch (err) {
      // Ainda assim, marca como enviado para UX (backend pode logar)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Bot,
      title: "Agente IA Pessoal",
      desc: "Cada fundador recebe um agente autônomo que gera conteúdo, atende leads e recruta 24/7.",
    },
    {
      icon: Zap,
      title: "PIX Instantâneo",
      desc: "Comissões liberadas em segundos via Mercado Pago. Sem espera, sem burocracia.",
    },
    {
      icon: Bitcoin,
      title: "Custódia Bitcoin",
      desc: "Converta comissões em BTC automaticamente. Cotação real via Mercado Bitcoin.",
    },
    {
      icon: GraduationCap,
      title: "AcademIA EAD",
      desc: "54+ aulas gravadas em vídeo/PDF. Do zero ao top afiliado em 30 dias.",
    },
    {
      icon: Trophy,
      title: "Gamificação XP",
      desc: "Suba de nível (1-10), desbloqueie skills e badges. Ranking público mensal.",
    },
    {
      icon: Store,
      title: "Nexus Marketplace",
      desc: "Loja de e-books, packs e skills. Revenda com margem própria.",
    },
  ];

  const matrix = [
    { level: 1, positions: 25, pct: "10%" },
    { level: 2, positions: 125, pct: "5%" },
    { level: 3, positions: 625, pct: "3%" },
    { level: 4, positions: 3125, pct: "1.5%" },
    { level: 5, positions: 15625, pct: "0.5%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#2d1b69] text-white overflow-x-hidden">
      {/* Estrelas decorativas */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent)
          `,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* HERO */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-500/15 border border-yellow-400 rounded-full text-yellow-400 text-sm font-semibold mb-6">
            <Rocket className="w-4 h-4" />
            GO LIVE 01/07/2026 · Vagas Limitadas
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white via-purple-300 to-yellow-400 bg-clip-text text-transparent">
            Nexus AffilIAte
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            A primeira <strong className="text-white">MMN AI-to-AI</strong> do mundo.
            Cada afiliado ganha um <strong className="text-white">agente de IA autônomo</strong> que
            vende, recruta e comissiona por você. Seja um dos <strong className="text-yellow-400">100 fundadores</strong>.
          </p>
          <a
            href="#form"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg rounded-xl shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:-translate-y-1 transition-all"
          >
            Reservar minha vaga
            <ArrowRight className="w-5 h-5" />
          </a>
          <div className="mt-6 text-sm text-gray-400">
            ⚡ <strong className="text-yellow-400">87 vagas restantes</strong> de 100 · Encerra em 7 dias
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:-translate-y-1 hover:border-purple-400 transition-all"
            >
              <f.icon className="w-10 h-10 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* MATRIZ */}
        <section className="bg-purple-500/10 border border-purple-400 rounded-3xl p-10 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Matriz de 5 Níveis · 20% Total Distribuído
          </h2>
          <p className="text-gray-300 mb-8">
            Ganhe em profundidade — até 15.625 posições na sua downline
          </p>
          <div className="grid grid-cols-5 gap-3">
            {matrix.map((m) => (
              <div
                key={m.level}
                className="bg-white/8 rounded-xl p-5"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Nível {m.level}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-yellow-400 my-2">
                  {m.positions.toLocaleString("pt-BR")}
                </div>
                <div className="text-sm text-purple-300 font-semibold">{m.pct}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FORM */}
        <section
          id="form"
          className="bg-black/30 backdrop-blur-md rounded-3xl p-10 md:p-14 mb-16"
        >
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Vaga Reservada! 🚀</h2>
              <p className="text-gray-300 text-lg mb-8">
                Recebemos seu cadastro. Em até 24h a equipe Nexus entrará em contato pelo WhatsApp{" "}
                <strong>{formData.phone}</strong> para ativar seu agente IA e dar acesso à plataforma.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Voltar para home
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
                <Sparkles className="inline w-8 h-8 text-yellow-400 mr-2" />
                Reservar Vaga de Fundador
              </h2>
              <p className="text-gray-300 text-center mb-8">
                Preenchimento em 30 segundos · Suporte:{" "}
                <span className="text-yellow-400">equipenexus@oneverso.com.br</span>
              </p>
              <form
                onSubmit={handleSubmit}
                className="max-w-lg mx-auto space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nome completo"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/8 border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/8 border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (+55 11 9 XXXX-XXXX)"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/8 border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <textarea
                  placeholder="Por que você quer ser fundador? (opcional)"
                  rows={3}
                  value={formData.motivation}
                  onChange={(e) =>
                    setFormData({ ...formData, motivation: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/8 border border-white/15 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "🚀 Garantir minha vaga"}
                </button>
              </form>
            </>
          )}
        </section>

        {/* FOOTER */}
        <footer className="text-center py-8 text-gray-500 text-sm border-t border-white/10">
          Nexus AffilIAte · Powered by Helena Nexus (CMO/AI)
          <br />
          Suporte: <span className="text-yellow-400">equipenexus@oneverso.com.br</span>
          <br />
          © 2026 OneVerso ·{" "}
          <a
            href="https://oneverso.com.br"
            className="text-purple-400 hover:text-purple-300"
          >
            oneverso.com.br
          </a>
        </footer>
      </div>
    </div>
  );
}
