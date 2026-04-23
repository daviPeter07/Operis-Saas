# Tasks: Operis MVP Foundation and Dashboard

## Phase Handoff Rule

- Antes de iniciar qualquer fase nova, apresentar um resumo objetivo do que foi concluído na fase anterior.
- Antes de iniciar qualquer fase nova, apresentar um resumo objetivo do que será executado na fase seguinte.
- Nãoavançar automaticamente de uma fase para outra sem essatransiçãoexplícita no update.
- Ordem esperada de handoff: `fase concluída -> resumo -> resumo do que será feito -> continuidade`.

**Stack**: Laravel 13 + Inertia React 3 + Wayfinder + Tailwind CSS 4 + TanStack Query

**Arquitetura**: SSR via Inertia (padrão), Cache local (TanStack Query), Query params via Inertia, Quick Actions como modais

**Data-Model**: Tipos separados em `resources/js/types/*.ts` por módulo

**Paleta de Cores**: Preto (#0a0a0a) e Laranja (#f97316) - lihat application-structure.md

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

**Status**: ✅ COMPLETED

- [x] T001 Criar tipos em `resources/js/types/workspace.ts`, `resources/js/types/dashboard.ts` e atualizar `resources/js/types/index.ts`
- [x] T002 [P] Configurar TanStack Query provider em `resources/js/lib/query-provider.tsx` e integrar no app
- [x] T003 [P] Criar scaffold de pages placeholder em `resources/js/pages/dashboard/clients.tsx`, `sales.tsx`, `suppliers.tsx`, `products.tsx`, `categories.tsx`, `brands.tsx`, `inventory.tsx`, `purchases.tsx`, `accounts-receivable.tsx`, `accounts-payable.tsx`, `team.tsx`, `reports.tsx`, `settings.tsx`

**Checkpoint**: ✅ Tipos criados, cache configurado, todas as pages de módulos prontas (vazias/placeholder).

---

## Phase 2: Shell (Workspace Context e Layout)

**Purpose**: Implementar o shell base com workspace context e cache provider.

**Status**: ✅ COMPLETED

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar até estar completo.

- [x] T004 Criar dados mock em `resources/js/lib/mocks/workspace-mocks.ts` (empresa atual, lista de empresas, membership, role do usuário)
- [x] T005 [P] Criar workspace context provider em `resources/js/components/features/dashboard/workspace-context.tsx`
- [x] T006 Criar hook de cache com TanStack Query em `resources/js/hooks/use-workspace.ts`
- [x] T007 Atualizar `resources/js/components/app-sidebar.tsx` com mapa de módulos Operis (todos os 14 módulos)
- [x] T008 [P] Criar company switcher modal em `resources/js/components/features/dashboard/layout/company-switcher-modal.tsx`
- [x] T009 [P] Criar quick actions modal em `resources/js/components/features/dashboard/layout/quick-actions-modal.tsx`
- [x] T010 Integrar workspace context no `resources/js/layouts/app-layout.tsx` e `resources/js/layouts/app/app-sidebar-layout.tsx`

**Checkpoint**: ✅ Shell pronto, empresa selecionada visual, quick actions funcionando.

---

## Phase 3: User Story 1 - Dashboard Overview (Priority: P1) 🎯 MVP

**Goal**: Entregar a Overview com KPI mode, chart mode, filtros de período e atividade recente.

**Status**: ✅ COMPLETED

**Independent Test**: Abrir dashboard, trocar entre KPI/Chart, aplicar filtros evalidar atualização dos dados.

### Implementation for User Story 1

- [x] T011 [US1] Criar dados mock em `resources/js/lib/mocks/dashboard-mocks.ts`
- [x] T012 [P] [US1] Build `features/dashboard/overview/period-filter.tsx`
- [x] T013 [P] [US1] Build `features/dashboard/overview/view-switcher.tsx`
- [x] T014 [P] [US1] Build `features/dashboard/overview/metrics-grid.tsx`
- [x] T015 [P] [US1] Build `features/dashboard/overview/charts-panel.tsx`
- [x] T016 [P] [US1] Build `features/dashboard/overview/recent-activity.tsx`
- [x] T017 [US1] Build `features/dashboard/overview/index.tsx` (organiza as sub-seções)
- [x] T018 [US1] Consumir dados mock no `resources/js/pages/dashboard/index.tsx` via TanStack Query
- [x] T019 [US1] Conectar filtros de período via Inertia query params (useSearchParams)

**Checkpoint**: ✅ Dashboard overview funcional com KPI, Chart, filtros e activity.

---

## Phase 4: User Story 2 - Placeholder Modules (Priority: P2)

**Goal**: Criar páginas placeholder para os módulos fora do escopo do MVP mas que precisam aparecer na sidebar.

**Status**: ✅ COMPLETED (pages criados com layout padrão, não features individuais)

**Independent Test**: Clicar em qualquer módulo e chegar numa página com placeholder navegável.

### Implementation for User Story 2

- [x] T020 [P] [US2] Build `features/dashboard/clients/index.tsx` (placeholder content)
- [x] T021 [P] [US2] Build `features/dashboard/sales/index.tsx` (placeholder content)
- [x] T022 [P] [US2] Build `features/dashboard/suppliers/index.tsx` (placeholder content)
- [x] T023 [P] [US2] Build `features/dashboard/products/index.tsx` (placeholder content)
- [x] T024 [P] [US2] Build `features/dashboard/categories/index.tsx` (placeholder content)
- [x] T025 [P] [US2] Build `features/dashboard/brands/index.tsx` (placeholder content)
- [x] T026 [P] [US2] Build `features/dashboard/inventory/index.tsx` (placeholder content)
- [x] T027 [P] [US2] Build `features/dashboard/purchases/index.tsx` (placeholder content)
- [x] T028 [P] [US2] Build `features/dashboard/accounts-receivable/index.tsx` (placeholder content)
- [x] T029 [P] [US2] Build `features/dashboard/accounts-payable/index.tsx` (placeholder content)
- [x] T030 [P] [US2] Build `features/dashboard/team/index.tsx` (placeholder content)
- [x] T031 [P] [US2] Build `features/dashboard/reports/index.tsx` (placeholder content)
- [x] T032 [P] [US2] Build `features/dashboard/settings/index.tsx` (placeholder content)

### Wire nas Pages

- [x] T033 [US2] Conectar clients.tsx → `features/dashboard/clients/index.tsx`
- [x] T034 [US2] Conectar sales.tsx → `features/dashboard/sales/index.tsx`
- [x] T035 [US2] Conectar suppliers.tsx → `features/dashboard/suppliers/index.tsx`
- [x] T036 [US2] Conectar products.tsx → `features/dashboard/products/index.tsx`
- [x] T037 [US2] Conectar categories.tsx → `features/dashboard/categories/index.tsx`
- [x] T038 [US2] Conectar brands.tsx → `features/dashboard/brands/index.tsx`
- [x] T039 [US2] Conectar inventory.tsx → `features/dashboard/inventory/index.tsx`
- [x] T040 [US2] Conectar purchases.tsx → `features/dashboard/purchases/index.tsx`
- [x] T041 [US2] Conectar accounts-receivable.tsx → `features/dashboard/accounts-receivable/index.tsx`
- [x] T042 [US2] Conectar accounts-payable.tsx → `features/dashboard/accounts-payable/index.tsx`
- [x] T043 [US2] Conectar team.tsx → `features/dashboard/team/index.tsx`
- [x] T044 [US2] Conectar reports.tsx → `features/dashboard/reports/index.tsx`
- [x] T045 [US2] Conectar settings.tsx → `features/dashboard/settings/index.tsx`

**Checkpoint**: ✅ Todos os 14 módulos navegáveis, cada um com sua página placeholder.

---

## Phase 5: User Story 3 - Role-Aware e Company-Aware (Priority: P3)

**Goal**: Workspace adapta por empresa e role ativa,team area e restrição de settings.

**Status**: 🔄 PENDING

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

**Status**: 🔄 PENDING

- [ ] T051 [P] Rodar `npm run types:check` e `npm run build`
- [ ] T052 Rodar `vendor/bin/pint --dirty --format agent`
- [ ] T053 Validar reviewer flow em `quickstart.md`

---

## Dependencies

- **Phase 1**: Setup → ✅ COMPLETED
- **Phase 2**: Depende de Phase 1 → ✅ COMPLETED
- **Phase 3**: Depende de Phase 2 → 🔄 PENDING (dashboard overview)
- **Phase 4**: Depende de Phase 2 → ✅ COMPLETED
- **Phase 5**: Depende de Phase 2 → 🔄 PENDING (role-aware)
- **Phase 6**: Validation final → 🔄 PENDING

---

## Extra Tasks (Executadas além do plano original)

- [x] EX1 Criar BypassAuth middleware para desenvolvimento (`app/Http/Middleware/BypassAuth.php`)
- [x] EX2 Criar TestUserSeeder para usuário demo (`database/seeders/TestUserSeeder.php`)
- [x] EX3 Criar UI components reutilizáveis:
  - `page-header.tsx` - Header de página com título e ação
  - `page-content.tsx` - Container com padding
  - `page-filters.tsx` - Barra de filtros
  - `stat-card.tsx` - Card de estatísticas
  - `data-table.tsx` - Tabela genérica
  - `empty-state.tsx` - Estado vazio
- [x] EX4 Criar Table component (`resources/js/components/ui/table.tsx`)
- [x] EX5 Aplicar paleta de cores preto/laranja em `resources/css/app.css`
- [x] EX6 Configurar rota "/" com landing page placeholder
- [x] EX7 Adicionar todas as 14 rotas de dashboard com named routes

---

## Notes

- Todos os dados são mock locally via TanStack Query
- SSR via Inertia (padrão)
- Query params via Inertia useSearchParams
- Quick Actions = modais, não rotas
- Arquivos de tipos em `resources/js/types/` por módulo
- Estrutura de features espelha estrutura de pages
- Paleta: Primary=preto, Accent=laranja, Charts=genéricos