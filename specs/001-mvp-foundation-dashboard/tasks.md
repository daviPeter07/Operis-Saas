# Tasks: Operis MVP Foundation and Dashboard

## Phase Handoff Rule

- Antes de iniciar qualquer fase nova, apresentar um resumo objetivo do que foi concluído na fase anterior.
- Antes de iniciar qualquer fase nova, apresentar o escopo objetivo do que sera executado na fase seguinte.
- Nao avancar automaticamente de uma fase para outra sem essa transicao explícita no update ao usuario.
- Ordem esperada de handoff: `fase concluida -> resumo do que foi feito -> resumo do que sera feito na proxima fase -> continuidade da execucao`.

**Input**: Design documents from `/specs/001-mvp-foundation-dashboard/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Include Pest feature coverage for each user story because this feature changes authenticated routing, role-aware visibility, and Inertia page contracts.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Path Conventions

- Laravel backend code lives in `app/`, `routes/`, `database/`, and `tests/`
- Inertia React pages live in `resources/js/pages/`
- Feature-specific React UI lives in `resources/js/components/features/`
- Shared shell components live in `resources/js/components/` and `resources/js/layouts/`
- Wayfinder-generated helpers live in `resources/js/routes/` and `resources/js/actions/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature scaffolding and shared types required before domain and story work starts.

- [ ] T001 Create shared workspace and dashboard type scaffolding in `resources/js/types/workspace.ts`, `resources/js/types/dashboard.ts`, and `resources/js/types/index.ts`
- [ ] T002 Create backend workspace scaffolding in `app/Http/Controllers/Workspace/DashboardController.php`, `app/Http/Controllers/Workspace/PlaceholderModuleController.php`, `app/Http/Controllers/Workspace/CompanySwitchController.php`, and `app/Support/Workspace/WorkspaceResolver.php`
- [ ] T003 [P] Create frontend workspace scaffolding in `resources/js/pages/workspace/module-placeholder.tsx`, `resources/js/components/features/workspace/module-placeholder-page-content.tsx`, `resources/js/components/features/workspace/company-switcher.tsx`, and `resources/js/components/features/workspace/quick-actions-menu.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the shared multi-company and shared-props infrastructure that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create company persistence tables in `database/migrations/*_create_companies_table.php` and `database/migrations/*_create_company_memberships_table.php`
- [ ] T005 [P] Implement `Company` and `CompanyMembership` models in `app/Models/Company.php` and `app/Models/CompanyMembership.php`
- [ ] T006 [P] Create demo factories and seeders in `database/factories/CompanyFactory.php`, `database/factories/CompanyMembershipFactory.php`, `database/seeders/WorkspaceDemoSeeder.php`, and `database/seeders/DatabaseSeeder.php`
- [ ] T007 Implement user-company relationships and active-company resolution in `app/Models/User.php` and `app/Support/Workspace/WorkspaceResolver.php`
- [ ] T008 Implement shared Inertia workspace props and the switch-company action in `app/Http/Middleware/HandleInertiaRequests.php`, `app/Http/Controllers/Workspace/CompanySwitchController.php`, and `routes/web.php`
- [ ] T009 Regenerate Wayfinder helpers for workspace routes in `resources/js/routes/**/*.ts` and `resources/js/actions/**/*.ts`

**Checkpoint**: Multi-company demo data, workspace shared props, and route generation are ready for story work.

---

## Phase 3: User Story 1 - Navigate the authenticated workspace (Priority: P1) 🎯 MVP

**Goal**: Deliver the authenticated Operis shell with header, sidebar, quick actions, and navigable placeholder destinations.

**Independent Test**: Sign in, land on the workspace, open quick actions, navigate across every top-level module, and confirm the shell stays consistent with clear active states and placeholder continuity.

### Tests for User Story 1

> **NOTE**: Write these tests first, ensure they fail before implementation.

- [ ] T010 [P] [US1] Add authenticated workspace navigation coverage in `tests/Feature/Workspace/NavigationTest.php`
- [ ] T011 [P] [US1] Add placeholder destination coverage in `tests/Feature/Workspace/PlaceholderModuleTest.php`

### Implementation for User Story 1

- [ ] T012 [US1] Replace starter navigation with the Operis module map in `resources/js/components/app-sidebar.tsx`, `resources/js/components/nav-main.tsx`, and `resources/js/types/navigation.ts`
- [ ] T013 [P] [US1] Build header quick-action and company-context UI in `resources/js/components/app-header.tsx`, `resources/js/components/features/workspace/company-switcher.tsx`, and `resources/js/components/features/workspace/quick-actions-menu.tsx`
- [ ] T014 [P] [US1] Create placeholder workspace page content in `resources/js/pages/workspace/module-placeholder.tsx` and `resources/js/components/features/workspace/module-placeholder-page-content.tsx`
- [ ] T015 [US1] Register top-level module routes and placeholder rendering in `app/Http/Controllers/Workspace/PlaceholderModuleController.php`, `app/Http/Controllers/Workspace/DashboardController.php`, and `routes/web.php`
- [ ] T016 [US1] Attach the authenticated shell and breadcrumbs to `resources/js/layouts/app-layout.tsx`, `resources/js/pages/dashboard.tsx`, and `resources/js/components/features/dashboard/dashboard-page-content.tsx`

**Checkpoint**: User Story 1 is fully functional and can be demoed as the MVP shell.

---

## Phase 4: User Story 2 - Review business health from the overview dashboard (Priority: P2)

**Goal**: Deliver the overview dashboard with KPI mode, chart mode, period filters, recent activity, and empty-state handling.

**Independent Test**: Open the overview page, switch between KPI and chart modes, apply each period filter including a custom range, and confirm metrics, charts, and activity update together.

### Tests for User Story 2

> **NOTE**: Write these tests first, ensure they fail before implementation.

- [ ] T017 [P] [US2] Add overview contract coverage for filters and payload shape in `tests/Feature/Workspace/DashboardOverviewTest.php`
- [ ] T018 [P] [US2] Add custom-range and empty-state coverage in `tests/Feature/Workspace/DashboardFilterTest.php`

### Implementation for User Story 2

- [ ] T019 [US2] Implement the mocked overview provider and period validation in `app/Support/Dashboard/MockDashboardOverviewProvider.php` and `app/Http/Controllers/Workspace/DashboardController.php`
- [ ] T020 [P] [US2] Build dashboard filter and view-mode controls in `resources/js/components/features/dashboard/dashboard-period-filter.tsx` and `resources/js/components/features/dashboard/dashboard-view-switcher.tsx`
- [ ] T021 [P] [US2] Build KPI, chart, and recent-activity sections in `resources/js/components/features/dashboard/dashboard-metrics-grid.tsx`, `resources/js/components/features/dashboard/dashboard-charts-panel.tsx`, and `resources/js/components/features/dashboard/dashboard-recent-activity.tsx`
- [ ] T022 [US2] Wire the overview page to server props, client-side mode switching, and empty states in `resources/js/pages/dashboard.tsx` and `resources/js/components/features/dashboard/dashboard-page-content.tsx`

**Checkpoint**: User Story 2 works independently on top of the shared shell and supports all required demo filter states.

---

## Phase 5: User Story 3 - Experience role-aware and company-aware presentation (Priority: P3)

**Goal**: Make the workspace adapt by active company and membership role, including team-area behavior, settings restriction, and brand identity changes.

**Independent Test**: Switch between seeded company memberships and role views, confirm branding updates, and verify that team/settings visibility changes correctly without a new sign-in.

### Tests for User Story 3

> **NOTE**: Write these tests first, ensure they fail before implementation.

- [ ] T023 [P] [US3] Add role-aware navigation and settings restriction coverage in `tests/Feature/Workspace/RoleVisibilityTest.php`
- [ ] T024 [P] [US3] Add company-switch and team-access coverage in `tests/Feature/Workspace/CompanySwitchTest.php`

### Implementation for User Story 3

- [ ] T025 [US3] Implement role-aware navigation, quick-action visibility, and team-access rules in `app/Support/Workspace/WorkspaceResolver.php` and `resources/js/types/workspace.ts`
- [ ] T026 [P] [US3] Apply company branding and active-membership presentation in `resources/js/components/app-logo.tsx`, `resources/js/components/app-logo-icon.tsx`, `resources/js/components/app-header.tsx`, and `resources/js/components/features/workspace/company-switcher.tsx`
- [ ] T027 [P] [US3] Create team and admin-request pages in `resources/js/pages/workspace/team.tsx`, `resources/js/components/features/workspace/team-page-content.tsx`, `resources/js/pages/workspace/admin-request.tsx`, and `resources/js/components/features/workspace/admin-request-page-content.tsx`
- [ ] T028 [US3] Enforce role-aware routes for team, admin-request, and settings access in `app/Http/Controllers/Workspace/TeamController.php`, `app/Http/Controllers/Workspace/AdminRequestController.php`, and `routes/web.php`

**Checkpoint**: All user stories are independently functional and the workspace demonstrates multi-company, role-aware behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate, format, and tighten the full Day 1 and Day 2 slice across backend and frontend.

- [ ] T029 [P] Run `vendor/bin/pint --dirty --format agent` and resolve PHP style issues in `app/`, `database/`, and `tests/Feature/Workspace/`
- [ ] T030 [P] Run `npm run types:check` and `npm run build` and resolve frontend issues in `resources/js/**/*.{ts,tsx}` and `resources/css/app.css`
- [ ] T031 Run `php artisan test --compact tests/Feature/Workspace tests/Feature/DashboardTest.php` and fix regressions in `tests/Feature/`
- [ ] T032 Validate the reviewer flow in `specs/001-mvp-foundation-dashboard/quickstart.md` against the implemented workspace demo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories until complete.
- **User Story 1 (Phase 3)**: Depends on Foundational; establishes the MVP shell.
- **User Story 2 (Phase 4)**: Depends on Foundational and reuses the shell from US1 for the overview screen.
- **User Story 3 (Phase 5)**: Depends on Foundational and layers company-role behavior onto the shell.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependency Graph

- `Setup -> Foundational -> US1 -> Polish`
- `Setup -> Foundational -> US2 -> Polish`
- `Setup -> Foundational -> US3 -> Polish`
- Recommended delivery order: `US1 -> US2 -> US3`

### Within Each User Story

- Tests first, and confirm they fail before implementation.
- Backend contract and route work before frontend consumption.
- Shared layout work before page-specific refinement.
- Story-specific validation before moving to the next priority.

### Parallel Opportunities

- `T003` can run while `T002` scaffolds backend files.
- `T005` and `T006` can run in parallel after `T004` defines the persistence plan.
- `T010` and `T011` can run in parallel for US1.
- `T013` and `T014` can run in parallel after US1 tests are written.
- `T017` and `T018` can run in parallel for US2.
- `T020` and `T021` can run in parallel after `T019` locks the dashboard payload.
- `T023` and `T024` can run in parallel for US3.
- `T026` and `T027` can run in parallel after `T025` defines the role/company contract.
- `T029` and `T030` can run in parallel before the final full test pass.

---

## Parallel Example: User Story 1

```bash
# Write both US1 feature tests together
Task: "T010 [US1] Add authenticated workspace navigation coverage in tests/Feature/Workspace/NavigationTest.php"
Task: "T011 [US1] Add placeholder destination coverage in tests/Feature/Workspace/PlaceholderModuleTest.php"

# Build independent US1 UI pieces together
Task: "T013 [US1] Build header quick-action and company-context UI in resources/js/components/app-header.tsx and resources/js/components/features/workspace/*"
Task: "T014 [US1] Create placeholder workspace page content in resources/js/pages/workspace/module-placeholder.tsx and resources/js/components/features/workspace/module-placeholder-page-content.tsx"
```

## Parallel Example: User Story 2

```bash
# Write both US2 dashboard tests together
Task: "T017 [US2] Add overview contract coverage for filters and payload shape in tests/Feature/Workspace/DashboardOverviewTest.php"
Task: "T018 [US2] Add custom-range and empty-state coverage in tests/Feature/Workspace/DashboardFilterTest.php"

# Build independent dashboard UI sections together
Task: "T020 [US2] Build dashboard filter and view-mode controls in resources/js/components/features/dashboard/dashboard-period-filter.tsx and dashboard-view-switcher.tsx"
Task: "T021 [US2] Build KPI, chart, and recent-activity sections in resources/js/components/features/dashboard/*"
```

## Parallel Example: User Story 3

```bash
# Write both US3 access tests together
Task: "T023 [US3] Add role-aware navigation and settings restriction coverage in tests/Feature/Workspace/RoleVisibilityTest.php"
Task: "T024 [US3] Add company-switch and team-access coverage in tests/Feature/Workspace/CompanySwitchTest.php"

# Build independent US3 presentation pages together
Task: "T026 [US3] Apply company branding and active-membership presentation in resources/js/components/app-logo.tsx, app-logo-icon.tsx, app-header.tsx, and company-switcher.tsx"
Task: "T027 [US3] Create team and admin-request pages in resources/js/pages/workspace/* and resources/js/components/features/workspace/*"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate navigation, quick actions, and placeholder continuity before expanding scope.

### Incremental Delivery

1. Finish Setup + Foundational to establish multi-company shared props and route generation.
2. Deliver US1 as the demo-ready workspace shell.
3. Deliver US2 to add the value-heavy dashboard narrative.
4. Deliver US3 to finish company-aware and role-aware behavior.
5. Run Phase 6 validation before opening the PR.

### Parallel Team Strategy

1. One developer handles persistence/shared-props groundwork in Phase 2.
2. One developer can build US1 shell UI while another prepares US2 dashboard sections after Foundation is stable.
3. US3 can begin once the workspace contract is settled and seeded memberships are available.

---

## Notes

- `[P]` tasks are limited to work that can happen on separate files without waiting on incomplete dependencies.
- All visible routes must stay aligned with Wayfinder-generated helpers.
- Keep placeholder modules navigable instead of disabled.
- Keep tests focused on route protection, Inertia component selection, and prop contracts rather than brittle markup snapshots.
