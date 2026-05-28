export default function Termos() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card/70 p-8 shadow-xl shadow-black/10">
        <p className="text-xs uppercase tracking-[0.28em] text-accent-cyan">jurídico</p>
        <h1 className="mt-3 text-3xl font-bold">Termos de Uso · Nexus Affil'IA'te</h1>
        <p className="mt-4 text-sm leading-7 text-text-secondary">
          Este ambiente regula o uso da plataforma, do backoffice afiliado e dos módulos de IA.
          Ao concluir o cadastro, o usuário concorda em utilizar a operação para fins legítimos,
          respeitar a política comercial da rede e manter suas credenciais sob guarda pessoal.
        </p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-text-secondary">
          <p>
            1. O acesso administrativo é restrito a perfis autorizados e pode ser revogado a qualquer momento.
          </p>
          <p>
            2. Conteúdos, automações e ativos digitais gerados no ecossistema devem observar as regras da plataforma,
            da LGPD e dos parceiros integrados.
          </p>
          <p>
            3. O uso indevido da infraestrutura, incluindo tentativas de fraude, scraping não autorizado ou manipulação de rede,
            implica bloqueio imediato da conta e auditoria interna.
          </p>
        </div>
      </div>
    </main>
  );
}
