# Roteiro da Vídeo Aula: 03 · Lendo o Judge Revisor

**Personas:** Sra. Nexus Ive e Sir. Nexus Alencar
**Duração Estimada:** 30 minutos
**Pré-requisito:** 02-Disparando no WhatsApp

## Cena 1: Introdução ao Judge Revisor (Duração: 3 minutos)

**Visual:** Sra. Nexus Ive e Sir. Nexus Alencar em um cenário de escritório moderno. Ive inicia a fala, olhando para a câmera com uma expressão de seriedade e confiança.

**Sra. Nexus Ive:** "No universo da automação inteligente, a segurança e a conformidade são inegociáveis. Após dominarmos o disparo de mensagens, é fundamental compreender o guardião da sua operação: o Judge Revisor. Ele é a sua proteção contra banimentos, multas e mensagens inadequadas. Sir. Alencar, qual a importância vital do Judge para a longevidade da operação de nossos afiliados?"

**Visual:** Sir. Nexus Alencar assume o centro da atenção, com um monitor ao fundo exibindo um gráfico de conformidade.

**Sir. Nexus Alencar:** "Sra. Ive, o Judge Revisor é, sem dúvida, o componente mais importante para a segurança operacional. Ele atua como um filtro final, garantindo que cada mensagem enviada esteja em conformidade com as políticas do WhatsApp e as leis de proteção de dados, como a LGPD. Ele é um LLM menor, afinado especificamente para revisar as saídas do seu agente antes que elas se tornem ações, protegendo você de forma proativa."

## Cena 2: Como o Judge Funciona e Seus Vereditos (Duração: 7 minutos)

**Visual:** Transição para um slide que explica o funcionamento técnico do Judge. Sir. Nexus Alencar detalha o processo.

**Sir. Nexus Alencar:** "Para cada mensagem gerada, o Judge lê o texto e o contexto de uso, aplica cinco categorias de revisão, calcula um score de 0 a 1 e emite um veredito baseado nas regras configuradas. Tudo isso em milissegundos. Os vereditos são claros: **Verde (Aprovado)**, para scores acima de 0.85, onde a mensagem segue sem ressalvas. **Amarelo (Alerta)**, para scores entre 0.5 e 0.85, onde a mensagem é enviada, mas marcada para revisão humana. E **Vermelho (Bloqueado)**, para scores abaixo de 0.5, onde a mensagem não é enviada e requer sua aprovação manual. Cada decisão é registrada no log, garantindo total auditabilidade."

**Visual:** O slide agora mostra os três vereditos com suas respectivas cores e descrições.

**Sra. Nexus Ive:** "Essa transparência e a capacidade de intervenção humana são cruciais. O Judge não apenas protege, mas também educa, permitindo que nossos afiliados compreendam as nuances da conformidade e aprimorem suas estratégias de comunicação. É a inteligência que nos guia para a excelência."

## Cena 3: As 5 Categorias de Revisão e Configuração (Duração: 10 minutos)

**Visual:** Transição para um slide que lista as 5 categorias de revisão do Judge. Sir. Nexus Alencar as explica em detalhes.

**Sir. Nexus Alencar:** "O Judge avalia as mensagens em cinco categorias principais: **LGPD**, verificando consentimento e dados sensíveis; **Spam**, identificando palavras-gatilho e excessos; **Claim médico/saúde**, bloqueando promessas sem evidência; **Tom**, avaliando agressividade ou inadequação; e **Personalização**, alertando sobre mensagens genéricas. Cada categoria tem um peso, sendo LGPD, Spam e Claim médico as de maior impacto."

**Visual:** Sir. Nexus Alencar demonstra a configuração das regras do Judge no painel, em `/dashboard/judge/config`.

**Sir. Nexus Alencar:** "Na configuração, você pode escolher o modo de operação: **Bloqueio Total** (recomendado para iniciantes), **Alerta** (para experientes) ou **Permissivo** (para cenários de baixo risco). Habilitem as regras de LGPD, Spam e Claim médico para bloqueio, e Tom e Personalização para alerta. Além disso, usem a **Whitelist** para termos autorizados e a **Blacklist** para termos proibidos, em `/dashboard/judge/lists`. Isso afina o Judge para a sua operação específica."

**Sra. Nexus Ive:** "A customização do Judge é um diferencial poderoso. Ele se adapta à sua estratégia, enquanto mantém a integridade da sua comunicação. É a prova de que a automação pode ser flexível e segura ao mesmo tempo."

## Cena 4: Lendo Reprovações, Calibração e Próximo Passo (Duração: 10 minutos)

**Visual:** Sra. Nexus Ive retoma o enquadramento inicial. Um slide final aparece com a indicação do próximo curso.

**Sra. Nexus Ive:** "Para ler as reprovações, vá em `/dashboard/judge`. Cada item mostrará a mensagem original, a categoria reprovada, o motivo específico e uma sugestão de reescrita. Se concordar, ajuste a copy. Se discordar, adicione o termo à whitelist ou ajuste a regra. A calibração do Judge é um processo contínuo: comece com Bloqueio Total, analise as reprovações e, com o tempo, considere mudar para o modo Alerta, sempre buscando uma taxa de banimento de 0%."

**Sir. Nexus Alencar:** "Lembrem-se da regra de ouro: nunca desativem o Judge em produção. Ele é a sua linha de defesa. Apenas em ambientes de teste ou para depuração específica. A proteção que ele oferece é inestimável."

**Sra. Nexus Ive:** "Compreender e calibrar o Judge Revisor é dominar a arte da comunicação responsável e eficaz. Você completou a Trilha Agente, e agora está apto a operar com autonomia e segurança. O próximo passo é aprofundar na otimização de suas campanhas. Convido vocês a iniciarem a Trilha Master, com o curso: '00 - Otimização de Conversão'. Vamos juntos construir um futuro de sucesso!"
