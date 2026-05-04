# Data Model

## Entities

### User

- `id`: integer, primary key
- `email`: string, unique, indexed
- `name`: string
- `current_company_id`: integer, foreign key to Company
- `created_at`, `updated_at`: timestamps

### AuthToken

- `token`: string (JWT or Sanctum token)
- `expires_at`: datetime
- Associated to a User via `user_id`

### Company

- `id`: integer, primary key
- `name`: string
- `created_at`, `updated_at`: timestamps

### Customer / Supplier / Product / Sale / Purchase

- Existing domain entities; each includes a `company_id` foreign key for multi‑tenant scoping.

## Relationships

- **User** belongs to **Company** (`current_company_id`).
- **AuthToken** belongs to **User**.
- All domain entities belong to a **Company** (company_id).

## Validation Rules (Backend)

- `email` must be a valid email format and unique per company.
- `password` minimum 8 characters, includes letters and numbers.
- `company_id` required for all mutating requests.

## Validation Rules (Frontend – Zod)

- Defined in `schemas/*.zod.ts` mirroring the above fields.
- Password reset payload schema: `{ token: string, newPassword: string }`.
- Refresh token response schema: `{ token: string, expiresAt: string }`.
