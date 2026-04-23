# Contract: Workspace Navigation and Company Context

## Purpose

Define the authenticated workspace shell contract shared between Laravel and the Inertia React frontend for Day 1 and Day 2.

## Shell Contract

Every authenticated workspace response must provide enough shared context for:

- current company branding
- company switcher
- active membership role
- sidebar navigation
- quick actions
- team visibility behavior

## Shared Prop Shape

```text
workspace:
  currentCompany:
    id
    name
    logo
    primaryColor
    secondaryColor
  availableCompanies:
    - id
      name
      role
      logo
  currentMembership:
    companyId
    role
  navigation:
    - key
      label
      routeName
      status            # implemented | placeholder
      visible
      current
  quickActions:
    - key
      label
      routeName
      visible
  teamAccess:
    canView
    canManage
    managementFallbackRoute
```

## Route Expectations

| Route Purpose | Expected Behavior | Initial Status |
|--------|-------------|-------------|
| `dashboard` | Loads the overview workspace landing page | Implemented in this PR |
| `company switch` | Changes active company context and reloads shell data | Implemented in this PR |
| `clientes` | Reachable through workspace nav | Placeholder or implemented later |
| `fornecedores` | Reachable through workspace nav | Placeholder or implemented later |
| `marcas` | Reachable through workspace nav | Placeholder or implemented later |
| `categorias` | Reachable through workspace nav | Placeholder or implemented later |
| `estoque` | Reachable through workspace nav | Placeholder or implemented later |
| `compras` | Reachable through workspace nav | Placeholder or implemented later |
| `vendas` | Reachable through workspace nav | Placeholder or implemented later |
| `contas a pagar` | Reachable through workspace nav | Placeholder or implemented later |
| `contas a receber` | Reachable through workspace nav | Placeholder or implemented later |
| `equipe` | Reachable through workspace nav with role-aware actions | Placeholder or partial in this PR |
| `relatórios` | Reachable through workspace nav | Placeholder or implemented later |
| `configurações` | Reachable only when current role allows it | Placeholder or implemented later |

## Role Visibility Rules

| Role | Team Area | Team Management | Settings | Personalization | Module CRUD |
|--------|-------------|-------------|-------------|-------------|-------------|
| `admin` | View | Direct | Allowed | Allowed | Allowed |
| `supervisor` | View | Redirect to admin-request path | Hidden/blocked | Hidden/blocked | Allowed |
| `user` | View | Not available | Hidden/blocked | Hidden/blocked | Allowed for exposed module flows |

## Placeholder Contract

When a module is outside this PR’s scope, the route must still resolve and return a placeholder page that:

- renders inside the authenticated workspace layout
- preserves current navigation and breadcrumb state
- displays clear `em breve` messaging
- optionally points to the future delivery path or current limitation

## Company Switch Rules

- users may belong to multiple companies
- the active company is selected within the workspace shell
- changing company updates branding, current membership, visible navigation, and any company-scoped page context
- role is determined by the active company membership, not by a single global role
