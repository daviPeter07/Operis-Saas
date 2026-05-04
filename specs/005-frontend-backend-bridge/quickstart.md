# Quickstart Guide

## Backend (Laravel)
1. Run migrations: `php artisan migrate`.
2. Install dependencies: `composer install`.
3. Configure environment variables (DB, mail, etc.).
4. Start development server: `php artisan serve`.
5. Ensure Fortify is configured for HttpOnly cookie authentication.
6. Generate typed route helpers: `php artisan wayfinder:generate`.

## Frontend (React + Inertia)
1. Install npm packages: `pnpm install`.
2. Build assets for development: `pnpm run dev`.
3. The `apiClient` automatically includes the auth cookie.
4. Use provided services:
   - `auth.service.ts` – login, logout.
   - `resetPassword.service.ts` – password reset flow.
   - `refreshToken.service.ts` – token refresh.
5. Use hooks:
   - `useCurrentUser` – fetches authenticated user profile.
   - `useCustomers` – example data fetching hook.
6. Run frontend tests: `pnpm test`.

## Testing
- Backend tests: `php artisan test --compact`.
- Frontend tests: `pnpm test` (Jest + React Testing Library).

## Linting & Formatting
- PHP: `vendor/bin/pint --format agent`.
- JS/TS: `npm run lint` (ESLint) and `npm run format` (Prettier).

## Deployment
- Follow standard Laravel deployment process (e.g., Forge, Cloud). Ensure environment serves HTTPS so HttpOnly cookies work.
