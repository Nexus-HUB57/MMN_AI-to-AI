# Roteiro da Vídeo Aula: 02 · Federação de Agentes

**Personas:** Sra. Nexus Ive e Sir. Nexus Alencar
**Duração Estimada:** 60 minutos
**Pré-requisito:** 01-Multi-tenant e White-label

## Cena 1: Introdução à Federação de Agentes (Duração: 3 minutos)

**Visual:** Sra. Nexus Ive e Sir. Nexus Alencar em um cenário de rede global, com pontos de luz interconectados. Ive inicia a fala, com um olhar que abrange a vastidão da rede.

**Sra. Nexus Ive:** "No módulo anterior, desvendamos o Multi-tenant e o White-label, expandindo sua operação para múltiplas marcas. Agora, vamos além, para o conceito de **Federação de Agentes**, onde múltiplos nós Nexus se comunicam, formando uma rede distribuída. Sir. Alencar, qual a importância dessa federação para a verdadeira escala e resiliência da rede Nexus?"

**Sir. Nexus Alencar:** "Sra. Ive, a federação é o que permite que a rede Nexus transcenda a operação individual. Ela conecta nós autônomos, permitindo que eles colaborem, compartilhem skills e consultem dados com consentimento, sem centralizar tudo em um único servidor. É a distribuição de carga, o isolamento de falhas e a colaboração entre afiliados que impulsionam a rede para um novo patamar de eficiência e segurança."

## Cena 2: Multi-tenant vs. Federação e Como Funciona o mTLS (Duração: 10 minutos)

**Visual:** Transição para um slide comparando Multi-tenant e Federação, e outro slide ilustrando o funcionamento do mTLS. Alencar detalha as diferenças e a tecnologia.

**Sir. Nexus Alencar:** "É fundamental distinguir: **Multi-tenant** é um operador com N marcas, dados isolados por RLS, com controle total do operador. **Federação** são N operadores, cada um com sua marca, dados isolados por design, trocando dados com consentimento. A segurança dessa troca é garantida pelo **mTLS (Mutual TLS)**, onde cliente e servidor se autenticam mutuamente com certificados. Isso impede que um nó se passe por outro e garante que toda comunicação seja criptografada e autenticada. É a base da confiança na rede federada."

**Sra. Nexus Ive:** "Essa distinção é crucial, Sir. Alencar. O mTLS não é apenas uma tecnologia; é a fundação da confiança e da segurança em uma rede distribuída. Ele garante que a colaboração entre os nós seja feita com a máxima integridade, protegendo os dados e a reputação de cada afiliado."

## Cena 3: Os 3 Níveis de Confiança e Como Adicionar um Nó (Duração: 15 minutos)

**Visual:** Slide com os 3 níveis de confiança (Leitura pública, Leitura autorizada, Escrita autorizada) e uma demonstração no painel `/dashboard/federation/invite` de como adicionar um nó. Ive e Alencar explicam os níveis e o processo.

**Sra. Nexus Ive:** "Na federação, operamos com três níveis de confiança. O **Nível 1** é para leitura pública de dados, sem necessidade de aprovação. O **Nível 2** permite leitura autorizada de dados específicos, exigindo consentimento de ambos os lados. Sir. Alencar, qual o nível mais avançado e como adicionamos um nó à federação?"

**Sir. Nexus Alencar:** "O **Nível 3** é para escrita autorizada, permitindo que um nó escreva em nome de outro, como em campanhas conjuntas, e requer aprovação mútua e auditoria. Para adicionar um nó, você emite um convite em `/dashboard/federation/invite`, especificando o nó alvo e o nível de confiança. O outro nó aceita, as chaves mTLS são trocadas automaticamente, e um teste de comunicação é realizado. Todo o processo leva cerca de 1 hora se ambos os administradores estiverem disponíveis."

## Cena 4: Operações Cross-Nó e Segurança (Duração: 15 minutos)

**Visual:** Slide com exemplos de operações cross-nó (Deduplicação de leads, Skills compartilhadas, Campanhas conjuntas, Catálogo unificado) e as boas práticas de segurança. Ive e Alencar detalham as operações e a importância da segurança.

**Sra. Nexus Ive:** "As operações cross-nó são o coração da federação. A **deduplicação de leads** evita que múltiplos nós abordem o mesmo lead. **Skills compartilhadas** permitem que um nó utilize a skill de outro, otimizando recursos. **Campanhas conjuntas** ampliam o alcance, e um **catálogo unificado** facilita a oferta de produtos. Sir. Alencar, como garantimos a segurança e o compliance nessas operações?"

**Sir. Nexus Alencar:** "A segurança é primordial. Utilizamos mTLS com rotação de chaves a cada 90 dias, auditoria de todas as operações federadas e limites de consulta por hora/dia para evitar exfiltração de dados. Em termos de **LGPD**, o consentimento explícito do lead é exigido antes de compartilhar dados entre nós. E a reversibilidade, a capacidade de revogar acesso a qualquer momento, é um pilar fundamental. É a segurança em profundidade que permite a colaboração sem riscos."

## Cena 5: Quando NÃO Federar e Federação para 3+ Nós (Duração: 10 minutos)

**Visual:** Slide com as condições para NÃO federar e as topologias para 3+ nós (Estrela, Mesh, Hierárquica). Ive e Alencar discutem as estratégias avançadas.

**Sra. Nexus Ive:** "Nem sempre a federação é a melhor opção. Não federe se você é solo e o nó vizinho também, se os públicos são 100% concorrentes, se você não tem um administrador dedicado, ou se sua receita mensal é inferior a R$ 10k. A federação é para operadores com R$ 20k+ consistente, com nós vizinhos de públicos não-concorrentes e admins dedicados. Sir. Alencar, como escalamos para 3 ou mais nós?"

**Sir. Nexus Alencar:** "Com 3+ nós, a complexidade aumenta. Podemos usar a **Topologia Estrela** (1 nó central), **Mesh** (cada nó fala com todos) ou **Hierárquica** (nós regionais + nó central). Recomendo começar com Estrela para 2-3 nós, migrar para Hierárquica para 4-10, e Mesh apenas para 10+ nós. O **Pinned mTLS** e os **Health checks** são essenciais para garantir a estabilidade e a resiliência da rede em larga escala."

## Cena 6: Conclusão e Próximos Passos na Trilha Elite (Duração: 7 minutos)

**Visual:** Ive e Alencar retornam ao enquadramento inicial. Um slide final aparece com os próximos passos na Trilha Elite.

**Sra. Nexus Ive:** "Parabéns! Você acaba de dominar a Federação de Agentes, o conceito que leva a orquestração de inteligência a um nível verdadeiramente distribuído e colaborativo. Você está agora na vanguarda da rede Nexus, capaz de construir e gerenciar ecossistemas complexos."

**Sir. Nexus Alencar:** "Compreender a federação é o que diferencia os operadores Elite. Os próximos passos incluem aplicar um blueprint, mentorar novos afiliados e contribuir para a rede. Em curto prazo, configure a federação com um nó vizinho. Em médio prazo, opere 2 tenants em white-label. E em longo prazo, aspire a ser uma referência na rede, construindo seu próprio produto e treinando a próxima geração."

**Sra. Nexus Ive:** "Sua jornada de sucesso continua, e estamos aqui para guiá-lo. Até a próxima aula!"
