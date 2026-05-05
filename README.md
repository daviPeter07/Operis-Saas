# Operis SaaS

<!-- Badges -->

![Laravel](https://img.shields.io/badge/Laravel-v13.0-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3+-777BB4?logo=php&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

**Desenvolvido por [Syncforge](https://syncforge.com)**

## 📋 Sobre o Projeto

**Operis SaaS** é uma plataforma de gestão empresarial moderna e escalável, desenvolvida com as tecnologias mais atuais do mercado. Projetada para oferecer uma experiência de usuário excepcional, combine-se com um backend robusto e bem estruturado.

### 🎯 Objetivo

Fornecer uma solução completa de SaaS para gestão de:

- **Vendas** - Registrar e acompanhar todas as transações de vendas
- **Compras** - Gerenciar fornecedores e requisições de compra
- **Inventário** - Controlar estoque em tempo real
- **Contas a Receber** - Acompanhar pagamentos e inadimplência
- **Relatórios** - Análises detalhadas de negócio com visualizações inteligentes
- **Gestão de Marcas e Categorias** - Organizar produtos de forma eficiente

A plataforma é otimizada para pequenas e médias empresas que desejam modernizar seus processos de negócio.

---

## 🏗️ Arquitetura e Estrutura

```
operis-saas/
├── app/                              # Backend Laravel
│   ├── Actions/                      # Ações customizadas (Fortify)
│   ├── Concerns/                     # Traits reutilizáveis
│   ├── Http/
│   │   ├── Controllers/              # Controladores das rotas
│   │   ├── Middleware/               # Middlewares customizados
│   │   └── Requests/                 # Form Requests (validação)
│   ├── Models/                       # Modelos Eloquent
│   └── Providers/                    # Service Providers
│
├── resources/                        # Frontend e assets
│   ├── js/
│   │   ├── pages/                    # Páginas principais (Inertia)
│   │   ├── features/                 # Módulos feature-based
│   │   │   └── dashboard/            # Featurе dashboard
│   │   │       ├── sales/            # Vendas
│   │   │       ├── purchases/        # Compras
│   │   │       ├── inventory/        # Inventário
│   │   │       ├── brands/           # Marcas
│   │   │       ├── categories/       # Categorias
│   │   │       ├── accounts-payable/ # Contas a Pagar
│   │   │       ├── overview/         # Dashboard overview
│   │   │       └── ...
│   │   ├── components/               # Componentes React reutilizáveis
│   │   │   ├── ui/                   # Componentes base (Dialog, Button, etc)
│   │   │   ├── sales-dialog/        # Diálogo de POS para vendas
│   │   │   ├── payment/             # Componentes de pagamento
│   │   │   └── ...
│   │   ├── hooks/                    # React hooks customizados
│   │   ├── services/                 # Serviços de API
│   │   ├── utils/                    # Utilitários
│   │   ├── constants/                # Constantes da aplicação
│   │   ├── types/                    # Tipos TypeScript globais
│   │   └── app.tsx                   # Entry point
│   │
│   └── css/                          # Estilos Tailwind
│
├── database/
│   ├── migrations/                   # Migrações do banco
│   ├── factories/                    # Factories para seeders
│   └── seeders/                      # Seeders de dados
│
├── routes/
│   └── web.php                       # Rotas web (Inertia)
│
├── config/
│   ├── app.php                       # Configurações da aplicação
│   ├── auth.php                      # Configurações de autenticação
│   ├── fortify.php                   # Configurações do Fortify
│   └── ...                           # Outras configurações
│
├── tests/
│   ├── Feature/                      # Testes de feature (Pest)
│   ├── Unit/                         # Testes unitários (Pest)
│   └── Pest.php                      # Configuração do Pest
│
├── public/
│   └── build/                        # Assets compilados (Vite)
│
├── storage/                          # Logs e cache
├── vendor/                           # Dependências Composer
├── node_modules/                     # Dependências npm/pnpm
│
├── vite.config.ts                    # Configuração do Vite
├── tsconfig.json                     # Configuração do TypeScript
├── tailwind.config.js                # Configuração do Tailwind
├── eslint.config.js                  # Configuração do ESLint
├── prettier.config.js                # Configuração do Prettier
├── phpunit.xml                       # Configuração do PHPUnit
├── pint.json                         # Configuração do Pint
├── docker-compose.yml                # Configuração do Docker
├── composer.json                     # Dependências backend
├── package.json                      # Dependências frontend
└── README.md                         # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **[Laravel v13](https://laravel.com/)** - Framework PHP moderno e elegante
- **[Laravel Inertia](https://inertiajs.com/)** - Adaptor para SSR com React
- **[Laravel Fortify](https://laravel.com/docs/fortify)** - Autenticação sem UI
- **[Laravel Sanctum](https://laravel.com/docs/sanctum)** - Autenticação SPA/API
- **[Laravel Wayfinder](https://laravel.com/docs/wayfinder)** - Geração de tipos para rotas
- **[PHP 8.3+](https://www.php.net/)** - Linguagem backend

### Frontend

- **[React v19](https://react.dev/)** - Biblioteca UI de componentes
- **[TypeScript 5.3+](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[Inertia.js v3](https://inertiajs.com/)** - Página única reativa sem complexidade SPA
- **[TanStack Query v5](https://tanstack.com/query/)** - Gerenciamento de estado assíncrono
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes headless acessíveis

### Ferramentas de Desenvolvimento

- **[Vite](https://vitejs.dev/)** - Build tool ultrarrápida
- **[Pest v4](https://pestphp.com/)** - Testing framework elegante para PHP
- **[ESLint](https://eslint.org/)** - Linter para JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formatador de código
- **[Laravel Pint](https://laravel.com/docs/pint)** - Formatador de código PHP

### Banco de Dados

- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional (recomendado)
- **[MySQL 8+](https://www.mysql.com/)** - Alternativa

---

## 🚀 Guia de Início Rápido

### Pré-requisitos

- **PHP 8.3+** (com extensões: pdo, bcmath, ctype, json, mbstring)
- **Composer** - Gerenciador de pacotes PHP
- **Node.js 20.x** e **pnpm** - Runtime e gerenciador de pacotes
- **Docker** (opcional) - Para ambiente isolado
- **Git** - Controle de versão

### Instalação

#### 1️⃣ **Clonar o repositório**

```bash
git clone https://github.com/syncforge/operis-saas.git
cd operis-saas
```

#### 2️⃣ **Instalar dependências**

```bash
# Backend
composer install

# Frontend
pnpm install
```

#### 3️⃣ **Configurar variáveis de ambiente**

```bash
cp .env.example .env
php artisan key:generate
```

**Editar `.env` com suas configurações:**

```env
APP_NAME=OperisSaaS
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=operis_saas
DB_USERNAME=root
DB_PASSWORD=

BYPASS_AUTH=true  # Para desenvolvimento, pula tela de login
```

#### 4️⃣ **Executar migrações**

```bash
php artisan migrate --seed
```

Isso criará as tabelas e populará dados de teste com o `TestUserSeeder`.

#### 5️⃣ **Gerar tipos Wayfinder**

```bash
php artisan wayfinder:generate
```

Isso gera tipos TypeScript para rotas e controllers automaticamente.

#### 6️⃣ **Iniciar servidor de desenvolvimento**

**Terminal 1 - Backend (Laravel)**

```bash
composer run dev
# ou
php artisan serve
```

**Terminal 2 - Frontend (Vite)**

```bash
pnpm dev
```

✅ **Acesse em:** http://localhost:8000

---

## 📦 Scripts Disponíveis

### Frontend (pnpm)

```bash
pnpm dev              # Inicia dev server Vite
pnpm build            # Build otimizado para produção
pnpm build:ssr        # Build com SSR
pnpm lint             # Executa ESLint e corrige
pnpm lint:check       # Verifica ESLint sem corrigir
pnpm format           # Formata código com Prettier
pnpm format:check     # Verifica formatação Prettier
pnpm types:check      # Valida tipos TypeScript
```

### Backend (php artisan)

```bash
php artisan migrate            # Executa migrações
php artisan migrate:fresh      # Reseta e reexecuta migrações
php artisan migrate:seed       # Executa seeders
php artisan tinker             # Shell interativa
php artisan test               # Executa testes (Pest/PHPUnit)
php artisan route:list         # Lista todas as rotas
php artisan config:show app    # Mostra configurações
```

---

## 🧪 Testes

### Executar testes

```bash
# Backend - Testes com Pest
php artisan test

# Frontend - Testes com Vitest (se configurado)
pnpm test
```

### Coverage

```bash
# Backend
php artisan test --coverage

# Frontend
pnpm test:coverage
```

---

## 🎨 Padrões e Convenções

### Nomenclatura

#### Backend (PHP/Laravel)

- **Modelos**: `CamelCase` (ex: `Brand`, `Customer`)
- **Controllers**: `{Entity}Controller` (ex: `SalesController`)
- **Migrations**: `{timestamp}_{description}` (ex: `2025_05_04_create_brands_table`)
- **Seeders**: `{EntityName}Seeder` (ex: `BrandSeeder`)
- **Traits/Concerns**: `{DescriptionTrait}` (ex: `PasswordValidationRules`)

#### Frontend (React/TypeScript)

- **Componentes**: `PascalCase` (ex: `SalesDialog`, `BrandEditDialog`)
- **Hooks**: `use{Purpose}` (ex: `useBrands`, `useCreateBrand`)
- **Tipos**: `PascalCase` com sufixo (ex: `BrandRow`, `CustomerForm`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `ENTITY_STATUS_OPTIONS`)
- **Arquivos**: `kebab-case` (ex: `sales-dialog.tsx`, `use-brands.ts`)

### Estrutura de Código

#### Componentes React

```typescript
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

interface MyComponentProps {
  id: string;
  onSuccess?: () => void;
}

export function MyComponent({ id, onSuccess }: MyComponentProps) {
  const [state, setState] = React.useState('');

  const { data } = useQuery({
    queryKey: ['items', id],
    queryFn: async () => {
      // fetch
    },
  });

  return <div>{/* JSX */}</div>;
}
```

#### Hooks Customizados

```typescript
export function useBrands() {
    return useQuery({
        queryKey: brandsQueryKey,
        queryFn: async () => brandService.list(),
    });
}

export function useCreateBrand() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => brandService.create(data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: brandsQueryKey }),
    });
}
```

#### Controllers Laravel

```php
class SalesController extends Controller
{
    public function __construct(private SalesService $service) {}

    public function index()
    {
        return Inertia::render('dashboard/Sales', [
            'sales' => $this->service->list(),
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        $sale = $this->service->create($request->validated());
        return redirect()->route('sales.index');
    }
}
```

### Padrões de Projeto

#### State Management

- **TanStack Query** para dados remotos (cache, sincronização)
- **React State** para estado local/UI
- **Zustand** para contexto global (se necessário)

#### Autenticação

- **Laravel Fortify** - Sem UI prescrita
- **Laravel Sanctum** - Tokens SPA
- **Middleware** - `BypassAuth` para desenvolvimento (env-gated)

#### Validação

- **Form Requests** no backend (Laravel)
- **TypeScript types** + **Zod schemas** no frontend

#### Error Handling

- **Exception Handlers** centralizados
- **Toast notifications** via `sonner`
- **User-friendly messages**

---

## 🔐 Autenticação

### Configuração

1. **Variáveis de Ambiente**

    ```env
    FORTIFY_FEATURES=registration,reset_passwords,email_verification,two_factor_authentication
    BYPASS_AUTH=true  # Apenas desenvolvimento!
    ```

2. **TestUserSeeder** (Desenvolvimento)
    - Cria usuário de teste automáticamente
    - Ativado em `database/seeders/DatabaseSeeder.php`
    - Credenciais padrão: `test@example.com` / `password`

### Fluxos de Autenticação

- Login/Logout
- Registro
- Reset de Senha
- Verificação de Email
- Two-Factor Authentication (2FA)
- Confirmação de Senha

---

## 🚢 Deployment

### Produção com Laravel Cloud

```bash
# Deploy com um comando
php artisan cloud:deploy
```

[Documentação Laravel Cloud](https://laravel.com/cloud)

### Alternativas

- **Docker** + **Kubernetes**
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Guides do Projeto

- [API Documentation](./docs/api.md) _(em breve)_
- [Component Library](./docs/components.md) _(em breve)_
- [Database Schema](./docs/database.md) _(em breve)_

---

## 🤝 Contribuindo

1. **Fork o repositório**
2. **Crie uma branch para sua feature**
    ```bash
    git checkout -b feature/minha-feature
    ```
3. **Commit suas mudanças**
    ```bash
    git commit -am 'Add: descrição da feature'
    ```
4. **Push para a branch**
    ```bash
    git push origin feature/minha-feature
    ```
5. **Abra um Pull Request**

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: altera formatação/estilo
refactor: refatora código
perf: melhora performance
test: adiciona testes
chore: atualiza dependências
```

---

## 📝 Licença

Este projeto está licenciado sob a licença **MIT** - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

## 👥 Sobre a Syncforge

**[Syncforge](https://syncforge.com)** é uma empresa especializada em desenvolvimento de software escalável e moderno.

Nós criamos soluções web robustas utilizando as melhores práticas e tecnologias atuais.

### Contato

- 📧 Email: `contact@syncforge.com`
- 🌐 Website: [syncforge.com](https://syncforge.com)
- 🐙 GitHub: [@syncforge](https://github.com/syncforge)

---

## 📞 Suporte

Para dúvidas, bugs ou sugestões:

- 🐛 [Abrir uma Issue](https://github.com/syncforge/operis-saas/issues)
- 💬 [Discussões](https://github.com/syncforge/operis-saas/discussions)

---

## 📊 Status do Projeto

- ✅ MVP Foundation & Dashboard
- ✅ Tabelas e UI Components
- ✅ Autenticação e Autorização
- 🔄 Integrações com Pagamento (em desenvolvimento)
- 🔄 Relatórios Avançados (em desenvolvimento)
- ⏳ Mobile App (planejado)

---

**Desenvolvido com ❤️ pela [Syncforge](https://syncforge.com)**

_Última atualização: Maio de 2026_
