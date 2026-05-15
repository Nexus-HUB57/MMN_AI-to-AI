import { Link } from "wouter";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <span className="pill">Bootstrap técnico ativo</span>
        <h1>MMN AI-to-AI</h1>
        <p className="lead">
          O monorepo foi estabilizado com um frontend Vite mínimo e um backend Express+tRPC mínimo,
          criando uma base executável para a reintrodução gradual dos módulos reais.
        </p>

        <div className="cta-row">
          <Link href="/dashboard" className="btn btn-primary">
            Abrir dashboard bootstrap
          </Link>
          <Link href="/content-hub" className="btn btn-secondary">
            Abrir content hub bootstrap
          </Link>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>O que foi destravado</h2>
          <ul>
            <li>Entrypoint do backend criado</li>
            <li>Entrypoint do frontend criado</li>
            <li>Configuração Vite e TypeScript criada</li>
            <li>tRPC disponível em <code>/trpc</code></li>
          </ul>
        </article>

        <article className="panel">
          <h2>Próxima etapa recomendada</h2>
          <p>
            Reintroduzir, por fatias, os routers originais e as telas reais, saneando contratos tRPC e
            dependências compartilhadas com o legacy.
          </p>
        </article>
      </section>
    </main>
  );
}
