# Vigil

Compliance management SaaS for volunteer-run community buildings — initially UK Scout huts.

## Tech stack

- Next.js 14 (App Router)
- PostgreSQL via Supabase
- Prisma ORM
- Tailwind CSS

## Database setup

### Local PostgreSQL (Docker)

```bash
cp .env.example .env
npm install
npm run docker:up          # starts postgres:16 on localhost:5432
npm run db:setup           # migrate + seed
```

Default credentials match `docker-compose.yml`: `postgres` / `postgres`, database `vigil`.

Reset the database (drops volume and re-seeds):

```bash
npm run docker:reset
```

### Supabase / remote PostgreSQL

Set `DATABASE_URL` in `.env`, then:

```bash
npm run db:migrate:deploy
npm run db:seed
```

## Scripts

| Script | Description |
|---|---|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:seed` | Seed audit template v2025-09 |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:setup` | Apply migrations and seed |
| `npm run docker:up` | Start local Postgres container |
| `npm run docker:down` | Stop Postgres container |
| `npm run docker:reset` | Reset DB volume, migrate, and seed |

## Schema

See `prisma/schema.prisma` and `CONTEXT.md` for the full data model.

Key entities: `Organisation` → `Premises` → audits, risk assessments, documents, and actions.

All queries must filter by `organisationId` or `premisesId` for multi-tenant isolation.
