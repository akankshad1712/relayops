# ADR 0002: Write incident events in the mutation transaction

- **Status:** Accepted
- **Owner:** Akanksha Deshmukh

## Context

A status change without its corresponding timeline event makes incident review unreliable. Writing to the two tables separately can leave partial state if one write fails.

## Decision

Wrap the incident mutation and its `IncidentEvent` write in one Prisma transaction.

## Alternatives

- **Best-effort second write:** simpler, but can lose audit context.
- **Transactional outbox:** stronger delivery guarantees when publishing to external systems, but more schema and worker complexity than required for the current local application.

## Consequences

The application records both changes atomically in PostgreSQL. The timeline is not cryptographically tamper-proof, and the current cascade-delete behavior is not suitable for regulated retention requirements. If events must be delivered to external consumers, add an outbox rather than making network calls inside the transaction.
