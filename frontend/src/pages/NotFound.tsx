import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="page-shell center-screen">
      <section className="panel narrow">
        <span className="pill">404</span>
        <h1>Página não encontrada</h1>
        <p>A rota solicitada não existe no modo bootstrap atual.</p>
        <Link href="/" className="btn btn-primary">Voltar para a home</Link>
      </section>
    </main>
  );
}
