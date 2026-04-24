# Feature Specification: Operis MVP Foundation and Dashboard

**Feature Branch**: `[001-mvp-foundation-dashboard]`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "chat antes de tudo preciso que vc estude a estrutura do nosso projeto em si pra saber regras e tudo mais, precisamos fazer um sistema (por enquanto MVP) que vai ser um sistema de gestao financeira + PDV ok ? eu preciso que pegue sempre como referencia o documento @docs\escopo_mvp_operis.md pegando como base as estrutura que vamos fazer, por momento vamos dar prioridade fazendo PRs de modulo por modulo beleza ? eu quero fazer as features do dia 1 e do dia 2 nesse PR entao vamos começar a estruturar essa tarefa usando boas praticas citadas nas skills que temos no projeto de laravel + react com typescript"

## Clarifications

### Session 2026-04-23

- Q: Qual deve ser o escopo visual da role `user` neste PR? → A: A role `user` pode executar os fluxos visuais de CRUD dos módulos do sistema, mas não pode acessar nem alterar configurações da empresa ou opções de personalização.
- Q: Como `supervisor` e `user` devem se comportar em relação à equipe? → A: O `supervisor` pode ver a equipe, mas qualquer tentativa de gerenciar pessoas deve seguir por uma solicitação ao admin. O `user` não pode gerenciar ninguém e pode apenas visualizar a equipe.
- Q: Como o contexto da empresa deve ser definido no MVP? → A: O usuário pode ter vínculo com mais de uma empresa e deve poder alternar entre empresas mockadas pelo seletor de empresa dentro do workspace.
- Q: A role do usuário muda por empresa ou é global? → A: A role é definida por vínculo com cada empresa, então a mesma pessoa pode ter permissões diferentes ao trocar de contexto.
- Q: Como os módulos fora do escopo deste PR devem aparecer na navegação? → A: Os módulos aparecem no menu e abrem páginas placeholder navegáveis com mensagem de "em breve".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the authenticated workspace (Priority: P1)

As an authenticated Operis user, I want to enter a complete workspace with a clear header, sidebar, and quick actions so that I can understand the product structure and move through the main modules without confusion.

**Why this priority**: The workspace shell and navigation are the foundation for every later module. Without them, the product cannot be demonstrated as a coherent business system.

**Independent Test**: Can be fully tested by signing in, loading the authenticated workspace, opening the quick action menu, and navigating through all top-level module destinations while confirming active states and visual continuity.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user enters the system, **When** the workspace loads, **Then** the user sees the primary header, the full sidebar navigation, and the default overview destination.
2. **Given** an authenticated user is inside the workspace, **When** the user selects different modules from the navigation, **Then** the current section changes and the active destination remains visually clear.
3. **Given** an authenticated user opens the quick action entry point, **When** the dropdown is displayed, **Then** the user sees visual actions for creating a client, product, sale, purchase, expense, and brand.
4. **Given** an authenticated user selects a module planned for later PRs, **When** the destination opens, **Then** the user reaches a placeholder page inside the workspace with a clear "em breve" message.

---

### User Story 2 - Review business health from the overview dashboard (Priority: P2)

As a business stakeholder, I want an overview dashboard with KPI and chart modes so that I can quickly understand sales, profit, receivables, payables, and recent activity during a product demonstration.

**Why this priority**: The overview dashboard is the first value-heavy screen in the MVP and is central to communicating the financial and operational promise of Operis.

**Independent Test**: Can be fully tested by opening the overview area, switching between KPI and chart modes, applying each available period filter, and verifying that the visible dashboard state changes consistently.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on the overview area, **When** the user switches between KPI mode and chart mode, **Then** the dashboard presents the corresponding summary view without leaving the page.
2. **Given** an authenticated user is viewing the dashboard, **When** the user applies a predefined or custom period filter, **Then** the visible metrics, visual comparisons, and recent activity reflect the selected period state.
3. **Given** a stakeholder is reviewing the overview, **When** chart mode is open, **Then** the dashboard displays visual analyses for sales over time, profit over time, and accounts payable versus accounts receivable.

---

### User Story 3 - Experience role-aware and company-aware presentation (Priority: P3)

As a stakeholder evaluating the SaaS model, I want the interface to visibly adapt by company identity and user role so that the product demonstrates multi-company readiness and differentiated access from the earliest MVP slice.

**Why this priority**: Role-aware visibility and company branding strengthen the commercial story of the product and reduce the need to rework the shell when later modules are added.

**Independent Test**: Can be fully tested by switching among supported role views and company branding presets, then confirming that restricted areas are hidden or unavailable and that the visual identity changes consistently across the workspace.

**Acceptance Scenarios**:

1. **Given** an admin user enters the workspace, **When** the navigation is rendered, **Then** the user sees every top-level destination included in this slice, including the settings area.
2. **Given** a supervisor user enters the workspace, **When** the navigation is rendered, **Then** the supervisor can view the team area, cannot access settings, and any people-management action is redirected to an admin-request path.
3. **Given** a user with standard access enters the workspace, **When** the navigation is rendered, **Then** the user can access the visual CRUD flows of the available modules, cannot access company settings or personalization areas, and can only view the team area without management actions.
4. **Given** a user is linked to more than one company, **When** the user changes the selected company in the workspace, **Then** the visible brand identity, company context, and role-specific access update consistently for the newly selected company.

---

### Edge Cases

- What happens when the selected period has no mock data for KPI cards, charts, or recent activity?
- How does the workspace behave when a user attempts to open a visually restricted destination from a saved link or direct URL?
- What happens when a supervisor tries to perform a people-management action from the team area and must be routed to an admin approval request instead of direct control?
- What happens when a user is linked to multiple companies but the currently selected company has a different visible role scope or fewer available destinations?
- What happens when a user changes to another company where the same person has a different role than in the previous context?
- What happens when later-phase modules are present in the navigation but only placeholder destinations exist in this PR?
- How does the workspace preserve orientation when the user moves from a fully implemented area to a placeholder area and back again?
- How does the dashboard behave when the user applies a custom date range that falls outside the mock data coverage?
- What happens when a company identity lacks optional brand assets such as a logo or full color palette?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an authenticated workspace shell with a persistent primary header, sidebar navigation, and content region.
- **FR-002**: The system MUST display all planned top-level Operis modules in the main navigation for demonstration purposes.
- **FR-003**: Users MUST be able to move between top-level module destinations from the primary navigation while retaining a consistent workspace shell.
- **FR-004**: The system MUST make the user’s current destination visually obvious within the navigation.
- **FR-005**: The system MUST provide a prominent quick action entry point in the header.
- **FR-006**: The quick action menu MUST present visual entry points for creating a client, product, sale, purchase, expense, and brand.
- **FR-007**: The system MUST support company-specific visual identity changes across the authenticated workspace, including color and brand presentation.
- **FR-008**: Users linked to more than one company MUST be able to switch the active company context from within the authenticated workspace.
- **FR-009**: Changing the active company context MUST update the visible company identity, company-scoped data presentation, and available workspace context for the selected company.
- **FR-010**: The user role applied in the workspace MUST be determined by the active company membership, not by a single global role.
- **FR-011**: When the active company changes, the workspace MUST refresh the visible permissions and available actions according to the role associated with that company membership.
- **FR-012**: The system MUST visually differentiate the workspace by supported role types: admin, supervisor, and user.
- **FR-013**: The supervisor role MUST be able to view the team area, but MUST NOT access settings destinations.
- **FR-014**: Any attempt by a supervisor to manage people from the team area MUST be redirected to an admin-request path instead of direct management.
- **FR-015**: The user role MUST be able to access the visual CRUD flows of the modules exposed in this feature slice, but MUST NOT access company settings or personalization areas.
- **FR-016**: The user role MUST be limited to view-only access in the team area and MUST NOT access people-management actions.
- **FR-017**: The overview area MUST serve as the primary authenticated landing experience for this feature slice.
- **FR-018**: The overview area MUST provide a KPI mode and a chart mode.
- **FR-019**: The KPI mode MUST display mocked summary information for sales, profit, accounts receivable, and accounts payable.
- **FR-020**: The overview area MUST provide period filters for the last 7 days, last month, last 3 months, last year, all periods, and a custom range.
- **FR-021**: Applying a period filter MUST update the visible dashboard state for summary metrics, visual analyses, and recent activity.
- **FR-022**: The chart mode MUST display visual analyses for sales over time, profit over time, and accounts payable versus accounts receivable.
- **FR-023**: The overview area MUST include a recent activity section using mocked information.
- **FR-024**: Destinations that are outside the Day 1 and Day 2 build scope but still needed for navigation continuity MUST remain navigable and open placeholder pages within the workspace.
- **FR-025**: Placeholder pages for later-phase modules MUST clearly communicate that the area is "em breve" or equivalent upcoming-state messaging.
- **FR-026**: The workspace and overview area MUST remain readable and usable across representative mobile, tablet, and desktop viewport categories.
- **FR-027**: The feature MUST maintain a consistent visual language for spacing, typography, actions, filters, cards, and states across all Day 1 and Day 2 surfaces.

### Key Entities *(include if feature involves data)*

- **Company Workspace**: Represents the branded environment shown to a specific client company, including visual identity, company-scoped data, and available module destinations.
- **Company Membership**: Represents a user’s link to one or more companies that can be selected inside the workspace, including the role the user holds in each company.
- **User Role View**: Represents the visible access profile for admin, supervisor, or user audiences within the workspace, including which visual CRUD flows, team interactions, and restricted areas each role can reach.
- **Admin Request Path**: Represents the approval-oriented path shown when a supervisor attempts to perform a people-management action that requires admin intervention.
- **Navigation Module**: Represents a top-level destination shown in the sidebar and available for movement inside the MVP shell.
- **Quick Action**: Represents a high-priority creation shortcut exposed from the header for common business actions.
- **Overview Metric**: Represents a summary value shown in KPI mode, such as sales, profit, receivables, or payables.
- **Dashboard Visualization**: Represents a visual comparison or trend view shown in chart mode.
- **Activity Item**: Represents a recent business event shown in the overview feed.
- **Period Filter**: Represents the active time range controlling the visible dashboard state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: During a guided demo, users can reach any top-level module destination from the authenticated workspace, including placeholder destinations, in no more than 2 interactions.
- **SC-002**: First-time viewers can identify the current module and the quick action entry point within 10 seconds of seeing the authenticated workspace.
- **SC-003**: Users can switch between KPI mode and chart mode, or apply any available period filter, in no more than 3 interactions per change.
- **SC-004**: Users linked to multiple companies can switch the active company context in no more than 2 interactions and immediately recognize the change in brand identity and company context.
- **SC-005**: Switching the active company for a multi-company user updates the visible role-specific navigation and actions in the same navigation flow without requiring a new sign-in.
- **SC-006**: All Day 1 and Day 2 acceptance scenarios can be demonstrated successfully on representative mobile, tablet, and desktop screen sizes without broken navigation or unreadable content.
- **SC-007**: Role-specific demo accounts consistently expose only their intended visual destinations and actions across all tested navigation paths, including blocking the `user` role from company settings, personalization, and people-management actions.
- **SC-008**: Supervisor demo accounts can reach the team area but never receive direct people-management controls without being redirected to an admin-request path.
- **SC-009**: The overview area always presents the required summary metrics, three visual analyses, and recent activity for every supported filter state in the demo dataset.

## Assumptions

- This feature slice covers only the Day 1 and Day 2 deliverables from `docs/escopo_mvp_operis.md`; later modules will be delivered in separate feature PRs.
- Existing sign-in access is already available and is reused to enter the authenticated workspace.
- All operational and financial information shown in this slice is mocked and does not require live persistence or external integrations.
- Modules outside the Day 1 and Day 2 build scope may appear as placeholder destinations so the navigation structure can be validated early.
- Placeholder modules remain navigable in this PR so the full product structure can be demonstrated even when their detailed experiences are deferred.
- Role-based differences in this slice focus on visible access and demo behavior; in this PR, the `user` role can perform visual CRUD flows across the exposed modules but cannot access company settings or personalization, and can only view the team area.
- Users may be linked to more than one company and can change the active company context from inside the workspace during the MVP demonstration.
- A user’s role may differ between company memberships and should update when the active company changes.
- Multi-company behavior in this slice is demonstrated through brand variations in the workspace rather than full client self-service administration.
