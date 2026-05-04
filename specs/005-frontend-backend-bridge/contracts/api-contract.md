# API Contract

## Authentication

- **POST** `/login`
    - Request body: `{ email: string, password: string }`
    - Response: `{ token: string, expiresAt: string, user: { id: number, email: string, name: string, current_company_id: number } }`

- **POST** `/logout`
    - No body, clears HttpOnly auth cookie.

- **POST** `/password/reset-request`
    - Request body: `{ email: string }`
    - Response: `{ success: true }` (email with token sent).

- **POST** `/password/reset`
    - Request body: `{ token: string, newPassword: string }`
    - Response: `{ success: true }`

- **POST** `/auth/refresh`
    - No body, uses refresh cookie.
    - Response: `{ token: string, expiresAt: string }`

## User Profile

- **GET** `/user/profile`
    - Returns the authenticated user's data.

## Generic Resource Example (Customers)

- **GET** `/customers`
    - Returns array of customer objects.
- **GET** `/customers/{id}`
    - Returns single customer.
- **POST** `/customers`
    - Request body matches `Customer` schema.
- **PUT** `/customers/{id}`
    - Update customer.
- **DELETE** `/customers/{id}`
    - Delete customer.
