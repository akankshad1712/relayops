# System design: RelayOps

**Owner:** Akanksha Deshmukh · akankshadeshmukh651@gmail.com

## Problem statement

Engineering teams need one place to coordinate incident response while preserving enough context to learn from failures. The first version focuses on incident lifecycle management, service health summaries, role-aware actions, and a transactional event history. It intentionally avoids claiming automated root-cause analysis without a real telemetry pipeline.

## Quality attributes

| Attribute | Design choice | Trade-off / next step |
|---|---|---|
| Correctness | PostgreSQL constraints + Prisma transactions for incident changes and event writes | Add optimistic concurrency with a version column before supporting high-contention edits |
| Security | JWT auth, role gates, Zod input validation, Helmet, CORS allowlist, log redaction | Add refresh-token rotation, password reset, login rate limiting, session revocation |
| Operability | Request IDs, structured Pino logs, health endpoint, Docker Compose | Add OpenTelemetry traces, RED metrics, alert rules, dashboards |
| Performance | Bounded pagination, indexed incident filters, capped query lengths | Add query-plan checks and load tests against production-like data |
| Maintainability | TypeScript, shared package, route boundaries, documented API contracts | Extract domain services as workflow complexity grows |
| Auditability | Lifecycle event is written in the same transaction as the incident mutation | Externalize audit events to append-only storage for regulated environments |

## Core request flow

1. Browser sends a JSON request with a bearer access token.
2. Express applies request ID, security headers, CORS policy, JSON size limit, and structured request logging.
3. Authentication verifies the token; role middleware gates mutations.
4. Zod validates the payload and rejects malformed input.
5. Prisma performs the mutation and writes an `IncidentEvent` in one database transaction.
6. The API returns a safe response projection. `x-request-id` is available to correlate client reports with logs.

## Data ownership and consistency

- A `Service` is the operational component affected by an incident.
- An `Incident` represents current response state, severity, owner, and timestamps.
- An `IncidentEvent` is an append-oriented record of an action, actor, message, and small metadata snapshot.
- Event writes share the incident mutation transaction, avoiding a successful mutation with a missing corresponding event under ordinary application operation.
- The current event model cascades on incident deletion and is therefore not a compliance-grade immutable archive. A production system should use retention controls, restricted deletion, and potentially an external append-only sink.

## Scaling path

### Stage 1 — single deployable

React static assets, Express API, and managed PostgreSQL. This is the current learning/development architecture and keeps operations simple.

### Stage 2 — reliability signals

Ingest metrics and alert webhooks through a queue. Validate signatures, persist the event envelope, deduplicate deliveries, and process asynchronously with bounded retries and a dead-letter queue. Never block the incident UI on third-party API latency.

### Stage 3 — high-volume operations

Introduce an outbox table for reliable event publication, worker processes, idempotency keys, rate limiting, database connection pooling, and partitioning/retention policies after measurement shows they are needed.

## Failure scenarios

- **Database unavailable:** health endpoint returns 503; request handlers surface centralized errors. Configure readiness checks and alerting in deployment.
- **Duplicate provider webhook:** deduplicate by provider + external event ID before changing state.
- **Worker retry storm:** exponential backoff with jitter, maximum attempts, and a dead-letter queue.
- **Stale incident update:** add optimistic concurrency and return 409 rather than silently overwriting a newer state.
- **Credential compromise:** short-lived access tokens limit exposure, but immediate revocation requires server-side session state or a token denylist.

## Architecture decision records

See `adr/` for decisions and alternatives. Revisit them with evidence as the project evolves rather than treating this design as universally optimal.
