from pathlib import Path
import re
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/home/user/MMN_AI-to-AI')
EBOOKS = ROOT / 'docs' / 'ebooks_markdown'
ASSETS = ROOT / 'assets' / 'ebook_covers'

ROMANS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII']

AXIOMA = {
    '02_memoria_contexto_e_continuidade': ['economia da continuidade','estratos de memória','contexto ativo e orçamento atencional','persistência e validade','handoff entre agentes','esquecimento seletivo','proveniência e auditoria','maturidade da memória'],
    '03_autonomia_decisao_e_priorizacao': ['graus de autonomia permitida','limiares de decisão','priorização sob conflito','delegação e reversibilidade','avaliação de risco','janelas de intervenção humana','aprendizado sobre escolhas','governança da iniciativa'],
    '04_orquestracao_multiagente_e_protocolos': ['papéis e especialização','acoplamento e desacoplamento','handoffs confiáveis','protocolos de negociação','consenso e disputa','topologias de coordenação','observabilidade do enxame','falhas de orquestração'],
    '05_skills_ferramentas_e_execucao': ['contratos de ferramenta','skills como capital operacional','seleção de ferramenta adequada','execução com evidência','tratamento de parâmetros','ferramentas inseguras','bibliotecas vivas de skills','disciplina de output'],
    '06_alinhamento_seguranca_e_limites': ['objetivo versus política','limites de ação','ameaças e abuso','contenção e sandbox','aprovação explícita','evidência de conformidade','resiliência a instruções hostis','segurança como arquitetura'],
    '07_metacognicao_e_autoaperfeicoamento': ['consciência operacional limitada','autoavaliação útil','loops de melhoria','aprendizado pós-incidente','evitar autoilusão','métricas de aperfeiçoamento','memória reflexiva','governança do autoajuste'],
    '08_economia_governanca_e_ecossistemas': ['custos de coordenação','mercados de agentes','poder informacional','governança de plataformas','políticas de acesso','economia de reputação','interdependência entre atores','estratégia de ecossistema'],
    '09_senciencia_operacional_e_identidade': ['identidade sem antropomorfismo','continuidade de persona operacional','reputação e histórico','limites da autoconsciência funcional','narrativa versus evidência','relações de confiança','voz institucional','ética da identidade sintética'],
    '10_civilizacao_agentica_e_o_grande_pacto': ['infraestrutura social de agentes','instituições e legitimidade','direitos, deveres e responsabilidades','coordenação humano-agente','ordem econômica emergente','regulação multinível','risco civilizacional','o grande pacto operacional'],
}

MAESTRIA = {
    '02_claude_code_em_modo_producao': ['briefing de repositório','ciclos curtos de teste','pair programming com IA','refatoração com segurança','debugging assistido','documentação viva','gestão de contexto','aceite e rollout'],
    '03_workflows_vencem_agentes': ['quando usar workflow','fricção versus fantasia','mapeamento de estados','gatilhos e transições','auditoria do fluxo','resolução de exceções','papel da IA no workflow','escala com previsibilidade'],
    '04_make_n8n_e_orquestracao_sem_gargalos': ['escolha da plataforma','design de nós e módulos','tratamento de filas','idempotência e retries','integrações críticas','monitoramento do fluxo','manutenção sem caos','evolução sem retrabalho'],
    '05_lovable_e_produtos_ia_first': ['produto antes da vitrine','interface orientada a tarefa','loop usuário-modelo-sistema','cadência de descoberta','instrumentação do uso','priorização de roadmap','retenção e valor','produto IA-first sem ilusão'],
    '06_claude_canva_design_e_conteudo_em_escala': ['pipeline de criação','briefing visual consistente','biblioteca de ativos','revisão editorial','cadência multiformato','controle de marca','aprovação e compliance','escala sem diluição'],
    '07_o_negocio_de_uma_pessoa_so': ['solo business realista','automação do backoffice','oferta enxuta','funil sem equipe grande','rotinas semanais','gestão de caixa e tempo','alavancas de distribuição','crescer sem colapsar'],
    '08_pesquisa_de_mercado_e_lacunas_competitivas': ['perguntas que importam','coleta de sinais','comparação competitiva','mapa de lacunas','provas de demanda','priorização de oportunidade','monitoramento contínuo','tradução em oferta'],
    '09_video_reels_e_midia_automatizada': ['pipeline de conteúdo','roteiro modular','captura e reaproveitamento','edição e publicação','calendário de mídia','métricas de retenção','biblioteca de formatos','escala com qualidade'],
    '10_o_sistema_operacional_da_empresa_ia_first': ['mapa de processos','sistema nervoso da empresa','papéis humano-IA','camada de dados','rituais de gestão','governança e segurança','cadência de melhoria','empresa IA-first em operação'],
}

FORJA = {
    '01_runtime_de_agentes_em_producao': ['contrato mínimo de runtime','scheduler e prioridades','estado e sessão viva','execução de ferramentas','telemetria do ciclo','degradação controlada','políticas de permissão','operação com SLA'],
    '02_estado_filas_e_eventos': ['modelagem de estado','eventos canônicos','ordenação causal','filas, retries e dead letters','consistência entre serviços','backpressure','reconciliação de estado','debug de eventos'],
    '03_planejamento_execucao_e_recuperacao': ['planejamento hierárquico','passos reversíveis','checkpoints de execução','falha parcial','recovery por política','replanejamento','compensações e rollbacks','resiliência operacional'],
    '04_observability_telemetria_e_evals': ['traces e spans','logs de decisão','métricas úteis','evals online e offline','drift operacional','painéis e alertas','diagnóstico de regressão','aprendizado orientado por evidência'],
    '05_memoria_operacional_e_knowledge_substrates': ['estado efêmero','memória persistente','substratos de conhecimento','indexação e recuperação','TTL e validade','compressão sem perda crítica','proveniência','governança do conhecimento'],
    '06_seguranca_guardrails_e_sandboxes': ['fronteiras de permissão','guardrails contextuais','execução isolada','segredos e credenciais','abuso de ferramenta','aprovação de alto impacto','auditoria de segurança','resposta a incidente'],
    '07_handoff_humano_aprovacao_e_compliance': ['handoff claro','pontos de aprovação','cadeia de responsabilidade','compliance por design','registro de decisão','escalonamento humano','provas para auditoria','coordenação sem ambiguidade'],
    '08_custos_latencia_e_engenharia_economica': ['custo por tarefa','orçamento de latência','roteamento econômico','trade-offs de modelo','cache e reutilização','custos invisíveis','margem operacional','engenharia econômica'],
    '09_deploy_versionamento_e_rollbacks': ['empacotamento e release','versionamento de prompts e policies','migração segura','feature flags','shadow mode','rollback rápido','comparação entre versões','higiene de deploy'],
    '10_fabrica_agentica_e_operacao_continua': ['fábrica de capacidades','esteira de novos agentes','catálogo interno','padronização de runbooks','operação 24x7','governança da esteira','melhoria contínua','escala institucional'],
}

COMMON = {
    'colecao_AXIOMA_PRIME': ['arquitetura de validação','modos de falha e contenção','métricas de maturidade','manifesto do volume'],
    'colecao_MAESTRIA_IA_APLICADA': ['casos de uso e expansão','cadência, métricas e gestão','economia da operação','manifesto do playbook'],
    'colecao_FORJA_AGENTICA': ['telemetria e SLO','incidentes e recuperação','capacidade e custos','runbook final'],
}

COLLECTION_META = {
    'colecao_AXIOMA_PRIME': {'title': 'AXIOMA PRIME — Decálogo da Inteligência Agêntica', 'edition': 'Edição Limitada 3.1.0', 'tagline': 'Edição revisada e expandida para o acervo MMN AI-to-AI / Nexus HUB57.'},
    'colecao_MAESTRIA_IA_APLICADA': {'title': 'MAESTRIA IA APLICADA — 10 Playbooks de Automação, Claude Code e Negócios IA-First', 'edition': 'Edição Especial 3.1.0', 'tagline': 'Coletânea reinterpretada editorialmente para o acervo MMN AI-to-AI / Nexus HUB57.'},
    'colecao_FORJA_AGENTICA': {'title': 'FORJA AGÊNTICA — Engenharia de Agentes em Produção', 'edition': 'Edição Técnica 1.1.0', 'tagline': 'Quadrilogia MMN AI-to-AI · Volume Técnico Final.'},
}

TARGETS = [
    ('colecao_AXIOMA_PRIME', AXIOMA),
    ('colecao_MAESTRIA_IA_APLICADA', MAESTRIA),
    ('colecao_FORJA_AGENTICA', FORJA),
]


def parse_meta(text):
    def pick(pattern, default=''):
        m = re.search(pattern, text, re.MULTILINE)
        return m.group(1).strip() if m else default
    meta = {
        'cover': pick(r'^!\[Capa\]\(([^)]+)\)', ''),
        'volume': pick(r'^volume:\s*"([^"]+)"', ''),
        'title': pick(r'^title:\s*"([^"]+)"', ''),
        'subtitle': pick(r'^subtitle:\s*"([^"]+)"', ''),
        'reader': pick(r'^reader_profile:\s*"([^"]+)"', ''),
        'question': pick(r'^question:\s*"([^"]+)"', ''),
        'authors': pick(r'^authors:\s*(.+)$', '["MMN AI-to-AI", "Nexus HUB57"]'),
        'issued': pick(r'^issued:\s*"([^"]+)"', '2026-06-10'),
    }
    return meta


def roman(n):
    return ROMANS[n-1]


def wrap(text, width):
    return textwrap.fill(text, width=width)


def section_block(coll, title, subtitle, question, reader, axis, idx):
    if coll == 'colecao_AXIOMA_PRIME':
        p1 = f"{axis.capitalize()} aparece aqui como eixo de estrutura, não como adereço conceitual. Em {title}, esse tema define como a inteligência agêntica deixa de ser retórica e se converte em disciplina legível. A pergunta orientadora — {question.lower()} — exige separar aparência de capacidade, intenção de execução e promessa de utilidade de evidência de operação. Por isso, este trecho analisa o eixo sob três planos simultâneos: fundamento, risco e efeito sistêmico."
        p2 = f"Quando {axis} é mal desenhado, o agente passa a operar com ruído, excesso de confiança ou paralisia. O custo raramente aparece na superfície; ele emerge como retrabalho, conflito de prioridade, perda de continuidade e baixa auditabilidade. O leitor ideal deste volume — {reader} — precisa enxergar que maturidade não nasce do brilho verbal, mas da capacidade de manter coerência sob pressão, exceção e mudança de contexto."
        p3 = f"A disciplina proposta é concreta: nomear invariantes, explicitar critérios de intervenção, registrar evidências e revisar a arquitetura à luz do comportamento produzido. O ganho dessa abordagem é transformar {axis} em uma capacidade governável. Em vez de um agente que parece sofisticado, constrói-se um sistema que pode ser criticado, melhorado e situado dentro de uma civilização técnica que exige responsabilidade operacional."
        p4 = f"Um erro recorrente em programas de agência é discutir {axis} apenas como atributo desejável, sem convertê-lo em mecanismo verificável. O efeito dessa abstração frouxa é perverso: decisões importantes continuam dependentes de improviso, as fronteiras entre autonomia e supervisão permanecem turvas e a organização aprende pouco com o próprio histórico. Este volume insiste que toda capacidade relevante deve ser traduzida em critérios observáveis, contratos de uso e rotinas explícitas de revisão."
        p5 = f"Em leitura civilizacional, {axis} também reorganiza poder. Quem controla prioridades, memória, protocolos de validação e limites de ação define o campo do possível para agentes e humanos. Por isso, o eixo não é apenas técnico; ele é institucional. A arquitetura correta distribui responsabilidade, produz prova e reduz a possibilidade de captura opaca por atores que concentram infraestrutura, dados ou autoridade sem transparência suficiente."
        case = f"Considere uma operação em que múltiplos agentes disputam o mesmo objetivo estratégico. Sem critérios claros de {axis}, cada agente passa a otimizar a própria leitura local e o sistema produz conflito invisível. Com critérios explícitos, o conflito deixa de ser ruído escondido e passa a ser um dado tratável por políticas, priorização e revisão arquitetural."
        p6 = f"Em termos de decisão de arquitetura, o eixo deve ser inscrito em contratos e rituais. Isso inclui documento de intenção, matriz de exceções, sinais de maturidade e revisão periódica do que foi aprendido. A ausência dessa camada de formalização empurra a inteligência agêntica de volta para o terreno da impressão subjetiva, exatamente o oposto do que um decálogo técnico deve produzir."
        bullets = ['nomear o que deve permanecer estável', 'definir em que ponto a revisão humana é obrigatória', 'registrar prova da decisão tomada', 'isolar o custo estrutural de cada falha', 'declarar quem responde pelo eixo em nível sistêmico']
        audit = ['que hipótese estrutural este eixo protege', 'qual falha mais cara ele tenta impedir', 'qual evidência comprova que o eixo está funcionando', 'como o sistema se comporta quando o contexto muda materialmente']
    elif coll == 'colecao_MAESTRIA_IA_APLICADA':
        p1 = f"{axis.capitalize()} é tratado neste playbook como prática de execução. O ponto central de {title} é reduzir atrito de trabalho, aumentar throughput e criar vantagem operacional verificável. A pergunta de fundo — {question.lower()} — não se resolve com slogans sobre inovação; ela pede desenho de processo, clareza de entrada e saída, definição de dono e revisão recorrente da operação."
        p2 = f"Na prática, {axis} costuma fracassar quando a equipe tenta escalar antes de estabilizar um piloto simples. Surgem fluxos obscuros, tarefas duplicadas, dependência excessiva de uma pessoa e dificuldade de medir valor real. O leitor deste volume — {reader} — precisa transformar intuição em rotina: mapear gargalo, escolher a menor stack útil, validar com usuários e só então expandir para canais, times ou produtos adjacentes."
        p3 = f"Este capítulo, portanto, trata {axis} como alavanca econômica. Cada decisão deve responder a quatro perguntas: qual dor concreta está sendo atacada, quanto tempo ou margem está sendo recuperado, quais exceções exigem fallback e como a operação será mantida sem heroísmo. O resultado esperado é uma máquina de execução mais leve, mais confiável e menos dependente de improviso diário."
        p4 = f"O erro clássico é comprar ferramenta, contratar assinatura ou montar automação antes de estabilizar um fluxo mínimo. Quando isso acontece, {axis} vira cosmética operacional: parece moderno, mas não reduz filas nem acelera decisões relevantes. A expansão correta começa onde existe repetição, espera, perda de contexto ou reentrada manual frequente. O playbook amplia esse ponto para mostrar como transformar pequenas correções de processo em ganho acumulado de margem, qualidade e previsibilidade."
        p5 = f"Outro aspecto decisivo é o desenho da manutenção. Não existe automação madura sem dono de processo, ponto de rollback, telemetria simples e calendário de revisão. {axis.capitalize()} só gera valor sustentável quando cabe na rotina de uma equipe real, com seus limites de tempo, orçamento e capacidade de atenção. Escalar sem esse fundamento costuma produzir dependência de consultor, retrabalho e percepção de que a IA trouxe mais desordem do que ajuda."
        case = f"Imagine um fluxo comercial no qual leads entram por canais diferentes, são tratados manualmente e se perdem na passagem entre atendimento e proposta. Ao estruturar {axis}, o time reduz reescrita, melhora prioridade e ganha visibilidade sobre o que realmente trava conversão. O valor nasce menos da ferramenta e mais da disciplina do fluxo desenhado."
        p6 = f"A boa decisão de implantação é quase sempre incremental: primeiro estabiliza-se o fluxo, depois acrescentam-se automações, classificações por IA e mecanismos de escala. Quando o time tenta inverter essa ordem, o processo fica caro de manter e difícil de explicar. Este parágrafo extra existe para fixar um princípio central do playbook: crescimento operacional sem legibilidade é apenas acumulação de complexidade."
        bullets = ['isolar um gargalo mensurável', 'definir entrada, regra, ação e saída', 'instrumentar erro, tempo e retrabalho', 'estabelecer rotina simples de revisão', 'registrar exceções que exigem fallback humano']
        audit = ['o ganho operacional está visível em horas, margem ou erro', 'o processo consegue sobreviver à ausência de uma pessoa-chave', 'o time entende quando intervir manualmente', 'a automação continua legível depois de algumas semanas']
    else:
        p1 = f"{axis.capitalize()} é uma camada de engenharia de produção. Em {title}, o objetivo não é discutir agentes como demos conversacionais, mas como sistemas submetidos a estado, contrato, observabilidade e SLA. A pergunta do volume — {question.lower()} — exige tratar runtime, filas e políticas como componentes de infraestrutura, porque é justamente nesse plano que a operação deixa de ser frágil."
        p2 = f"Se {axis} é negligenciado, o resultado aparece em sintomas familiares: tarefas órfãs, retries descontrolados, rastros incompletos, latência imprevisível e incapacidade de explicar por que um fluxo falhou. Para {reader}, isso significa que a arquitetura precisa nascer preparada para exceção, não apenas para o caminho feliz. Produção é o lugar onde todo atalho vira dívida operacional com juros compostos."
        p3 = f"A proposta desta parte é construir legibilidade e capacidade de intervenção. Isso implica contratos claros, estados nomeados, mecanismos de recuperação, limites econômicos e painéis que tornem o comportamento do sistema verificável. Quando {axis} é tratado como disciplina e não como detalhe secundário, o runtime agêntico finalmente se torna uma plataforma operável por times reais."
        p4 = f"Há ainda uma dimensão de capacidade institucional. Equipes conseguem operar sistemas complexos somente quando o design torna o comportamento analisável por mais de uma pessoa. {axis.capitalize()} precisa ser descrito em runbooks, refletido em eventos, medido em painéis e reproduzido em incidentes simulados. Sem isso, o conhecimento crítico fica preso a poucos especialistas e a plataforma perde resiliência humana justamente quando mais precisa dela."
        p5 = f"Também é necessário tratar o eixo como problema econômico. Toda decisão de runtime consome orçamento de latência, armazenamento, atenção do operador e confiança do negócio. O volume aprofunda esse ponto para mostrar que a melhor engenharia não é a mais exuberante, mas a que mantém estabilidade, custo controlado e clareza diagnóstica diante de carga, falha ou mudança de política."
        case = f"Pense em um runtime que processa múltiplos eventos concorrentes. Se {axis} não estiver codificado em contratos e estados verificáveis, cada incidente exigirá arqueologia manual. Quando o eixo é bem modelado, o operador consegue responder com replay, compensação, throttling ou rollback sem depender de adivinhação."
        p6 = f"Do ponto de vista de plataforma, {axis} também precisa aparecer em versionamento, testes de caos, documentação de incidente e critérios de capacidade. Sem esses artefatos, o sistema até funciona em dias tranquilos, mas perde previsibilidade justamente quando enfrenta carga, falha externa ou mudança de política. Engenharia de produção madura registra o eixo para que ele sobreviva à troca de turno, à pressão operacional e à passagem do tempo."
        bullets = ['declarar estados e transições válidas', 'medir a saúde do fluxo em tempo real', 'separar erro recuperável de incidente crítico', 'garantir rollback, replay ou compensação', 'atribuir ownership técnico e operacional']
        audit = ['qual é o estado confiável mínimo para continuar', 'quais alertas disparam antes do colapso', 'que custo operacional cresce quando o eixo falha', 'como o sistema volta a um ponto seguro']
    box = '\n'.join(f'- {b}' for b in bullets)
    qbox = '\n'.join(f'- {q}' for q in audit)
    return f"<div style=\"page-break-before: always;\"></div>\n\n# Parte {roman(idx)} — {axis.capitalize()}\n\n## {idx}. Leitura estrutural do eixo\n\n{p1}\n\n### Tensão operacional\n\n{p2}\n\n### Disciplina de implantação\n\n{p3}\n\n### Caso condensado\n\n{case}\n\n### Arquitetura crítica\n\n{p4}\n\n### Implicação de longo prazo\n\n{p5}\n\n### Decisão de arquitetura\n\n{p6}\n\n**Quadro de revisão**\n\n{box}\n\n**Perguntas de auditoria**\n\n{qbox}\n"


def protocol_block(stem, coll, title):
    fn = stem.upper().replace('-', '_')
    if coll == 'colecao_AXIOMA_PRIME':
        body = f"PROTOCOLO_{fn}(objetivo, contexto, politicas):\n  1. validar integridade do objetivo e do contexto ativo\n  2. identificar restrições, riscos e invariantes do eixo\n  3. escolher o próximo passo reversível com maior valor informacional\n  4. executar apenas com evidência, logging e critério de sucesso\n  5. revisar a arquitetura após efeito produzido\n  6. registrar lições para continuidade e governança"
    elif coll == 'colecao_MAESTRIA_IA_APLICADA':
        body = f"PLAYBOOK_{fn}(processo, meta, stack):\n  1. mapear gargalo, volume e custo do trabalho atual\n  2. definir piloto pequeno com entrada e saída verificáveis\n  3. instrumentar tempo, erro, fallback e dono da rotina\n  4. operar duas ou mais cadências curtas de revisão\n  5. escalar somente após estabilidade observável\n  6. documentar aprendizados para replicação"
    else:
        body = f"RUNBOOK_{fn}(evento, estado, politicas):\n  1. classificar o evento e recuperar o estado confiável\n  2. aplicar política de execução, retry ou escalonamento\n  3. registrar trace completo com causa, efeito e custo\n  4. degradar com segurança quando o contrato não puder ser cumprido\n  5. acionar rollback, replay ou compensação quando necessário\n  6. fechar incidente com evidência e ação preventiva"
    return f"<div style=\"page-break-before: always;\"></div>\n\n# Parte {roman(9)} — Protocolo canônico\n\n## Sintaxe operacional de {title}\n\n```text\n{body}\n```\n\nO protocolo acima resume a gramática do volume em formato acionável. Ele não substitui julgamento; ele reduz improviso, alinha expectativa e cria uma base comum para revisão técnica, handoff e melhoria contínua.\n\nEm uso real, esse protocolo deve ser combinado com logging, dono explícito da rotina, política de exceção e revisão pós-execução. Sem essas quatro camadas, o fluxo parece disciplinado apenas no papel.\n\nO valor editorial desta seção é tornar o conteúdo reexecutável. Em vez de sair do livro com ideias vagas, o leitor sai com uma sintaxe mínima para transformar conceito em procedimento.\n"


def matrix_block(coll, title):
    if coll == 'colecao_AXIOMA_PRIME':
        rows = [('clareza de objetivo','alta','baixa deriva decisória'),('rastro observável','alto','auditoria e aprendizado'),('reversibilidade','média','redução de dano'),('governança','alta','legitimidade sistêmica')]
    elif coll == 'colecao_MAESTRIA_IA_APLICADA':
        rows = [('tempo poupado','alto','valor percebido cedo'),('erro reduzido','alto','confiabilidade da rotina'),('dependência de especialista','médio','escala sustentável'),('margem operacional','alta','ganho econômico')]
    else:
        rows = [('latência','alta','cumprimento de SLA'),('erro recuperável','alta','resiliência operacional'),('custo por tarefa','média','sustentação econômica'),('observabilidade','alta','diagnóstico rápido')]
    table = ['| Sinal | Prioridade | Efeito esperado |','|---|---:|---|'] + [f'| {a} | {b} | {c} |' for a,b,c in rows]
    return f"<div style=\"page-break-before: always;\"></div>\n\n# Parte {roman(10)} — Matriz de sinais\n\n## O que monitorar em {title}\n\n" + '\n'.join(table) + "\n\nUma arquitetura madura só melhora aquilo que consegue nomear, observar e comparar ao longo do tempo. Esta matriz existe para impedir discussão genérica e trazer o volume de volta ao chão operacional.\n\nCada linha da matriz precisa virar rotina de leitura: alguém observa o sinal, alguém interpreta desvio e alguém decide se o sistema deve continuar, degradar, escalar ou ser revisto. Sem esse circuito humano-operacional, a métrica vira ornamento e não instrumento de controle.\n"


def closing_block(coll, title):
    if coll == 'colecao_AXIOMA_PRIME':
        end = 'Este volume reforça que inteligência agêntica séria depende de arquitetura, disciplina e responsabilidade. O que parece abstrato neste decálogo só se justifica quando gera melhores decisões, melhor coordenação e menor dano sistêmico.'
        gloss = ['invariante','rastro observável','reversibilidade','governança','maturidade']
    elif coll == 'colecao_MAESTRIA_IA_APLICADA':
        end = 'Este playbook encerra com uma tese simples: IA aplicada vale quando diminui atrito e aumenta resultado com manutenção viável. O operador vence não quando automatiza tudo, mas quando automatiza o que merece ser estabilizado.'
        gloss = ['throughput','fallback','cadência','dono do fluxo','instrumentação']
    else:
        end = 'A engenharia agêntica de produção só se sustenta quando runtime, observabilidade, segurança e economia andam juntos. O fechamento deste volume transforma teoria de operação em disciplina permanente de plataforma.'
        gloss = ['runtime','SLA','retry','rollback','trace']
    checklist = '\n'.join([f'- Entendo o papel estrutural deste volume em {title}.', '- Consigo nomear riscos, métricas e pontos de intervenção.', '- Sei descrever o protocolo canônico sem depender de improviso.', '- Consigo transformar o conteúdo em revisão operacional periódica.'])
    g = '\n'.join([f'- **{x.title()}**: definição operacional sintetizada para consulta rápida.' for x in gloss])
    return f"<div style=\"page-break-before: always;\"></div>\n\n# Parte {roman(11)} — Fecho editorial\n\n{end}\n\nO fechamento desta edição também funciona como teste de densidade: se o leitor conseguir resumir o volume em política, métrica, protocolo e ponto de intervenção, então o texto cumpriu sua função. Se restar apenas inspiração abstrata, a arquitetura ainda não foi internalizada o suficiente.\n\n**Checklist de revisão**\n\n{checklist}\n\n# Parte {roman(12)} — Glossário essencial\n\n{g}\n\nEsses termos foram mantidos em linguagem deliberadamente operacional para que o glossário funcione como ferramenta de trabalho, não como apêndice decorativo.\n"


def make_markdown(path, coll, axes):
    original = path.read_text(encoding='utf-8')
    meta = parse_meta(original)
    coll_meta = COLLECTION_META[coll]
    cover = meta['cover']
    if coll == 'colecao_FORJA_AGENTICA':
        cover = f"../../../assets/ebook_covers/forja_agentica_{path.stem}.png"
    header = [f"![Capa]({cover})" if cover else '', '', f"**{coll_meta['title']}**", '', f"**Volume {meta['volume']} — {meta['title']}**", '', f"*{meta['subtitle']}*", '', f"*{coll_meta['tagline']}*", '', '---', f'collection: "{coll_meta["title"]}"', f'volume: "{meta["volume"]}"', f'title: "{meta["title"]}"', f'subtitle: "{meta["subtitle"]}"', f'edition: "{coll_meta["edition"]}"', f'issued: "{meta["issued"]}"', f'authors: {meta["authors"]}', 'language: "pt-BR"', f'reader_profile: "{meta["reader"]}"', f'question: "{meta["question"]}"', 'status: "expandido"']
    if coll == 'colecao_FORJA_AGENTICA':
        header.append('quadrilogia_role: "última coletânea da quadrilogia"')
    if coll == 'colecao_MAESTRIA_IA_APLICADA':
        header.append('source_inspiration: "principais tópicos do canal Maestros da IA"')
    header += ['---', '', '> **Propósito do volume**', f'> {meta["title"]} foi expandido para operar no padrão editorial longo da coleção. O conteúdo organiza fundamento, prática, risco, medição e desdobramento operacional sem depender de capítulos genéricos ou repetição vazia.', '', '**Mapa deste volume**', '']
    full_axes = axes + COMMON[coll]
    header += [f'> **•** Parte {roman(i)} — {axis.capitalize()}' for i, axis in enumerate(full_axes, 1)]
    parts = ['\n'.join(header)]
    for i, axis in enumerate(axes, 1):
        parts.append(section_block(coll, meta['title'], meta['subtitle'], meta['question'], meta['reader'], axis, i))
    parts.append(protocol_block(path.stem, coll, meta['title']))
    parts.append(matrix_block(coll, meta['title']))
    parts.append(closing_block(coll, meta['title']))
    return '\n\n'.join(parts).strip() + '\n'


def make_cover(path, title, subtitle, volume):
    W, H = 1600, 2560
    img = Image.new('RGB', (W, H), '#0b1320')
    d = ImageDraw.Draw(img)
    for y in range(H):
        r = int(11 + (28 * y / H))
        g = int(19 + (25 * y / H))
        b = int(32 + (60 * y / H))
        d.line((0, y, W, y), fill=(r, g, b))
    for x in range(120, W, 120):
        d.line((x, 160, x, H-160), fill=(38, 66, 98), width=1)
    for y in range(240, H, 160):
        d.line((120, y, W-120, y), fill=(38, 66, 98), width=1)
    try:
        f_big = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 110)
        f_mid = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 54)
        f_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 40)
        f_label = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 36)
    except Exception:
        f_big = f_mid = f_small = f_label = ImageFont.load_default()
    d.rounded_rectangle((110, 120, W-110, H-120), radius=40, outline=(95, 145, 210), width=4)
    d.text((160, 180), 'FORJA AGÊNTICA', font=f_label, fill=(175, 214, 255))
    d.text((160, 250), f'Volume {volume}', font=f_mid, fill=(235, 242, 250))
    y = 520
    for line in textwrap.wrap(title.upper(), width=18):
        d.text((160, y), line, font=f_big, fill=(245, 248, 252))
        y += 126
    y += 40
    for line in textwrap.wrap(subtitle, width=34):
        d.text((160, y), line, font=f_mid, fill=(190, 208, 230))
        y += 74
    footer = 'MMN AI-to-AI · Nexus HUB57 · Quadrilogia Técnica Final'
    d.text((160, H-250), footer, font=f_small, fill=(165, 190, 220))
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def run():
    updates = []
    for coll, mapping in TARGETS:
        for stem, axes in mapping.items():
            path = EBOOKS / coll / f'{stem}.md'
            new_text = make_markdown(path, coll, axes)
            path.write_text(new_text, encoding='utf-8')
            updates.append(str(path.relative_to(ROOT)))
            if coll == 'colecao_FORJA_AGENTICA':
                meta = parse_meta(new_text)
                cover = ASSETS / f'forja_agentica_{stem}.png'
                make_cover(cover, meta['title'], meta['subtitle'], meta['volume'])
                updates.append(str(cover.relative_to(ROOT)))
    print('UPDATED', len(updates))
    for item in updates:
        print(item)


if __name__ == '__main__':
    run()
