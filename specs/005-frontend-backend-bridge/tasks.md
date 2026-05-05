# Tasks: Frontend‑Backend Bridge

## Fase 1 – Configuração Inicial

- [ ] T001 Criar branch `005-frontend-backend-bridge`
- [ ] T002 Executar `composer install`
- [ ] T003 Executar `pnpm install`
- [ ] T004 Executar `php artisan migrate`
- [ ] T005 Executar `php artisan wayfinder:generate`
- [ ] T006 Configurar Pint + ESLint/Prettier

## Fase 2 – Fundamentos (serviços e schemas)

- [ ] T007 Configurar autenticação HttpOnly cookie no Fortify
- [X] T008 Criar `resources/js/lib/apiClient.ts` com handling de cookies e erros
- [X] T009 Criar `resources/js/lib/schemas/base.ts` com helpers TypeScript

## Fase 3 – Autenticação (US1)

- [ ] T010 Criar `resources/js/services/auth.ts` com login/logout
- [ ] T011 Criar `resources/js/schemas/auth.ts` com LoginResponse
- [ ] T012 Criar/ajustar componente de Login UI
- [ ] T013 Teste unitário para auth.service
- [ ] T014 Teste Pest para endpoint /login

## Fase 4 – Usuário Autenticado (US2)

- [X] T015 Criar hook `resources/js/hooks/useCurrentUser.ts`
- [X] T016 Criar schema `resources/js/schemas/user.ts`
- [ ] T017 Teste para hook useCurrentUser
- [ ] T018 Criar/ajustar `AuthenticatedUserController` em `app/Http/Controllers/Api/Auth/`
- [ ] T019 Teste Pest para /user/profile

## Fase 5 – Camada de Serviços Genérica (US3)

- [X] T020 Criar `resources/js/lib/apiService.ts` base para CRUD
- [X] T021 Criar `resources/js/services/customers.ts` estendendo apiService
- [X] T022 Criar schema `resources/js/schemas/customer.ts`
- [ ] T023 Testes Jest para customer.service
- [ ] T024 Ajustar CustomerController existente se necessário
- [ ] T025 Testes Pest para API de Customers

## Fase 6 – Modules CRUD

### Customers

- [ ] T026 Integrar customer.service com UI existente
- [ ] T027 Schema Zod para Customer
- [ ] T028 Ajustar CustomerController se necessário

### Suppliers

- [X] T029 Criar `resources/js/services/suppliers.ts`
- [X] T030 Schema para Supplier
- [ ] T031 Ajustar SupplierController

### Brands

- [X] T032 Criar `resources/js/services/brands.ts`
- [X] T033 Schema para Brand
- [ ] T034 Ajustar BrandController

### Categories

- [X] T035 Criar `resources/js/services/categories.ts`
- [X] T036 Schema para Category
- [ ] T037 Ajustar CategoryController

### Products

- [X] T038 Criar `resources/js/services/products.ts`
- [X] T039 Schema para Product
- [ ] T040 Ajustar ProductController

### Stock Movements

- [ ] T041 Criar `resources/js/services/stock.ts`
- [ ] T042 Schema Zod para StockMovement
- [ ] T043 Controller para stock se necessário

### Sales

- [X] T044 Criar `resources/js/services/sales.ts`
- [X] T045 Schema para Sale
- [ ] T046 Ajustar SaleController

### Purchases

- [X] T047 Criar `resources/js/services/purchases.ts`
- [X] T048 Schema para Purchase
- [ ] T049 Ajustar PurchaseController

### Finance

- [X] T050 Criar `resources/js/services/accountReceivable.ts`
- [X] T051 Schema para AccountReceivable
- [X] T052 Criar `resources/js/services/accountPayable.ts`
- [X] T053 Schema para AccountPayable

## Fase 7 – Importação

- [X] T054 Criar `resources/js/lib/importService.ts` genérico
- [X] T055 Schema para preview de importação
- [ ] T056 Componente UI de importação (CSV, XLS, XLSX)
- [ ] T057 Ajustar controllers de importação existentes

## Fase 8 – Polish

- [ ] T058 Padronizar nomenclatura e error handling
- [ ] T059 Documentação OpenAPI
- [ ] T060 Executar Pint + ESLint
- [ ] T061 Verificar testes passando
- [ ] T062 Atualizar README com setup

---

## Estrutura de Arquivos

```
resources/js/
├── lib/
│   ├── apiClient.ts          # Cliente HTTP com cookies
│   ├── apiService.ts          # Base CRUD
│   └── importService.ts       # Importação genérica
├── services/
│   ├── auth.ts                # Login/logout
│   ├── customers.ts           # CRUD Customers
│   ├── suppliers.ts          # CRUD Suppliers
│   ├── brands.ts              # CRUD Brands
│   ├── categories.ts          # CRUD Categories
│   ├── products.ts            # CRUD Products
│   ├── stock.ts               # Movimentação estoque
│   ├── sales.ts               # Vendas
│   ├── purchases.ts           # Compras
│   ├── accountReceivable.ts   # Contas receber
│   └── accountPayable.ts      # Contas pagar
├── schemas/
│   ├── base.ts                # Helpers Zod
│   ├── auth.ts                # Login response
│   ├── user.ts                # User profile
│   ├── customer.ts            # Customer schema
│   └── ...
├── hooks/
│   └── useCurrentUser.ts      # Hook usuário atual
└── components/                # Componentes de UI

app/Http/Controllers/Api/
├── Auth/
│   └── AuthenticatedUserController.php
├── Customers/
│   ├── CustomerController.php
│   └── CustomerImportController.php
├── Suppliers/
├── Products/
├── Categories/
├── Brands/
├── Sales/
├── Purchases/
└── Finance/
    ├── AccountReceivableController.php
    └── AccountPayableController.php
```
