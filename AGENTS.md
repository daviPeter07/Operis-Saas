# Operis SaaS - Diário de Desenvolvimento (Agentes)

## Commits de Hoje (Resumo das Implementações)

### Correções realizadas (18/05/2026)

- **Back‑end (`SaleService.php`)**
    - Importado `FinancialStatus`.
    - Após gerar e (possivelmente) quitar os recebíveis, verificado se todas as parcelas estão quitadas usando `whereNotIn('status', [FinancialStatus::Received, FinancialStatus::Cancelled])`.
    - Quando todas as parcelas estão quitadas, a venda tem seu status atualizado para `completed` e o movimento de estoque é aplicado.
    - Lógica de `update` reorganizada para lidar corretamente com mudança de status, reversão de estoque e diffs.
- **Front‑end (`resources/js/features/dashboard/sales/index.tsx`)**
    - Criado `receivableStatusMap` que mapeia `sale_id‑installment_number` → status do receivable.
    - No payload de criação, calculado `isAllPaid` e enviado `status: 'completed'` quando todas as parcelas foram marcadas como pagas.
    - Ao montar a tabela de vendas, o status da linha agora é sobrescrito com o status do receivable obtido do mapa, permitindo que parcelas individuais apareçam como `received` ou `pending`.
- **Dialog de confirmação (`sale-confirmation-dialog.tsx`)**
    - Mantida a coleta de `paidInstallments` via check‑boxes; o array é enviado ao backend.
- **Validação (`StoreSaleRequest.php`)**
    - Campo `paid_installments` já aceita um array de inteiros; nada a mudar.
- **Criação de marcas (`StoreBrandRequest.php` / `BrandService.php`)**
    - `status` passou a ser opcional (`sometimes`) e, se ausente, a marca é criada com `status: 'active'`.

Essas mudanças garantem que, ao marcar parcelas como pagas na UI, o status da parcela na tabela de Vendas refletirá corretamente `Received` (ou `Pending` quando ainda não quitada).

Hoje foi um dia de grandes avanços, principalmente focados nas regras de negócio, integrações de formulários e painéis de checkout. Aqui está o resumo das funcionalidades implementadas nos commits:

1. **Gestão de Compras (Painel de Checkout):**
    - Criação de interface para adicionar produtos com preço de compra (formatado com máscara de moeda `R$`).
    - Implementação de opções de vencimento para Boletos (30, 60, 90 e 120 dias) no painel de checkout.
    - Adição do Status de Compra (Faturada vs Paga) na confirmação do resumo.
    - Refatoração do painel de checkout de compras (`purchase-checkout-panel`).

2. **Contas a Receber & Contas a Pagar:**
    - Implementação da funcionalidade de liquidação (baixa) de contas a receber.
    - Sincronização do status financeiro entre contas a receber e contas a pagar com base na situação das vendas e compras (status dinâmicos e regras de atualização).

3. **Validações e Melhorias de UI/UX:**
    - Integração do `react-hook-form` em diversos diálogos e componentes, melhorando a validação de campos obrigatórios e fluxo de digitação.
    - Formatação e máscara de entrada de crédito na criação de clientes.
    - Ajuste de formatação de datas padronizado para o fuso horário de Manaus em todo o sistema e nas respostas da API.
    - Otimizações no cálculo de estoque total no módulo de inventário e melhorias na organização dos diálogos de produtos.

---

## Próximos Passos (O Plano)

O objetivo principal em andamento é **padronizar as interfaces financeiras**, replicando e adaptando a lógica do "Dialog de Vendas" para os outros módulos.

Como a funcionalidade de **Compras** já foi implementada e ajustada com os requisitos específicos de custo e boleto, o foco agora muda para:

1. **Contas a Pagar (Accounts Payable):**
    - Replicar a interface unificada de diálogo.
    - Adaptar para o contexto de pagamentos (Fornecedor, Vencimentos, Forma de Pagamento e Status).
    - Aplicar a máscara de moedas e campos de formulário como na Venda/Compra.

2. **Contas a Receber (Accounts Receivable):**
    - Replicar a interface unificada de diálogo.
    - Ajustar para a visualização dos valores que entram no fluxo de caixa.
    - Permitir gestão fácil e clara das parcelas ou dos vencimentos (ex: controle de faturas e boletos em aberto).

3. **Sincronização Final:**
    - Garantir que todas as telas conversem perfeitamente com o backend (via Inertia.js).
    - Certificar-se de que a sincronização financeira (A pagar / A receber) seja gerada ou cancelada corretamente sempre que uma Nova Compra ou Nova Venda for salva/cancelada.

### 09/05/2026 - Commits do dia

- **8862285** feat: remover alerta de pedidos não entregues conforme solicitado
- **e35b7bf** feat: adicionar invalidação de queries para produtos e clientes nas mutações de vendas
- **9d369f7** feat: ajustar lógica de atualização de status de vendas e movimentação de estoque
- **bbaaa08** feat: atualizar status da parcela para 'completa' quando recebida
- **67463b7** Add 'Marcar todas' button to select all crediário installments in confirmation dialog
- **f81fceb** feat: implementar lógica de pagamento em crediário e atualizar status de parcelas nas vendas
- **5645db3** feat: permitir pagamento em crediário e ajustar exibição de parcelas nas vendas
- **5886f26** feat: adicionar campo de status ao formulário de cliente e ajustar lógica de inicialização
- **dc8bc8a** feat: melhorar formatação de preços e adicionar máscara de campo no diálogo de vendas
- **3bddcc3** feat: adicionar cabeçalho de compras com métricas e formatação de valores
- **65f767a** feat: atualizar painel de compras com melhorias na exibição de produtos e métodos de pagamento
- **03b1582** feat: adicionar funcionalidade de seleção de prazo de vencimento para boleto e status de compra no painel de checkout
- **6cc1c1e** feat: implement account receivable settlement functionality
- **32ef66a** feat: refactor accounts receivable dialog and add purchase checkout panel
- **4813143** feat: adicionar suporte ao react-hook-form em diversos diálogos e componentes, incluindo validação de campos obrigatórios
- **8432018** feat: adicionar sincronização de status financeiro entre contas a receber e contas a pagar com base em vendas e compras
- **455630e** feat: ajustar formatação de data para o fuso horário de Manaus e otimizar importações em diversos componentes
- **dc78cab** feat: adicionar campo de status nas regras de atualização de vendas e exibir data de criação formatada nas respostas de vendas e compras
- **42cb044** feat: adicionar tooltip e formatação de entrada de crédito no diálogo de criação de cliente; refactor: otimizar cálculo de estoque total no módulo de inventário; refactor: melhorar formatação e estrutura de labels no diálogo de produtos

**Resumo do dia**

- Removemos o alerta de "Pedidos não entregues".
- Atualizamos mutações de vendas para invalidar caches de produtos e clientes.
- Corrigimos a lógica de estoque e status de vendas/recebíveis para crediário.
- Melhorias de UI: botão "Marcar todas", máscaras de preço, tooltips, cabeçalhos de compra, seleção de prazo de boleto.
- Integração de react‑hook‑form e validações.
- Sincronização de status financeiro entre contas a pagar e a receber.
- Ajustes de formatação de datas/horários.

**Sugestões de melhorias futuras**

1. Dashboard de Finanças com gráficos comparativos.
2. Notificações em tempo real via WebSocket/Laravel Echo.
3. Relatórios PDF/Excel de vendas, compras e estoque.
4. Histórico de alterações/auditoria.
5. Integração com gateway de pagamento para baixa automática.
6. Customização de planos de crédito para clientes.

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.5
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `pnpm run build`, `pnpm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `pnpm run build` or ask the user to run `pnpm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
