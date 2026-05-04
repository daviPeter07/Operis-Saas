# Backend API Contract: Operis SaaS (Phase 1)

## 1. Contract Goals

- Substituir consumo de mocks no frontend atual por endpoints reais.
- Garantir escopo por empresa atual (`company_id` implícito pelo contexto autenticado).
- Cobrir apenas modulos dentro do escopo aprovado.

## 2. Auth & Onboarding

### GET `/api/auth/me`

- Returns:
- user
- current_company
- onboarding_state (`needs_company`|`needs_verification`|`ready`)

### POST `/api/onboarding/company`

- Body:
- `name`, `document`, `logo?`, `address`, `phone`, `email`, `city`, `state`
- Rules:
- cria empresa, vincula usuario, envia codigo de verificacao.

### POST `/api/onboarding/verify-code`

- Body:
- `code`
- Effects:
- valida codigo, marca `users.email_verified_at`, `companies.verified_at`, define `users.current_company_id`.

### POST `/api/onboarding/resend-code`

- Rules:
- cooldown 1 minuto
- max 5 reenvios/hora por usuario/empresa

## 3. CRUD Endpoints (Pattern)

Pattern por modulo:

- `GET /api/{module}` list
- `POST /api/{module}` create
- `GET /api/{module}/{id}` show
- `PUT /api/{module}/{id}` update
- `DELETE /api/{module}/{id}` delete/inactivate by business rule

Modules:

- customers
- suppliers
- brands
- categories
- products
- sales
- purchases
- account-receivables (sem create manual)
- account-payables

## 4. Sales Operations

### POST `/api/sales`

- Body:
- header (`customer_id`, `date`, `status`, `payment_method`, totals)
- items (`product_id`, `quantity`, `unit_price`)
- payment_condition (`installments_count`, `first_due_date`, `method`)

### PUT `/api/sales/{id}`

- Rules:
- venda cancelada nao edita
- venda concluida ajusta estoque por diferenca
- com financeiro liquidado, bloquear edicao financeira (exceto fluxo de devolucao/reembolso)

### POST `/api/sales/{id}/cancel`

- Effects:
- devolve/compensa estoque
- cancela/ajusta contas a receber

## 5. Purchase Operations

### POST `/api/purchases`

- Body:
- header (`supplier_id`, `date`, `due_date`, `status`, `payment_method`, totals)
- items (`product_id`, `quantity`, `unit_cost`)
- payment_condition (`installments_count`, `first_due_date`, `method`)
- `update_product_cost` (boolean)

### PUT `/api/purchases/{id}`

- Rules:
- compra cancelada nao edita
- compra concluida ajusta efeitos conforme diferenca e estado financeiro

### POST `/api/purchases/{id}/cancel`

- Effects:
- estorna/compensa estoque
- cancela/ajusta contas a pagar

## 6. Finance Operations

### GET `/api/account-receivables`

- listagem com filtros
- sem baixa manual nesta fase

### GET `/api/account-payables`

- listagem com filtros

### POST `/api/account-payables/{id}/settle`

- Body:
- `paid_at`, `paid_method`, `payment_notes?`
- Effects:
- baixa manual da conta a pagar

## 7. Import Operations

### POST `/api/import/{module}/preview`

- module:
- customers|suppliers|brands|categories|products
- File:
- `.xlsx`|`.xls`|`.csv`
- Returns:
- valid_rows
- invalid_rows (with line errors)
- duplicate_rows
- preview_token (ephemeral)

### POST `/api/import/{module}/confirm`

- Body:
- `preview_token`
- `duplicate_strategy` (`ignore`|`update`)
- Rules:
- confirmacao no mesmo fluxo; preview nao persistido para uso tardio

## 8. Standard Response Shapes

### Success

```json
{
  "data": {},
  "meta": {},
  "message": "ok"
}
```

### Validation Error

```json
{
  "message": "validation_failed",
  "errors": {
    "field": ["..."]
  }
}
```

### Domain Error

```json
{
  "message": "business_rule_violation",
  "code": "CANNOT_DELETE_WITH_HISTORY"
}
```

