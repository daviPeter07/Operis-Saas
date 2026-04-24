# Research: Operis MVP Foundation and Dashboard

## Decision 1: Source workspace context from shared Inertia props

- **Decision**: Use one server-side workspace resolver shared through `app/Http/Middleware/HandleInertiaRequests.php` to expose authenticated shell data on every workspace page.
- **Rationale**: Header, sidebar, quick actions, company switcher, and role-aware visibility are shell-level concerns and should not be duplicated in every page response.
- **Alternatives considered**: Per-page controllers for all shell data were rejected because they duplicate logic; client-only workspace state was rejected because role/company context is authoritative and security-sensitive.

## Decision 2: Persist the active company in authenticated server state

- **Decision**: Keep the active company context in authenticated server-side state and expose a dedicated authenticated company-switch route.
- **Rationale**: The user can belong to multiple companies and role changes with the active company membership, so the selected company must survive navigation and feed all later Inertia responses consistently.
- **Alternatives considered**: URL-only company context was rejected for this PR because it adds routing complexity across all workspace pages; client-local storage was rejected because it weakens role consistency and shared-data behavior.

## Decision 3: Keep shell props shared, but keep dashboard data page-specific

- **Decision**: Share only durable workspace-level props globally and keep dashboard datasets, filter selections, and overview payloads page-specific.
- **Rationale**: Global props should answer “what does the shell need on every authenticated screen?”, while dashboard data should remain isolated to the overview page to keep payloads smaller and responsibilities clearer.
- **Alternatives considered**: Sharing all dashboard data globally was rejected because it bloats unrelated responses; computing dashboard state fully on the client was rejected because it weakens contract testing.

## Decision 4: Use a dedicated mocked dashboard provider/view model

- **Decision**: Replace inline route props with a dedicated controller plus a small mock provider that returns a normalized overview page payload.
- **Rationale**: Day 2 already needs metrics, charts, filters, recent activity, and empty-state handling; one source of mock truth is easier to evolve and later replace with real data.
- **Alternatives considered**: Large arrays in `routes/web.php` were rejected because they will become brittle; seeded database demo data was rejected because this slice is still visual-first and does not need persistence for module content.

## Decision 5: Represent period selection as explicit query state

- **Decision**: Represent dashboard filter selection with a small query contract (`period` and `from`/`to` when custom), while keeping KPI/chart mode as presentation-level state unless deeper linking becomes necessary during implementation.
- **Rationale**: Query-based period filters are easy to test, bookmark, and validate through feature tests; keeping the mode lightweight avoids unnecessary server branching.
- **Alternatives considered**: Fully local filter state was rejected because it is harder to test and share; placing both filter and mode in server state was rejected because it adds complexity without clear Day 1/2 value.

## Decision 6: Create real routes for all visible modules

- **Decision**: Every visible top-level module gets a real authenticated route now; implemented modules render real pages and deferred modules render placeholder pages inside the same workspace shell.
- **Rationale**: The spec requires a complete navigable product structure, and clickable placeholders preserve continuity without pretending deferred modules are finished.
- **Alternatives considered**: Disabled menu items were rejected because they weaken navigation validation; redirecting unfinished modules to the dashboard was rejected because it creates misleading UX and poor breadcrumbs.

## Decision 7: Use Wayfinder as the single routing source in React

- **Decision**: All internal workspace navigation and actions should use Wayfinder-generated helpers instead of hardcoded URLs.
- **Rationale**: The project already uses generated `@/routes` helpers, and this feature adds a large set of linked destinations, including company switching and placeholders that must remain refactor-safe.
- **Alternatives considered**: Hardcoded string URLs were rejected because they drift from Laravel routes; passing route URLs through page props was rejected because Wayfinder already solves that boundary cleanly.

## Decision 8: Keep automated coverage focused on server-driven contracts

- **Decision**: Use Pest feature tests for auth protection, route accessibility, Inertia component selection, role/company-aware prop contracts, and placeholder accessibility.
- **Rationale**: These are stable, high-value behaviors that fit the current project test setup and guard against regression without needing browser tooling.
- **Alternatives considered**: Manual-only verification was rejected because route/prop regressions are cheap to automate; snapshot-heavy visual assertions were rejected because mocked UI content will still evolve.

## Decision 9: Defer visual fidelity to quickstart/manual validation

- **Decision**: Responsive layout, KPI/chart toggling feel, quick-action dropdown behavior, and placeholder UX should be validated through a short reviewer quickstart/manual smoke flow.
- **Rationale**: This slice is layout-heavy and demonstration-focused, and the project does not yet have browser automation in place for DOM/CSS validation.
- **Alternatives considered**: Introducing browser automation inside this PR was rejected as out of scope for the foundation slice.

## Decision 10: Document UI contracts, not component internals

- **Decision**: Document two explicit contracts: workspace navigation/company-switch behavior and overview page prop/filter behavior.
- **Rationale**: In a Laravel + Inertia application, the most important boundary is the server-to-page payload and the route/query contract that the frontend consumes.
- **Alternatives considered**: Component-level documentation was rejected because it would be noisy and likely to age poorly before the next module PRs land.
