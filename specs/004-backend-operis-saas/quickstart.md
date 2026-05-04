# Quickstart: Backend Operis SaaS (Phase 1)

## 1. Preconditions

- Branch atual: `004-backend-operis-saas`
- Spec base: `specs/004-backend-operis-saas/spec.md`
- Plan: `specs/004-backend-operis-saas/plan.md`

## 2. Setup

1. Garantir migrations base aplicadas:
- users, fortify, cache/jobs.
2. Criar migrations da fase:
- companies, company_users, onboarding code, modulos operacionais.
3. Configurar `routes/api.php` e middlewares:
- `auth`, `EnsureUserHasCompany`, `EnsureCompanyIsVerified`, `SetCurrentCompany`.

## 3. Implementation Sequence

1. Onboarding:
- Company + verification code + resend policy.
2. Cadastros:
- Customers, Suppliers, Brands, Categories, Products.
3. Estoque:
- StockMovement e regras de saldo.
4. Vendas:
- Sales + SaleItems + SalePayments + AccountReceivables linkage.
5. Compras:
- Purchases + PurchaseItems + PurchasePayments + AccountPayables linkage.
6. Financeiro:
- leitura de receivables/payables + settle de payables.
7. Importacao:
- preview + confirm no mesmo fluxo.

## 4. Validation Checklist

- Onboarding bloqueia dashboard sem empresa verificada.
- Reenvio de codigo respeita 1 min cooldown e 5/h.
- CRUD escopado por empresa atual.
- Delete com vinculo gera inativacao, nao hard delete.
- Venda concluida baixa estoque e pode ficar negativo.
- Compra concluida aumenta estoque.
- Cancelamento estorna/compensa estoque e financeiro.
- Receivable nao tem baixa manual.
- Payable permite baixa manual com data e metodo.
- Import preview retorna validas/invalidas/duplicadas e confirmacao no mesmo fluxo.

## 5. Test Commands

```powershell
php artisan test --compact --filter=Onboarding
php artisan test --compact --filter=Customer
php artisan test --compact --filter=Supplier
php artisan test --compact --filter=Product
php artisan test --compact --filter=Sale
php artisan test --compact --filter=Purchase
php artisan test --compact --filter=AccountPayable
php artisan test --compact --filter=Import
```

## 6. Formatting

Se houver alteracao em PHP:

```powershell
vendor/bin/pint --dirty --format agent
```

