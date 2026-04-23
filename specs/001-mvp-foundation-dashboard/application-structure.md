# Application Structure: Operis MVP

## Visão Geral

Este documento define a estrutura completa da aplicação Operis MVP, seguindo o pattern de organização por módulo.

**Stack Técnica**:
- SSR: Inertia (padrão)
- Cache Local: TanStack Query
- Query Params: Inertia useSearchParams
- Quick Actions: Modais (não rotas)

---

## Estrutura de Arquivos

### Pages (`resources/js/pages/dashboard/`)

Cada módulo = 1 arquivo.

```
resources/js/pages/dashboard/
├── index.tsx                    ← Overview
├── clients.tsx                  ← Clients
├── sales.tsx                   ← Sales
├── suppliers.tsx                ← Suppliers
├── products.tsx                ← Products
├── categories.tsx               ← Categories
├── brands.tsx                  ← Brands
├── inventory.tsx               ← Inventory
├── purchases.tsx                ← Purchases
├── accounts-receivable.tsx       ← Accounts Receivable
├── accounts-payable.tsx         ← Accounts Payable
├── team.tsx                    ← Team
├── reports.tsx                  ← Reports
└── settings.tsx                ← Settings
```

**Responsabilidade da Page**: Rendering do componente importado de features, título via Head, layout base.

---

### Features (`resources/js/components/features/dashboard/`)

Mesma organização de pages, mas em sub-pastas com componentes internos.

```
resources/js/components/features/dashboard/
├── workspace-context.tsx          ← Context global do workspace
├── layout/
│   ├── company-switcher-modal.tsx
│   └── quick-actions-modal.tsx
├── overview/
│   ├── period-filter.tsx
│   ├── view-switcher.tsx
│   ├── metrics-grid.tsx
│   ├── charts-panel.tsx
│   ├── recent-activity.tsx
│   └── index.tsx
├── clients/
│   ├── client-form.tsx
│   ├── client-list.tsx
│   ├── client-table.tsx
│   └── index.tsx
├── sales/
│   ├── sale-form.tsx
│   ├── sale-list.tsx
│   └── index.tsx
├── suppliers/
│   └── index.tsx
├── products/
│   └── index.tsx
├── categories/
│   └── index.tsx
├── brands/
│   └── index.tsx
├── inventory/
│   └── index.tsx
├── purchases/
│   └── index.tsx
├── accounts-receivable/
│   └── index.tsx
├── accounts-payable/
│   └── index.tsx
├── team/
│   ├── team-page-content.tsx
│   ├── admin-request-page.tsx
│   └── index.tsx
├── reports/
│   └── index.tsx
└── settings/
    └── index.tsx
```

**Responsabilidade do Feature**: Componentes internos, UI specifics, data fetching.

---

### Tipos (`resources/js/types/`)

Um arquivo por módulo.

```
resources/js/types/
├── index.ts                 ← Re-exports
├── workspace.ts            ← Empresa, membership, role
├── dashboard.ts             ← KPIs, charts, filters
├── clients.ts              ← Client entity
├── sales.ts                 ← Sale entity
├── suppliers.ts           ← Supplier entity
├── products.ts            ← Product entity
├── categories.ts          ← Category entity
├── brands.ts              ← Brand entity
├── inventory.ts          ← Stock entity
├── purchases.ts           ← Purchase entity
├── accounts-receivable.ts  ← Receivable entity
├── accounts-payable.ts    ← Payable entity
└── team.ts               ← Team member entity
```

---

### Mock Data (`resources/js/lib/mocks/`)

```
resources/js/lib/mocks/
├── workspace-mocks.ts      ← Empresas, memberships, roles
└── dashboard-mocks.ts      ← KPIs, charts, activity
```

---

### Hooks (`resources/js/hooks/`)

```
resources/js/hooks/
├── use-workspace.ts        ← Hook de workspace + cache
└── use-dashboard.ts        ← Hook de dashboard + cache
```

---

### Providers

```
resources/js/lib/
├── query-provider.tsx        ← TanStack Query provider
└── query-client.ts         ← Query client setup
```

---

## Padrão de Componente por Módulo

### Page (`pages/dashboard/clients.tsx`)

```tsx
import { Head } from '@inertiajs/react';
import ClientsIndex from '@/components/features/dashboard/clients';

export default function Clients() {
  return (
    <>
      <Head title="Clientes - Operis" />
      <ClientsIndex />
    </>
  );
}
```

### Feature Index (`features/dashboard/clients/index.tsx`)

```tsx
// Container principal do módulo
// Organiza sub-componentes

import { useQuery } from '@tanstack/react-query';
import ClientTable from './client-table';
import ClientForm from './client-form';

export default function ClientsIndex() {
  // Data fetching via TanStack Query
  
  return (
    <div>
      <ClientTable data={data} />
      {/* Modal de form controlado por state local */}
    </div>
  );
}
```

### Feature Sub-componente (`features/dashboard/clients/client-table.tsx`)

```tsx
// Componente de UI específico
// Sem lógica de fetch, só presentation

type Props = {
  data: Client[];
};

export default function ClientTable({ data }: Props) {
  return <table>...</table>;
}
```

---

## Fluxo de Dados

```
Page (clients.tsx)
    ↓
Feature Index (clients/index.tsx)
    ↓
TanStack Query (useQuery)
    ↓
Mock Data (clients-mocks.ts ou via API quando implementado)
```

---

## Integração com Inertia

### Query Params via Inertia

```tsx
import { useSearchParams } from '@inertiajs/react';

const [searchParams] = useSearchParams();
const period = searchParams.get('period') || 'last_30_days';
```

### SSR (padrão Inertia)

- O servidor renderiza a página completa
- Client-side hydration do React
- TanStack Query gerencia cache local

---

## TanStack Query Setup

### Provider (`resources/js/lib/query-provider.tsx`)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Integração no App (`resources/js/app.tsx`)

```tsx
import QueryProvider from '@/lib/query-provider';

export default function App() {
  return (
    <QueryProvider>
      <InertiaApp>
        <Page Hendrix />
      </InertiaApp>
    </QueryProvider>
  );
}
```

---

## Quick Actions Modal

Não é rota - é modal aberto via state.

```tsx
// resources/js/components/features/dashboard/layout/quick-actions-modal.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';

type Action = {
  key: string;
  label: string;
  icon: Icon;
  action: () => void;
};

const actions: Action[] = [
  { key: 'client', label: 'Novo Cliente', icon: UserPlus, action: () => setClientsModalOpen(true) },
  { key: 'sale', label: 'Nova Venda', icon: ShoppingCart, action: () => setSalesModalOpen(true) },
  // ...
];

export default function QuickActionsModal({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {actions.map(action => (
          <button key={action.key} onClick={action.action}>
            <action.icon />
            {action.label}
          </button>
        ))}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Rota por Módulo

### `routes/web.php`

```php
Route::middleware(['auth'])->group(function () {
    Route::inertia('/dashboard', 'dashboard/index')->name('dashboard');
    Route::inertia('/dashboard/clients', 'dashboard/clients')->name('clients');
    Route::inertia('/dashboard/sales', 'dashboard/sales')->name('sales');
    // ... cada módulo
});
```

Wayfinder gera os helpers automáticamente via `vite.config.ts`.

---

## Resumo da Estrutura

| Camada | Local | Responsabilidade |
|-------|-------|----------------|
| Page | `pages/dashboard/*.tsx` | Routing, Title (Head) |
| Feature | `features/dashboard/*/` | Componentes, UI |
| Types | `types/*.ts` | Tipos por módulo |
| Mock | `lib/mocks/*.ts` | Dados mockados |
| Hooks | `hooks/*.ts` | Lógica + cache |
| Query | `lib/query-*.tsx` | TanStack Query setup |

---

## Notas

- Cada página apenas importa o componente de features
- Feature index organiza sub-componentes do módulo
- TanStack Query gerencia cache local
- Quick Actions = modais controlled por state
- Query params via Inertia useSearchParams
- SSR via Inertia (padrão,sem configuração extra)