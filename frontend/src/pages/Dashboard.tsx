import { useEffect, useState } from "react";
import { Link } from "wouter";

interface HealthResponse {
  ok: boolean;
  service: string;
  mode: string;
  timestamp: string;
}

interface RootResponse {
  name: string;
  service: string;
  mode: string;
  trpc: string;
  health: string;
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [rootInfo, setRootInfo] = useState<RootResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [healthRes, rootRes] = await Promise.all([
          fetch("http://localhost:3000/health"),
          fetch("http://localhost:3000/"),
        ]);

        if (!healthRes.ok || !rootRes.ok) {
          throw new Error("Backend indisponível");
        }

        const [healthData, rootData] = await Promise.all([
          healthRes.json(),
          rootRes.json(),
        ]);

        if (active) {
          setHealth(healthData);
          setRootInfo(rootData);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Falha ao consultar backend");
        }
      }
    }

    load();
    const timer = window.setInterval(load, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="page-shell">
      <div className="topbar">
        <h1>Dashboard Bootstrap</h1>
        <Link href="/" className="btn btn-secondary">Voltar</Link>
      </div>

      {error ? <section className="panel"><p className="error">{error}</p></section> : null}

      <section className="grid">
        <article className="panel">
          <h2>Healthcheck do backend</h2>
          {health ? (
            <dl className="kv-list">
              <div><dt>ok</dt><dd>{String(health.ok)}</dd></div>
              <div><dt>service</dt><dd>{health.service}</dd></div>
              <div><dt>mode</dt><dd>{health.mode}</dd></div>
              <div><dt>timestamp</dt><dd>{health.timestamp}</dd></div>
            </dl>
          ) : <p>Consultando backend...</p>}
        </article>

        <article className="panel">
          <h2>Raiz HTTP do backend</h2>
          {rootInfo ? (
            <dl className="kv-list">
              <div><dt>name</dt><dd>{rootInfo.name}</dd></div>
              <div><dt>service</dt><dd>{rootInfo.service}</dd></div>
              <div><dt>mode</dt><dd>{rootInfo.mode}</dd></div>
              <div><dt>trpc</dt><dd>{rootInfo.trpc}</dd></div>
              <div><dt>health</dt><dd>{rootInfo.health}</dd></div>
            </dl>
          ) : <p>Carregando metadados...</p>}
        </article>
      </section>
    </main>
  );
}
