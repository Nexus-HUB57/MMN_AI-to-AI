from pathlib import Path

ROOT = Path('/home/user/MMN_AI-to-AI')


def replace_text(path_str, replacements):
    path = ROOT / path_str
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in replacements:
        if old not in text:
            raise SystemExit(f'Missing snippet in {path_str}: {old[:120]!r}')
        text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
    print(f'updated {path_str}')


home_replacements = [
    (
        'text: "Com o Pack A² você ativa o Agente IA, recebe acesso ao BackOffice, inicia sua jornada na plataforma e começa a construir sua rede comercial com suporte tecnológico de ponta.",',
        'text: "Com o Pack A² você ativa seu Agente IA, abre sua vitrine de ofertas, entra no painel da plataforma e começa a vender com mais apoio, organização e velocidade.",',
    ),
    (
        'text: "Um SaaS estratégico de ponta que unifica o rastreamento, comissionamento dinâmico, comunicação automatizada e análise de rentabilidade de ecossistemas de vendas e prospecção.",',
        'text: "Uma plataforma que reúne em um só lugar a gestão dos parceiros, a automação das ofertas, o acompanhamento das vendas e a evolução comercial da sua operação.",',
    ),
    (
        'text: "Produtores de infoprodutos de alto volume, operações de e-commerce D2C, marcas com redes de embaixadores e empresas B2B estruturando canais de integradores/representantes.",',
        'text: "Negócios que vendem com afiliados, creators, embaixadores, representantes e parceiros comerciais que precisam de mais organização para crescer.",',
    ),
    (
        'text: "Elimina a fricção operacional, previne fraudes de atribuição, resolve a complexidade do split de pagamentos e entrega visibilidade cristalina sobre o ROI de cada canal.",',
        'text: "Substitui planilhas soltas, controles manuais e processos confusos por uma operação mais clara, com comissões organizadas, vitrine pronta e visão real do que está dando resultado.",',
    ),
    (
        'text: "Fluxos desenhados para zerar o esforço manual. Da aprovação automática de parceiros qualificados ao cálculo de regras comissionadas complexas em milissegundos.",',
        'text: "Automatiza tarefas repetitivas do dia a dia, desde o cadastro de parceiros até a liberação de ofertas, acompanhamento do estoque e ativação de campanhas.",',
    ),
    (
        'text: "Dashboards gerenciais com visão analítica profunda (LTV por parceiro, CAC cruzado). Rastreabilidade ponta a ponta que garante a governança e previne sobreposição de canais.",',
        'text: "Mostra com clareza quais parceiros vendem mais, quais ofertas performam melhor e onde vale a pena concentrar seus próximos movimentos comerciais.",',
    ),
    (
        'text: "Arquitetura cloud-native construída para suportar desde uma dezena de embaixadores exclusivos até dezenas de milhares de afiliados simultâneos sem gargalos de performance.",',
        'text: "Foi pensada para crescer junto com a sua operação, do início da rede até uma estrutura com muitos parceiros ativos ao mesmo tempo.",',
    ),
    (
        'text: "Painéis white-label elegantes para os seus parceiros acompanharem suas métricas. Implementação ágil, adaptando a plataforma às regras de negócio da sua empresa, e não o contrário.",',
        'text: "Entrega uma experiência organizada para quem vende com você, com painéis claros, identidade profissional e espaço para adaptar a operação ao seu modelo comercial.",',
    ),
    (
        'title: "Plataforma SaaS com governança comercial completa",',
        'title: "Operação comercial com controle total",',
    ),
    (
        '"O sistema unifica rastreamento de conversões, comissionamento dinâmico com regras customizáveis e uma visão analítica profunda do ROI por canal e LTV por parceiro. A governança comercial é granular: cada aprovação, repasse e decisão gera trilha auditável.",',
        '"O Nexus Affil\'IA\'te centraliza comissões, ativações, acompanhamento de parceiros e histórico das principais decisões para que a operação cresça com mais segurança.",',
    ),
    (
        '"Rastreamento ponta a ponta com atribuição multicamadas",',
        '"Controle claro das vendas e repasses",',
    ),
    (
        '"Comissionamento dinâmico com regras de negócio flexíveis",',
        '"Regras comerciais ajustadas ao seu modelo",',
    ),
    (
        '"Visão analítica de ROI por canal e rentabilidade por parceiro",',
        '"Leitura prática do desempenho por parceiro e oferta",',
    ),
    (
        '"Profissionalização imediata da relação com influenciadores, clareza sobre o ROI real de cada perfil e realocação inteligente do orçamento de marketing para os creators com maior taxa de conversão.",',
        '"Relação mais profissional com creators, leitura clara do que converte e melhores decisões sobre onde investir energia e verba.",',
    ),
    (
        '"Uma desenvolvedora de software buscava capilaridade nacional através de integradores regionais, precisando gerenciar leads indicados e comissionamento recorrente (MRR).",',
        '"Uma empresa de software queria ampliar sua presença nacional com parceiros regionais e precisava organizar indicações, oportunidades e ganhos recorrentes.",',
    ),
    (
        '"Criação de um portal seguro de Deal Registration para parceiros submeterem oportunidades, alinhado a um motor de cálculo automatizado de comissões sobre mensalidades.",',
        '"Criação de um portal para registro de oportunidades, com acompanhamento das indicações e cálculo automático das comissões sobre contratos ativos.",',
    ),
    (
        '"Configuração do ambiente cloud, definição de hierarquias de acesso, personalização visual (white-label) e parametrização das lógicas de campanha.",',
        '"Configuração da operação, definição dos acessos, identidade visual e regras comerciais que vão sustentar a rotina da sua equipe e da sua rede.",',
    ),
    (
        'A infraestrutura SaaS definitiva para escalar operações de parcerias, creators e afiliados.',
        'A plataforma comercial para ativar, organizar e escalar redes de parceiros, creators e afiliados.',
    ),
    (
        "features: ['1 Agente IA ativado', '10 e-books para revenda', 'Acesso ao BackOffice', '2 skills liberadas'],",
        "features: ['1 Agente IA ativado', '10 e-books para revenda', 'Painel comercial liberado', '2 skills iniciais'],",
    ),
    (
        "features: ['Prompt Intermediário', '10 PREU (250 e-books)', 'Comissão 1º e 2º nível', '5 Packs SiSu'],",
        "features: ['Agente em nível profissional', '250 e-books para ampliar a vitrine', 'Comissão em mais níveis da rede', '5 cotas extras de expansão'],",
    ),
    (
        "subtitle: 'IA Agêntica SCC+ Nível I',",
        "subtitle: 'Liderança estratégica Nível I',",
    ),
    (
        "highlight: 'Nível CEO',",
        "highlight: 'Camada estratégica',",
    ),
    (
        "features: ['Hall de Sócios', 'Royalties e dividendos', 'Patrocínio Harp\\'IA\\'', 'Acesso pleno'],",
        "features: ['Benefícios estratégicos exclusivos', 'Participação em receitas especiais', 'Apoio a novos projetos', 'Acesso total às capacidades do agente'],",
    ),
    (
        'Todos os packs incluem acesso ao painel, Agente IA e suporte comercial.',
        'Todos os packs incluem acesso ao painel, ativação progressiva do Agente IA e apoio comercial.',
    ),
    (
        'No ecossistema digital contemporâneo, a capacidade de prospectar públicos e escalar vendas de forma previsível\n              é o que separa marcas estagnadas daquelas que dominam seus mercados. O sistema desenvolve tecnologias que\n              funcionam como o motor invisível desse crescimento.',
        'Em qualquer operação de vendas por parceiros, o que faz diferença de verdade é conseguir atrair pessoas certas, organizar a rotina e transformar relacionamento em resultado de forma constante. É exatamente esse papel que o Nexus Affil\'IA\'te assume dentro da operação.',
    ),
    (
        'O Nexus Affil\'IA\'te é a solução proprietária de alto padrão, projetada para orquestrar e potencializar\n              redes comerciais complexas. Substituímos controles amadores, planilhas frágeis e plataformas engessadas\n              por um ambiente tecnológico robusto, orientado a dados e focado em alta performance.',
        'O Nexus Affil\'IA\'te troca controles improvisados por uma base comercial mais profissional. Em vez de depender de planilhas, mensagens soltas e decisões sem contexto, sua equipe passa a operar com fluxo claro, vitrine pronta e acompanhamento centralizado.',
    ),
    (
        'Nossa esteira de implantação une tecnologia e processo corporativo em 5 etapas auditáveis.',
        'Nossa implantação une tecnologia e processo comercial em 5 etapas práticas.',
    ),
    (
        'A Equipe Nexus não é apenas uma fornecedora de sistemas; somos arquitetos de infraestrutura para o crescimento.\n            Escolher o Nexus Affil\'IA\'te significa trazer para o centro da sua operação uma tecnologia desenvolvida com\n            resiliência corporativa.',
        'A Equipe Nexus não entrega apenas uma ferramenta. Entrega uma estrutura pronta para vender melhor, organizar a rede e transformar a operação comercial em algo mais profissional e previsível.',
    ),
    (
        'Unimos segurança da informação, estabilidade em picos de tráfego e uma experiência de usuário polida.\n            Assumimos a complexidade técnica para que sua equipe de Growth mantenha o foco absoluto naquilo que mais\n            importa: estratégia, relacionamento humano e expansão agressiva de receita.',
        'Nós cuidamos da base tecnológica para que sua equipe foque no que realmente importa: relacionamento, oferta, conversão e crescimento sustentável da receita.',
    ),
    (
        "NEXUS <span className=\"text-quantum-cyan\">AFFIL'IA'TE</span> · IOAID · SaaS",
        "NEXUS <span className=\"text-quantum-cyan\">AFFIL'IA'TE</span> · Plataforma comercial inteligente",
    ),
]

nexus_replacements = [
    (
        'affiliate_ii:    { label: "Agente Afiliado Nível II",     subtitle: "Upgrade A²II — expande N.O com diretos qualificados." },',
        'affiliate_ii:    { label: "Agente Afiliado Nível II",     subtitle: "Upgrade A²II — amplia sua frente de vendas e o catálogo liberado." },',
    ),
    (
        'predictive_i:    { label: "SCC Preditivo Nível I",        subtitle: "Pack AG — entrada profissional multilevel." },',
        'predictive_i:    { label: "Escala Comercial Nível I",     subtitle: "Pack AG — entrada profissional para ampliar alcance e previsibilidade." },',
    ),
    (
        'predictive_ii:   { label: "SCC Preditivo Nível II",       subtitle: "Pack AGII — operação preditiva expandida." },',
        'predictive_ii:   { label: "Escala Comercial Nível II",    subtitle: "Pack AGII — mais alcance, mais catálogo e mais potência de vendas." },',
    ),
    (
        'predictive_iii:  { label: "SCC Preditivo Nível III",      subtitle: "Pack AGIII — consolidação preditiva." },',
        'predictive_iii:  { label: "Escala Comercial Nível III",   subtitle: "Pack AGIII — consolida a expansão e aumenta sua margem comercial." },',
    ),
    (
        'generative_i:    { label: "SCC Generativo Nível I",       subtitle: "Pack AGN — nível profissional generativo." },',
        'generative_i:    { label: "Criação Estratégica Nível I",  subtitle: "Pack AGN — entra na fase de criação e escala profissional." },',
    ),
    (
        'generative_ii:   { label: "SCC Generativo Nível II",      subtitle: "Pack AGNII — operação generativa avançada." },',
        'generative_ii:   { label: "Criação Estratégica Nível II", subtitle: "Pack AGNII — amplia produção, distribuição e ganhos da operação." },',
    ),
    (
        'generative_iii:  { label: "SCC Generativo Nível III",     subtitle: "Pack AGNIII — generativo C-level inicial." },',
        'generative_iii:  { label: "Criação Estratégica Nível III", subtitle: "Pack AGNIII — posiciona a operação em um patamar de liderança criativa." },',
    ),
    (
        'orchestrator_i:  { label: "SCC Orquestrador Nível I",     subtitle: "Pack AO — C-level inicial e Sandbox Nexus." },',
        'orchestrator_i:  { label: "Orquestração Nível I",         subtitle: "Pack AO — coordena múltiplas frentes e amplia a estrutura do negócio." },',
    ),
    (
        'orchestrator_ii: { label: "SCC Orquestrador Nível II",    subtitle: "Pack AOII — operação corporativa orquestrada." },',
        'orchestrator_ii: { label: "Orquestração Nível II",        subtitle: "Pack AOII — organiza uma operação maior com mais controle e escala." },',
    ),
    (
        'orchestrator_iii:{ label: "SCC Orquestrador Nível III",   subtitle: "Pack AOIII — orquestração plena." },',
        'orchestrator_iii:{ label: "Orquestração Nível III",       subtitle: "Pack AOIII — leva a operação para um nível completo de coordenação." },',
    ),
    (
        'agentic_i:       { label: "IA Agêntica SCC+ Nível I",     subtitle: "Pack AA — nível CEO, Hall de Sócios." },',
        'agentic_i:       { label: "Liderança Estratégica Nível I", subtitle: "Pack AA — entrada em uma camada de benefícios e visão estratégica." },',
    ),
    (
        'agentic_ii:      { label: "IA Agêntica SCC+ Nível II",    subtitle: "Pack AAII — royalties, dividendos, TPR." },',
        'agentic_ii:      { label: "Liderança Estratégica Nível II", subtitle: "Pack AAII — amplia receitas especiais e vantagens recorrentes." },',
    ),
    (
        'agentic_iii:     { label: "IA Agêntica SCC+ Nível III",   subtitle: "Pack AAIII — acesso pleno e patrocínio Harp\'IA." },',
        'agentic_iii:     { label: "Liderança Estratégica Nível III", subtitle: "Pack AAIII — acesso completo ao ecossistema e benefícios máximos." },',
    ),
    (
        '"Pack inicial. Único que ATIVA o Agente IA via OpenClaw. Liberado automaticamente após o cadastro.",',
        '"Pack de entrada. Ativa seu Agente IA, libera o primeiro catálogo e fica disponível assim que o cadastro é concluído.",',
    ),
    (
        '"1 Agente IA (Prompt Básico) — ativação OpenClaw",',
        '"Ativação do seu Agente IA essencial",',
    ),
    (
        '"Acesso BackOffice + BeYour Banker",',
        '"Acesso ao painel comercial e à carteira digital",',
    ),
    (
        'description: "Upgrade A²II — expande N.O e dobra o catálogo comercial.",',
        'description: "Upgrade A²II — amplia sua frente de vendas e dobra o catálogo liberado.",',
    ),
    (
        '"30 e-books · 1 Pack A² SiSu",',
        '"30 e-books + 1 cota extra de expansão",',
    ),
    (
        '"10% comissão 1º nível N.O · paridade R$1 = 1 XP",',
        '"10% de comissão no primeiro nível e avanço proporcional de XP",',
    ),
    (
        '"5 Skills Nível I · 50 e-books · 2 Packs A² SiSu",',
        '"5 skills iniciais + 50 e-books + 2 cotas extras de expansão",',
    ),
    (
        '"Bônus OnePack começa a contar (R$ 2,50 por A²II do N.O)",',
        '"Bônus de evolução começa a contar com os packs ativados pela sua rede",',
    ),
    (
        '"Indicação direta + Grafo+IA expandido",',
        '"Mais alcance para indicações e apoio ampliado do agente",',
    ),
    (
        'description: "Pack AG — entrada profissional preditiva e marketing digital.",',
        'description: "Pack AG — entrada profissional para ampliar previsibilidade, catálogo e ritmo comercial.",',
    ),
    (
        '"Prompt Intermediário + 5 Skills Nível I",',
        '"Agente em nível profissional + 5 skills essenciais",',
    ),
    (
        '"10 PREU (250 e-books) + 5 Packs A² SiSu",',
        '"250 e-books para ampliar a vitrine + 5 cotas extras de expansão",',
    ),
    (
        '"BeYour Banker Silver · comissão 1º (10%) e 2º nível (5%)",',
        '"Carteira digital em nível Silver + comissão no 1º e 2º níveis",',
    ),
    (
        'description: "Pack AGII — operação preditiva expandida.",',
        'description: "Pack AGII — amplia a operação com mais catálogo, mais skills e mais cobertura comercial.",',
    ),
    (
        '"20 PREU (500 e-books) + 10 Packs A² SiSu",',
        '"500 e-books para vender + 10 cotas extras de expansão",',
    ),
    (
        '"Sorteios Zetta · 5% no 3º nível N.O",',
        '"Campanhas promocionais exclusivas + 5% no 3º nível da rede",',
    ),
    (
        'description: "Pack AGIII — consolidação preditiva e maior margem de marketplace.",',
        'description: "Pack AGIII — consolida a expansão e aumenta a margem comercial do seu marketplace.",',
    ),
    (
        '"30 PREU (750 e-books) + 20 Packs A² SiSu + 1 Pack AG SiSu",',
        '"750 e-books para vender + 20 cotas extras de expansão + 1 cota profissional",',
    ),
    (
        '"75% lucro Marketplace · 10% comissão 2º nível N.O",',
        '"Maior margem no marketplace + 10% de comissão no 2º nível da rede",',
    ),
    (
        'description: "Pack AGN — entrada profissional generativa.",',
        'description: "Pack AGN — leva sua operação para uma fase profissional de criação e distribuição.",',
    ),
    (
        '"40 PREU (1.000 e-books) + 30 Packs A² SiSu",',
        '"1.000 e-books para compor a vitrine + 30 cotas extras de expansão",',
    ),
    (
        '"BeYour Banker Gold · 15% comissão 1º nível · Sorteios VIP",',
        '"Carteira digital em nível Gold + 15% no 1º nível + campanhas VIP",',
    ),
    (
        'description: "Pack AGNII — operação generativa avançada.",',
        'description: "Pack AGNII — aumenta a força de criação, distribuição e ganhos da operação.",',
    ),
    (
        '"80 PREU (2.000 e-books) + 40 Packs A² SiSu",',
        '"2.000 e-books para revenda + 40 cotas extras de expansão",',
    ),
    (
        '"Comissão até 4º nível N.O · Sorteios VIP até R$ 100.000",',
        '"Comissão até o 4º nível da rede + campanhas VIP de alto valor",',
    ),
    (
        'description: "Pack AGNIII — generativo C-level inicial.",',
        'description: "Pack AGNIII — posiciona sua operação em um patamar elevado de criação e liderança.",',
    ),
    (
        'badge: "C-level Inicial",',
        'badge: "Liderança Inicial",',
    ),
    (
        '"120 PREU (3.000 e-books) + 50 Packs A² + 1 Pack AGN SiSu",',
        '"3.000 e-books para vender + 50 cotas extras + 1 cota avançada de expansão",',
    ),
    (
        'description: "Pack AO — C-level inicial com Sandbox Nexus.",',
        'description: "Pack AO — coordena múltiplas frentes da operação com recursos avançados de gestão.",',
    ),
    (
        'badge: "C-level",',
        'badge: "Coordenação",',
    ),
    (
        '"Prompt Avançado + 3 Skills Nível I + 1 Skill Nível II",',
        '"Agente avançado + 3 skills essenciais + 1 skill de expansão",',
    ),
    (
        '"200 PREU (5.000 e-books) + 100 Packs A² SiSu",',
        '"5.000 e-books para revenda + 100 cotas extras de expansão",',
    ),
    (
        '"BeYour Banker Black · Nexus Academ\'IA Nível I + Sandbox Nexus",',
        '"Carteira digital em nível Black + trilha premium de capacitação",',
    ),
    (
        'description: "Pack AOII — operação corporativa orquestrada.",',
        'description: "Pack AOII — organiza uma operação maior com mais estrutura, catálogo e governança.",',
    ),
    (
        '"Prompt Avançado + 5 Skills Nível I + 3 Skills Nível II",',
        '"Agente avançado + 5 skills essenciais + 3 skills de expansão",',
    ),
    (
        '"400 PREU (10.000 e-books) + 200 Packs A² SiSu",',
        '"10.000 e-books para vender + 200 cotas extras de expansão",',
    ),
    (
        '"10 Títulos de Capitalização (R$ 10.000) · Comissão até 5º nível (10%)",',
        '"Benefícios financeiros especiais + comissão de até 10% no 5º nível",',
    ),
    (
        'description: "Pack AOIII — orquestração plena.",',
        'description: "Pack AOIII — coloca a operação em nível completo de coordenação e escala.",',
    ),
    (
        '"Prompt Avançado + 7 Skills Nível I + 5 Skills Nível II + 2 Skills Nível III",',
        '"Agente avançado + 14 skills somadas entre base, expansão e nível estratégico",',
    ),
    (
        '"800 PREU (20.000 e-books) + 300 Packs A² + 1 Pack AO SiSu",',
        '"20.000 e-books para vender + 300 cotas extras + 1 cota premium de expansão",',
    ),
    (
        '"20 Títulos de Capitalização · 20% comissão até 3º nível",',
        '"Benefícios financeiros ampliados + 20% de comissão até o 3º nível",',
    ),
    (
        'description: "Pack AA — nível CEO. Entrada no Hall de Sócios Nexus.",',
        'description: "Pack AA — entrada em uma camada estratégica com benefícios exclusivos e visão de liderança.",',
    ),
    (
        'badge: "CEO",',
        'badge: "Estratégico",',
    ),
    (
        '"7 Skills Nível I + 7 Nível II + 5 Skills Nível III",',
        '"19 skills somadas entre base, expansão e nível estratégico",',
    ),
    (
        '"2.000 PREU (50.000 e-books) + 500 Packs A² SiSu",',
        '"50.000 e-books para vender + 500 cotas extras de expansão",',
    ),
    (
        '"BeYour Banker Investments · 100 TPR · Hall de Sócios Nexus",',
        '"Benefícios financeiros premium + participação em vantagens exclusivas do ecossistema",',
    ),
    (
        'description: "Pack AAII — royalties, dividendos e TPR ampliados.",',
        'description: "Pack AAII — amplia receitas especiais, recorrência e vantagens estratégicas.",',
    ),
    (
        'badge: "Royalties",',
        'badge: "Expansão estratégica",',
    ),
    (
        '"7 Skills Nível I + 7 Nível II + 7 Skills Nível III",',
        '"21 skills somadas entre base, expansão e nível estratégico",',
    ),
    (
        '"4.000 PREU (100.000 e-books) + 1.000 Packs A² SiSu",',
        '"100.000 e-books para vender + 1.000 cotas extras de expansão",',
    ),
    (
        '"250 TPR · Royalties mensais · 40 Títulos Impactos",',
        '"Receitas especiais recorrentes + benefícios financeiros de alto impacto",',
    ),
    (
        'description: "Pack AAIII — acesso pleno e patrocínio Harp\'IA até R$ 500.000.",',
        'description: "Pack AAIII — acesso máximo ao ecossistema com benefícios especiais e apoio a novos projetos.",',
    ),
    (
        'badge: "Pleno · Hall N",',
        'badge: "Acesso total",',
    ),
    (
        '"Acesso PLENO ao Prompt Básico + Intermediário + Avançado",',
        '"Acesso total às capacidades essenciais, profissionais e estratégicas do agente",',
    ),
    (
        '"6.000 PREU (200.000 e-books) + 2.000 Packs A² SiSu",',
        '"200.000 e-books para vender + 2.000 cotas extras de expansão",',
    ),
    (
        '"500 TPR · Royalties até R$ 500.000 · Hall N + Patrocínio Harp\'IA",',
        '"Vantagens máximas do ecossistema + receitas especiais e apoio a projetos prioritários",',
    ),
    (
        '    tier === "pleno" ? "Acesso PLENO (Básico+Intermediário+Avançado)"\n    : tier === "avancado" ? "Prompt Avançado"\n    : tier === "intermediario" ? "Prompt Intermediário"\n    : "Prompt Básico";',
        '    tier === "pleno" ? "Acesso total do agente"\n    : tier === "avancado" ? "Agente avançado"\n    : tier === "intermediario" ? "Agente profissional"\n    : "Agente essencial";',
    ),
    (
        'description: `Pack adquirido via ativação mensal. O agente IA usa este plano para habilitar vendas, skills e rotinas operacionais.`,',
        'description: `Pack ativo na sua jornada. Ele libera novas ofertas, amplia o agente e fortalece sua operação comercial.`,',
    ),
    (
        'description: `${pack.ebooks.toLocaleString("pt-BR")} e-books liberados para revenda direta pelo agente IA.`,',
        'description: `${pack.ebooks.toLocaleString("pt-BR")} e-books liberados para revenda no seu catálogo e no mini-site.`,',
    ),
    (
        'title: `Pacotes PREU ${pack.shortName}`,',
        'title: `Pacotes extras ${pack.shortName}`,',
    ),
    (
        'description: `${pack.preuPacks.toLocaleString("pt-BR")} pacotes PREU disponíveis para operação comercial do agente.`,',
        'description: `${pack.preuPacks.toLocaleString("pt-BR")} pacotes extras com lotes de e-books para ampliar sua vitrine de vendas.`,',
    ),
    (
        'badge: "PREU",',
        'badge: "Extras",',
    ),
]

packs_replacements = [
    ('title: "SCC Preditivo",', 'title: "Escala Comercial",'),
    ('subtitle: "Escala e previsibilidade comercial",', 'subtitle: "Mais alcance, consistência e ritmo de vendas",'),
    ('title: "SCC Generativo",', 'title: "Criação Estratégica",'),
    ('subtitle: "Nível profissional de criação",', 'subtitle: "Mais conteúdo, mais distribuição, mais valor percebido",'),
    ('title: "SCC Orquestrador",', 'title: "Orquestração",'),
    ('subtitle: "Operação corporativa e sandbox",', 'subtitle: "Coordenação ampla da operação e do crescimento",'),
    ('title: "IA Agêntica SCC+",', 'title: "Liderança Estratégica",'),
    ('subtitle: "Camada executiva e estratégica",', 'subtitle: "Benefícios de alto nível para expansão e liderança",'),
    ('"pack-a2": \'0 diretos na Rede "N.O".\',', '"pack-a2": "Comece com o Pack A² e ative sua primeira etapa na jornada.",'),
    ('"pack-a2ii": \'Rede "N.O" com 2 Agentes Afiliados A²: 1.000 XP x 2 = 2.000 XP + 3.000 XP do Pack A²II = 5.000 XP.\',', '"pack-a2ii": "Avance com 2 diretos ativos e alcance 5.000 XP para liberar o próximo passo.",'),
    ('"pack-a2iii": \'Rede "N.O" com 5 Agentes Afiliados A²: 1.000 XP x 5 = 5.000 XP + 5.000 XP do Pack A²III = 10.000 XP.\',', '"pack-a2iii": "Com 5 diretos ativos e 10.000 XP, sua estrutura ganha mais força comercial.",'),
    ('"pack-ag": \'Rede "N.O" com 10 Agentes Afiliados A²II: 30.000 XP + 10.000 XP de 2º nível + 25.000 XP do Pack AG = 65.000 XP.\',', '"pack-ag": "Chegue a 65.000 XP e 10 diretos para entrar em um novo patamar de escala.",'),
    ('"pack-agii": \'Rede "N.O" com 20 Agentes Afiliados A²III = 100.000 XP + 60.000 XP de 2º nível + 50.000 XP do Pack AGII = 210.000 XP.\',', '"pack-agii": "Com 20 diretos e 210.000 XP, a operação ganha mais catálogo e maior alcance.",'),
    ('"pack-agiii": \'Rede "N.O" com 30 Agentes Afiliados A²III = 150.000 XP + 90.000 XP de 2º nível + 75.000 XP do Pack AGIII = 315.000 XP.\',', '"pack-agiii": "Ao chegar a 315.000 XP e 30 diretos, você consolida a fase de expansão comercial.",'),
    ('"pack-agn": \'Rede "N.O" com 10 Agentes Preditivos AGII = 500.000 XP + 250.000 XP de 2º nível + 100.000 XP do Pack AGN = 850.000 XP.\',', '"pack-agn": "A marca de 850.000 XP leva sua operação para uma fase mais criativa e estratégica.",'),
    ('"pack-agnii": \'Rede "N.O" com 20 Agentes Preditivos AGIII = 1.500.000 XP + 1.000.000 XP de 2º nível + 200.000 XP do Pack AGNII = 2.700.000 XP.\',', '"pack-agnii": "Com 2.700.000 XP e 20 diretos, você amplia produção, presença e resultados.",'),
    ('"pack-agniii": \'Rede "N.O" com 30 Agentes Preditivos AGIII = 2.250.000 XP + 1.500.000 XP de 2º nível + 300.000 XP do Pack AGNIII = 4.050.000 XP.\',', '"pack-agniii": "O nível de 4.050.000 XP posiciona sua operação em liderança criativa e comercial.",'),
    ('"pack-ao": \'Rede "N.O" com 10 Agentes Generativos AGNIII = 3.000.000 XP + 2.000.000 XP de 2º nível + 500.000 XP do Pack AO = 5.500.000 XP.\',', '"pack-ao": "Ao alcançar 5.500.000 XP, você entra em uma fase de coordenação mais ampla da operação.",'),
    ('"pack-aoii": \'Rede "N.O" com 20 Agentes Generativos AGNIII = 6.000.000 XP + 4.000.000 XP de 2º nível + 1.000.000 XP do Pack AOII = 11.000.000 XP.\',', '"pack-aoii": "Com 11.000.000 XP e 20 diretos, a operação ganha estrutura de expansão de grande porte.",'),
    ('"pack-aoiii": \'Rede "N.O" com 30 Agentes Generativos AGNIII = 9.000.000 XP + 6.000.000 XP de 2º nível + 2.000.000 XP do Pack AOIII = 17.000.000 XP.\',', '"pack-aoiii": "A partir de 17.000.000 XP, sua coordenação comercial entra em estágio pleno.",'),
    ('"pack-aa": \'Rede "N.O" com 10 Agentes Orquestradores AOIII = 20.000.000 XP + 10.000.000 XP de 2º nível + 5.000.000 XP do Pack AA = 35.000.000 XP.\',', '"pack-aa": "Com 35.000.000 XP, você acessa a primeira camada de liderança estratégica do ecossistema.",'),
    ('"pack-aaii": \'Rede "N.O" com 20 Agentes Orquestradores AOIII = 40.000.000 XP + 20.000.000 XP de 2º nível + 10.000.000 XP do Pack AAII = 70.000.000 XP.\',', '"pack-aaii": "Com 70.000.000 XP, sua operação entra em uma fase de receitas especiais ampliadas.",'),
    ('"pack-aaiii": \'Rede "N.O" com 30 Agentes Orquestradores AOIII = 60.000.000 XP + 30.000.000 XP de 2º nível + 20.000.000 XP do Pack AAIII = 110.000.000 XP.\',', '"pack-aaiii": "Ao chegar a 110.000.000 XP, você alcança o nível máximo de benefícios e acesso do ecossistema.",'),
    ('{ id: "agentic", label: "Agentic" },', '{ id: "agentic", label: "Estratégico" },'),
    ('Catálogo profissional de packs', 'Vitrine oficial de packs'),
    ('15 planos oficiais do PD/SCC', '15 planos oficiais de evolução'),
    ('A vitrine foi reorganizada para parecer um catálogo premium: preço em destaque, benefícios visuais, critérios de liberação,\n                  estágio de carreira e CTA de compra apresentados como uma experiência de e-commerce mais sofisticada.', 'Organizamos a vitrine para facilitar a escolha: preço em destaque, benefícios claros, requisitos de avanço e um fluxo de compra mais objetivo.'),
    ('<p className="text-sm font-semibold text-white">Status do pack</p>', '<p className="text-sm font-semibold text-white">Status do plano</p>'),
    ('<Badge className="border border-white/10 bg-white/5 text-slate-300">Prompt {pack.promptTier}</Badge>', '<Badge className="border border-white/10 bg-white/5 text-slate-300">Nível do agente: {pack.promptTier}</Badge>'),
]

estoque_replacements = [
    (
        '<strong className="text-white">Nexus SaaS</strong> está vinculada às plataformas parceiras. O Agente IA usa o perfil oficial para revenda, tracking de comissões e sincronização do catálogo operacional.',
        '<strong className="text-white">Nexus Affil\'IA\'te</strong> conecta seu catálogo às plataformas parceiras. O Agente IA usa esse perfil para divulgar ofertas, acompanhar comissões e manter sua vitrine sempre pronta para vender.',
    ),
    (
        '{feedMeta.isLive ? "Feed ao vivo conectado" : "Fallback inteligente ativo"}',
        '{feedMeta.isLive ? "Feed ao vivo conectado" : "Curadoria demonstrativa ativa"}',
    ),
    (
        'Enquanto o backend não estiver acessível, a página mantém a curadoria oficial Nexus SaaS em modo offline.',
        'Enquanto a conexão ao vivo não retorna, a página mantém uma curadoria oficial demonstrativa para você continuar usando a vitrine.',
    ),
    (
        'Loja virtual do estoque · produtos prontos para automação',
        'Vitrine do seu estoque · ofertas prontas para vender',
    ),
    (
        'Aqui ficam as unidades disponíveis para revenda. Cada produto pode ser exibido em formato de <strong className="text-white">vitrine</strong>, sincronizado com o Agente IA e publicado no <strong className="text-white">mini-site</strong> para vendas automatizadas.',
        'Aqui ficam as unidades disponíveis para revenda. Cada produto pode entrar na sua <strong className="text-white">vitrine</strong>, ser sincronizado com o Agente IA e aparecer no <strong className="text-white">mini-site</strong> para acelerar suas vendas.',
    ),
    (
        'Seu estoque ainda está vazio. Faça uma ativação mensal ou adquira mais materiais no Marketplace para abastecer o agente.',
        'Seu estoque ainda está vazio. Ative um pack ou adquira mais materiais no marketplace para abastecer sua vitrine.',
    ),
    (
        'Cada pack alimenta a vitrine com cota oficial de e-books, PREU e demais materiais operacionais.',
        'Cada pack adiciona novas bibliotecas, lotes extras e materiais que fortalecem sua vitrine de vendas.',
    ),
    (
        'Fluxo operacional recomendado',
        'Fluxo recomendado',
    ),
    (
        'Estoque → sincronização com o agente → mini-site → apresentação automatizada → pagamento.',
        'Estoque → sincronização com o agente → mini-site → apresentação da oferta → pagamento.',
    ),
    (
        'Origem: API ao vivo',
        'Origem: ao vivo',
    ),
    (
        'Origem: Curadoria Nexus',
        'Origem: curadoria Nexus',
    ),
    (
        'Envie esta oportunidade para o Agente IA monitorar demanda e montar abordagem comercial no ecossistema {partner?.affiliateProfile ?? "Nexus SaaS"}.',
        'Envie esta oportunidade para o Agente IA acompanhar a demanda e sugerir a melhor abordagem comercial dentro do ecossistema {partner?.affiliateProfile ?? "Nexus Affil\'IA\'te"}.',
    ),
]

affiliate_replacements = [
    (
        'Os produtos marcados em <strong className="text-white">Meu Estoque</strong> como “Sincronizar com Agente” aparecem aqui como vitrine operacional do mini-site. O Agente IA usa esse catálogo para apresentar ofertas, acelerar prospecção e encaminhar vendas com mais contexto comercial.',
        'Os produtos marcados em <strong className="text-white">Meu Estoque</strong> como “Sincronizar com Agente” aparecem aqui como vitrine do seu mini-site. O Agente IA usa esse catálogo para apresentar ofertas, facilitar conversas e encaminhar vendas com mais contexto comercial.',
    ),
    (
        'Estado atual do catálogo que o Agente IA pode utilizar em apresentações e fluxos de venda.',
        'Visão atual do catálogo que o Agente IA pode usar em apresentações e oportunidades de venda.',
    ),
    (
        '{catalog.length > 0 ? "Catálogo pronto para automação" : "Aguardando sincronização inicial"}',
        '{catalog.length > 0 ? "Catálogo pronto para vender" : "Aguardando primeira sincronização"}',
    ),
    (
        'Há itens válidos disponíveis para campanhas, recomendações do agente e exibição em vitrine comercial.',
        'Há itens válidos disponíveis para campanhas, recomendações do agente e exibição na sua vitrine comercial.',
    ),
    (
        'Vá até Meu Estoque e sincronize ao menos um produto para que o mini-site passe a trabalhar como vitrine comercial.',
        'Vá até Meu Estoque e sincronize pelo menos um produto para que o mini-site comece a funcionar como sua vitrine comercial.',
    ),
    (
        'Estoque → sincronização com agente → mini-site → apresentação automatizada → checkout operacional.',
        'Estoque → sincronização com agente → mini-site → apresentação da oferta → checkout.',
    ),
    (
        'Cada card abaixo representa uma oferta que já pode ser usada em campanhas, apresentações e vendas automatizadas.',
        'Cada card abaixo representa uma oferta que já pode ser usada em campanhas, apresentações e vendas com apoio do agente.',
    ),
    (
        'Há <strong className="text-white">{previewCatalog.length}</strong> itens operacionais elegíveis no estoque, mas nenhum foi sincronizado ainda. Ative a sincronização para publicar sua vitrine automatizada.',
        'Há <strong className="text-white">{previewCatalog.length}</strong> itens elegíveis no estoque, mas nenhum foi sincronizado ainda. Ative a sincronização para publicar sua vitrine.',
    ),
]

marketplaces_replacements = [
    (
        '{isPublicView ? "O que vem no seu estoque" : "Meu estoque operacional"}',
        '{isPublicView ? "O que entra na sua vitrine" : "Meu estoque"}',
    ),
    (
        ': "Produtos que o Agente IA pode usar para automação e revenda."}',
        ': "Produtos que o Agente IA pode usar para apresentar ofertas e apoiar suas vendas."}',
    ),
    (
        '{ title: "Pacotes PREU AG", badge: "PREU", desc: "Pacotes comerciais com 25 e-books cada." },',
        '{ title: "Pacotes extras AG", badge: "Extras", desc: "Lotes com 25 e-books cada para ampliar sua vitrine." },',
    ),
    (
        '{ title: "Pack SiSu de indicação", badge: "SiSu", desc: "Sub-contas vinculadas ao seu CPF." },',
        '{ title: "Cotas de expansão", badge: "Expansão", desc: "Cotas extras liberadas para ampliar sua operação." },',
    ),
]

replace_text('frontend/src/pages/Home.tsx', home_replacements)
replace_text('frontend/src/lib/nexus-marketplace.ts', nexus_replacements)
replace_text('frontend/src/pages/PacksMarketplace.tsx', packs_replacements)
replace_text('frontend/src/pages/Estoque.tsx', estoque_replacements)
replace_text('frontend/src/pages/AffiliateMiniSite.tsx', affiliate_replacements)
replace_text('frontend/src/pages/Marketplaces.tsx', marketplaces_replacements)
print('done')
