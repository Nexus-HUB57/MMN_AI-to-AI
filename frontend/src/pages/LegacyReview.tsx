import { Link } from "wouter";

const legacyAdminGroups = [
  {
    title: "Operação da rede",
    items: [
      "Painel de clientes",
      "Novos cadastros",
      "Inadimplentes",
      "Indicação em rede",
      "Top indicador",
      "Comissões e descontos",
    ],
  },
  {
    title: "Financeiro",
    items: [
      "Confirmar pagamentos",
      "Extrato total",
      "Pagamentos gerados e cancelados",
      "Remuneração e saque",
      "Despesas pagas e a pagar",
      "Saldo operacional",
    ],
  },
  {
    title: "Configuração do negócio",
    items: [
      "Níveis e configuração",
      "Comissões por plano",
      "Planos, tipos e ciclos",
      "Bônus e prêmios",
      "Pagamentos e recargas",
      "Administradores",
    ],
  },
  {
    title: "CMS e materiais",
    items: [
      "Arquivos e ebooks",
      "Mensagens",
      "Menus",
      "Logos",
      "Layout",
      "Slides, banners e FAQ",
    ],
  },
];

const migrationTargets = [
  {
    title: "Landing pública mais consultiva",
    description:
      "Substituir a comunicação agressiva por uma narrativa premium focada em ROI, operação e automação de marketing multinível.",
  },
  {
    title: "Entradas separadas por perfil",
    description:
      "Diferenciar jornada do associado e do administrador com portais próprios, linguagem adequada e sinalização clara de segurança.",
  },
  {
    title: "Backoffice operacional moderno",
    description:
      "Agrupar rede, comissões, pagamentos, materiais e automações em módulos enxutos com navegação previsível e orientada por tarefas.",
  },
  {
    title: "Camada agentic sobre o legado",
    description:
      "Usar monitoramento agentic, memórias, judge e automação para evoluir a operação além do escopo do sistema legado.",
  },
];

export default function LegacyReview() {
  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Legacy Benchmark</span>
          <h1>Revisão de referência do legado</h1>
          <p className="lead compact">
            Benchmark funcional do Marketing 11.0 para orientar a modernização do MMN AI-to-AI.
          </p>
        </div>
        <div className="cta-row compact-actions">
          <Link href="/" className="btn btn-secondary">
            Início
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Backoffice atual
          </Link>
        </div>
      </div>

      <section className="grid">
        <article className="panel full-width">
          <h2>Referências analisadas</h2>
          <div className="reference-grid">
            <a className="reference-card" href="https://demo.br20.net/marketing/" target="_blank" rel="noreferrer">
              <strong>Landing pública</strong>
              <span>Hero aspiracional, CTA forte, prova visual de riqueza e blocos de benefícios.</span>
            </a>
            <a className="reference-card" href="https://demo.br20.net/marketing/painel/" target="_blank" rel="noreferrer">
              <strong>Espaço do cliente</strong>
              <span>Login centrado, recuperação de senha e entrada para cadastro do associado.</span>
            </a>
            <a className="reference-card" href="https://demo.br20.net/marketing/adm/" target="_blank" rel="noreferrer">
              <strong>Espaço do administrador</strong>
              <span>Menu lateral profundo com módulos de rede, financeiro, CMS e configuração.</span>
            </a>
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Leituras principais do legado</h2>
          <ul className="feature-list">
            <li>O site público vende autonomia financeira, implantação rápida e operação sem dependência técnica.</li>
            <li>O painel do cliente concentra autenticação, cadastro e recuperação de acesso em uma única experiência simples.</li>
            <li>O painel administrativo prioriza densidade funcional: rede, pagamentos, relatórios, CMS, layouts e materiais.</li>
            <li>O legado já sugere quatro domínios fortes para migração: aquisição, backoffice, financeiro e conteúdo.</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Direção de modernização</h2>
          <ul className="feature-list">
            <li>Manter a completude operacional do legado, mas com hierarquia visual limpa e menos atrito cognitivo.</li>
            <li>Transformar menus extensos em hubs por contexto: Operação, Receita, Conteúdo, Configuração e IA.</li>
            <li>Dar protagonismo ao Agent Monitor como diferencial de produto em vez de tratá-lo como recurso lateral.</li>
            <li>Separar claramente o que é benchmark legado do que já é evolução nativa do MMN AI-to-AI.</li>
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Mapa funcional do administrador legado</h2>
          <div className="reference-grid four-col">
            {legacyAdminGroups.map((group) => (
              <div key={group.title} className="reference-card">
                <strong>{group.title}</strong>
                <div className="chip-wrap">
                  {group.items.map((item) => (
                    <span key={item} className="module-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Metas de migração imediata</h2>
          <div className="reference-grid two-col">
            {migrationTargets.map((item) => (
              <div key={item.title} className="reference-card">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
