export const benchmarkLinks = [
  {
    title: "Landing pública legado",
    href: "https://demo.br20.net/marketing/",
    description: "Referência comercial com apelo de aquisição, benefícios e CTA principal.",
  },
  {
    title: "Espaço do cliente legado",
    href: "https://demo.br20.net/marketing/painel/",
    description: "Entrada do associado com login, cadastro e recuperação de senha.",
  },
  {
    title: "Espaço do administrador legado",
    href: "https://demo.br20.net/marketing/adm/",
    description: "Backoffice administrativo denso com módulos operacionais e financeiros.",
  },
] as const;

export const legacyAdminGroups = [
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
] as const;

export const migrationTargets = [
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
] as const;

export const legacyRetirementMetrics = [
  {
    label: "Arquivos versionados em legacy/",
    value: "3.153",
    note: "Base local ainda carregada no Git mesmo sem dependência direta em runtime.",
  },
  {
    label: "Peso aproximado do diretório",
    value: "52 MB",
    note: "Maior volume concentrado em inc123, adm, images123 e clientes.",
  },
  {
    label: "Maior subpasta",
    value: "legacy/inc123 · 35 MB",
    note: "Bibliotecas PHP, JS, plugins e integrações antigas representam o grosso do legado.",
  },
  {
    label: "Status de uso no app atual",
    value: "Benchmark apenas",
    note: "Não há referência direta a legacy/ no frontend ou backend ativos.",
  },
] as const;

export const heavyLegacyAssets = [
  {
    path: "legacy/images123/layout.zip",
    size: "952 KB",
    reason: "Pacote gráfico legado sem uso direto no app moderno.",
  },
  {
    path: "legacy/arquivos123/mistake.pdf",
    size: "763 KB",
    reason: "Material histórico replicável em storage externo ou catálogo moderno.",
  },
  {
    path: "legacy/arquivos123/8stepstosuccess.pdf",
    size: "763 KB",
    reason: "Documento legado que pode migrar para uma biblioteca de materiais própria.",
  },
  {
    path: "legacy/inc123/extplorer/scripts/extjs3/ext-all.js",
    size: "620 KB",
    reason: "Bundle JS antigo ligado ao ecossistema PHP/extplorer.",
  },
  {
    path: "legacy/inc123/area123_banco_de_dados.php",
    size: "584 KB",
    reason: "Camada monolítica de banco de dados do legado, não consumida pela stack atual.",
  },
  {
    path: "legacy/inc123/js/prototype_variant.js",
    size: "492 KB",
    reason: "Dependência front-end obsoleta sem integração com React + Vite.",
  },
] as const;

export const retirementChecklist = [
  "Consolidar no app moderno os fluxos de aquisição, rede, pagamentos, materiais e configuração.",
  "Manter o legado somente como benchmark funcional, nunca como dependência de runtime.",
  "Exportar a estrutura de módulos e ativos críticos para inventário leve versionado.",
  "Arquivar PDFs, imagens e pacotes antigos em storage externo ou AI Drive antes da exclusão do Git.",
  "Executar uma varredura final confirmando ausência de imports, links internos ou scripts que dependam de legacy/.",
  "Após a cobertura funcional, remover legacy/ do versionamento e manter apenas manifestos, relatórios e mapas de migração.",
] as const;

export const fusionTracks = [
  {
    title: "Aquisição e landing",
    status: "em consolidação",
    summary: "A estratégia já foi abstraída em páginas leves de benchmark e posicionamento moderno.",
  },
  {
    title: "Backoffice administrativo",
    status: "em evolução",
    summary: "O dashboard atual já replica a leitura funcional do menu legado sem depender dos arquivos PHP pesados.",
  },
  {
    title: "Operação agentic",
    status: "ativo",
    summary: "O Agent Monitor já diferencia o produto moderno e substitui parte do monitoramento operacional antigo.",
  },
  {
    title: "Aposentadoria do legacy/",
    status: "preparação",
    summary: "Inventário e checklist foram trazidos para a base leve para viabilizar remoção futura do diretório pesado.",
  },
] as const;
