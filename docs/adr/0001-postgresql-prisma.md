# ADR 0001: PostgreSQL with Prisma

- **Status:** Accepted
- **Owner:** Akanksha Deshmukh

## Context

Incident state is relational: each incident references a service and an owner, and event history belongs to an incident and actor. The project needs referential integrity and transactional writes.

## Decision

Use PostgreSQL as the source of truth and Prisma as the typed data-access layer.

## Alternatives

- **Document database:** flexible, but relationships and lifecycle consistency still require application-level discipline.
- **Raw SQL only:** precise and powerful, but adds repetitive mapping and maintenance overhead for this project's scope.

## Consequences

Foreign keys, indexes, and transactions are explicit. Schema evolution must be reviewed and migrations must be tested against a clean database. Use raw SQL selectively when query plans demonstrate a meaningful benefit.
