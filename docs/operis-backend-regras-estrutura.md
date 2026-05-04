# Documento de Regras e Estrutura Backend — Operis SaaS

## 1. Objetivo do Documento

Este documento define o escopo inicial, as regras de negócio e a estrutura backend planejada para o Operis SaaS, considerando que o frontend já existe e que, neste momento, o foco é implementar o backend em Laravel 13 com Inertia, React, Fortify e Sanctum.

O backend deve cobrir somente os módulos operacionais essenciais já presentes no frontend:

- Autenticação
- Clientes
- Vendas
- Fornecedores
- Categorias
- Marcas
- Estoque / Produtos
- Compras
- Contas a Receber
- Contas a Pagar

Ficam fora desta primeira etapa:

- Equipe
- Configurações da empresa
- Configurações avançadas do sistema
- Planos e assinaturas
- Permissões customizadas por usuário
- Integrações fiscais
- Impressora térmica direta
- Relatório funcional de perdas de estoque

---

## 2. Visão Geral do Backend

O sistema será usado inicialmente por uma única empresa, mas deve ser preparado desde o início para evoluir para um modelo multiempresa/SaaS.

Por isso, as tabelas principais já devem possuir `company_id`, mesmo que o frontend ainda não tenha troca de workspace ou gestão de empresas.

### Decisões principais

- O sistema funciona inicialmente para uma empresa por usuário.
- O banco já nasce preparado para multiempresa futura.
- As tabelas operacionais principais terão `company_id`.
- O usuário criador da empresa será tratado como owner/admin.
- Equipe não será implementada agora, mas a tabela `company_users` pode existir como base futura.
- A empresa atual será salva em `users.current_company_id` e também na sessão.

---

## 3. Fluxo de Autenticação e Onboarding

### 3.1 Cadastro do usuário

O usuário cria sua conta normalmente no sistema.

Após o cadastro/login, o backend deve verificar se o usuário possui empresa vinculada.

### 3.2 Criação da empresa

Se o usuário não possuir empresa, ele deve ser redirecionado para o formulário de criação da empresa.

Campos esperados para criação da empresa:

- Nome
- Imagem/logo
- CPF ou CNPJ
- Endereço
- Telefone
- Email
- Cidade
- Estado

### 3.3 Documento da empresa

O campo de documento da empresa deve aceitar CPF ou CNPJ.

Regras:

- O documento deve ser único no sistema inteiro.
- O backend deve diferenciar o tipo do documento por meio de `document_type`.
- O campo numérico deve ser salvo como `document`.

Estrutura sugerida:

```txt
companies
- document_type: cpf | cnpj
- document: string unique
```

### 3.4 Verificação por código

Após criar a empresa, o sistema deve enviar um código para o email do usuário.

Esse código confirma:

1. O email do usuário.
2. A ativação/verificação da empresa criada.

Regras:

- O código é usado somente no cadastro/onboarding.
- O código não deve ser exigido em todo login.
- O código expira em 15 minutos.
- O usuário pode reenviar o código.
- O reenvio deve ter cooldown de 1 minuto.
- O reenvio deve ter limite para evitar abuso.
- Um novo código invalida o anterior.

Após a confirmação:

- `users.email_verified_at` deve ser preenchido.
- `companies.verified_at` deve ser preenchido.
- `users.current_company_id` deve apontar para a empresa criada.
- A empresa atual deve ser salva também na sessão.
- O usuário é redirecionado para o dashboard.

### 3.5 Bloqueio de acesso

O usuário não pode acessar o dashboard enquanto a empresa não estiver verificada.

Fluxo esperado:

```txt
Usuário autenticado
→ possui empresa?
    não → redireciona para criar empresa
    sim → empresa está verificada?
        não → redireciona para confirmar código
        sim → libera dashboard
```

---

## 4. Módulos Dentro do Escopo

Os módulos que devem ser cobertos pelo backend nesta fase são:

```txt
Auth
Clientes
Vendas
Fornecedores
Categorias
Marcas
Estoque / Produtos
Compras
Contas a Receber
Contas a Pagar
```

Os módulos de equipe e configurações ficam para uma fase posterior.

---

## 5. Regras de Negócio por Módulo

## 5.1 Clientes

Regras:

- Cliente pertence a uma empresa.
- Cliente pode ser criado, listado, visualizado, editado e excluído.
- Se o cliente possuir venda vinculada, não pode ser excluído definitivamente.
- Cliente com vínculo deve ser apenas inativado.
- Cliente inativo não deve aparecer por padrão em novas vendas.
- Cliente inativo deve continuar aparecendo em históricos e relatórios.

---

## 5.2 Fornecedores

Regras:

- Fornecedor pertence a uma empresa.
- Fornecedor pode ser criado, listado, visualizado, editado e excluído.
- Se o fornecedor possuir compra vinculada, não pode ser excluído definitivamente.
- Fornecedor com vínculo deve ser apenas inativado.
- Fornecedor inativo não deve aparecer por padrão em novas compras.
- Fornecedor inativo deve continuar aparecendo em históricos e relatórios.

---

## 5.3 Marcas

Regras:

- Marca pertence a uma empresa.
- Marca pode ser criada, listada, visualizada, editada e excluída.
- Se a marca possuir produto vinculado, não pode ser excluída definitivamente.
- Marca com vínculo deve ser apenas inativada.
- Marcas inativas não devem aparecer por padrão no cadastro de novos produtos.

---

## 5.4 Categorias

Regras:

- Categoria pertence a uma empresa.
- Categoria pode ser criada, listada, visualizada, editada e excluída.
- Categoria pode ter categoria pai.
- Se a categoria possuir produto vinculado, não pode ser excluída definitivamente.
- Categoria com vínculo deve ser apenas inativada.
- Categorias inativas não devem aparecer por padrão no cadastro de novos produtos.

---

## 5.5 Estoque / Produtos

Regras:

- Produto pertence a uma empresa.
- Produto pode ser criado, listado, visualizado, editado e excluído.
- Produto possui nome, SKU, código de barras, descrição, preço de venda, custo, estoque atual, estoque mínimo, categoria e marca.
- Produto com venda ou compra vinculada não pode ser excluído definitivamente.
- Produto com vínculo deve ser apenas inativado.
- Produto inativo não deve aparecer por padrão em vendas e compras.
- O sistema permite vender produto mesmo sem estoque suficiente.
- O estoque pode ficar negativo.
- Toda alteração de estoque deve gerar movimentação em `stock_movements`.
- Venda concluída gera saída de estoque.
- Compra concluída gera entrada de estoque.
- Cancelamento de venda devolve estoque.
- Cancelamento de compra estorna estoque.

### Estoque negativo

O backend não deve bloquear venda por falta de estoque.

Exemplo:

```txt
Produto possui 2 unidades.
Usuário vende 5 unidades.
Resultado: estoque final = -3.
```

Esse produto deve aparecer como alerta de estoque negativo no dashboard/estoque.

---

## 5.6 Vendas

Regras:

- Venda pertence a uma empresa.
- Venda possui cliente, itens, subtotal, total, status, forma de pagamento e data.
- Venda pode ter status: pendente, concluída ou cancelada.
- Venda concluída baixa estoque.
- Venda pode deixar estoque negativo.
- Venda concluída pode ser editada.
- Ao editar venda concluída, o backend deve ajustar estoque pela diferença.
- Ao editar venda concluída, o backend deve recalcular financeiro vinculado.
- Venda cancelada devolve estoque automaticamente.
- Venda cancelada cancela ou ajusta financeiro vinculado.
- Venda cancelada não entra nos totais principais de relatórios.
- Venda cancelada não deve ser editada depois do cancelamento.

### Edição de venda concluída

Toda edição em venda concluída deve gerar ajuste compensatório de estoque.

Exemplo:

```txt
Venda original:
- 2 unidades de Mouse

Venda editada:
- 5 unidades de Mouse

Sistema deve:
- baixar mais 3 unidades do estoque
- atualizar total da venda
- atualizar contas a receber vinculadas
```

---

## 5.7 Compras

Regras:

- Compra pertence a uma empresa.
- Compra possui fornecedor, itens, total, vencimento, forma de pagamento e status.
- Compra pode ter status: pendente, concluída ou cancelada.
- Compra concluída aumenta estoque automaticamente.
- Ao concluir compra, o sistema pergunta se deve atualizar o custo do produto.
- Se o usuário aceitar, `products.cost` é atualizado com o custo da compra.
- Se o usuário recusar, `products.cost` permanece igual.
- O custo do item da compra sempre deve ficar salvo em `purchase_items.unit_cost`.
- Compra cancelada estorna estoque automaticamente.
- Compra cancelada cancela ou ajusta financeiro vinculado.

### Atualização de custo

Mesmo que o custo atual do produto não seja atualizado, o item da compra deve guardar o custo usado na operação.

```txt
purchase_items.unit_cost
```

Isso preserva o histórico da compra.

---

## 5.8 Contas a Receber

Regras:

- Conta a receber pertence a uma empresa.
- Conta a receber nasce automaticamente a partir de vendas.
- Venda à vista pode gerar conta já recebida.
- Venda pendente gera conta pendente.
- Venda parcelada gera múltiplas contas a receber.
- Contas a receber não terão baixa manual por enquanto.
- Conta vencida é calculada quando `due_date` passou e o status continua pendente.
- Se venda for editada, contas a receber vinculadas devem ser recalculadas ou ajustadas.
- Se venda for cancelada, contas a receber vinculadas devem ser canceladas ou ajustadas.

---

## 5.9 Contas a Pagar

Regras:

- Conta a pagar pertence a uma empresa.
- Conta a pagar nasce automaticamente a partir de compras.
- Compra à vista pode gerar conta já paga.
- Compra a prazo gera conta pendente.
- Compra parcelada gera múltiplas contas a pagar.
- Contas a pagar podem ser baixadas manualmente.
- Na baixa manual, o usuário deve informar data de pagamento e método de pagamento.
- Observação pode ser informada na baixa manual.
- Conta vencida é calculada quando `due_date` passou e o status continua pendente.
- Se compra for editada, contas a pagar vinculadas devem ser recalculadas ou ajustadas.
- Se compra for cancelada, contas a pagar vinculadas devem ser canceladas ou ajustadas.

---

## 6. Regras de Importação

A importação será implementada de forma real no backend.

Arquivos aceitos:

- `.xlsx`
- `.xls`
- `.csv`

Módulos com importação:

- Clientes
- Fornecedores
- Marcas
- Categorias
- Produtos

Fluxo:

```txt
Usuário envia arquivo
→ backend lê o arquivo
→ backend valida estrutura e dados
→ backend retorna preview
→ usuário confirma importação
→ backend salva registros válidos
→ backend retorna relatório da importação
```

Regras:

- A importação deve ter preview antes de persistir dados.
- Linhas inválidas não devem ser salvas.
- O backend deve retornar erros por linha.
- O usuário deve visualizar linhas válidas e inválidas.
- Em caso de duplicados, o usuário escolhe no preview se deseja ignorar ou atualizar.

Duplicidade por módulo:

```txt
Clientes:
- documento ou email dentro da empresa atual

Fornecedores:
- documento ou email dentro da empresa atual

Marcas:
- nome dentro da empresa atual

Categorias:
- nome dentro da empresa atual

Produtos:
- SKU ou código de barras dentro da empresa atual
```

---

## 7. Estrutura Backend Proposta

```txt
app/
├── Enums/
│   ├── CompanyUserRole.php
│   ├── CompanyUserStatus.php
│   ├── PersonType.php
│   ├── RecordStatus.php
│   ├── ProductStatus.php
│   ├── SaleStatus.php
│   ├── PurchaseStatus.php
│   ├── PaymentMethod.php
│   ├── CardType.php
│   ├── FinancialStatus.php
│   ├── StockMovementType.php
│   └── ImportStatus.php
│
├── Http/
│   ├── Controllers/
│   │   ├── Web/
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardController.php
│   │   │   ├── Onboarding/
│   │   │   │   ├── CompanyOnboardingController.php
│   │   │   │   └── CompanyVerificationController.php
│   │   │   ├── Customers/
│   │   │   │   └── CustomerPageController.php
│   │   │   ├── Suppliers/
│   │   │   │   └── SupplierPageController.php
│   │   │   ├── Brands/
│   │   │   │   └── BrandPageController.php
│   │   │   ├── Categories/
│   │   │   │   └── CategoryPageController.php
│   │   │   ├── Products/
│   │   │   │   └── ProductPageController.php
│   │   │   ├── Sales/
│   │   │   │   └── SalePageController.php
│   │   │   ├── Purchases/
│   │   │   │   └── PurchasePageController.php
│   │   │   └── Finance/
│   │   │       ├── AccountReceivablePageController.php
│   │   │       └── AccountPayablePageController.php
│   │   │
│   │   └── Api/
│   │       ├── Auth/
│   │       │   ├── AuthenticatedUserController.php
│   │       │   └── AuthSessionController.php
│   │       ├── Onboarding/
│   │       │   ├── CompanyOnboardingController.php
│   │       │   ├── CompanyVerificationCodeController.php
│   │       │   └── CompanyVerificationResendController.php
│   │       ├── Customers/
│   │       │   ├── CustomerController.php
│   │       │   └── CustomerImportController.php
│   │       ├── Suppliers/
│   │       │   ├── SupplierController.php
│   │       │   └── SupplierImportController.php
│   │       ├── Brands/
│   │       │   ├── BrandController.php
│   │       │   └── BrandImportController.php
│   │       ├── Categories/
│   │       │   ├── CategoryController.php
│   │       │   └── CategoryImportController.php
│   │       ├── Products/
│   │       │   ├── ProductController.php
│   │       │   ├── ProductStockController.php
│   │       │   └── ProductImportController.php
│   │       ├── Sales/
│   │       │   ├── SaleController.php
│   │       │   ├── SaleCancelController.php
│   │       │   └── SalePaymentController.php
│   │       ├── Purchases/
│   │       │   ├── PurchaseController.php
│   │       │   ├── PurchaseCancelController.php
│   │       │   └── PurchasePaymentController.php
│   │       └── Finance/
│   │           ├── AccountReceivableController.php
│   │           ├── AccountPayableController.php
│   │           └── AccountPayablePaymentController.php
│   │
│   ├── Middleware/
│   │   ├── EnsureUserHasCompany.php
│   │   ├── EnsureCompanyIsVerified.php
│   │   ├── SetCurrentCompany.php
│   │   └── EnsureCurrentCompanyMember.php
│   │
│   ├── Requests/
│   │   ├── Onboarding/
│   │   ├── Customers/
│   │   ├── Suppliers/
│   │   ├── Brands/
│   │   ├── Categories/
│   │   ├── Products/
│   │   ├── Sales/
│   │   ├── Purchases/
│   │   ├── Finance/
│   │   └── Imports/
│   │
│   └── Resources/
│       ├── Auth/
│       ├── Companies/
│       ├── Customers/
│       ├── Suppliers/
│       ├── Brands/
│       ├── Categories/
│       ├── Products/
│       ├── Sales/
│       ├── Purchases/
│       ├── Finance/
│       └── Imports/
│
├── Models/
│   ├── User.php
│   ├── Company.php
│   ├── CompanyUser.php
│   ├── CompanyVerificationCode.php
│   ├── Customer.php
│   ├── Supplier.php
│   ├── Brand.php
│   ├── Category.php
│   ├── Product.php
│   ├── StockMovement.php
│   ├── Sale.php
│   ├── SaleItem.php
│   ├── SalePayment.php
│   ├── Purchase.php
│   ├── PurchaseItem.php
│   ├── PurchasePayment.php
│   ├── AccountReceivable.php
│   ├── AccountPayable.php
│   └── ImportBatch.php
│
├── Policies/
│   ├── CustomerPolicy.php
│   ├── SupplierPolicy.php
│   ├── BrandPolicy.php
│   ├── CategoryPolicy.php
│   ├── ProductPolicy.php
│   ├── SalePolicy.php
│   ├── PurchasePolicy.php
│   ├── AccountReceivablePolicy.php
│   └── AccountPayablePolicy.php
│
├── Repositories/
│   ├── Contracts/
│   └── Eloquent/
│
├── Services/
│   ├── Onboarding/
│   ├── Customers/
│   ├── Suppliers/
│   ├── Brands/
│   ├── Categories/
│   ├── Products/
│   ├── Sales/
│   ├── Purchases/
│   ├── Finance/
│   └── Imports/
│
├── Support/
│   ├── Company/
│   ├── QueryBuilder/
│   ├── Imports/
│   └── Documents/
│
└── Traits/
    ├── BelongsToCompany.php
    ├── HasStatus.php
    ├── HasUuid.php
    └── RecordsActivity.php
```

---

## 8. Migrations Principais

```txt
database/migrations/
├── 0001_01_01_000000_create_users_table.php
├── xxxx_xx_xx_create_companies_table.php
├── xxxx_xx_xx_create_company_users_table.php
├── xxxx_xx_xx_add_current_company_id_to_users_table.php
├── xxxx_xx_xx_create_company_verification_codes_table.php
├── xxxx_xx_xx_create_customers_table.php
├── xxxx_xx_xx_create_suppliers_table.php
├── xxxx_xx_xx_create_brands_table.php
├── xxxx_xx_xx_create_categories_table.php
├── xxxx_xx_xx_create_products_table.php
├── xxxx_xx_xx_create_stock_movements_table.php
├── xxxx_xx_xx_create_sales_table.php
├── xxxx_xx_xx_create_sale_items_table.php
├── xxxx_xx_xx_create_sale_payments_table.php
├── xxxx_xx_xx_create_purchases_table.php
├── xxxx_xx_xx_create_purchase_items_table.php
├── xxxx_xx_xx_create_purchase_payments_table.php
├── xxxx_xx_xx_create_account_receivables_table.php
├── xxxx_xx_xx_create_account_payables_table.php
└── xxxx_xx_xx_create_import_batches_table.php
```

---

## 9. Models Principais

```txt
User
Company
CompanyUser
CompanyVerificationCode
Customer
Supplier
Brand
Category
Product
StockMovement
Sale
SaleItem
SalePayment
Purchase
PurchaseItem
PurchasePayment
AccountReceivable
AccountPayable
ImportBatch
```

---

## 10. Ordem Recomendada de Implementação

```txt
1. Ajustar Auth/Fortify existente
2. Instalar e configurar Sanctum, se a API protegida for usada pelo frontend
3. Criar routes/api.php e registrar no bootstrap/app.php
4. Criar companies, company_users e current_company_id
5. Criar onboarding de empresa + verificação por código
6. Criar middleware de empresa atual e empresa verificada
7. Criar clientes
8. Criar fornecedores
9. Criar marcas
10. Criar categorias
11. Criar produtos
12. Criar stock_movements
13. Criar vendas, sale_items e sale_payments
14. Conectar venda com estoque e contas a receber
15. Criar compras, purchase_items e purchase_payments
16. Conectar compra com estoque e contas a pagar
17. Criar contas a receber
18. Criar contas a pagar + baixa manual
19. Criar importação real com preview
20. Substituir mocks do frontend por chamadas reais da API
```

---

## 11. Fora do Escopo Atual

Não implementar nesta primeira fase:

```txt
- Equipe
- Convites de usuários
- Configurações da empresa
- Configurações avançadas do sistema
- Permissões customizadas
- Planos e assinaturas
- Integração fiscal
- Impressora térmica direta
- Relatório funcional de perdas
- Baixa manual de contas a receber
```

Esses pontos devem ficar documentados como evolução futura.

---

## 12. Resumo Final

O backend do Operis SaaS deve priorizar a transformação dos módulos visuais atuais em módulos reais, mantendo o frontend existente e substituindo gradualmente os dados mockados por respostas de API.

A primeira implementação deve focar em autenticação, onboarding de empresa, clientes, fornecedores, marcas, categorias, produtos, estoque, vendas, compras, contas a receber, contas a pagar e importação.

Mesmo funcionando inicialmente para uma única empresa, o sistema deve nascer preparado para multiempresa por meio de `company_id`, `companies`, `company_users` e `users.current_company_id`.

A regra central do backend é garantir rastreabilidade e consistência: toda venda, compra, movimentação de estoque e lançamento financeiro deve ser persistido de forma clara, ajustável e segura.
