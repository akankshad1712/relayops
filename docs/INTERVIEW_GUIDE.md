# Interview guide: how to present RelayOps

**Project owner:** Akanksha Deshmukh · akankshadeshmukh651@gmail.com

## 60-second pitch
“RelayOps is an incident intelligence workspace for engineering teams. I built the product experience and API around a real operational workflow: understand current reliability, find an incident, identify its service and owner, and move it through a response lifecycle. I focused on the details that separate a demo from an engineering project: typed request validation, authorization, relational integrity, bounded search and pagination, health checks, request IDs, Docker-based local setup, and a clear hardening roadmap. I also made incident mutations and timeline events atomic using a database transaction, so audit context cannot silently drift from the primary write.”

## Be ready to explain
1. **Why PostgreSQL?** The domain has strong relationships and integrity requirements. Discuss indexes and query plans.
2. **How does auth work?** Password hashes, JWT signing, token expiry, and why production browser storage should be reconsidered.
3. **What happens if a database query fails?** Central error handling, health endpoint, request ID, structured logs.
4. **How would you scale event ingestion?** Idempotency, durable queue, worker consumers, deduplication window, backpressure, dead-letter queue.
5. **How do you prevent tenant data leakage?** Add organization membership and require tenant scope at the repository/use-case boundary; enforce with integration tests.
6. **How would you measure reliability?** Define SLIs, SLOs, error budget, and distinguish user-visible availability from component health.
7. **How does the incident timeline stay consistent?** The incident write and event write share a Prisma transaction; if either fails, both roll back. This is not a tamper-proof compliance ledger.
8. **What is missing?** Refresh rotation, full tenant model, event ingestion, end-to-end tests, rate limiting, and deployed telemetry. Honest scope is a strength.

## Live demo sequence (90 seconds)
- Start at the dashboard and narrate the four top-level signals.
- Open Incidents; search “checkout” and filter by severity/status.
- Create a demo incident and explain the validation and persistence boundary.
- Open Services and compare health indicators.
- Finish with the architecture diagram and one scaling decision.

## What hiring teams usually look for
- A deployed, working product—not just screenshots.
- Readable code and tests that verify behavior.
- Clear trade-offs and the ability to discuss failure modes.
- Product sense: what users need during a stressful incident.
- Evidence of iteration: issues, pull requests, CI, release notes, and a concise case study.

A project is a conversation starter, not a substitute for fundamentals, interview preparation, or relevant experience.
