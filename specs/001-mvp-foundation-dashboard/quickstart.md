# Quickstart: Operis MVP Foundation and Dashboard

## Goal

Validate the Day 1 and Day 2 slice after implementation: authenticated workspace shell, company switching, role-aware navigation, quick actions, overview dashboard, and placeholder modules.

## Prerequisites

- working `.env`
- database available
- dependencies installed

## Setup

```bash
php artisan migrate --no-interaction
php artisan db:seed --class=WorkspaceDemoSeeder --no-interaction
composer run dev
```

If the project is run with separate terminals instead of `composer run dev`, use:

```bash
php artisan serve
npm run dev
```

## Automated Confidence Checks

```bash
vendor/bin/pint --dirty --format agent
npm run types:check
npm run build
php artisan test --compact tests/Feature
```

## Manual Reviewer Flow

1. Sign in with a seeded demo account.
2. Confirm the authenticated workspace renders a header, sidebar, quick actions, and the overview landing page.
3. Open the company switcher and change to another linked company.
4. Confirm branding, active role context, and visible module actions update after switching.
5. Validate role behavior using seeded accounts or memberships:
   - `admin`: sees full workspace, including settings
   - `supervisor`: can view team but management actions route to admin-request behavior
   - `user`: can access exposed module CRUD flows, can view team, but cannot manage team or access settings/personalization
6. On the overview page, switch between KPI mode and chart mode.
7. Apply every supported period filter, including one custom range.
8. Confirm metrics, charts, and recent activity update together for each filter state.
9. Open at least one deferred module from the sidebar and confirm it loads a navigable placeholder page with `em breve` messaging.
10. Repeat the main workspace flow on representative desktop and mobile widths.

## Reviewer Notes

- Module content outside Day 1 and Day 2 is intentionally placeholder-only in this PR.
- Financial and activity data is mocked for demonstration.
- Company switching and role switching are expected to affect visible navigation and available actions immediately.
