# Security model and hardening plan

**Project owner:** Akanksha Deshmukh · akankshadeshmukh651@gmail.com

## Current controls

- JWT bearer token validation on protected routes.
- Role gates for incident mutations (`ADMIN` and `ENGINEER`).
- Zod validation and bounded payload/search sizes.
- Helmet security headers and configured CORS origin.
- Authorization and cookie header redaction in HTTP logs.
- Password hashing with bcrypt in the local seed flow.
- Environment-based secrets; the seed skips creating a user when `SEED_DEMO_PASSWORD` is unset.

## Known gaps — do not describe the current repository as production-secure

1. Login rate limiting, lockout/abuse detection, and password reset are not implemented.
2. Access tokens are stateless; immediate revocation and refresh-token rotation are not implemented.
3. There is no CSRF layer because the current documented flow uses bearer tokens, not cookie sessions. Reassess if auth moves to cookies.
4. Authorization needs broader tests, including object-level access and malicious owner/service IDs.
5. Incident events are application audit records, not immutable or independently retained evidence.
6. Dependency scanning, secret scanning, SBOM generation, and container image hardening should be added to CI.
7. Production deployment must use TLS, managed secrets, least-privilege database credentials, backups, and a tested restore procedure.

## Before public deployment

- [ ] Replace all local secrets and configure a secret manager.
- [ ] Restrict CORS to the exact deployed frontend origin.
- [ ] Add login throttling and security-event alerts.
- [ ] Add auth, role, object-level authorization, and rate-limit tests.
- [ ] Enable database backups and run a restore drill.
- [ ] Configure TLS, security headers, dependency scanning, and secret scanning.
- [ ] Review personal data and retention requirements before importing real incident data.
