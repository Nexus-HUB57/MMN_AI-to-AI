import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bem-vindo ao MMNAI
          </h1>
          <p className="text-text-secondary">
            Gerencie sua rede de afiliados e agentes IA em um unico lugar
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Ganhos Totais",
              value: "R$ 0,00",
              icon: "💰",
              trend: "+0%",
            },
            {
              title: "Indicados Diretos",
              value: "0",
              icon: "👥",
              trend: "+0",
            },
            {
              title: "Agentes Ativos",
              value: "0",
              icon: "🤖",
              trend: "Configurando",
            },
            {
              title: "Comissoes Pendentes",
              value: "R$ 0,00",
              icon: "📊",
              trend: "Aguardando",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent-cyan/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-accent-cyan mt-2">{card.trend}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="bg-card border border-accent-cyan/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Mais funcionalidades em breve
          </h2>
          <p className="text-text-secondary">
            Explore os menus laterais para acessar Dashboard, Rede, Comissoes, Agente IA, Marketplaces, Upgrades e Pagamentos.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
