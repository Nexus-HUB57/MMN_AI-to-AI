---
title: "Apostila · 02 Sistema SHO"
lesson_id: "fund-02"
track: "fundamental"
personas: ["Ive Nexus", "Nexus Alencar"]
version: 1.1.0
last_updated: 2026-06-24
status: official
next_lesson: "fund-03"
---

# 📘 Apostila · 02 Sistema SHO

## 1. Resumo executivo

O SHO (Sistema Híbrido de Orquestração) define quando o agente age sozinho, quando pede revisão e quando bloqueia uma ação. Esta apostila apresenta os 3 estados operacionais e a tabela de decisão usada na plataforma.

## 2. Conceitos-chave

| Estado | Quando ocorre |
|---|---|
| Autoaprovação | confiança alta e risco baixo |
| Fila de revisão | confiança média ou risco moderado |
| Bloqueio | risco fora da política |

## 3. Passo a passo operacional

1. configurar threshold inicial conservador
2. rodar batch piloto pequeno
3. acompanhar fila de revisão nos primeiros dias
4. coletar amostra mínima antes de calibrar
5. ajustar threshold com base em dados, não em intuição
6. documentar cada ajuste

## 4. Exemplo prático aplicado

| Confiança | Risco | Resultado SHO |
|---|---|---|
| Alta | Baixo | aprovar |
| Média | Médio | revisar |
| Qualquer | Alto | bloquear |

## 5. Checklist de execução

- [ ] threshold inicial declarado
- [ ] batch piloto definido
- [ ] janela de leitura agendada
- [ ] critério de calibragem documentado
- [ ] amostra mínima respeitada

## 6. Erros comuns e mitigação

| Erro | Mitigação |
|---|---|
| automatizar 100% sem revisão | começar conservador |
| desligar Judge para ganhar tempo | manter Judge obrigatório |
| ignorar bloqueios sem análise | investigar antes de calibrar |
| subir threshold por intuição | exigir dados acumulados |

## 7. Próximo passo

Avançar para `fund-03 · Painel do Afiliado` para operar a interface e consolidar a rotina diária.

---

**Versão 1.1.0** · Apostila oficial · Academ'IA Nexus
