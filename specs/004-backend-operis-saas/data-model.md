# Data Model: Backend Operis SaaS

## 1. Overview

Modelo relacional para backend operacional do Operis com escopo por `company_id`, preparado para multiempresa futura.

## 2. Core Entities

### User

- id
- name
- email (unique)
- password
- email_verified_at
- current_company_id (nullable fk -> companies.id)
- created_at
- updated_at

### Company

- id
- name
- logo (nullable)
- document_type (`cpf`|`cnpj`)
- document (unique global)
- address
- phone
- email
- city
- state
- verified_at (nullable)
- created_at
- updated_at

### CompanyUser

- id
- company_id (fk)
- user_id (fk)
- role
- status
- created_at
- updated_at

Constraints:

- unique(company_id, user_id)

### CompanyVerificationCode

- id
- company_id (fk)
- user_id (fk)
- code_hash
- expires_at
- used_at (nullable)
- sent_at
- created_at
- updated_at

Rules:

- novo codigo invalida o anterior ativo do mesmo usuario/empresa.

## 3. Operational Catalog Entities

### Customer

- id
- company_id (fk)
- name
- email (nullable)
- phone (nullable)
- document (nullable)
- status (`active`|`inactive`)
- created_at
- updated_at

Suggested indexes:

- index(company_id, status)
- index(company_id, document)
- index(company_id, email)

### Supplier

- id
- company_id (fk)
- name
- email (nullable)
- phone (nullable)
- document (nullable)
- status (`active`|`inactive`)
- created_at
- updated_at

### Brand

- id
- company_id (fk)
- name
- status (`active`|`inactive`)
- created_at
- updated_at

Constraints:

- unique(company_id, name)

### Category

- id
- company_id (fk)
- parent_id (nullable fk -> categories.id)
- name
- status (`active`|`inactive`)
- created_at
- updated_at

Constraints:

- unique(company_id, name)

### Product

- id
- company_id (fk)
- category_id (fk)
- brand_id (fk)
- name
- sku
- barcode (nullable)
- description (nullable)
- sale_price (decimal)
- cost (decimal)
- stock (decimal/int)
- min_stock (decimal/int nullable)
- status (`active`|`inactive`)
- created_at
- updated_at

Constraints:

- unique(company_id, sku)
- unique(company_id, barcode) where barcode is not null

## 4. Stock Entities

### StockMovement

- id
- company_id (fk)
- product_id (fk)
- type
- quantity_delta (signed numeric)
- reference_type (sale|purchase|manual_adjustment|refund)
- reference_id
- notes (nullable)
- created_by (fk -> users.id nullable)
- created_at
- updated_at

Rules:

- toda alteracao de estoque gera movimento.

## 5. Sales & Receivables

### Sale

- id
- company_id (fk)
- customer_id (fk)
- date
- subtotal (decimal)
- total (decimal)
- status (`pending`|`completed`|`cancelled`)
- payment_method
- created_at
- updated_at

### SaleItem

- id
- company_id (fk)
- sale_id (fk)
- product_id (fk)
- quantity
- unit_price (decimal)
- subtotal (decimal)
- created_at
- updated_at

### SalePayment

- id
- company_id (fk)
- sale_id (fk)
- method
- installments_count (default 1)
- first_due_date (nullable)
- metadata_json (nullable)
- created_at
- updated_at

### AccountReceivable

- id
- company_id (fk)
- sale_id (fk nullable)
- installment_number (nullable)
- due_date
- amount (decimal)
- status (`pending`|`received`|`cancelled`)
- received_at (nullable)
- created_at
- updated_at

Rules:

- nao permite baixa manual nesta fase.
- status vencido e derivado por consulta (`due_date` < hoje e status `pending`).

## 6. Purchases & Payables

### Purchase

- id
- company_id (fk)
- supplier_id (fk)
- date
- due_date (nullable)
- total (decimal)
- status (`pending`|`completed`|`cancelled`)
- payment_method
- created_at
- updated_at

### PurchaseItem

- id
- company_id (fk)
- purchase_id (fk)
- product_id (fk)
- quantity
- unit_cost (decimal)
- subtotal (decimal)
- created_at
- updated_at

### PurchasePayment

- id
- company_id (fk)
- purchase_id (fk)
- method
- installments_count (default 1)
- first_due_date (nullable)
- metadata_json (nullable)
- created_at
- updated_at

### AccountPayable

- id
- company_id (fk)
- purchase_id (fk nullable)
- installment_number (nullable)
- due_date
- amount (decimal)
- status (`pending`|`paid`|`cancelled`)
- paid_at (nullable)
- paid_method (nullable)
- payment_notes (nullable)
- created_at
- updated_at

Rules:

- baixa manual obrigatoria para pagamento efetivo.

## 7. Import Entity

### ImportBatch

- id
- company_id (fk)
- module (customers|suppliers|brands|categories|products)
- file_name
- status (`preview`|`confirmed`|`failed`)
- summary_json
- created_by (fk -> users.id)
- created_at
- updated_at

Note:

- Apesar da entidade existir para rastreio, o preview nao deve ficar disponivel para confirmacao tardia.

## 8. Relationships Summary

- Company 1:N Customer/Supplier/Brand/Category/Product/Sale/Purchase/AccountReceivable/AccountPayable/ImportBatch
- Product 1:N StockMovement
- Sale 1:N SaleItem
- Purchase 1:N PurchaseItem
- Sale 1:N AccountReceivable
- Purchase 1:N AccountPayable

## 9. State Transitions

### Sale

- `pending` -> `completed`: baixa estoque + gera contas a receber
- `completed` -> `cancelled`: devolve estoque + cancela/ajusta contas
- `pending` -> `cancelled`: cancela sem baixa previa

### Purchase

- `pending` -> `completed`: entrada estoque + gera contas a pagar
- `completed` -> `cancelled`: estorna estoque + cancela/ajusta contas
- `pending` -> `cancelled`: cancela sem entrada previa

### Catalog status

- `active` -> `inactive` quando houver vinculo historico impeditivo de delete.

