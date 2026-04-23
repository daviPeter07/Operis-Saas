# Data Model: Operis MVP Foundation and Dashboard

## Overview

This feature slice does not implement the full Operis domain yet. It designs the minimum data and view-model structures needed for:

- authenticated workspace shell
- company switching
- role-aware navigation and team visibility rules
- quick actions
- overview dashboard KPI/chart presentation
- placeholder module routing

## Entities

### Company

- **Purpose**: Represents one tenant/company context inside Operis.
- **Source**: Derived from the `EMPRESA` specification in `docs/especificacoes_operis_mvp.txt`.
- **Key fields**:
  - `id_empresa`
  - `nome_empresa`
  - `email`
  - `telefone`
  - `cpf_cnpj`
  - `logo`
  - `cor_primaria`
  - `cor_secundaria`
  - address fields (`cep`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `referencia`)
  - `criado_em`
  - `atualizado_em`
- **Validation notes**:
  - `id_empresa` must be unique.
  - `nome_empresa` is required for switcher and branding.
  - Brand assets may be partially absent, but the shell must still render a fallback identity.
- **Relationships**:
  - one company has many `CompanyMembership` records
  - one company scopes many `NavigationModule` visibility decisions
  - one company scopes one visible `WorkspaceContext` at a time per user session

### User

- **Purpose**: Represents the signed-in person using the workspace.
- **Source**: Derived from the `USUÁRIO / EQUIPE` specification.
- **Key fields**:
  - `id_usuario`
  - `nome`
  - `email`
  - `status`
  - `foto`
  - `avatar`
  - `criado_em`
  - `atualizado_em`
- **Validation notes**:
  - identity is stable across companies
  - role is not global for this feature and must not be stored only as one flat value in the workspace contract
- **Relationships**:
  - one user has many `CompanyMembership` records

### CompanyMembership

- **Purpose**: Represents the relationship between a user and a company, including the role used in that company context.
- **Source**: Implied by the multi-company clarification and the `id_empresa` linkage in the entity document.
- **Key fields**:
  - `user_id`
  - `company_id`
  - `role` (`admin`, `supervisor`, `user`)
  - membership display metadata needed for switcher presentation
- **Validation notes**:
  - a user may have multiple memberships
  - each membership carries exactly one active role for that company context
  - switching company must also switch the effective role for the workspace
- **Relationships**:
  - many memberships belong to one `User`
  - many memberships belong to one `Company`

### WorkspaceContext

- **Purpose**: Shared shell-level view model used by every authenticated screen.
- **Key fields**:
  - `currentCompany`
  - `availableCompanies`
  - `currentMembership`
  - `navigation`
  - `quickActions`
  - `teamAccessMode`
- **Validation notes**:
  - must be lightweight enough to share with every authenticated response
  - must not include heavy dashboard payloads
- **Relationships**:
  - resolved from `User` + `CompanyMembership` + `Company`

### NavigationModule

- **Purpose**: Represents one top-level sidebar destination.
- **Key fields**:
  - `key`
  - `label`
  - `routeName`
  - `status` (`implemented`, `placeholder`)
  - `visibilityByRole`
  - `isCurrent`
- **Validation notes**:
  - every module planned for the product appears in navigation in this slice
  - modules outside Day 1/2 must still resolve to valid placeholder routes

### QuickAction

- **Purpose**: Represents one high-priority creation shortcut in the workspace header.
- **Key fields**:
  - `key`
  - `label`
  - `targetRoute`
  - `visibilityByRole`
- **Validation notes**:
  - actions are shell-level and reused across authenticated screens
  - Day 1 scope requires visual access for client, product, sale, purchase, expense, and brand creation shortcuts

### TeamAccessRule

- **Purpose**: Encodes how each role may interact with the team area.
- **Key fields**:
  - `role`
  - `canViewTeam`
  - `canManagePeople`
  - `managementFallback`
- **Rules**:
  - `admin`: full view and management
  - `supervisor`: view allowed, management reroutes to admin-request path
  - `user`: view allowed, management unavailable

### AdminRequestPath

- **Purpose**: View-level contract for how blocked supervisor team-management actions are handled.
- **Key fields**:
  - `sourceAction`
  - `message`
  - `destination`
  - `requestType`
- **Validation notes**:
  - this slice only needs a visual/admin-request path, not a persisted approval workflow yet

### DashboardOverview

- **Purpose**: Page-level view model for the overview dashboard.
- **Key fields**:
  - `selectedPeriod`
  - `availablePeriods`
  - `metrics`
  - `charts`
  - `recentActivity`
  - `emptyStateFlags`
- **Validation notes**:
  - server should own the payload shape
  - payload must support mocked data and empty/fallback states

### OverviewMetric

- **Purpose**: Represents one KPI card shown in dashboard KPI mode.
- **Key fields**:
  - `key`
  - `label`
  - `value`
  - `comparison`
  - `trendDirection`
- **Required metrics**:
  - `vendas`
  - `lucro`
  - `contas_a_receber`
  - `contas_a_pagar`

### DashboardChart

- **Purpose**: Represents one chart dataset shown in chart mode.
- **Key fields**:
  - `key`
  - `label`
  - `series`
  - `xAxis`
  - `emptyStateMessage`
- **Required chart groups**:
  - sales over time
  - profit over time
  - accounts payable vs accounts receivable

### ActivityItem

- **Purpose**: Represents one recent activity entry shown in the overview feed.
- **Key fields**:
  - `id`
  - `type`
  - `title`
  - `description`
  - `timestamp`
  - `companyContext`

### PeriodFilter

- **Purpose**: Represents the active overview filter state.
- **Key fields**:
  - `period` (`last_7_days`, `last_month`, `last_3_months`, `last_year`, `all`, `custom`)
  - `from` (only when custom)
  - `to` (only when custom)
- **Validation notes**:
  - `from` and `to` are only meaningful when `period = custom`
  - unsupported values should fall back to a safe default period

### PlaceholderModulePage

- **Purpose**: Represents the placeholder page state for modules outside this PR’s scope.
- **Key fields**:
  - `moduleKey`
  - `moduleLabel`
  - `statusMessage`
  - `availableNextStep`
- **Validation notes**:
  - must preserve workspace shell, breadcrumbs, and orientation
  - must clearly communicate that the module is coming in a future PR

## State Transitions

### Active Company Context

- `membership A active` -> user switches company -> `membership B active`
- Side effects:
  - role changes with membership if needed
  - workspace branding updates
  - nav visibility updates
  - dashboard data context updates

### Team Access Behavior

- `admin` -> team management available
- `supervisor` -> team view available -> management action -> admin-request path
- `user` -> team view available -> management action hidden or unavailable

### Overview Dashboard View

- `period changed` -> overview payload refreshes
- `mode changed` -> KPI or chart presentation changes without changing the selected period
- `empty period` -> same contract shape remains, but metrics/charts/activity expose empty-state messaging
