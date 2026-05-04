# Clarifications Log: Backend Operis SaaS

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-05-04  
**Phase**: Pre-plan

## Decisions Confirmed

1. Onboarding code resend limit:
- Max `5` resends per hour per user/company.
- Cooldown remains `1` minute.

2. Sales payment model:
- `sale_payments` stores payment condition.
- `account_receivables` stores generated installments.

3. Purchase payment model:
- `purchase_payments` stores payment condition.
- `account_payables` stores generated installments.

4. Edit concluded sale/purchase with settled finance:
- Recalculate only when there is no settlement.
- If already settled, block financial edit.
- Exception: allow return/refund flow with compensating adjustments.

5. Import preview persistence:
- Preview is not persisted for later reuse.
- User must confirm import in the same flow, or cancel.

6. Required fields baseline:
- Customer/Supplier: `name`.
- Brand/Category: `name`.
- Product: `name`, `sku`, `sale_price`, `cost`, `stock`, `category_id`, `brand_id`.

7. Enum strategy:
- Use minimal canonical enum set in this phase.

8. Product identity:
- `sku` required and unique per company.
- `barcode` optional and unique when provided.

## Open Points Before Plan

1. Return/refund backend flow:
- Required definition: dedicated endpoint(s), state transitions, and stock/financial side effects.

2. Installment generation rules:
- Required definition: due-date generation and rounding/distribution strategy.

3. `company_users.role` values for this phase:
- Required definition: minimal role set to persist now while team module is out of scope.

## Recommendation

- Proceed to `/speckit.plan` only after closing the 3 open points above.

