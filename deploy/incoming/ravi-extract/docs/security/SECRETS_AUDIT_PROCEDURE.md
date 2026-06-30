# 🔍 Procedimento de Auditoria de Secrets (Ravi-CTO)

> Use periodicamente (mensal mínimo) para garantir que nenhum segredo vazou em commits, logs ou histórico de Actions.

## 1. Auditoria de commits

```bash
# Procurar padrões de PAT GitHub, AWS, OpenAI, etc.
git log --all --source -p | grep -E \
  'ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN.*PRIVATE KEY-----' \
  | head -n 50
```

Se aparecer, **revogar imediatamente** o segredo correspondente, e considerar `git filter-repo` para reescrever o histórico (procedimento avançado — coordenar com o time).

## 2. Auditoria de Actions Secrets

https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/secrets/actions

- Cada secret deve ter um **dono** identificável.
- Verificar `Updated` date — secrets sem rotação há > 90 dias devem ser rotacionados.

## 3. Auditoria de logs do Actions

Para cada workflow recente:

```bash
gh run list --workflow="Ravi · Deploy Automatizado" --limit 20 --json databaseId,conclusion,createdAt
gh run view <RUN_ID> --log | grep -iE "(password|secret|token|key)" | grep -v '\*\*\*'
```

Se algum valor aparecer **sem** estar mascarado como `***`, há vazamento — revogar imediatamente.

## 4. Auditoria de SSH

No servidor:

```bash
last -n 100 | grep -v 'still logged'
journalctl -u sshd --since "30 days ago" | grep -iE "Accepted|Failed" | tail -n 100
sudo cat /root/.ssh/authorized_keys | wc -l
```

Cada linha em `authorized_keys` deve corresponder a uma chave conhecida e rastreável (comentário identificando o dono, ex: `ravi-cto-ci@nexus-affiliate`). Linhas órfãs ou sem comentário devem ser removidas.

## 5. Procedimento padrão pós-incidente

1. Identificar segredo vazado.
2. Revogar imediatamente no provedor (GitHub, AWS, OpenAI, etc.).
3. Gerar segredo novo.
4. Atualizar o Actions Secret correspondente.
5. Disparar `Ravi · Deploy Automatizado` para propagar.
6. Auditar últimas 24 h de uso do segredo antigo no provedor.
7. Documentar incidente em `docs/security/incidents/YYYY-MM-DD-<slug>.md`.

## 6. Rotação preventiva (calendário)

| Segredo | Periodicidade |
|---|---|
| `SSH_GITHUB` | 180 dias |
| `DATABASE_URL` (senha) | 90 dias |
| `REDIS_URL` (senha) | 90 dias |
| `OPENAI_API_KEY` | 90 dias |
| `GOOGLE_AI_API_KEY` | 90 dias |
| Senha root do servidor | nunca usar; já deve estar bloqueada após hardening |

## 7. Adendo: secrets em chat

> Regra inegociável: **nenhuma credencial pode aparecer em chat, ticket, PR ou commit**. Se acontecer (até com IA), trate como incidente.

Os agentes Ravi-CTO **rejeitam ativamente** credenciais coladas em chat e orientam o uso de Actions Secrets. Esta é uma política do CTO, não uma sugestão.
