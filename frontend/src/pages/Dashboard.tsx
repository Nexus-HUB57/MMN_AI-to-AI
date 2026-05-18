import { Link } from "wouter";
import { trpc } from "../lib/trpc";

const legacyModules = [
  {
    title: "Rede e afiliados",
    items: ["Novos cadastros", "Inadimplentes", "Indicação em rede", "Top indicador"],
  },
  {
    title: "Comissões e receita",
    items: ["Comissões e descontos", "Pagamentos gerados", "Saldo", "Saque e remuneração"],
  },
  {
    title: "Conteúdo e materiais",
    items: ["Newsletter", "Arquivos e ebooks", "Slides e banners", "Divulgação"],
  },
  {
    title: "Configuração administrativa",
    items: ["Níveis", "Planos", "Bônus", "Administradores"],
  },
];

export default function Dashboard() {
  const health = trpc.system.health.useQuery();
  const systemInfo = trpc.system.info.useQuery();
  const currentUser = trpc.auth.me.useQuery();

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Backoffice</span>
          <h1>Dashboard operacional</h1>
          <p className="lead compact">
            Vista moderna do backoffice com foco em saúde do sistema, módulos de operação e trilha de migração do legado.
          </p>
        </div>
        <div className="cta-row compact-actions">
          <Link href="/" className="btn btn-secondary">
            Início
          </Link>
          <Link href="/legacy-review" className="btn btn-secondary">
            Benchmark legado
          </Link>
          <Link href="/orchestrator" className="btn btn-primary">
            Agent Monitor
          </Link>
        </div>
      </div>

      <section className="grid stats-grid">
        <article className="panel stat-panel">
          <h2>Healthcheck</h2>
          {health.isLoading ? <p>Consultando system.health...</p> : null}
          {health.error ? <p className="error">{health.error.message}</p> : null}
          {health.data ? (
            <>
              <p className="stat-value">{health.data.ok ? "Online" : "Indisponível"}</p>
              <p className="stat-meta">{health.data.service}</p>
              <p className="stat-caption">Modo: {health.data.mode}</p>
            </>
          ) : null}
        </article>

        <article className="panel stat-panel">
          <h2>Runtime</h2>
          {systemInfo.data ? (
            <>
              <p className="stat-value">{systemInfo.data.runtime}</p>
              <p className="stat-meta">Banco: {systemInfo.data.database}</p>
              <p className="stat-caption">Redis: {systemInfo.data.redis}</p>
            </>
          ) : systemInfo.error ? (
            <p className="error">{systemInfo.error.message}</p>
          ) : (
            <p>Consultando system.info...</p>
          )}
        </article>

        <article className="panel stat-panel">
          <h2>Usuário autenticado</h2>
          {currentUser.isLoading ? <p>Consultando auth.me...</p> : null}
          {currentUser.error ? <p className="error">{currentUser.error.message}</p> : null}
          {currentUser.data ? (
            <>
              <p className="stat-value">{String(currentUser.data.id)}</p>
              <p className="stat-meta">Role: {currentUser.data.role}</p>
              <p className="stat-caption">Contexto carregado com tRPC</p>
            </>
          ) : (
            !currentUser.isLoading && <p className="stat-caption">Nenhum usuário autenticado no bootstrap atual.</p>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Módulos inspirados no administrador legado</h2>
          <div className="reference-grid four-col">
            {legacyModules.map((module) => (
              <div key={module.title} className="reference-card">
                <strong>{module.title}</strong>
                <div className="chip-wrap">
                  {module.items.map((item) => (
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
        <article className="panel">
          <h2>Prioridades de evolução</h2>
          <ul className="feature-list">
            <li>Transformar o menu extenso do legado em hubs operacionais mais curtos.</li>
            <li>Expor módulos de rede, pagamentos, materiais e configurações com navegação previsível.</li>
            <li>Usar o agentic layer para monitorar campanhas, memória e qualidade de execução.</li>
            <li>Separar claramente experiência do associado e do administrador.</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Links de trabalho</h2>
          <div className="quick-actions">
            <a href="https://demo.br20.net/marketing/" target="_blank" rel="noreferrer" className="btn btn-secondary">
              Ver landing legado
            </a>
            <a href="https://demo.br20.net/marketing/painel/" target="_blank" rel="noreferrer" className="btn btn-secondary">
              Ver portal do cliente legado
            </a>
            <a href="https://demo.br20.net/marketing/adm/" target="_blank" rel="noreferrer" className="btn btn-secondary">
              Ver portal admin legado
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
