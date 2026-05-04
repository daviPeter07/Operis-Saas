# Tasks: Backend Operis SaaS

**Input**: Design documents from `/specs/004-backend-operis-saas/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/backend-api-contract.md, quickstart.md

**Tests**: Incluidos, pois o projeto exige validacao programatica para as alteracoes.

**Organization**: Tasks agrupadas por user story para permitir implementacao e validacao incremental.

## Adendo de Execucao por Fase

- Ao concluir uma fase, o agente deve reportar exatamente o que foi feito.
- O agente nao deve iniciar a fase seguinte sem autorizacao explicita do usuario.
- Este adendo tem precedencia operacional sobre a execucao continua automatica.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencia direta)
- **[Story]**: User story da spec (`US1`, `US2`, `US3`, `US4`, `US5`)
- Cada task inclui caminho de arquivo exato

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar base de API, estrutura de dominio e configuracoes compartilhadas.

- [x] T001 Criar arquivo de rotas API em `routes/api.php` e registrar grupos/middlewares base.
- [x] T002 Atualizar bootstrap para carregar `routes/api.php` em `bootstrap/app.php`.
- [x] T003 [P] Criar estrutura de diretorios de dominio em `app/Enums/`, `app/Repositories/Contracts/`, `app/Repositories/Eloquent/`, `app/Services/`.
- [x] T004 [P] Criar trait de escopo por empresa em `app/Traits/BelongsToCompany.php`.
- [x] T005 [P] Criar base de filtro por empresa atual em `app/Support/Company/CurrentCompanyResolver.php`.
- [x] T006 [P] Criar classes Resource base de API em `app/Http/Resources/`.
- [x] T007 [P] Criar testes de smoke para endpoints API autenticados em `tests/Feature/Api/ApiAuthSmokeTest.php`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura que bloqueia todos os modulos operacionais.

**⚠️ CRITICAL**: Nao iniciar user stories antes de concluir esta fase.

- [x] T008 Criar migration de empresas em `database/migrations/*_create_companies_table.php`.
- [x] T009 Criar migration de vinculo usuario-empresa em `database/migrations/*_create_company_users_table.php`.
- [x] T010 Criar migration de empresa atual no usuario em `database/migrations/*_add_current_company_id_to_users_table.php`.
- [x] T011 Criar migration de codigos de verificacao em `database/migrations/*_create_company_verification_codes_table.php`.
- [x] T012 [P] Criar models `Company`, `CompanyUser`, `CompanyVerificationCode` em `app/Models/`.
- [x] T013 [P] Criar enums base (`CompanyUserRole`, `CompanyUserStatus`, `RecordStatus`) em `app/Enums/`.
- [x] T014 Criar middlewares `EnsureUserHasCompany`, `EnsureCompanyIsVerified`, `SetCurrentCompany`, `EnsureCurrentCompanyMember` em `app/Http/Middleware/`.
- [x] T015 Registrar middlewares e aliases em `bootstrap/app.php`.
- [x] T016 [P] Criar request/resource de contexto autenticado em `app/Http/Resources/Auth/AuthenticatedUserResource.php`.
- [x] T017 Criar endpoint `GET /api/auth/me` em `app/Http/Controllers/Api/Auth/AuthenticatedUserController.php`.
- [x] T018 Criar teste de acesso sem empresa e sem verificacao em `tests/Feature/Onboarding/AccessGuardTest.php`.

**Checkpoint**: Base multiempresa, contexto atual e guards prontos.

---

## Phase 3: User Story 1 - Auth e Onboarding de Empresa (Priority: P1) 🎯 MVP

**Goal**: Completar fluxo de criacao/verificacao de empresa e liberar acesso operacional.

**Independent Test**: Usuario novo cria empresa, recebe codigo, confirma e acessa dashboard/API.

### Tests for User Story 1

- [x] T019 [P] [US1] Criar teste de criacao de empresa no onboarding em `tests/Feature/Onboarding/CreateCompanyTest.php`.
- [x] T020 [P] [US1] Criar teste de confirmacao de codigo valido/expirado em `tests/Feature/Onboarding/VerifyCompanyCodeTest.php`.
- [x] T021 [P] [US1] Criar teste de limite de reenvio (5/h + 1 min cooldown) em `tests/Feature/Onboarding/ResendCompanyCodeLimitTest.php`.

### Implementation for User Story 1

- [x] T022 [US1] Criar `CompanyOnboardingRequest` em `app/Http/Requests/Onboarding/CompanyOnboardingRequest.php`.
- [x] T023 [US1] Criar `CompanyVerificationRequest` em `app/Http/Requests/Onboarding/CompanyVerificationRequest.php`.
- [x] T024 [US1] Criar `CompanyOnboardingService` em `app/Services/Onboarding/CompanyOnboardingService.php`.
- [x] T025 [US1] Criar `CompanyVerificationService` em `app/Services/Onboarding/CompanyVerificationService.php`.
- [x] T026 [US1] Implementar controller de criacao de empresa em `app/Http/Controllers/Api/Onboarding/CompanyOnboardingController.php`.
- [x] T027 [US1] Implementar controller de confirmacao de codigo em `app/Http/Controllers/Api/Onboarding/CompanyVerificationCodeController.php`.
- [x] T028 [US1] Implementar controller de reenvio em `app/Http/Controllers/Api/Onboarding/CompanyVerificationResendController.php`.
- [x] T029 [US1] Adicionar resources de onboarding em `app/Http/Resources/Companies/`.
- [x] T030 [US1] Registrar rotas de onboarding em `routes/api.php`.

**Checkpoint**: Onboarding funcional e bloqueios de acesso aplicados.

---

## Phase 4: User Story 2 - Cadastros Operacionais (Priority: P1)

**Goal**: Entregar CRUD real de clientes, fornecedores, marcas, categorias e produtos com inativacao por vinculo.

**Independent Test**: CRUD por modulo com regras de exclusao/inativacao validadas por vinculos.

### Tests for User Story 2

- [x] T031 [P] [US2] Criar teste de ciclo CRUD de clientes em `tests/Feature/Customers/CustomerCrudTest.php`.
- [x] T032 [P] [US2] Criar teste de ciclo CRUD de fornecedores em `tests/Feature/Suppliers/SupplierCrudTest.php`.
- [x] T033 [P] [US2] Criar teste de ciclo CRUD de marcas/categorias em `tests/Feature/Catalog/CatalogCrudTest.php`.
- [x] T034 [P] [US2] Criar teste de ciclo CRUD de produtos em `tests/Feature/Products/ProductCrudTest.php`.
- [x] T035 [P] [US2] Criar teste de inativacao por vinculo historico em `tests/Feature/Shared/InactivationByHistoryRuleTest.php`.

### Implementation for User Story 2

- [x] T036 [P] [US2] Criar migrations de clientes e fornecedores em `database/migrations/*_create_customers_table.php` e `*_create_suppliers_table.php`.
- [x] T037 [P] [US2] Criar migrations de marcas e categorias em `database/migrations/*_create_brands_table.php` e `*_create_categories_table.php`.
- [x] T038 [P] [US2] Criar migration de produtos em `database/migrations/*_create_products_table.php`.
- [x] T039 [P] [US2] Criar models `Customer`, `Supplier`, `Brand`, `Category`, `Product` em `app/Models/`.
- [x] T040 [P] [US2] Criar enums `ProductStatus` e `PersonType` em `app/Enums/`.
- [x] T041 [P] [US2] Criar requests de clientes em `app/Http/Requests/Customers/`.
- [x] T042 [P] [US2] Criar requests de fornecedores em `app/Http/Requests/Suppliers/`.
- [x] T043 [P] [US2] Criar requests de marcas/categorias em `app/Http/Requests/Brands/` e `app/Http/Requests/Categories/`.
- [x] T044 [P] [US2] Criar requests de produtos em `app/Http/Requests/Products/`.
- [x] T045 [P] [US2] Criar resources de clientes/fornecedores em `app/Http/Resources/Customers/` e `app/Http/Resources/Suppliers/`.
- [x] T046 [P] [US2] Criar resources de marcas/categorias/produtos em `app/Http/Resources/Brands/`, `app/Http/Resources/Categories/`, `app/Http/Resources/Products/`.
- [x] T047 [P] [US2] Criar policies de cadastro em `app/Policies/CustomerPolicy.php`, `SupplierPolicy.php`, `BrandPolicy.php`, `CategoryPolicy.php`, `ProductPolicy.php`.
- [x] T048 [P] [US2] Criar repositories de cadastro em `app/Repositories/Contracts/` e `app/Repositories/Eloquent/`.
- [x] T049 [P] [US2] Criar services de cadastro em `app/Services/Customers/`, `app/Services/Suppliers/`, `app/Services/Brands/`, `app/Services/Categories/`, `app/Services/Products/`.
- [x] T050 [US2] Implementar controllers API de cadastro em `app/Http/Controllers/Api/Customers/CustomerController.php`, `.../Suppliers/SupplierController.php`, `.../Brands/BrandController.php`, `.../Categories/CategoryController.php`, `.../Products/ProductController.php`.
- [x] T051 [US2] Registrar rotas de cadastros em `routes/api.php`.

**Checkpoint**: Cadastros operacionais completos e independentes.

---

## Phase 5: User Story 3 - Vendas, Estoque e Contas a Receber (Priority: P1)

**Goal**: Entregar vendas com ajuste de estoque, estoque negativo permitido e geracao automatica de contas a receber.

**Independent Test**: Criar/concluir/editar/cancelar venda com reflexos corretos em estoque e financeiro.

### Tests for User Story 3

- [ ] T052 [P] [US3] Criar teste de conclusao de venda e baixa de estoque em `tests/Feature/Sales/SaleCompletionStockTest.php`.
- [ ] T053 [P] [US3] Criar teste de venda com estoque negativo em `tests/Feature/Sales/SaleNegativeStockAllowedTest.php`.
- [ ] T054 [P] [US3] Criar teste de edicao de venda concluida com ajuste compensatorio em `tests/Feature/Sales/SaleEditCompensatoryStockTest.php`.
- [ ] T055 [P] [US3] Criar teste de cancelamento de venda e estorno em `tests/Feature/Sales/SaleCancelRollbackTest.php`.
- [ ] T056 [P] [US3] Criar teste de geracao/recalculo de contas a receber em `tests/Feature/Finance/ReceivableFromSaleTest.php`.

### Implementation for User Story 3

- [ ] T057 [P] [US3] Criar migrations de estoque e vendas em `database/migrations/*_create_stock_movements_table.php`, `*_create_sales_table.php`, `*_create_sale_items_table.php`, `*_create_sale_payments_table.php`, `*_create_account_receivables_table.php`.
- [ ] T058 [P] [US3] Criar models `StockMovement`, `Sale`, `SaleItem`, `SalePayment`, `AccountReceivable` em `app/Models/`.
- [ ] T059 [P] [US3] Criar enums `SaleStatus`, `FinancialStatus`, `StockMovementType`, `PaymentMethod` em `app/Enums/`.
- [ ] T060 [P] [US3] Criar requests de venda em `app/Http/Requests/Sales/`.
- [ ] T061 [P] [US3] Criar resources de venda/financeiro em `app/Http/Resources/Sales/` e `app/Http/Resources/Finance/`.
- [ ] T062 [P] [US3] Criar policy de vendas e contas a receber em `app/Policies/SalePolicy.php` e `app/Policies/AccountReceivablePolicy.php`.
- [ ] T063 [P] [US3] Criar repositories de venda/estoque/recebiveis em `app/Repositories/Contracts/` e `app/Repositories/Eloquent/`.
- [ ] T064 [US3] Implementar `StockMovementService` em `app/Services/Products/StockMovementService.php`.
- [ ] T065 [US3] Implementar `SaleService` com transacoes e ajuste compensatorio em `app/Services/Sales/SaleService.php`.
- [ ] T066 [US3] Implementar `ReceivableService` em `app/Services/Finance/ReceivableService.php`.
- [ ] T067 [US3] Implementar controllers de venda em `app/Http/Controllers/Api/Sales/SaleController.php` e `.../SaleCancelController.php`.
- [ ] T068 [US3] Implementar controller de contas a receber em `app/Http/Controllers/Api/Finance/AccountReceivableController.php`.
- [ ] T069 [US3] Registrar rotas de vendas/recebiveis em `routes/api.php`.

**Checkpoint**: Fluxo de vendas completo com estoque e financeiro automatico.

---

## Phase 6: User Story 4 - Compras, Estoque e Contas a Pagar (Priority: P1)

**Goal**: Entregar compras com entrada de estoque, decisao de atualizacao de custo, contas a pagar e baixa manual.

**Independent Test**: Criar/concluir/editar/cancelar compra e baixar conta a pagar manualmente.

### Tests for User Story 4

- [ ] T070 [P] [US4] Criar teste de conclusao de compra e entrada de estoque em `tests/Feature/Purchases/PurchaseCompletionStockTest.php`.
- [ ] T071 [P] [US4] Criar teste de atualizacao opcional de custo de produto em `tests/Feature/Purchases/PurchaseOptionalCostUpdateTest.php`.
- [ ] T072 [P] [US4] Criar teste de cancelamento de compra e estorno em `tests/Feature/Purchases/PurchaseCancelRollbackTest.php`.
- [ ] T073 [P] [US4] Criar teste de geracao/recalculo de contas a pagar em `tests/Feature/Finance/PayableFromPurchaseTest.php`.
- [ ] T074 [P] [US4] Criar teste de baixa manual de conta a pagar em `tests/Feature/Finance/AccountPayableManualSettleTest.php`.

### Implementation for User Story 4

- [ ] T075 [P] [US4] Criar migrations de compras e pagaveis em `database/migrations/*_create_purchases_table.php`, `*_create_purchase_items_table.php`, `*_create_purchase_payments_table.php`, `*_create_account_payables_table.php`.
- [ ] T076 [P] [US4] Criar models `Purchase`, `PurchaseItem`, `PurchasePayment`, `AccountPayable` em `app/Models/`.
- [ ] T077 [P] [US4] Criar enum `PurchaseStatus` em `app/Enums/PurchaseStatus.php`.
- [ ] T078 [P] [US4] Criar requests de compra em `app/Http/Requests/Purchases/`.
- [ ] T079 [P] [US4] Criar requests de baixa manual em `app/Http/Requests/Finance/AccountPayableSettleRequest.php`.
- [ ] T080 [P] [US4] Criar resources de compra/pagavel em `app/Http/Resources/Purchases/` e `app/Http/Resources/Finance/`.
- [ ] T081 [P] [US4] Criar policies de compra/pagavel em `app/Policies/PurchasePolicy.php` e `app/Policies/AccountPayablePolicy.php`.
- [ ] T082 [P] [US4] Criar repositories de compra/pagavel em `app/Repositories/Contracts/` e `app/Repositories/Eloquent/`.
- [ ] T083 [US4] Implementar `PurchaseService` em `app/Services/Purchases/PurchaseService.php`.
- [ ] T084 [US4] Implementar `PayableService` em `app/Services/Finance/PayableService.php`.
- [ ] T085 [US4] Implementar controllers de compra em `app/Http/Controllers/Api/Purchases/PurchaseController.php` e `.../PurchaseCancelController.php`.
- [ ] T086 [US4] Implementar controller de contas a pagar em `app/Http/Controllers/Api/Finance/AccountPayableController.php`.
- [ ] T087 [US4] Implementar controller de baixa manual em `app/Http/Controllers/Api/Finance/AccountPayablePaymentController.php`.
- [ ] T088 [US4] Registrar rotas de compras/pagaveis em `routes/api.php`.

**Checkpoint**: Compras e contas a pagar funcionais com baixa manual.

---

## Phase 7: User Story 5 - Importacao Real com Preview (Priority: P2)

**Goal**: Substituir importacao visual por importacao real com preview, erros por linha e confirmacao no mesmo fluxo.

**Independent Test**: Upload de arquivo, preview de validas/invalidas/duplicadas e confirmacao.

### Tests for User Story 5

- [ ] T089 [P] [US5] Criar teste de preview de importacao por modulo em `tests/Feature/Imports/ImportPreviewTest.php`.
- [ ] T090 [P] [US5] Criar teste de confirmacao de importacao no mesmo fluxo em `tests/Feature/Imports/ImportConfirmInlineFlowTest.php`.
- [ ] T091 [P] [US5] Criar teste de estrategias de duplicidade (`ignore`/`update`) em `tests/Feature/Imports/ImportDuplicateStrategyTest.php`.
- [ ] T092 [P] [US5] Criar teste de bloqueio de linhas invalidas em `tests/Feature/Imports/ImportInvalidRowsNotPersistedTest.php`.

### Implementation for User Story 5

- [ ] T093 [P] [US5] Criar migration de lotes de importacao em `database/migrations/*_create_import_batches_table.php`.
- [ ] T094 [P] [US5] Criar model `ImportBatch` em `app/Models/ImportBatch.php`.
- [ ] T095 [P] [US5] Criar enum `ImportStatus` em `app/Enums/ImportStatus.php`.
- [ ] T096 [P] [US5] Criar requests de importacao em `app/Http/Requests/Imports/`.
- [ ] T097 [P] [US5] Criar resources de importacao em `app/Http/Resources/Imports/`.
- [ ] T098 [P] [US5] Criar `ImportParserService` em `app/Services/Imports/ImportParserService.php`.
- [ ] T099 [P] [US5] Criar `ImportPreviewService` em `app/Services/Imports/ImportPreviewService.php`.
- [ ] T100 [P] [US5] Criar `ImportConfirmService` em `app/Services/Imports/ImportConfirmService.php`.
- [ ] T101 [US5] Implementar controllers de importacao por modulo em `app/Http/Controllers/Api/Customers/CustomerImportController.php`, `.../Suppliers/SupplierImportController.php`, `.../Brands/BrandImportController.php`, `.../Categories/CategoryImportController.php`, `.../Products/ProductImportController.php`.
- [ ] T102 [US5] Registrar rotas de importacao em `routes/api.php`.

**Checkpoint**: Importacao real com preview e confirmacao no mesmo fluxo.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento de qualidade, consistencia e integracao frontend-backend.

- [ ] T103 [P] Criar endpoint de estado de onboarding em `app/Http/Controllers/Api/Onboarding/OnboardingStateController.php`.
- [ ] T104 [P] Ajustar responses padrao de erro de dominio/validacao em `app/Exceptions/` e `bootstrap/app.php`.
- [ ] T105 [P] Revisar serializacao para compatibilidade com frontend atual em `app/Http/Resources/**`.
- [ ] T106 [P] Ajustar filtros/paginacao padrao dos modulos para tabelas frontend em `app/Repositories/Eloquent/**`.
- [ ] T107 Executar `vendor/bin/pint --dirty --format agent`.
- [ ] T108 Executar suite direcionada de testes com `php artisan test --compact`.
- [ ] T109 Atualizar `specs/004-backend-operis-saas/quickstart.md` com comandos/fluxos finais validados.

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): inicia imediatamente.
- Phase 2 (Foundational): depende da Phase 1 e bloqueia todas as historias.
- Phase 3 (US1): depende da Phase 2.
- Phase 4 (US2): depende da Phase 2 e pode rodar em paralelo com US1 em partes nao conflitantes.
- Phase 5 (US3): depende da Phase 2 e dos modelos base de US2.
- Phase 6 (US4): depende da Phase 2 e dos modelos base de US2.
- Phase 7 (US5): depende da Phase 2 e dos cadastros de US2.
- Phase 8 (Polish): depende das historias alvo concluidas.

### User Story Dependencies

- **US1**: independente apos foundation.
- **US2**: independente apos foundation.
- **US3**: depende de US2 (entidades de cliente/produto).
- **US4**: depende de US2 (entidades de fornecedor/produto).
- **US5**: depende de US2 (modulos importaveis existentes).

### Parallel Opportunities

- Migrations e Models por modulo marcados com `[P]`.
- Requests/Resources/Policies por modulo marcados com `[P]`.
- Testes por modulo marcados com `[P]`.
- US3 e US4 podem avancar em paralelo depois da base de US2.

---

## Parallel Example: User Story 2

```bash
# Em paralelo, por time:
Task: "T036 migrations customers/suppliers"
Task: "T037 migrations brands/categories"
Task: "T038 migration products"
Task: "T039 models catalog"
Task: "T041 requests customers"
Task: "T042 requests suppliers"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Setup e Foundational.
2. US1 onboarding completo.
3. US2 cadastros operacionais.
4. US3 vendas com estoque e contas a receber.
5. Validar fluxo principal do negocio.

### Incremental Delivery

1. Entrega A: US1 (onboarding real).
2. Entrega B: US2 (cadastros reais).
3. Entrega C: US3 (vendas + recebiveis).
4. Entrega D: US4 (compras + pagaveis).
5. Entrega E: US5 (importacao real).

### Parallel Team Strategy

1. Todos no foundation.
2. Squad A: US1/US2.
3. Squad B: US3.
4. Squad C: US4.
5. Squad D: US5.

---

## Notes

- IDs sao sequenciais e rastreaveis.
- Todas as tasks de user story possuem label `[USx]`.
- Paths estao alinhados com a estrutura Laravel do projeto.
- Nao inclui tarefas fora do escopo aprovado.
