<div align="center">

<a href="https://www.dgcomputer.com.br">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/dg-logo-dark.svg" />
    <img src="docs/brand/dg-logo-light.svg" alt="DG Computer" height="88" />
  </picture>
</a>

# Operis

**Gestão comercial, estoque e financeiro em um só lugar.**

Sistema em produção utilizado pela **[DG Computer](https://www.dgcomputer.com.br)** para controlar vendas, compras, estoque e contas a pagar e a receber.

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.5-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Inertia](https://img.shields.io/badge/Inertia.js-3-9553E9?logo=inertia&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Pest](https://img.shields.io/badge/Tests-Pest_4-F472B6)

</div>

---

## 📌 Sobre

O **Operis** é a plataforma de gestão usada no dia a dia da **DG Computer**. Ele reúne o ciclo comercial inteiro: do cadastro de produtos e fornecedores à venda no balcão, passando pelo controle de estoque, crediário, boletos de compra e relatórios gerenciais.

A aplicação é **multiempresa**: cada usuário trabalha dentro de uma empresa ativa, e todos os dados são isolados por empresa.

## ✨ Funcionalidades

| Módulo | O que faz |
|---|---|
| 🛒 **Vendas** | Venda com múltiplos itens, PIX, dinheiro, cartão e **crediário** com entrada e parcelas; checagem de estoque; recibo para **impressora térmica** e fatura em PDF |
| 📦 **Compras** | Entrada de mercadorias com preço de custo, pagamento à vista ou **boleto (30/60/90/120 dias)**, status faturada/paga |
| 🏷️ **Estoque** | Produtos, categorias e marcas, com histórico de movimentações gerado automaticamente por vendas, compras, edições e cancelamentos |
| 👥 **Cadastros** | Clientes (com limite de crédito) e fornecedores, pessoa física ou jurídica |
| 💰 **Contas a receber** | Parcelas geradas pelas vendas, baixa total ou parcial, estorno e sincronização com o status da venda |
| 💸 **Contas a pagar** | Parcelas geradas pelas compras, baixa total ou parcial, estorno e sincronização com o status da compra |
| 📊 **Relatórios** | Vendas, produtos mais vendidos, vendas por categoria e marca, estoque atual, inadimplência, pagamentos por método e maiores compradores |
| 📥 **Importação / exportação** | Importação de cadastros por planilha; exportação de tabelas para Excel e PDF |

## 🧱 Stack

- **Backend:** Laravel 13 (PHP 8.5), Fortify (autenticação), Sanctum (API com sessão por cookie)
- **Frontend:** React 19 + TypeScript via Inertia.js 3, TanStack Query, React Hook Form
- **UI:** Tailwind CSS 4, componentes no estilo shadcn/ui (Radix UI), Lucide icons
- **Rotas tipadas:** Laravel Wayfinder
- **Banco:** MySQL 8
- **Testes:** Pest 4

## 🗺️ Arquitetura em resumo

```
Inertia (rotas web)  ──►  páginas React (casca)
                               │
                               ▼  TanStack Query
API REST /api  ──►  Controller ─► FormRequest ─► Service ─► Repository ─► Model
                                             │
                                             └─► efeitos colaterais na mesma transação:
                                                 estoque · contas a receber · contas a pagar
```

- As páginas Inertia apenas renderizam a interface; **todos os dados vêm da API** (`routes/api.php`).
- As regras de negócio ficam nos **Services** (`app/Services`). Uma venda, por exemplo, movimenta o estoque e gera as parcelas a receber dentro de uma única transação.
- Mais detalhes para desenvolvimento em [`CLAUDE.md`](CLAUDE.md) e [`AGENTS.md`](AGENTS.md).

## 🚀 Rodando localmente

### Pré-requisitos

- PHP 8.5 + Composer. No Linux, a forma mais simples é o [Herd Lite](https://php.new): `/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"`
- Node.js 22 + pnpm
- Docker (para o MySQL)

### Setup

```bash
git clone https://github.com/daviPeter07/Operis-Saas.git
cd Operis-Saas

composer install
pnpm install

cp .env.example .env          # use DB_HOST=127.0.0.1 com o MySQL do Docker
php artisan key:generate

docker compose up -d mysql
php artisan migrate --seed
```

### Desenvolvimento

```bash
composer run dev   # servidor PHP + fila + Vite, tudo junto
```

Acesse **http://localhost:8000**.

## 🧪 Qualidade

```bash
php artisan test --compact                       # suíte completa
php artisan test --compact --filter="nome"       # um teste específico

vendor/bin/pint        # formatação PHP
pnpm lint              # ESLint
pnpm format            # Prettier
pnpm types:check       # TypeScript
composer run ci:check  # tudo acima de uma vez
```

> ⚠️ Os testes usam `RefreshDatabase` e **zeram o banco configurado no `.env`**. Nunca aponte o `.env` local para o banco de produção.

## 📦 Deploy

O deploy é **automático a cada push na `main`** via GitHub Actions (`.github/workflows/deploy-production-ftp.yml`):

1. O CI instala as dependências, gera o build do frontend e empacota tudo em um único `release.zip`.
2. O pacote é enviado por FTPS para a hospedagem (cPanel).
3. Um receptor protegido por token (`.github/deploy/receiver.php`) troca os arquivos, preserva `.env` e `storage/` e roda `migrate`, `optimize` e `queue:restart`.
4. Um healthcheck confirma que a aplicação está no ar.

Também é possível disparar manualmente: `gh workflow run deploy-production-ftp.yml`.

## 📄 Licença

MIT
