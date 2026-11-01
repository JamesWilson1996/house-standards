# PostgreSQL conventions

Each service gets its own database (or its own schema and role on a shared cluster for small apps), and only that service's role can connect to it.

| Area | Standard |
| --- | --- |
| Version | PostgreSQL 17 or newer; same major version in every environment |
| Names | `snake_case`, plural tables (`orders`), singular columns, foreign keys `<entity>_id`, indexes `ix_<table>_<cols>`, uniques `uq_<table>_<cols>` |
| Primary keys | `id uuid` generated as UUIDv7 (time-ordered) by the application, so ids exist before insert and sort by creation |
| Required columns | `id`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null`, `version integer not null default 1` |
| Time | Always `timestamptz`, stored UTC; never `timestamp` without zone |
| Money | `bigint` minor units plus a `currency char(3)` column; never `float` or `money` |
| Enums | `text` with a `CHECK` constraint (or a lookup table), not native `enum` types |
| Flexible data | `jsonb` only for genuinely schemaless payloads; anything queried or constrained gets real columns |
| Deletes | Hard delete by default; soft delete (`deleted_at`) only where audit or undo is a requirement, with partial indexes `WHERE deleted_at IS NULL` |
| Multi-tenancy | `tenant_id uuid not null` on every tenant-owned table, leading every index, enforced with row-level security policies |
| Standard tables | `outbox`, `inbox` and `idempotency_keys` in every service that publishes, consumes or accepts commands |
| Access | Repositories in the Postgres adapter only, using a query builder or SQL with typed results (e.g. Kysely, jOOQ, sqlc). No ORM entities leak into the domain |

## Migrations

- Plain, forward-only SQL files in `migrations/`, numbered and run by one tool across all services (e.g. dbmate or Flyway) before the service starts.
- Zero-downtime by default: expand, migrate data, then contract in a later release. Create indexes `CONCURRENTLY`; add columns nullable or with a default.
- Review the query plan impact of every migration touching tables over 1 million rows.

## Operations

Connection pooling through PgBouncer in transaction mode, `pg_stat_statements` enabled, daily backups with point-in-time recovery, and a restore tested every quarter.
