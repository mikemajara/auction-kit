# Auction Kit PM Index

Central index for the working docs inside `pm/`. Use it to jump between guides, planning artifacts, and progress reports.

## Directory Guide

- `guides/` – repeatable how-to references you consult while building.
  - `GETTING_STARTED.md`: Week 0.5 setup flow plus base commands.
  - `QUICKSTART_DATABASE.md`: five-minute checklist to rerun the Postgres manual test.
  - `TESTING.md`: exhaustive database testing guide (migrations, inspection, troubleshooting).
- `plan/` – long-lived strategy and planning docs.
  - `plan.md`: master roadmap covering architecture, milestones, and success criteria.
  - `PROJECT_STATUS.md`: rolling status snapshot with package readiness and upcoming priorities.
  - `NEXT_STEPS.md`: immediate action plan coming out of the latest completed milestone.
- `status/` – dated reports that capture what shipped.
  - `2025-12-23-week0.5.md`: proof-of-concept recap and lessons.
  - `2025-12-23-week1.md`: consolidated Week 1 summary (core, drizzle, database validation).

## Conventions

- Start new status reports with ISO-formatted filenames (`YYYY-MM-DD-phase.md`) so they sort chronologically.
- When adding a doc, link it here with a one-line description to keep navigation quick.
- Cross-link between categories (e.g., a status report referencing commands should point back to the relevant guide).


