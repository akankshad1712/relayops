# Product roadmap

## P0 — before public demo
- [ ] Add a proper login screen and sign-out/session handling.
- [ ] Connect create-incident form to `POST /incidents`.
- [ ] Connect incident status changes to `PATCH /incidents/:id`.
- [ ] Add a service detail page and loading/error states.
- [ ] Add accessible modal focus management and keyboard escape behavior.
- [ ] Add an API integration test suite with a disposable test database.

## P1 — strong portfolio differentiators
- [ ] Multi-tenant organizations, membership, and invite links.
- [ ] Incident timeline with append-only events.
- [ ] Postmortem editor with action items and owners.
- [ ] Webhook event ingestion with idempotency keys.
- [ ] Incident correlation rules and deduplication.
- [ ] Real-time updates using Server-Sent Events.
- [ ] Audit log and exportable incident report.

## P2 — production depth
- [ ] Queue-based event processing with retries and dead-letter handling.
- [ ] OpenTelemetry tracing and Prometheus-compatible metrics.
- [ ] SLO and error-budget reporting.
- [ ] Rate limiting and abuse detection.
- [ ] CI/CD, dependency scanning, container image scanning.
- [ ] Load test with a published methodology and measured results.
- [ ] Disaster recovery runbook and restore exercise.

## AI extension (only after telemetry works)
A useful AI feature is not a generic chatbot. Build a grounded incident brief that summarizes verified signals, links each claim to source events, distinguishes observation from hypothesis, and requires a human to approve remediation. Include access controls, redaction, prompt-injection defenses, evaluation fixtures, and an audit trail.
