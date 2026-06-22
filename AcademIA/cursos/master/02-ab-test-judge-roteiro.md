# Roteiro da Vídeo Aula: 02 · A/B testing com Judge

**Personas:** Sra. Nexus Ive e Sir. Nexus Alencar
**Duração Estimada:** 45 minutos
**Pré-requisito:** 01-Funis e Lifecycle

## Cena 1: Introdução ao A/B Testing (Duração: 3 minutos)

**Visual:** Sra. Nexus Ive e Sir. Nexus Alencar em um cenário de laboratório futurista, com telas exibindo gráficos comparativos. Ive inicia a fala, com um ar de curiosidade e desafio.

**Sra. Nexus Ive:** "No nosso último encontro, desvendamos o poder do lifecycle, transformando clientes em evangelistas. Agora, é hora de trazer o rigor científico para suas estratégias de marketing. Sir. Alencar, por que o A/B testing é a ferramenta indispensável para quem busca a verdadeira otimização?"

**Sir. Nexus Alencar:** "Sra. Ive, o A/B testing é o método científico aplicado a marketing. Ele nos permite comparar duas versões de algo – seja uma copy, um horário de envio ou uma segmentação – e medir qual performa melhor, com **significância estatística**. É a única forma de saber se uma melhora observada é real ou apenas fruto do acaso. É a validação que separa a intuição do resultado concreto."

## Cena 2: Quando Usar e Quando NÃO Usar A/B Testing (Duração: 5 minutos)

**Visual:** Transição para um slide com os pontos '✅ Use quando' e '❌ NÃO use quando'. Alencar detalha as condições.

**Sir. Nexus Alencar:** "Use o A/B testing quando você tem volume suficiente, idealmente mais de 1.000 leads, e quando a diferença esperada entre as variantes é superior a 5%. É perfeito para validar hipóteses específicas. No entanto, evite-o com volumes baixos, pois o ruído estatístico é alto, ou quando a diferença esperada é mínima. E, crucialmente, não tente testar múltiplas variáveis ao mesmo tempo, pois você não conseguirá isolar o que realmente funcionou."

**Sra. Nexus Ive:** "A sabedoria está em saber quando aplicar a ferramenta certa. O A/B testing é poderoso, mas exige disciplina e um entendimento claro de suas limitações. É a inteligência que evita o desperdício de tempo e recursos em testes inconclusivos."

## Cena 3: Anatomia de um Teste Válido e Significância Estatística (Duração: 10 minutos)

**Visual:** Slide com a estrutura de um teste válido (Hipótese, Variação A/B, Randomização, Tamanho Mínimo, Métrica Primária, Critério de Parada) e um gráfico explicando a significância estatística. Ive e Alencar alternam as explicações.

**Sra. Nexus Ive:** "Um teste válido começa com uma **hipótese clara**: 'se mudarmos X, esperamos Y'. Definimos uma **variante A** (controle) e uma **variante B** (teste). A **randomização** garante que 50% dos leads recebam A e 50% recebam B. Sir. Alencar, como garantimos que o resultado não é apenas sorte?"

**Sir. Nexus Alencar:** "É aí que entra a **significância estatística**. Ela nos dá a confiança de que a diferença observada não é aleatória. O padrão-ouro da indústria é 95%. Isso significa que há apenas 5% de chance de o resultado ser um falso positivo. A skill `analytics-ab-test` automatiza esse cálculo, garantindo que você só promova um vencedor quando a confiança for alta."

## Cena 4: O Papel do Judge no A/B Test (Duração: 7 minutos)

**Visual:** Slide ilustrando a interação entre o Judge e o A/B test. Alencar explica os três papéis do Judge.

**Sir. Nexus Alencar:** "O Judge Revisor desempenha três papéis cruciais no A/B test. Primeiro, ele **valida que ambas as variantes são aceitáveis**, bloqueando qualquer copy que viole as políticas. Segundo, ele **garante que o teste é justo**, padronizando o filtro de conformidade para ambas as variantes. E terceiro, ele **detecta viés em tempo real**, alertando se uma variante está sendo reprovada mais que a outra, mesmo que ambas pareçam limpas. Ele é o guardião da integridade do seu teste."

**Sra. Nexus Ive:** "Essa camada de proteção é inestimável. O Judge não apenas evita banimentos, mas também assegura que seus testes sejam eticamente corretos e que os resultados sejam confiáveis. É a inteligência artificial a serviço da conformidade e da validação."

## Cena 5: Como Rodar o Primeiro Teste e Análise de Decisão (Duração: 15 minutos)

**Visual:** Demonstração passo a passo no painel `/dashboard/ab-test/new`, mostrando a configuração e o acompanhamento. Ive e Alencar guiam o processo.

**Sra. Nexus Ive:** "Para rodar seu primeiro teste, vá em `/dashboard/ab-test/new`. Defina sua hipótese clara, as variantes A e B, e o sistema calculará o tamanho da amostra necessário para 95% de significância. Anexe o teste à sua campanha, e o sistema fará a randomização por contato. Sir. Alencar, como interpretamos os resultados?"

**Sir. Nexus Alencar:** "Acompanhe em `/dashboard/ab-test/<id>` a significância atual e o vencedor parcial. Quando atingir 95%, se houver um vencedor claro, promova-o para 100% do tráfego. Se for um perdedor claro, descarte-o. Se for inconclusivo, mantenha a versão original e crie uma nova hipótese. Mas atenção: se o Judge reprovou mais uma variante, investigue antes de promover. A decisão deve ser baseada em dados e na conformidade."

## Cena 6: Erros que Invalidam Testes e Quando Parar (Duração: 5 minutos)

**Visual:** Slide com os erros mais comuns que invalidam testes e as condições para parar de testar. Ive e Alencar reforçam as boas práticas.

**Sra. Nexus Ive:** "Evitem parar o teste cedo, mudar variantes durante o teste, misturar audiências ou ignorar a sazonalidade. Esses erros contaminam seus resultados. E nunca olhem apenas para uma métrica; uma conversão alta com muitas reprovações do Judge é uma armadilha. A disciplina é a chave para testes válidos."

**Sir. Nexus Alencar:** "Você está testando demais quando não tem mais hipóteses, a diferença entre variantes é mínima (< 2%), ou o Judge está reprovando mais de 30% de ambas. A regra é: máximo 3 testes simultâneos por agente. Mais que isso, e nenhum converge com qualidade. A otimização é um processo contínuo, mas com foco e propósito."

## Cena 7: Conclusão e Próximo Passo (Duração: 2 minutos)

**Visual:** Ive e Alencar retornam ao enquadramento inicial. Um slide final aparece com a indicação do próximo curso.

**Sra. Nexus Ive:** "Parabéns! Você agora domina a arte do A/B testing com Judge, uma skill essencial para qualquer operador Master. É a capacidade de validar suas estratégias com dados que o levará ao próximo nível de otimização."

**Sir. Nexus Alencar:** "Compreender e aplicar o A/B testing é fundamental para refinar suas campanhas e maximizar seus resultados. No próximo módulo, vamos aprofundar na 'Análise de Coortes e Churn', desvendando como identificar padrões de comportamento do cliente e combater a evasão. Preparem-se para aprimorar a retenção!"

**Sra. Nexus Ive:** "Até lá, comecem a planejar seus primeiros testes A/B e a usar o Judge como seu aliado na validação. Sua jornada de sucesso continua, e estamos aqui para guiá-lo. Até a próxima aula!"
