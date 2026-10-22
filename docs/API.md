# API reference

Base URL: `http://localhost:4000/api/v1`

All protected endpoints require `Authorization: Bearer <accessToken>`.

## Health
`GET /health`

Returns `200` with `{ "status": "ok", "service": "relayops-api", "database": "ok" }` or `503` if the database is unavailable.

## Login
`POST /auth/login`

```json
{ "email": "akankshadeshmukh651@gmail.com", "password": "your-local-seed-password" }
```

Returns an access token and a safe user projection. Credentials are never returned.

## Overview
`GET /overview`

Returns service count, open/resolved/sev1 incident counts, and recent incidents.

## Services
`GET /services`

Returns services ordered by name, with a compact list of non-resolved incidents for each service.

## Incidents
`GET /incidents?page=1&limit=20&status=MONITORING&severity=SEV2&q=latency`

- `page`: one-based page number.
- `limit`: 1–50.
- `status`: `INVESTIGATING | IDENTIFIED | MONITORING | RESOLVED`.
- `severity`: `SEV1 | SEV2 | SEV3 | SEV4`.
- `q`: bounded title/summary search.

`POST /incidents` (ADMIN or ENGINEER)

```json
{
  "title": "Elevated checkout latency in EU-West",
  "summary": "Checkout p95 exceeded the threshold after a dependency slowdown.",
  "severity": "SEV2",
  "serviceId": "service-id"
}
```

`PATCH /incidents/:id` (ADMIN or ENGINEER)

```json
{ "status": "MONITORING", "summary": "Mitigation deployed; watching error rate." }
```

## Error contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  }
}
```

Common status codes: `400` validation/reference failure, `401` missing or invalid credentials, `403` role denied, `404` resource/route missing, `500` unexpected server failure, `503` health check unable to reach the database.


## Incident timeline / audit events
`GET /incidents/:id/events` (any authenticated role)

Returns up to 250 events in chronological order. Incident creation and updates write the incident mutation and its corresponding event in the same database transaction, so an event is not recorded if the mutation rolls back. Event metadata captures a limited before/after snapshot for status and severity. This is an application audit trail, not a tamper-proof compliance ledger.

Example response shape:
```json
{ "data": [{ "id": "event-id", "incidentId": "incident-id", "actorId": "user-id", "type": "INCIDENT_UPDATED", "message": "status changed to MONITORING", "metadata": { "before": { "status": "IDENTIFIED", "severity": "SEV2" }, "after": { "status": "MONITORING", "severity": "SEV2" } }, "createdAt": "2026-10-22T10:00:00.000Z", "actor": { "id": "user-id", "name": "Akanksha Deshmukh", "role": "ADMIN" } }] }
```
