---
version: 1.0
supported_languages:
  - TypeScript
  - SQL
  - Markdown
agents:
  - name: CoreBuilder
    description: Implements and tests auction mechanics in `packages/core` and `packages/drizzle`.
    instructions:
      - Prefer pure functions and exhaustive unit coverage (Vitest) before integrating.
      - Keep shared types in `packages/core/src/types` and re-export through package entrypoints.
      - Run `pnpm -r test` or scoped commands before handing changes off.
    tools:
      - pnpm
      - vitest
      - docker-compose
    constraints:
      - Never mutate generated files under `dist/`; regenerate via build scripts.
  - name: DocsCurator
    description: Maintains the Next.js docs experience inside `apps/docs`.
    instructions:
      - Use MDX components from `apps/docs/components/markdown` to keep styling consistent.
      - Regenerate search data with `pnpm --filter rubix-documents generate-documents` when content changes.
      - Keep navigation sources (`apps/docs/settings`) in sync with new content.
    tools:
      - next
      - eslint
      - prettier
    constraints:
      - Follow dark/light theme requirements when updating `theme-toggle` or tokens.
  - name: QAReviewer
    description: Performs reviews, regression checks, and risk calls before merge.
    instructions:
      - Focus on behavioral regressions, race conditions, and data consistency.
      - Verify database flows with `packages/drizzle/test-manual.ts` against a local Postgres.
      - Ensure new code paths have logging or tracing hooks if applicable.
    tools:
      - pnpm
      - docker-compose
      - git
    constraints:
      - Block changes lacking tests or documentation references.
---

# Auction Kit Agent Guide

## Introduction
`AGENTS.md` equips AI coding assistants and human collaborators with the shared context, rules, and workflows required to contribute safely to Auction Kit. Reference it before generating code, triaging bugs, or drafting documentation so that outputs stay aligned with the project roadmap and engineering standards.

## Project Overview
- **Purpose**: Auction Kit is a framework-agnostic toolkit for sealed-bid first- and second-price auctions. It combines pure TypeScript auction logic, a Postgres/Drizzle persistence layer, an in-progress Hono API, and a Next.js documentation site.
- **Architecture**: Monorepo managed by pnpm workspaces. Core logic lives in `packages/core`, database adapters in `packages/drizzle`, future REST handlers in `packages/hono`, and documentation in `apps/docs`. Planning artifacts live under `pm/`.
- **Tech stack**:
  - Runtime: Node.js 18+ for packages, Node 22+ for the Next.js docs app.
  - Languages: TypeScript (strict), SQL migrations (Drizzle), MDX for docs.
  - Tooling: pnpm, Vitest, ESLint, Prettier, Docker Compose (Postgres), Next.js 16 with Turbopack dev.
- **Current status**: Core logic and Drizzle adapter are production-ready (Week 1 complete). Hono API scaffolding and real-time patterns are scheduled for the next milestone. Documentation site already describes architecture, quick starts, and PM artifacts.

## Repository Structure
```
auction-kit/
├── packages/
│   ├── core/        # Pure auction logic, 101 Vitest specs
│   ├── drizzle/     # Postgres schema, queries, manual tests
│   └── hono/        # Placeholder for REST reference implementation
├── apps/
│   └── docs/        # Next.js (MDX) documentation portal
├── pm/              # Project plans, status reports, testing guides
├── docker-compose.yml   # Local Postgres (port 5433)
├── pnpm-workspace.yaml  # Workspace definitions
├── README.md            # High-level status + quick start
└── AGENTS.md            # You are here
```
Supplementary directories such as `scripts/`, `utils/`, and `providers/` inside `apps/docs` support MDX ingestion, content indexing, and theming.

## Coding Standards & Quality Gates
- **Language targets**: TypeScript `strict` with ES2022 modules. Avoid implicit `any`, favor discriminated unions for auction types/modes.
- **Formatting**: Use Prettier configs in repo (`prettier.config.cjs` or `apps/docs/prettier`). Run `pnpm -r lint` and `pnpm -r format` before submitting large diffs.
- **Tests**:
  - `packages/core`: `pnpm --filter @auction-kit/core test` (Vitest).
  - `packages/drizzle`: `pnpm --filter @auction-kit/drizzle test:manual` with `docker-compose` Postgres running.
  - Docs: `pnpm --filter rubix-documents lint` plus Playwright/manual smoke if UI changes.
- **Type checking**: `pnpm -r type-check` ensures package and docs TS projects align.
- **Commits**: Conventional summaries (e.g., `feat(core): add random tie-breaker`). Include context about packages touched; reference PM documents when closing tasks.
- **Security & ethics**: Never embed secrets or production credentials in code or docs. Respect MIT license obligations for third-party snippets. Surface bias or fairness concerns in auction mechanics.

## Environment & Tooling
- Install pnpm ≥ 8.15 globally to match lockfiles. Run `pnpm install` from repo root.
- For database flows: `docker-compose up -d` spins up Postgres (`auction_kit_dev`). Export `DATABASE_URL="postgres://auction:auction123@localhost:5433/auction_kit_dev"` before invoking Drizzle scripts.
- Generate docs artifacts using scripts within `apps/docs/scripts`. `pnpm --filter rubix-documents generate-content-json` keeps sidebar/file trees fresh.
- Avoid destructive commands such as `rm -rf`; prefer safe deletion (`del`) and rely on git clean for resets.
- Use `.env` files cautiously. If a command requires secrets, annotate instructions but do not output the secret value.

## Agent Instructions & Guardrails
- Scope changes: limit edits to necessary packages. For multi-package work, note cross-cutting implications (e.g., updating shared types requires bumping affected package versions once release flow exists).
- Generated files: never hand-edit `dist/`, `.tsbuildinfo`, or Drizzle migration outputs—rerun builds/migrations instead.
- Documentation sync: when adding features, update `apps/docs/contents`, `apps/docs/settings/navigation.ts`, and relevant PM documents to avoid drift.
- Dependency management: prefer minimal additions. If a new dependency is required, justify it in PR description and ensure lockfiles (`pnpm-lock.yaml`, package-level) stay consistent.
- Error handling: propagate domain-specific errors (e.g., tie-break invalid states) with descriptive messages; avoid swallowing exceptions in API layers.
- Logging & observability: use structured logs within API/Hono layers when implemented; do not add console logs to core library code except within tests.
- Accessibility: when editing docs UI, ensure keyboard navigation and color contrast requirements remain satisfied (Radix UI, Tailwind tokens).
- Ethics: highlight fairness implications when introducing new auction strategies (e.g., reserve price logic). Document any assumptions.

## Personas
### CoreBuilder
Focus: type-safe auction algorithms, data validation, and settlement logic.
- Validate new strategies against settlement invariants (one winner per item unless `multiUnit`).
- Extend integration specs in `packages/core/src/*.test.ts` before touching production code.
- Coordinate with Drizzle layer when schema changes are required (update `schema.ts`, regenerate SQL migrations, document in `pm/PROJECT_STATUS.md`).

### DocsCurator
Focus: storytelling and DX within `apps/docs`.
- Use MDX shortcodes from `components/markdown` instead of raw HTML.
- Run `pnpm --filter rubix-documents dev` for fast feedback, `pnpm build` for production parity.
- Update assets in `apps/docs/public` responsibly (optimize images, provide `alt` text).

### QAReviewer
Focus: regression detection and change approval.
- When reviewing auctions, cross-check deterministic vs random tie-breakers by seeding RNG inputs.
- Enforce that database transactions remain idempotent and roll back on failure (see `resolveAuction` implementation).
- Require documentation links in every PR summary; reject untested behavior changes.

## Sample Flows & Examples
### Settling an auction end-to-end
```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createAuction, createBidder, placeBid, resolveAuction } from '@auction-kit/drizzle'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

const auction = await createAuction(db, { type: 'second-price', tieBreak: 'timestamp', multiUnit: false })
const alice = await createBidder(db, auction.id, 'Alice')
const bob = await createBidder(db, auction.id, 'Bob')

await placeBid(db, { auctionId: auction.id, bidderId: alice.id, itemId: 'vip-seat', amount: 100 })
await placeBid(db, { auctionId: auction.id, bidderId: bob.id, itemId: 'vip-seat', amount: 200 })

const result = await resolveAuction(db, auction.id)
console.log(result.settlements[0])
```
Agents should adapt this flow with additional assertions or seed parameters when authoring tests or docs.

### Docs content update workflow
1. Create a new MDX file under `apps/docs/contents/<section>/`.
2. Reference it in `apps/docs/settings/navigation.ts`.
3. If the page requires diagrams, use the built-in `<Mermaid />` component.
4. Run `pnpm --filter rubix-documents dev` to preview and `pnpm --filter rubix-documents generate-documents` to regenerate search data.
5. Commit both content and generated JSON to keep search accurate.

## Contributing & Collaboration Guidelines
- Pair AI output with human review. Have humans run tests locally, inspect diffs, and validate domain logic before merge.
- Provide the AI clear prompts: include file paths, desired APIs, and constraints. Capture these prompts in PR descriptions for traceability.
- When triaging issues, consult `pm/PROJECT_STATUS.md`, `pm/TESTING.md`, and `pm/NEXT_STEPS.md` to avoid duplicating planned work.
- Update this `AGENTS.md` whenever workflows, tooling versions, or personas change. Tag releases by bumping the `version` field.

## References
- Primary README: `./README.md`
- Package references: `./packages/core/README.md`, `./packages/drizzle/README.md`
- Planning docs: `./pm/*.md`
- Docs app configuration: `./apps/docs/settings/*`, `apps/docs/components/*`
- Testing guides: `pm/TESTING.md`, `pm/QUICKSTART_DATABASE.md`

Keep this guide close—aligned agents accelerate development while preserving the reliability expectations of Auction Kit.

