# Operis SaaS

Plataforma de gestão empresarial com controle de vendas, compras, inventário, contas a receber e relatórios.

## Tecnologias

- **Backend:** Laravel 13, PHP 8.3+
- **Frontend:** React 19, TypeScript, Inertia.js
- **UI:** Tailwind CSS, Radix UI
- **Data:** TanStack Query
- **Database:** PostgreSQL / MySQL
- **Testing:** Pest

## Instalação

### Requisitos

- PHP 8.3+
- Node.js 20+
- Composer
- pnpm

### Setup

```bash
# Clone
git clone https://github.com/daviPeter07/operis-saas.git
cd operis-saas

# Backend
composer install
cp .env.example .env
php artisan key:generate

# Frontend
pnpm install

# Database
php artisan migrate --seed
php artisan wayfinder:generate
```

## Rodar

```bash
# Terminal 1
php artisan serve

# Terminal 2
pnpm dev
```

Acesse http://localhost:8000

## Estrutura

```
operis-saas/
├── app/               # Backend (Controllers, Models, etc)
├── resources/js/      # Frontend (React, Componentes, Hooks)
├── database/          # Migrações e Seeders
├── routes/            # Rotas
├── tests/             # Testes
└── public/build/      # Assets compilados
```

## Scripts

```bash
# Frontend
pnpm dev              # Dev server
pnpm build            # Build para produção
pnpm types:check      # Validar tipos TypeScript
pnpm lint             # ESLint
pnpm format           # Prettier

# Backend
php artisan migrate   # Rodar migrações
php artisan test      # Rodar testes
```

## Testes

```bash
php artisan test
php artisan test --coverage
```

## Licença

MIT
