**Project owner:** Akanksha Deshmukh · akankshadeshmukh651@gmail.com

# Portfolio launch checklist

## Product presentation
- [ ] Deploy the frontend and API; add the public demo URL to the README.
- [ ] Add a 60–90 second video walkthrough and 4–6 real screenshots.
- [ ] Add a “Problem / Decisions / Trade-offs / Results” case study.
- [ ] Add a concise demo account flow without publishing shared credentials.
- [ ] Make the mobile layout and keyboard interaction part of the demo.

## Engineering proof
- [ ] Confirm a clean install from a fresh clone.
- [ ] Run typecheck, lint, tests, and production build in CI.
- [ ] Add test coverage for auth, validation, permissions, pagination, and incident lifecycle.
- [x] Document architecture decisions for PostgreSQL/Prisma and transactional incident events.
- [ ] Add integration tests for audit event creation, permissions, and failure rollback.
- [ ] Add an issue tracker with scoped milestones and close issues through pull requests.
- [ ] Measure real performance; do not invent benchmark claims.

## Job search use
- [ ] Pin this repo and one other project that demonstrates a different skill.
- [ ] Put the live demo and GitHub repository on the resume.
- [ ] Tailor the resume to the job description instead of claiming one project fits every role.
- [ ] Prepare system design discussion: queue, deduplication, multi-tenancy, SLOs, and failure recovery.
- [ ] Practice explaining what is implemented versus planned.
