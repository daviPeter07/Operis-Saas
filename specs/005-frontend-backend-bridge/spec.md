# Feature Specification: Frontend‑Backend Bridge

**Feature Branch**: `005-frontend-backend-bridge`  
**Created**: 2026‑05‑04  
**Status**: Draft  
**Input**: User description: "vamos criar outra spec agora vai ser a conexao do front com o backend seguindo padroes recomendados de acordo com as skills do laravel que temos aqui + inertia + wayfinder, sempre usando zod para validar dados do lado do frontend, hooks, utils, types e separando em arquivos na pasta services por exemplo auth.service.ts e todos bem tipados sempre fazendo clean code"

## Clarifications

### Session 2026-05-04
- Q: Qual deve ser o escopo de funcionalidades? → A: B (incluir fluxo de recuperação de senha e mecanismo de refresh de token)
- Q: Como o token de autenticação deve ser armazenado no cliente? → A: A (HttpOnly cookie)
- Q: Duração do token de redefinição de senha? → A: A (15 min)
- Q: Estratégia de tratamento de duplicados na importação? → A: C (Ignorar sempre duplicados)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frontend login using typed services (Priority: P1)

A user opens the web application, enters email and password, and clicks **Login**. The frontend calls a typed `auth.service.ts` method, receives a JSON payload from the Laravel backend, validates the shape with a Zod schema, and stores the authentication token.

**Why this priority**: Core entry point to the system; without a reliable login flow the rest of the application cannot be used.

**Independent Test**: Mock the backend login endpoint, invoke the `login` method in `auth.service.ts`, assert that a valid token is returned and that invalid payloads trigger Zod validation errors.

**Acceptance Scenarios**:
1. **Given** a registered user with correct credentials, **When** the login request succeeds, **Then** the service returns a token and the UI redirects to the dashboard.
2. **Given** incorrect credentials, **When** the backend returns a 401 error, **Then** the service throws a validation error that the UI displays as "Invalid credentials".

---

### User Story 2 - Fetching protected resources with hooks (Priority: P2)

After authentication, the frontend needs to fetch the current user's profile. A custom React hook (`useCurrentUser`) calls the generated typed endpoint, validates the response with Zod, and provides the data to consuming components.

**Why this priority**: Demonstrates the pattern for all subsequent data fetching throughout the app.

**Independent Test**: Use a testing library to render a component that calls `useCurrentUser`, mock the API response, and verify that the hook returns a correctly typed user object.

**Acceptance Scenarios**:
1. **Given** a valid authentication token, **When** the hook runs, **Then** it returns the user data matching the Zod schema.
2. **Given** a malformed response, **When** the hook receives it, **Then** it logs a validation error and returns `null`.

---

### User Story 3 - Clean‑code service layer with utils and types (Priority: P3)

Developers create a `services` folder (e.g., `auth.service.ts`, `customer.service.ts`) where each file exports typed functions, reusable utilities (e.g., `apiClient.ts` for fetch logic), and TypeScript types generated from Laravel Wayfinder contracts. All code follows clean‑code principles: small functions, single responsibility, descriptive names, and comprehensive comments.

**Why this priority**: Ensures maintainability and consistency across the codebase.

**Independent Test**: Run static analysis (ESLint/Prettier) and unit tests that import each service function; verify that the exported types align with the expected shape.

**Acceptance Scenarios**:
1. **Given** a new service file, **When** a developer adds a function that calls an API endpoint, **Then** the function uses the shared `apiClient`, validates the response with Zod, and returns a typed result.
2. **Given** the utilities folder, **When** a service imports `apiClient`, **Then** the HTTP request includes the authentication header and error handling logic.

## Requirements *(mandatory)*

### Functional Requirements
- **FR‑001**: Backend MUST expose RESTful JSON endpoints for all domain actions (auth, customers, suppliers, etc.) using Laravel 13, Inertia, and Wayfinder‑generated route helpers.
- **FR‑002**: Backend MUST include `company_id` scoping on every request to enforce multi‑company data isolation.
- **FR‑003**: Frontend MUST provide a `services/` folder containing TypeScript files that encapsulate API calls (e.g., `auth.service.ts`).
- **FR‑004**: Each service function MUST use a shared `apiClient` utility that automatically adds the authentication token and handles HTTP errors.
- **FR‑005**: Frontend MUST define Zod schemas that mirror the expected JSON shape of every backend response and validate data before it is used in the UI.
- **FR‑006**: Frontend MUST expose custom React hooks (e.g., `useCurrentUser`, `useCustomers`) that internally use the service functions and return typed data.
- **FR‑07**: All TypeScript code MUST be strictly typed; exported types for request payloads and response objects MUST be generated from Wayfinder contracts where possible.
- **FR‑008**: Code MUST follow clean‑code guidelines: small functions, single responsibility, meaningful names, and comprehensive inline documentation.
- **FR‑009**: Errors from Zod validation MUST be surfaced to the UI as user‑friendly messages.
- **FR‑010**: Backend MUST provide a password‑reset endpoint (email → token → new password) and frontend MUST expose a `resetPassword.service.ts` with Zod‑validated payloads. The reset token expires after 15 minutes.
- **FR‑011**: Frontend MUST implement a token‑refresh mechanism (`refreshToken.service.ts`) that automatically obtains a new JWT before expiry and updates the `apiClient` header.
- **FR‑012**: Import services MUST provide a preview of duplicate records and, per user choice, either ignore them (default) or update existing records. The default behavior is to ignore duplicates.
- **FR‑012**: Backend MUST set the authentication token in an HttpOnly, Secure cookie; frontend must rely on cookie‑based authentication and must not store the token in localStorage or sessionStorage.

### Key Entities
- **User** – represents an authenticated user; includes `id`, `email`, `name`, and `current_company_id`.
- **AuthToken** – JWT or Sanctum token returned after successful login.
- **Company** – business entity used for multi‑tenant scoping.
- **Customer / Supplier / Product / Sale / Purchase** – existing domain entities that will be accessed via the service layer.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC‑001**: 95 % of successful login attempts result in a valid token and navigation to the dashboard within 2 seconds.
- **SC‑002**: All Zod‑validated API responses have a validation success rate of ≥ 99 % in production (i.e., malformed responses are rare).
- **SC‑003**: Code coverage for the `services/` folder (unit tests) reaches ≥ 80 %.
- **SC‑004**: Developers report a reduction in type‑related bugs by at least 40 % after adopting the typed service pattern (measured via issue tracker).

## Assumptions
- The project already uses Laravel 13, Inertia 3, Fortify for authentication, and Wayfinder for generating typed route helpers.
- Front‑end stack is React 19 with TypeScript; the team is comfortable using Zod for schema validation.
- Existing authentication flow (email/password) will be retained; no third‑party SSO is required for this feature.
- The `apiClient` utility will rely on the standard `fetch` API and include the `Authorization: Bearer <token>` header.
- Clean‑code conventions follow the project's existing ESLint/Prettier configuration.

---

*Ready for planning (`/speckit.plan`).*