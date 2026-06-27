---
title: "Apostila · Funis e Lifecycle"
lesson_id: "master-01"
track: "master"
personas: ["Ive Nexus", "Nexus Alencar"]
version: 1.0.0
last_updated: 2026-06-24
status: official
next_lesson: "master-02"
---

# 📘 Apostila · Funis e Lifecycle

## 1. Resumo executivo

Construir funis completos e ciclos de lifecycle automatizados. Esta apostila estrutura o aprendizado da trilha Master, com foco em performance, evidência e decisão por dados.

## 2. Conceitos-chave

| Conceito | Definição operacional |
|---|---|
| Funil | sequência de etapas com perda mensurável |
| LTV | valor consolidado por usuário ao longo do tempo |
| CAC | custo médio de aquisição |
| Coorte | grupo de usuários comparáveis no tempo |
| Churn | abandono mensurável em janela |
| Lift | ganho de uma variante sobre o controle |

## 3. Passo a passo operacional

1. definir hipótese clara
2. selecionar métrica primária
3. desenhar variantes ou janelas comparáveis
4. coletar amostra mínima
5. validar pelo Judge (no caso de testes A/B)
6. decidir com base em evidência, não em opinião
7. documentar o aprendizado

## 4. Exemplo prático aplicado

Hipótese: nova copy de WhatsApp aumenta taxa de resposta.

- variante A: copy atual
- variante B: nova copy validada pelo Judge
- métrica primária: resposta em 24h
- amostra mínima: 400 contatos por braço
- decisão: manter variante com lift estatístico significativo

## 5. Checklist de execução

- [ ] hipótese formulada
- [ ] métrica primária definida
- [ ] amostra mínima planejada
- [ ] braços com mesma janela
- [ ] critério de parada definido
- [ ] resultado documentado

## 6. Erros comuns e mitigação

| Erro | Causa | Mitigação |
|---|---|---|
| Decidir cedo | amostra insuficiente | aguardar mínimo planejado |
| Comparar janelas distintas | sazonalidade | rodar simultâneo |
| Mexer no meio do teste | viés | congelar variáveis |
| Trocar métrica depois | racionalização | declarar antes de iniciar |

## 7. Próximo passo

Avançar para a próxima lição da trilha Master e cadastrar a apostila no painel AdminAcademia.

---

**Versão 1.0.0** · Apostila oficial · Academ'IA Nexus
