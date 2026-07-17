# Patch para `.gitignore` (raiz do repo)

A linha global `**/*.sql` estava ignorando as migrations novas (`0012_*.sql`, `0013_*.sql`). Adicionar exceções **imediatamente abaixo** da regra `**/*.sql`:

```gitignore
**/*.sql
!database/migrations/*.sql
!backend/migrations/*.sql
!_marketplace_nexus_release/**/*.sql
```

Depois rodar:

```bash
git check-ignore -v database/migrations/0012_marketplace_user_library.sql \
                     database/migrations/0013_nexus_rag.sql
# Saída esperada: ambos NÃO ignorados.
git add -A database/migrations
```
