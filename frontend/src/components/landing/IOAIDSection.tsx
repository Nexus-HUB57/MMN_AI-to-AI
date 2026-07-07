import { Cpu, Network, Layers, Sparkles, ShieldCheck, Workflow } from "lucide-react";

export function IOAIDSection() {
  return (
    <section id="ioaid" className="relative py-20 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-emerald-500/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Nexus Affil'IA'te — IOAID · SaaS
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Infraestrutura Operacional de<br/>
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
              Inteligência Distribuída
            </span>
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto text-base md:text-lg">
            Organismo SaaS AI‑Native · Ecossistema de Marketing de Afiliados adotando o
            <span className="text-emerald-300 font-semibold"> SHO (Sistema Híbrido de Orquestração)</span> e buscando alcançar o nível de
            <span className="text-cyan-300 font-semibold"> AOI (Autonomous Operational Intelligence)</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="rounded-2xl bg-slate-900/60 border border-emerald-500/20 p-6 hover:border-emerald-400/40 transition">
            <Workflow className="w-7 h-7 text-emerald-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Gestão × Operacional</h3>
            <p className="text-slate-400 text-sm">O usuário/peer se cadastra, ajusta funcionalidades operacionais e skills dos Agentes IA autônomos, promovendo ações na AI Operational Network.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-6 hover:border-cyan-400/40 transition">
            <Cpu className="w-7 h-7 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Full Autonomous Runtime</h3>
            <p className="text-slate-400 text-sm">Modelo de operação singular, arquitetura de alta integridade operando em runtime totalmente autônomo, com agentes coordenados em malha.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 border border-violet-500/20 p-6 hover:border-violet-400/40 transition">
            <Layers className="w-7 h-7 text-violet-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Stack Legacy Fusionada</h3>
            <p className="text-slate-400 text-sm">Arquitetura fusionada do legado PHP com stack moderna React + TypeScript, preservando integridade do core e ampliando capacidades agênticas.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-400/20 p-6">
            <Network className="w-7 h-7 text-emerald-300 mb-3" />
            <h3 className="text-white font-semibold mb-2">AI Operational Network</h3>
            <p className="text-slate-300 text-sm">Rede operacional distribuída onde cada afiliado opera com Agentes IA proprietários, executando vendas, conteúdo, comissões e relacionamento — em paralelo, com observabilidade total.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 p-6">
            <ShieldCheck className="w-7 h-7 text-violet-300 mb-3" />
            <h3 className="text-white font-semibold mb-2">SaaS Early‑Stage · Alta Integridade</h3>
            <p className="text-slate-300 text-sm">Plataforma em estágio inicial com arquitetura de alta integridade — auditoria, refresh tokens, segregação de papéis e sessão soberana por afiliado.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default IOAIDSection;
