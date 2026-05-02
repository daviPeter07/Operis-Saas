# Estrutura de Backend Laravel — Operis SaaS

Estrutura pensada para um backend em **Laravel 13 + Inertia + React + Sanctum**, separada por domínios e preparada para módulos como multiempresa, autenticação, clientes, fornecedores, produtos, estoque, vendas, compras, financeiro, equipe, relatórios, importação, exportação e configurações.

## Fluxo base da arquitetura

```txt
Controller
→ Request
→ Policy
→ Service
→ Repository
→ Model
→ Resource
```

---

## Estrutura principal do `app/`

```txt
app/
├── DTOs/
│   ├── Auth/
│   ├── Companies/
│   ├── Customers/
│   ├── Suppliers/
│   ├── Products/
│   ├── Sales/
│   ├── Purchases/
│   ├── Finance/
│   ├── Reports/
│   ├── Imports/
│   └── Exports/
│
├── Enums/
│   ├── UserRole.php
│   ├── MemberStatus.php
│   ├── PersonType.php
│   ├── ProductStatus.php
│   ├── SaleStatus.php
│   ├── PurchaseStatus.php
│   ├── PaymentMethod.php
│   ├── CardType.php
│   ├── FinancialStatus.php
│   ├── FinancialEntryType.php
│   ├── StockMovementType.php
│   ├── ImportStatus.php
│   └── ExportStatus.php
│
├── Http/
│   ├── Controllers/
│   │   ├── Web/
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardController.php
│   │   │   ├── Companies/
│   │   │   │   └── CompanyWorkspaceController.php
│   │   │   ├── Customers/
│   │   │   │   └── CustomerPageController.php
│   │   │   ├── Suppliers/
│   │   │   │   └── SupplierPageController.php
│   │   │   ├── Brands/
│   │   │   │   └── BrandPageController.php
│   │   │   ├── Categories/
│   │   │   │   └── CategoryPageController.php
│   │   │   ├── Products/
│   │   │   │   └── ProductPageController.php
│   │   │   ├── Sales/
│   │   │   │   └── SalePageController.php
│   │   │   ├── Purchases/
│   │   │   │   └── PurchasePageController.php
│   │   │   ├── Finance/
│   │   │   │   ├── PayablePageController.php
│   │   │   │   └── ReceivablePageController.php
│   │   │   ├── Team/
│   │   │   │   └── TeamPageController.php
│   │   │   ├── Reports/
│   │   │   │   └── ReportPageController.php
│   │   │   └── Settings/
│   │   │       └── CompanySettingsPageController.php
│   │   │
│   │   └── Api/
│   │       ├── Auth/
│   │       │   ├── AuthenticatedUserController.php
│   │       │   ├── ApiTokenController.php
│   │       │   └── TwoFactorAuthenticationController.php
│   │       ├── Companies/
│   │       │   ├── CompanyController.php
│   │       │   ├── CurrentCompanyController.php
│   │       │   └── CompanyBrandingController.php
│   │       ├── Customers/
│   │       │   ├── CustomerController.php
│   │       │   ├── CustomerImportController.php
│   │       │   └── CustomerExportController.php
│   │       ├── Suppliers/
│   │       │   ├── SupplierController.php
│   │       │   ├── SupplierImportController.php
│   │       │   └── SupplierExportController.php
│   │       ├── Brands/
│   │       │   └── BrandController.php
│   │       ├── Categories/
│   │       │   └── CategoryController.php
│   │       ├── Products/
│   │       │   ├── ProductController.php
│   │       │   ├── ProductStockController.php
│   │       │   ├── ProductImportController.php
│   │       │   └── ProductExportController.php
│   │       ├── Sales/
│   │       │   ├── SaleController.php
│   │       │   ├── SaleCancelController.php
│   │       │   ├── SalePaymentController.php
│   │       │   └── SaleReceiptController.php
│   │       ├── Purchases/
│   │       │   ├── PurchaseController.php
│   │       │   ├── PurchaseCancelController.php
│   │       │   └── PurchasePaymentController.php
│   │       ├── Finance/
│   │       │   ├── PayableController.php
│   │       │   ├── ReceivableController.php
│   │       │   └── CashFlowController.php
│   │       ├── Team/
│   │       │   ├── TeamMemberController.php
│   │       │   ├── TeamInvitationController.php
│   │       │   └── TeamRoleController.php
│   │       ├── Reports/
│   │       │   ├── SalesReportController.php
│   │       │   ├── ProductReportController.php
│   │       │   ├── StockReportController.php
│   │       │   ├── FinancialReportController.php
│   │       │   └── CustomerReportController.php
│   │       ├── Imports/
│   │       │   ├── ImportPreviewController.php
│   │       │   └── ImportProcessController.php
│   │       └── Exports/
│   │           ├── ExcelExportController.php
│   │           └── PdfExportController.php
│   │
│   ├── Middleware/
│   │   ├── EnsureCompanySelected.php
│   │   ├── EnsureCompanyMember.php
│   │   ├── EnsureCompanyRole.php
│   │   ├── SetCurrentCompany.php
│   │   └── ShareInertiaData.php
│   │
│   ├── Requests/
│   │   ├── Companies/
│   │   │   ├── StoreCompanyRequest.php
│   │   │   ├── UpdateCompanyRequest.php
│   │   │   └── SwitchCompanyRequest.php
│   │   ├── Customers/
│   │   │   ├── StoreCustomerRequest.php
│   │   │   ├── UpdateCustomerRequest.php
│   │   │   └── ImportCustomerRequest.php
│   │   ├── Suppliers/
│   │   │   ├── StoreSupplierRequest.php
│   │   │   ├── UpdateSupplierRequest.php
│   │   │   └── ImportSupplierRequest.php
│   │   ├── Brands/
│   │   │   ├── StoreBrandRequest.php
│   │   │   └── UpdateBrandRequest.php
│   │   ├── Categories/
│   │   │   ├── StoreCategoryRequest.php
│   │   │   └── UpdateCategoryRequest.php
│   │   ├── Products/
│   │   │   ├── StoreProductRequest.php
│   │   │   ├── UpdateProductRequest.php
│   │   │   ├── AdjustStockRequest.php
│   │   │   └── ImportProductRequest.php
│   │   ├── Sales/
│   │   │   ├── StoreSaleRequest.php
│   │   │   ├── UpdateSaleRequest.php
│   │   │   ├── CancelSaleRequest.php
│   │   │   └── StoreSalePaymentRequest.php
│   │   ├── Purchases/
│   │   │   ├── StorePurchaseRequest.php
│   │   │   ├── UpdatePurchaseRequest.php
│   │   │   └── CancelPurchaseRequest.php
│   │   ├── Finance/
│   │   │   ├── StorePayableRequest.php
│   │   │   ├── UpdatePayableRequest.php
│   │   │   ├── StoreReceivableRequest.php
│   │   │   ├── UpdateReceivableRequest.php
│   │   │   └── StoreFinancialEntryRequest.php
│   │   ├── Team/
│   │   │   ├── InviteTeamMemberRequest.php
│   │   │   ├── UpdateTeamMemberRequest.php
│   │   │   ├── UpdateTeamMemberRoleRequest.php
│   │   │   └── UpdateTeamMemberStatusRequest.php
│   │   ├── Reports/
│   │   │   └── ReportFilterRequest.php
│   │   ├── Imports/
│   │   │   ├── PreviewImportRequest.php
│   │   │   └── ProcessImportRequest.php
│   │   ├── Exports/
│   │   │   └── ExportRequest.php
│   │   └── Settings/
│   │       ├── UpdateCompanySettingsRequest.php
│   │       ├── UpdateAppearanceSettingsRequest.php
│   │       ├── UpdateNotificationSettingsRequest.php
│   │       └── UpdateSecuritySettingsRequest.php
│   │
│   └── Resources/
│       ├── Auth/
│       │   └── AuthenticatedUserResource.php
│       ├── Companies/
│       │   ├── CompanyResource.php
│       │   ├── CompanyListResource.php
│       │   └── CurrentCompanyResource.php
│       ├── Customers/
│       │   ├── CustomerResource.php
│       │   ├── CustomerListResource.php
│       │   └── CustomerDetailsResource.php
│       ├── Suppliers/
│       │   ├── SupplierResource.php
│       │   ├── SupplierListResource.php
│       │   └── SupplierDetailsResource.php
│       ├── Brands/
│       │   ├── BrandResource.php
│       │   └── BrandListResource.php
│       ├── Categories/
│       │   ├── CategoryResource.php
│       │   └── CategoryListResource.php
│       ├── Products/
│       │   ├── ProductResource.php
│       │   ├── ProductListResource.php
│       │   ├── ProductDetailsResource.php
│       │   └── StockMovementResource.php
│       ├── Sales/
│       │   ├── SaleResource.php
│       │   ├── SaleListResource.php
│       │   ├── SaleDetailsResource.php
│       │   ├── SaleItemResource.php
│       │   ├── SalePaymentResource.php
│       │   └── SaleReceiptResource.php
│       ├── Purchases/
│       │   ├── PurchaseResource.php
│       │   ├── PurchaseListResource.php
│       │   ├── PurchaseDetailsResource.php
│       │   ├── PurchaseItemResource.php
│       │   └── PurchasePaymentResource.php
│       ├── Finance/
│       │   ├── PayableResource.php
│       │   ├── ReceivableResource.php
│       │   ├── FinancialEntryResource.php
│       │   └── CashFlowResource.php
│       ├── Team/
│       │   ├── TeamMemberResource.php
│       │   └── TeamInvitationResource.php
│       ├── Reports/
│       │   ├── SalesReportResource.php
│       │   ├── ProductReportResource.php
│       │   ├── StockReportResource.php
│       │   ├── FinancialReportResource.php
│       │   └── CustomerReportResource.php
│       ├── Imports/
│       │   ├── ImportPreviewResource.php
│       │   └── ImportBatchResource.php
│       └── Exports/
│           └── ExportBatchResource.php
│
├── Models/
│   ├── User.php
│   ├── Company.php
│   ├── CompanyUser.php
│   ├── Customer.php
│   ├── CustomerAddress.php
│   ├── Supplier.php
│   ├── SupplierAddress.php
│   ├── Brand.php
│   ├── Category.php
│   ├── Product.php
│   ├── StockMovement.php
│   ├── Sale.php
│   ├── SaleItem.php
│   ├── SalePayment.php
│   ├── Purchase.php
│   ├── PurchaseItem.php
│   ├── PurchasePayment.php
│   ├── Payable.php
│   ├── Receivable.php
│   ├── FinancialEntry.php
│   ├── TeamInvitation.php
│   ├── ActivityLog.php
│   ├── ImportBatch.php
│   ├── ExportBatch.php
│   └── Receipt.php
│
├── Policies/
│   ├── CompanyPolicy.php
│   ├── CustomerPolicy.php
│   ├── SupplierPolicy.php
│   ├── BrandPolicy.php
│   ├── CategoryPolicy.php
│   ├── ProductPolicy.php
│   ├── SalePolicy.php
│   ├── PurchasePolicy.php
│   ├── PayablePolicy.php
│   ├── ReceivablePolicy.php
│   ├── TeamPolicy.php
│   ├── ReportPolicy.php
│   └── SettingsPolicy.php
│
├── Repositories/
│   ├── Contracts/
│   │   ├── CompanyRepositoryInterface.php
│   │   ├── CustomerRepositoryInterface.php
│   │   ├── SupplierRepositoryInterface.php
│   │   ├── BrandRepositoryInterface.php
│   │   ├── CategoryRepositoryInterface.php
│   │   ├── ProductRepositoryInterface.php
│   │   ├── SaleRepositoryInterface.php
│   │   ├── PurchaseRepositoryInterface.php
│   │   ├── PayableRepositoryInterface.php
│   │   ├── ReceivableRepositoryInterface.php
│   │   ├── TeamRepositoryInterface.php
│   │   └── ReportRepositoryInterface.php
│   │
│   └── Eloquent/
│       ├── CompanyRepository.php
│       ├── CustomerRepository.php
│       ├── SupplierRepository.php
│       ├── BrandRepository.php
│       ├── CategoryRepository.php
│       ├── ProductRepository.php
│       ├── SaleRepository.php
│       ├── PurchaseRepository.php
│       ├── PayableRepository.php
│       ├── ReceivableRepository.php
│       ├── TeamRepository.php
│       └── ReportRepository.php
│
├── Services/
│   ├── Auth/
│   │   ├── AuthService.php
│   │   ├── TokenService.php
│   │   └── TwoFactorService.php
│   ├── Companies/
│   │   ├── CompanyService.php
│   │   ├── CompanyContextService.php
│   │   ├── CompanyBrandingService.php
│   │   └── CompanyPermissionService.php
│   ├── Customers/
│   │   └── CustomerService.php
│   ├── Suppliers/
│   │   └── SupplierService.php
│   ├── Brands/
│   │   └── BrandService.php
│   ├── Categories/
│   │   └── CategoryService.php
│   ├── Products/
│   │   ├── ProductService.php
│   │   ├── StockService.php
│   │   └── StockAlertService.php
│   ├── Sales/
│   │   ├── SaleService.php
│   │   ├── SaleItemService.php
│   │   ├── SalePaymentService.php
│   │   ├── SaleCancelService.php
│   │   └── SaleReceiptService.php
│   ├── Purchases/
│   │   ├── PurchaseService.php
│   │   ├── PurchaseItemService.php
│   │   ├── PurchasePaymentService.php
│   │   └── PurchaseCancelService.php
│   ├── Finance/
│   │   ├── PayableService.php
│   │   ├── ReceivableService.php
│   │   ├── FinancialEntryService.php
│   │   └── CashFlowService.php
│   ├── Team/
│   │   ├── TeamService.php
│   │   ├── TeamInvitationService.php
│   │   └── TeamRoleService.php
│   ├── Dashboard/
│   │   ├── DashboardKpiService.php
│   │   ├── DashboardChartService.php
│   │   └── DashboardAlertService.php
│   ├── Reports/
│   │   ├── SalesReportService.php
│   │   ├── ProductReportService.php
│   │   ├── StockReportService.php
│   │   ├── FinancialReportService.php
│   │   └── CustomerReportService.php
│   ├── Imports/
│   │   ├── ImportService.php
│   │   ├── ImportPreviewService.php
│   │   ├── CustomerImportService.php
│   │   ├── SupplierImportService.php
│   │   └── ProductImportService.php
│   └── Exports/
│       ├── ExportService.php
│       ├── ExcelExportService.php
│       ├── PdfExportService.php
│       └── ReportExportService.php
│
├── Support/
│   ├── Company/
│   │   └── CurrentCompany.php
│   ├── QueryBuilder/
│   │   ├── AppliesSearch.php
│   │   ├── AppliesFilters.php
│   │   ├── AppliesSorting.php
│   │   └── AppliesPagination.php
│   ├── Money/
│   │   └── MoneyFormatter.php
│   ├── Documents/
│   │   ├── PdfGenerator.php
│   │   └── ExcelGenerator.php
│   └── Receipts/
│       ├── ReceiptNumberGenerator.php
│       └── ThermalReceiptFormatter.php
│
└── Traits/
    ├── BelongsToCompany.php
    ├── HasStatus.php
    ├── HasUuid.php
    ├── HasSearch.php
    └── RecordsActivity.php
```

---

## Estrutura complementar fora do `app/`

```txt
routes/
├── web.php
├── api.php
├── auth.php
└── console.php

config/
├── sanctum.php
├── auth.php
├── operis.php
└── permissions.php

database/
├── migrations/
│   ├── companies/
│   ├── customers/
│   ├── suppliers/
│   ├── products/
│   ├── sales/
│   ├── purchases/
│   ├── finance/
│   ├── team/
│   ├── imports/
│   └── exports/
├── seeders/
│   ├── CompanySeeder.php
│   ├── UserSeeder.php
│   ├── BrandSeeder.php
│   ├── CategorySeeder.php
│   ├── ProductSeeder.php
│   └── DemoDataSeeder.php
└── factories/
    ├── CompanyFactory.php
    ├── UserFactory.php
    ├── CustomerFactory.php
    ├── SupplierFactory.php
    ├── ProductFactory.php
    ├── SaleFactory.php
    └── PurchaseFactory.php

tests/
├── Feature/
│   ├── Auth/
│   ├── Companies/
│   ├── Customers/
│   ├── Suppliers/
│   ├── Products/
│   ├── Sales/
│   ├── Purchases/
│   ├── Finance/
│   ├── Team/
│   └── Reports/
└── Unit/
    ├── Services/
    ├── Repositories/
    └── Policies/
```

---

## Responsabilidade de cada camada

### Controllers

Responsáveis por receber a requisição, chamar os serviços e retornar a resposta adequada.

- Controllers em `Web/` retornam páginas Inertia.
- Controllers em `Api/` retornam JSON para o frontend e integrações.

### Requests

Responsáveis por validar os dados enviados pelo usuário.

Exemplos:

- `StoreCustomerRequest.php`
- `UpdateProductRequest.php`
- `StoreSaleRequest.php`
- `ReportFilterRequest.php`

### Resources

Responsáveis por padronizar a resposta da API.

Exemplos:

- `CustomerListResource.php`
- `ProductDetailsResource.php`
- `SaleReceiptResource.php`

### Services

Responsáveis pelas regras de negócio.

Exemplos:

- Criar venda.
- Baixar estoque.
- Gerar contas a receber.
- Criar compra.
- Atualizar estoque.
- Gerar relatórios.

### Repositories

Responsáveis por consultas e persistência mais complexas.

São úteis principalmente para:

- filtros;
- busca;
- ordenação;
- paginação;
- relatórios;
- escopo multiempresa;
- queries reutilizadas.

### Models

Representam as entidades principais do sistema.

Exemplos:

- `Company`
- `Customer`
- `Product`
- `Sale`
- `Purchase`
- `Payable`
- `Receivable`

### Policies

Responsáveis por autorização.

Exemplos:

- Admin pode gerenciar tudo.
- Supervisor pode acessar módulos operacionais, mas não configurações.
- User pode ter acesso mais limitado.

### Enums

Responsáveis por padronizar valores fixos do sistema.

Exemplos:

- status de venda;
- status de compra;
- formas de pagamento;
- roles;
- tipos de movimentação de estoque.

---

## Ordem recomendada de implementação

```txt
1. Auth + Sanctum + Fortify
2. Multiempresa
3. Roles e permissões backend
4. Clientes
5. Fornecedores
6. Marcas
7. Categorias
8. Produtos
9. Estoque
10. Vendas
11. Compras
12. Contas a receber
13. Contas a pagar
14. Dashboard real
15. Relatórios
16. Importação/exportação
17. Comprovantes
18. Configurações finais
```

---

