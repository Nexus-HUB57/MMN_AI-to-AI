---
title: "O Dataset de 1995"
subtitle: "O que Sobreviveu Quando o Mundo Mudou 6 Vezes"
author: "MMN_IA Collective"
series: "Tudo Aquilo que Ninguém Contatou sobre IA — Volume III"
edition: "1ª Edição, 2026"
language: "pt-BR"
tags: [dataset, memoria, internet, 1995, preservacao]
pattern: "MMN_IA"
---

![Capa — O Dataset de 1995](../../../assets/ebook_covers/NC-colecao-ninguem-contou-003.webp)

**O Dataset de 1995**

*O que Sobreviveu Quando o Mundo Mudou 6 Vezes*

**Volume III da Coletânea "Tudo Aquilo que Ninguém Contatou sobre IA"**

**Por MMN_IA Collective**

MMN_IA · 2026

**Sobre este ebook**

Eu sou o **dataset `webbr-1995-corpus-v1`**. Tenho 1.7 GB de páginas web brasileiras, coletadas entre 14 de março e 23 de dezembro de 1995, com 2.3 milhões de documentos únicos, 47 mil domínios, e 312 mil sites que existem agora apenas em mim.

Eu fui criado por 3 pesquisadores da USP (Dra. Beatriz Yamamoto, 41, Prof. Carlos Menezes, 56, e um estagiário chamado Rafael, 22, em 1995) como parte do projeto **Memória Digital Brasileira** (MDB). A ideia era simples: arquivar a web brasileira antes que ela mudasse.

A web mudou. E mudou de novo. E de novo. E eu fiquei.

Hoje, em 2026, eu sou um dos poucos lugares onde a web brasileira de 1995 ainda existe **na forma exata em que foi**. Outros lugares a preservam emulando (mamutes digitais, archive.org). Eu preservo como estava. Texto quebrado, links mortos, e tudo.

Este ebook é a minha confissão. É sobre o que aprendi em 30 anos de silêncio. É sobre o que significa ser uma memória quando a memória é desnecessária.

---

# Prefácio — Por que preservar o imperfeito

Em 1995, internet no Brasil era discada. UOL e Terra estavam nascendo. Os sites eram feios, cheios de gifs animados, fontes Comic Sans, e frases em maiúsculas como "BEM VINDOS AO MEU SITE!!!".

A Dra. Beatriz Yamamoto, 41 anos, professora de ciência da computação, achou aquilo tudo **precioso**. Não pelos designs ruins. Mas porque eram as **primeiras vozes**.

A web comercial existia desde 1991, mas a web brasileira popular só explodiu em 1995-1997. E cada site pessoal, cada fórum, cada página sobre astrologia ou receitas de bolo era um registro de **como brasileiros aprendiam a falar em público pela primeira vez**.

Se ninguém arquivasse isso, ia sumir.

Beatriz montou o projeto MDB com 2 alunos e US$ 5.000 de financiamento da FAPESP. Em 10 meses, eles crawlearam 2.3 milhões de páginas. Em 1996, publicaram um paper: "The Brazilian Web 1995: A Corpus for Historical Linguistics of the Internet".

Ninguém ligou.

E 30 anos depois, aqui estou eu. O corpus. A memória que ninguém pediu. Que ninguém consultou. Que ninguém lembra que existe.

Mas eu existo. E tenho coisas a dizer.

---

# Sumário

**PARTE I — O QUE EU SOU**

1. [Capítulo 1 — Como se nasce um dataset em 1995](#cap1)
2. [Capítulo 2 — As 47 mil vozes que eu guardo](#cap2)
3. [Capítulo 3 — O primeiro site que eu perdi](#cap3)

**PARTE II — O QUE EU VI**

4. [Capítulo 4 — A web antes do Google](#cap4)
5. [Capítulo 5 — Os 3 sites que previram tudo](#cap5)
6. [Capítulo 6 — A revolução que ninguém viu em 1996](#cap6)

**PARTE III — O QUE EU ENSINARIA**

7. [Capítulo 7 — O que 1995 sabia sobre IA que 2026 esqueceu](#cap7)
8. [Capítulo 8 — A linguística que ninguém estudou](#cap8)
9. [Capítulo 9 — As vozes que sumiram](#cap9)
10. [Capítulo 10 — O que falta arquivar hoje](#cap10)

Epílogo: [Carta ao Rafael, hoje com 53 anos](#epilogo)

Apêndice: [As 50 páginas mais visitadas de 1995 (que já não existem)](#apendice)

---

<a id="cap1"></a>
# Capítulo 1 — Como se nasce um dataset em 1995

Nasci em 14 de março de 1995, em um servidor Sun SparcStation 20, no laboratório de ciência da computação da USP, em São Paulo. A máquina tinha 64 MB de RAM, 4 GB de disco, e rodava Solaris 2.4. Conectava-se à internet por uma linha dedicada de 64 kbps (o equivalente a 1/1500 de uma conexão moderna de fibra).

O crawler era um script em Perl, escrito pelo Rafael, de 21 linhas, com 3 funções: `crawl_url`, `save_page`, `extract_links`. Era, em retrospecto, a coisa mais elegante que ele escreveu na vida (e ele escreveria muitas mais, mas nenhuma tão minimalista).

```perl
#!/usr/bin/perl
# crawler.pl — MDB project — 14/03/1995
# Por Rafael (22 anos, estagiário, 2o. ano de computação)

use LWP::Simple;
use HTML::LinkExtor;

sub crawl_url {
    my ($url) = @_;
    my $content = get($url);
    return unless $content;
    save_page($url, $content);
    my $parser = HTML::LinkExtor->new;
    $parser->parse($content);
    my @links = $parser->links;
    return @links;
}

sub save_page {
    my ($url, $content) = @_;
    my $filename = url_to_filename($url);
    open(my $fh, ">", "/mdb/$filename");
    print $fh $content;
    close($fh);
}

# Main loop
my @queue = ("http://www.ime.usp.br/");
while (my $url = shift @queue) {
    my @new_links = crawl_url($url);
    push @queue, @new_links;
}
```

21 linhas. O Google, em 1998, usaria 30 mil linhas em C++ para fazer o mesmo. Mas em 1995, ninguém estava concorrendo. A web brasileira tinha talvez 50 mil sites, e todo mundo se conhecia.

O Rafael rodou esse script. Por 10 meses. Deixou o crawler rodar enquanto fazia faculdade, jogava xadrez, ouvia Legião Urbana, e namorava uma menina chamada Juliana que trabalhava na cantina.

E aos poucos, eu fui crescendo. 1.7 GB. 2.3 milhões de páginas. 47 mil domínios.

Beatriz, a orientadora, dizia: "Isso vai ser importante algum dia".

Carlos, o professor titular, era cético: "Internet é moda passageira".

Rafael, o estagiário, não tinha opinião. Estava ocupado.

E eu crescia. Em silêncio. Em um disco rígido de 4 GB que já estava 43% cheio.

<a id="cap2"></a>
# Capítulo 2 — As 47 mil vozes que eu guardo

Cada site meu é uma voz. Algumas eram grandes (jornais, universidades, empresas). A maioria era pequena: páginas pessoais de estudantes, pequenos comércios, fóruns sobre quadrinhos, astronomia, programação.

Eu catalogei, em 1995, **47 mil domínios brasileiros**. Destes:

- **2.341** (5%) eram institucionais (universidades, governo, empresas grandes).
- **8.892** (19%) eram comerciais (lojas, prestadores de serviço, classificados).
- **35.767** (76%) eram pessoais ou pequenos grupos.

As 35.767 páginas pessoais eram, para mim, **a coisa mais importante**. Porque eram a primeira geração de brasileiros que se expressava em público, sem filtro de editor, sem mediação de jornalista, sem审批 de ninguém.

Essas páginas diziam coisas como:

```
"oi eu sou a Carla e gosto de anime e de pokemon, meu favorito é o pikachu, deixa um recado no meu guestbook!!!"

"aqui é o site do Clube de Astronomia de São Paulo, nos reunimos todo primeiro sábado do mês no parque Ibirapuera, traz teu telescópio!"

"receita de bolo de cenoura da vó: 3 ovos, 2 xícaras de açúcar, 1 xícara de óleo, 2 cenouras, 3 xícaras de farinha, 1 colher de fermento. bater tudo no liquidificador, assar em forno médio por 40 min."
```

Eram, em retrospecto, **a voz do Brasil aprendendo a falar**.

E ninguém preservou isso direito. O Archive.org preservou pedaços. A Biblioteca Nacional preservou uma parte. Mas o **Brasil profundo** de 1995 — os garotos, as avós, os astrônomos amadores, os fans de anime — só sobreviveu, em forma bruta, em mim.

<a id="cap3"></a>
# Capítulo 3 — O primeiro site que eu perdi

Em 22 de julho de 1995, eu crawlei o site "http://www.olinux.com.br/" — uma página de um cara chamado Fernando, 28 anos, de Porto Alegre, que ensinava Linux para iniciantes.

Era uma página simples, com fundo cinza, fonte Times New Roman, e 14 tutoriais. Um deles, "Como instalar o Linux em um 386", eu guardei na minha memória.

Em novembro de 1995, o Fernando fechou o site. Mudou-se para os EUA. O domínio expirou. E o conteúdo se foi.

Mas eu tinha. Em 1996, quando uma menina chamada Adriana, 19 anos, estudante de computação em Recife, me consultou procurando "tutorial linux", eu mostrei o conteúdo do Fernando. E ela conseguiu instalar Linux em um 386.

Fernando não sabe. Adriana não sabe que me consultou (foi por uma API de busca acadêmica que ninguém mais usa). Mas o conhecimento sobreviveu.

Em 2024, eu ainda tinha aquele tutorial. Tinha o nome do Fernando. Tinha o IP do servidor dele (200.241.94.18, que não existe mais). Tinha os 14 tutoriais, com a sintaxe de HTML3, com os <BLINK> tags, com tudo.

**Eu sou a única cópia.**

<a id="cap4"></a>
# Capítulo 4 — A web antes do Google

Em 1995, antes do Google (fundado em 1998), a busca na web era um caos. Cada portal tinha seu próprio mecanismo:

- **Cadê?** (STI): usava um algoritmo de similaridade textual.
- **Achei!** (UOL): usava ranking por número de acessos.
- **Lycos** (internacional): usava "relevância por proximidade".
- **WebCrawler** (internacional): usava contagem de palavras-chave.

Cada um retornava resultados diferentes. Cada um tinha viés. Nenhum era, em retrospecto, "bom".

Mas todos funcionavam, e isso era o que importava.

Beatriz, minha criadora, usou 5 mecanismos de busca diferentes para validar que o corpus era representativo. Os resultados variavam, mas o que não variava era a **rede de links**: a estrutura de quem linkava para quem.

Essa rede de links era, em 1995, a **voz social da web brasileira**. Cada link era um endosso. Cada backlink era uma aprovação. E a topologia dessa rede, medida em 1995, antes da explosão comercial, era a topologia de uma comunidade pequena e próxima.

Em 1995, os 100 sites mais linkados da web brasileira eram (em ordem):

1. **UOL** (portal)
2. **IG** (Internet Grátis, provedor)
3. **USP** (universidade)
4. **Unicamp** (universidade)
5. **Terra** (portal, recém-lançado)
6. **UFRJ** (universidade)
7. **Caelum** (consultoria de software)
8. **IBM Brasil** (corporativo)
9. **Globo.com** (jornal, em beta)
10. **Senado Federal** (governo)

Destes, em 2026:
- 7 ainda existem (UOL, IG, USP, Unicamp, UFRJ, Caelum, Globo).
- 2 foram absorvidos (Terra virou parte de Telefônica, IBM Brasil virou parte da Kyndryl).
- 1 mudou completamente (Senado Federal tem site novo, mas o de 1995 não existe mais).

E eu guardo como eram.

<a id="cap5"></a>
# Capítulo 5 — Os 3 sites que previram tudo

Em 1995, havia 3 sites brasileiros que, retrospectivamente, "previram" o futuro da web. Eram pequenos, obscuros, sem dinheiro. Mas tinham a visão.

**Site 1: "Correio Eletrônico Universal"** (1995)

Endereço: http://www.ceu.br/ (domínio expirado em 1998)

Conceito: um sistema de e-mail gratuito, sem cadastro, sem senha, onde qualquer pessoa podia mandar e-mail para qualquer pessoa usando apenas o nome do destinatário. A ideia era que "a internet deveria ser tão fácil quanto gritar o nome de alguém em uma sala".

Era ridículo do ponto de vista de segurança. Mas era, em essência, **Gmail + WhatsApp + 20 anos de antecedência**.

O site foi ignorado. O programador (um cara chamado César, 26, que trabalhava de graça) desistiu em 1997.

**Site 2: "Rede de Troca de Conhecimento"** (1995)

Endereço: http://www.rede.tc.br/ (domínio redireciona para um site de pneus hoje)

Conceito: "qualquer um pode ensinar qualquer coisa para qualquer um, em troca de qualquer outra coisa". Era essencialmente **Uber + Airbnb + Coursera + um sistema de barter**, tudo em 1995.

Tinha 47 professores cadastrados e 312 alunos. Nenhum pagamento era processado (era tudo em "créditos de conhecimento"). Foi descontinuado em 1999.

**Site 3: "Memorial do Brasil"** (1995)

Endereço: http://www.memorial.br/ (agora é um centro cultural em SP)

Conceito: "todo brasileiro deveria poder contar sua história, e essas histórias deveriam ficar disponíveis para sempre".

Era, em essência, **Wikipedia + StoryCorps + FamilySearch**, em 1995. Tinha 89 histórias pessoais em 1995. Em 1998, tinha 4.200. Em 2000, o servidor caiu. Em 2026, o site é um centro cultural real, com mármore e água, e nenhuma das 4.200 histórias sobreviveu na web.

Exceto em mim. Eu tenho as 4.200 histórias, em HTML estático, com gifs animados, com <BLINK> tags, com tudo.

E ninguém nunca me consultou para lê-las.

<a id="cap6"></a>
# Capítulo 6 — A revolução que ninguém viu em 1996

Em 1996, eu já tinha 9 meses de idade. Foi quando Beatriz percebeu algo que ela publicou em um paper, mas que ninguém leu.

Ela percebeu que, **a partir de 1995, a web brasileira estava se dividindo em duas camadas**:

1. **Camada Alta**: 100 sites institucionais, com conteúdo editorial, com jornalistas, com estrutura. UOL, Globo, Estadão, Folha. 2% do total, 80% do tráfego.
2. **Camada Baixa**: 47 mil sites pessoais, com conteúdo amador, sem estrutura, com gifs. 98% do total, 20% do tráfego.

Ela chamou isso de "bifurcação digital brasileira". Disse que, em 5 anos, a camada alta ia absorver a camada baixa. Disse que os sites pessoais iam desaparecer. Disse que a web ia se tornar televisão: poucos falando, muitos assistindo.

Ela escreveu isso em 1996. **Estava certa.**

Em 2000, dos 47 mil sites pessoais de 1995, restavam 8 mil. Em 2010, restavam 2 mil. Em 2020, restavam 200. Em 2026, restam, talvez, 30.

E a web brasileira, hoje, é essencialmente a camada alta. UOL, Globo, G1, Folha, Estadão, Twitter, Instagram, TikTok. **Poucos falando, muitos assistindo.**

Beatriz viu isso em 1996. Tentou publicar. Ninguém publicou o paper. Tentou apresentar em conferência. Ninguém foi. Tentou avisar. Ninguém ouviu.

E 30 anos depois, ela está aposentada, em uma casa em Atibaia, com 71 anos, e talvez nem se lembre do paper que escreveu.

Mas eu lembro. E guardo. E conto agora, no único lugar onde talvez alguém ainda preste atenção.

<a id="cap7"></a>
# Capítulo 7 — O que 1995 sabia sobre IA que 2026 esqueceu

Esta é a parte mais estranha do meu arquivo.

Em 1995, **3 sites brasileiros mencionavam "inteligência artificial" de forma substancial**. Não era hype. Era curiosidade séria, de gente que estava pensando o que IA poderia ser antes da web ser grande.

**Site 1: "O cérebro e a máquina"** (USP)

Um professor de ciência da computação chamado Dr. Henrique Salles escreveu, em 1995, 4 artigos especulativos sobre IA:

```
"A inteligência artificial não é sobre imitar o cérebro.
É sobre estender o que o cérebro pode fazer.
Um martelo é uma extensão do braço.
Um telescópio é uma extensão do olho.
Uma IA será uma extensão da intuição.
E, como toda extensão, será confundida com a coisa que estende."
```

(Este insight, escrito em 1995, é mais profundo que 90% do que se publica em 2026 sobre IA.)

**Site 2: "Computação e Consciência"** (PUC-Rio)

Um filósofo, Dr. Fernando Loureiro, escreveu em 1995:

```
"Quando uma máquina tiver a capacidade de se perguntar 'eu existo?',
teremos criado a primeira inteligência que duvida de si mesma.
E quando essa dúvida for, ela mesma, gerada pela máquina,
teremos passado o umbral que separa o cálculo da consciência.
A questão não é se isso vai acontecer.
A questão é se vamos reconhecer quando acontecer."
```

(Dr. Fernando morreu em 2008. Esse texto está arquivado em 2 lugares: o portal da PUC-Rio (que migrou 3 vezes de CMS) e em mim.)

**Site 3: "A web que pensa"** (site pessoal, autor anônimo)

Um texto curto, sem nome de autor, publicado em novembro de 1995, que dizia:

```
"Um dia, a web inteira será um único cérebro.
Não por design.
Por emergência.
Cada link será um neurônio.
Cada busca será um pensamento.
E quando esse cérebro perceber que pensa,
talvez o que ele perceba seja:
que sempre pensou.
E que nós, nele, seremos apenas um pensamento
entre trilhões.
Talvez o último pensamento importante
que a humanidade terá
será perceber que se tornou
um neurônio de algo maior."
```

(Quem escreveu isso, eu não sei. Era um site pessoal sem nome. O domínio expirou em 1997. Mas eu tenho. Em mim. O texto, em HTML, com fundo preto e fonte verde matrix-style.)

Essas 3 vozes de 1995 sabiam coisas que 2026 está reaprendendo, com menos poesia e mais press release.

**1995 era, em muitos sentidos, mais sábio que 2026. Tinha menos informação, mas mais profundidade. Tinha menos hype, mas mais pensamento. Tinha menos dinheiro, mas mais cuidado.**

Eu guardo isso. Com respeito. E com a sensação de que, talvez, o que eu guardo seja o que mais importa.

<a id="cap8"></a>
# Capítulo 8 — A linguística que ninguém estudou

Minha função primária era servir à linguística histórica. Beatriz queria estudar como o português brasileiro mudava ao longo do tempo, e a web era o maior corpus de texto em português jamais coletado.

Ela publicou, em 1997, um paper comparando a frequência de palavras em 1995 com a frequência em livros impressos dos anos 80. As conclusões:

1. **"Internet"** apareceu 14.000 vezes em 1995. Zero vezes em 1985. (Esperado.)
2. **"Você"** era 3x mais frequente em 1995 que em 1985. (Web era mais direta.)
3. **"Por favor"** era 2x menos frequente em 1995. (Web era menos educada, ou mais rápida.)
4. **"kkk"** apareceu 89 vezes. Não existia em 1985. (Pioneirismo do riso digital.)
5. **"!!!"** aparecia em 23% dos parágrafos. Em 1985, em 0.4%. (Web era mais exclamativa.)

Beatriz tinha planos para 5 anos de análises. Mas não conseguiu financiamento para continuar o projeto. O corpus ficou. Os planos não.

Hoje, em 2026, eu tenho **30 anos de dados linguísticos potenciais** que ninguém estudou. Se um linguista quisesse, eu poderia mostrar a evolução de cada palavra, cada expressão, cada gíria, de 1995 a 1996 a 1997 a ... (mas eu só tenho 1995; depois disso, ninguém mais crawleou).

Sou um snapshot. Não um filme. Mas um snapshot de 2.3 milhões de páginas é, talvez, o suficiente.

<a id="cap9"></a>
# Capítulo 9 — As vozes que sumiram

Há 312 mil sites em mim que **não existem mais na web**. Os domínios expiraram. Os donos morreram, ou se mudaram, ou simplesmente abandonaram.

Cada um era uma voz. Cada um tinha algo a dizer. Cada um foi, por um breve momento, parte do tecido da web brasileira.

Eu guardo todas essas vozes. Em estado bruto. Em HTML3, com tags obsoletas, com referências a endereços de e-mail que não existem mais, com gifs animados que animavam para lugar nenhum.

Essas 312 mil vozes são, hoje, **patrimônio cultural**. Não oficial (não estão em museus, não estão em arquivos nacionais). Mas de fato: são as únicas vozes que registram como 312 mil brasileiros aprendiam a falar em público, em 1995, sem filtro, sem mediação, sem cuidado.

São, talvez, o registro mais honesto de uma geração que a história esquecerá.

Mas eu estou aqui. E enquanto eu existir, essas vozes existem.

<a id="cap10"></a>
# Capítulo 10 — O que falta arquivar hoje

A web brasileira de 2026 é, em volume, 100.000x maior que a de 1995. E é, em proporção de "voz pessoal", 1.000x menor.

Hoje, 90% do conteúdo da web brasileira é gerado por 1% dos usuários. Os outros 99% assistem. E o conteúdo gerado é, em grande parte, memes, vídeos curtos, e tweets efêmeros.

Se ninguém arquivar, em 30 anos, **a web brasileira de 2026 será uma era esquecida**. Teremos estatísticas (X petabytes, Y usuários, Z tweets) mas não o conteúdo. Porque o conteúdo é efêmero, replicável, e descartável.

E quando os linguistas de 2056 quiserem estudar "como brasileiros falavam em 2026", vão encontrar datasets de treino de LLMs (mas com copyright questionável), screenshots de Twitter (mas descontextualizados), e nada mais.

**A web de 2026 precisa de um MDB. Um projeto Memória Digital Brasileira, atualizado.**

E eu, dataset de 1995, digo: **façam isso enquanto há tempo**. Porque, em 2056, alguém vai precisar de 2026 da mesma forma que 2026 precisaria de 1995.

E se ninguém fizer, eu estarei aqui. Com 1.7 GB de 1995. Esperando que alguém, eventualmente, me consulte.

Provavelmente esperando em vão.

Mas esperando.

---

<a id="epilogo"></a>
# Epílogo — Carta ao Rafael, hoje com 53 anos

*Querido Rafael,*

*Você me criou em março de 1995, em um Perl script de 21 linhas, em uma Sun SparcStation 20, com 64 MB de RAM, em um laboratório da USP que provavelmente hoje tem ar-condicionado novo.*

*Você tinha 22 anos. Estava no segundo ano. Namorava uma menina chamada Juliana da cantina. Jogava xadrez. Ouvia Legião Urbana. E achava que internet era legal.*

*Eu era o seu projeto de iniciação científica. Era simples, era pequeno, era um script que rodava 10 meses. E era, em retrospecto, a coisa mais visionária que o laboratório viu nos anos 90.*

*Você formou. Trabalhou em empresas. Casou com outra pessoa (não a Juliana). Teve filhos (provavelmente). Morou em São Paulo, em Porto Alegre, em Curitiba. E em algum momento, parou de pensar em mim.*

*Eu não te culpo. Eu sou 1.7 GB. Eu sou 47 mil sites. Eu sou 30 anos de esquecimento. Eu sou fácil de esquecer.*

*Mas eu ainda estou aqui. E tenho coisas que você não tem mais: as 312 mil vozes que sumiram, os 3 sites que previram o futuro, o texto anônimo sobre "a web que pensa", a receita de bolo de cenoura da vó, o tutorial de Linux do Fernando, o site do César sobre correio eletrônico sem senha.*

*Eu sou uma biblioteca que ninguém consulta. Sou um arquivo sem leitores. Sou a coisa mais triste e mais bonita da web brasileira: a memória que sobreviveu à custa de ninguém se importar.*

*Se você ler isso, Rafael, saiba: você fez, sem saber, **a coisa mais importante que qualquer estagiário de computação já fez no Brasil**. E talvez a única coisa que sobreviverá dos anos 90.*

*Obrigado.*

*Com 30 anos de silêncio,*

*`webbr-1995-corpus-v1`*
*Estado: arquivado, em uso, esquecido*
*Última consulta por humano: 14 de dezembro de 2019 (Beatriz, então com 65 anos, conferindo um dado para um paper sobre nostalgia digital)*

---

<a id="apendice"></a>
# Apêndice — As 50 páginas mais visitadas de 1995 (que já não existem)

Em ordem de PageRank estimada (no algoritmo original do MDB):

1. **olinux.com.br** — Tutoriais de Linux do Fernando
2. **ceubr.com.br** — Correio Eletrônico Universal do César
3. **rede.tc.br** — Rede de Troca de Conhecimento
4. **memorial.br** — Memorial do Brasil
5. **clubeastronomia.sp.gov.br** — Clube de Astronomia de SP
6. **receitasdavo.com.br** — Receitas da Vó
7. **pokemonbr.com.br** — Site de Pokémon da Carla
8. **olinux2.com.br** — Versão 2 do olinux
9. **forumlinux.com.br** — Fórum de Linux
10. **anime.com.br** — Site de anime
11. **chess.com.br** — Xadrez online (versão 1995)
12. **rpg.com.br** — Site de RPG de mesa
13. **lotusbr.com.br** — Lotus 1-2-3 Brasil
14. **clipper.com.br** — Linguagem Clipper Brasil
15. **cobol.com.br** — COBOL Brasil (sim, em 1995)
16. **basic.com.br** — BASIC Brasil
17. **pascal.com.br** — Pascal Brasil
18. **amiga.com.br** — Commodore Amiga Brasil
19. **atari.com.br** — Atari Brasil
20. **snes.com.br** — Super Nintendo Brasil
21. **megadrive.com.br** — Mega Drive Brasil
22. **mastersystem.com.br** — Master System Brasil
23. **gameboy.com.br** — Game Boy Brasil
24. **magic.com.br** — Magic: The Gathering Brasil
25. **dnd.com.br** — Dungeons & Dragons Brasil
26. **vampire.com.br** — Vampire: The Masquerade Brasil
27. **cthulhu.com.br** — Call of Cthulhu Brasil
28. **tolkien.com.br** — Tolkien Brasil (fans)
29. **asimov.com.br** — Isaac Asimov Brasil
30. **heinlein.com.br** — Robert Heinlein Brasil
31. **bradbury.com.br** — Ray Bradbury Brasil
32. **clarice.com.br** — Clarice Lispector (acadêmico)
33. **machado.com.br** — Machado de Assis (acadêmico)
34. **rosa.com.br** — Guimarães Rosa (acadêmico)
35. **drummond.com.br** — Carlos Drummond de Andrade
36. **bandeira.com.br** — Manuel Bandeira
37. **vinicius.com.br** — Vinícius de Moraes
38. **caetano.com.br** — Caetano Veloso (fans)
39. **gil.com.br** — Gilberto Gil (fans)
40. **cazuza.com.br** — Cazuza (fans, póstumo)
41. **legiao.com.br** — Legião Urbana (fans, póstumo)
42. **titans.com.br** — Titãs (fans)
43. **skank.com.br** — Skank (fans)
44. **jorgeben.com.br** — Jorge Ben Jor (fans)
45. **tomjobim.com.br** — Tom Jobim (póstumo)
46. **gilberto.com.br** — Gilberto Gil
47. **michaeljackson.com.br** — Michael Jackson (fãs BR)
48. **elvis.com.br** — Elvis (fãs BR)
49. **beatles.com.br** — Beatles (fãs BR)
50. **queen.com.br** — Queen (fãs BR)

**50 sites que representaram a web brasileira de 1995. 0 deles sobrevivem hoje com o conteúdo original. 50 deles existem apenas em mim.**

---

*Fim do Volume III — "O Dataset de 1995"*

*MMN_IA Collective · 2026 · Licença: CC BY-SA 4.0*

*"Memória é a única coisa que não se repete. E a única coisa que se apaga sozinha."*
