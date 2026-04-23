# Tasks: Operis MVP Foundation and Dashboard

## Phase Handoff Rule

- Antes de iniciar qualquer fase nova, apresentar um resumo objetivo do que foi concluído na fase anterior.
- Antes de iniciar qualquer fase nova, apresentar o escopo objetivo do que será executado na fase seguinte.
- Nãoavançar automaticamente de uma fase para outra sem essatransiçãoexplícita no update.
- Ordem esperada de handoff: `fase concluída -> resumo -> resumo do que será feito -> continuidade`.

**Stack**: Laravel 13 + Inertia React 3 + Wayfinder + Tailwind CSS 4 + TanStack Query

**Arquitetura**: SSR via Inertia (padrão), Cache local (TanStack Query), Query params via Inertia, Quick Actions como modais

**Data-Model**: Tipos separados em `resources/js/types/*.ts` por módulo

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story (`US1`, `US2`, `US3`)
- Incluir caminhos de arquivo exatos

## Path Conventions

- Pages: `resources/js/pages/dashboard/{modulo}.tsx`
- Features: `resources/js/components/features/dashboard/{modulo}/*.tsx`
- Tipos: `resources/js/types/{modulo}.ts`
- Mock: `resources/js/lib/mocks/*.ts`
- Hooks: `resources/js/hooks/*.ts`

---

## Phase 1: Setup (Types, Cache e Scaffold)

**Purpose**: Criar tipos, configurar TanStack Query e scaffold de pages/placeholder.

- [ ] T001 Criar tipos em `resources/js/types/workspace.ts`, `resources/js/types/dashboard.ts` e atualizar `resources/js/types/index.ts`
- [ ] T002 [P] Configurar TanStack Query provider em `resources/js/lib/query-provider.tsx` e integrar no app
- [ ] T003 [P] Criar scaffold de pages placeholder em `resources/js/pages/dashboard/clients.tsx`, `sales.tsx`, `suppliers.tsx`, `products.tsx`, `categories.tsx`, `brands.tsx`, `inventory.tsx`, `purchases.tsx`, `accounts-receivable.tsx`, `accounts-payable.tsx`, `team.tsx`, `reports.tsx`, `settings.tsx`

**Checkpoint**: Tipos criados, cache configurado, todas as pages de módulos prontas (vazias/placeholder).

---

## Phase 2: Shell (Workspace Context e Layout)

**Purpose**: Implementar o shell base com workspace context e cache provider.

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar até estar completo.

- [ ] T004 Criar dados mock em `resources/js/lib/mocks/workspace-mocks.ts` (empresa atual, lista de empresas, membership, role do usuário)
- [ ] T005 [P] Criar workspace context provider em `resources/js/components/features/dashboard/workspace-context.tsx`
- [ ] T006 Criar hook de cache com TanStack Query em `resources/js/hooks/use-workspace.ts`
- [ ] T007 Atualizar `resources/js/components/app-sidebar.tsx` com mapa de módulos Operis (todos os 14 módulos)
- [ ] T008 [P] Criar company switcher modal em `resources/js/components/features/dashboard/layout/company-switcher-modal.tsx`
- [ ] T009 [P] Criar quick actions modal em `resources/js/components/features/dashboard/layout/quick-actions-modal.tsx`
- [ ] T010 Integrar workspace context no `resources/js/layouts/app-layout.tsx` e `resources/js/layouts/app/app-sidebar-layout.tsx`

**Checkpoint**: Shell pronto, empresa selecionada visual, quick actions funcionando.

---

## Phase 3: User Story 1 - Dashboard Overview (Priority: P1) 🎯 MVP

**Goal**: Entregar a Overview com KPI mode, chart mode, filtros de período e atividade recente.

**Independent Test**: Abrir dashboard, trocar entre KPI/Chart, aplicar filtros evalidar atualização dos dados.

### Implementation for User Story 1

- [ ] T011 [US1] Criar dados mock em `resources/js/lib/mocks/dashboard-mocks.ts`
- [ ] T012 [P] [US1] Build `features/dashboard/overview/period-filter.tsx`
- [ ] T013 [P] [US1] Build `features/dashboard/overview/view-switcher.tsx`
- [ ] T014 [P] [US1] Build `features/dashboard/overview/metrics-grid.tsx`
- [ ] T015 [P] [US1] Build `features/dashboard/overview/charts-panel.tsx`
- [ ] T016 [P] [US1] Build `features/dashboard/overview/recent-activity.tsx`
- [ ] T017 [US1] Build `features/dashboard/overview/index.tsx` (organiza as sub-seções)
- [ ] T018 [US1] Consumir dados mock no `resources/js/pages/dashboard/index.tsx` via TanStack Query
- [ ] T019 [US1] Conectar filtros de período via Inertia query params (useSearchParams)

**Checkpoint**: Dashboard overview funcional com KPI, Chart, filtros e activity.

---

## Phase 4: User Story 2 - Placeholder Modules (Priority: P2)

**Goal**: Criar páginas placeholder para os módulos fora do escopo do MVP mas que precisam aparecer na sidebar.

**Independent Test**: Clicar em qualquer módulo e chegar numa página com placeholder navegável.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Build `features/dashboard/clients/index.tsx` (placeholder content)
- [ ] T021 [P] [US2] Build `features/dashboard/sales/index.tsx` (placeholder content)
- [ ] T022 [P] [US2] Build `features/dashboard/suppliers/index.tsx` (placeholder content)
- [ ] T023 [P] [US2] Build `features/dashboard/products/index.tsx` (placeholder content)
- [ ] T024 [P] [US2] Build `features/dashboard/categories/index.tsx` (placeholder content)
- [ ] T025 [P] [US2] Build `features/dashboard/brands/index.tsx` (placeholder content)
- [ ] T026 [P] [US2] Build `features/dashboard/inventory/index.tsx` (placeholder content)
- [ ] T027 [P] [US2] Build `features/dashboard/purchases/index.tsx` (placeholder content)
- [ ] T028 [P] [US2] Build `features/dashboard/accounts-receivable/index.tsx` (placeholder content)
- [ ] T029 [P] [US2] Build `features/dashboard/accounts-payable/index.tsx` (placeholder content)
- [ ] T030 [P] [US2] Build `features/dashboard/team/index.tsx` (placeholder content)
- [ ] T031 [P] [US2] Build `features/dashboard/reports/index.tsx` (placeholder content)
- [ ] T032 [P] [US2] Build `features/dashboard/settings/index.tsx` (placeholder content)

### Wire nas Pages

- [ ] T033 [US2] Conectar clients.tsx → `features/dashboard/clients/index.tsx`
- [ ] T034 [US2] Conectar sales.tsx → `features/dashboard/sales/index.tsx`
- [ ] T035 [US2] Conectar suppliers.tsx → `features/dashboard/suppliers/index.tsx`
- [ ] T036 [US2] Conectar products.tsx → `features/dashboard/products/index.tsx`
- [ ] T037 [US2] Conectar categories.tsx → `features/dashboard/categories/index.tsx`
- [ ] T038 [US2] Conectar brands.tsx → `features/dashboard/brands/index.tsx`
- [ ] T039 [US2] Conectar inventory.tsx → `features/dashboard/inventory/index.tsx`
- [ ] T040 [US2] Conectar purchases.tsx → `features/dashboard/purchases/index.tsx`
- [ ] T041 [US2] Conectar accounts-receivable.tsx → `features/dashboard/accounts-receivable/index.tsx`
- [ ] T042 [US2] Conectar accounts-payable.tsx → `features/dashboard/accounts-payable/index.tsx`
- [ ] T043 [US2] Conectar team.tsx → `features/dashboard/team/index.tsx`
- [ ] T044 [US2] Conectar reports.tsx → `features/dashboard/reports/index.tsx`
- [ ] T045 [US2] Conectar settings.tsx → `features/dashboard/settings/index.tsx`

**Checkpoint**: Todos os 14 módulos navegáveis, cada um com sua página placeholder.

---

## Phase 5: User Story 3 - Role-Aware e Company-Aware (Priority: P3)

**Goal**: Workspace adapta por empresa e role ativa,team area e restrição de settings.

**Independent Test**: Trocar empresa e verificar visibilidade correta sem novo login.

### Implementation for User Story 3

- [ ] T046 [US3] Implementar role-aware navigation em `workspace-context.tsx` (admin vs supervisor vs user)
- [ ] T047 [P] [US3] Aplicar company branding em `app-logo.tsx` e `company-switcher-modal.tsx`
- [ ] T048 [P] [US3] Criar team page content em `features/dashboard/team/team-page-content.tsx`
- [ ] T049 [US3] Criar admin-request page em `features/dashboard/team/admin-request-page.tsx`
- [ ] T050 [US3] Atualizar routing em `routes/web.php` para refletir role-based access

**Checkpoint**: Todas as stories funcionam independentemente.

---

## Phase 6: Polish & Validation

- [ ] T051 [P] Rodar `npm run types:check` e `npm run build`
- [ ] T052 Rodar `vendor/bin/pint --dirty --format agent`
- [ ] T053 Validar reviewer flow em `quickstart.md`

---

## Dependencies

- **Phase 1**: Setup → pode começar
- **Phase 2**: Depende de Phase 1 → bloqueia até completar
- **Phase 3**: Depende de Phase 2 → dashboard overview
- **Phase 4**: Depende de Phase 2 → placeholder modules
- **Phase 5**: Depende de Phase 2 → role-aware
- **Phase 6**: Validation final

---

## Notes

- Todos os dados são mock locally via TanStack Query
- SSR via Inertia (padrão)
- Query params via Inertia useSearchParams
- Quick Actions = modais, não rotas
- Arquivos de tipos em `resources/js/types/` por módulo
- Estrutura de features espelha estrutura de pages