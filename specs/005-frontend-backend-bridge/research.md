# Research Findings

## Technical Decisions
- **Language/Version**: PHP 8.5 for Laravel backend; TypeScript 5 (React 19) for frontend.
- **Frameworks**: Laravel 13 with Inertia 3, Fortify for auth, Wayfinder for typed route helpers.
- **Validation**: Zod schemas on the frontend to validate all backend JSON responses.
- **Authentication storage**: HttpOnly, Secure cookie set by backend (no client‑side storage).
- **Password reset flow**: Implemented via backend endpoint sending email token; frontend provides `resetPassword.service.ts`.
- **Token refresh**: `refreshToken.service.ts` obtains new JWT before expiry and updates `apiClient` header.
- **Service layer**: Shared `apiClient.ts` handles fetch, auth header, error handling.
- **Testing**: Pest PHP for backend, Jest + React Testing Library for frontend.

## Best‑practice References
- Laravel authentication best practices (Fortify, Sanctum, HttpOnly cookies).
- Wayfinder usage for typed routes in Inertia‑React apps.
- Zod schema design patterns for API contracts.
- Clean‑code guidelines (small functions, single responsibility) enforced by project ESLint/Prettier.
