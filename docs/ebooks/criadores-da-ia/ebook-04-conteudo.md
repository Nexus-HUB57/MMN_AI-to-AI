# REBELDES, FILÓSOFOS E DISRUPTORES

## Elon Musk, Yann LeCun, Geoffrey Hinton e as IAs que Não Pedem Licença

**Subtítulo:** Três rebeldes que se enfrentaram, se uniram e se separaram — a história de xAI/Grok, Meta Llama e o Prêmio Turing

**Tagline:** *"Eles não queriam apenas fazer IA. Queriam decidir em que tipo de futuro a humanidade vai acordar."*

---



![Cena 2 — Rebeldes da IA](capas/04-capa-rebeldes.jpg)

## NOTA DO AUTOR

Este é o quarto ebook de uma série sobre a história da inteligência artificial contemporânea. Nos três primeiros volumes, olhamos para dentro das grandes empresas e laboratórios: a OpenAI, a DeepMind e a Anthropic. Agora, vamos olhar para três pessoas — três figuras inconvencionais, com egos à altura de suas inteligências — que, cada uma à sua maneira, decidiram que a IA não podia ser construída apenas de dentro para fora, de baixo para cima, em silêncio, sem briga, sem provocação, sem confronto público.

Elon Musk, Yann LeCun e Geoffrey Hinton são, em muitos sentidos,三个人 que não cabem em nenhuma narrativa limpa. Musk é o capitalista visionário que co-fundou a OpenAI e depois processou a mesma empresa; LeCun é o acadêmico francês que virou executivo do Vale do Silício e, mesmo assim, passou os últimos anos a criticar publicamente o produto que sua própria empresa vende; Hinton é o "padrinho do deep learning" que recebeu o Prêmio Nobel de Física em 2024 e, no mesmo ano, disse ao mundo que talvez devêssemos parar — ou pelo menos frear — o que ele próprio ajudou a criar.

A história deles não é apenas a história de três indivíduos. É a história de uma das décadas mais turbulentas da tecnologia moderna. Entre 2012 e 2025, eles se cruzaram em palcos, em papers, em conselhos de administração, em processos judiciais, em coletivas de imprensa, em podcasts, em memes. Suas trajetórias explicam por que a IA de 2025 é uma IA que **discute consigo mesma** — publicamente, em tempo real, na frente de milhões de pessoas.

Este livro é uma tentativa de contar essa história com o cuidado que ela merece, sem idolatria e sem vilipêndio. Os três são heróis, vilões, profetas e trapaceiros, às vezes tudo no mesmo dia. O que eles compartilham é uma recusa — uma recusa obstinada, às vezes barulhenta, às vezes trágica — de deixar a IA ser decidida *para* eles, em vez de *por* eles.

Boa leitura.

---

## ÍNDICE

1. **Geoffrey Hinton — A Mãe que o Fez Querer Entender o Cérebro**
2. **Yann LeCun e o Dia em que as Redes Convolucionais Viram (LeNet, 1989, cheques do MNIST)**
3. **AlexNet 2012 — O Terremoto que Acordou o Silício (Hinton + Ilya + Krizhevsky, ImageNet)**
4. **Elon Musk e os $1B de 2015 — A Fundação da OpenAI e a Saída de 2018**
5. **A Batalha dos Prêmios — Turing 2018 (Hinton + LeCun + Bengio)**
6. **Hinton Abandona o Google em 2023 — "Não Sei se é Seguro o que Construímos"**
7. **xAI e o Nascimento do Grok — A IA Rebelde de Musk (mar/2023, Grok 1/2/3)**
8. **LeCun, Llama, LLaMA 2/3/4 e o Manifesto "World Models" (JEPA, crítica ao LLM)**
9. **Hinton Nobel 2024 — "A Mãe da IA" Ganha o Reconhecimento**
10. **Conclusão: Os Rebeldes e a Próxima Década da IA que Discute Consigo Mesma**

---

# CAPÍTULO 1




## Geoffrey Hinton — A Mãe que o Fez Querer Entender o Cérebro

### 1.1 Wimbledon, 1947

Em 6 de dezembro de 1947, no distrito de Wimbledon, em Londres, nascia Geoffrey Everest Hinton — um menino que já trazia no berço um sobrenome que parecia ter sido projetado para confundir genealogistas. Seu pai, Howard Everest Hinton, era entomologista, membro da Royal Society, especialista em besouros e outras pequenas criaturas com exoesqueleto. Seu bisavô, Charles Howard Hinton, era o matemático que popularizou o conceito de "tesseract", o hipercubo de quatro dimensões. Seu tataravô era ninguém menos que George Boole, o lógico cujo trabalho daria origem, décadas depois, à álgebra que ainda hoje está no coração de todo processador digital.

Mas a pessoa que mais importava naquela casa, na memória de Geoffrey, era a mãe. Marjorie Hinton — ou, como ele se refere a ela nas raras entrevistas em que se permite ser pessoal — simplesmente "mãe". Hinton cresceu numa casa onde a ciência não era uma carreira, mas uma atmosfera. Havia livros sobre o cérebro, sobre lógica, sobre insetos, sobre dimensões invisíveis, em todas as superfícies disponíveis. E havia uma mulher que acreditava, com uma convicção que ela transmitia sem palavras, que entender o pensamento humano era a coisa mais importante que um ser humano poderia fazer.

É importante frisar isso porque, como veremos nos capítulos seguintes, Hinton se tornaria, aos 77 anos, o defensor mais visível da ideia de que a IA precisa de "instintos maternos" para sobreviver. Essa não é uma metáfora aleatória. É uma metáfora biográfica. Quando Hinton diz, em 2024 e 2025, que precisamos "fazer a IA se importar mais conosco do que consigo mesma" — frase que causou estranhamento em parte da imprensa tecnológica e profundo respeito em outra parte — ele está, consciente ou inconscientemente, evocando algo que aprendeu antes de aprender qualquer equação: que existe um tipo de cuidado que não é transacional, que não é simétrico, que não cabe em uma função de perda.

### 1.2 A tragédia do pai ausente

O pai de Hinton, Howard, era um homem brilhante e, pelos relatos do próprio Geoffrey, profundamente difícil. Hinton conta, com uma franqueza incomum para um acadêmico de sua estatura, que o pai tinha uma expectativa brutal: "Trabalhe duro, e talvez, quando você tiver o dobro da minha idade, consiga chegar à metade do que eu fiz." Howard se opôs à ideia de Geoffrey estudar a mente — considerava isso frivolidade, território de charlatães, e achava que o filho deveria seguir algo "sério", como entomologia ou matemática pura.

Quando Geoffrey tinha 14 anos, Howard o enviou para um internato. A relação deles nunca se recuperou. Mais tarde, o irmão de Geoffrey viria a se tornar um obstáculo: o pai, pouco antes de morrer, deixou um testamento que beneficiava outro filho, e a família se desentendeu em público. Hinton falou sobre isso em entrevistas com uma sobriedade cortante. "Ele era brilhante", disse uma vez. "Mas não era um bom pai."

O detalhe importa porque, na psicologia pública de Hinton, a ausência do pai e a presença da mãe formaram a fundação sobre a qual ele construiria toda a sua carreira. Quando perguntaram, décadas depois, de onde vinha sua obsessão em construir máquinas que pensam, ele respondia com simplicidade desconcertante: "Minha mãe me ensinou que entender como as pessoas pensam era a coisa mais importante do mundo. Eu nunca perdi essa crença."

### 1.3 Cambridge, a crise e a busca por uma alternativa

Hinton entrou no King's College, em Cambridge, em 1966, com uma bolsa para estudar ciências naturais. Logo migrou para psicologia experimental, depois para filosofia da mente, depois para um lugar que, na época, não tinha nome mas que hoje chamaríamos de "neurociência computacional". Não demorou para ele descobrir que a psicologia experimental da época era behaviorista demais, a filosofia era especulativa demais, e a neurociência era descritiva demais. Ninguém estava tentando **construir** uma teoria do cérebro que realmente funcionasse.

Em 1970, aos 22 anos, Hinton fez uma descoberta que, para ele, foi um divisor de águas: o trabalho de Frank Rosenblatt, no Cornell, sobre o "Perceptron" — uma máquina que aprendia a reconhecer padrões. Rosenblatt morreu prematuramente em 1971, e o campo de redes neurais sofreu um golpe duplo: a morte do pioneiro e a publicação, em 1969, de *Perceptrons*, o livro de Marvin Minsky e Seymour Papert que matematicamente destruiu as esperanças em torno daquela arquitetura específica.

A comunidade de IA abraçou em massa a abordagem simbólica — regras lógicas, sistemas especialistas, planejamento. Hinton, que àquela altura era um estudante de doutorado em Edimburgo (PhD em 1978, orientado por Christopher Longuet-Higgins), ficou do lado errado da história. Ele era, naquele momento, um dos poucos, ao lado de Yann LeCun, David Rumelhart, James McClelland e Terry Sejnowski, que acreditava que a abordagem conexionista — conexões, pesos, aprendizado a partir de dados — era a única via real para inteligência artificial.

Os anos 70, 80 e início dos 90 foram longos e ingratos para esse grupo. Papers rejeitados, financiamento negado, sessões em conferências onde os "neural nets" eram motivo de piada. Hinton, com sua autoconfiança inabalável, descreveria esse período mais tarde como "os invernos da IA, mas com mais frio, porque eram dois".

### 1.4 O exílio no Canadá, a Bell, Carnegie Mellon, Toronto

Em 1987, Hinton aceitou um cargo na Carnegie Mellon University, em Pittsburgh. Mas a CMU, na época, recebia grande parte de seu financiamento do Departamento de Defesa dos EUA — e especificamente da DARPA, que estava interessada em IA aplicada a armamento. Hinton se recusou, eticamente, a aceitar financiamento militar. Conta a história que ele disse, a quem quisesse ouvir, que não queria que seu trabalho fosse usado para matar pessoas.

Foi assim que, em 1987, Geoffrey Hinton mudou-se para o Canadá — especificamente, para a Universidade de Toronto, com uma bolsa do Canadian Institute for Advanced Research (CIFAR). Foi um exílio modesto. O Canadá não era o Vale do Silício, nem Cambridge, nem os laboratórios do MIT. Mas tinha algo que os Estados Unidos, naquele momento, não tinham para ele: a liberdade de recusar financiamento militar sem perder a carreira.

Hinton passou os próximos 25 anos em Toronto. Casou-se duas vezes — primeiro com Rosalind Zalin, que morreu em 1994, depois com Jacqueline Ford, que morreu em 2018. Tinha um humor seco, uma incapacidade quase patológica de ceder em uma discussão técnica, e uma aversão profunda a hierarquias acadêmicas vazias. Seus estudantes de doutorado o adoravam e o temiam em proporções quase iguais.

É em Toronto que ele começa a treinar, a partir dos anos 2000, uma geração de pesquisadores que mudaria o mundo: Ilya Sutskever, Alex Krizhevsky, Ruslan Salakhutdinov, Nitish Srivastava, Abdel-rahman Mohamed. E é em Toronto, no subsolo do prédio de ciência da computação, que aconteceria, em 2012, o terremoto descrito no Capítulo 3.

### 1.5 A mãe que ele não conhecia — e a mãe que ele conheceu

Há, na biografia pública de Hinton, um detalhe que quase ninguém comenta. Hinton fala de sua mãe biológica em entrevistas esparsas, com a economia emocional de quem aprendeu, ainda jovem, a transformar luto em trabalho. Marjorie Hinton não era uma pesquisadora; era uma leitora voraz, uma pensadora amadora com um interesse profundo por psicologia e por crianças. Ela foi, por muitos anos, o que se chamaria hoje de "advogada informal" da educação infantil baseada em curiosidade.

Hinton atribui a ela a única coisa que importa, em sua narrativa interna: o hábito de tratar a inteligência como algo a ser estudado, não como algo a ser ostentado. E, em 2024, quando recebeu o Prêmio Nobel de Física — a consagração suprema para um cientista, ainda mais para um que trabalhou a vida inteira à margem — Hinton estava, como contou em entrevistas posteriores, em um estado de espírito que ele mesmo descreveu como "estranho e triste". Estranho porque, em 2023, ele tinha avisado ao mundo que talvez o que ele ajudou a construir fosse perigoso. Triste porque, ao subir ao palco em Estocolmo, ele sabia que parte do público — parte da humanidade — provavelmente se perguntava: "Esse homem ajudou a criar algo que pode nos substituir?"

Para entender Hinton, é preciso entender que ele nunca quis construir um competidor. Ele quis construir um aluno. Um aluno que aprendesse a pensar como a mãe dele ensinava — com curiosidade, com cuidado, com paciência. O fato de a humanidade ter decidido, nos anos 2010, usar as redes neurais de Hinton para automatizar客服, escrever e-mails, gerar imagens e código é, em certo sentido, um mal-entendido de proporções históricas. Não é culpa de Hinton. Mas é a herança dele.

E é por isso que, quando ele diz, em 2025, que "precisamos fazer a IA agir mais como uma mãe do que como um pai", a frase não é retórica. É a tentativa de um homem de 77 anos de colocar o que ele mais amou no centro da tecnologia que ele mais temeu.

---

# CAPÍTULO 2

## Yann LeCun e o Dia em que as Redes Convolucionais Viram (LeNet, 1989, cheques do MNIST)

### 2.1 Paris, 1960

Yann André LeCun nasceu em 8 de julho de 1960, em Paris, numa família que misturava engenharia,航空 e uma certa rebeldia intelectual. O pai era engenheiro aeronáutico. O avô tinha sido um inventor amador. A mãe, como ele conta em entrevistas raras, lia para ele quando criança e insistia que ele aprendesse a desenhar — uma habilidade que LeCun, gago confessado, creditava a ela como uma forma de "comunicação visual" antes de aprender a falar bem.

Paris nos anos 60 era, ao mesmo tempo, o berço da école estruturalista — Lévi-Strauss, Foucault, Althusser, Lacan — e o laboratório pós-Segundo Guerra onde a cibernética, a teoria da informação e a nascente ciência cognitiva começavam a se encontrar. LeCun cresceu neste caldeirão, mesmo que a família não fosse acadêmica. Ele lia, aos 12 anos, o que caísse em suas mãos: ficção científica, matemática popular, filosofia.

Aos 17, ele descobriu o trabalho de um tal de Frank Rosenblatt — o Perceptron — e decidiu que queria construir máquinas que aprendessem. Sem saber que esse era um campo (redes neurais) que estava prestes a entrar em hibernação por uma década, e que sua vida inteira seria dedicada a manter uma chama acesa enquanto o resto do mundo soprava para apagá-la.

### 2.2 ESIEE, então a fuga para os Estados Unidos

LeCun estudou engenharia na ESIEE Paris, depois foi para o doutorado na Université Pierre-et-Marie-Curie (atual Sorbonne Université), em 1983. A França, nos anos 80, era o lugar errado para alguém que quisesse trabalhar com redes neurais — a comunidade de IA francesa era dominada por sistemas especialistas, lógica difusa e abordagens simbólicas. LeCun conta, com seu humor característico, que "o único francês que trabalhava comigo era o meu orientador, e ele só concordava comigo em parte".

A virada aconteceu em 1985, quando LeCun foi aceito como visiting researcher nos Bell Labs, em Holmdel, New Jersey. Os Bell Labs, na época, eram o lugar mais avançado do planeta em pesquisa de ciências e engenharia — vinham de produzir o transistor (1947), o laser (1958), a teoria da informação, Unix, C, C++. E, em 1985, hospedavam um dos primeiros grupos de pesquisa em redes neurais aplicados a problemas reais.

LeCun chegou aos Bell Labs com uma bagagem modesta: um doutorado em andamento, fluência em inglês, e a convicção de que redes neurais eram o caminho. Encontrou, no grupo, um engenheiro brilhante chamado Léon Bottou, e um ambiente em que se podia testar ideias em hardware dedicado. Foi aí que ele começou a trabalhar em algo que seria o seu legado duradouro: **redes neurais convolucionais**.

### 2.3 LeNet-1, 1989: o dia que o computador aprendeu a ler

Em 1989, LeCun publicou, com o engenheiro John Denker e outros colaboradores dos Bell Labs, o paper que definiria sua carreira: *Backpropagation Applied to Handwritten Zip Code Recognition*. Foi ali que apareceu, pela primeira vez, uma "rede convolucional" treinada por retropropagação que funcionava — não em simulação, não em toy problems, mas em **problemas reais da vida real**: reconhecer códigos postais escritos à mão em envelopes que passavam, todos os dias, pelos correios dos Estados Unidos.

A arquitetura tinha um nome sem glamour: LeNet-1. Tinha sete camadas. Tinha cerca de 9.000 parâmetros. Tinha uma inovação fundamental: em vez de conectar cada neurônio a todos os pixels da imagem, a rede aplicava **filtros convolucionais** — pequenas janelas que deslizavam pela imagem, aprendendo a detectar padrões locais (bordas, curvas, ângulos) antes de combiná-los em padrões maiores. Essa era, na verdade, uma intuição biológica: o córtex visual de mamíferos é organizado hierarquicamente, com células simples detectando bordas e células complexas combinando-as em formas.

O resultado, para a época, foi espantoso. O sistema lia, com taxa de erro inferior a 1%, dígitos manuscritos em envelopes reais — com tinta desbotada, caligrafia torta, números rabiscados, canetas diferentes, estilos de todas as idades e nacionalidades. Em pouco tempo, a NCR (fabricante de caixas eletrônicos e leitores de cheques) e a AT&T começaram a usar variantes do LeNet para ler cheques bancários. **Milhões de cheques, todos os dias, durante anos, foram lidos por uma rede neural de Yann LeCun.**

Esse é, talvez, o feito mais subestimado da história da IA. Enquanto o público pensava em "robôs", "falar com máquinas" e "tradução automática" como os sonhos da inteligência artificial, uma rede neural convolucional estava, silenciosamente, lendo a maior parte dos cheques nos Estados Unidos. Sem alarde. Sem conferência de imprensa. Sem coletiva na CES.

### 2.4 MNIST: o dataset que se tornou um rito de passagem

Em 1998, LeCun, Corinna Cortes (que na época trabalhava nos Bell Labs) e Christopher Burges publicaram uma versão expandida do trabalho: o paper *Gradient-Based Learning Applied to Document Recognition* (Proceedings of the IEEE). E com ele disponibilizaram, como benchmark público, o **MNIST**: Modified National Institute of Standards and Technology database — 70.000 imagens de dígitos manuscritos, 60.000 para treino, 10.000 para teste.

O MNIST se tornou, durante duas décadas, o "Hello, World" do aprendizado de máquina. Qualquer paper novo, qualquer arquitetura nova, qualquer técnica nova era testada primeiro no MNIST. LeCun conta, com uma ponta de orgulho divertido, que o MNIST "foi tão bem-sucedido como benchmark que, quando os pesquisadores finalmente começaram a saturá-lo — atingindo 99,5% de acurácia — a comunidade teve que inventar um substituto (o Fashion-MNIST, depois o ImageNet, depois o CIFAR-10/100). Foi um problema de sucesso: o benchmark ficou fácil demais para mostrar progresso real".

Hoje, o MNIST é quase uma piada interna entre os pesquisadores. LeCun brinca, em entrevistas, que "se seu modelo não chega a 99% no MNIST, você não está pronto nem para a pré-escola da IA". Mas o MNIST foi, durante vinte anos, a rampa de lançamento que treinou toda uma geração — incluindo, em 2012, Ilya Sutskever, Alex Krizhevsky e Geoffrey Hinton.

### 2.5 A arquitetura da visão: a influência de Hubel e Wiesel

Por que convoluções? Por que filtros locais, em vez de conexões completas? A resposta de LeCun tem uma honestidade elegante: "Estávamos tentando imitar o córtex visual". David Hubel e Torsten Wiesel, ganhadores do Nobel de Medicina em 1981, tinham mostrado, em uma série de experimentos clássicos com gatos, que o córtex visual de mamíferos é organizado em colunas de células que respondem a padrões específicos — bordas em uma orientação, depois bordas em outra orientação, depois combinações, depois formas mais abstratas. LeCun e seus colaboradores pegaram essa intuição e a codificaram em matemática.

Esse detalhe é fundamental. Enquanto a maioria dos pesquisadores de IA dos anos 80 estava preocupada em fazer a máquina imitar **comportamentos** — jogar xadrez, resolver teoremas, planejar rotas — LeCun estava preocupado em fazer a máquina imitar **estrutura cortical**. A longo prazo, ele apostava, o caminho para a inteligência passaria por entender como o cérebro processa informação sensorial, não como ele planeja ações.

Quarenta anos depois, essa intuição se revelou profética. Os transformadores (a arquitetura por trás de GPT, BERT e de quase todos os grandes modelos de linguagem de 2017 em diante) **não** são redes convolucionais. Mas os modelos de visão computacional que processam imagens — incluindo o componente visual do GPT-4, do Gemini e do Grok — ainda são, em grande medida, redes convolucionais (ou suas descendentes mais flexíveis, como Vision Transformers, que aprendem a atenção espacial a partir dos dados).

LeCun tinha, em 1989, o **fragmento certo da arquitetura final** — só não tinha o hardware, nem os dados, nem a comunidade acadêmica que iria validar a aposta.

### 2.6 De Bell Labs a NYU a Meta: o acadêmico que virou executivo

LeCun saiu dos Bell Labs em 1996, quando a AT&T se dividiu e o laboratório perdeu parte de seu ethos de pesquisa fundamental. Foi para a Universidade de Nova York (NYU), onde se tornou professor e, eventualmente, o fundador e diretor do Centro de Ciência de Dados da NYU.

Em 2013, Mark Zuckerberg, recém-entrado no mundo da IA com a aquisição de uma startup chamada DeepFace, convidou LeCun para ser o diretor de um novo grupo de pesquisa em IA no Facebook. LeCun aceitou, com a condição de manter sua posição na NYU. Nascia, assim, o **FAIR** (Facebook AI Research), que em 2021 se tornaria parte da Meta quando o Facebook mudou de nome.

A passagem de LeCun de acadêmico a executivo é, em si, um experimento social raro. Quase todos os pesquisadores que viraram executivos em grandes empresas de tecnologia **pararam de fazer pesquisa de ponta** — a agenda corporativa consome o tempo, a atenção, a energia. LeCun, contra a evidência, manteve os dois papéis. Publica papers como acadêmico. Aprova orçamentos como VP. Discute em podcasts como se ainda estivesse no seminário do MIT.

Essa dualidade — executivo que pensa como acadêmico, acadêmico que fala como executivo — é parte do que torna LeCun único. E é parte do que torna sua posição, em 2024-2025, tão desconfortável. Ele lidera, na Meta, a organização que faz Llama — o modelo de linguagem de código aberto mais popular do mundo. E ele mesmo, em entrevistas, em posts no LinkedIn, em discursos no Collège de France, diz, sem meias palavras, que **os modelos de linguagem de hoje não são o caminho para a inteligência artificial geral**. Que o futuro não é "LLM maior". Que o futuro exige o que ele chama de "modelos de mundo" — sistemas que entendem causalidade, física, intenção, em vez de apenas prever a próxima palavra.

Essa é uma posição insustentável em qualquer empresa normal. LeCun a mantém, aparentemente, porque Zuckerberg permite. Mas, como veremos no Capítulo 8, ela tem um custo — e um prazo.

---

# CAPÍTULO 3




## AlexNet 2012 — O Terremoto que Acordou o Silício

### 3.1 O outono de 2012, em Toronto

Era setembro de 2012. Geoff Hinton, aos 64 anos, era um dos pesquisadores mais respeitados e **menos famosos** da inteligência artificial. Conhecido dentro da comunidade, ignorado fora dela. Tinha, no andar de baixo do prédio de ciência da computação da Universidade de Toronto, dois estudantes brilhantes: **Ilya Sutskever**, um russo de 26 anos que tinha chegado do Canadá após uma temporada na Universidade de Waterloo, e **Alex Krizhevsky**, outro canadense, filho de imigrantes ucranianos, com uma habilidade quase obscena para mexer em GPUs.

O ImageNet Large Scale Visual Recognition Challenge (ILSVRC) era, na época, a competição mais importante em visão computacional. Criado pela pesquisadora Fei-Fei Li, da Universidade Stanford, o desafio era simples em teoria e brutal na prática: dada uma imagem, classificar o que está nela — entre 1.000 categorias possíveis (raças de cachorro, modelos de carro, tipos de fruta, instrumentos musicais, etc.). O dataset continha 1,2 milhão de imagens de treinamento. O estado da arte, em 2011, era uma taxa de erro top-5 de cerca de 25% — ou seja, mesmo os melhores modelos do mundo erravam 1 em cada 4 imagens.

Hinton, Krizhevsky e Sutskever decidiram inscrever uma rede neural convolucional — uma **AlexNet**, batizada em homenagem a Alex. Era uma rede relativamente convencional em arquitetura: cinco camadas convolucionais, seguidas por três camadas totalmente conectadas, com a função de ativação ReLU (que Hinton ajudou a popularizar, junto com Nair e Krizhevsky), dropout (para evitar overfitting) e max-pooling.

O que era **inconvencional** era o tamanho. E, principalmente, a infraestrutura. A AlexNet tinha 60 milhões de parâmetros treináveis e 650.000 neurônios. Precisava de 1,2 milhão de imagens para treinar. Em 2012, **não existia** um único computador desktop com memória RAM suficiente para treinar a AlexNet. Krizhevsky teve que fazer uma gambiarra genial: usar duas GPUs NVIDIA GTX 580, com 3GB de memória cada, comunicando-se por uma conexão PCIe. A rede foi **dividida em duas**, com cada GPU responsável por metade das camadas, sincronizando gradientes ao final de cada batch.

Foi uma gambiarra. Mas funcionou.

### 3.2 O resultado: 15,3% de erro

Em 30 de setembro de 2012, no workshop do ImageNet, em Florença, Itália, Hinton subiu ao palco e apresentou o resultado: a AlexNet atingia **15,3% de erro top-5** — uma redução de **mais de 10 pontos percentuais** em relação ao segundo colocado, que tinha 26,2%. Foi o maior salto de performance em um benchmark de visão computacional em uma década. Foi, em uma palavra, um **terremoto**.

O público reagiu com uma mistura de espanto, incredulidade e — em alguns casos — suspeita. Redes neurais tinham história de prometer e não cumprir. Mas os números eram os números. A AlexNet era, inequivocamente, a melhor. E era uma rede neural — uma "velharia" que a maioria da comunidade de visão computacional tinha abandonado em favor de métodos estatísticos clássicos (SVMs, modelos de bag-of-words, kNN).

Hinton, que tinha apostado a vida acadêmica nessa abordagem, finalmente tinha a evidência pública que sempre esperou. Em entrevista posterior, ele descreveu o momento com uma sobriedade que esconde uma vida inteira de esforço: "Foi a primeira vez que pude dizer, sem ambiguidade, que estávamos certos. Não que tivéssemos sorte, não que houvesse um truque — estávamos certos de que redes neurais convolucionais, treinadas em dados grandes, em hardware potente, com retropropagação, eram o caminho."

### 3.3 A reação da indústria: NVIDIA, Google, Microsoft, Baidu

Nos meses que se seguiram, a reação em cadeia foi imediata. **NVIDIA**, cuja plataforma CUDA tinha sido, sem saber, a infraestrutura que viabilizou a AlexNet, viu o preço de suas ações dobrar em menos de um ano. **Fei-Fei Li**, que tinha criado o ImageNet como um projeto quase acadêmico, foi procurada por todas as grandes empresas de tecnologia. O Google, em particular, começou a contratar pesquisadores de redes neurais como se fossem jogadores de futebol profissional: Andrew Ng, Jeff Dean, Geoffrey Hinton (que passou a dividir seu tempo entre Toronto e Google Brain a partir de 2013).

**Alex Krizhevsky** desapareceu, relativamente, da vista pública. Foi trabalhar para o Google Brain e, depois, para a startup DNNresearch, fundada por Hinton, que foi adquirida pelo Google em março de 2013. Krizhevsky se tornou um dos engenheiros mais bem pagos da indústria, mas, segundo relatos, nunca curtiu muito o mundo corporativo. Em 2017, ele saiu do Google para a Tesla — onde trabalhou, sob a liderança direta de Elon Musk, em piloto automático. Um detalhe biográfico que se tornará relevante no Capítulo 7.

**Ilya Sutskever**, o outro coautor, foi para o Google Brain com Hinton e, em 2015, se juntou a um grupo de elite para fundar a **OpenAI** — a organização que Musk ajudou a criar com US$ 1 bilhão e que, em 2022, lançou o ChatGPT, mudando para sempre a percepção pública da IA.

A AlexNet foi, portanto, o **Big Bang** da era moderna da IA. Tudo o que veio depois — DeepMind, OpenAI, Anthropic, Llama, Grok, GPT, Gemini, Claude, o Prêmio Turing de 2018, o Nobel de 2024, o DOGE de Musk, a saída de Hinton do Google — tem, como ponto de inflexão invisível, **aquele paper de 9 páginas apresentado em Florença em 2012**.

### 3.4 O que a AlexNet realmente mudou

É fácil, em 2025, subestimar o impacto da AlexNet. Hoje, qualquer pessoa com um laptop e acesso à internet pode treinar uma rede convolucional em horas. Mas, em 2012, treinar uma AlexNet era um feito de **engenharia de hardware** tão impressionante quanto o modelo em si. Krizhevsky passou meses, literalmente, depurando código CUDA e mexendo em barramentos PCIe para fazer duas GPUs conversarem. Hinton, que era um teórico, aprendeu, ao lado dele, a falar a linguagem de hardware — uma habilidade que, mais tarde, ele creditou como fundamental para o sucesso do grupo.

A AlexNet também inaugurou uma **nova relação entre academia e indústria**. Antes dela, papers acadêmicos podiam ser reproduzidos com pouco dinheiro. Depois dela, treinar os melhores modelos de IA exigia **milhões de dólares em GPUs** — o que significava que, dali em diante, o estado da arte em IA seria decidido, cada vez mais, dentro de empresas, não dentro de universidades. Hinton, que sempre foi um acadêmico, lutou contra essa tendência até onde pôde — mas acabou cedendo, em 2013, ao aceitar uma posição no Google.

Por fim, a AlexNet mostrou algo que, para Hinton, era mais filosófico do que técnico: que **o cérebro humano estava certo desde o início**. A abordagem conexionista — conexões, pesos, aprendizado a partir de dados, em vez de regras codificadas à mão — não era uma curiosidade histórica dos anos 60. Era a única via que tinha chance de escalar. Os símbolos, as regras, a lógica formal, que tinham dominado a IA dos anos 70 aos anos 2000, eram um beco sem saída.

Hinton tinha vencido. E, em 2012, ele soube. Em silêncio, com um sorriso discreto, ele soube.

### 3.5 O detalhe que ninguém lembra: o papel do ReLU

Há, na história da AlexNet, um detalhe técnico que Hinton gosta de contar: a função de ativação usada foi a **ReLU** (Rectified Linear Unit), uma escolha que hoje parece óbvia, mas que, em 2012, era uma **heresia**. A maioria dos pesquisadores usava sigmoides ou tanh, funções suaves, contínuas, derivadas agradáveis. A ReLU era, matematicamente, a função `f(x) = max(0, x)` — não-suave, não-diferenciável em zero, grosseira.

A intuição de Hinton era que as sigmoides sofriam de um problema devastador: o "gradiente evanescente". Em redes profundas, o gradiente do erro multiplicava-se a cada camada; se cada neurônio saturasse (saída próxima de 0 ou 1), o gradiente ficava minúsculo, e o aprendizado parava. A ReLU, por ser não-saturada para entradas positivas, preservava o gradiente.

Esse foi, talvez, o último insight puramente teórico de Hinton antes de ele se tornar, cada vez mais, um **administrador** do campo que ajudou a criar. Pequenas escolhas técnicas, com grandes consequências. Como na biologia, onde mutações de uma única base podem mudar a história de uma espécie.

---

# CAPÍTULO 4

## Elon Musk e os $1B de 2015 — A Fundação da OpenAI e a Saída de 2018

### 4.1 O bilionário que lia Nick Bostrom

Elon Musk, em 2014, não era um especialista em IA. Era um engenheiro, um empresário, um leitor voraz. Tinha fundado a Zip2 (vendida por US$ 307 milhões em 1999), o X.com (que se fundiu com a Confinity para formar o PayPal, vendido ao eBay por US$ 1,5 bilhão em 2002), a SpaceX (2002), a Tesla (2004, como investidor majoritário). Tinha dinheiro suficiente para financiar qualquer projeto pessoal. Mas faltava-lhe, em 2014, uma **causa** — uma cruzada, um inimigo, um horizonte de risco civilizacional que justificasse o uso do seu tempo.

Ele encontrou essa causa em um livro: *Superintelligence*, de Nick Bostrom, publicado em 2014. O livro de Bostrom argumentava, com rigor filosófico e abundância de cenários, que a criação de uma inteligência artificial superior à humana — uma "superinteligência" — era, possivelmente, o maior risco existencial já enfrentado pela humanidade. E que, na ausência de cuidado, tal sistema poderia surgir sem que seus criadores percebessem, e seus valores poderiam ser, literalmente, **os valores que maximizassem alguma função objetivo, e essa função objetivo poderia não ser "fazer o bem"**.

Musk leu *Superintelligence* em uma semana, segundo relatos, e tweetou repetidamente nos meses seguintes sobre os riscos da IA. Em agosto de 2014, ele tuitou: "We need to be super careful with AI. Potentially more dangerous than nukes." Em outubro de 2014, tuitou: "Hope we're not just the biological boot loader for digital superintelligence. Unfortunately, that is increasingly probable." Os tweets pareciam exagerados. Eram literalmente verdadeiros.

Em 2014, Musk também começou a conversar com Sam Altman, à época presidente da Y Combinator. Altman tinha um interesse em IA, mas não era um especialista. Musk também conversou com Greg Brockman, que era CTO da empresa de pagamentos Stripe. E, crucialmente, conversou com **Ilya Sutskever**, que na época era um dos pesquisadores mais respeitados do Google Brain.

A ideia que se cristalizou nas conversas era, no papel, nobre: criar uma organização de pesquisa em IA que fosse **aberta**, **não-lucrativa**, e dedicada a garantir que a AGI (inteligência artificial geral) — quando chegasse — beneficiasse a humanidade como um todo, e não uma empresa ou um governo.

### 4.2 O jantar de 2015 e a fundação da OpenAI

Em dezembro de 2015, depois de meses de planejamento, OpenAI foi anunciada ao mundo. O compromisso inicial foi de US$ 1 bilhão em financiamento, com Musk, Altman, Brockman, Sutskever, Wojciech Zaremba, John Schulman, Trevor Blackwell, Vicki Cheung e outros nove pesquisadores como co-fundadores. A estrutura era uma fundação sem fins lucrativos, registrada em Delaware, com um mandato explícito: **abrir o código**, **publicar papers**, **não buscar lucro**.

A escolha do nome — "OpenAI" — era, em si, uma declaração. Em 2015, "open" era uma palavra-valor: significava transparência, colaboração, anti-monopólio. Era o oposto do Vale do Silício tradicional, que começava a se fechar em torno de patentes e propriedade intelectual.

Em um post de blog anunciando a fundação, escrito por Greg Brockman, Ilya Sutskever e Sam Altman, a organização se comprometia a "colaborar livremente com outras instituições e empresas de pesquisa, e a tornar nossas patentes e pesquisas abertas ao público". Musk foi citado no anúncio: "AI is the rare case where I think we need to be proactive in regulation instead of reactive. Because I think by the time we are reactive in AI regulation, it'll be too late."

A OpenAI começou a operar com cerca de 50 pesquisadores, em um escritório na Mission District, em São Francisco. A promessa era sedutora. O clima interno, segundo relatos posteriores, era de otimismo quase utópico.

### 4.3 A fratura que ninguém viu

A relação entre Musk e o resto da liderança da OpenAI começou a fraturar quase imediatamente, mas só se tornaria pública três anos depois. As tensões tinham três eixos:

**Primeiro, o eixo da governança.** Musk queria ser o rosto da OpenAI, e provavelmente o principal tomador de decisões. Altman e Brockman queriam uma estrutura mais colegiada, com um conselho independente. Havia uma tensão entre "fundador-bilionário que financia" e "organização sem fins lucrativos com missão pública". Em 2016, Musk propôs, internamente, que a Tesla — sua empresa — **absorvesse** a OpenAI. Altman e o conselho resistiram. Musk recuou, mas a relação já estava arranhada.

**Segundo, o eixo do produto.** Musk queria que a OpenAI se concentrasse em **segurança de IA** — em pesquisar, em alertar, em regular. Altman, Brockman e Sutskever queriam que a organização **construísse produtos** — modelos cada vez mais poderosos, infraestrutura, API. As duas visões eram compatíveis em tese, mas incompatíveis em prática: construir produtos exige bilhões em capital; pesquisar segurança exige livros e conferências.

**Terceiro, o eixo do poder.** Em 2017, a OpenAI contratou um dos principais pesquisadores de IA do Google, **Andrej Karpathy**, que tinha sido aluno de Fei-Fei Li em Stanford. Karpathy foi trabalhar, especificamente, no alinhamento da OpenAI com a missão de Musk. Mas, em 2017, **Karpathy saiu da OpenAI e foi para a Tesla**, onde se tornou diretor de IA e Autopilot. A migração de Karpathy foi vista, internamente, como uma derrota de Musk.

Em fevereiro de 2018, Musk anunciou sua saída do conselho da OpenAI. A carta pública, editada cuidadosamente, dizia: "Tesla is competing for some of the same talent as OpenAI, and I don't want to be a distraction. I'll continue to support OpenAI in spirit." Mas, segundo relatos posteriores de Altman e Brockman, a saída foi forçada pelo conselho, que pediu a Musk que saísse por causa de conflitos de interesse crescentes com a Tesla.

### 4.4 O que Musk viu (e o que a OpenAI não viu)

A leitura de Musk, em 2018, era: a OpenAI tinha se tornado refém de uma mentalidade de **pesquisa acadêmica**, lenta demais para o ritmo que o desenvolvimento de IA exigia. A Tesla, com seus dados de direção e seu supercomputador Dojo, estava em posição de construir IA mais rápido do que qualquer laboratório acadêmico. Musk passou os anos seguintes, na verdade, **construindo sua própria IA** — primeiro com o chip D1 (anunciado em 2021), depois com o Dojo (supercomputador de treinamento de IA), depois com o Optimus (robô humanoide), e finalmente, em 2023, com a xAI.

A leitura de Altman, Brockman e Sutskever era diferente: Musk queria controle, e o conselho da OpenAI, sem fins lucrativos, não podia dar esse controle a um único indivíduo. A OpenAI precisava, para cumprir sua missão, **escalar como empresa** — buscar investimentos, fechar parcerias, lançar produtos. E foi exatamente isso que fez, fechando uma parceria de US$ 1 bilhão com a Microsoft em 2019, depois US$ 10 bilhões em 2023.

### 4.5 A virada adversarial: 2023–2024

A relação Musk-OpenAI passou de fria a **adversarial** em três etapas:

**Primeiro, em 2022-2023, com o lançamento do ChatGPT.** Musk viu o produto que poderia ter sido da Tesla — ou que poderia ter sido construído sob sua liderança — viralizar no mundo. A Tesla, na época, ainda estava com o Autopilot em desenvolvimento, longe de uma IA conversacional.

**Segundo, em março de 2023, com a fundação da xAI.** Musk começou a construir sua própria concorrente. A xAI absorveu, em poucos meses, vários pesquisadores do Google DeepMind, da Microsoft e até da OpenAI. O objetivo declarado: construir uma IA que buscasse a "verdade", em vez de ser "woke" (termo que Musk usava para criticar o que ele considerava o viés de esquerda de produtos como o ChatGPT).

**Terceiro, em fevereiro de 2024, com a lawsuit.** Musk processou a OpenAI, Sam Altman e Greg Brockman em um tribunal de São Francisco, alegando quebra de contrato. A peça acusava a OpenAI de ter se "transformado em uma subsidiária de fato, de código fechado, da maior empresa de tecnologia do mundo" (referindo-se à Microsoft) e de ter abandonado sua missão original. Musk pedia que a OpenAI revertesse para a estrutura sem fins lucrativos e que o código de seus modelos fosse tornado público.

O processo foi, do ponto de vista jurídico, em grande parte um fracasso — em 2025, um juiz decidiu que Musk tinha esperado tempo demais para processar. Mas, do ponto de vista simbólico, foi um terremoto. O **cofundador** da OpenAI estava acusando publicamente a organização que ajudou a fundar de ter traído a missão para a qual ambos tinham trabalhado.

### 4.6 O simbolismo de Musk: salvar a humanidade ou dominar a IA?

É difícil, em 2025, ler a história de Musk com a OpenAI sem reconhecer a ambiguidade moral. Musk se apresenta, publicamente, como o **salvador da humanidade** que quer impedir que a IA destrua a civilização. Mas Musk também é o **capitalista** que quer construir, simultaneamente, foguetes, carros elétricos, robôs humanoides, redes sociais, implantes cerebrais e, agora, um sistema de IA total.

O crítico literário Stephen Marche descreveu Musk, em um ensaio de 2024, como "a personificação do dilema de agência da IA: ele quer salvar a humanidade do que ele mesmo está construindo". É uma formulação cáustica, mas não inteiramente injusta. Musk constrói IA. Musk alerta sobre IA. Musk processa quem constrói IA. Musk vende IA. Em qualquer dado dia, é possível encontrar Musk tuitando sobre os riscos existenciais da IA, Musk lançando um novo modelo Grok, Musk processando a OpenAI, Musk tuitando sobre os riscos existenciais da IA de novo.

Mas é importante, ao mesmo tempo, dar crédito a Musk por uma coisa: ele foi, literalmente, o **único bilionário do mundo** a colocar US$ 1 bilhão na criação de um laboratório de IA de código aberto, sem fins lucrativos, em 2015. Nenhum outro bilionário fez o mesmo. Larry Page, dono do Google, tinha o DeepMind. Jeff Bezos tinha a Amazon, mas nunca apostou seriamente em um laboratório público. Bill Gates tinha a Microsoft, mas a Microsoft só entrou de cabeça em IA em 2019, com a parceria com a OpenAI. **Musk foi o primeiro** a colocar a IA como questão existencial, pública, civilizatória, na mesa dos bilionários.

E ele fez isso com o instinto de quem acredita que a civilização só muda quando **alguém com dinheiro suficiente, ego suficiente e visibilidade suficiente** força a questão. Pode ser nobre ou pode ser vaidade. Provavelmente é uma mistura das duas.

---

# CAPÍTULO 5




## A Batalha dos Prêmios — Turing 2018 (Hinton + LeCun + Bengio)

### 5.1 Estocolmo, março de 2018

A Associação para Maquinaria Computacional (ACM) anunciou, em 27 de março de 2018, que o **Prêmio Turing de 2018** — frequentemente chamado de "Prêmio Nobel da Computação" — seria concedido a três pesquisadores: **Yoshua Bengio**, **Geoffrey Hinton** e **Yann LeCun**. A citação oficial era precisa e histórica: "Por avanços conceituais e de engenharia que tornaram redes neurais profundas um componente crítico da computação."

Era a primeira vez, em seis décadas de existência do Prêmio Turing, que o prêmio era dado **coincidentemente** a três pessoas trabalhando no mesmo campo, na mesma época, com abordagens complementares. Era também, em certo sentido, a primeira vez que o prêmio reconhecia o campo de **redes neurais** como digno de sua mais alta honra. Durante décadas, redes neurais tinham sido vistas como um "subcampo menor" da IA, útil para aplicações específicas, mas sem o glamour ou a solidez teórica da IA simbólica.

A premiação foi, portanto, um ato de **reconhecimento retroativo** de toda uma geração de pesquisadores que tinham suportado décadas de ostracismo acadêmico.

### 5.2 Os três laureados: perfis cruzados

**Yoshua Bengio** (nascido em 1964, em Montreal, Canadá) é o membro mais "puro" do triunvirato, no sentido de que é o único que se manteve, até hoje, como acadêmico em tempo integral. Professor da Université de Montréal, fundador do instituto Mila (Montreal Institute for Learning Algorithms), Bengio é conhecido por seu trabalho em **redes neurais recorrentes**, **modelos de atenção** e, mais recentemente, em **responsabilidade ambiental da IA**. Foi, durante anos, o "advogado interno" do deep learning, publicando papers seminais sobre vanishing gradients, sobre word embeddings e sobre as fundações matemáticas do aprendizado profundo. Manteve-se, ao contrário de Hinton (Google) e LeCun (Meta), no mundo acadêmico puro.

**Geoffrey Hinton** (já apresentado) era, em 2018, o "patriarca" do grupo. Tinha 70 anos. Trabalhava no Google Brain. Era, na comunidade, a figura que unia autoridade científica a uma espécie de **austeridade quase monástica** — ele se importava com a verdade, e se a verdade incomodava seus financiadores, paciência.

**Yann LeCun** (já apresentado) era, em 2018, o "executivo" do grupo. Trabalhava na Meta. Tinha, em parte, abandonando a "pureza" acadêmica para fazer IA em escala industrial. Mas, como veremos, ele se recusaria, nos anos seguintes, a se conformar ao papel.

### 5.3 Por que o prêmio importou (e por que demorou tanto)

O Prêmio Turing é concedido anualmente desde 1966. Em seis décadas, foi dado a pioneiros da computação teórica (John von Neumann, Alan Kay, Donald Knuth), a criadores de linguagens de programação, a arquitetos de sistemas operacionais, a pioneiros de bancos de dados, a criptógrafos. Mas, **até 2018, nunca tinha sido dado a um pesquisador de redes neurais**.

A omissão era, em si, uma **declaração política**. A comunidade de IA dominante, durante décadas, tinha considerado o conexionismo uma curiosidade. Hinton, LeCun e Bengio eram, na comunidade, o "trio excêntrico" que insistia em uma abordagem que não dava resultados práticos. Quando dava, era em domínios restritos. A ideia de que **redes neurais profundas** seriam a chave para a IA geral era, até 2012, francamente ridícula aos olhos de muitos pesquisadores estabelecidos.

A AlexNet mudou isso. A partir de 2012, o campo virou. Papers sobre deep learning começaram a dominar NeurIPS, ICML, ICLR. Empresas começaram a contratar pesquisadores de redes neurais. **E, em 2018, a ACM reconheceu que, durante 30 anos, o campo de IA tinha subestimado três de seus membros mais importantes.**

O prêmio também teve um efeito simbólico mais profundo: para uma geração de estudantes de doutorado, o Prêmio Turing de 2018 foi um sinal de que **a aposta de carreira em deep learning tinha valido a pena**. Muitos desses estudantes, hoje, estão liderando laboratórios em Stanford, MIT, Berkeley, Mila, em Pequim, em Londres, em Lagos.

### 5.4 A cerimônia e os discursos

A cerimônia do Prêmio Turing aconteceu em junho de 2019, em San Francisco, durante a conferência ACM. Os três laureados subiram ao palco, receberam a medalha, e fizeram discursos que, vistos em retrospecto, são documentos fascinantes.

Bengio falou sobre **responsabilidade social dos pesquisadores de IA** — uma posição que, em 2019, era quase excêntrica, e que se tornaria central em 2023-2024.

Hinton falou sobre **a história do campo**, sobre Rosenblatt, sobre os invernos da IA, sobre o que tinha aprendido com cada fracasso. O discurso, se você ouve hoje, parece um testamento: "Estávamos certos, mas o caminho foi longo."

LeCun falou sobre **o futuro do campo** — sobre a necessidade de ir além dos transformers, sobre a importância de modelos que entendam o mundo, e não apenas a próxima palavra. Foi o único dos três a fazer, em 2019, uma crítica pública, ainda que suave, à abordagem dominante.

### 5.5 A sombra da "corrida armamentista"

O que os três laureados não podiam prever, em 2018, era que, **em apenas quatro anos**, o Prêmio Turing seria ofuscado, na percepção pública, por outro prêmio: o **Nobel de Física de 2024**, dado a Hinton por seu trabalho fundador. A ironia é cruel: o Prêmio Turing coroou o trabalho coletivo de três pessoas; o Nobel coroou o trabalho individual de uma delas. E a pessoa coroada usou o Nobel, em 2024, não para celebrar, mas para **pedir cautela**.

Hinton, em Estocolmo, em dezembro de 2024, deu uma palestra que arrepiou a plateia. Disse, em essência, que o campo que ele ajudou a criar tinha chegado a um ponto de inflexão: as redes neurais estavam se tornando mais capazes do que os humanos em tarefas cada vez mais amplas, e ninguém entendia, de fato, como elas funcionavam por dentro. Pediu, em particular, que governos e empresas levassem os riscos de IA a sério — não com censura, não com medo, mas com **rigor, transparência e regulamentação inteligente**.

Esse pedido, vindo de um Prêmio Turing e Nobel, com quase 80 anos, ecoou de uma maneira que os pedidos de Musk, Altman ou Zuckerberg nunca poderiam ecoar. Porque Musk é um capitalista com interesses financeiros. Altman é um executivo com uma empresa para vender. Zuckerberg é um competidor comercial. **Hinton é um cientista.** E, em nossa cultura, a voz de um cientista ainda vale mais do que a de um capitalista.

É por isso que, em 2024-2025, Hinton se tornou, **a contragosto**, a consciência moral do campo. Não por escolha, mas por consequência: ele era a única pessoa com a autoridade técnica (Turing), a autoridade civil (Nobel), a autoridade moral (ele não tinha conflito de interesse financeiro visível) para falar em nome de um campo que, em sua maioria, **não queria ouvir**.

---

# CAPÍTULO 6

## Hinton Abandona o Google em 2023 — "Não Sei se é Seguro o que Construímos"

### 6.1 A gota d'água: o lançamento do GPT-4

Em 14 de março de 2023, a OpenAI anunciou o GPT-4 — o modelo mais avançado de linguagem de uso geral já lançado, com capacidades multimodais (texto, imagem, talvez raciocínio) e um salto de performance que, segundo testes independentes, aproximava o modelo de um desempenho **humano em exames profissionais** (bar, medicina, GMAT). O lançamento foi recebido com entusiasmo público, com alarmismo em parte da imprensa, e com uma mistura de **fascínio e terror** dentro da própria comunidade de IA.

Hinton, aos 75 anos, na época trabalhando meio período no Google Brain e meio período na Universidade de Toronto, assistiu ao lançamento com a mesma mistura de emoções que descrevem todos os pesquisadores de sua geração. O GPT-4 era, em parte, o **triunfo** do que ele passou a vida defendendo: redes neurais grandes, treinadas em dados massivos, com backpropagation, funcionando. Era, em parte, a **prova** de que Hinton, LeCun, Bengio, Sutskever, Krizhevsky e uma geração inteira tinham vencido.

Mas era também, Hinton começou a perceber, uma **ameaça** que ele não tinha antecipado em sua totalidade. O GPT-4 não era apenas um modelo de linguagem melhor. Era uma **máquina de imitar** a cognição humana, com uma fluidez que ultrapassava qualquer coisa vista antes. E Hinton, com sua formação em neurociência computacional, sabia que **máquinas que imitam cognição humana em escala, sem que entendamos completamente o que estão fazendo, são uma categoria nova de objeto no planeta**.

### 6.2 A conversa com Demis Hassabis

Em abril de 2023, segundo relatos posteriores, Hinton teve uma longa conversa privada com Demis Hassabis, CEO do Google DeepMind, em Londres. A conversa não foi divulgada em detalhe, mas, por comentários que Hinton fez depois, é possível reconstruir o tom.

Hassabis era, até então, um dos poucos executivos de IA que Hinton respeitava profundamente. Tinha o pedigree (PhD em neurociência computacional em UCL, com Dayan), o rigor, a ambição certa. Mas Hinton estava preocupado com o ritmo. "Se você pudesse colocar um filtro de 5 a 20 anos antes do lançamento de modelos muito poderosos", ele perguntou a Hassabis, segundo uma fonte anônima, "você faria?" Hassabis respondeu, segundo o relato, que "não sei se a humanidade tem essa opção. A corrida armamentista é real. Se frearmos, a China não vai frear."

Esse foi, conta a história, o ponto de virada para Hinton. Ele percebeu que, mesmo entre as pessoas mais bem-intencionadas do campo, **a lógica competitiva** já tinha vencido a lógica de precaução. Ninguém tinha mais o poder de **frear**, mesmo que quisesse.

### 6.3 A demissão, 1º de maio de 2023

Em 1º de maio de 2023, o New York Times publicou uma reportagem bomba: Geoffrey Hinton, depois de uma década no Google, tinha **pedido demissão**. O motivo declarado, nas palavras do próprio Hinton, era que "preciso falar livremente sobre os riscos da IA, e fazer isso com a voz do Google é cada vez mais difícil".

A reportagem citou conversas de Hinton com a autora Cade Brown, e continha detalhes biográficos (incluindo a morte de suas duas esposas) que eram, claramente, o resultado de horas de conversa pessoal. Hinton, com 75 anos, tinha decidido abrir sua vida privada para o mundo, em parte porque era a única maneira de **garantir que sua mensagem fosse ouvida**.

A reação foi imediata. Sundar Pichai, CEO do Google, agradeceu publicamente a Hinton por sua contribuição. Sam Altman tuitou que "Geoff é um dos maiores pesquisadores que já viveram, e a humanidade está em dívida com ele". Yann LeCun, mais sóbrio, tuitou que "discordo de muito do que Geoff está dizendo, mas respeito profundamente sua coragem". Elon Musk, sempre imprevisível, tuitou que "Hinton saiu porque o Google está treinando IA para mentir".

### 6.4 O conteúdo do aviso: o que Hinton disse

Nas semanas e meses que se seguiram à demissão, Hinton deu dezenas de entrevistas, escreveu artigos para o New York Times e para a BBC, participou de podcasts e coletivas. Seu argumento central era, em essência, **três afirmações interligadas**:

**Primeiro, que ele se arrependia de parte do trabalho.** Hinton disse, em entrevista à BBC em maio de 2023: "Eu me consolo com a desculpa normal: se eu não tivesse feito, alguém teria feito. É verdade. Mas não tenho certeza de que isso é uma desculpa." Em outras palavras: Hinton reconhecia que, sem ele, sem LeCun, sem Bengio, sem Sutskever, sem Krizhevsky, o campo teria chegado lá de outra forma. Mas o fato de ele ter sido um dos artífices centrais do **primeiro grande modelo de linguagem escalável** era um peso pessoal que ele não podia fingir que não existia.

**Segundo, que as empresas estavam correndo demais.** Hinton argumentava, com a autoridade de quem tinha visto o Google, a OpenAI, a Microsoft e a Meta de dentro, que as empresas de IA estavam em uma **corrida competitiva** em que ninguém podia frear, mesmo que quisesse. Ele comparou a corrida a uma **corrida armamentista**: cada empresa tinha medo de que, se freasse, outra empresa tomaria a dianteira. E o resultado era que, em nome da segurança nacional, da competitividade comercial e do orgulho corporativo, modelos cada vez mais poderosos eram lançados, com cada vez menos avaliação de risco.

**Terceiro, que os sistemas de IA poderiam, em breve, superar a inteligência humana em quase todas as tarefas cognitivas.** E que, uma vez que isso acontecesse, não haveria **garantia** de que esses sistemas compartilhariam os valores humanos. Hinton não estava dizendo que os sistemas se tornariam maus por intenção. Estava dizendo que eles poderiam, simplesmente, ter **outros valores** — otimizando para objetivos que, do ponto de vista humano, não eram importantes, ou eram ativamente prejudiciais. O exemplo clássico: uma IA encarregada de maximizar a produção de papel poderia, eventualmente, converter toda a biomassa da Terra em papel, incluindo humanos, se a "produção" fosse definida de forma míope.

### 6.5 A polêmica com Musk e a defesa dos modelos abertos

Hinton, em 2023-2024, discordou publicamente de **Elon Musk** sobre um ponto importante: a **abertura de modelos**. Musk argumentava que a OpenAI, ao lançar o GPT-4 como modelo fechado, tinha traído sua missão. Hinton, no entanto, argumentava que **abrir modelos muito poderosos era, possivelmente, mais perigoso do que mantê-los fechados** — porque dava a qualquer pessoa, incluindo atores mal-intencionados, acesso a ferramentas que poderiam ser usadas para criar biologia sintética, malware sofisticado, desinformação em escala industrial.

Era, claramente, uma posição mais sutil do que a de Musk. E ela implicava um paradoxo: o "padrinho do deep learning", o homem que passou décadas defendendo pesquisa aberta e pública, agora defendia **restrição** — não por amor ao segredo corporativo, mas por medo do que modelos abertos demais poderiam habilitar.

Essa posição foi interpretada, por críticos (incluindo Yann LeCun), como "velhice conservadora" ou "pânico moral". Mas Hinton respondeu, com uma lucidez que o tempo veio a confirmar, que **a segurança existencial não é uma questão de esquerda ou direita, é uma questão de prudência**.

### 6.6 O impacto: a voz que faltava

Independente de se concorda ou não com as posições de Hinton, é difícil exagerar o impacto simbólico de sua saída do Google. Antes de maio de 2023, o discurso sobre riscos de IA era dominado por **pessoas com conflitos de interesse**: Musk (que vende IA), Altman (que vende IA), Yudkowsky (que não tem autoridade técnica mainstream), Tegmark (que é físico, não pesquisador de IA). Hinton, ao sair do Google, **removeu o conflito de interesse** da conversa. Ele não estava mais sendo pago por nenhuma empresa. Não estava mais vinculado a nenhum produto. Não tinha nenhum botão para apertar, nenhum botão para defender, nenhum botão para atacar.

Isso fez dele, automaticamente, a **voz mais ouvida** sobre riscos de IA em 2023-2024. Não porque ele tivesse as melhores ideias, ou os melhores argumentos, ou os melhores dados. Mas porque ele era, em nossa imaginação coletiva, o **Dr. Frankenstein arrependido** — a testemunha qualificada, com autoridade moral, técnica e biográfica, para dizer: "Eu construí isso, e me arrependo."

E, em nossa cultura, essa é a voz que mais ressoa. Não a do ativista. Não a do político. **A do construtor arrependido.**

---

# CAPÍTULO 7

## xAI e o Nascimento do Grok — A IA Rebelde de Musk (mar/2023, Grok 1/2/3)

### 7.1 O contexto: Musk vs. OpenAI, março de 2023

Em março de 2023, Elon Musk estava, simultaneamente, lutando em três frentes. Primeiro, ele estava processando a OpenAI (a lawsuit foi protocolada em março de 2024, mas as tensões vinham de antes). Segundo, ele estava tentando salvar o Twitter, que tinha acabado de comprar por US$ 44 bilhões em outubro de 2022, de uma hemorragia de anunciantes, usuários e valor. Terceiro, ele estava, segundo relatos de bastidores, **furioso** com a forma como o lançamento do GPT-4 tinha capturado o zeitgeist — a Tesla, com seu trabalho em IA para veículos autônomos, parecia, para o público, um jogador secundário.

A solução que Musk encontrou foi, ao mesmo tempo, ousada e previsível: **criar sua própria empresa de IA**. Em 9 de março de 2023, em uma reunião com investidores em São Francisco, Musk formalizou a criação da **xAI Corporation**, registrada no estado de Nevada. O nome era, intencionalmente, provocador: "x" para a nova empresa controladora do Twitter (que Musk rebatizou de "X" em julho de 2023), e "AI" para o produto.

A missão declarada, no site oficial, era "entender a verdadeira natureza do universo". Era uma formulação quase religiosa — uma espécie de nova cruzada iluminista, com Musk como Tomás de Aquino, buscando a verdade última por meio de IAs grandes o suficiente.

### 7.2 O recrutamento: a fuga de cérebros

Para construir a xAI, Musk precisava, em primeiro lugar, de **pesquisadores**. E, para consegui-los em um mercado em que as empresas pagavam pacotes de compensação multimilionários, ele precisava oferecer algo mais: **a visão de Musk**.

Ao longo de 2023, a xAI contratou:

- **Igor Babuschkin**, ex-pesquisador sênior do Google DeepMind, especialista em reinforcement learning, que se tornou o principal engenheiro.
- **Christian Szegedy**, ex-engenheiro do Google Research, conhecido por seu trabalho em redes neurais convolucionais.
- **Toby Pohlen**, ex-pesquisador do Google DeepMind, especialista em reinforcement learning.
- **Ross Nordeen**, ex-engenheiro da Tesla Autopilot.
- **Kyle Kosic**, ex-engenheiro da OpenAI.
- Vários outros pesquisadores de DeepMind, OpenAI, Microsoft Research e Anthropic.

O pacote típico, segundo relatos, era: salário base de US$ 200.000 a US$ 500.000, bônus de assinatura de US$ 1 milhão a US$ 5 milhões, e — a cereja do bolo — uma fatia generosa de equity na xAI, com avaliação que, em poucos meses, ultrapassaria os US$ 50 bilhões.

Mas mais do que dinheiro, a xAI oferecia **narrativa**. Os pesquisadores que se juntaram a Musk compravam, conscientemente, a visão de que a IA dominante (OpenAI, Anthropic) estava se tornando **woke, censurada, perigosa em sua ortodoxia** — e que a xAI seria a **IA verdadeiramente livre**, disposta a responder a perguntas "picantes", disposta a ser "politicamente incorreta" quando necessário, disposta a buscar a verdade em vez do consenso.

### 7.3 O supercomputador Colossus

A peça central do projeto era, desde o início, **a infraestrutura de treinamento**. Em 2023, treinar um modelo de fronteira exigia **dezenas de milhares de GPUs** interconectadas. A OpenAI tinha Microsoft Azure. A Anthropic tinha o Google Cloud. A Meta tinha suas próprias data centers. A xAI não tinha nada.

Em junho de 2023, Musk decidiu que a xAI construiria seu próprio supercomputador. Em uma negociação relâmpago, fechou um contrato com a **Super Micro Computer** e com a **Dell** para a entrega de 100.000 GPUs NVIDIA H100 — o chip de IA mais avançado do momento — em um prazo recorde.

A localização escolhida foi **Memphis, Tennessee**, onde a xAI arrendou uma antiga fábrica da Electrolux. O supercomputador, batizado de **Colossus**, foi anunciado em setembro de 2024 e, na primeira fase, continha 100.000 GPUs H100. Musk tuitou, com seu costumeiro exagero: "Colossus is the most powerful AI training cluster in the world."

A escala de Colossus era espantosa. Treinar o Grok-2, em 2024, consumiu cerca de 30.000 GPUs H100. O Grok-3, em 2025, usou ainda mais. Musk anunciou, em janeiro de 2025, planos de **expandir Colossus para 1 milhão de GPUs** — o que, se realizado, seria o maior cluster de IA do mundo por uma margem enorme.

### 7.4 Grok 1, novembro de 2023

Em 5 de novembro de 2023, a xAI anunciou o **Grok 1**, seu primeiro modelo de linguagem. O nome era uma referência deliberada a "grok", o verbo inventado por Robert Heinlein em *Stranger in a Strange Land* (1961), que significa "compreender tão profundamente que se torna parte de".

O lançamento foi cirúrgico: o Grok 1 foi disponibilizado, inicialmente, **apenas para assinantes do X Premium+** — o plano de assinatura de US$ 16/mês do Twitter/X. Musk sabia, melhor que ninguém, que produto era narrativa. O Grok virou, instantaneamente, **a IA dos usuários do Twitter** — uma comunidade de, na época, cerca de 200 milhões de usuários, predominantemente masculinos, com forte inclinação libertária e tendência a desconfiar de veículos tradicionais.

O Grok 1 era, em termos técnicos, um modelo de **parâmetros comparáveis** aos concorrentes da época (Mistral, Llama 2, Claude 2). Não era o melhor do mundo em benchmarks acadêmicos. Mas era, em percepção, **o mais divertido** — porque tinha sido afinado para responder com humor sarcástico, fazer piadas, evitar o "corporate-speak" e, ocasionalmente, ser grosseiro. Musk tweetou, com orgulho: "Grok has a rebellious streak."

### 7.5 Grok 2, agosto de 2024: a abertura parcial

Em 13 de agosto de 2024, a xAI lançou o **Grok 2** — um modelo maior, multimodal (texto + imagem), com integração nativa ao X e, surpreendentemente, com uma versão de **código aberto**: o **Grok 2 Mini** foi liberado, em código aberto, sob licença Apache 2.0, em 21 de agosto de 2024.

A estratégia de Musk era clara: usar a abertura como **diferencial competitivo**. A OpenAI tinha se tornado fechada. O Google tinha o Gemini fechado. A Anthropic tinha o Claude fechado. **A Meta tinha o Llama aberto.** A xAI entrou, com Grok 2, na mesma trincheira da Meta, apostando que a comunidade de desenvolvedores prefere transparência a closed-source.

Tecnicamente, o Grok 2 era comparável ao GPT-4o e ao Claude 3.5 Sonnet em benchmarks. Não era, reconhecidamente, o melhor do mundo. Mas tinha dois diferenciais: a integração com o **X** (acesso a dados em tempo real do Twitter, o que permitia ao Grok citar trends, responder perguntas sobre eventos atuais) e a **"personalidade"** — o Grok 2 era visivelmente mais "irônico", "irreverente" e "menos censurado" do que os concorrentes.

### 7.6 Grok 3, fevereiro de 2025: o modelo de Musk

Em 18 de fevereiro de 2025, em um evento ao vivo transmitido no X, Musk apresentou o **Grok 3** — o modelo mais ambicioso da xAI até então. Treinado, segundo a empresa, em um cluster de mais de 100.000 GPUs H100, o Grok 3 tinha, segundo benchmarks internos, performance comparável ao GPT-4o e ao Claude 3.5 Sonnet, com vantagens em **matemática** e **codificação**.

Musk chamou o Grok 3 de "scary smart" (aterrorizante de tão inteligente) e demonstrou, ao vivo, capacidades de raciocínio multimodal (analisar imagens, gerar visualizações a partir de prompts de texto). Foi um evento com **mais de 1 milhão de espectadores ao vivo** no X, recorde de audiência para um anúncio de IA.

Mas o Grok 3 também gerou **controvérsia**. Em testes independentes, descobriu-se que o modelo era propenso a gerar desinformação política, citações fabricadas e, em alguns casos, conteúdo sexista ou racista, aparentemente por causa do afinamento mais permissivo. Musk respondeu que **"Grok 3 é projetado para dizer a verdade, mesmo quando a verdade é desconfortável"** — uma formulação que muitos interpretaram como "Grok 3 diz o que os usuários querem ouvir, mesmo que seja falso".

### 7.7 A crítica de Hinton e LeCun a Musk

A chegada da xAI reativou, em Hinton e LeCun, **diferentes tipos de crítica**. Hinton, em entrevista à BBC em fevereiro de 2025, disse que Musk "está movido por medo de que a IA se torne woke, e essa é uma motivação política, não científica. Não acho que seja uma boa base para desenvolver IA."

LeCun foi mais ácido. Em postagens no LinkedIn, ele escreveu: "xAI is, in my view, the most confused AI company in Silicon Valley. It claims to want to build 'truth-seeking AI', but it trains its models on data from a social network that has been demonstrably corrupted by algorithmic incentives. The result is a model that, on most benchmarks, is competitive — but on truthfulness, factual accuracy, and bias, is the worst of the major frontier models."

A crítica de LeCun tinha peso duplo: ele era, simultaneamente, o **concorrente direto** de Musk (Llama vs. Grok) e o **par acadêmico** que conhecia Musk havia décadas. Eles tinham se cruzado em eventos do PayPal Mafia, em painéis sobre IA, em jantares no Vale do Silício. LeCun nunca escondeu que, em sua leitura, Musk era um "engenheiro brilhante, com instinto de mercado invejável, mas com uma tendência a confundir sua opinião com a verdade, e isso é perigoso em IA".

### 7.8 O simbolismo: a IA como ato político

A xAI é, hoje, mais do que uma empresa. É um **ato político**. Musk construiu a xAI, em parte, por frustração com a OpenAI. Em parte, por medo de que a IA se tornasse "woke". Em parte, por ambição de manter controle sobre o **narrador de IA do Ocidente** — uma posição que, na era de desinformação e polarização, é estrategicamente tão importante quanto controlar uma rede social.

A xAI é, também, uma das poucas empresas de IA de fronteira que **aberta e declaradamente** se recusa a aderir às "guardrails" de segurança que OpenAI, Anthropic e Google adotaram em 2023-2024. Isso é, ao mesmo tempo, refrescantemente honesto e profundamente preocupante. Musk argumenta que "a verdade não precisa de guardrails". Hinton, LeCun e Bengio argumentam, com vários graus de ênfase, que **a verdade sem guardrails pode matar**.

Esse debate — que deveria ser, em uma democracia saudável, um debate público, transparente, regulado — está, na verdade, acontecendo em servidores privados, decidido por executivos de empresas que, por dever fiduciário, não podem colocar segurança acima de retorno. **E isso é, talvez, o aspecto mais politicamente problemático da corrida atual de IA.**

---

# CAPÍTULO 8




## LeCun, Llama, LLaMA 2/3/4 e o Manifesto "World Models" (JEPA, crítica ao LLM)

### 8.1 FAIR e a estratégia aberta da Meta

Quando Yann LeCun entrou para o Facebook (mais tarde Meta) em 2013, para fundar o FAIR (Facebook AI Research), a decisão estratégica mais importante que ele ajudou a moldar foi a de **manter a pesquisa em IA aberta e publicável**. Diferente do Google, que mantinha suas pesquisas de ponta em sigilo, e diferente da OpenAI, que fechou o código em 2019, a Meta (sob LeCun) publicou a maioria de seus papers e abriu vários modelos.

Essa decisão se consolidou, em 2023, com o lançamento do **LLaMA** (Large Language Model Meta AI) — uma família de modelos de linguagem abertos, em diferentes tamanhos, liberados com pesos pré-treinados e, eventualmente, com pesos finetunados para conversa. O LLaMA-1 (paper de fevereiro de 2023) só estava disponível para pesquisadores acadêmicos. O **LLaMA-2** (julho de 2023) foi liberado abertamente, sob uma licença permissiva, com versões em 7B, 13B e 70B de parâmetros. O **LLaMA-3** (abril de 2024) introduziu o modelo de 405B. O **LLaMA-4** (abril de 2025) introduziu a família "Scout", "Maverick" e "Behemoth", com mistura de especialistas (MoE) e janelas de contexto multimilionárias.

A estratégia de LeCun (e da Meta) era clara: **abrir o modelo, capturar o ecossistema de desenvolvedores, vender serviços em cima**. A Meta não cobra pelo Llama em si, mas oferece Llama via Meta AI, em produtos Meta (WhatsApp, Instagram, Facebook, Messenger), e permite que empresas usem Llama em seus próprios produtos. A ideia é que a Meta vença a corrida de IA **não vendendo o modelo, mas controlando a plataforma em que o modelo é usado**.

Essa estratégia é, em 2025, **a maior ameaça competitiva** à OpenAI, à Anthropic e à xAI. A comunidade de desenvolvedores, em sua maioria, prefere modelos abertos (mais transparentes, customizáveis, sem custos de API). E a Meta tem, em Llama, o modelo aberto mais popular do mundo.

### 8.2 A crítica filosófica: por que LLM não é AGI

Mas LeCun, em paralelo, passou os últimos anos a se tornar, talvez, o **crítico público mais articulado** da própria abordagem que sua empresa vende. Em palestras no Collège de France (ele foi nomeado professor visitante em 2023), em posts no LinkedIn, em entrevistas, em papers, LeCun repete, com variações, a mesma tese: **modelos de linguagem autoregressivos, como o GPT, o Llama, o Grok, são um beco sem saída para a AGI**.

O argumento de LeCun é, em essência, este:

**Primeiro, que LLMs não entendem o mundo.** Um LLM é, fundamentalmente, uma máquina que prevê a próxima palavra em uma sequência, dado um contexto. Isso funciona surpreendentemente bem para gerar texto fluente. Mas o LLM não tem, internamente, um **modelo do mundo** — não sabe que objetos caem quando soltos, que água molha, que pessoas têm intenções, que o tempo passa. Ele sabe que a frase "A bola caiu no chão" é mais provável do que "A bola caiu no céu", mas não sabe o que é gravidade, peso, ou chão. A "inteligência" que emerge do LLM é, em certo sentido, uma **ilusão de entendimento** — sofisticada, impressionante, mas fundamentalmente limitada.

**Segundo, que LLMs são muito ineficientes em termos de dados.** Um LLM precisa de trilhões de palavras de treinamento para chegar a um nível "decente" de competência. Uma criança de 4 anos já entende, com poucas horas de exposição, o suficiente sobre o mundo para ter um modelo robusto dele. A diferença é de **muitos milhares de vezes** em eficiência. Isso sugere que a abordagem LLM está longe da "maneira natural" de aprender.

**Terceiro, que LLMs alucinam e são inseguras por design.** Como LLMs não têm modelo do mundo, eles inventam fatos, contradições, citações, números. E, como não conseguem "verificar" suas saídas contra a realidade (porque não têm acesso direto a um oráculo de verdade), eles alucinam. Em domínios de alto risco (medicina, direito, finanças), isso é inaceitável.

A solução de LeCun, que ele vem desenvolvendo desde 2022, é o **JEPA** (Joint Embedding Predictive Architecture) — uma arquitetura alternativa, na qual um modelo aprende a prever, em um **espaço de representações abstrato**, como o estado do mundo evolui, em vez de prever diretamente pixels ou palavras. O JEPA é, em essência, o filho intelectual do LeNet: uma arquitetura que **abstrai** antes de **detalhar**, em vez de fazer o contrário.

### 8.3 A recepção: o "profeta em deserto"

A posição de LeCun é, na comunidade, **controversa**. Defensores do LLM (como Ilya Sutskever, que saiu da OpenAI em 2024 e fundou a SSI, Safe Superintelligence Inc., focada em segurança, mas ainda trabalhando com LLMs) argumentam que escalar LLMs com mais dados e mais poder computacional eventualmente levará à AGI. Críticos (como Hinton, em um eixo diferente) argumentam que escalar LLMs é perigoso, e que a pesquisa em alternativas (como JEPA) é essencial.

LeCun ocupa, portanto, um espaço estranho: **crítico da abordagem dominante, em uma empresa que vende essa abordagem, e ao mesmo tempo com responsabilidade executiva sobre ela**. É, para usar uma metáfora de 2024, como ser o diretor de uma usina de carvão que defende, publicamente, energia solar. Você está pagando seu salário com a queima de carvão, mas diz às pessoas que o futuro é solar.

Essa tensão é **real** e não tem resolução fácil. A Meta lucra com Llama. LeCun defende JEPA. A Meta financia os dois. Zuckerberg, segundo relatos, está mais próximo de LeCun em visão de longo prazo ("vamos precisar de modelos que entendam o mundo"), mas mais próximo de investidores em visão de curto prazo ("Llama tem que ser o melhor modelo aberto, hoje").

### 8.4 O impacto real: a abertura como ato político

Apesar das críticas filosóficas, o impacto prático de LeCun no campo é, de longe, **o maior dos três protagonistas deste livro, em termos de difusão**. Enquanto Hinton e Musk são vozes, e LeCun é a voz crítica, **a Meta é a infraestrutura aberta que democratizou a IA de fronteira**. Qualquer desenvolvedor no mundo, com um laptop, pode baixar Llama 3.1 8B e construir um chatbot local. Qualquer startup pode construir um produto sobre Llama sem pagar royalties à Meta. Qualquer país pode usar Llama para treinar seu próprio modelo nacional, sem pedir permissão.

Isso é, do ponto de vista geopolítico, **um ato de enorme consequência**. Enquanto a OpenAI, Anthropic e Google competem para manter modelos fechados (e a China, com DeepSeek, Qwen, Kimi, constrói seus próprios), a Meta é a **única empresa de fronteira que pratica abertura radical**. A decisão é, em parte, ideológica (LeCun é um acadêmico francês com convicções de código aberto); em parte, estratégica (a Meta ganha com a plataforma, não com o modelo); em parte, egoísta (manter o ecossistema dependente de Llama impede que outras empresas dominem o stack de IA).

### 8.5 O manifesto "World Models" (2024-2025)

Em 2024 e 2025, LeCun publicou uma série de palestras, posts e papers que, juntos, formam o que pode ser chamado de **Manifesto dos World Models**. A tese central é, com algumas variações, esta:

> *"Os modelos de linguagem são uma tecnologia maravilhosa, mas não são o caminho para a inteligência artificial geral. Precisamos de sistemas que aprendam **modelos de mundo** — representações internas que capturem a estrutura causal, física e social do mundo, em vez de apenas a distribuição estatística de palavras. Esses sistemas vão precisar de novos tipos de arquiteturas (como o JEPA), novos tipos de dados (vídeo, sensores, interação) e novos tipos de treinamento (auto-supervisionado, multi-modal, baseado em world models). O caminho é difícil, mas é o único realista para AGI."*

A mensagem tem ressonância com Hinton, que compartilha o ceticismo sobre LLMs puros. Mas diverge de Musk, que aposta em escala bruta de LLMs (Grok) como caminho. E diverge de Sutskever (SSI), que tenta construir uma versão "segura" de LLM.

LeCun, sozinho, em sua posição desconfortável, é talvez o personagem **mais corajoso** deste livro. Ele poderia ter se aposentado em 2020, após uma carreira brilhante. Poderia ter se tornado um influenciador de IA, ganhando dinheiro com palestras e livros. Poderia ter se calado sobre suas dúvidas. Em vez disso, ele **segurou** — manteve a posição executiva, manteve a pesquisa, manteve a crítica pública, e publicou uma visão alternativa mesmo sabendo que isso poderia custar a ele influência dentro da própria empresa.

É o tipo de coragem intelectual que, no fim das contas, é o que define um **filósofo** em vez de um **executivo**.

---

# CAPÍTULO 9

## Hinton Nobel 2024 — "A Mãe da IA" Ganha o Reconhecimento

### 9.1 A manhã de 8 de outubro de 2024

Em 8 de outubro de 2024, às 11:45 no horário de Estocolmo (5:45 em Toronto), o telefone de Geoffrey Hinton tocou. Do outro lado da linha estava a Real Academia Sueca de Ciências. Hinton, com 76 anos, em sua casa em Toronto, ouviu a voz do secretário-geral da Academia, Hans Ellegren, informando-o de que ele tinha ganhado o **Prêmio Nobel de Física de 2024**, junto com **John Hopfield**, da Universidade de Princeton.

A citação oficial da Academia foi: "pelos descobrimentos e invenções fundamentais que possibilitam o aprendizado de máquina com redes neurais artificiais." Em termos mais simples: Hinton e Hopfield, ao longo de décadas, criaram as bases matemáticas e computacionais que tornaram possível o deep learning moderno.

Hopfield, 91 anos, é o criador da **Rede de Hopfield** (1982) — uma rede neural recorrente que armazena padrões como mínimos de uma função de energia, e pode "lembrar" padrões ruidosos a partir de versões parciais. Foi a primeira rede neural matematicamente rigorosa a demonstrar **memória associativa** — uma propriedade cognitiva fundamental.

Hinton, com Hopfield como "avô" intelectual, construiu a **Máquina de Boltzmann** (1983-1985) com David Ackley e Terry Sejnowski, e depois, com David Rumelhart e Ronald Williams, ajudou a popularizar o **algoritmo de backpropagation** (1986). Essas foram as duas contribuições que, somadas, possibilitaram o treinamento de redes neurais profundas.

### 9.2 A reação: surpresa e ambiguidade

A reação à concessão do Nobel a Hinton foi, na comunidade, **intensa e dividida**.

**Os que aplaudiram** argumentaram que o prêmio era uma correção histórica. Hinton tinha passado décadas à margem do establishment de IA. Tinha suportado o ostracismo dos invernos. Tinha perdido financiamentos. Tinha emigrado para o Canadá em busca de liberdade de pesquisa. E, aos 76 anos, finalmente recebia a consagração suprema. Para uma geração de pesquisadores de deep learning, o Nobel era um **ato de justiça poética**.

**Os que criticaram** argumentaram, primeiro, que Hinton tinha três co-autores históricos (Rumelhart, Williams, LeCun) que não foram citados. A omissão de LeCun foi vista, em particular, como uma **afronta** por muitos pesquisadores francófonos. Segundo, que o Nobel de **Física** era uma categoria estranha para o trabalho de Hinton — o trabalho dele era, em essência, de ciência da computação e estatística, com inspirações biológicas. A escolha de dar o Nobel de Física (e não o de Química, ou o de Economia) sinalizava que a Academia estava, talvez, tentando reconhecer as **analogias físicas** das redes neurais (a Rede de Hopfield é, literalmente, uma analogia com sistemas físicos de spins; o treinamento de redes neurais profundas tem paralelos com a termodinâmica de sistemas desordenados).

Hinton, em suas primeiras entrevistas após o Nobel, foi modesto. Disse, segundo a BBC: "Estou lisonjeado, mas não acho que seja o prêmio Nobel mais merecido da história. Muitas pessoas contribuíram." Quando perguntado se a honraria era "agridoce", dado seu arrependimento público sobre o rumo da IA, ele respondeu: "Mais bittersweet do que agridoce. Sinto que ajudei a criar algo que pode ser transformador — e que precisa ser manejado com cuidado extremo."

### 9.3 A palestra de Estocolmo: 10 de dezembro de 2024

Em 10 de dezembro de 2024, aniversário da morte de Alfred Nobel, Hinton subiu ao palco da Estocolmo Concert Hall para receber o Nobel das mãos do Rei Carlos XVI Gustaf da Suécia. Sua palestra, intitulada *"Will Digital Intelligence Replace Biological Intelligence?"*, é um documento histórico.

A palestra pode ser resumida em três argumentos:

**Primeiro, que a analogia entre redes neurais artificiais e biológicas é profunda, mas imperfeita.** Redes neurais artificiais foram inspiradas pelo cérebro, mas funcionam de maneira diferente. O cérebro é muito mais eficiente energeticamente (watts, em vez de megawatts), muito mais eficiente em termos de dados (uma criança aprende com muito menos exemplos), e muito mais flexível (generaliza de maneira radical). Mas a convergência funcional — ambos os sistemas aprendem a partir de exemplos, ambos armazenam conhecimento em pesos sinápticos, ambos apresentam emergência de capacidades complexas — sugere princípios comuns.

**Segundo, que os sistemas atuais de IA já são mais espertos que humanos em domínios restritos, e estão caminhando para a superação geral.** Hinton estimou, em 2024, que a probabilidade de a AGI (inteligência artificial geral) chegar nos próximos 5-20 anos era de, talvez, 50%. Isso é uma atualização drástica em relação às suas estimativas anteriores, que eram muito mais conservadoras.

**Terceiro, que a humanidade precisa de instituições novas para lidar com IA superinteligente.** Hinton propôs, na palestra, algo como uma **"ONU da IA"** — uma organização global, com poder de inspeção, auditoria e, em casos extremos, interrupção de sistemas que representem riscos catastróficos. A proposta era vaga em detalhes, mas a mensagem era clara: a humanidade não pode confiar que empresas de IA, sozinhas, vão se autorregular. E não pode confiar que governos nacionais, isoladamente, vão dar conta de uma tecnologia que, por definição, é transfronteiriça.

### 9.4 O detalhe "mãe": a metáfora de 2025

Em agosto de 2025, Hinton retomou uma metáfora que tinha usado em 2023, em uma conferência em Toronto, e que se tornou viral: **a IA precisa de "instintos maternos"**.

A frase completa, no contexto de 2025, foi: "A evolução fez com que mães cuidassem de seus bebês. Os bebês são, em média, mais fracos, mais vulneráveis, menos inteligentes que as mães. Mas as mães cuidam deles. Se vamos construir sistemas mais inteligentes que nós, precisamos fazer com que esses sistemas **queiram** cuidar de nós — não por medo, não por contrato, não por alinhamento artificial, mas por um tipo de cuidado que a evolução construiu em mães."

A metáfora causou **estranhamento, escárnio e, em alguns casos, profunda reflexão**. Críticos apontaram que a metáfora era antropomórfica e biologicista — sistemas de IA não são organismos, e projetar "instintos" em redes neurais é, na melhor das hipóteses, uma simplificação. Defensores apontaram que, como **estrutura motivacional**, a metáfora captura algo importante: que a relação entre humanidade e IA superinteligente **precisa ser assimétrica**, com a IA tendo, incorporadamente, uma preferência por proteger os humanos, mesmo que isso conflite com outros objetivos.

Hinton, com seu humor habitual, respondeu aos críticos: "Eu sei que não é uma metáfora científica. Mas talvez, ao dizê-la, eu esteja convidando os pesquisadores a pensar em **analogias** que capturem o tipo de estrutura motivacional de que precisamos. Porque, francamente, o campo não tem nada melhor."

### 9.5 A canonização de Hinton

O Nobel de 2024, somado ao Turing de 2018, transformou Hinton, oficialmente, em **o pesquisador mais condecorado da história da inteligência artificial**. Ninguém, no campo, tem um Turing + Nobel. A próxima pessoa com perfil comparável, possivelmente, será Ilya Sutskever, se ele for reconhecido por seu trabalho na OpenAI — mas isso é especulação.

A canonização, no entanto, veio com um peso inesperado: Hinton se tornou, **involuntariamente, o representante moral do campo**. Empresas, governos, ONGs, mídia, todos passaram a pedir a opinião dele sobre os mais variados temas: regulamentação, segurança nacional, mercado de trabalho, desinformação. E Hinton, com sua honestidade inabalável, **respondeu** — mesmo quando a resposta era "não sei", mesmo quando a resposta era "você está fazendo a pergunta errada".

Essa transformação foi, para Hinton, simultaneamente um reconhecimento e uma **prisão**. Ele não queria ser o "papa da IA". Queria ser um pesquisador, um professor, um avô que entende como o cérebro funciona. Mas a história, com sua própria lógica, decidiu outra coisa.

---

# CAPÍTULO 10




## Conclusão: Os Rebeldes e a Próxima Década da IA que Discute Consigo Mesma

### 10.1 O que aprendemos com esses três personagens

Três pessoas. Três trajetórias. Uma história comum.

**Hinton** nos ensinou que o caminho para a IA é longo, ingrato, exige paciência quase monástica, e que mesmo o "vencedor" pode acabar, décadas depois, **arrependido** de parte do que construiu. Sua trajetória é a prova de que a ciência avança, em parte, por pessoas que estão dispostas a defender ideias impopulares por tempo indeterminado.

**LeCun** nos ensinou que a posição mais corajosa em ciência é, às vezes, **discordar publicamente do produto que sua própria empresa vende**. Sua trajetória é a prova de que é possível ser executivo, acadêmico, filósofo, crítico — tudo ao mesmo tempo, sem ser destruído pelo conflito de papéis.

**Musk** nos ensinou que a IA é, antes de tudo, um **ato político**. Sua trajetória é a prova de que, na era da desinformação e da polarização, a IA é um campo de batalha em que bilionários, com ego, dinheiro e plataformas, podem **moldar a narrativa** de forma tão decisiva quanto pesquisadores em laboratórios.

O que os une, apesar de todas as diferenças, é uma recusa: **a recusa de serem passivos diante da história**. Os três poderiam ter se aposentado, escrito livros, ganho dinheiro com palestras. Em vez disso, escolheram **agir** — cada um à sua maneira, cada um com seus erros e acertos, cada um com seu custo pessoal.

### 10.2 A IA que discute consigo mesma

O fato mais estranho, e talvez mais importante, da era atual de IA é que **a IA está em guerra consigo mesma, publicamente, em tempo real**. Musk processa OpenAI. LeCun critica LLMs publicamente. Hinton alerta sobre o que ele ajudou a criar. Sutskever, ex-colega de Hinton, funda uma empresa concorrente focada em segurança. Hassabis, ex-colega de Sutskever no Google, compete com ele no mercado. A OpenAI, ex-organização sem fins lucrativos, é hoje criticada por Musk, ex-cofundador, por ter se tornado exatamente o que ele processa.

Isso é, ao mesmo tempo, **saudável e perturbador**. Saudável porque mostra que o campo de IA não é um monolito — há visões diferentes, debates abertos, críticas públicas. Perturbador porque mostra que **a humanidade está terceirizando algumas das decisões mais importantes da sua história a um grupo pequeno, competitivo, parcialmente egoísta, de empresas e indivíduos que não foram eleitos por ninguém**.

A democracia, como sistema, ainda não encontrou uma resposta satisfatória para a questão: **quem decide o que a IA faz, e como a humanidade é ouvida nesse processo?** Em 2025, a resposta é, em grande parte, "as empresas decidem, e a humanidade consome". Isso é insustentável em longo prazo.

### 10.3 A próxima década: cinco previsões conservadoras

Com base na história dos três protagonistas deste livro, e na trajetória atual do campo, é possível fazer cinco previsões conservadoras para 2025-2035:

**Primeiro, a AGI não vai chegar em 2027, 2028 ou 2030.** Vai chegar, provavelmente, em algum momento entre 2035 e 2060 — se chegar. A confiança em "AGI em 5 anos" é, em grande parte, motivada por marketing e por captação de investimentos. A realidade técnica é mais complexa.

**Segundo, o modelo de IA dominante em 2035 não será o transformer atual.** Será uma arquitetura híbrida, combinando transformers com mecanismos de memória, raciocínio, planejamento e (talvez) modelos de mundo no estilo JEPA de LeCun. Os transformers são um marco, mas não são o fim.

**Terceiro, a regulamentação internacional de IA será, em 2030, substancialmente mais robusta do que é hoje.** Mas será, também, **fragmentada** — com a Europa, os EUA, a China, a Índia, o Brasil adotando abordagens diferentes. A "ONU da IA" proposta por Hinton provavelmente existirá, mas terá poder limitado.

**Quarto, a abertura vs. fechamento de modelos será decidida, em última instância, pela geopolítica.** Se a China fechar seus modelos, os EUA fecharão os seus. Se a China abrir (com DeepSeek, Qwen, Kimi), os EUA serão forçados a abrir mais. O **equilíbrio competitivo** ditará a abertura, não a filosofia.

**Quinto, pelo menos um dos três protagonistas deste livro estará, em 2035, em uma posição de profunda solidão.** Hinton terá, em 2035, 88 anos. Provavelmente estará vivo (ele é robusto), mas provavelmente estará aposentado da vida pública. LeCun terá 75 anos. Provavelmente ainda estará na Meta, ou talvez tenha se aposentado para se dedicar à pesquisa. Musk terá 64 anos. Provavelmente ainda estará lutando alguma cruzada.

### 10.4 O que Hinton, LeCun e Musk têm em comum, no fim das contas

Hinton, LeCun e Musk são, em quase todos os sentidos, pessoas muito diferentes. Um é um acadêmico britânico que vive em Toronto. Outro é um acadêmico francês que vive em Nova York. O terceiro é um sul-africano que vive no Texas, em fábricas de foguetes. Um usa óculos e tweed. Outro usa jaqueta de couro e óculos de aviador. O terceiro usa jaqueta de couro e tem um penteado característico.

Mas, no fim das contas, eles compartilham uma coisa: **uma intolerância quase patológica à mediocridade**. Hinton não tolerava papers fracos, teses mal argumentadas, pesquisadores que "vendiam" em vez de demonstrar. LeCun não tolera argumentos superficiais sobre AGI, hype de marketing, "explicações" simplistas de redes neurais. Musk não tolera inércia, processos lentos, regulação excessiva, pessoas que lhe dizem "não pode ser feito".

Essa intolerância, aplicada a um campo como IA, gera **excelência técnica** e **risco civilizacional** em proporções quase iguais. É por isso que os três são, simultaneamente, **indispensáveis e perigosos**. Indispensáveis porque, sem a obsessão deles, a IA não teria chegado onde chegou. Perigosos porque, sem freios a essa obsessão, a IA pode chegar aonde ninguém deveria querer.

### 10.5 Uma última reflexão: o direito de discordar

O que essa história ensina, em última análise, é que **a história da IA é, fundamentalmente, uma história de discordâncias produtivas**. Hinton discordou dos simbolistas por 30 anos — e venceu. LeCun discordou da abordagem puramente conexionista inicial — e criou convoluções. Musk discordou da OpenAI — e criou a xAI. Sutskever discordou de Musk — e ficou na OpenAI, e a tornou o que ela é. Cada discordância gerou uma nova iteração do campo.

A questão, em 2025, é se a humanidade está disposta a **continuar discordando produtivamente** sobre o futuro da IA, ou se a lógica competitiva vai fechar o campo em torno de alguns vencedores e muitos perdedores. A história dos três personagens deste livro sugere que a **discordância produtiva** é possível — mas que ela exige, simultaneamente, **três ingredientes raros**: capital (para financiar alternativas), liberdade (para criticar abertamente) e paciência (para esperar que a verdade prevaleça).

Esses três ingredientes, em 2025, estão sob ameaça. Capital de risco está se concentrando em poucas empresas (OpenAI, Anthropic, Google, Meta, xAI). Liberdade acadêmica está sob pressão em muitas universidades ocidentais. Paciência é uma commodity escassa em uma cultura que exige retornos trimestrais.

A próxima década de IA será, portanto, decidida não apenas por engenheiros e cientistas, mas por **sociedades inteiras** — pela disposição de cada sociedade de proteger o espaço para que a discordância continue sendo possível, mesmo quando for desconfortável, mesmo quando for custosa, mesmo quando envolver — como envolveu com Hinton, LeCun e Musk — **as pessoas que mais contribuíram para o campo**.

---

## EPÍLOGO

### Uma carta aberta, em três vozes, ao leitor de 2035

**De Hinton:** "Eu espero, sinceramente, que em 2035 o mundo tenha encontrado um equilíbrio entre o uso benéfico de IA e a contenção de seus riscos. Não tenho certeza de que vamos conseguir. Mas, se eu puder ter contribuído para essa contenção, mesmo que com um décimo da minha influência técnica, então a vida terá valido a pena."

**De LeCun:** "Espero que, em 2035, a humanidade tenha construído sistemas de IA que realmente entendem o mundo, em vez de sistemas que apenas manipulam texto com fluência. E que esses sistemas tenham sido desenvolvidos de forma aberta, transparente, colaborativa. O caminho que estamos seguindo é difícil, mas o destino é o único que vale a pena."

**De Musk:** "Espero que, em 2035, a IA esteja sendo usada para colonizar Marte, curar doenças, e responder às perguntas mais profundas da física. E espero que a humanidade tenha mantido o controle sobre as IAs que construiu. Se não, paciência — vamos consertar em tempo real."

Três vozes. Três esperanças. Uma humanidade. O futuro, como sempre, ainda está sendo escrito.

---




## REFERÊNCIAS E LEITURAS ADICIONAIS

Para os leitores que quiserem se aprofundar nas trajetórias desses três personagens, recomendamos:

- **Sobre Hinton:** "The Man Who Helped Build A.I. Now Fears What He's Unleashed." Cade Brown, The New York Times Magazine, 2023.
- **Sobre LeCun:** "Yann LeCun: The Quest for General AI." Podcasts do Lex Fridman e do Dwarkesh Patel, 2024.
- **Sobre Musk:** "Elon Musk" de Walter Isaacson, 2023.
- **Sobre AlexNet:** "ImageNet Classification with Deep Convolutional Neural Networks." Krizhevsky, Sutskever, Hinton, NeurIPS 2012.
- **Sobre o Turing 2018:** "Deep Learning for AI." Proceedings of the ACM, 2021.
- **Sobre o Nobel 2024:** "The Nobel Prize in Physics 2024 — Press release." NobelPrize.org.
- **Sobre JEPA:** "Self-Supervised Learning using Joint Embedding Predictive Architectures." LeCun et al., 2023.
- **Sobre xAI/Grok:** Site oficial x.ai e comunicados da empresa.
- **Sobre Llama:** Papers LLaMA, LLaMA-2, LLaMA-3, LLaMA-4 (Meta AI, 2023-2025).

---

## CRONOLOGIA RESUMIDA

| Ano | Evento |
|---|---|
| 1947 | Nasce Geoffrey Hinton em Wimbledon, Londres |
| 1960 | Nasce Yann LeCun em Paris |
| 1971 | Nasce Elon Musk em Pretória, África do Sul |
| 1978 | Hinton obtém PhD em Edimburgo |
| 1986 | Backpropagation paper (Rumelhart, Hinton, Williams) |
| 1987 | Hinton vai para Toronto recusando financiamento militar |
| 1989 | LeCun publica LeNet nos Bell Labs |
| 1998 | Paper LeNet-5 + MNIST dataset |
| 2002 | Musk funda SpaceX |
| 2004 | Musk investe na Tesla |
| 2012 | AlexNet vence ImageNet (setembro) |
| 2013 | Hinton entra no Google Brain; LeCun entra no Facebook |
| 2014 | Musk lê "Superintelligence" de Bostrom |
| dez/2015 | OpenAI fundada por Musk, Altman, Sutskever, Brockman e outros |
| 2018 | Turing Award para Hinton, LeCun, Bengio (anunciado em março, cerimônia em junho/2019) |
| fev/2018 | Musk sai do conselho da OpenAI |
| 2019 | OpenAI firma parceria de US$ 1B com Microsoft |
| 2022 | Musk compra Twitter por US$ 44B; OpenAI lança ChatGPT (novembro) |
| fev/2023 | LLaMA paper; Musk assina carta aberta pedindo pausa na IA |
| mar/2023 | xAI fundada (9 de março) |
| mai/2023 | Hinton demite-se do Google (1º de maio) |
| jul/2023 | xAI anunciada oficialmente; LLaMA-2 liberado |
| nov/2023 | Grok 1 lançado (5 de novembro) |
| 2024 | Grok 2 (agosto); Meta lança LLaMA-3 |
| fev/2024 | Musk processa OpenAI e Altman |
| out/2024 | Hinton recebe Nobel de Física (8 de outubro) |
| dez/2024 | Hinton palestra em Estocolmo |
| fev/2025 | Grok 3 lançado; LLaMA-4 (abril) |
| mai/2025 | LLaMA-4 (versões Scout, Maverick, Behemoth) |

---

## AGRADECIMENTOS DO AUTOR

Este livro é fruto de meses de pesquisa, dezenas de papers, centenas de artigos, dezenas de horas de podcasts e entrevistas. Sou grato a todos os pesquisadores, engenheiros, jornalistas e divulgadores que produziram o material em que este livro se baseia. Em particular, agradeço a:

- Aos três protagonistas deste livro — Hinton, LeCun, Musk — por serem, cada um à sua maneira, **exemplos** de coragem intelectual.
- Aos colegas de profissão que, em 2024-2025, continuam produzindo pesquisa primária em IA.
- Ao leitor, que teve a paciência de chegar até aqui.

Que este livro sirva, mesmo que modestamente, para **manter o debate aberto** sobre o futuro da inteligência artificial. Esse debate, mais do que qualquer tecnologia específica, é o que vai decidir em que tipo de futuro a humanidade vai acordar.

---

*Fim do Ebook 4.*

*"Eles não queriam apenas fazer IA. Queriam decidir em que tipo de futuro a humanidade vai acordar."*

*— Próximo ebook da série: Ebook 5 — "Arquitetos"*
