# Roteiro da Vídeo Aula: 03 · Análise de Coortes e Churn

**Personas:** Sra. Nexus Ive e Sir. Nexus Alencar
**Duração Estimada:** 45 minutos
**Pré-requisito:** 02-A/B testing com Judge

## Cena 1: Introdução à Análise de Coortes e Churn (Duração: 3 minutos)

**Visual:** Sra. Nexus Ive e Sir. Nexus Alencar em um cenário de escritório moderno, com um gráfico de retenção de clientes ao fundo. Ive inicia a fala, com uma expressão de seriedade e foco.

**Sra. Nexus Ive:** "No nosso último encontro, dominamos o A/B testing, a ciência por trás da otimização. Agora, vamos mergulhar em uma das habilidades mais valiosas para qualquer operador Master: a análise de coortes e churn. Sir. Alencar, por que essa análise é tão crucial para a longevidade e o crescimento de uma operação?"

**Sir. Nexus Alencar:** "Sra. Ive, a análise de coorte é a técnica que nos mostra **quando, onde e por que seus clientes somem**. A análise tradicional de médias esconde padrões vitais. Com coortes, podemos segmentar clientes por características comuns e rastrear seu comportamento ao longo do tempo, revelando insights que permitem tomar decisões de retenção muito mais eficazes. É a inteligência que previne a evasão e sustenta o LTV."

## Cena 2: A Matriz de Coorte Explicada (Duração: 7 minutos)

**Visual:** Transição para um slide com um exemplo de matriz de coorte (linhas: coortes, colunas: períodos). Alencar explica como ler a matriz.

**Sir. Nexus Alencar:** "A matriz de coorte tem linhas que representam as coortes, como o mês de entrada dos clientes, e colunas que indicam os períodos subsequentes, como M0, M1, M2. Cada célula mostra a porcentagem de clientes daquela coorte que ainda estão ativos naquele mês. Por exemplo, se a coorte de Março/26 retém melhor que a de Janeiro/26, algo mudou positivamente entre esses meses. É um mapa visual do comportamento do cliente ao longo do tempo."

**Sra. Nexus Ive:** "Essa visualização é poderosa, Sir. Alencar. Ela nos permite identificar rapidamente padrões de retenção e churn, e o mais importante, correlacioná-los com ações de marketing ou mudanças no produto. É a capacidade de ver o invisível e transformar dados em estratégia."

## Cena 3: Como Construir a Matriz no Nexus e Padrões Clássicos (Duração: 10 minutos)

**Visual:** Demonstração no painel `/dashboard/analytics/cohort`, mostrando como selecionar métricas, granularidade e cohort-by. Em seguida, slide com os 4 padrões clássicos de leitura da matriz. Ive e Alencar detalham.

**Sra. Nexus Ive:** "No Nexus, você pode construir sua matriz de coorte em `/dashboard/analytics/cohort`, selecionando a métrica, granularidade temporal e a característica da coorte. Sir. Alencar, quais são os padrões clássicos que devemos procurar?"

**Sir. Nexus Alencar:** "Existem quatro padrões principais. O **Churn constante** indica um problema fundamental no produto. O **Cliff no M1** aponta falha no onboarding. O **Cliff no M3-M6** sugere que o produto não sustenta o engajamento a médio prazo. E o **Outlier positivo** revela uma coorte que retém muito melhor, indicando algo que funcionou e deve ser replicado. Cada padrão exige uma ação estratégica diferente."

## Cena 4: O que é Churn e Causas-Raiz (Duração: 10 minutos)

**Visual:** Slide com a fórmula do churn rate e os tipos de churn. Em seguida, slide com as causas-raiz de churn por janela temporal. Alencar explica o cálculo e as causas, Ive complementa com as soluções.

**Sir. Nexus Alencar:** "O churn rate é a porcentagem de clientes que saíram em um período. Calculamos dividindo os clientes perdidos pelos clientes no início do mês. Existem o churn voluntário, involuntário e silencioso. As causas-raiz variam: onboarding falho (M0-M1), produto que não resolve o problema (M2-M3), concorrente melhor (M3-M6) ou custo percebido alto. É fundamental identificar a causa para aplicar a solução correta."

**Sra. Nexus Ive:** "Para cada causa, há uma solução. Tutoriais em vídeo para onboarding falho, ajustes na oferta para produto inadequado, pesquisa de saída para concorrência, e planos alternativos para custo. A análise de coorte nos permite ser cirúrgicos na retenção, investindo onde o impacto é maior."

## Cena 5: Ações de Retenção e o ROI de Salvar Clientes (Duração: 10 minutos)

**Visual:** Slide com uma tabela de ações de retenção por estágio (D+0 a D+90+) e um gráfico comparando o custo de adquirir vs. reter clientes. Ive e Alencar discutem as estratégias e o ROI.

**Sra. Nexus Ive:** "As ações de retenção devem ser segmentadas por estágio do cliente. Onboarding intensivo nos primeiros 7 dias, engajamento de valor até 30 dias, ofertas de recompra/upsell até 90 dias, e programas de indicação para clientes evangelistas. Sir. Alencar, quando vale a pena salvar uma coorte?"

**Sir. Nexus Alencar:** "Nem todo churn vale ser combatido. A regra é: salve se o LTV da coorte multiplicado pela porcentagem de recuperação possível for maior que o custo do win-back. Recuperar um cliente custa 5 a 7 vezes menos do que adquirir um novo. Por isso, investir em retenção tem um ROI muito superior à aquisição pura. É uma estratégia de crescimento inteligente e sustentável."

## Cena 6: Conclusão e Próximo Passo na Trilha Elite (Duração: 5 minutos)

**Visual:** Ive e Alencar retornam ao enquadramento inicial. Um slide final aparece com a indicação do próximo curso: Blueprints Elite.

**Sra. Nexus Ive:** "Parabéns! Você acaba de completar a Trilha Master, dominando a análise de coortes e churn. Essa é a skill mais valiosa para quem busca a sustentabilidade e o crescimento exponencial. Você agora tem as ferramentas para não apenas atrair, mas reter e multiplicar seus clientes."

**Sir. Nexus Alencar:** "Compreender o ciclo de vida do cliente e combater o churn é o que diferencia os operadores Master. Agora, você está pronto para o próximo nível. Convido vocês a iniciarem a **Trilha Elite**, com o curso: '00 - Blueprints Elite', onde desvendaremos as estratégias dos top 10% da rede. Preparem-se para escalar sua operação para um novo patamar!"

**Sra. Nexus Ive:** "Até lá, apliquem a análise de coortes em suas operações e transformem seus dados em decisões estratégicas. Sua jornada de sucesso continua, e estamos aqui para guiá-lo. Até a próxima aula!"
