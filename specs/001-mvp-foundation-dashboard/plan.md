# Implementation Plan: Operis MVP Foundation and Dashboard

**Branch**: `[001-mvp-foundation-dashboard]` | **Date**: 2026-04-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-foundation-dashboard/spec.md`

**Note**: This plan covers the Day 1 and Day 2 slice of the Operis MVP: authenticated workspace shell, multi-company role-aware navigation, quick actions, overview dashboard, and placeholder routes for the remaining modules.

## Summary

Replace the current minimal authenticated experience with a real workspace shell that supports company switching, per-company roles, quick actions, and a demo-ready overview dashboard. The backend will own shell context and mocked dashboard payloads through Laravel + Inertia, while the React frontend will consume typed page props and Wayfinder-generated routes for navigation, company switching, placeholders, and future module expansion.

## Technical Context

**Language/Version**: PHP 8.5 with TypeScript 5.7 / React 19 via Inertia v3  
**Primary Dependencies**: Laravel 13, Inertia.js React 3, Laravel Fortify 1, Laravel Wayfinder, Tailwind CSS 4, Pest 4  
**Storage**: PostgreSQL for application/auth/session data; mocked workspace and dashboard view models for this feature slice  
**Testing**: Pest feature tests, TypeScript `tsc --noEmit`, Vite production build  
**Target Platform**: Server-rendered web application for modern desktop, tablet, and mobile browsers  
**Project Type**: Laravel monolith web application with Inertia-driven React frontend  
**Performance Goals**: Demo routes render in under 1 second on mocked datasets; company switching and period changes feel immediate; no broken layout at representative mobile/tablet/desktop widths  
**Constraints**: Keep all modules visible in navigation, use placeholder pages for out-of-scope modules, keep role scoped per company membership, use Wayfinder instead of hardcoded frontend URLs, preserve existing project structure, avoid dependency changes, and keep deferred modules visual-only  
**Scale/Scope**: One PR covering authenticated shell, multi-company selector, role-aware navigation, quick-action entry points, overview dashboard KPI/chart modes, filterable mocked dashboard data, and placeholder destinations for the remaining top-level modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file `.specify/memory/constitution.md` is still an unfilled template, so it defines no enforceable project-specific gates yet. Status: PASS with no constitutional blockers.
- Effective repository governance still comes from `AGENTS.md` and Laravel Boost rules: use Laravel 13/Inertia 3/Wayfinder/Pest/Pint conventions, keep changes inside the existing monolith structure, do not add dependencies, and verify with tests/builds. Status: PASS.
- Post-design re-check: planned artifacts stay inside the existing Laravel monolith (`routes/`, `app/`, `resources/js/`, `tests/`) and do not require exceptions to current repo governance. Status: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-foundation-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── workspace-navigation.md
│   └── dashboard-page-props.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── Http/
│   └── Middleware/
├── Models/
└── Providers/

routes/
└── web.php

resources/js/
├── app.tsx
├── components/
│   ├── features/
│   └── ui/
├── hooks/
├── layouts/
├── lib/
├── pages/
└── routes/

tests/
├── Feature/
└── Pest.php
```

**Structure Decision**: Keep the existing Laravel monolith structure. Backend work stays in `routes/web.php`, `app/Http/Middleware/HandleInertiaRequests.php`, and new dedicated controllers/actions/providers as needed. Frontend work stays in `resources/js/pages`, `resources/js/components/features`, `resources/js/layouts`, `resources/js/hooks`, and Wayfinder-generated route helpers under `resources/js/routes`. Feature verification stays primarily in `tests/Feature` with Pest.

## Phase 0 Research Output

- See [research.md](./research.md) for decisions on shell context sourcing, company switching, placeholder routing, Wayfinder usage, mocked dashboard payloads, and review/test strategy.

## Phase 1 Design Output

- See [data-model.md](./data-model.md) for workspace, membership, dashboard, and placeholder entities.
- See [contracts/workspace-navigation.md](./contracts/workspace-navigation.md) and [contracts/dashboard-page-props.md](./contracts/dashboard-page-props.md) for the Laravel ↔ Inertia ↔ React contracts.
- See [quickstart.md](./quickstart.md) for reviewer validation steps and demo flow.

## Complexity Tracking

No constitution or repository-governance violations require justification for this plan.
