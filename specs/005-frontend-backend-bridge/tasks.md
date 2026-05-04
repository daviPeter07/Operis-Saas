# Tasks for Frontend‑Backend Bridge

## Phase 1 – Setup (project initialization)

- [X] T001 Create feature branch `005-frontend-backend-bridge` (git checkout -b 005-frontend-backend-bridge) (setup script)
- [X] T002 Install backend dependencies `composer install` (project root)
- [X] T003 Install frontend dependencies `pnpm install` (frontend/)
- [X] T004 Run initial migrations `php artisan migrate` (backend/)
- [X] T005 Generate Wayfinder typed helpers `php artisan wayfinder:generate` (backend/)
- [X] T006 Set up linting/formatting tools (PHP Pint, ESLint/Prettier) (project root)

## Phase 2 – Foundational (blocking prerequisites)

- [X] T007 Configure Fortify to use HttpOnly Secure cookie authentication (backend/app/Http/Middleware/EnsureUserHasCompany.php)
- [X] T008 Implement shared `apiClient.ts` utility with auth cookie handling and error processing (frontend/src/services/apiClient.ts)
- [X] T009 Create Zod schema base and helper for API response validation (frontend/src/schemas/base.zod.ts)

## Phase 3 – User Story 1 (Login) [US1]

- [ ] T010 [US1] Create `auth.service.ts` with `login(email, password)` calling POST `/login` (frontend/src/services/auth.service.ts)
- [ ] T011 [US1] Create Zod schema `LoginResponse` matching API response (frontend/src/schemas/auth.zod.ts)
- [ ] T012 [US1] Add login UI component (if not already present) and bind to service (frontend/src/components/Login.tsx)
- [ ] T013 [US1] Write unit test for `auth.service.login` using Jest (frontend/tests/auth.service.test.ts)
- [ ] T014 [US1] Write backend test for login endpoint using Pest (backend/tests/Feature/Auth/LoginTest.php)

## Phase 4 – User Story 2 (Protected resources with hook) [US2]

- [ ] T015 [US2] Create `useCurrentUser.ts` hook that calls GET `/user/profile` (frontend/src/hooks/useCurrentUser.ts)
- [ ] T016 [US2] Create Zod schema `UserProfile` (frontend/src/schemas/user.zod.ts)
- [ ] T017 [US2] Write integration test for `useCurrentUser` hook (frontend/tests/useCurrentUser.test.ts)
- [ ] T018 [US2] Implement backend endpoint `/user/profile` returning authenticated user data (backend/app/Http/Controllers/Api/User/AuthenticatedUserController.php)
- [ ] T019 [US2] Write backend test for profile endpoint (backend/tests/Feature/User/ProfileTest.php)

## Phase 5 – User Story 3 (Clean‑code service layer) [US3]

- [ ] T020 [US3] Create generic `apiService.ts` base class for CRUD operations (frontend/src/services/apiService.ts)
- [ ] T021 [US3] Implement `customer.service.ts` extending `apiService` for Customer CRUD (frontend/src/services/customer.service.ts)
- [ ] T022 [US3] Add Zod schemas for Customer (frontend/src/schemas/customer.zod.ts)
- [ ] T023 [US3] Write unit tests for `customer.service` (frontend/tests/customer.service.test.ts)
- [ ] T024 [US3] Add backend CustomerController with REST endpoints (backend/app/Http/Controllers/Api/Customers/CustomerController.php)
- [ ] T025 [US3] Write Pest tests for Customer API (backend/tests/Feature/Customer/CustomerApiTest.php)

## Final Phase – Polish & Cross‑cutting concerns

- [ ] T026 Refactor all service files to use consistent naming and error handling (project-wide)
- [ ] T027 Add comprehensive API documentation (OpenAPI/Swagger) (docs/api.yaml)
- [ ] T028 Run full codebase linting and format fixes (`vendor/bin/pint --format agent`, `npm run lint -- --fix`)
- [ ] T029 Verify all test suites pass (`php artisan test --compact && pnpm test`)
- [ ] T030 Update README with setup and usage instructions (README.md)

## Additional Backend Modules (CRUD + Import)

### Customers

- [ ] T031 Create `customer.service.ts` extending `apiService` (frontend/src/services/customer.service.ts)
- [ ] T032 Create Zod schema `Customer` (frontend/src/schemas/customer.zod.ts)
- [ ] T033 Add Customer CRUD UI page (frontend/src/pages/Customers.tsx)
- [ ] T034 Implement backend `CustomerController` with index, show, store, update, destroy (backend/app/Http/Controllers/Api/Customers/CustomerController.php)
- [ ] T035 Write Pest tests for Customer API (backend/tests/Feature/Customer/CustomerApiTest.php)
- [ ] T036 Write Jest tests for `customer.service` (frontend/tests/customer.service.test.ts)

### Suppliers

- [ ] T037 Create `supplier.service.ts` (frontend/src/services/supplier.service.ts)
- [ ] T038 Create Zod schema `Supplier` (frontend/src/schemas/supplier.zod.ts)
- [ ] T039 Add Supplier CRUD UI page (frontend/src/pages/Suppliers.tsx)
- [ ] T040 Implement backend `SupplierController` (backend/app/Http/Controllers/Api/Suppliers/SupplierController.php)
- [ ] T041 Write Pest tests for Supplier API (backend/tests/Feature/Supplier/SupplierApiTest.php)
- [ ] T042 Write Jest tests for `supplier.service` (frontend/tests/supplier.service.test.ts)

### Brands

- [ ] T043 Create `brand.service.ts` (frontend/src/services/brand.service.ts)
- [ ] T044 Create Zod schema `Brand` (frontend/src/schemas/brand.zod.ts)
- [ ] T045 Add Brand CRUD UI page (frontend/src/pages/Brands.tsx)
- [ ] T046 Implement backend `BrandController` (backend/app/Http/Controllers/Api/Brands/BrandController.php)
- [ ] T047 Write Pest tests for Brand API (backend/tests/Feature/Brand/BrandApiTest.php)
- [ ] T048 Write Jest tests for `brand.service` (frontend/tests/brand.service.test.ts)

### Categories

- [ ] T049 Create `category.service.ts` (frontend/src/services/category.service.ts)
- [ ] T050 Create Zod schema `Category` (frontend/src/schemas/category.zod.ts)
- [ ] T051 Add Category CRUD UI page (frontend/src/pages/Categories.tsx)
- [ ] T052 Implement backend `CategoryController` (backend/app/Http/Controllers/Api/Categories/CategoryController.php)
- [ ] T053 Write Pest tests for Category API (backend/tests/Feature/Category/CategoryApiTest.php)
- [ ] T054 Write Jest tests for `category.service` (frontend/tests/category.service.test.ts)

### Products (with stock handling)

- [ ] T055 Create `product.service.ts` (frontend/src/services/product.service.ts)
- [ ] T056 Create Zod schema `Product` (frontend/src/schemas/product.zod.ts)
- [ ] T057 Add Product CRUD UI page (frontend/src/pages/Products.tsx)
- [ ] T058 Implement backend `ProductController` (backend/app/Http/Controllers/Api/Products/ProductController.php)
- [ ] T059 Write Pest tests for Product API (backend/tests/Feature/Product/ProductApiTest.php)
- [ ] T060 Write Jest tests for `product.service` (frontend/tests/product.service.test.ts)

### Stock Movements

- [ ] T061 Implement `product.stock.service.ts` for stock entry/exit (frontend/src/services/productStock.service.ts)
- [ ] T062 Create Zod schema `StockMovement` (frontend/src/schemas/stockMovement.zod.ts)
- [ ] T063 Add stock movement UI component (frontend/src/components/StockMovementForm.tsx)
- [ ] T064 Implement backend `ProductStockController` (backend/app/Http/Controllers/Api/Products/ProductStockController.php)
- [ ] T065 Write Pest tests for Stock Movement API (backend/tests/Feature/Product/StockMovementTest.php)
- [ ] T066 Write Jest tests for `product.stock.service` (frontend/tests/productStock.service.test.ts)

### Sales

- [ ] T067 Create `sale.service.ts` (frontend/src/services/sale.service.ts)
- [ ] T068 Create Zod schema `Sale` (frontend/src/schemas/sale.zod.ts)
- [ ] T069 Add Sale creation UI page (frontend/src/pages/Sales/CreateSale.tsx)
- [ ] T070 Implement backend `SaleController` (backend/app/Http/Controllers/Api/Sales/SaleController.php)
- [ ] T071 Write Pest tests for Sale API (backend/tests/Feature/Sale/SaleApiTest.php)
- [ ] T072 Write Jest tests for `sale.service` (frontend/tests/sale.service.test.ts)

### Purchases

- [ ] T073 Create `purchase.service.ts` (frontend/src/services/purchase.service.ts)
- [ ] T074 Create Zod schema `Purchase` (frontend/src/schemas/purchase.zod.ts)
- [ ] T075 Add Purchase creation UI page (frontend/src/pages/Purchases/CreatePurchase.tsx)
- [ ] T076 Implement backend `PurchaseController` (backend/app/Http/Controllers/Api/Purchases/PurchaseController.php)
- [ ] T077 Write Pest tests for Purchase API (backend/tests/Feature/Purchase/PurchaseApiTest.php)
- [ ] T078 Write Jest tests for `purchase.service` (frontend/tests/purchase.service.test.ts)

### Accounts Receivable

- [ ] T079 Create `accountReceivable.service.ts` (frontend/src/services/accountReceivable.service.ts)
- [ ] T080 Create Zod schema `AccountReceivable` (frontend/src/schemas/accountReceivable.zod.ts)
- [ ] T081 Implement backend `AccountReceivableController` (backend/app/Http/Controllers/Api/Finance/AccountReceivableController.php)
- [ ] T082 Write Pest tests for Accounts Receivable API (backend/tests/Feature/Finance/AccountReceivableTest.php)
- [ ] T083 Write Jest tests for `accountReceivable.service` (frontend/tests/accountReceivable.service.test.ts)

### Accounts Payable

- [ ] T084 Create `accountPayable.service.ts` (frontend/src/services/accountPayable.service.ts)
- [ ] T085 Create Zod schema `AccountPayable` (frontend/src/schemas/accountPayable.zod.ts)
- [ ] T086 Implement backend `AccountPayableController` (backend/app/Http/Controllers/Api/Finance/AccountPayableController.php)
- [ ] T087 Write Pest tests for Accounts Payable API (backend/tests/Feature/Finance/AccountPayableTest.php)
- [ ] T088 Write Jest tests for `accountPayable.service` (frontend/tests/accountPayable.service.test.ts)

### Import (Preview & Execution) – Shared Logic

- [ ] T089 Create generic `import.service.ts` with preview handling (frontend/src/services/import.service.ts)
- [ ] T090 Create Zod schema `ImportPreview` (frontend/src/schemas/importPreview.zod.ts)
- [ ] T091 Add import UI component (frontend/src/components/ImportWizard.tsx) supporting CSV, XLS, XLSX
- [ ] T092 Implement backend `ImportBatchController` for handling file upload, preview, and commit (backend/app/Http/Controllers/Api/Imports/ImportBatchController.php)
- [ ] T093 Write Pest tests for import preview endpoint (backend/tests/Feature/Import/ImportPreviewTest.php)
- [ ] T094 Write Jest tests for `import.service` (frontend/tests/import.service.test.ts)

## Final Phase – Polish & Cross‑cutting (extended)

- [ ] T095 Update OpenAPI spec to include all new endpoints (docs/api.yaml)
- [ ] T096 Run full end‑to‑end smoke test covering login, profile, and at least one CRUD flow (Cypress or Playwright script)
- [ ] T097 Verify code coverage >= 80 % across backend and frontend (phpunit --coverage, jest --coverage)
- [ ] T098 Document import workflow in README (README.md)
- [ ] T099 Deploy feature branch to staging for QA verification (deployment script)
