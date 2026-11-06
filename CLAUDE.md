# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Operis is a multi-tenant business management SaaS (sales, purchases, inventory, accounts receivable/payable, reports). The domain language, UI copy, and much of the docs are in Brazilian Portuguese. `AGENTS.md` holds the Laravel Boost guidelines (versions, Boost MCP tools, Pint/Pest/Inertia rules) and a running dev log; follow it. Project skills live in `.agents/skills/` (pest-testing, inertia-react-development, wayfinder-development, tailwindcss-development, laravel-best-practices, speckit-*). Domain specs are in `docs/` and `specs/`.

## Commands

```bash
composer run dev                 # artisan serve + queue:listen + vite, all at once
pnpm dev / pnpm build            # Vite only

DB_DATABASE=operis_test_main php artisan test --compact                            # all tests
DB_DATABASE=operis_test_main php artisan test --compact tests/Feature/Sales        # one directory/file
DB_DATABASE=operis_test_main php artisan test --compact --filter="creates a sale"  # one test

vendor/bin/pint --dirty --format agent   # format changed PHP (required after PHP edits)
pnpm lint            # eslint --fix
pnpm format          # prettier on resources/
pnpm types:check     # tsc --noEmit
composer run ci:check  # eslint + prettier + tsc + pint --test + tests
php artisan wayfinder:generate   # regenerate TS route/action helpers
```

Tests run against **MySQL** (`phpunit.xml` sets `DB_CONNECTION=mysql`, not sqlite), so a MySQL database must be reachable. Feature tests use `RefreshDatabase` automatically (`tests/Pest.php`), which wipes whatever database is configured: always pass `DB_DATABASE=operis_test_main` (a test-only database in the Docker MySQL) so the dev data survives. Page tests read the Vite manifest; if they fail with "Unable to locate file in Vite manifest" and the dev server is not running, run `npx vite build` first.

`vite.config.ts` ignores `**/.claude/**`: agent worktrees live there with their own `vendor`/`node_modules` and used to exhaust the file watcher (`ENOSPC`), killing `composer run dev`.

## Architecture

### Two separate HTTP surfaces
- **`routes/web.php`** only renders Inertia shells (`Route::inertia('dashboard/sales', 'dashboard/sales')`) — no page props carry data. Pages in `resources/js/pages/dashboard/*.tsx` are thin wrappers that render a module from `resources/js/features/dashboard/<module>/`.
- **`routes/api.php`** is a JSON REST API (Sanctum stateful/cookie auth via `statefulApi()`). All data is fetched client-side from it. Business routes sit behind the middleware chain `auth:sanctum → company.current → company.user → company.member → company.verified` (aliases defined in `bootstrap/app.php`).

### Multi-tenancy
Tenant = `Company`. The active tenant is `users.current_company_id` (resolved by `SetCurrentCompany` / `CurrentCompanyResolver`). Tenant-owned models use the `BelongsToCompany` trait (`scopeForCompany`), and controllers pass `auth()->user()->current_company_id` explicitly into services. Always scope queries by company; authorize model-bound actions via Policies (`$this->authorize('view', $sale)`).

### Backend layering
`Controller (Api/<Domain>/) → FormRequest (Requests/<Domain>/) → Service (Services/<Domain>/) → Repository (Repositories/Contracts + Eloquent, bound in AppServiceProvider) → Model`, responses via `Http/Resources/<Domain>/` wrapped as `{ data: ... }`. Single-action endpoints (cancel, payment/settlement, import) are invokable controllers. Status values are PHP enums in `app/Enums` (`SaleStatus`, `PurchaseStatus`, `FinancialStatus`, `PaymentMethod`, `StockMovementType`, ...).

### Cross-domain side effects (the core business logic)
`SaleService` and the purchase service orchestrate, inside `DB::transaction`:
- **Stock**: every create/update/cancel/delete writes `StockMovement`s through `StockMovementService` (update applies a diff between old and new items; cancel/delete reverse). `allow_negative_stock` bypasses the availability check.
- **Finance**: sales generate `AccountReceivable` installments via `ReceivableService` (payment method `crediario` = store credit installments, with `paid_installments` marking some as already received); purchases generate `AccountPayable` via `PayableService`. Canceling the sale/purchase must cancel its financial records, and a sale becomes `completed` once all receivables are `Received`/`Cancelled`.
When changing any of these flows, check the stock and financial effects together.

### Sales rules (do not regress)
These rules come from the November 2026 sales review. The customer-facing write-up (before / why / fix / now for each bug) is in `README.md` under "Correções em vendas".
- **Discount:** `sales.discount` is persisted; `total = subtotal − discount`, computed in one place in `SaleService` for create and update. A discount above the subtotal is a 422. Receivables, crediário entry, `installment_value`, the credit limit and the receipt all use the discounted total. Before the fix the column did not exist and the API dropped the field, so sales were saved at full price.
- **Installments:** split in cents with floor; the remainder goes on the last one (`220/3 = 73.33 + 73.33 + 73.34`). The API and the front (`utils/sale-installments.ts` → `splitInstallments`) must use the same rule. Each installment used to be rounded alone and lost cents.
- **Crediário:** the first due date comes from `first_installment_date` (default sale date + 30 days), then month by month clamped to month end. Installments split the financed balance (total − entry), not the total. The credit limit counts only open receivables and excludes the sale being edited. `paid_installments` is sent on update too, otherwise paid installments were recreated as open.
- **Stock:** every create/update/cancel/delete derives the delta from the sale's own `StockMovement` balance, never from the status. Stock leaves on creation in any status. Edit applies only the item diff. Cancel and delete return only what the sale still holds, so the stock comes back once, whatever the order of actions. The old code branched on status, which returned stock on completed → pending and did not adjust pending sales.
- **Cancel:** cancels open/partial receivables, keeps received ones, and returns stock in the same transaction with the sale locked. Settling or reversing a receivable of a cancelled sale is a 422. Before, cancel only flipped the status, and receivable settlements re-derived the sale status and "un-cancelled" it.
- **History:** `sale_events` via `SaleHistoryService` (registered, edited, payment received/reversed, delivered, completed, cancelled). It keeps `completed_at`/`cancelled_at` in sync with the status.
- **Front:** details read each installment's `total_amount` (`amount` is the open balance and is 0 once received/cancelled). Date-only timestamps (`T00:00:00Z`) are shown without timezone conversion (`formatReceivedAt`), otherwise Manaus shows the previous day. Legacy `payment_method` values `card`/`installment` keep labels and filter options. Money inputs are built with `Math.round(value * 100)` (`toMoneyInput`), because `19.99 * 100` is `1998.9999…` and the mask turned it into a huge price.
- **Receipt** (`utils/sale-documents.ts`): the digital preview and the A4 PDF are built from the same `buildReceiptData(sale)`, so they always show the same thing. Status is colored (Paga/Pendente/Cancelada), and the balance comes from the entry and the installments (it used to be derived only from the status, which printed "Valor pago R$ 0,00" on crediário with an entry). Crediário installments are listed with their due dates, and the PDF uses `jspdf-autotable` so long sales break pages. Unsaved sales (`id = 0`) print "Nova venda" (`formatSaleNumber`, also used by ESC/POS). Every user text that goes into the `srcDoc` HTML passes through `escapeHtml`. To check the PDF without a browser, load the module with Vite's `ssrLoadModule` (with `jspdf` external) and rasterize with `pdftoppm`.
- **Wizard** (`sales/components/create-edit-modal/`): 4 steps (products → client & cart → payment → summary). Steps 2 and 3 are one `StepCard` (centered, `max-w-3xl`, sections divided by borders), each part a `StepSection` (icon + title + description) ending in `TotalsSection`. Payment options come from `CHECKOUT_PAYMENT_OPTIONS` (label, hint, icon). Adding a product shows an inline confirmation (`CartAddedNotice`). The summary is a single card that asks "O cliente já pagou?" (`SALE_PAYMENT_ANSWERS`), or which installments were paid on crediário. The form is remounted on every open (`key` on `SaleForm`), otherwise it reopened with the previous sale. The modal closes only after the API saves, so a 422 keeps the cart.
- **Not recoverable:** discounts of sales saved before the fix were never stored. Pending sales cancelled before the fix never had their stock returned, and stock has moved since, so they were left as is.

### Purchases rules (do not regress)
These rules come from the November 2026 purchases migration (same pattern as sales). The customer-facing write-up is in `README.md` under "Compras".
- **Listing:** `GET /api/purchases` takes `IndexPurchaseRequest` (filters `supplier`, `product`, `category_id`, `brand_id`, `status`, `payment_method`; sort `date`, `due_date`, `total`, `created_at`; period on `date`). Without parameters it answers as before (15 per page, newest first), which Visão Geral and Relatórios rely on through `usePurchases()`. The resource returns `supplier_name`, `notes`, and `payables` on the show endpoint.
- **Stock:** create/update/cancel/delete use `StockMovementService::reconcile` with `reference_type = 'purchase'`. The target is the negative quantity per product (stock that came in), lines of the same product added up. Cancel and delete take out only what the purchase still added, so delete after cancel does not take it out twice. The old code took stock out once on cancel and again on delete, and the edit diff was keyed by product, so a second line of the same product overwrote the first.
- **Payables on edit:** `PurchaseService::syncPayables` rebuilds the payables only when what defines them changed (total, payment method, boleto term, date, due date or status). Notes, supplier, or items with the same total only refresh `supplier_id` and the item summary (`PayableService::syncPurchaseDetails`). A purchase that stays pending and already has a payment settled in contas a pagar cannot change those fields (422); the user must undo the settlement first. The old code always deleted and recreated the payables, which silently dropped payments.
- **Boleto:** `boleto_term_days` (30–150) means one boleto every 30 days: 60 = 2 boletos, at 30 and 60 days after the purchase date (`addDays(30 * n)`, not months). The leftover cents go on the **first** boletos (`PayableService::regenerateFromPurchase`). `purchase.due_date` is the last due date. The wizard preview (`splitBoletos`) mirrors this exactly. Non-boleto purchases store `boleto_term_days = null`.
- **Cash:** a cash payable is always created as paid, so the wizard always sends `status = completed` for Dinheiro (a pending cash purchase used to stay pending forever with a paid payable).
- **Notes:** `purchases.notes` (≤ 1000 chars). The old dialog had the field but never sent it.
- **Front:** module in `pages/dashboard/purchases/` with the sales wizard copied, not shared (products → supplier & cart → payment → summary). No discount, no receipt/print. "Novo fornecedor" reuses the suppliers `CreateEditModal` (alias import) with the new `initialName` prop. Table columns: Data, Vencimento, Fornecedor, Produto, Categoria, Marca, Total, Status, M. Pagamento, Boletos. Cancelled purchases are listed (the old screen hid them).

### Frontend
- React 19 + TypeScript + Inertia v3, React Compiler enabled, Tailwind v4, shadcn-style components in `components/ui`.
- Data flow: `lib/apiClient.ts` (fetch wrapper, `credentials: 'include'`) → `services/<entity>.ts` → TanStack Query hooks in `hooks/use-<entity>.ts` (export query keys; mutations invalidate related keys, e.g. sales invalidate products/customers/receivables) → feature components. API entity TypeScript interfaces live in `schemas/`.
- Forms use `react-hook-form`; currency inputs use BRL masks; dates are formatted in the `America/Manaus` timezone.
- `resources/js/actions`, `resources/js/routes`, `resources/js/wayfinder` are **generated by Wayfinder** — don't edit by hand.

### Front-end module structure
Migrated modules (inventory, clients, suppliers, categories, brands, sales, purchases) live entirely in `resources/js/pages/dashboard/<module>/`; `resources/js/features/` is legacy and shrinks as modules move:
- `index.tsx` (list page, `ServerTable` + `useServerTableState`) and `show.tsx` (details page built with `components/details-page.tsx`).
- `components/<name>/index.tsx`: one component per file, named after its folder; never two components in one index and no re-exports. Big dialogs are split into sibling files inside the folder (e.g. `sales/components/create-edit-modal/`). The create/edit modal is always `CreateEditModal`.
- `utils/constants.ts` (every fixed object/label map), `utils/functions.ts` (functions and module-only hooks), `utils/schemas.ts` (Zod, mirroring the backend FormRequest rules, messages from `constants/validation-messages.ts`), `utils/types.ts` (all types, props included).
- Code used by 2+ modules is global (`components/`, `utils/`, `hooks/`). Exception: cadastro modals (product, client, supplier, category, brand) stay in their module and other modules import them with an alias (`import { CreateEditModal as ClientCreateEditModal } ...`).
- Forms: React Hook Form + shadcn `Form` + Zod. Keep comments minimal (no banners).

### Base path
Production is served under a `/operis` path prefix on the host domain, so Laravel itself sees `/api/...` (`config/api.php`) while the browser calls `/operis/api` (`resources/js/config/api.ts`). Vite `base` comes from `VITE_APP_BASE_PATH` (default `/operis`). Keep URLs relative to these settings rather than hardcoding `/` or `/operis`: build them with `withAppBasePath()` (`resources/js/constants/workspace.ts`), as `config/api.ts` does.

Local development: `.env` holds the dev settings (`APP_URL=http://localhost:8000`, empty `ASSET_URL` and `VITE_APP_BASE_PATH`, `SESSION_PATH=/`) and `.env.production` (gitignored) keeps the production values. Restart `composer run dev` after changing `VITE_*` variables.

### Public landing page & SEO
`/` renders the landing (`resources/js/features/home/`) for guests and redirects signed-in users to the dashboard. SEO text, keywords, the FAQ and the "Últimas atualizações" entries (`updates`, the 3 newest are shown; write them for customers) live in `config/landing.php`; the FAQ is sent to the page as an Inertia prop and also printed as FAQPage JSON-LD by `resources/views/partials/landing-seo.blade.php`, so both always match. Meta/Open Graph tags are server-rendered (no SSR). `public/robots.txt`, `llms.txt`, `og-image.png` (source: `docs/brand/og-image.html`) and the favicons are copied to the web dir on deploy; crawlers only read robots.txt at the **domain root**.

### Keeping "Últimas atualizações" current
Whenever a change is significant for customers (a new feature, a noticeable improvement, or a fix they would notice), add an entry to `updates` in `config/landing.php` in the same change: `date` (YYYY-MM-DD of the change), `type` (`novidade` | `melhoria` | `correcao`), a short `title` and a one-sentence `description` written for the customer (no technical/commit language, no promises the code does not keep). Internal work (refactors, tests, deploy, tooling) does not go there. The landing shows the 3 newest automatically.

### Dev auth bypass
`BypassAuth` (web middleware) auto-logs in the first user when `BYPASS_AUTH=true` in `.env`.

## Deployment & commits
- Push to `main` deploys to production (cPanel, FTP only — no SSH) via `.github/workflows/deploy-production-ftp.yml`: CI builds a single `release.zip` (code + `vendor` + `public/build`), uploads it plus `.github/deploy/receiver.php` (as `_deploy.php` in the web dir), then POSTs to the receiver, which swaps app dirs, copies public assets (preserving the server's `index.php`/`.htaccess`) and runs `migrate --force`, `config:cache`, `event:cache`, `view:cache`, `queue:restart`. Routes are deliberately **not** cached (`route:cache`/`optimize`): served from the `/operis` subdirectory, Laravel's compiled route matcher returns 405 for the root URL `/operis/`. Be deliberate about what lands on `main`; new migrations run automatically on deploy.
- Server layout: app at `~/repositories/Operis-Saas`, web dir `~/public_html/dg/operis` (https://www.dgcomputer.com.br/operis). Previous release is kept in `storage/app/deploy/previous` for manual rollback.
- Commit messages follow `.agents/skills/commit-convention.md`: `type(area): summary` with types `feat|fix|docs|chore`, plus a bulleted body listing what changed.
