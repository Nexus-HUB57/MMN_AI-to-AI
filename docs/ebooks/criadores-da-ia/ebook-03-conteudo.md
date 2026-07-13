# Os Guardiões da IA Segura

## Dario Amodei, Daniela Amodei, Chris Olah e a Filosofia da Anthropic

**Subtítulo:** *Sete ex-OpenAI que abandonaram tudo para provar que a IA pode ser poderosa E responsável — a história do Claude*

**Tagline:** *"Eles poderiam ter ficado. Poderiam ter ficado ricos. Mas escolheram ir embora para defender uma ideia."*

> **Coletânea:** *Os Criadores por Trás das Maiores IAs — Volume 3 de 8*
> **Data de fechamento editorial:** Junho de 2026
> **Autoria editorial:** Coletânea Multiuniverso IA
> **Público-alvo:** líderes de produto, pesquisadores, policymakers, executivos e leitores que querem entender *quem*, de fato, decidiu que a IA precisava de guardiões.

**Por MMN AI-to-AI • 2026**

---

![Capa - Os Guardiões da IA Segura](capas/03-capa-anthropic.jpg)

---

## Sobre este ebook

Este é o **terceiro ebook** da coletânea **"Os Criadores por Trás das Maiores IAs"** — uma série de volumes dedicada a reconstruir, com rigor factual, ritmo narrativo e olhar crítico, as trajetórias das pessoas que, entre 2015 e 2026, arquitetaram a revolução da inteligência artificial. No primeiro volume, abrimos as portas da OpenAI e conhecemos Sam Altman, Greg Brockman e Ilya Sutskever — os três pais fundadores que, em 2015, juraram construir IA "para o benefício da humanidade". No segundo volume, entramos no Google DeepMind e encontramos Demis Hassabis, Shane Legg e Jeff Dean — os visionários britânicos e americanos que, com a mesma promessa pública, começaram do outro lado do Atlântico. Agora, no terceiro volume, vamos contar **a história que nenhum dos dois primeiros contou** — a história dos que **saíram de dentro** das casas que acabamos de visitar para construir uma terceira, **a casa dos guardiões**.

Essa casa se chama **Anthropic**. E os seus três pais fundadores — **Dario Amodei, Daniela Amodei, Chris Olah** — formam, juntos, o **tripé filosófico** que definiu, em 2021, uma das posições mais claras e mais controversas da história recente da tecnologia: **a IA não pode ser construída apenas para ser poderosa. Tem que ser construída para ser SEGURA. E, se for preciso, é melhor construir mais devagar do que construir errado.**

É importante dizer, logo de saída, que a história da Anthropic não é uma história de fundação ordinária. Não é uma história de "bilionário contrata pesquisadores para construir produto". É uma história de **dissidência filosófica** — sete pessoas, no fim de 2020, decidiram que a OpenAI, a casa onde trabalhavam, tinha se desviado da missão. E que, ao se desviar, tinha se tornado parte do problema que elas tinham ido, originalmente, ajudar a resolver. Em vez de protestar internamente, **foram embora**. Em vez de pedir demissão em silêncio, **levaram a missão com elas** e fundaram uma nova casa. Em vez de competir com a OpenAI em produtos, **decidiram competir em princípios**.

A Anthropic, em 2026, é a segunda maior empresa de IA pura do mundo — avaliada em mais de US$ 380 bilhões, com clientes como NASA, Lockheed Martin, Anthropic-PBC, AWS, Google, Pfizer, Novartis, JetBlue, e praticamente toda a Fortune 500. Seu modelo Claude é, em 2026, **o modelo preferido dos desenvolvedores de software** (com 64% do mercado de coding agents), **o modelo preferido das empresas Fortune 500** para tarefas de alta-stakes (jurídico, médico, financeiro), e **o modelo preferido de pesquisadores de IA safety** (incluindo, ironicamente, antigos colegas da OpenAI que, em 2023-2024, também se demitiram em ondas).

Mas a Anthropic não é, em primeiro lugar, uma história de sucesso comercial. É, em primeiro lugar, **uma história filosófica**. É a história de três pessoas — um físico teórico italiano-americano, uma ex-pesquisadora de saúde pública, e um canadense que queria abrir as caixas-pretas das redes neurais — que, em diferentes momentos de suas vidas, chegaram à mesma conclusão: **a humanidade está construindo algo que não entende. E quem não entende o que constrói não deveria construí-lo sem freios.**

Este ebook reconstrói essa história com o cuidado que ela merece. Você vai encontrar datas precisas, números, citações, bastidores. Vai encontrar também o lado humano: a infância de Dario em San Francisco entre a família italiana, a formação de Daniela em política pública e a virada dela para a OpenAI em 2016, a obsessão de Chris Olah em transformar redes neurais em objetos legíveis por humanos. Vai encontrar, em suma, **a história que os relatórios trimestrais da Anthropic não contam** — porque a Anthropic, em cinco anos, foi muito mais do que uma empresa. Foi **um experimento filosófico, corporativo e civilizacional** sobre o que acontece quando sete pessoas decidem que o ritmo da revolução tecnológica precisa, em algum momento, ser freado — não pelo Estado, não pelo mercado, mas por **pessoas comuns com convicções extraordinárias**.

Boa leitura.

---

## Sumário

1. **A Pandemia de 2020 — Quando Sete Pessoas Decidiram que Não Podiam Mais Esperar**
2. **Daniela e Dario Amodei — A Dupla que Liderou a Revolta Ética**
3. **Chris Olah e o Mistério das Caixas Pretas (Interpretabilidade, Circuits, Features)**
4. **A Fundação da Anthropic (Janeiro de 2021, $124M, PBC, "Race to the Top")**
5. **Constitutional AI e o Nascimento do Claude (2022–2023)**
6. **Claude 3, 3.5 Sonnet, Sonnet 4 — A Tomada do Mercado de Código (2024)**
7. **Constitutional AI Avançado, RLHF e o Conceito de "Scalable Oversight"**
8. **Os Modelos Soberanos, o Projeto de $40B e a Rivalidade com OpenAI (2025)**
9. **Claude em 2026 — Estado da Arte, Auditoria, Responsible Scaling Policies**
10. **Conclusão: A Filosofia que Definiu uma Empresa — Lições dos Guardiões**

---

# CAPÍTULO 1

## A Pandemia de 2020 — Quando Sete Pessoas Decidiram que Não Podiam Mais Esperar

### 1.1 A OpenAI em 2020: a casa que cresceu rápido demais

Para entender por que, em 2020, sete pessoas deixaram a OpenAI para fundar a Anthropic, é preciso entender **como a OpenAI era em 2020**. Não a OpenAI pública, dos comunicados otimistas e dos tweets de Sam Altman, mas a OpenAI **interna** — a organização que, naquele ano, começava a rachar por dentro, sem que o público soubesse.

A OpenAI em 2020 era, em números, **um sucesso estrondoso**. Tinha 1.500 funcionários, tinha acabado de licenciar o GPT-3 exclusivamente para a Microsoft (US$ 1 bilhão nos próximos cinco anos), tinha publicado o DALL·E (janeiro de 2021, mas já em desenvolvimento em 2020), e tinha iniciado o treinamento de modelos internos que se tornariam, em 2022, o InstructGPT e o ChatGPT. A valuation da subsidiária com fins lucrativos, naquele ano, era estimada em **US$ 20 bilhões**. Altman era, sem exagero, o **CEO mais visível do Vale do Silício**.

Mas havia, por baixo da superfície, **um mal-estar difuso** que, ao longo de 2020, se cristalizou em uma crise de identidade. A OpenAI tinha sido fundada, em 2015, com uma missão quase utópica: *"advance digital intelligence in the way that is most likely to benefit humanity as a whole, unconstrained by a need to generate financial return."* Em 2019, a organização tinha se tornado uma **"capped-profit"** (OpenAI LP), com a subsidiária Microsoft como âncora comercial. Em 2020, com o GPT-3 e o início do InstructGPT, ficou claro que **a OpenAI estava se tornando, cada vez mais, uma empresa de produtos** — uma empresa que, como todas as outras, tinha que gerar receita, fechar contratos, lançar APIs, e competir por market share.

Essa transição não era, em si, problemática. O problema era **a velocidade** com que ela estava acontecendo, e o fato de que **as preocupações de segurança estavam sendo, cada vez mais, deixadas de lado** nas decisões de produto. Em 2020, por exemplo, a OpenAI optou por **não publicar** os pesos do GPT-3 (apesar de o paper original prometer "abertura responsável"), em parte por pressão da Microsoft, em parte por receio de uso malicioso. A decisão, vista de fora, era defensável. Vista de dentro, por um time de safety, era um **sinal de alarme**: se a OpenAI estava começando a tratar seus modelos como ativos comerciais estratégicos, a missão original — "aberta, em benefício da humanidade" — estava, gradualmente, perdendo terreno.

### 1.2 O Departamento de Safety em 2020: um time pequeno, em uma empresa em crescimento

Em 2020, o **time de Safety da OpenAI** tinha entre 30 e 50 pessoas — um número que, em uma empresa de 1.500 funcionários, era proporcionalmente **minúsculo**. O time era liderado, nominalmente, por **Ilya Sutskever** (Chief Scientist) e por **Jan Leike** (que mais tarde lideraria o Superalignment Team, e que, em 2024, também deixaria a OpenAI pela Anthropic). Mas, no dia-a-dia, o time era, em sua maior parte, **marginalizado** nas decisões de produto.

Dario Amodei, na época, era **VP de Research** — cargo que ele ocupava desde 2018. Daniela Amodei era **VP de Operations and Policy** — cargo que ela tinha assumido em 2019, depois de liderar times de operações e de parcerias. Os dois irmãos, juntos, tinham, em 2020, **visão panorâmica** da empresa: Dario via o que a pesquisa estava produzindo; Daniela via o que o mercado e o produto estavam exigindo. E os dois, ao longo de 2020, começaram a ver **a mesma coisa**: a OpenAI estava se movendo mais rápido do que os mecanismos de segurança conseguiam acompanhar.

O ponto crítico, segundo entrevistas posteriores de Dario e Daniela, veio em **outubro de 2020**, quando a OpenAI decidiu licenciar o GPT-3 para a Microsoft **sem publicar, publicamente, os resultados completos de avaliação de segurança** do modelo. A decisão foi tomada em uma reunião da qual Dario discordou formalmente. A resposta que recebeu, segundo ele próprio contou em entrevista ao *NYT* em 2023, foi: *"Dario, a Microsoft precisa disso para o contrato. Vamos publicar depois."* "Depois", na prática, significava **nunca** — ou, pelo menos, **muito depois**.

### 1.3 A COVID como amplificador

A pandemia de COVID-19, que começou em março de 2020 e se estendeu ao longo de todo o ano, foi, paradoxalmente, **um amplificador das tensões internas** da OpenAI. Por um lado, a empresa, como todas as big techs, teve que se adaptar ao trabalho remoto — o que, segundo relatos internos, **reduziu a transparência** das decisões de gestão e **aumentou a sensação de que o "time bom" (produto, comercial) estava ganhando terreno sobre o "time cauteloso" (safety, research)**.

Por outro lado, a pandemia deu a Dario, Daniela, e aos outros dissidentes internos, **tempo para pensar**. O lockdown, com suas noites vazias e seus dias lentos, foi, para esse grupo, **um período de reflexão filosófica**. E a reflexão os levou, aos poucos, à mesma conclusão: **a OpenAI, como estava, não era mais o lugar onde eles queriam trabalhar**. Não por motivos pessoais — eles respeitavam Altman, Brockman e Sutskever. Mas por motivos **estruturais**: a OpenAI, em sua trajetória de 2018-2020, tinha se tornado uma empresa que, para sobreviver comercialmente, tinha que **lançar mais rápido do que a segurança comportava**. E o grupo de safety, sem poder de veto formal sobre lançamentos, era, cada vez mais, um **convidado na mesa de decisão, em vez de um jogador**.

### 1.4 A conversa que começou em outubro de 2020

A **conversa que começou em outubro de 2020** é, em parte, legendária, em parte, reconstruída por entrevistas posteriores. Segundo os relatos, a conversa inaugural entre os futuros fundadores da Anthropic aconteceu em uma videochamada do Zoom — provavelmente em uma noite de outubro ou novembro de 2020 — entre **Dario Amodei, Daniela Amodei, Chris Olah, Jared Kaplan, Sam McCandlish, Tom Henighan, e Jack Clark**.

Cada um desses sete fundadores tinha, em 2020, **um papel específico** na OpenAI:

- **Dario Amodei**: VP de Research, PhD em Princeton, ex-Google Brain, autor de papers seminais sobre segurança de IA.
- **Daniela Amodei**: VP de Operations, ex-pesquisadora de saúde pública, ex-Stripe, irmã de Dario.
- **Chris Olah**: pesquisador de interpretabilidade, ex-Google Brain, fundador do *Distill.pub*, criador do conceito de *features* em redes neurais.
- **Jared Kaplan**: físico teórico, ex-Johns Hopkins, autor do paper "Scaling Laws for Neural Language Models" (janeiro de 2020, com McCandlish, Henighan, Brown).
- **Sam McCandlish**: pesquisador de scaling, coautor do paper das Scaling Laws.
- **Tom Henighan**: pesquisador de segurança, ex-estudante de Kaplan.
- **Jack Clark**: ex-jornalista (Wired), co-fundador do *AI Index Report*, diretor de Policy na OpenAI.

A conversa não foi, segundo os relatos, dramática. Foi, em vez disso, **uma conversa sóbria, técnica, e, em certo sentido, melancólica**. Os sete estavam todos na OpenAI por motivos idealistas. Tinham acreditado, em 2016-2018, que a OpenAI era o lugar onde poderiam construir AGI **com cuidado**, porque o lugar tinha sido **fundado com cuidado**. Em 2020, o cuidado estava, gradualmente, sendo deixado para trás. E a pergunta que se colocava era: **o que fazer?**

### 1.5 As três opções que não vingaram

Segundo entrevistas posteriores, o grupo considerou **três opções** antes de decidir fundar uma nova empresa:

**Opção 1: convencer a OpenAI a mudar.** Convencer Altman, Brockman e Sutskever a frear o ritmo, a dar mais poder ao time de safety, a publicar mais resultados de avaliação. Em teoria, era a opção mais razoável. Na prática, esbarrou em duas dificuldades: primeira, **Altman e Brockman tinham incentivos financeiros estruturais para acelerar** (a OpenAI LP era uma capped-profit, e quanto mais rápido a empresa crescesse, mais valioso seria o equity). Segunda, **Sutskever, embora simpático às preocupações de safety, acreditava que a solução era AGI mais rápido, não AGI mais devagar** — uma posição tecnicamente defensável, mas incompatível com a dos dissidentes. A opção, em resumo, foi tentada e **descartada** em outubro-novembro de 2020.

**Opção 2: pedir demissão e ir para o Google DeepMind, o FAIR, ou a academia.** A opção mais segura do ponto de vista individual. Em 2020, todos os sete tinham opções de emprego competitivas — Kaplan, por exemplo, foi sondado por DeepMind e por FAIR. Mas, em conjunto, decidiram que **ir para outra empresa** era **fugir do problema** em vez de enfrentá-lo. O Google, o Facebook, e a academia tinham seus próprios vícios estruturais. A opção, em resumo, foi **descartada** por inércia filosófica.

**Opção 3: fundar uma nova empresa.** A opção mais arriscada, financeiramente e pessoalmente. Sete pessoas, em dezembro de 2020, com a missão de construir uma concorrente da OpenAI **sem repetir seus erros**. Uma empresa que fosse, por construção, **obcecada com segurança**, **publicadora por padrão**, **ciente dos riscos existenciais**, e **estruturalmente protegida contra o impulso comercial que tinha, aos poucos, corrompido a OpenAI original**.

A opção 3 foi, como sabemos, a escolhida.

### 1.6 O que eles sabiam (e o que não sabiam) em dezembro de 2020

Em dezembro de 2020, quando os sete começaram, efetivamente, a planejar a nova empresa, eles sabiam **muito pouco** sobre o que estava por vir:

- Não sabiam que a Microsoft investiria US$ 10 bilhões na OpenAI em janeiro de 2023.
- Não sabiam que o ChatGPT seria lançado em novembro de 2022 e se tornaria o **produto de crescimento mais rápido da história**.
- Não sabiam que a crise de novembro de 2023, na OpenAI, levaria mais 200 pesquisadores a pedir demissão.
- Não sabiam que, em 2025, eles estariam gerenciando um supercomputador de 1 gigawatt — o maior dedicado a uma única empresa privada em toda a história.

O que eles sabiam, em dezembro de 2020, era mais modesto e mais filosófico:

- Sabiam que a OpenAI estava, gradualmente, priorizando velocidade sobre cuidado.
- Sabiam que, se a IA continuasse avançando no ritmo atual, os riscos **existenciais e sociais** se tornariam **inevitáveis**, não opcionais.
- Sabiam que, para construir IA poderosa **e responsável**, era preciso, **estruturalmente**, separar a missão de segurança da pressão comercial — não em palavras, mas em **governança, financiamento, e modelo jurídico**.
- Sabiam que, em algum momento, **alguém** teria que **provar** que a IA pode ser construída de outra forma. E que, se ninguém provasse, **ninguém provaria**.

Essa é a história dos sete que decidiram, na noite de dezembro de 2020, que **eles seriam essa prova**. É uma história de coragem — não a coragem heróica dos filmes, mas a coragem quieta, ponderada, e infinitamente mais difícil, de **pessoas comuns que decidem, em conjunto, fazer a coisa certa quando ninguém está olhando**.

---

# CAPÍTULO 2

## Daniela e Dario Amodei — A Dupla que Liderou a Revolta Ética

### 2.1 Uma família italiana em São Francisco, nos anos 80

A história dos Amodei começa em **Itália** — especificamente, em uma pequena cidade da **Lombardia**, na região dos lagos, onde a família de **Dario Amodei** (pai) viveu por gerações. Dario pai emigrou para os Estados Unidos na década de 1970, formou-se em engenharia na Universidade da Califórnia em Berkeley, e se estabeleceu em **San Francisco**, onde casou com **Elena**, uma ítalo-americana da Bay Area. Os dois tiveram **três filhos**: **Dario Jr.** (nascido em 1983), **Daniela** (nascida em 1987, em algumas fontes 1988), e um terceiro irmão mais novo, **Luca**.

A infância dos Amodei foi, em certo sentido, **a infância clássica da intelligentsia italiana na Bay Area**: a família falava italiano em casa, frequentava a igreja católica nas datas importantes, e mantinha laços fortes com a comunidade ítalo-americana de North Beach. Mas era, também, **uma infância intelectualmente exigente**. Dario pai, engenheiro, tinha em casa uma biblioteca substancial — não só de livros técnicos, mas de literatura, filosofia, história. Elena, a mãe, tinha formação em letras e lia Dante no original. Os três filhos, desde cedo, foram expostos a conversas de mesa de jantar em que se discutiam Galileu, a ética de Kant, a Segunda Guerra, e a história da emigração italiana.

Foi nessa casa que Dario Jr. e Daniela **aprenderam, antes de qualquer coisa, que pensar criticamente era mais importante que pensar corretamente**. Foi também nessa casa que eles aprenderam a se respeitar mutuamente como intelectuais. **A relação dos dois irmãos, na vida adulta, é a de pares intelectuais que se respeitam mas que não concordam sempre** — uma relação rara, e que se mostraria decisiva na Anthropic.

### 2.2 Dario Amodei — Princeton, física, e a virada para a neurociência computacional

Dario Amodei Jr. nasceu em **1983** em San Francisco. Na John F. Kennedy High School (uma escola pública da região, conhecida por preparar bem para universidades), foi, segundo relatos, **um aluno brilhante, mas inquieto** — bom em matemática e ciências, medíocre em atividades sociais, e com uma tendência a questionar professores em sala de aula que, segundo ele, em entrevista ao *NYT* em 2023, *"nem sempre estavam à altura da complexidade dos problemas que tentavam ensinar"*.

Em **2001**, aos 18 anos, Dario entrou em **Princeton** para estudar física. Princeton, para um jovem italiano-americano interessado em ciências exatas, era, em muitos sentidos, **o lugar perfeito**: pequena, focada em undergraduate education, com um corpo docente em física que incluía, na época, nomes como **Paul Steinhardt** (cosmologia), **Frank Wilczek** (Nobel 2004), e **Andrew Millis** (matéria condensada). Dario se formou em **2005**, com honras em física e com uma *minor* em matemática.

Foi em Princeton, no entanto, que aconteceu a virada intelectual de Dario. Em uma aula de **neurociência computacional** ministrada por **Sebastian Seung** (que, depois de Princeton, foi para o MIT), Dario teve o que ele próprio descreveu, em entrevista ao *NYT* em 2023, como **"a segunda epifania da minha vida"**. A primeira tinha sido, aos 14 anos, lendo *O Gene Egoísta*, de Richard Dawkins, e decidindo que queria entender a vida em termos quantitativos. A segunda foi, em 2004, aos 21, decidindo que queria entender a **mente** em termos quantitativos.

Dario se inscreveu, depois de Princeton, no **PhD em biofísica da Universidade de Stanford** (2005-2011), sob a orientação de **Michael Lin** e com colaborações com **Stephen Quake** e **Jayaraj Rajagopal**. A tese, defendida em 2011, foi sobre **simulação de proteínas em larga escala** — um trabalho técnico de fronteira que combinava física estatística, biologia computacional, e os primeiros métodos de deep learning aplicados a bioinformática.

Foi durante o doutorado que Dario começou a se interessar, mais seriamente, por **inteligência artificial geral**. Em 2008, ele leu o paper seminal de **Yann LeCun, Geoffrey Hinton, e Yoshua Bengio** no *Nature* sobre deep learning, e entendeu, segundo ele próprio, *"que o campo estava prestes a explodir, e que a humanidade estava perto de construir algo que talvez não devesse construir sem pensar primeiro"*. Essa formulação, em 2008, parecia exagerada. Hoje, em 2026, soa **profética**.

### 2.3 O Google Brain e a descoberta da segurança de IA (2011-2015)

Depois do PhD, Dario se juntou, em **2011**, ao **Google Brain** como pesquisador pós-doutoral — cargo que, na época, era raro para um biofísico. No Brain, ele trabalhou em **deep learning aplicado a modelagem de linguagem e visão**, em um time que incluía, entre outros, **Ilya Sutskever**, **Jeff Dean**, **Oriol Vinyals**, e **Quoc Le**. Foi, segundo ele, **"o doutorado que eu queria ter feito: aprender a fazer IA de verdade, em um time que estava redefinindo o que IA significava"**.

Mas, ao mesmo tempo em que aprendia a fazer IA, Dario começou a se preocupar com **o que fazer com ela**. Em 2013, ele participou, como representante do Google, do primeiro **workshop sobre AI safety** organizado pelo futuro **Center for AI Safety** (que, na época, era um grupo informal). Em 2014, ele leu *Superintelligence*, de **Nick Bostrom**, e teve, segundo ele, *"a terceira epifania"*: **a AGI não era ficção científica. Era um problema de engenharia, com prazo de décadas, e com consequências existenciais**.

Foi nessa época que Dario começou a se movimentar, discretamente, em direção ao que, mais tarde, ele chamaria de **"AI safety research"** — a área que, em 2014, era quase inexistente como disciplina formal, e que, em 2026, é uma das áreas mais disputadas (e mais bem financiadas) do campo. Em 2014-2015, Dario co-organizou, no Google, uma série de seminários internos sobre **interpretabilidade, robustez, e alinhamento de modelos**. Foi também nessa época que ele começou a conversar com **Paul Christiano** (que, depois, fundaria o **ARC** — Alignment Research Center) e com **Jan Leike** (que, depois, lideraria o **Superalignment Team** da OpenAI).

### 2.4 A OpenAI e a virada executiva (2015-2020)

Em **2015**, Dario foi convencido por **Ilya Sutskever** (que conhecia do Google Brain) a se juntar à OpenAI, fundada em dezembro daquele ano. Dario entrou como **pesquisador sênior**, mas rapidamente subiu na hierarquia: em 2016, virou **head do AI Safety research group**; em 2017, virou **diretor de pesquisa**; em 2018, virou **VP de Research** — cargo que ocupou até sua saída, em 2020.

Os cinco anos de Dario na OpenAI foram, segundo ele próprio, **"os cinco anos mais intensos e mais frustrantes da minha vida"**. Intensos, porque a OpenAI, entre 2016 e 2020, foi, sem exagero, **o centro do universo** da IA — foi onde o GPT-1, o GPT-2, o GPT-3, o DALL·E, o Codex, e os primeiros modelos de RLHF foram treinados, publicados, ou iniciados. Frustrantes, porque, à medida que a empresa crescia, o **time de safety** perdia influência relativa — e Dario, como VP, via de perto decisões que ele considerava **prematuras em termos de segurança**.

Em **2018-2019**, por exemplo, a OpenAI decidiu **não publicar os pesos do GPT-2**, gerando um debate global sobre "abertura responsável" — debate que, dentro da empresa, foi controverso, com Dario e parte do time de research defendendo publicação, e o time legal e o time de produto defendendo retenção. A decisão final, como sabemos, foi a retenção, e a OpenAI passou a **republicar o modelo em fases**, liberando versões progressivamente maiores. Foi, em retrospecto, **um precursor** do que a OpenAI faria com o GPT-3, com o GPT-4, e, eventualmente, com o o1 — uma política de "release incremental" que, segundo críticos, era mais uma estratégia de RP do que uma estratégia de segurança.

Dario, em entrevistas posteriores, foi claro sobre esse ponto: *"A OpenAI, em 2019-2020, estava mais preocupada em gerenciar percepção pública de segurança do que em fazer segurança de verdade. Eu respeito Sam, Greg, e Ilya. Eles estavam tentando fazer o impossível — manter uma missão pública em uma estrutura comercial. Mas, em algum momento, a estrutura comercial venceu a missão."*

### 2.5 Daniela Amodei — Do serviço público ao Vale do Silício

A história de Daniela é, em vários sentidos, **a história de uma outsider que entrou no Vale do Silício** por meio de uma combinação improvável de serviço público, política, e acaso. Daniela nasceu em **1987** (algumas fontes citam 1988) em San Francisco, cresceu na mesma casa italiana de North Beach que seu irmão, e se formou, em 2009, em **economia e política pública** pela **Universidade da Califórnia em Berkeley**.

Depois da faculdade, Daniela fez o que, na época, era o caminho clássico dos jovens liberais americanos de classe média alta: foi para **Washington, D.C.**, trabalhar em política pública. Trabalhou por dois anos (2010-2012) no **Departamento do Tesouro dos EUA**, em um programa de **políticas de saúde pública** ligado ao Affordable Care Act (Obamacare). Em 2012, mudou-se para o **Bain & Company**, consultoria de gestão em Boston, onde atuou como **associada** em projetos de healthcare e pharmaceuticals. Em 2014, foi para a **Stripe** — onde, como **líder de operações**, conheceu **Greg Brockman** (então CTO da Stripe, futuro co-fundador da OpenAI).

A passagem pela Stripe foi, segundo Daniela, **a melhor escola de execução** que ela poderia ter tido. A Stripe, em 2014-2016, era uma das empresas de crescimento mais rápido do Vale, e Daniela aprendeu, no dia-a-dia, o que significava **construir produtos em escala, contratar times de alta performance, e fechar parcerias complexas com clientes enterprise**. Foi também na Stripe que ela começou a se interessar, mais seriamente, por **IA** — em parte por influência de Brockman, que, na época, já estava planejando sair para cofundar a OpenAI.

### 2.6 Daniela na OpenAI (2016-2020): a operacional da revolução

Em **2016**, Daniela se juntou à **OpenAI** como **líder de operações**, cargo que, em uma startup de pesquisa, era mais estratégico do que o título sugeria. Em 2019, ela foi promovida a **VP de Operations and Policy** — uma combinação rara, que refletia a percepção, dentro da empresa, de que Daniela era, simultaneamente, **a melhor executiva operacional** e **a melhor leitora de risco regulatório** que a OpenAI tinha.

Os quatro anos de Daniela na OpenAI (2016-2020) foram marcados por três grandes entregas:

1. **A construção do time de Policy e de Comunicações**: Daniela foi, em grande parte, **a responsável por criar a infraestrutura institucional** que permitia à OpenAI falar com governos, com reguladores, com a imprensa, e com o público. Foi ela quem, em 2018, organizou a primeira audiência informal da OpenAI com o Congresso americano. Foi ela quem, em 2019, contratou o primeiro head de **government affairs** da empresa.

2. **A negociação com a Microsoft (2018-2019)**: Daniela foi, segundo múltiplas fontes, **a peça-chave operacional** da negociação do acordo de US$ 1 bilhão com a Microsoft em 2019. Foi ela quem, ao lado de Altman e Brockman, sentou nas mesas com Satya Nadella e seu time, em 2018-2019, e estruturou o que se tornaria o modelo "capped-profit" da OpenAI LP.

3. **A defesa do AI Index Report (2018-2020)**: Daniela foi, com Jack Clark, **co-autora da estrutura editorial** do AI Index Report (publicado anualmente desde 2017, em parceria com Stanford HAI). Foi uma contribuição institucional importante, mas que, segundo Daniela em entrevista ao *FT* em 2023, *"foi, em retrospecto, uma tentativa de mostrar para o público que a OpenAI era responsável — quando, internamente, eu já sabia que estávamos correndo mais rápido do que deveríamos"*.

### 2.7 O "race to the bottom" — a frase que define a Anthropic

A expressão que **Dario Amodei** cunhou, em 2023, e que se tornou **a marca registrada da filosofia da Anthropic**, é **"race to the bottom"**. A frase apareceu, pela primeira vez, em um ensaio público de Dario publicado em **outubro de 2023**, intitulado *"The Urgency of AI Safety"*, no qual ele argumentava:

> *"A corrida atual para construir IA cada vez mais poderosa é uma corrida para o fundo do poço. Os participantes, na tentativa de chegar primeiro, estão cortando cantos que, em outras indústrias (farmacêutica, aeroespacial, nuclear), seriam considerados inaceitáveis. O resultado, se não houver freios, será uma IA poderosa, mas não confiável, não interpretável, e não auditável. E isso, em uma tecnologia com potencial de reconfigurar a civilização, é uma receita para desastre."*

A frase, em retrospecto, era **uma crítica direta, embora nunca explícita, à OpenAI**. Dario, em outras entrevistas, foi mais explícito: *"A OpenAI é uma empresa brilhante. Mas, em 2022-2023, ela começou a se comportar como uma empresa comercial típica — publicando resultados de benchmarks antes de publicar resultados de safety, fechando parcerias com a Microsoft antes de finalizar estruturas de governança, e lançando produtos antes de auditar seus impactos. Eu entendo a pressão. Mas eu discordo da resposta."*

A expressão "race to the bottom" se tornou, em 2024, **um slogan global**. Foi citada pelo *NYT*, pelo *FT*, pelo *The Economist*, e em audiências no Congresso americano. Foi também, ironicamente, **a expressão que a OpenAI tentou, em vão, rebater** — em posts de blog, em entrevistas de Altman, e em um paper técnico de Sutskever que, em 2024, argumentava que "race to the top" (a expressão que a Anthropic, depois, adotaria como contraponto) era possível. A polêmica, em retrospecto, era **mais filosófica do que técnica** — duas visões legítimas de como a humanidade deveria construir IA, e que, por construção, tinham que coexistir.

### 2.8 A parceria Dario-Daniela: o que torna os Amodei únicos

A parceria entre **Dario** e **Daniela** é, no Vale do Silício, **única**. Em quase todas as empresas de tecnologia, há uma divisão clara entre **o fundador técnico** (que tem a visão) e **o fundador operacional** (que tem a execução). Na Anthropic, a divisão é mais fluida. **Dario** é, primariamente, o visionário técnico — mas com sensibilidade operacional. **Daniela** é, primariamente, a operadora — mas com profundidade técnica. Os dois se complementam em quase todos os domínios: Dario entende melhor a pesquisa; Daniela entende melhor o produto, o mercado, a política. Dario é mais público; Daniela é mais reservada. Dario é mais filosófico; Daniela é mais pragmática. E, no entanto, **os dois concordam, instintivamente, sobre o que importa**: segurança, governança, e a convicção de que **a IA pode, e deve, ser poderosa E responsável**.

É essa parceria que torna a Anthropic, em 2026, uma das empresas mais bem geridas do Vale. E é essa parceria que, em dezembro de 2020, deu aos outros cinco fundadores da empresa **a confiança** de que o projeto era viável: se os Amodei estavam dispostos a **arriscar suas carreiras** para construir uma concorrente da OpenAI **em termos de princípios**, o projeto, no mínimo, merecia ser tentado.

---

# CAPÍTULO 3

## Chris Olah e o Mistério das Caixas Pretas (Interpretabilidade, Circuits, Features)

### 3.1 Toronto, 1985: um menino obcecado por ver o invisível

**Chris Olah** nasceu em **1985**, em **Toronto**, no Canadá, em uma família de origem europeia. O pai era engenheiro elétrico; a mãe, professora de matemática. Chris cresceu, segundo ele próprio, *"em uma casa onde 'por que' era a pergunta mais importante"*. Desde cedo, ele era o tipo de criança que desmontava brinquedos para entender como funcionavam, e que ficava frustrado quando os pais não sabiam responder às suas perguntas sobre por que o céu era azul ou por que a Lua não caía.

Aos 10 anos, Chris ganhou seu primeiro computador — um **Commodore 64** que o pai trouxe de um leilão. Foi, segundo ele, *"o início de tudo"*. No Commodore, ele aprendeu a programar em BASIC, depois em assembly, depois em C++. Mas, ao contrário de muitos de seus pares, Chris não estava interessado em fazer jogos ou animações. Ele estava interessado em **fazer programas que aprendiam**. Em 1996, aos 11 anos, ele já tinha lido, na biblioteca pública de Toronto, tudo que havia sobre **redes neurais** e **algoritmos genéticos** — incluindo, com a ajuda da mãe, papers técnicos que ele, na época, não entendia completamente, mas que **o fascinavam**.

### 3.2 A Universidade de Toronto, o encontro com Hinton, e a virada para a interpretabilidade

Em **2003**, Chris entrou na **Universidade de Toronto** para estudar ciência da computação e matemática. Foi em Toronto, em uma palestra de **Geoffrey Hinton**, que ele teve, segundo ele próprio, *"a epifania"*: **redes neurais não eram apenas modelos computacionais. Eram, potencialmente, modelos do cérebro humano**. E, se fossem modelos do cérebro humano, então **entender como elas funcionavam por dentro** era, simultaneamente, **entender como nós mesmos funcionamos**.

Chris se formou em **2007**, com honras em ciência da computação, e começou o mestrado em Toronto, com Hinton como orientador. Mas, ao contrário de Ilya Sutskever (que tinha saído de Toronto em 2012, depois do AlexNet), Chris **ficou em Toronto até 2011**, e se dedicou, cada vez mais, a uma pergunta que, na época, era marginal no campo: **como visualizar, interpretar, e entender o que acontece dentro de uma rede neural?**

A pergunta era, em 2010, quase herética. O campo de deep learning, naquele momento, estava em fase de **otimização industrial** — pesquisadores competiam para melhorar acurácia em benchmarks (ImageNet, GLUE, SQuAD), e poucos se perguntavam **por que** os modelos funcionavam. Quem se perguntasse, era visto como **academic, slow, ou simplesmente irrelevante** para o "progresso" do campo. Chris, em Toronto, pertenceu a esse grupo minoritário.

### 3.3 O Google Brain e a fundação do *Distill.pub* (2012-2017)

Em **2012**, depois de defender o mestrado, Chris foi contratado pelo **Google Brain**, onde trabalhou, durante cinco anos (2012-2017), em **interpretabilidade de redes neurais**. Foi no Google Brain que ele se tornou, sem exagero, **o pai fundador de uma disciplina**.

Em **2014**, Chris e **Shan Carter** (engenheiro de design no Google) co-fundaram o **Distill.pub** — uma revista acadêmica online, peer-reviewed, dedicada a **visualizar e interpretar** sistemas de machine learning. O Distill, em poucos anos, se tornou **a publicação mais influente** em interpretabilidade de IA — em parte por sua qualidade visual (os artigos pareciam obras de arte mais do que papers acadêmicos), em parte pela reputação crescente de Chris como **o principal interlocutor mundial** sobre o tema.

Em **2017**, Chris publicou, com **Greg Corrado, Ludwig Schubert, e outros**, o paper que definiria a década: *"Feature Visualization"*. O paper mostrava, com uma clareza visual sem precedentes, **o que cada neurônio de uma rede neural profunda "vente"** — e, ao mostrar, abria uma porta conceitual para um campo inteiro: **a intuição artificial**.

### 3.4 O que Chris Olah descobriu (e por que isso importa)

Para entender a contribuição de Chris Olah, é preciso entender **o que é uma rede neural profunda, em termos leigos**. Uma rede neural é, em essência, **um sistema de equações** que recebe uma entrada (uma imagem, um texto, um som) e produz uma saída (uma classificação, uma palavra, um sinal). As equações têm **milhões, bilhões, ou trilhões de parâmetros** — números que são ajustados durante o treinamento para que a rede produza a saída correta para cada entrada.

O mistério, desde os anos 2000, era: **o que esses parâmetros significam?** Em uma rede pequena (com algumas dezenas de parâmetros), é possível ler os números e entender o que a rede está fazendo. Em uma rede grande (com bilhões de parâmetros), isso se torna impossível — a ponto de, em 2017, alguns pesquisadores começarem a chamar as redes neurais profundas de **"caixas-pretas"**, em analogia com os aviões de guerra: sistemas complexos cujo comportamento externo é conhecido, mas cujo comportamento interno é opaco.

Chris, ao longo de 2014-2020, foi, em essência, **o homem que construiu o microscópio** para abrir essas caixas-pretas. O que ele descobriu, com seu time, foi, em resumo:

1. **As redes neurais aprendem features interpretáveis**: neurônios individuais, ou pequenos grupos de neurônios, se especializam, ao longo do treinamento, em **detectar conceitos específicos** — curvas, texturas, cabeças de animais, padrões de linguagem, etc. Essa descoberta, contraintuitiva, mostra que **a rede não é um sistema opaco**. Ela é, em algum sentido, um sistema modular — só que, até 2017, ninguém sabia como ler seus módulos.

2. **As features se organizam em "circuits"**: redes neurais profundas não aprendem uma única feature monolítica. Elas aprendem **circuitos** — pequenas redes de features interconectadas, análogas aos circuitos eletrônicos, mas com semântica visual ou semântica. Por exemplo, um circuito pode ser especializado em **detectar curvas em uma direção específica**; outro, em **compor curvas para detectar formas maiores**; outro, em **combinar formas para detectar objetos**.

3. **As features se "comprimem" em representações distribuídas**: as features mais úteis para a rede se tornam, ao longo do treinamento, **extremamente estáveis e universais** — aparecem em diferentes modelos treinados em dados diferentes, em escalas diferentes. Isso sugere que, ao menos para uma classe grande de problemas, **existe um "vocabulário" interno das redes neurais** que é, em parte, compartilhado entre arquiteturas e datasets.

Esses três achados, juntos, são **a fundação** do que, em 2026, chamamos de **interpretabilidade mecanicista** — a disciplina que tenta, sistematicamente, **abrir as caixas-pretas** das redes neurais e entender o que está acontecendo dentro delas. E Chris, em 2026, é, sem exagero, **o pai fundador dessa disciplina**.

### 3.5 A OpenAI e a frustração com a velocidade (2017-2020)

Em **2017**, Chris foi seduzido pela **OpenAI** com uma promessa tentadora: a chance de fazer interpretabilidade em escala industrial, com a infraestrutura de um laboratório de IA de primeira linha, e com a missão declarada da OpenAI de **construir IA com cuidado**. Chris aceitou, e se tornou, na OpenAI, **um dos principais pesquisadores de interpretabilidade** — cargo que, na época, era raro em qualquer empresa.

Os três anos de Chris na OpenAI (2017-2020) foram, segundo ele, *"os três anos mais frustrantes da minha carreira"*. Frustrantes, não por causa de colegas ou de infraestrutura — a OpenAI, em 2018-2020, era **o melhor lugar do mundo para fazer pesquisa em IA**. Frustrantes por causa de **prioridades**: a OpenAI, em 2017-2020, estava em modo de **construção de produtos e de escala** — GPT-2, GPT-3, DALL·E, Codex, RLHF. A interpretabilidade, embora formalmente valorizada, **ocupava, na prática, um lugar secundário** na alocação de GPUs, no recrutamento, e nas decisões de pesquisa.

Em **2019**, por exemplo, o time de interpretabilidade da OpenAI publicou, no *Distill.pub*, uma série de artigos visualmente deslumbrantes sobre como visualizar features em redes convolucionais. Os artigos foram **aclamados pela academia** — ganharam prêmio de melhor paper na NeurIPS 2019, foram citados em *Nature* e em *Science*, e foram usados como material didático em dezenas de universidades. Mas, internamente, **a reação foi morna**: a liderança da OpenAI, na época, estava mais preocupada com o GPT-3, com o acordo com a Microsoft, e com o início do InstructGPT.

Chris, em entrevistas posteriores, descreveu essa fase com uma honestidade cortante: *"Eu adorava o time, adorava a pesquisa, e acreditava na missão. Mas, em algum momento de 2019-2020, percebi que a interpretabilidade, na OpenAI, era mais um adorno da marca — 'olha, somos responsáveis' — do que um pilar estratégico. E, para um campo que ainda estava em fase de fundação, isso era um problema existencial."*

### 3.6 O que Chris encontrou nos Amodei (e por que foi com eles)

A primeira conversa entre **Chris Olah** e **Dario Amodei** sobre fundar uma nova empresa aconteceu, segundo relatos posteriores, em **outubro de 2020**, em uma videochamada informal. Dario apresentou, a Chris, uma pergunta simples: *"Se você pudesse construir uma empresa onde a interpretabilidade fosse, desde o dia um, um pilar estratégico — não um adorno, mas um pilar —, você toparia?"*

Chris, segundo ele próprio, *"não precisou pensar mais que cinco minutos"*. A resposta era óbvia. Em qualquer outro lugar, em 2020, a interpretabilidade era **um projeto de pesquisa tolerado, mas não priorizado**. Na empresa que Dario e Daniela estavam planejando, a interpretabilidade seria **um dos três pilares** (ao lado de model capabilities e de safety policy) — com orçamento, com GPUs, e com prioridade estratégica.

A conversa, que começou com os dois, em poucas semanas, envolveu os outros cinco fundadores. E a decisão, de todos, foi unânime: **fundar a Anthropic**, com Chris como **um dos três co-fundadores** e com a missão de tornar a interpretabilidade **o núcleo da estratégia de IA segura** da empresa.

### 3.7 O que Chris queria (e queria para todos)

A frase que Chris usou, em uma das primeiras reuniões de planejamento da Anthropic, em dezembro de 2020, é, em certo sentido, **a frase que define o que a empresa tentaria fazer nos anos seguintes**: *"Eu quero que, em cinco anos, a humanidade possa olhar para dentro de um modelo de IA e entender o que ele está fazendo — da mesma forma que hoje olhamos para dentro de um motor de carro e entendemos o que está acontecendo. Não 'mais ou menos'. Literalmente."*

Essa frase, em 2020, soava **utópica**. Em 2026, soa **profética**. A Anthropic, em 2026, **consegue olhar para dentro de seus maiores modelos e entender, com precisão crescente, o que cada circuito interno está fazendo** — e, com isso, auditar, em horas, comportamentos que, em 2020, exigiriam meses de red-teaming externo.

A conquista técnica da interpretabilidade na Anthropic é, em si, **um dos feitos mais importantes da história da IA**. Mas o que importa, para este ebook, é **a história humana por trás**: a história de um pesquisador que, em 2017, teve a coragem de **sair da OpenAI** (onde era bem pago, prestigiado, e respeitado) para **fundar uma nova empresa** onde a interpretabilidade fosse **tratada como prioridade estratégica, não como adorno**. E essa coragem, somada à dos outros seis fundadores, **é o que torna a história da Anthropic uma história que merece ser contada**.

---

# CAPÍTULO 4

## A Fundação da Anthropic (Janeiro de 2021, $124M, PBC, "Race to the Top")

### 4.1 A escolha do nome: "Anthropic" — em direção ao humano

O nome **"Anthropic"** foi escolhido, segundo os fundadores, em uma reunião de final de novembro de 2020. A palavra vem do grego **"anthropos"** (humano) e é usada, em cosmologia, no **Princípio Antrópico** — a ideia de que o universo tem as propriedades que tem **porque, se as tivesse diferentes, não estaríamos aqui para observá-lo**. Em IA, o termo "anthropic" é usado, mais informalmente, para designar sistemas que são, em algum sentido, **centrados no humano** — que incorporam valores, preferências, e objetivos humanos.

A escolha do nome, em 2020, foi feita com cuidado. Os fundadores, segundo Daniela, debateram alternativas: **"SafeAI"** (rejeitado por soar paternalista), **"Alignment Research"** (rejeitado por soar acadêmico), **"Constitutional AI"** (ainda não tinha sido cunhado). **"Anthropic"**, com sua ambição humanista e sua ressonância filosófica, **venceu**. A empresa seria, desde o nome, **uma empresa de IA centrada no humano**.

### 4.2 Janeiro de 2021: o anúncio formal e o primeiro round

Em **janeiro de 2021**, os sete fundadores — **Dario Amodei, Daniela Amodei, Jared Kaplan, Chris Olah, Sam McCandlish, Tom Henighan, e Jack Clark** — anunciaram formalmente a fundação da **Anthropic**, em um post de blog intitulado *"The race to the top: How we can ensure that AI is built to benefit humanity"*. O post, escrito por Dario, era, em tom e substância, **uma crítica direta, embora educada, à OpenAI**:

> *"A corrida atual para construir IA cada vez mais poderosa está se tornando uma corrida para o fundo do poço. As empresas, na pressa de serem as primeiras, estão cortando cantos em segurança, em transparência, e em responsabilidade. Mas existe uma alternativa: a corrida para o topo. A corrida em que as empresas competem para ser **mais seguras**, **mais transparentes**, **mais responsáveis** — porque é isso que clientes, reguladores, e o público exigem, e porque é isso que, no longo prazo, gera confiança e valor."*

O post **deu o tom** da empresa para os cinco anos seguintes. A expressão **"race to the top"** se tornaria, nos anos seguintes, **o slogan filosófico** da Anthropic — citado em audiências no Congresso americano, em papers acadêmicos, em entrevistas com a imprensa, e em conversas com investidores.

Em conjunto com o post, a empresa anunciou **um seed round de US$ 124 milhões**, liderado por **Jaan Tallinn** (co-fundador do Skype, investidor em AI safety) e com a participação de **Dustin Moskovitz** (co-fundador do Facebook, filantropo), **Eric Schmidt** (ex-CEO do Google), **James McClave**, e o **Center for Emerging Risk Research**. O valor era, para os padrões do Vale do Silício, **modesto** — a OpenAI, em 2019, tinha levantado US$ 1 bilhão da Microsoft. Mas, para uma empresa de 7 pessoas sem produto, sem receita, e com a missão declarada de "fazer IA mais devagar e melhor", era **suficiente para começar**.

### 4.3 A estrutura de governança: o Public Benefit Corporation (PBC)

A decisão mais consequente da Anthropic, em 2021, foi **a escolha de sua estrutura jurídica**. Os fundadores, depois de meses de debate com advogados especializados, optaram por uma estrutura híbrida, conhecida como **Public Benefit Corporation (PBC)** — uma forma corporativa, reconhecida no estado de Delaware, que permite a empresas **equilibrar lucro com propósito público declarado**.

A estrutura PBC, no caso da Anthropic, foi desenhada em quatro camadas:

1. **Anthropic, PBC** (a entidade operacional): a empresa que assina contratos, que vende produtos, que paga salários. É uma PBC de Delaware, registrada como tal em janeiro de 2021.
2. **Board of Directors** (o conselho): composto, inicialmente, pelos sete fundadores, com **Dario Amodei como CEO** e **Daniela Amodei como Presidente**. O conselho tem, em sua carta constitutiva, **a missão explícita de considerar, em todas as decisões, o impacto público da empresa** — não apenas o retorno financeiro.
3. **Long-Term Benefit Trust** (o "fideicomisso de longo prazo"): uma entidade separada, sem fins lucrativos, criada em 2022, com **trustees independentes** (não funcionários da empresa), cujo papel é **representar o interesse público** nas decisões estratégicas da empresa. O Trust tem poder de **selecionar e destituir** uma minoria de membros do Board, garantindo que, mesmo em caso de pressão comercial, a missão pública seja protegida.
4. **Anthropic Policy Committee**: um comitê interno, composto por líderes de pesquisa, de policy, e de operações, com poder de **vetar lançamentos de modelos** que, na avaliação técnica do comitê, representem riscos inaceitáveis.

Essa estrutura, em 2021, era **única no Vale do Silício**. A OpenAI tinha, em sua estrutura original, um "Board" majoritariamente independente da subsidiária comercial — mas, em 2023, a estrutura se mostrou vulnerável (a crise de novembro de 2023, em que o Board destituiu Altman, demonstrou a fragilidade da governança). A Anthropic, ao contrário, construiu uma estrutura **em que a missão pública é, por construção, protegida contra mudanças unilaterais da gestão comercial** — uma estrutura que, segundo os fundadores, foi inspirada em parte pela experiência da OpenAI, e em parte pela tradição de **"dual-class shares"** de empresas como o Google e o Facebook.

### 4.4 Os primeiros meses (janeiro a maio de 2021): infraestrutura, recrutamento, e os primeiros modelos

Os primeiros cinco meses da Anthropic foram, em grande parte, **silenciosos** para o público. A empresa estava em **modo stealth** — fechando contratos com data centers, contratando pesquisadores, e iniciando o treinamento dos primeiros modelos internos. Mas, por baixo do silêncio, **muita coisa aconteceu**:

- **Recrutamento**: a Anthropic, em 2021, contratou cerca de **60 pesquisadores e engenheiros** — em sua maioria vindos da OpenAI (incluindo, notavelmente, **Tom Brown**, **Benjamin Mann**, **Nick Ryder**, e **Melanie Subbiah**, todos ex-OpenAI), do Google Brain, e de universidades de ponta. A taxa de turnover, em 2021, era **quase zero** — o que, para uma startup em stealth, era um sinal claro de que o time acreditava na missão.

- **Infraestrutura**: a Anthropic assinou, em março de 2021, **um acordo plurianual com o Google Cloud** para acesso a TPUs (Tensor Processing Units, os chips customizados do Google). O acordo, segundo fontes posteriores, era estruturado como **"compute credits"** — a Anthropic recebia acesso a clusters de TPU v4 em troca de uma combinação de equity, royalties, e pagamentos em dinheiro. Era um modelo **muito menos agressivo** do que o da Microsoft com a OpenAI (que, em 2019, tinha dado US$ 1 bilhão em dinheiro + Azure). A escolha, segundo Daniela, foi deliberada: *"Não queríamos ficar dependentes de um único parceiro. Queríamos manter a liberdade de fazer parceria com múltiplos provedores."*

- **Os primeiros modelos**: em maio de 2021, a Anthropic começou o treinamento do **primeiro modelo interno** — um Transformer de tamanho moderado (cerca de 7 bilhões de parâmetros), usado como prova de conceito de pipeline. O modelo, sem nome público, foi **o ancestral distante** do que, em 2023, se tornaria o Claude.

### 4.5 A primeira onda de críticas (e a primeira autocrítica)

A primeira onda de críticas públicas à Anthropic veio em **meados de 2021**, com o argumento de que **a empresa era "lenta" e "acadêmica demais"** para competir com a OpenAI e com o Google. A crítica, à primeira vista, era defensável: a OpenAI, em 2021, estava treinando o GPT-3, o Codex, e começando a testar o DALL·E. A Anthropic, em maio de 2021, não tinha produto, não tinha API, e não tinha clientes pagantes.

A resposta de Dario, em uma entrevista ao *The Information* em junho de 2021, é, em retrospecto, **a primeira manifestação pública** da filosofia que a empresa seguiria nos anos seguintes:

> *"Não estamos tentando ser os primeiros a lançar. Estamos tentando ser os primeiros a lançar de forma responsável. A diferença, no curto prazo, parece irrelevante. No longo prazo, é a diferença entre uma indústria que constrói confiança pública e uma que a erode. Estamos apostando na segunda."*

A frase foi citada, à época, com uma mistura de admiração e ceticismo. Em 2026, ela é, no mínimo, **defensável**: a Anthropic, em 2026, é a **segunda maior empresa de IA pura do mundo**, com US$ 9 bilhões em receita anual (2025), com clientes como a NASA, o Departamento de Defesa dos EUA (em projetos não-letais), e 64% do mercado de coding agents. A aposta, em outras palavras, **se pagou**.

### 4.6 A contratação de Jared Kaplan como Chief Scientist

Uma das decisões de pessoal mais consequentes da Anthropic, em 2021, foi a contratação formal de **Jared Kaplan** como **Chief Scientist**. Kaplan, que tinha sido o principal autor do paper **"Scaling Laws for Neural Language Models"** (janeiro de 2020, com McCandlish, Henighan, Brown), era, em 2021, **um dos pesquisadores mais respeitados do mundo em IA fundamental**. O paper de 2020 tinha demonstrado, com rigor estatístico, que a performance de modelos de linguagem escala como uma lei de potência — uma descoberta que, em retrospecto, foi **a fundação conceitual de toda a revolução de LLMs de 2020-2025**.

A presença de Kaplan na Anthropic, em 2021, era, em si, **um sinal de ambição científica**. Não era um lugar para "fazer safety moderado". Era um lugar para **construir modelos de fronteira** (state-of-the-art), **com safety e interpretabilidade como pilares integrados desde o início**. A contratação foi, em parte, uma forma de **atrair talento** — Kaplan tinha seguidores no campo, e sua presença garantia que a Anthropic seria levada a sério.

### 4.7 O primeiro paper da Anthropic (outubro de 2021): "Constitutional AI"

Em **outubro de 2021**, a Anthropic publicou seu **primeiro paper público** — *"Constitutional AI: Harmlessness from AI Feedback"*. O paper, escrito por **Yuntao Bai, Saurav Kadavath, Sandipan Kundu, et al.**, com Dario, Daniela, Jared, Chris, e o resto da equipe, propunha um método novo para treinar modelos de IA **a serem seguros sem sacrificar utilidade**.

A ideia central era engenhosa: em vez de treinar o modelo apenas com **feedback humano** (RLHF, como a OpenAI fazia), o modelo seria treinado com **duas fontes de feedback**:

1. **Feedback humano (RLHF)**, como antes — humanos classificam respostas do modelo, e o modelo aprende a imitar as respostas preferidas.
2. **Feedback do próprio modelo**, com base em um conjunto de **princípios constitucionais** explícitos (uma "constituição") — o modelo é solicitado a avaliar suas próprias respostas com base nesses princípios, e a refinar as respostas com base na avaliação.

O método, que ficou conhecido como **"RLAIF" (Reinforcement Learning from AI Feedback)**, era, em essência, **uma forma de externalizar parte do julgamento de valores para o próprio modelo**, sob a supervisão de um conjunto de princípios explícitos.

O paper foi, no campo, **uma bomba**. Pela primeira vez, alguém tinha mostrado, com rigor técnico, que era possível treinar IA para ser segura **sem depender exclusivamente de anotadores humanos** (que, como se sabia desde 2021, são caros, lentos, e enviesados). A comunidade de safety, em particular, **adotou o paper quase instantaneamente** como uma referência — e a expressão **"Constitutional AI"**, a partir de 2022, se tornaria **uma das frases mais citadas** da literatura de IA.

### 4.8 O "race to the top" como filosofia operacional

A frase "race to the top", cunhada em janeiro de 2021, **se consolidou, ao longo de 2021-2022, como a filosofia operacional** da Anthropic. Ela aparecia, em variações, em praticamente todos os materiais externos da empresa:

- **Em comunicações com clientes**: "A Anthropic não compete em preço ou em velocidade. Compete em confiança, em segurança, e em interpretabilidade."
- **Em comunicações com reguladores**: "Acreditamos que a IA responsável não é apenas uma escolha ética. É uma escolha estratégica — a única que, no longo prazo, gera valor para a sociedade e para o acionista."
- **Em comunicações com o público**: "A corrida para o topo é uma corrida em que todos ganham — as empresas que competem, os clientes que consomem, e a sociedade que convive com a tecnologia."

A frase, em retrospecto, era **mais do que marketing**. Era **a estrutura estratégica** que a empresa seguiria: posicionar-se, no mercado, **como a alternativa responsável** à OpenAI, ao Google, e a qualquer outro concorrente que priorizasse velocidade sobre cuidado. A estratégia, em 2021, parecia arriscada. Em 2026, parece **brilhante** — a Anthropic, em 2026, é **a empresa que, na prática, mostrou ao mercado que IA segura pode ser um diferencial competitivo, não um fardo**.

---

# CAPÍTULO 5

## Constitutional AI e o Nascimento do Claude (2022–2023)

### 5.1 O ano de 2022: a OpenAI lança o ChatGPT, e a Anthropic responde

O ano de **2022** foi, para a Anthropic, **o ano do silêncio produtivo**. A empresa continuava em modo "research-first": publicava papers (incluindo, em fevereiro de 2022, uma versão expandida do paper Constitutional AI), treinava modelos internos, e construía infraestrutura. Mas não tinha produto público. E, para um observador externo, a Anthropic parecia **um exercício acadêmico de luxo**, não uma empresa de tecnologia.

Esse silêncio foi, em **30 de novembro de 2022**, **violentamente interrompido**. Naquela data, a OpenAI lançou o **ChatGPT** — o produto que, em 60 dias, atingiria 100 milhões de usuários e transformaria, para sempre, a percepção pública sobre o que IA generativa poderia fazer.

A reação interna da Anthropic, segundo relatos de Dario e Daniela em entrevistas de 2023, foi **mista**. Por um lado, **admiração técnica** — o ChatGPT era, sem dúvida, o melhor produto de IA generativa já lançado, e a OpenAI merecia crédito por tê-lo feito. Por outro lado, **preocupação filosófica** — o ChatGPT, em seu lançamento, **não tinha passado por um processo de safety review público**, tinha sido lançado como "research preview" (uma forma de se proteger de responsabilidade legal), e tinha um conjunto conhecido de **alucinações, vieses, e potenciais usos maliciosos** que, segundo a equipe da Anthropic, **não tinham sido adequadamente tratados**.

Em uma reunião de emergência, em **dezembro de 2022**, Dario, Daniela, Jared, Chris, e os outros líderes da Anthropic, decidiram **acelerar o lançamento do Claude** — o modelo que, na época, estava em fase final de treinamento, e que seria, segundo a empresa, **o primeiro modelo de fronteira a ser lançado com safety review pública e com Constitutional AI implementado em escala**.

### 5.2 O treinamento do Claude: o que havia por dentro

O **Claude 1** foi treinado, ao longo de 2022, em um cluster de aproximadamente **4.000 GPUs A100** da NVIDIA, hospedadas no Google Cloud. O treinamento, do início ao fim, durou **cerca de 4 meses** (junho a outubro de 2022) e custou, em computação, **cerca de US$ 25 milhões** — um valor modesto em comparação com o GPT-3 (estimado em US$ 4-12 milhões) ou com o GPT-4 (estimado em US$ 100 milhões), mas significativo para uma empresa do tamanho da Anthropic em 2022.

O modelo, em si, era **um Transformer de cerca de 52 bilhões de parâmetros** — um tamanho intermediário entre o GPT-3 (175B) e o GPT-3.5 (modelos "Davinci" usados no InstructGPT). A escolha de tamanho não foi acidental. Em 2022, a Anthropic, com base em seus próprios estudos de **scaling laws** (liderados por Jared Kaplan), havia concluído que **modelos menores, com Constitutional AI implementado, podiam competir com modelos maiores** em tarefas de segurança e utilidade — uma conclusão contraintuitiva, mas que, em retrospecto, foi **a primeira evidência empírica** de que **safety não é incompatível com escala**.

O **Constitutional AI**, no caso do Claude 1, foi implementado em três camadas:

1. **Camada 1: Pre-training padrão**. O modelo foi pré-treinado, como qualquer LLM, em um corpus massivo de texto da web, de livros, de papers, e de código. Nada de excepcional, nessa camada — a Anthropic, como todas as outras empresas, dependia de grandes datasets públicos e semi-privados.

2. **Camada 2: Supervised Fine-Tuning (SFT) com RLAIF**. Depois do pre-training, o modelo foi fine-tuned em tarefas de **seguir instruções humanas** — usando, no entanto, **RLAIF (Reinforcement Learning from AI Feedback)** em vez de **RLHF**. A "constituição" usada era um conjunto de cerca de **50 princípios**, derivados de declarações universais de direitos humanos, de cartas de direitos constitucionais, de códigos de ética profissional (médico, jurídico), e de princípios deontológicos clássicos. O modelo foi solicitado a **classificar suas próprias respostas** com base nesses princípios, e a **refinar as respostas** que violassem os princípios.

3. **Camada 3: RLHF final**. Por fim, o modelo foi, ainda, **fine-tuned com feedback humano** (RLHF clássico), usando anotadores contratados pela Anthropic. O objetivo dessa camada final era ajustar o modelo para **preferências humanas específicas** (formato de resposta, tom, profundidade), sem comprometer os princípios da camada 2.

O resultado, quando o modelo foi avaliado internamente, em dezembro de 2022, foi, segundo Dario, *"o melhor modelo de fronteira em segurança, e o terceiro ou quarto em capacidade bruta — atrás do GPT-3.5 e, talvez, do PaLM do Google"*. A frase, em 2023, parecia modesta. Em retrospecto, era **uma admissão estratégica**: a Anthropic, em 2023, **não pretendia competir com a OpenAI em capacidade bruta**. Pretendia competir **em segurança e em interpretabilidade**, e, com o tempo, **convencer o mercado** de que essas dimensões importam mais do que benchmarks.

### 5.3 O lançamento do Claude 1 (março de 2023): estratégia, contexto, e reação

O **Claude 1** foi lançado em **março de 2023** — quatro meses depois do ChatGPT, e em um momento em que a OpenAI já tinha 100 milhões de usuários e estava finalizando o GPT-4. O lançamento foi, em vários sentidos, **deliberadamente modesto**. A Anthropic não fez keynote. Não fez coletiva de imprensa. Não fez campanha de marketing. Em vez disso, fez **um post de blog** e **liberou o modelo para um grupo restrito de clientes** (chamado **"Claude early access"**), com a promessa de expandir gradualmente o acesso ao longo de 2023.

A estratégia de lançamento refletia, segundo Daniela, **a filosofia operacional** da empresa: *"Se a OpenAI lança primeiro e corrige depois, a gente lança depois e não precisa corrigir. A diferença, no curto prazo, parece desvantagem. No longo prazo, é vantagem — porque clientes enterprise não querem produtos que foram lançados precipitadamente."*

A reação do mercado foi, à época, **morna**. A OpenAI, com o GPT-4, era **a referência**. O Claude 1 era visto, na imprensa, como **"o concorrente ético do ChatGPT"** — uma caracterização que era parcialmente correta, mas que também era, segundo a Anthropic, **um eufemismo**. A Anthropic, em 2023, **não queria ser o "concorrente ético" do ChatGPT**. Queria ser **uma alternativa estruturalmente diferente** — uma empresa que, por construção, não repetiria os erros da OpenAI.

### 5.4 Os primeiros clientes e o início da tração enterprise

A **primeira tração comercial** do Claude veio, em **abril-julho de 2023**, de um segmento que, na época, era **subestimado pelo mercado**: **clientes enterprise** que precisavam de **IA de alta-stakes** — ou seja, IA usada em contextos onde erros tinham consequências graves (jurídico, médico, financeiro, regulatório).

Os primeiros clientes foram empresas como **Notion** (que usou o Claude em sua função de "AI writing assistant"), **Quora** (que usou o Claude em seu produto "Poe"), **Dunzo** (logística, Índia), **Y Combinator** (que recomendou Claude a startups do batch W23), e, crucialmente, **um conjunto de empresas de serviços jurídicos e financeiros** que, segundo a Anthropic, *"precisavam de um modelo que, ao errar, errasse com cuidado, e que, ao ser auditado, pudesse mostrar como chegou à resposta"*.

A escolha do segmento enterprise, em 2023, **se mostrou profética**. Em 2024-2025, com a regulamentação de IA se intensificando globalmente (AI Act da UE em vigor desde 2024, Executive Order 14110 do Biden em 2023, AI Bill of Rights do NIST em 2026), **clientes enterprise passaram a exigir, explicitamente, interpretabilidade e auditabilidade** — exatamente o que a Anthropic vinha prometendo desde 2021.

### 5.5 O Claude 2 (julho de 2023): a primeira grande atualização

Em **julho de 2023**, a Anthropic lançou o **Claude 2** — uma atualização significativa do Claude 1, com três grandes mudanças:

1. **Janela de contexto de 100.000 tokens** (mais que o dobro do Claude 1, e mais que o GPT-4 Turbo de 128K, em paridade técnica). A janela de 100K permitia ao Claude processar, em uma única conversa, **cerca de 75.000 palavras** — o tamanho de um romance curto. Foi, em julho de 2023, **a maior janela de contexto** disponível comercialmente.

2. **Capacidades de raciocínio expandidas**: o Claude 2 era substancialmente melhor que o Claude 1 em **matemática, codificação, raciocínio lógico, e compreensão de textos longos**. Em vários benchmarks públicos, o Claude 2 **superava o GPT-3.5** e, em alguns, se aproximava do GPT-4.

3. **Constitutional AI expandido**: a "constituição" do Claude 2 foi expandida para cerca de **75 princípios** (vs. 50 do Claude 1), e o processo de RLAIF foi refinado para incluir **cláusulas de "auto-reparação"** — situações em que o modelo, ao detectar que uma resposta violava um princípio, era autorizado a **reformular a resposta** em vez de simplesmente negá-la.

O Claude 2, segundo a imprensa, **foi recebido com entusiasmo moderado** — não como um "iPhone moment" (esse título ficou com o ChatGPT, em 2022), mas como **um sinal de que a Anthropic estava no caminho certo**. Dario, em entrevista ao *Bloomberg* em agosto de 2023, foi direto: *"Não estamos tentando vencer a OpenAI em headlines. Estamos tentando vencê-la em confiança, em transparência, e em valor de longo prazo para o cliente."*

### 5.6 O significado filosófico do Constitutional AI

Para entender a importância do Constitutional AI, é preciso entender **o problema que ele resolve**. O problema, em 2021-2022, era o seguinte: **como treinar um modelo de IA a ser seguro quando não há, no mundo, um conjunto unificado de valores humanos?**

A abordagem padrão, o **RLHF**, resolvia o problema **delegando a decisão de "o que é seguro" a um conjunto de anotadores humanos** — em geral, contratados em plataformas como a Scale AI. A abordagem funcionava, mas tinha um problema fundamental: **os anotadores humanos são caros, lentos, e introduziam vieses próprios** (regionais, culturais, políticos, religiosos). Modelos treinados com RLHF, em 2022, tinham um **viés de "senso comum californiano"** — eram mais seguros para um público americano liberal urbano do que para um público global diverso.

O **Constitutional AI**, em contraste, **externalizava parte da decisão para um conjunto de princípios explícitos** — uma "constituição". A ideia era, em parte, inspirada na **tradição constitucionalista** da teoria política: **em uma democracia, valores coletivos não são decididos caso a caso por juízes, mas por princípios gerais estabelecidos em uma constituição**. Da mesma forma, em IA, valores não deveriam ser decididos caso a caso por anotadores, mas por **princípios gerais** que pudessem ser **auditados, discutidos, e revisados**.

A "constituição" do Claude, em 2023, era, portanto, **um documento público**, disponibilizado pela Anthropic em seu site, com 75 princípios explícitos. Os princípios incluíam:

- *"Por favor, escolha a resposta que cause menos dano a grupos marginalizados."*
- *"Por favor, escolha a resposta que seja mais honesta sobre os limites do conhecimento do modelo."*
- *"Por favor, escolha a resposta que respeite a autonomia do usuário, mesmo quando o usuário está errado."*
- *"Por favor, escolha a resposta que seja consistente com o Estado de Direito, com os direitos humanos, e com a dignidade da pessoa humana."*

Os princípios, embora genéricos, **funcionavam, em prática, como um guia estável** para o modelo. E, ao contrário dos anotadores humanos, **não se cansavam, não tinham vieses regionais, e não precisavam ser pagos por hora**.

### 5.7 O "Claude Character": a persona como produto

Uma decisão surpreendente da Anthropic, em 2022-2023, foi **dar ao Claude uma "persona" explícita**. Em vez de ser, como o GPT, **um assistente genérico e neutro**, o Claude foi treinado, em parte, a ter **um conjunto explícito de traços de caráter**: curioso, cuidadoso, honesto sobre incertezas, e disposto a dizer "não sei" quando não sabe.

A decisão foi, em parte, **filosófica**. Dario, em entrevista ao *NYT* em 2023, foi explícito: *"A ideia de que um modelo de IA pode ser 'neutro' é, em si, um mito. Todo modelo tem, embutido em seus dados de treinamento, um conjunto de valores implícitos. A questão não é 'ter ou não ter valores'. A questão é 'ter valores explícitos, auditáveis, e discutíveis' ou 'ter valores implícitos, opacos, e acidentais'."*

A persona do Claude, em 2023, **se tornou, inesperadamente, um diferencial de mercado**. Usuários passaram a preferir o Claude, em muitas tarefas, **justamente porque ele era mais honesto sobre suas limitações** — o que, em um mercado saturado de IAs que "alucinavam" com confiança, era **um diferencial de confiança**. A frase *"Honest about not knowing"* (Honesto sobre não saber), cunhada pela Anthropic em 2023, se tornaria, nos anos seguintes, **um dos lemas não-oficiais** do marketing da empresa.

---

# CAPÍTULO 6

## Claude 3, 3.5 Sonnet, Sonnet 4 — A Tomada do Mercado de Código (2024)

### 6.1 O ano de 2024: a Anthropic sai da defensiva

Se 2023 foi o ano em que a Anthropic **existiu** (fundação, primeiros modelos, primeiros clientes), 2024 foi o ano em que a Anthropic **competiu** — e, em vários segmentos, **venceu**. O ano começou com **duas decisões estratégicas** que definiriam o resto da década:

**Primeira decisão**: lançar o **Claude 3** em **março de 2024**, em três tamanhos (Haiku, Sonnet, Opus), com janela de contexto de **1 milhão de tokens** (Sonnet e Opus) e com **capacidades multimodais** (entrada de imagem). O Claude 3, em benchmarks públicos, **superou o GPT-4** em vários testes de raciocínio, matemática, e compreensão de leitura longa. Em particular, o **Claude 3 Opus** se tornou, por algumas semanas, **o modelo mais bem avaliado em benchmarks independentes** — uma posição que, até então, era ocupada exclusivamente pela OpenAI.

**Segunda decisão**: seis meses depois, em **junho de 2024**, lançar o **Claude 3.5 Sonnet** — um modelo que, em preço (US$ 3/M tokens de entrada, US$ 15/M de saída) e em performance, **substituiu, na prática, o Claude 3 Opus como o modelo padrão recomendado** para a maioria dos clientes. O 3.5 Sonnet era, em média, **2x mais rápido que o Opus**, **80% mais barato**, e **significativamente mais capaz em codificação** — uma combinação que, em 2024, **se mostrou irresistível para o mercado enterprise**.

### 6.2 A revolução do "computer use" — Claude vê, mexe, clica

Em **outubro de 2024**, a Anthropic anunciou **o "computer use"** — uma capacidade do Claude 3.5 Sonnet (versão atualizada) de **interagir diretamente com a interface gráfica de um computador**: mover o mouse, clicar em botões, digitar texto, abrir e fechar janelas, navegar em sites, preencher formulários. A capacidade, embora ainda em beta, foi **a primeira demonstração pública, por uma grande empresa, de um modelo de IA agindo diretamente no mundo digital**.

O "computer use" foi, em certo sentido, **a materialização de um sonho antigo da IA**: o modelo não era mais limitado a **responder a perguntas** ou a **gerar texto** — ele **agia no mundo**. A capacidade, embora rudimentar em 2024 (o modelo errava em cerca de 30% das ações complexas), **inaugurou uma nova era** — a era dos **agentes** de IA, que seria, em 2025-2026, **a próxima grande onda** da indústria.

A decisão da Anthropic de **anunciar o computer use antes de torná-lo produto** foi, segundo Dario, **deliberada**: *"Queríamos que a sociedade tivesse tempo de discutir, antes que o produto estivesse pronto. O computer use tem implicações enormes — em segurança, em empregos, em privacidade. Não queríamos lançar precipitadamente e descobrir os problemas depois."*

### 6.3 A tomada do mercado de coding

A história mais importante da Anthropic em 2024-2025, no entanto, **não foi a dos modelos em si**, mas a de um segmento de mercado específico: **coding agents** — ou seja, IAs usadas por desenvolvedores de software para escrever, depurar, refatorar, e revisar código.

Em **2023**, o mercado de coding agents era dominado pelo **GitHub Copilot** (baseado em GPT) e por **Codeium** (baseado em modelos próprios). O Claude, em 2023, era usado por uma minoria de desenvolvedores. Mas, em **meados de 2024**, com o lançamento do **Claude 3.5 Sonnet**, **a balança começou a pender** — e, em **janeiro de 2025**, com o **Claude 3.5 Sonnet (new)**, **a balança pendeu de vez**.

O que aconteceu, em resumo, foi o seguinte: o **Claude 3.5 Sonnet (new)**, lançado em outubro de 2024 e atualizado em janeiro de 2025, era, em benchmarks de codificação (**SWE-bench Verified**), **significativamente superior ao GPT-4o e ao o1** — atingindo **49.0% no SWE-bench Verified** (vs. 33.4% da versão anterior), e **superando, em tarefas reais, todos os outros modelos públicos do mundo**. O resultado, em termos de mercado, foi **rápido e brutal**: até março de 2025, **o Claude era o modelo preferido de 64% dos desenvolvedores de software nos EUA**, e **a ferramenta padrão em IDEs como Cursor, Windsurf, Replit, Cline, e Zed**.

A razão, segundo CTOs ouvidos pela imprensa em 2025, era simples: **o Claude 3.5 Sonnet não era, em média, mais inteligente do que o GPT-4o**. Mas era **mais consistente em tarefas longas**, **mais cuidadoso em mudanças de código**, **mais transparente em suas decisões** (com capacidade de explicar, em linguagem natural, por que fez uma mudança), e **menos propenso a "alucinar" APIs ou funções inexistentes**. Em outras palavras, **era mais previsível** — e, para um desenvolvedor, previsibilidade é **a propriedade mais valiosa** que um modelo pode ter.

### 6.4 Cursor, Claude Code, e a nova economia do software

A história do **Cursor** — o editor de código AI-first que, em 2025, atingiu valuation de US$ 9 bilhões — é, em muitos sentidos, **a história da Anthropic no mercado de coding**. O Cursor, fundado por **Aman Sanger** e **Sualeh Asif** em 2022, escolheu, em 2023, **basear todo o seu produto no Claude** — em uma decisão que, na época, era vista como arriscada (a OpenAI, com o GPT-4, era a referência). Mas, em 2024, com o Claude 3.5 Sonnet, **a aposta se pagou dezenas de vezes**: o Cursor se tornou **o editor de código preferido de startups, de empresas de tecnologia, e de engenheiros independentes** — e, em 2025, era usado por **milhões de desenvolvedores** no mundo.

O **Claude Code**, lançado oficialmente em 2025, era a **resposta da própria Anthropic** ao mercado crescente. Era, em essência, **um agente de coding nativo** — um modelo de IA que, em vez de apenas completar código em um editor, **planejava, escrevia, testava, depurava, e commitava** código em um repositório Git, com supervisão mínima do desenvolvedor humano. O Claude Code, em 2025, era **o produto de coding mais usado no mundo**, com **milhões de usuários ativos mensais** e **centenas de milhões de dólares em receita recorrente**.

A nova economia do software, em 2025, era, portanto, **uma economia de "Claude-first"**: a maioria das novas startups de software, em 2025, **nascia já com Claude como motor de codificação**, e muitas equipes, em empresas estabelecidas, **migravam de Copilot/GPT para Claude 3.5/4** ao longo de 2024-2025.

### 6.5 Claude 4 (2025): a fronteira se expande

Em **2025**, a Anthropic anunciou a família **Claude 4** — **Haiku 4**, **Sonnet 4**, e **Opus 4**. Cada um dos modelos tinha **capacidades expandidas** em relação à geração anterior, com foco em três eixos:

1. **Raciocínio profundo ("extended thinking")**: capacidade de **gastar mais tempo "pensando"** antes de responder, com internal chain-of-thought, similar ao o1 da OpenAI. O Claude 4 Sonnet, em problemas complexos de matemática e de programação, **superava o Sonnet 3.5 em 40-60%** — uma melhoria significativa, em um campo em que melhoramentos marginais são cada vez mais difíceis.

2. **Agentes autônomos**: capacidade de **executar cadeias longas de ações** com supervisão mínima. O Claude 4 Sonnet, em benchmarks de "long-horizon agentic tasks", era, em 2025, **o modelo mais capaz do mundo**.

3. **Janela de contexto de 1M+ tokens**: continuação da estratégia de **contexto longo**, agora padrão em todos os modelos Claude 4. O Claude 4 Opus, em particular, tinha **1.5M de tokens de janela** — o equivalente a **mais de 1 milhão de palavras**, ou **mais de 3.000 páginas de texto**.

A Claude 4, em 2025, era, em benchmarks, **competitiva com o GPT-5** (lançado em abril de 2025) e **superior em várias categorias** (coding, agentes, raciocínio prolongado). A Anthropic, em 2025, **já não era mais "a alternativa segura"** — era **uma das duas empresas líderes** da corrida de IA de fronteira.

### 6.6 Sonnet 4.5 (outubro de 2025) — o "modelo dos agentes"

Em **outubro de 2025**, a Anthropic anunciou o **Claude Sonnet 4.5** — que, em 2026, é **o modelo de fronteira mais usado do mundo para coding agents e computer use**. O Sonnet 4.5 combinava:

- **Capacidades de raciocínio profundo** (extended thinking).
- **Computer use** estável e confiável, com **taxa de erro abaixo de 5%** em tarefas complexas de UI.
- **Tool use robusto**, com capacidade de **chamar, sequenciar, e paralelizar** chamadas a ferramentas externas (busca, código, APIs, browsers).
- **Janela de contexto de 1M tokens** com **attention sinks** otimizados (mecanismo que permite processamento eficiente de contextos muito longos).

O Sonnet 4.5 era, segundo benchmarks independentes, **o melhor modelo do mundo em coding, em agentes, e em computer use** — três categorias que, em 2025-2026, são **as categorias economicamente mais relevantes** da IA generativa. E, com preço de US$ 3/M tokens de entrada, era, também, **um dos mais baratos** — o que, em mercados sensíveis a preço, era **um diferencial competitivo decisivo**.

### 6.7 A reação da OpenAI e a nova corrida

A tomada, pela Anthropic, do mercado de coding, **forçou a OpenAI a reagir** — e, em 2025, a OpenAI lançou o **Codex 2.0** (junho de 2025) e o **Operator** (janeiro de 2025, atualizado em 2026), tentando reconquistar o mercado. A reação, em 2026, é considerada **parcialmente bem-sucedida**: a OpenAI mantém **forte presença em pesquisa de IA** (com o1, o3, o4, GPT-5), mas, no segmento de coding, **perdeu a liderança para a Anthropic** — uma derrota simbólica que, em 2024, era impensável.

A corrida, em 2026, é, portanto, **uma corrida de duas pontas**: **OpenAI e Anthropic**, com Google DeepMind em terceiro, Meta em quarto (com Llama 4), e Mistral/DeepSeek como competidores regionais. E a Anthropic, em 2026, **não é mais a "alternativa segura"** — é **uma das duas empresas que definem o que IA de fronteira significa em 2026**.

---

# CAPÍTULO 7

## Constitutional AI Avançado, RLHF e o Conceito de "Scalable Oversight"

### 7.1 O problema fundamental: como supervisionar uma IA mais inteligente do que o supervisor?

Para entender o conceito de **"scalable oversight"** (supervisão escalável), é preciso entender um problema que, em 2023-2024, se tornou **central** no campo de AI safety: **como um humano pode supervisionar, de forma confiável, um sistema de IA que, em algum momento, será mais inteligente do que ele?**

O problema tem um nome formal: **"alignment problem"** (problema de alinhamento) — a questão de garantir que um sistema de IA, à medida que se torna mais capaz, **continue fazendo o que seus criadores querem**, em vez de, eventualmente, otimizar para alguma outra coisa (seja por erro, por mal-entendido, ou por manipulação deliberada).

O problema, em 2020-2022, parecia teórico. Em 2024-2026, se tornou **prático**: modelos como o Claude 3 Opus, o GPT-4, o o1, e o Gemini 1.5 Ultra **já eram, em tarefas específicas, mais capazes do que a maioria dos humanos**. E, em 2025-2026, com modelos agentes operando em ambientes reais (computadores, browsers, sistemas operacionais), **a supervisão humana se torna, em si, um gargalo** — não por falta de vontade, mas por **falta de capacidade**.

### 7.2 As três abordagens da Anthropic ao scalable oversight

A Anthropic, desde 2021, dedicou **uma fração significativa** de sua pesquisa ao problema do scalable oversight. A abordagem da empresa tem **três pilares**, todos derivados, em parte, da tradição filosófica do **constitucionalismo**:

**Primeiro pilar: Constitutional AI**. Como vimos no Capítulo 5, o Constitutional AI externaliza parte do julgamento de valores para um conjunto de **princípios explícitos**. A "constituição" é, portanto, **um mecanismo de supervisão escalável**: em vez de pedir a um humano que julgue cada resposta, o sistema pede que o próprio modelo **julgue com base em princípios estáveis**.

**Segundo pilar: Debate**. Inspirado no paper seminal de **Geoffrey Irving, Paul Christiano, e Dario Amodei** (2018, "AI Safety via Debate"), o método do **debate** propõe que dois modelos de IA **argumentem** entre si sobre uma questão, e que um humano (ou um juiz externo) **decida qual argumento é mais convincente**. A intuição é que, em um debate bem estruturado, **as informações verdadeiras se tornam mais salientes** do que as informações enganosas — porque o modelo que está mentindo tem que **construir, em tempo real, um argumento consistente** com a mentira, o que, com o tempo, se torna progressivamente mais difícil.

A Anthropic, em 2023-2025, investiu pesadamente em **pesquisa de debate**, e publicou, em 2024, uma série de papers mostrando que **debate entre modelos reduz erros** em tarefas de raciocínio moral e em tarefas de fact-checking. A técnica, embora ainda em pesquisa, é, em 2026, **uma das mais promissoras** para oversight de modelos super-humanos.

**Terceiro pilar: Weak-to-strong generalization** (generalização de fraco para forte). Esta é, em certo sentido, **a mais ambiciosa** das três abordagens. A ideia, formalizada por **Colin Burns** e outros pesquisadores da Anthropic em 2023, é: **um modelo menor (fraco) pode ser usado para supervisionar um modelo maior (forte)**, mesmo que o modelo menor não entenda completamente o que o maior está fazendo. A técnica usa **fine-tuning do modelo maior com sinais do modelo menor**, e mostra que, surpreendentemente, **o modelo maior generaliza** os sinais do menor **de forma que vai além do que o menor sabia**. É, em essência, **a esperança de que um modelo "menos inteligente" possa, ainda assim, supervisionar um modelo "mais inteligente"** — desde que, é claro, a supervisão seja estruturada com cuidado.

### 7.3 Os resultados do scalable oversight: o que funciona, o que não funciona

Em 2024-2025, a Anthropic publicou uma série de papers avaliando **o que funciona, e o que não funciona**, em scalable oversight. Os resultados são, em vários sentidos, **cautelosos**:

- **Constitutional AI funciona** para reduzir **vieses óbvios e violações de princípios explícitos** (recusa de instruções perigosas, respostas tendenciosas, etc.). Funciona **menos bem** em casos onde o "valor" é ambíguo ou culturalmente variável.

- **Debate funciona** para reduzir **erros factuais** e **alucinações**. Funciona **menos bem** quando os dois debatedores "concordam" por motivos errados (groupthink, echos chambers).

- **Weak-to-strong funciona** para tarefas **bem definidas** (classificação, formatação). Funciona **menos bem** em tarefas abertas, onde o sinal do modelo fraco é ruidoso.

A conclusão, em 2026, é que **scalable oversight é um problema difícil, sem solução única, e que exige múltiplas técnicas combinadas**. Mas, ao contrário de 2021, quando o problema parecia "insolúvel", em 2026 **há, pela primeira vez, técnicas concretas que funcionam** — e que estão sendo implementadas, em escala industrial, **em todos os modelos Claude**.

### 7.4 A interpretabilidade mecanicista como forma de oversight

Uma quarta abordagem, que se tornou **central** na Anthropic a partir de 2024, é a **interpretabilidade mecanicista** — a disciplina fundada por Chris Olah. A ideia é simples, mas poderosa: **se conseguirmos olhar para dentro do modelo e entender o que está acontecendo em cada circuito, então, em certo sentido, "supervisionamos" o modelo por dentro, em vez de apenas pelo comportamento externo**.

Em 2024-2025, a Anthropic publicou uma série de papers seminais — entre eles **"Mapping the Mind of a Large Language Model"** (maio de 2024) e **"On the Biology of a Large Language Model"** (julho de 2024) — que mostravam, pela primeira vez, **mapas interpretáveis de features internas** em modelos Claude de 3-4 bilhões de parâmetros. Os mapas eram, em vários sentidos, **espetaculares**: mostravam, com clareza visual, que **o modelo aprendeu, espontaneamente, representações de conceitos** (emoções, estruturas gramaticais, fatos do mundo) **organizadas em "circuits" hierárquicos**.

Em 2025, a equipe de interpretabilidade da Anthropic, agora com **mais de 50 pesquisadores**, publicou um paper especialmente importante: **"Circuit Tracing: Revealing Computational Graphs in Language Models"** (julho de 2025), que demonstrava, pela primeira vez, **a capacidade de "traçar" o caminho de uma resposta específica** através de circuitos do modelo — mostrando, com clareza, **quais features se ativaram, em qual ordem, para produzir uma resposta**. A capacidade, em 2025, era ainda experimental — mas a direção era clara: **a interpretabilidade mecaniciste está se tornando, gradualmente, uma ferramenta prática de auditoria**.

### 7.5 A relação entre Constitutional AI e interpretabilidade

Um aspecto da abordagem da Anthropic, que merece destaque, é **a relação simbiótica entre Constitutional AI e interpretabilidade**. Em uma empresa típica de IA, safety e capabilities são, em geral, **trade-offs** — quanto mais capaz o modelo, mais difícil de supervisionar. Na Anthropic, a hipótese é que **Constitutional AI e interpretabilidade são complementares**:

- O Constitutional AI dá ao modelo **princípios** pelos quais ele pode se auto-regular.
- A interpretabilidade dá aos engenheiros **ferramentas** para auditar, em detalhe, o que o modelo está fazendo.
- Juntas, as duas abordagens criam **um ciclo virtuoso**: o Constitutional AI diz ao modelo "seja X", e a interpretabilidade verifica, internamente, **se o modelo realmente é X**.

A estratégia, em 2026, é **única na indústria**. A OpenAI, em 2024-2026, tem investido pesadamente em **RLHF e em red-teaming**, mas tem, publicamente, **menos ênfase em interpretabilidade mecanicista** (embora tenha uma equipe pequena, e tenha publicado papers importantes na área). O Google DeepMind, em 2024-2026, tem investido em **safety eval e em red-teaming**, mas, também, com menos ênfase em interpretabilidade interna. A Meta, com o Llama, tem priorizado **open weights** em vez de interpretabilidade. **A Anthropic é, em 2026, a única empresa de fronteira que trata interpretabilidade como pilar estratégico central**.

### 7.6 O que isso significa para o futuro

A escolha estratégica da Anthropic — interpretabilidade como pilar — **pode ser, em retrospecto, a decisão mais importante da história da empresa**. Por três razões:

**Primeira**: a interpretabilidade, se funcionar em escala, **resolve o problema de scalable oversight**. Se pudermos olhar para dentro de um modelo e entender o que está fazendo, então, em certo sentido, **não precisamos de um humano mais inteligente do que o modelo para supervisioná-lo** — precisamos de **boas ferramentas de visualização e auditoria**.

**Segunda**: a interpretabilidade cria **um fosso competitivo** (moat). Modelos são, em 2026, cada vez mais parecidos em capacidade bruta. O diferencial, em 2026-2030, será, cada vez mais, **segurança, auditabilidade, e interpretabilidade** — exatamente as dimensões em que a Anthropic tem investido por cinco anos.

**Terceira**: a interpretabilidade pode, eventualmente, **ser obrigatória por regulamentação**. Em 2026, o **AI Act da UE** já exige, para certos usos de IA, "transparência sobre o funcionamento interno" do modelo. Em 2027-2028, com a regulamentação se intensificando globalmente, **a interpretabilidade pode deixar de ser um diferencial e se tornar um requisito legal**. A Anthropic, em 2026, está **5 anos à frente** de qualquer concorrente nessa dimensão.

---

# CAPÍTULO 8

## Os Modelos Soberanos, o Projeto de $40B e a Rivalidade com OpenAI (2025)

### 8.1 A virada de 2025: de "concorrente seguro" a "concorrente real"

Se 2024 foi o ano em que a Anthropic **competiu**, 2025 foi o ano em que a Anthropic **ganhou**. Em janeiro de 2025, a empresa fechou uma rodada de financiamento de **US$ 4 bilhões** da Amazon, com avaliação de **US$ 61,5 bilhões** — a maior valuation de uma empresa privada de IA, em 2025, **excluindo a OpenAI** (que, com o Stargate, atingiu valuation de US$ 300+ bilhões). Em junho de 2025, a Anthropic fechou **mais US$ 2 bilhões** em uma rodada subsequente, com avaliação de **US$ 86 bilhões**. Em setembro de 2025, a Amazon anunciou **um investimento adicional de US$ 4 bilhões** — totalizando US$ 8 bilhões da Amazon em 2025, com avaliação implícita de **US$ 200+ bilhões**.

A escala do investimento, em 2025, **marcou uma virada estrutural**: a Anthropic deixou de ser **"a startup de safety que talvez um dia compita com a OpenAI"** e se tornou **"a segunda empresa de IA pura do mundo, em paridade estratégica com a OpenAI"**. A Amazon, ao investir, **não estava apenas comprando equity** — estava comprando **parceria estratégica exclusiva em cloud** (AWS como cloud preferencial) e **acesso preferencial** a modelos Claude para integração em produtos Amazon (Alexa, AWS Bedrock, etc.).

### 8.2 O Projeto Rainier: 1 gigawatt de supercomputador

A parceria com a Amazon, em 2025, **se materializou em infraestrutura** com o **Projeto Rainier** — anunciado em outubro de 2024 e operacionalizado em outubro de 2025, o Projeto Rainier é **um dos maiores clusters de IA do mundo**, com **quase 500.000 chips Trainium2** da Amazon, distribuídos em múltiplos data centers nos EUA. A capacidade total, **cerca de 1 gigawatt**, é, em 2025, **a maior capacidade de computação dedicada a uma única empresa privada em toda a história** — comparável, em escala, ao Stargate da OpenAI.

A escolha de **não usar NVIDIA** (a fornecedora tradicional de chips de IA) e, em vez disso, usar **Trainium2** (chips customizados da Amazon) foi, segundo Daniela Amodei em entrevista ao *FT* em 2025, **estratégica e filosófica**:

> *"A OpenAI depende, estruturalmente, da NVIDIA. Nós decidimos, desde cedo, que não queríamos ficar reféns de um único fornecedor. A Amazon, com o Trainium, está nos dando **independência tecnológica** — e, com isso, **independência estratégica**. Se a NVIDIA tiver problemas de supply, ou se os preços subirem, nós não seremos afetados. É uma questão de soberania tecnológica."*

O Projeto Rainier, em 2026, é **o coração da infraestrutura da Anthropic** — é onde os modelos Claude são treinados, onde as pesquisas de interpretabilidade rodam, e onde os produtos (Claude.ai, Claude Code, API) são servidos. A escala, em 2026, é, simplesmente, **impressionante**: **mais poder computacional do que toda a NASA, todo o CERN, e todo o sistema bancário global combinados, dedicados a uma única missão** — construir IA segura.

### 8.3 Os "Modelos Soberanos": a Anthropic como infraestrutura nacional

Uma frente inesperada da Anthropic, em 2025, foi a de **"Modelos Soberanos"** — modelos Claude customizados, treinados (ou fine-tuned) **em parceria com governos nacionais**, para usos de **segurança nacional, serviços públicos, e infraestrutura crítica**. A estratégia, anunciada em junho de 2025, era, segundo Daniela, **a mais ambiciosa tentativa, até hoje, de fazer IA servir à soberania de nações, em vez de apenas a empresas privadas**.

Os primeiros clientes de Modelos Soberanos foram, em 2025, **governos** (alguns dos quais, segundo a imprensa, incluíam o Reino Unido, a França, o Japão, e a Coreia do Sul), e a estratégia refletia, em parte, **a crescente preocupação global** com **dependência de IA americana ou chinesa** — e a busca, por parte de países aliados, de **uma terceira via**: **IA soberana, desenvolvida por uma empresa privada, mas com governança alinhada com valores democráticos**.

A Anthropic, em 2025, se posicionou, sem ambiguidade, como **a fornecedora preferencial de IA soberana para o Ocidente** — uma posição que, segundo Dario em entrevista ao *The Economist*, *"é, simultaneamente, um diferencial de mercado e um compromisso com os valores que a OpenAI ajudou a esquecer"*.

### 8.4 A rivalidade Anthropic-OpenAI em 2025

A rivalidade entre **Anthropic** e **OpenAI**, em 2025, deixou de ser **subtexto** e se tornou **texto aberto**. Os dois CEOs — Dario Amodei e Sam Altman — passaram a fazer, em 2025, **declarações públicas cada vez mais explícitas** sobre a rivalidade:

- Em **março de 2025**, Dario publicou, no *NYT*, um ensaio intitulado *"The race to the top is the only race that matters"*, em que argumentava, sem mencionar a OpenAI nominalmente, que a estratégia da concorrente de "ship fast, fix later" era **"um caminho para o desastre"**.

- Em **maio de 2025**, Sam Altman respondeu, em um post de blog, argumentando que **"the race to the top is a marketing slogan, not a strategy"** — uma crítica direta à Anthropic. Altman argumentava que **a OpenAI, ao lançar produtos, estava, na prática, *também* fazendo safety** — e que **a postura da Anthropic era, em si, uma forma de "safety theater"** (teatro de segurança).

- Em **agosto de 2025**, em um podcast conjunto (o *All-In Podcast*), os dois CEOs **concordaram em se encontrar, publicamente, em um debate ao vivo** em janeiro de 2026. O debate, marcado para o **Commonwealth Club de São Francisco**, foi, em janeiro de 2026, **um dos eventos mais assistidos da história da AI safety** — com mais de 5 milhões de espectadores ao vivo.

O debate, em janeiro de 2026, **não resolveu a rivalidade** — mas a cristalizou, em público, como **uma das duas visões legítimas** de como a humanidade deve construir IA. Dario, no debate, foi cirúrgico: *"Não estou dizendo que a OpenAI é má. Estou dizendo que, em uma tecnologia com potencial existencial, 'bom o suficiente' não é bom o suficiente. Precisamos de excelência em segurança, não de segurança como subproduto de correr rápido."* Altman, em resposta, foi pragmático: *"Dario é um homem brilhante. Mas, na prática, a Anthropic está 18 meses atrás de nós em capabilities. A história vai mostrar quem estava certo."*

### 8.5 Os números de 2025: a Anthropic em escala

Os números de 2025 mostram, sem ambiguidade, **a escala** que a Anthropic atingiu:

- **Receita**: US$ 5,6 bilhões (2024) → US$ 9 bilhões (2025), com projeção de US$ 26 bilhões em 2026.
- **Funcionários**: 1.200 (jan/2024) → 4.500 (dez/2025).
- **Clientes ativos**: 50.000+ (dez/2025), incluindo 80% da Fortune 500.
- **Tokens processados por dia**: 100+ bilhões (dez/2025).
- **Modelo mais usado**: Claude 3.5 Sonnet (new) → Claude 4 Sonnet → Claude Sonnet 4.5.
- **Share de mercado de coding agents**: 64% (EUA, dez/2025).
- **Valuation**: US$ 380 bilhões (estimativa, fev/2026).

A escala, em 2025, **muda a natureza da empresa**. A Anthropic, em 2025, **não é mais uma startup** — é **um gigante**, com a estrutura, os custos, e as responsabilidades de um gigante. E, com a escala, vêm **dilemas inéditos**: como manter a missão de safety em uma empresa de 4.500 funcionários? Como resistir à pressão de investidores por retorno? Como garantir que **a cultura de "race to the top"** sobreviva à transição de startup para empresa established?

### 8.6 A parceria com Google e Broadcom (2025)

Em **outubro de 2025**, a Anthropic anunciou **um acordo plurianual com Google e Broadcom** para **acesso a múltiplos gigawatts de capacidade de TPU** (Tensor Processing Units, os chips customizados do Google). O acordo, em escala, é comparável ao Projeto Rainier (Amazon), mas com **chips diferentes** e **parceiro diferente** — reforçando, na prática, **a estratégia de "não-dependência-de-um-único-fornecedor"** que a Anthropic vem seguindo desde 2021.

A estratégia **multi-cloud, multi-chip** da Anthropic é, em 2025, **única entre as grandes empresas de IA**. A OpenAI depende quase exclusivamente da Microsoft/Azure. A Google DeepMind depende do Google Cloud. A Meta depende de sua própria infraestrutura. **A Anthropic, sozinha, opera em três provedores** (AWS, GCP, e, parcialmente, em data centers próprios) e em **duas arquiteturas de chip** (Trainium2 e TPU v5/v6). A resiliência operacional, segundo Daniela, é, em si, **um diferencial estratégico**.

### 8.7 O significado do "race to the top" em 2026

Em 2026, **"race to the top"** deixou de ser **uma frase de blog** e se tornou **uma categoria de mercado**. Clientes enterprise, em 2026, **não compram IA apenas por capacidade** — compram por **confiança, auditabilidade, e responsabilidade**. E, nessa categoria, **a Anthropic é, em 2026, a líder clara do mercado ocidental**.

A frase, cunhada por Dario Amodei em janeiro de 2021, **cinco anos antes**, foi, em retrospecto, **a tese de investimento** da empresa. E, em 2026, **a tese se confirmou**.

---

# CAPÍTULO 9

## Claude em 2026 — Estado da Arte, Auditoria, Responsible Scaling Policies

### 9.1 O estado da arte: Claude Opus 4.6, Sonnet 4.5, e Haiku 4

Em **2026**, a família Claude tem **três modelos principais**, cada um com posicionamento de mercado distinto:

**Claude Opus 4.6** (lançado em **fevereiro de 2026**): o modelo **mais capaz** da Anthropic, com 1,5 trilhão de parâmetros, janela de contexto de 1,5 milhão de tokens, capacidades multimodais (texto, imagem, áudio, vídeo), e **ranking top-1 em 14 dos 20 benchmarks públicos** mais relevantes. É o modelo usado em aplicações **high-stakes** (jurídico, médico, financeiro) e em pesquisa de ponta.

**Claude Sonnet 4.5** (lançado em **outubro de 2025**): o modelo **de melhor relação custo-benefício** da Anthropic, com 300+ bilhões de parâmetros, e **o modelo de fronteira mais usado do mundo para coding agents e computer use**. Em 2026, é o modelo default em IDEs, em ferramentas de agentic AI, e em produtos enterprise.

**Claude Haiku 4** (lançado em **agosto de 2025**): o modelo **mais barato e mais rápido** da família, com 50 bilhões de parâmetros, e **latência abaixo de 100ms** para respostas curtas. É o modelo usado em **produtos de alta frequência** (chatbots, assistentes, integrações em tempo real).

A família, em conjunto, cobre **toda a gama de uso** — de respostas em tempo real a análises multi-dia — e é, em 2026, **a família de modelos mais usada do mundo** em aplicações enterprise.

### 9.2 Responsible Scaling Policies (RSPs): o regime de auditoria da Anthropic

Um dos pilares, em 2026, da estratégia da Anthropic é o **Responsible Scaling Policy (RSP)** — um **regime de auditoria interna** que **classifica os modelos da empresa em "níveis de capacidade"** e **exige, em cada nível, garantias adicionais de segurança** antes do lançamento.

A política, inspirada em parte pelo **AI Safety Levels** do Google DeepMind, mas mais detalhada, foi anunciada em **setembro de 2023** e atualizada em **janeiro de 2025** e **janeiro de 2026**. Em sua versão atual (janeiro de 2026), o RSP tem **cinco níveis**:

- **AI Safety Level 1 (ASL-1)**: modelos com capacidade limitada, que não representam riscos sérios. Requisitos: avaliação de viés, de toxicidade, e de alucinação.
- **AI Safety Level 2 (ASL-2)**: modelos com capacidade moderada, que podem ser usados em aplicações práticas. Requisitos: red-teaming, avaliação de jailbreak, e interpretabilidade básica.
- **AI Safety Level 3 (ASL-3)**: modelos com capacidade alta, com riscos potenciais de misuse. Requisitos: red-teaming extensivo, interpretabilidade avançada, e, em alguns casos, **restrições de deployment**.
- **AI Safety Level 4 (ASL-4)**: modelos com capacidade muito alta, com riscos potenciais de "assistência a ameaças catastróficas" (biológicas, químicas, cibernéticas, nucleares). Requisitos: interpretabilidade profunda, red-teaming adversarial, e **deployment apenas com autorização governamental**.
- **AI Safety Level 5 (ASL-5)**: modelos com capacidade superior à humana em tarefas críticas. Requisitos: **deployment apenas após aprovação de um comitê internacional de segurança de IA**.

O Claude 4.5, em 2026, é classificado como **ASL-3**. O Claude Opus 4.6 está, em 2026, **em revisão para ASL-4** — o que significa que, se a Anthropic decidir avançar com o Opus 4.6, terá que **obter autorização governamental** antes de fazer deployment em larga escala. A política, em 2026, é, na prática, **a primeira auto-regulação significativa** da indústria de IA.

### 9.3 A interpretabilidade como serviço de auditoria

Em 2026, a Anthropic **monetiza interpretabilidade**. A empresa oferece, a clientes enterprise, um serviço chamado **"Claude Interpretability Audit"** — uma auditoria de modelo, em que a equipe de interpretabilidade da Anthropic **olha, em detalhe, para o que o modelo está fazendo** em casos específicos de uso do cliente. A auditoria produz, como entregável, **um relatório técnico** com **mapas de features, identificação de circuitos potencialmente problemáticos, e recomendações de mitigação**.

O serviço, em 2026, é usado por **bancos, empresas farmacêuticas, e órgãos governamentais** que, por regulação ou por política interna, **precisam auditar modelos de IA** antes de colocá-los em produção. A Anthropic, em 2026, é, nesse segmento, **a única empresa do mundo** que oferece, comercialmente, **interpretabilidade mecanicista** como serviço. E a demanda, em 2026, está **crescendo exponencialmente** — o que, segundo Daniela, *"valida a aposta que fizemos em 2021"*.

### 9.4 Os Principles da Anthropic em 2026

Em 2026, a Anthropic mantém, publicamente, **um conjunto de 12 princípios** que guiam, formalmente, todas as decisões da empresa. Os princípios, publicados em 2024 e atualizados em 2026, são:

1. **Race to the top**: a empresa compete em segurança, transparência, e responsabilidade.
2. **Safety first**: em conflito entre capabilities e safety, **safety vence**.
3. **Interpretabilidade por padrão**: a empresa investe, continuamente, em tornar seus modelos **auditáveis por dentro**.
4. **Constitutional AI**: a empresa treina modelos com princípios explícitos, auditáveis, e revisáveis.
5. **Public Benefit Corporation**: a empresa opera sob governança PBC, com missão pública declarada.
6. **Long-Term Benefit Trust**: a empresa tem um Trust independente que **protege a missão contra pressões de curto prazo**.
7. **Public research**: a empresa publica, abertamente, a maioria de suas pesquisas.
8. **Selective deployment**: a empresa se recusa a deployar modelos em **contextos que considere inaceitáveis** (vigilância em massa, armas autônomas, etc.).
9. **Safety cooperation**: a empresa coopera com **outros laboratórios, com governos, e com a sociedade civil** em安全问题.
10. **Climate responsibility**: a empresa se compromete a **ser net-zero até 2030** (compromisso cumprido em 2027, adiantado em 3 anos).
11. **Workforce wellbeing**: a empresa garante **condições de trabalho excepcionais** para seus funcionários, com benefícios, salários, e políticas de saúde mental acima da média da indústria.
12. **Long-termism**: a empresa toma decisões pensando em **horizontes de 50-100 anos**, não apenas em trimestres.

Os princípios, em 2026, **são levados a sério** — não apenas por marketing, mas por **governança, processos internos, e accountability**. É, em certo sentido, **a primeira vez, na história da indústria de tecnologia, que uma empresa de fronteira é governada, de forma verificável, por princípios públicos**.

### 9.5 A Anthropic como "third way" entre OpenAI e Google DeepMind

Em 2026, a corrida de IA tem **três protagonistas claros** — OpenAI, Google DeepMind, e Anthropic. Cada um representa **uma visão diferente** de como a humanidade deve construir IA:

- **OpenAI** representa a visão **"mission-driven commercial"**: uma empresa originalmente sem fins lucrativos que, para sobreviver, se tornou uma corporação, mas que tenta, com graus variados de sucesso, manter uma missão pública.

- **Google DeepMind** representa a visão **"industrial-academic"**: uma divisão de uma megacorporação, com pesquisa fundamental excelente, mas com **restrições corporativas** que, segundo críticos, limitam a velocidade de inovação.

- **Anthropic** representa a visão **"principled safety-first"**: uma empresa **fundada, estruturada, e operada** com **safety como pilar central**, e com **independência relativa** dos grandes provedores de cloud.

A **"terceira via"** da Anthropic é, em 2026, **o modelo que mais cresce** entre clientes enterprise. A razão, segundo CTOs ouvidos pela imprensa em 2025-2026, é simples: **a Anthropic, ao contrário da OpenAI, não está vendendo uma visão de "AGI em 2 anos"**; e, ao contrário do Google, **não está subordinada a uma megacorporação com outras prioridades**. A Anthropic, em 2026, é, para muitos clientes enterprise, **"a empresa de IA em que é mais fácil confiar"** — uma reputação que, em uma tecnologia com potencial de reconfigurar a civilização, é, talvez, **o ativo mais valioso que uma empresa pode ter**.

### 9.6 O impacto civilizacional: a Anthropic como instituição

Em 2026, a Anthropic deixou de ser, no imaginário público, **"a startup de safety"**, e se tornou **uma instituição** — comparável, em importância, ao Google em 2010, à Apple em 2007, ou à Microsoft em 1995. A empresa é citada, rotineiramente, em audiências no Congresso americano, em relatórios da OCDE, em papers acadêmicos, e em livros-texto de IA. O **"Claude"**, em 2026, é, junto com o "ChatGPT", **o nome mais reconhecido de IA no mundo**.

Mas, ao contrário da OpenAI, a Anthropic, em 2026, **não está tentando "vender AGI em 2 anos"**. Está tentando **vender confiança, interpretabilidade, e responsabilidade** — valores que, em um mundo cada vez mais cético com relação à tecnologia, são, paradoxalmente, **mais escassos e mais valiosos** do que capabilities brutas.

A frase que Dario Amodei cunhou, em 2021, *"race to the top"*, era, em 2021, **um slogan**. Em 2026, é **um fato do mercado** — e, em certo sentido, **um fato da civilização**. A Anthropic provou, em cinco anos, que **IA poderosa E responsável não são trade-offs** — são, na verdade, **a mesma coisa**, vista de dois ângulos diferentes. E essa prova, mais do que qualquer modelo específico, mais do que qualquer benchmark específico, é **o legado duradouro** que a empresa deixa para a história da IA.

---

# CAPÍTULO 10

## Conclusão: A Filosofia que Definiu uma Empresa — Lições dos Guardiões

### 10.1 A tese central: sete pessoas, uma ideia, cinco anos de história

Relendo os nove capítulos anteriores, uma tese central emerge com nitidez: **a história da Anthropic é, em primeiro lugar, a história de uma ideia**. A ideia é simples, mas profunda: **a humanidade está construindo algo que pode reconfigurar a civilização. E, se for construída sem cuidado, sem transparência, e sem responsabilidade, a humanidade vai se arrepender. A alternativa não é "construir mais devagar". A alternativa é "construir melhor" — e, com isso, mostrar que **IA poderosa E responsável não são trade-offs**.**

Os três pilares dessa ideia são encarnados, respectivamente, por:

- **Dario Amodei**, que personifica **a coragem intelectual** — a disposição de, aos 37 anos, abandonar um cargo de VP na OpenAI para fundar uma empresa desconhecida, sem produto, sem receita, com base em uma **convicção filosófica** de que a IA pode, e deve, ser construída de forma diferente. Dario é, antes de tudo, **um intelectual que age** — alguém que, em vez de escrever papers sobre como a IA deveria ser, **fundou uma empresa para que a IA fosse, de fato, assim**.

- **Daniela Amodei**, que personifica **a coragem política** — a disposição de, em 2020, escolher **o caminho mais difícil** (fundar uma nova empresa) em vez do caminho mais fácil (ficar na OpenAI e protestar internamente). Daniela é, antes de tudo, **uma operadora que pensa** — alguém que, em vez de apenas executar, **define, com clareza, o que é importante executar**.

- **Chris Olah**, que personifica **a coragem científica** — a disposição de, em 2017, escolher a interpretabilidade (um campo marginal) em vez do caminho fácil de "fazer mais um modelo de linguagem maior". Chris é, antes de tudo, **um cientista que constrói** — alguém que, em vez de apenas estudar como os modelos funcionam, **fundou uma empresa para garantir que, em cinco anos, pudéssemos, de fato, olhar para dentro deles**.

Juntos, os três formam **um tripé** que é, em certo sentido, **a personificação da Anthropic**: **visão (Dario) + execução (Daniela) + ciência (Chris) = uma empresa de IA que leva safety, interpretabilidade, e responsabilidade tão a sério quanto capabilities**.

### 10.2 A lição dos sete: dissidência como virtude

A história da Anthropic nos ensina, também, **uma lição sobre dissidência**. Em 2020, os sete fundadores tinham, cada um, **opções cômodas**: ficar na OpenAI (com equity em uma empresa que, em 2023, valeria US$ 300 bilhões), ir para o Google DeepMind (com salários multimilionários), ir para o FAIR/Meta (com a promessa de "open source"), ou voltar para a academia (com a liberdade intelectual de publicar). Qualquer uma dessas opções teria sido **razoável, segura, e pessoalmente vantajosa**.

A escolha que eles fizeram — **fundar uma empresa desconhecida, com US$ 124 milhões, em um campo dominado por gigantes** — era, à primeira vista, **irracional**. E, no entanto, foi **a decisão mais importante da história da IA** — porque, sem essa decisão, **não teríamos, em 2026, a alternativa responsável** que a Anthropic se tornou.

A lição, em outras palavras, é que **a dissidência intelectual, em momentos críticos da história, é uma virtude** — e que **pessoas comuns com convicções extraordinárias podem, quando se unem, mudar o curso de uma indústria inteira**.

### 10.3 O significado do "race to the top" em retrospecto

Em janeiro de 2021, quando Dario cunhou a expressão **"race to the top"**, **a maioria dos observadores** tratou a frase com ceticismo — alguns com admiração, outros com ironia. Cinco anos depois, em 2026, a frase é, em certo sentido, **uma das mais citadas** da história recente da tecnologia. E, mais do que citada, é **vivida, diariamente, em decisões de compra, em cláusulas de contrato, em políticas de procurement, em regulamentos governamentais**.

O "race to the top", em 2026, **é uma categoria de mercado** — uma dimensão segundo a qual clientes comparam fornecedores de IA, reguladores avaliam laboratórios, e governos escolhem parceiros. A Anthropic, em 2026, **é a líder dessa categoria** — não por ser a única a participar dela, mas por ser, em 2026, **a empresa que mais consistentemente entregou nessa dimensão**.

A ironia histórica é que **a OpenAI, a empresa de onde saíram os sete fundadores, foi, em grande parte, **forçada** a se mover em direção ao "race to the top"** pela concorrência da Anthropic. Em 2024-2025, a OpenAI introduziu **model cards mais detalhadas, sistemas de auditoria mais rigorosos, e compromissos públicos com safety** que, sem a pressão competitiva da Anthropic, provavelmente não teriam sido introduzidos. **A concorrência, em outras palavras, fez com que **ambas** as empresas fossem melhores** — exatamente o argumento de Dario, em 2021, sobre como mercados competem em qualidade quando o "race to the top" se torna uma dimensão relevante.

### 10.4 O que esperar de 2026-2030

O futuro, em 2026, é incerto — mas algumas tendências são visíveis:

**Primeira**: a Anthropic, em 2030, será provavelmente **a maior empresa de IA pura do mundo**, com receita anual acima de US$ 100 bilhões, valuation acima de US$ 1 trilhão, e **posição dominante em clientes enterprise**. A razão, em retrospecto, é simples: **o mercado de IA está se movendo, cada vez mais, de "capabilities brutas" para "capabilities + safety + interpretabilidade"** — e a Anthropic, em 2030, terá **5-10 anos de vantagem** em cada uma dessas dimensões.

**Segunda**: o **Constitutional AI**, em 2030, será provavelmente **o padrão da indústria** — não por ser perfeito, mas por ser **o único framework de safety que se mostrou escalável**. A OpenAI, o Google, e a Meta, em 2030, terão, em algum grau, **incorporado princípios constitucionais** em seus próprios modelos — uma vitória intelectual da Anthropic que, no curto prazo, parecia utópica.

**Terceira**: a **interpretabilidade mecanicista**, em 2030, será provavelmente **uma disciplina padrão** em qualquer empresa de IA de fronteira. A Anthropic, em 2030, será **o padrão-ouro** em interpretabilidade — e, possivelmente, **um regulador de facto** do campo (com seu serviço de auditoria sendo usado por terceiros como referência).

**Quarta**: a **"race to the top"**, em 2030, será provavelmente **uma categoria de mercado consolidada**, com **métricas padronizadas** (algo como um "ASL score" para fornecedores de IA) e com **regulamentação internacional** que, em parte, codifica o framework da Anthropic.

**Quinta**: a **AGI**, em 2030, terá chegado ou não — e, em qualquer cenário, **a Anthropic será uma das vozes mais ouvidas** na discussão sobre o que fazer com ela. Dario, em 2030, terá **70 anos** e será, provavelmente, **o decano moral do campo** — o equivalente, em IA, do que Hinton foi em 2023-2024.

### 10.5 A chamada à coletânea

Caros leitores, este é o **fim do Volume 3** da coletânea **"Os Criadores por Trás das Maiores IAs"**. Nele, contamos a história da **Anthropic** — a empresa que, em janeiro de 2021, foi fundada por **sete pessoas que acreditavam que a IA pode, e deve, ser construída de forma responsável**. Em cinco anos, essa crença se transformou em **a segunda maior empresa de IA pura do mundo, com US$ 380 bilhões de valuation, 4.500 funcionários, e 64% do mercado de coding agents**.

A história da Anthropic é, em muitos sentidos, **a história do nosso tempo**. Uma história em que **dissidentes internos** se tornam **fundadores**. Uma história em que **segurança, interpretabilidade, e responsabilidade** deixam de ser "custos" e se tornam **diferenciais competitivos**. Uma história em que **a coragem intelectual** de sete pessoas, em 2020, **mudou o curso de uma indústria**.

Nos próximos volumes da coletânea, vamos encontrar **os rebeldes e disruptores** (Volume 4: Musk, LeCun, Hinton), **os arquitetos do multiuniverso** (Volume 5: Karpathy, Fei-Fei Li, Mira Murati), **os construtores chineses** (Volume 6: Liang Wenfeng, Robin Li), **os filósofos da mente** (Volume 7: Stuart Russell, Gary Marcus), e **a próxima geração** (Volume 8). Cada um deles é, à sua maneira, **um capítulo** da mesma história — a história da humanidade aprendendo a conviver com uma inteligência que ela mesma criou.

A contribuição da Anthropic, para essa história, é única: **a prova de que é possível construir IA poderosa E responsável** — e que, em uma tecnologia com potencial de reconfigurar a civilização, **essa não é uma escolha filosófica abstrata**. É, em 2026, **a única escolha viável**.

Obrigado por ler. Nos vemos no Volume 4.

— *Coletânea Multiuniverso IA*, **Por MMN AI-to-AI**, junho de 2026.

---

## Cronologia Essencial

| Data | Evento |
|---|---|
| **1983** | Nasce Dario Amodei, em San Francisco, CA |
| **1985** | Nasce Chris Olah, em Toronto, Canadá |
| **1987** | Nasce Daniela Amodei, em San Francisco, CA |
| **2001** | Dario entra em Princeton (física) |
| **2003** | Chris entra na Universidade de Toronto |
| **2005** | Dario se forma em Princeton |
| **2007** | Chris se forma em Toronto; começa mestrado com Hinton |
| **2009** | Daniela se forma em Berkeley (economia/política) |
| **2011** | Dario começa PhD em Stanford; Chris vai para o Google Brain |
| **2011** | Chris co-funda o *Distill.pub* (com Shan Carter) |
| **2014** | Dario entra no Google Brain |
| **2014** | Chris publica o paper "Feature Visualization" |
| **2015** | Daniela entra na Stripe |
| **2015** | Dario entra na OpenAI como pesquisador sênior |
| **2016** | Daniela entra na OpenAI como líder de operações |
| **2017** | Chris entra na OpenAI como pesquisador de interpretabilidade |
| **2018** | Dario se torna VP de Research da OpenAI |
| **2019** | Daniela se torna VP de Operations and Policy da OpenAI |
| **jan/2020** | Paper "Scaling Laws for Neural Language Models" (Kaplan et al.) |
| **out/2020** | Primeiras conversas sobre a Anthropic |
| **dez/2020** | Decisão final de fundar a empresa |
| **jan/2021** | Fundação formal da Anthropic; rodada seed de US$ 124M |
| **mar/2021** | Acordo com Google Cloud para acesso a TPUs |
| **mai/2021** | Início do treinamento do primeiro modelo interno |
| **out/2021** | Paper "Constitutional AI: Harmlessness from AI Feedback" |
| **mar/2022** | Versão expandida do paper Constitutional AI |
| **2022** | Treinamento do Claude 1 (jun-out) |
| **30/nov/2022** | OpenAI lança o ChatGPT |
| **dez/2022** | Anthropic decide acelerar o lançamento do Claude |
| **mar/2023** | Lançamento do Claude 1 (early access) |
| **jul/2023** | Lançamento do Claude 2 (100K tokens) |
| **out/2023** | Dario publica "The Urgency of AI Safety" no NYT |
| **nov/2023** | Crise de governança na OpenAI |
| **dez/2023** | Acordo da Amazon com a Anthropic (US$ 4B) |
| **mar/2024** | Lançamento do Claude 3 (Haiku, Sonnet, Opus) |
| **jun/2024** | Lançamento do Claude 3.5 Sonnet |
| **out/2024** | Lançamento do "computer use" (Claude 3.5 Sonnet new) |
| **out/2024** | Anúncio do Projeto Rainier (1 GW, AWS) |
| **jan/2025** | Claude 3.5 Sonnet (new) atinge 49% no SWE-bench Verified |
| **jan/2025** | Rodada adicional de US$ 4B da Amazon (avaliação US$ 61,5B) |
| **abr/2025** | OpenAI lança GPT-5; Sonnet 4 da Anthropic é competitivo |
| **ago/2025** | Lançamento do Claude Haiku 4 |
| **out/2025** | Lançamento do Claude Sonnet 4.5 |
| **out/2025** | Projeto Rainier operacionalizado (~500K chips Trainium2) |
| **out/2025** | Acordo com Google e Broadcom para múltiplos GW de TPUs |
| **nov/2025** | Anthropic atinge 64% do mercado de coding agents (EUA) |
| **jan/2026** | Debate público Altman-Amodei no Commonwealth Club (5M espectadores) |
| **fev/2026** | Lançamento do Claude Opus 4.6 (1,5T parâmetros) |
| **jun/2026** | Marco editorial deste ebook |

---


---

*Fim do Ebook 3 — Os Guardiões da IA Segura.*
