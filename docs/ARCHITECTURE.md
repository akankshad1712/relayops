# Architecture and engineering decisions

## Design goals
1. Keep the UI fast and understandable during stressful incident response.
2. Make boundaries explicit: HTTP transport, validation, auth, persistence.
3. Use typed contracts and predictable error envelopes.
4. Provide a local developer environment that is easy to reproduce.
5. Make the next scaling step visible without pretending it already exists.

## Key decisions

### React + Vite instead of a monolithic server-rendered app
The product is an authenticated operations console where the initial portfolio goal is interaction quality and API design. Vite gives a simple feedback loop. A production evolution could move selected public pages to a framework with server rendering if SEO becomes relevant.

### Express + TypeScript
Express keeps the transport layer small and familiar. Route modules own request/response handling, Zod validates input, Prisma owns data access, and error middleware standardizes failures. As the domain grows, extract use-case services rather than letting route handlers become a business-logic dumping ground.

### PostgreSQL + Prisma
Relational integrity matters: incidents must reference a service and an owner. PostgreSQL also provides indexing, transactions, and a mature operational ecosystem. Prisma makes the data model discoverable for contributors.

### JWT scaffold
The sample uses short-lived signed access tokens to keep the local demo straightforward. Browser localStorage is **not the preferred production token store** for sensitive applications. For production, use a carefully designed HttpOnly cookie/session model, CSRF protection where relevant, refresh rotation, revocation, and a threat model.

### Request IDs and observability
The API attaches a request ID to every response and logs HTTP requests with authorization headers redacted. Extend this with OpenTelemetry trace context, structured domain events, latency histograms, and error-rate dashboards.

## Reliability and scaling path
- **First 1k teams:** add pagination everywhere, query indexes based on query plans, and connection-pool management.
- **Event ingestion:** accept idempotency keys; persist raw events; publish to a queue; process correlation asynchronously.
- **High volume:** separate write ingestion from read models, use a queue such as Kafka/SQS, and cache expensive overview aggregates.
- **Multi-tenant:** introduce Organization and Membership tables; scope every query by tenant ID; add tenant isolation tests.
- **Auditability:** append-only incident event log with actor, timestamp, old/new values, and correlation ID.
- **Availability:** define SLOs, runbooks, backups, restore tests, and safe deployment/rollback procedures.

## Security boundaries to test
- Unauthenticated requests cannot access incident/service data.
- Viewer role cannot create or update incidents.
- Invalid enums and oversized payloads are rejected.
- No secret or password hash is returned by an API.
- CORS is restricted to configured origin.
- Login errors do not reveal whether an email exists.
- Search and pagination have bounded input.
- Logs redact credentials and tokens.
