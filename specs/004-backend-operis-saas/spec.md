# Software Design Document: Backend Operis SaaS

**Feature Branch**: `004-backend-operis-saas`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: Criar o SDD do backend real do Operis SaaS usando `docs/operis-backend-regras-estrutura.md` como fonte principal.

## Clarifications

### Session 2026-05-04

- Q: Qual limite antiabuso para reenvio do codigo de verificacao? -> A: Maximo de 5 reenvios por hora por usuario/empresa.
- Q: Como modelar pagamentos em vendas? -> A: `sale_payments` guarda condicao de pagamento e `account_receivables` guarda parcelas geradas.
- Q: Como modelar pagamentos em compras? -> A: `purchase_payments` guarda condicao de pagamento e `account_payables` guarda parcelas geradas.
- Q: Como tratar edicao de documento concluido com financeiro ja baixado? -> A: Recalcula apenas se nao houve baixa; se houve baixa/recebimento bloqueia edicao financeira, com excecao para fluxo de devolucao com reembolso e ajuste compensatorio.
- Q: Onde manter o preview da importacao? -> A: Nao persistir preview; usuario envia e confirma na hora, ou cancela o processo.
- Q: Quais campos minimos obrigatorios nos cadastros? -> A: Cliente/Fornecedor `name`; Marca/Categoria `name`; Produto `name`, `sku`, `sale_price`, `cost`, `stock`, `category_id`, `brand_id`.
- Q: Como fechar enums iniciais? -> A: Definir conjunto minimo nesta fase.
- Q: SKU e codigo de barras no produto? -> A: `sku` obrigatorio e unico por empresa; `barcode` opcional e unico quando informado.

## 1. Objetivo

Implementar o backend real dos modulos operacionais do Operis SaaS, substituindo os dados mockados do frontend atual por dados persistidos, regras de negocio centralizadas e endpoints consumiveis pelas telas existentes em Laravel 13 + Inertia + React.

O backend deve nascer preparado para multiempresa futura por meio de `company_id`, mesmo que o sistema seja usado por uma empresa no momento.

## 2. Fonte Principal

Documento base:

- `docs/operis-backend-regras-estrutura.md`

Regras deste SDD:

- Nao inventar modulos fora do documento.
- Nao adicionar regras de negocio que nao estejam no documento.
- Registrar lacunas como "Ponto a esclarecer".
- Manter `company_id` nas tabelas operacionais principais.
- Adaptar o backend aos modulos visuais ja existentes no frontend.

## 3. Escopo

### Dentro do Escopo

- Auth.
- Onboarding de empresa.
- Clientes.
- Vendas.
- Fornecedores.
- Categorias.
- Marcas.
- Estoque / Produtos.
- Compras.
- Contas a Receber.
- Contas a Pagar.
- Importacao real com preview.

### Fora do Escopo

- Equipe.
- Convites.
- Configuracoes avancadas da empresa.
- Permissoes customizadas.
- Planos e assinaturas.
- Integracao fiscal.
- Impressora termica direta.
- Perdas de estoque.
- Relatorios avancados fora dos modulos operacionais.
- Conta a receber manual.

## 4. User Scenarios & Testing

### User Story 1 - Auth e Onboarding de Empresa (Priority: P1)

Como usuario novo, quero criar minha conta, cadastrar minha empresa e confirmar o codigo enviado por email para acessar o dashboard com uma empresa verificada.

**Why this priority**: nenhum modulo operacional pode ser usado sem usuario autenticado, empresa criada e empresa verificada.

**Independent Test**: cadastrar usuario, criar empresa, confirmar codigo valido e validar acesso ao dashboard com empresa atual definida.

**Acceptance Scenarios**:

1. **Given** usuario autenticado sem empresa, **When** acessa o dashboard, **Then** o sistema redireciona para criacao de empresa.
2. **Given** usuario cria empresa, **When** o registro e salvo, **Then** o sistema envia codigo de verificacao para o email do usuario.
3. **Given** codigo valido dentro de 15 minutos, **When** o usuario confirma o codigo, **Then** `users.email_verified_at`, `companies.verified_at`, `users.current_company_id` e sessao da empresa atual sao atualizados.
4. **Given** empresa nao verificada, **When** usuario tenta acessar dashboard, **Then** o acesso e bloqueado e redirecionado para confirmacao de codigo.

---

### User Story 2 - Cadastros Operacionais (Priority: P1)

Como operador, quero criar, consultar, editar e remover clientes, fornecedores, marcas, categorias e produtos respeitando vinculos existentes.

**Why this priority**: vendas, compras e estoque dependem dos cadastros base.

**Independent Test**: criar registros por modulo, editar, listar por empresa atual e testar exclusao definitiva versus inativacao quando houver vinculo.

**Acceptance Scenarios**:

1. **Given** cliente sem venda vinculada, **When** excluir cliente, **Then** o registro pode ser removido definitivamente.
2. **Given** cliente com venda vinculada, **When** excluir cliente, **Then** o registro e inativado e permanece disponivel em historicos.
3. **Given** fornecedor com compra vinculada, **When** excluir fornecedor, **Then** o registro e inativado e nao aparece por padrao em novas compras.
4. **Given** marca ou categoria com produto vinculado, **When** excluir, **Then** o registro e inativado e nao aparece por padrao em novo produto.
5. **Given** produto com venda ou compra vinculada, **When** excluir produto, **Then** o registro e inativado e nao aparece por padrao em vendas e compras.

---

### User Story 3 - Vendas, Estoque e Financeiro a Receber (Priority: P1)

Como operador, quero registrar vendas com itens, status e pagamento para que o estoque e contas a receber sejam atualizados conforme as regras do negocio.

**Why this priority**: vendas sao fluxo central do sistema e conectam cliente, produto, estoque e financeiro.

**Independent Test**: criar venda pendente, concluir venda, editar venda concluida, cancelar venda e validar estoque, movimentacoes e contas a receber.

**Acceptance Scenarios**:

1. **Given** venda concluida, **When** a venda e salva, **Then** o estoque dos produtos e baixado e movimentacoes de estoque sao registradas.
2. **Given** produto com estoque insuficiente, **When** venda concluida excede o saldo, **Then** o sistema permite estoque negativo.
3. **Given** venda concluida editada, **When** quantidades ou itens mudam, **Then** o backend ajusta estoque pela diferenca e recalcula financeiro vinculado.
4. **Given** venda cancelada, **When** cancelamento e confirmado, **Then** o estoque e devolvido e financeiro vinculado e cancelado ou ajustado.
5. **Given** venda cancelada, **When** usuario tenta editar, **Then** a edicao e bloqueada.

---

### User Story 4 - Compras, Estoque e Contas a Pagar (Priority: P1)

Como operador, quero registrar compras com fornecedor, itens e pagamento para que estoque e contas a pagar sejam atualizados automaticamente.

**Why this priority**: compras alimentam estoque e geram obrigacoes financeiras.

**Independent Test**: criar compra pendente, concluir compra, atualizar custo quando aceito, cancelar compra e baixar conta a pagar manualmente.

**Acceptance Scenarios**:

1. **Given** compra concluida, **When** a compra e salva, **Then** o estoque dos produtos e aumentado e movimentacoes de estoque sao registradas.
2. **Given** compra concluida, **When** usuario aceita atualizar custo, **Then** `products.cost` recebe o custo informado na compra.
3. **Given** usuario recusa atualizar custo, **When** compra e concluida, **Then** `products.cost` permanece igual e `purchase_items.unit_cost` preserva o custo da operacao.
4. **Given** compra cancelada, **When** cancelamento e confirmado, **Then** estoque e financeiro vinculado sao estornados ou ajustados.
5. **Given** conta a pagar pendente, **When** usuario informa data, metodo e observacao opcional, **Then** a conta e baixada manualmente.

---

### User Story 5 - Importacao Real com Preview (Priority: P2)

Como operador, quero importar clientes, fornecedores, marcas, categorias e produtos por arquivo, revisar um preview e confirmar apenas os dados validos.

**Why this priority**: reduz entrada manual de dados e substitui a importacao visual atual por fluxo real e auditavel.

**Independent Test**: enviar arquivo valido e invalido, revisar preview, escolher tratar duplicados e confirmar persistencia apenas das linhas validas.

**Acceptance Scenarios**:

1. **Given** arquivo `.xlsx`, `.xls` ou `.csv`, **When** usuario envia para importacao, **Then** backend valida estrutura e retorna preview.
2. **Given** linhas invalidas, **When** preview e gerado, **Then** erros por linha sao retornados e linhas invalidas nao sao persistidas.
3. **Given** registros duplicados, **When** preview detecta duplicidade, **Then** usuario escolhe ignorar ou atualizar antes de confirmar.
4. **Given** usuario confirma preview, **When** importacao e executada, **Then** registros validos sao salvos e relatorio de importacao e retornado.

## 5. Edge Cases

- Usuario autenticado sem empresa tenta acessar endpoint operacional.
- Empresa existe, mas `verified_at` esta vazio.
- Codigo de verificacao expirado.
- Reenvio de codigo antes do cooldown de 1 minuto.
- Tentativa de exclusao definitiva de registro com vinculo historico.
- Venda concluida editada com remocao, adicao ou alteracao de quantidade de itens.
- Venda cancelada com financeiro ja gerado.
- Compra cancelada apos entrada de estoque.
- Produto vendido com estoque insuficiente, gerando saldo negativo.
- Conta vencida com `due_date` passado e status pendente.
- Importacao com arquivo valido, mas colunas obrigatorias ausentes.
- Importacao com duplicados dentro do arquivo e duplicados contra registros existentes.
- Usuario tenta acessar dados de outra empresa por identificador direto.

## 6. Arquitetura Backend

O backend deve seguir a estrutura planejada no documento fonte.

### Camadas

- **Controllers**: entrada HTTP, respostas Inertia/API e delegacao para Services.
- **Requests**: validacao de entrada por acao.
- **Resources**: serializacao de respostas para frontend/API.
- **Services**: regras de negocio e orquestracao de transacoes.
- **Repositories**: consultas e persistencia por modulo.
- **Models**: entidades Eloquent e relacionamentos.
- **Policies**: autorizacao por empresa atual.
- **Enums**: status, tipos e constantes de dominio.
- **Middleware**: empresa atual, verificacao de empresa e acesso por membro.
- **Migrations**: schema relacional e indices de integridade.

### Diretorios Esperados

```txt
app/
├── Enums/
├── Http/
│   ├── Controllers/
│   │   ├── Web/
│   │   └── Api/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
├── Repositories/
│   ├── Contracts/
│   └── Eloquent/
├── Services/
├── Support/
└── Traits/
```

## 7. Entidades e Relacionamentos

### Company

Representa a empresa atual/futura tenant do sistema.

Campos principais:

- `id`
- `name`
- `logo`
- `document_type`
- `document`
- `address`
- `phone`
- `email`
- `city`
- `state`
- `verified_at`

Relacionamentos:

- Tem muitos usuarios por `company_users`.
- Tem muitos clientes, fornecedores, marcas, categorias, produtos, vendas, compras, contas e importacoes.

### User

Representa o usuario autenticado.

Campos relevantes:

- `current_company_id`
- `email_verified_at`

Relacionamentos:

- Pertence a empresa atual.
- Pode estar vinculado a empresas por `company_users`.

### CompanyUser

Base futura para vinculo multiempresa.

Campos principais:

- `company_id`
- `user_id`
- `role`
- `status`

Ponto a esclarecer:

- Quais roles alem de owner/admin devem existir nesta primeira estrutura, ja que equipe e permissoes customizadas estao fora do escopo.

### CompanyVerificationCode

Codigo de verificacao usado apenas no onboarding.

Campos principais:

- `company_id`
- `user_id`
- `code`
- `expires_at`
- `used_at`
- `resent_at`

Regras:

- Expira em 15 minutos.
- Novo codigo invalida anterior.
- Reenvio tem cooldown de 1 minuto.
- Reenvio tem limite contra abuso.

Ponto a esclarecer:

- Nao ha.

### Customer

Cliente da empresa.

Regras:

- Pertence a uma empresa.
- Pode ser criado, listado, visualizado, editado e excluido.
- Com venda vinculada deve ser inativado, nao excluido definitivamente.
- Inativo nao aparece por padrao em novas vendas.
- Inativo aparece em historicos e relatorios.

### Supplier

Fornecedor da empresa.

Regras:

- Pertence a uma empresa.
- Com compra vinculada deve ser inativado.
- Inativo nao aparece por padrao em novas compras.
- Inativo aparece em historicos e relatorios.

### Brand

Marca de produto.

Regras:

- Pertence a uma empresa.
- Com produto vinculado deve ser inativada.
- Inativa nao aparece por padrao em novo produto.

### Category

Categoria de produto.

Regras:

- Pertence a uma empresa.
- Pode ter categoria pai.
- Com produto vinculado deve ser inativada.
- Inativa nao aparece por padrao em novo produto.

### Product

Produto/estoque.

Campos principais:

- `company_id`
- `category_id`
- `brand_id`
- `name`
- `sku`
- `barcode`
- `description`
- `sale_price`
- `cost`
- `stock`
- `min_stock`
- `status`

Regras:

- Pertence a uma empresa.
- Pode ficar com estoque negativo.
- Com venda ou compra vinculada deve ser inativado.
- Inativo nao aparece por padrao em vendas e compras.
- Toda alteracao de estoque gera `stock_movements`.

### StockMovement

Registro rastreavel de alteracao de estoque.

Eventos que geram movimentacao:

- Venda concluida: saida.
- Compra concluida: entrada.
- Cancelamento de venda: devolucao.
- Cancelamento de compra: estorno.
- Edicao de venda concluida: ajuste compensatorio.
- Edicao de compra quando aplicavel: ajuste ou estorno conforme financeiro/estoque vinculado.

### Sale

Venda da empresa.

Campos principais:

- `company_id`
- `customer_id`
- `date`
- `subtotal`
- `total`
- `status`
- `payment_method`

Status:

- `pending`
- `completed`
- `cancelled`

Regras:

- Venda concluida baixa estoque.
- Pode deixar estoque negativo.
- Venda concluida pode ser editada.
- Edicao de venda concluida ajusta estoque pela diferenca.
- Edicao de venda concluida recalcula financeiro vinculado.
- Cancelamento devolve estoque.
- Cancelamento cancela ou ajusta financeiro vinculado.
- Venda cancelada nao entra nos totais principais de relatorios.
- Venda cancelada nao pode ser editada.

### SaleItem

Item da venda.

Campos principais:

- `sale_id`
- `product_id`
- `quantity`
- `unit_price`
- `subtotal`

### SalePayment

Pagamento da venda.

Regra definida:

- `sale_payments` guarda condicao de pagamento da venda.
- `account_receivables` guarda as parcelas geradas a partir da condicao.

### Purchase

Compra da empresa.

Campos principais:

- `company_id`
- `supplier_id`
- `date`
- `due_date`
- `total`
- `payment_method`
- `status`

Status:

- `pending`
- `completed`
- `cancelled`

Regras:

- Compra concluida aumenta estoque.
- Ao concluir, sistema pergunta se deve atualizar custo do produto.
- Se aceitar, `products.cost` e atualizado.
- Se recusar, `products.cost` permanece igual.
- `purchase_items.unit_cost` sempre preserva custo historico.
- Compra cancelada estorna estoque.
- Compra cancelada cancela ou ajusta financeiro vinculado.

### PurchaseItem

Item da compra.

Campos principais:

- `purchase_id`
- `product_id`
- `quantity`
- `unit_cost`
- `subtotal`

### PurchasePayment

Pagamento da compra.

Regra definida:

- `purchase_payments` guarda condicao de pagamento da compra.
- `account_payables` guarda as parcelas geradas a partir da condicao.

### AccountReceivable

Conta a receber gerada automaticamente por venda.

Regras:

- Pertence a uma empresa.
- Nasce automaticamente a partir de vendas.
- Venda a vista pode gerar conta ja recebida.
- Venda pendente gera conta pendente.
- Venda parcelada gera multiplas contas.
- Nao tera baixa manual nesta fase.
- Vencida e calculada quando `due_date` passou e status continua pendente.
- Venda editada recalcula ou ajusta contas vinculadas.
- Venda cancelada cancela ou ajusta contas vinculadas.

### AccountPayable

Conta a pagar gerada automaticamente por compra.

Regras:

- Pertence a uma empresa.
- Nasce automaticamente a partir de compras.
- Compra a vista pode gerar conta ja paga.
- Compra a prazo gera conta pendente.
- Compra parcelada gera multiplas contas.
- Pode ser baixada manualmente.
- Baixa manual exige data de pagamento e metodo de pagamento.
- Observacao pode ser informada.
- Vencida e calculada quando `due_date` passou e status continua pendente.
- Compra editada recalcula ou ajusta contas vinculadas.
- Compra cancelada cancela ou ajusta contas vinculadas.

### ImportBatch

Representa um processo de importacao.

Modulos suportados:

- Clientes.
- Fornecedores.
- Marcas.
- Categorias.
- Produtos.

Regras:

- Preview antes de persistir.
- Linhas invalidas nao sao salvas.
- Erros por linha devem ser retornados.
- Usuario visualiza linhas validas e invalidas.
- Duplicados podem ser ignorados ou atualizados por escolha no preview.

## 8. Enums

Enums previstos:

- `CompanyUserRole`
- `CompanyUserStatus`
- `PersonType`
- `RecordStatus`
- `ProductStatus`
- `SaleStatus`
- `PurchaseStatus`
- `PaymentMethod`
- `CardType`
- `FinancialStatus`
- `StockMovementType`
- `ImportStatus`

Valores explicitamente definidos no documento:

- `document_type`: `cpf`, `cnpj`
- Sale status: `pending`, `completed`, `cancelled`
- Purchase status: `pending`, `completed`, `cancelled`

Ponto a esclarecer:

- Nao ha. Usar conjunto minimo nesta fase.

## 9. Middleware

### EnsureUserHasCompany

Bloqueia dashboard/endpoints operacionais quando usuario autenticado nao possui empresa.

### EnsureCompanyIsVerified

Bloqueia dashboard/endpoints operacionais enquanto empresa atual nao esta verificada.

### SetCurrentCompany

Resolve empresa atual a partir de `users.current_company_id` e sessao.

### EnsureCurrentCompanyMember

Garante que usuario autenticado pertence a empresa atual.

## 10. Policies

Policies esperadas:

- `CustomerPolicy`
- `SupplierPolicy`
- `BrandPolicy`
- `CategoryPolicy`
- `ProductPolicy`
- `SalePolicy`
- `PurchasePolicy`
- `AccountReceivablePolicy`
- `AccountPayablePolicy`

Regra base:

- Usuario so pode acessar registros cujo `company_id` pertence a empresa atual.

## 11. Services

### Onboarding

- Criar empresa.
- Detectar CPF/CNPJ e gravar `document_type`.
- Validar documento unico no sistema.
- Gerar codigo de verificacao.
- Reenviar codigo com cooldown e limite.
- Confirmar codigo.
- Atualizar usuario, empresa e sessao.

### Cadastros

- Criar, editar, listar, visualizar e excluir/inativar registros.
- Aplicar regra de inativacao quando houver vinculo.
- Filtrar ativos por padrao nas selecoes operacionais.

### Estoque

- Registrar movimentacoes.
- Permitir estoque negativo.
- Gerar alerta por estoque negativo para dashboard/estoque.
- Ajustar saldo por venda, compra, cancelamento e edicao.

### Vendas

- Criar venda.
- Concluir venda.
- Editar venda concluida com ajuste compensatorio.
- Cancelar venda.
- Gerar ou recalcular contas a receber.
- Impedir edicao de venda cancelada.
- Se houver baixa/recebimento no financeiro, bloquear edicao financeira, exceto fluxo de devolucao com reembolso e ajuste compensatorio.

### Compras

- Criar compra.
- Concluir compra.
- Controlar decisao de atualizar custo do produto.
- Preservar `purchase_items.unit_cost`.
- Cancelar compra.
- Gerar ou recalcular contas a pagar.
- Se houver baixa/pagamento no financeiro, bloquear edicao financeira, exceto fluxo de devolucao com reembolso e ajuste compensatorio.

### Financeiro

- Gerar contas a receber a partir de vendas.
- Gerar contas a pagar a partir de compras.
- Calcular vencidas por `due_date` passado com status pendente.
- Baixar manualmente contas a pagar.
- Bloquear baixa manual de contas a receber nesta fase.

### Importacoes

- Ler arquivos aceitos.
- Validar estrutura e dados.
- Detectar duplicados por modulo.
- Retornar preview.
- Confirmar importacao.
- Salvar apenas linhas validas.
- Retornar relatorio final.
- Preview nao e persistido para uso posterior; confirmacao deve ocorrer no mesmo fluxo de importacao.

## 12. Repositories

Repositories devem encapsular consultas por modulo, sempre filtrando pela empresa atual.

Contratos esperados:

- CustomerRepository
- SupplierRepository
- BrandRepository
- CategoryRepository
- ProductRepository
- SaleRepository
- PurchaseRepository
- AccountReceivableRepository
- AccountPayableRepository
- ImportBatchRepository

Responsabilidades:

- Listagem paginada.
- Busca/filtros usados pelo frontend.
- Consulta por identificador dentro da empresa atual.
- Verificacao de vinculos antes de exclusao.
- Persistencia transacional quando chamada por Services.

## 13. Endpoints Necessarios

Os endpoints abaixo descrevem capacidades esperadas. A nomenclatura final deve seguir as convencoes de rotas do projeto.

### Auth e Usuario Atual

- Obter usuario autenticado.
- Login/logout continuam usando fluxo Fortify existente.
- Endpoints adicionais apenas se necessarios para consumo API do frontend.

### Onboarding

- Exibir/criar empresa.
- Enviar codigo de verificacao.
- Reenviar codigo.
- Confirmar codigo.
- Obter estado do onboarding.

### Clientes

- Listar clientes.
- Criar cliente.
- Visualizar cliente.
- Atualizar cliente.
- Excluir ou inativar cliente.
- Preview de importacao.
- Confirmar importacao.

### Fornecedores

- Listar fornecedores.
- Criar fornecedor.
- Visualizar fornecedor.
- Atualizar fornecedor.
- Excluir ou inativar fornecedor.
- Preview de importacao.
- Confirmar importacao.

### Marcas

- Listar marcas.
- Criar marca.
- Visualizar marca.
- Atualizar marca.
- Excluir ou inativar marca.
- Preview de importacao.
- Confirmar importacao.

### Categorias

- Listar categorias.
- Criar categoria.
- Visualizar categoria.
- Atualizar categoria.
- Excluir ou inativar categoria.
- Preview de importacao.
- Confirmar importacao.

### Produtos / Estoque

- Listar produtos.
- Criar produto.
- Visualizar produto.
- Atualizar produto.
- Excluir ou inativar produto.
- Listar movimentacoes de estoque por produto.
- Preview de importacao.
- Confirmar importacao.

### Vendas

- Listar vendas.
- Criar venda.
- Visualizar venda.
- Atualizar venda.
- Cancelar venda.
- Concluir venda, se a criacao nao concluir automaticamente.
- Consultar pagamentos/financeiro vinculado.

### Compras

- Listar compras.
- Criar compra.
- Visualizar compra.
- Atualizar compra.
- Cancelar compra.
- Concluir compra com decisao de atualizar custo.
- Consultar pagamentos/financeiro vinculado.

### Contas a Receber

- Listar contas a receber.
- Visualizar conta a receber.
- Consultar status calculado de vencida.
- Nao incluir baixa manual nesta fase.

### Contas a Pagar

- Listar contas a pagar.
- Visualizar conta a pagar.
- Baixar manualmente conta a pagar.
- Consultar status calculado de vencida.

## 14. Migrations

Migrations principais, na ordem prevista:

```txt
0001_01_01_000000_create_users_table.php
xxxx_xx_xx_create_companies_table.php
xxxx_xx_xx_create_company_users_table.php
xxxx_xx_xx_add_current_company_id_to_users_table.php
xxxx_xx_xx_create_company_verification_codes_table.php
xxxx_xx_xx_create_customers_table.php
xxxx_xx_xx_create_suppliers_table.php
xxxx_xx_xx_create_brands_table.php
xxxx_xx_xx_create_categories_table.php
xxxx_xx_xx_create_products_table.php
xxxx_xx_xx_create_stock_movements_table.php
xxxx_xx_xx_create_sales_table.php
xxxx_xx_xx_create_sale_items_table.php
xxxx_xx_xx_create_sale_payments_table.php
xxxx_xx_xx_create_purchases_table.php
xxxx_xx_xx_create_purchase_items_table.php
xxxx_xx_xx_create_purchase_payments_table.php
xxxx_xx_xx_create_account_receivables_table.php
xxxx_xx_xx_create_account_payables_table.php
xxxx_xx_xx_create_import_batches_table.php
```

Requisitos de schema:

- Tabelas operacionais principais devem ter `company_id`.
- Documento da empresa deve ser unico globalmente.
- Duplicidades de importacao devem respeitar empresa atual, exceto documento de empresa.
- Chaves estrangeiras devem preservar consistencia de historico.
- Registros com vinculos devem ser inativados, nao removidos definitivamente.

## 15. Regras de Validacao

### Empresa

- Nome obrigatorio.
- Documento obrigatorio.
- Documento aceita CPF ou CNPJ.
- Documento unico no sistema inteiro.
- `document_type` derivado do documento.
- Email, telefone, cidade, estado e endereco conforme campos esperados do onboarding.

### Codigo de Verificacao

- Codigo obrigatorio para confirmacao.
- Codigo deve pertencer ao usuario e empresa em onboarding.
- Codigo deve estar dentro de 15 minutos.
- Codigo usado ou invalidado nao pode ser reaproveitado.

### Cadastros

- Campos obrigatorios devem seguir os formularios atuais e o documento fonte.
- Registros devem pertencer a empresa atual.
- Selecoes operacionais devem ignorar registros inativos por padrao.

Ponto a esclarecer:

- Quais campos exatos obrigatorios por cliente, fornecedor, marca, categoria e produto alem dos explicitamente descritos no documento.

### Vendas

- Cliente deve pertencer a empresa atual.
- Produtos dos itens devem pertencer a empresa atual.
- Venda cancelada nao pode ser editada.
- Venda concluida pode ser editada com ajuste de estoque e financeiro.
- Estoque insuficiente nao bloqueia venda.

### Compras

- Fornecedor deve pertencer a empresa atual.
- Produtos dos itens devem pertencer a empresa atual.
- `purchase_items.unit_cost` deve sempre ser persistido.
- Conclusao deve receber decisao de atualizar ou nao o custo do produto.

### Contas

- Conta a receber nao tem baixa manual nesta fase.
- Conta a pagar exige data de pagamento e metodo na baixa manual.
- Status vencido e calculado por `due_date` passado com status pendente.

### Importacao

- Arquivos aceitos: `.xlsx`, `.xls`, `.csv`.
- Preview obrigatorio antes de persistencia.
- Linhas invalidas nao devem ser salvas.
- Erros por linha devem ser retornados.
- Duplicados devem permitir escolha de ignorar ou atualizar.

## 16. Regras de Duplicidade na Importacao

- Clientes: documento ou email dentro da empresa atual.
- Fornecedores: documento ou email dentro da empresa atual.
- Marcas: nome dentro da empresa atual.
- Categorias: nome dentro da empresa atual.
- Produtos: SKU ou codigo de barras dentro da empresa atual.

## 17. Ordem de Implementacao

1. Ajustar Auth/Fortify existente.
2. Instalar e configurar Sanctum, se API protegida for usada pelo frontend.
3. Criar `routes/api.php` e registrar no bootstrap.
4. Criar `companies`, `company_users` e `current_company_id`.
5. Criar onboarding de empresa e verificacao por codigo.
6. Criar middleware de empresa atual e empresa verificada.
7. Criar clientes.
8. Criar fornecedores.
9. Criar marcas.
10. Criar categorias.
11. Criar produtos.
12. Criar `stock_movements`.
13. Criar vendas, `sale_items` e `sale_payments`.
14. Conectar venda com estoque e contas a receber.
15. Criar compras, `purchase_items` e `purchase_payments`.
16. Conectar compra com estoque e contas a pagar.
17. Criar contas a receber.
18. Criar contas a pagar e baixa manual.
19. Criar importacao real com preview.
20. Substituir mocks do frontend por chamadas reais da API.

## 18. Functional Requirements

- **FR-001**: O sistema MUST reutilizar Auth/Fortify existente para autenticacao.
- **FR-002**: O sistema MUST exigir empresa criada e verificada para liberar dashboard e modulos operacionais.
- **FR-003**: O sistema MUST criar empresa com documento unico global e `document_type` derivado como CPF ou CNPJ.
- **FR-004**: O sistema MUST enviar codigo de verificacao de onboarding que expira em 15 minutos.
- **FR-005**: O sistema MUST permitir reenvio de codigo com cooldown de 1 minuto e limite antiabuso.
- **FR-005**: O sistema MUST permitir reenvio de codigo com cooldown de 1 minuto e limite antiabuso de 5 reenvios por hora por usuario/empresa.
- **FR-006**: O sistema MUST persistir empresa atual em `users.current_company_id` e sessao apos verificacao.
- **FR-007**: Todas as tabelas operacionais principais MUST ser escopadas por `company_id`.
- **FR-008**: O sistema MUST impedir acesso a dados de outra empresa.
- **FR-009**: Clientes, fornecedores, marcas, categorias e produtos MUST suportar criar, listar, visualizar, editar e excluir/inativar.
- **FR-010**: Registros com vinculo historico MUST ser inativados em vez de excluidos definitivamente.
- **FR-011**: Registros inativos MUST ser omitidos por padrao de novas operacoes e mantidos em historicos.
- **FR-012**: Produtos MUST permitir estoque negativo.
- **FR-013**: Toda alteracao de estoque MUST gerar `stock_movements`.
- **FR-014**: Venda concluida MUST baixar estoque e gerar financeiro a receber.
- **FR-015**: Edicao de venda concluida MUST ajustar estoque pela diferenca e recalcular financeiro.
- **FR-015**: Edicao de venda concluida MUST ajustar estoque pela diferenca e recalcular financeiro.
- **FR-016**: Cancelamento de venda MUST devolver estoque e cancelar ou ajustar financeiro vinculado.
- **FR-017**: Venda cancelada MUST ser bloqueada para edicao.
- **FR-018**: Compra concluida MUST aumentar estoque e gerar financeiro a pagar.
- **FR-019**: Compra concluida MUST permitir decidir se atualiza `products.cost`.
- **FR-020**: `purchase_items.unit_cost` MUST preservar o custo usado na operacao.
- **FR-021**: Cancelamento de compra MUST estornar estoque e cancelar ou ajustar financeiro vinculado.
- **FR-021**: Cancelamento de compra MUST estornar estoque e cancelar ou ajustar financeiro vinculado.
- **FR-022**: Contas a receber MUST nascer automaticamente de vendas.
- **FR-023**: Contas a receber MUST NOT ter baixa manual nesta fase.
- **FR-024**: Contas a pagar MUST nascer automaticamente de compras.
- **FR-025**: Contas a pagar MUST permitir baixa manual com data de pagamento e metodo.
- **FR-026**: Contas vencidas MUST ser calculadas quando `due_date` passou e status continua pendente.
- **FR-027**: Importacao MUST aceitar `.xlsx`, `.xls` e `.csv`.
- **FR-028**: Importacao MUST retornar preview antes de persistir.
- **FR-028**: Importacao MUST retornar preview antes de persistir.
- **FR-029**: Importacao MUST persistir apenas linhas validas.
- **FR-030**: Importacao MUST retornar erros por linha.
- **FR-031**: Importacao MUST permitir ignorar ou atualizar duplicados no preview.
- **FR-032**: Preview de importacao MUST ser confirmado no mesmo fluxo da submissao e MUST NOT ser armazenado para reutilizacao posterior.

## 19. Success Criteria

- **SC-001**: 100% dos usuarios sem empresa ou com empresa nao verificada sao impedidos de acessar modulos operacionais.
- **SC-002**: 100% dos registros operacionais criados ficam associados a empresa atual.
- **SC-003**: 100% das vendas concluidas geram movimentacoes de estoque e contas a receber conforme forma de pagamento.
- **SC-004**: 100% das compras concluidas geram movimentacoes de estoque e contas a pagar conforme forma de pagamento.
- **SC-005**: 100% dos cancelamentos de vendas e compras aplicam estorno ou ajuste de estoque e financeiro.
- **SC-006**: 100% das importacoes exibem preview antes de persistir dados.
- **SC-007**: 0 linhas invalidas sao persistidas em importacoes confirmadas.
- **SC-008**: Operadores conseguem substituir os mocks dos modulos operacionais por dados reais sem alterar o escopo funcional das telas existentes.

## 20. Pontos a Esclarecer

- Definicao exata do fluxo de devolucao com reembolso: status, endpoint dedicado e impacto financeiro/estoque.
- Regras de parcelamento para vendas e compras, incluindo calculo de datas e distribuicao de valores.
- Roles exatas em `company_users` nesta fase, ja que equipe e permissoes customizadas estao fora do escopo.

## 21. Assumptions

- O frontend atual sera mantido e passara a consumir endpoints reais gradualmente.
- O sistema opera com uma empresa por usuario no primeiro momento.
- `company_id` sera usado desde a primeira fase para preparar multiempresa futura.
- Equipe, convites e permissoes customizadas nao serao implementados agora.
- Conta a receber manual nao sera implementada agora.
- Baixa manual existe apenas para contas a pagar.
- Impressora termica direta e integracao fiscal ficam fora desta fase.
