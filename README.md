# Vigil

Compliance management SaaS for volunteer-run community buildings — initially UK Scout huts.

## Tech stack

- Next.js 14 (App Router)
- PostgreSQL via Supabase
- Prisma ORM
- Tailwind CSS

## Database setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` to your PostgreSQL connection string (Supabase or local).

3. Run migrations:

```bash
npm install
npm run db:migrate
```

4. Seed the audit template:

```bash
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

## Schema

See `prisma/schema.prisma` and `CONTEXT.md` for the full data model.

Key entities: `Organisation` → `Premises` → audits, risk assessments, documents, and actions.

All queries must filter by `organisationId` or `premisesId` for multi-tenant isolation.
