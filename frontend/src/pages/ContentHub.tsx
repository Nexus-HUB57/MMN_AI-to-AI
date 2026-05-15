import { useEffect, useState } from "react";
import { Link } from "wouter";

interface TrpcEnvelope {
  result?: unknown;
}

export default function ContentHub() {
  const [trpcStatus, setTrpcStatus] = useState<string>("Consultando endpoint tRPC...");

  useEffect(() => {
    let active = true;

    async function probeTrpc() {
      try {
        const response = await fetch("http://localhost:3000/trpc/system.health?batch=1&input=%7B%7D");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as TrpcEnvelope;
        if (active) {
          setTrpcStatus(data ? "Endpoint tRPC respondeu com sucesso." : "Endpoint tRPC respondeu vazio.");
        }
      } catch (error) {
        if (active) {
          setTrpcStatus(error instanceof Error ? error.message : "Falha ao consultar tRPC");
        }
      }
    }

    probeTrpc();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <div className="topbar">
        <h1>Content Hub Bootstrap</h1>
        <Link href="/" className="btn btn-secondary">Voltar</Link>
      </div>

      <section className="panel">
        <h2>Modo bootstrap</h2>
        <p>
          Esta tela comprova que o frontend está executando e que o backend bootstrap está acessível
          tanto por HTTP simples quanto pelo endpoint <code>/trpc</code>.
        </p>
      </section>

      <section className="panel">
        <h2>Probe do tRPC</h2>
        <p>{trpcStatus}</p>
      </section>
    </main>
  );
}
