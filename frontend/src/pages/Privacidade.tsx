export default function Privacidade() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card/70 p-8 shadow-xl shadow-black/10">
        <p className="text-xs uppercase tracking-[0.28em] text-accent-cyan">jurídico</p>
        <h1 className="mt-3 text-3xl font-bold">Política de Privacidade · Nexus Affil'IA'te</h1>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          Tratamos dados pessoais com base em necessidade operacional, segurança de acesso e prestação dos serviços do ecossistema.
          O cadastro coleta apenas informações necessárias para onboarding, autenticação, pagamento e suporte.
        </p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
          <p>
            1. Dados de cadastro e sessão são usados para autenticação, prevenção a abuso, relatórios operacionais e suporte.
          </p>
          <p>
            2. Integrações externas só recebem os dados mínimos necessários para execução do serviço contratado.
          </p>
          <p>
            3. Solicitações de correção, revisão ou remoção de dados devem ser tratadas pelo canal oficial da operação.
          </p>
        </div>
      </div>
    </main>
  );
}
