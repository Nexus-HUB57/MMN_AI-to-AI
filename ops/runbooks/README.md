# Runbooks Operacionais OneVerso

## Localização
- Scripts: `/var/www/oneverso/runbooks/`
- Logs: `/var/www/oneverso/runbooks/logs/`
- Baselines: `/var/www/oneverso/baselines/`
- Snapshots de rollback: `/var/www/oneverso/baselines/snapshots/`

## Abertura Diária
```bash
/var/www/oneverso/runbooks/daily-open.sh
```
Gera relatório em `logs/daily-open-<timestamp>.log` e emite veredito VERDE/ATENÇÃO.

## Rollback Rápido
```bash
/var/www/oneverso/runbooks/rollback.sh <timestamp_baseline>
```
Lista snapshots disponíveis se invocado sem argumento. Sempre salva estado pré-rollback em `emergency_<ts>` antes de aplicar.

## Gatilhos de Rollback
- `/api/health` indisponível
- mmn-api com restart anormal recorrente
- Falha generalizada em login/dashboard/admin
- Erro crítico em marketplace/biblioteca
- Regressão grave em Academ'IA

## Baseline Atual
- Arquivo: `/var/www/oneverso/baselines/BASELINE_GOLIVE_20260623T212440Z.md`
- Snapshot: `/var/www/oneverso/baselines/snapshots/20260623T212440Z/`
