# SLO and incident-response playbook

**Owner:** Akanksha Deshmukh · akankshadeshmukh651@gmail.com

This playbook describes how a team would use RelayOps alongside its actual metrics and alerting stack. The example thresholds are illustrative and must be tuned to service behavior and customer commitments.

## Example service-level objectives

| Signal | Example objective | Measurement window | Response trigger |
|---|---|---|---|
| Successful requests | 99.9% availability | Rolling 30 days | Fast burn alert or sustained error-budget consumption |
| Checkout latency | 95% under 400 ms | Rolling 7 days | p95 exceeds threshold for 10 minutes |
| Event freshness | 99% delivered within 60 seconds | Rolling 7 days | Consumer lag exceeds agreed threshold |

## Severity guide

- **SEV1:** broad customer impact, security/data integrity risk, or critical path unavailable. Page immediately; incident commander owns coordination.
- **SEV2:** material degradation or partial outage with no acceptable workaround. Page the responsible team and communicate status.
- **SEV3:** limited impact or workaround available. Track and remediate during normal on-call operations.
- **SEV4:** low-impact issue, operational cleanup, or non-urgent reliability improvement.

Severity is a team policy, not a universal standard. Define customer impact and escalation expectations before incidents happen.

## Response lifecycle

1. **Investigating:** acknowledge the alert, validate impact, assign an incident lead, and establish a communication channel.
2. **Identified:** record the leading hypothesis and evidence; choose a mitigation with a rollback path.
3. **Monitoring:** mitigation is live; watch the relevant SLI and confirm that the error budget burn returns to normal.
4. **Resolved:** customer impact has ended and follow-up owners are assigned.

## Post-incident review template

- Summary and customer impact
- Start, detection, mitigation, and resolution timestamps
- Detection gaps and contributing factors
- What went well / what was difficult
- Corrective actions with owners and due dates
- SLO or alert changes and how they will be validated

Use blameless language. The goal is to improve the system, not identify an individual to blame.
