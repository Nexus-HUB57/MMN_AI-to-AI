import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function Home() {
  const systemInfo = trpc.system.info.useQuery();
  const bootstrapStatus = trpc.bootstrap.status.useQuery();

  return (
    <main className="page-shell">
      <section className="hero-card">
        <span className="pill">Sistema Ativo</span>
        <h1>MMN AI-to-AI</h1>
        <p className="lead">
          Ecossistema de marketing multinível com backoffice operacional, monitoramento agentic
          e orquestração de agentes de IA autônomos.
        </p>

        <div className="cta-row">
          <Link href="/dashboard" className="btn btn-primary">
            Abrir Backoffice
          </Link>
          <Link href="/content-hub" className="btn btn-secondary">
            AI Content Hub
          </Link>
          <Link href="/orchestrator" className="btn btn-secondary">
            Orquestrador
          </Link>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Estado do sistema</h2>
          {systemInfo.isLoading ? <p>Consultando system.info...</p> : null}
          {systemInfo.error ? <p className="error">{systemInfo.error.message}</p> : null}
          {systemInfo.data ? (
            <dl className="kv-list">
              <div><dt>runtime</dt><dd>{systemInfo.data.runtime}</dd></div>
              <div><dt>database</dt><dd>{systemInfo.data.database}</dd></div>
              <div><dt>redis</dt><dd>{systemInfo.data.redis}</dd></div>
              <div><dt>mode</dt><dd>{systemInfo.data.mode}</dd></div>
              {systemInfo.data.features && (
                <div>
                  <dt>features</dt>
                  <dd>
                    <ul className="feature-list">
                      {systemInfo.data.features.map((feature: string) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          ) : null}
        </article>

        <article className="panel">
          <h2>Routers ativos</h2>
          {bootstrapStatus.isLoading ? <p>Consultando bootstrap.status...</p> : null}
          {bootstrapStatus.error ? <p className="error">{bootstrapStatus.error.message}</p> : null}
          {bootstrapStatus.data ? (
            <dl className="kv-list">
              <div><dt>frontend</dt><dd>{bootstrapStatus.data.frontend}</dd></div>
              <div><dt>backend</dt><dd>{bootstrapStatus.data.backend}</dd></div>
              <div><dt>genkit</dt><dd>{bootstrapStatus.data.genkit}</dd></div>
              {bootstrapStatus.data.routers && (
                <>
                  <div><dt>agentic</dt><dd>{bootstrapStatus.data.routers.agentic ? "✓" : "✗"}</dd></div>
                  <div><dt>agents</dt><dd>{bootstrapStatus.data.routers.agents ? "✓" : "✗"}</dd></div>
                  <div><dt>aiContentHub</dt><dd>{bootstrapStatus.data.routers.aiContentHub ? "✓" : "✗"}</dd></div>
                  <div><dt>dashboard</dt><dd>{bootstrapStatus.data.routers.dashboard ? "✓" : "✗"}</dd></div>
                  <div><dt>orchestration</dt><dd>{bootstrapStatus.data.routers.orchestration ? "✓" : "✗"}</dd></div>
                  <div><dt>payments</dt><dd>{bootstrapStatus.data.routers.payments ? "✓" : "✗"}</dd></div>
                  <div><dt>upgrades</dt><dd>{bootstrapStatus.data.routers.upgrades ? "✓" : "✗"}</dd></div>
                </>
              )}
            </dl>
          ) : null}
        </article>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Funcionalidades principais</h2>
          <ul className="feature-list">
            <li>🧠 Agentes IA autônomos com aprendizado contínuo</li>
            <li>🛰️ Agent Monitor com graph, audit trail, checkpoints e memory search</li>
            <li>📊 Engine MMN com comissões em cascata</li>
            <li>🤖 AI Content Hub para geração de conteúdo</li>
            <li>🎭 Sistema orquestrador multiagente</li>
            <li>🛒 Integração com marketplaces</li>
            <li>📅 Agendamento de posts e automações</li>
            <li>💰 Pagamentos e trilha financeira operacional</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Próximas frentes</h2>
          <ul className="feature-list">
            <li>Modernizar as entradas de associado e administrador.</li>
            <li>Expandir o backoffice com novos módulos operacionais.</li>
            <li>Conectar persistência agentic a filas reais.</li>
            <li>Adicionar observabilidade operacional para rede e pagamentos.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
