# 📊 Plano de Implementação — Módulo de Relatórios

## Visão Geral

Transformar o módulo de relatórios de um estado "Coming Soon" para relatórios funcionais com dados reais, cards de resumo, filtros via URL, exportação estilizada (PDF/Excel) e busca de comprador específico.

---

## Estrutura Final das Categorias

### 📈 Vendas
| Relatório | Slug | Status Atual | Ação |
|---|---|---|---|
| Vendas | `vendas` | ✅ Dados reais (básico) | Adicionar **cards de resumo** no topo + melhorar colunas |
| Produtos Mais Vendidos | `produtos-mais-vendidos` | ✅ Lógica existe | Adicionar **cards de resumo** |
| Vendas por Categoria | `vendas-categoria` | ❌ Sem lógica | **Criar do zero** — lista completa de produtos com qtd e valor, agrupado |
| Vendas por Marca | `vendas-marca` | ❌ Sem lógica | **Criar do zero** — lista completa de produtos com qtd e valor, agrupado |

### 📦 Estoque
| Relatório | Slug | Status Atual | Ação |
|---|---|---|---|
| Estoque Atual | `estoque-atual` | ✅ Dados reais | Adicionar **cards de resumo** |
| Estoque por Marca | `estoque-marca` | ❌ Sem lógica | **Criar do zero** — Marca, Qtd Produtos, Estoque Total, Valor em Estoque |

> **Remover:** `perdas`, `proximos-vencer`

### 💰 Financeiro (NOVA)
| Relatório | Slug | Status Atual | Ação |
|---|---|---|---|
| Pagamentos por Método | `pagamentos-metodo` | ✅ Lógica existe | Mover de Vendas → Financeiro + **cards de resumo** |
| Inadimplência | `inadimplencia` | ✅ Lógica parcial | Mover de Clientes → Financeiro + **cards de resumo** |

### 👥 Clientes
| Relatório | Slug | Status Atual | Ação |
|---|---|---|---|
| Maiores Compradores | `maiores-compradores` | ✅ Lógica existe | Adicionar **cards de resumo** |
| Comprador Específico | `comprador-especifico` | ❌ Não existe | **Criar do zero** — busca por nome + card resumo + histórico |

> **Remover:** `clientes-cidade`

---

## Arquivos a Remover

| Arquivo | Motivo |
|---|---|
| `pages/dashboard/reports/perdas.tsx` | Relatório removido |
| `pages/dashboard/reports/proximos-vencer.tsx` | Relatório removido |
| `pages/dashboard/reports/clientes-cidade.tsx` | Relatório removido |

---

## Implementação por Etapas

### Etapa 1 — Infraestrutura Base

#### 1.1 Componente `ReportSummaryCards`
Componente reutilizável para exibir cards de resumo no topo de cada relatório.

```
resources/js/components/table/report-summary-cards.tsx
```

- Grid responsivo (2-4 colunas)
- Cada card: ícone + título + valor formatado (R$ ou número)
- Estilo premium com glassmorphism sutil, cores de destaque por categoria

#### 1.2 Refatorar `ReportPage` (`report-page.tsx`)
- Adicionar suporte a `summaryCards` prop
- Renderizar `<ReportSummaryCards>` acima da `<ReportTable>`
- Cada slug define seus próprios cards de resumo

#### 1.3 Melhorar exportação PDF
- Adicionar seção de **resumo no topo** da planilha/PDF (antes da tabela)
- Título claro do relatório
- Data de geração
- Cards de resumo como cabeçalho

#### 1.4 Melhorar exportação Excel
- Adicionar linhas de resumo no topo da planilha
- Título do relatório na primeira linha
- Resumo (ex: "Total de Vendas: R$ X.XXX,XX") antes dos headers

---

### Etapa 2 — Categoria Vendas

#### 2.1 Vendas (aprimorar)
**Cards de resumo:**
- Total de Vendas (R$)
- Quantidade de Vendas
- Ticket Médio (R$)
- Maior Venda (R$)

**Colunas:** Data | Cliente | Produto | Quantidade | Preço Unitário | Total

**Filtros URL:** `?start_date=...&end_date=...`

#### 2.2 Produtos Mais Vendidos (aprimorar)
**Cards de resumo:**
- Total de Produtos Vendidos (unidades)
- Receita Total (R$)
- Produto mais vendido (nome)
- Média por produto (R$)

**Colunas:** Produto | Quantidade Vendida | Receita

#### 2.3 Vendas por Categoria (NOVO)
**Dados:** Agrupar vendas por `category_name` dos itens de venda.
Listar cada produto individualmente mas agrupado visualmente por categoria.

**Cards de resumo:**
- Total de Categorias
- Receita Total (R$)
- Categoria com mais vendas
- Quantidade total de itens

**Colunas:** Categoria | Produto | Quantidade | Valor Unitário | Total

#### 2.4 Vendas por Marca (NOVO)
**Dados:** Agrupar vendas por marca do produto (via `brand_id` → join com brands).
Listar cada produto individualmente mas agrupado visualmente por marca.

**Cards de resumo:**
- Total de Marcas
- Receita Total (R$)
- Marca com mais vendas
- Quantidade total de itens

**Colunas:** Marca | Produto | Quantidade | Valor Unitário | Total

---

### Etapa 3 — Categoria Estoque

#### 3.1 Estoque Atual (aprimorar)
**Cards de resumo:**
- Total de Produtos
- Estoque Total (unidades)
- Valor Total em Estoque (R$)
- Produtos abaixo do mínimo

**Colunas (manter):** SKU | Produto | Quantidade | Mínimo | Preço

#### 3.2 Estoque por Marca (NOVO)
**Dados:** Agrupar produtos por marca (usar `useBrands()` + `useProducts()`).

**Cards de resumo:**
- Total de Marcas
- Estoque Total (unidades)
- Valor Total em Estoque (R$)
- Marca com mais estoque

**Colunas:** Marca | Qtd Produtos | Estoque Total (unidades) | Valor em Estoque (R$)

---

### Etapa 4 — Categoria Financeiro (NOVA)

#### 4.1 Pagamentos por Método (mover + aprimorar)
**Dados:** Já existe a lógica que agrupa vendas+compras por `payment_method`.

**Cards de resumo:**
- Total de Transações
- Valor Total (R$)
- Método mais usado
- Ticket médio (R$)

**Colunas:** Método | Transações | Valor Total

#### 4.2 Inadimplência (mover + aprimorar)
**Dados:** Filtrar receivables com status `overdue` ou `pending` atrasados.

**Cards de resumo:**
- Total de Títulos em Atraso
- Valor Total em Atraso (R$)
- Cliente com mais atraso
- Título mais antigo

**Colunas:** Cliente | Fatura | Vencimento | Valor | Status

---

### Etapa 5 — Categoria Clientes

#### 5.1 Maiores Compradores (aprimorar)
**Cards de resumo:**
- Total de Clientes com compras
- Receita Total (R$)
- Maior comprador (nome)
- Média de gasto por cliente (R$)

**Colunas:** Cliente | Email | Compras | Total Gasto

#### 5.2 Comprador Específico (NOVO)
**Interface especial:**
1. Campo de busca/autocomplete no topo para digitar nome do cliente
2. Ao selecionar, exibir:
   - **Card de resumo:** Nome | Total Gasto | Qtd de Compras | Ticket Médio | Última Compra
   - **Tabela:** Histórico completo de vendas — Data | Produto(s) | Valor | Método de Pagamento | Status

**Colunas:** Data | Produtos | Quantidade | Valor | Método | Status

---

### Etapa 6 — Limpeza e Reorganização

#### 6.1 Atualizar `features/dashboard/reports/index.tsx`
- Remover overlay "Coming Soon"
- Reorganizar categorias: Vendas → Estoque → Financeiro → Clientes
- Remover: Perdas, Próximos de Vencer, Clientes por Cidade
- Adicionar: Comprador Específico
- Mover: Pagamentos por Método → Financeiro, Inadimplência → Financeiro
- Habilitar links (remover `pointer-events-none` e `opacity-40`)

#### 6.2 Atualizar `pages/dashboard/reports/index.tsx`
- Sincronizar com a nova estrutura de categorias
- Remover cards antigos
- Adicionar novos cards

#### 6.3 Deletar páginas removidas
- `perdas.tsx`
- `proximos-vencer.tsx`
- `clientes-cidade.tsx`

#### 6.4 Criar nova página
- `pages/dashboard/reports/comprador-especifico.tsx`

---

## Ordem de Execução Recomendada

| # | Tarefa | Dependência | Estimativa |
|---|---|---|---|
| 1 | Componente `ReportSummaryCards` | — | Rápido |
| 2 | Refatorar `ReportPage` para suportar cards | Tarefa 1 | Rápido |
| 3 | Melhorar exports (PDF/Excel com resumos) | Tarefa 1 | Médio |
| 4 | Vendas + Produtos Mais Vendidos (cards) | Tarefa 2 | Rápido |
| 5 | Vendas por Categoria (novo) | Tarefa 2 | Médio |
| 6 | Vendas por Marca (novo) | Tarefa 2 | Médio |
| 7 | Estoque Atual (cards) + Estoque por Marca (novo) | Tarefa 2 | Médio |
| 8 | Financeiro: Pagamentos por Método + Inadimplência | Tarefa 2 | Rápido |
| 9 | Clientes: Maiores Compradores (cards) | Tarefa 2 | Rápido |
| 10 | Clientes: Comprador Específico (novo) | Tarefa 2 | Médio-Alto |
| 11 | Limpeza: reorganizar index, deletar páginas | Todas | Rápido |
| 12 | Testes | Todas | Médio |

---

## Stack / Abordagem

- **Frontend-only:** Dados via hooks existentes (`useSales`, `useProducts`, `useCustomers`, `useBrands`, `useCategories`, `useAccountReceivables`)
- **Filtros na URL:** Usar `URLSearchParams` para `?start_date=&end_date=` — botão aplica filtros direto na URL
- **Sem novas rotas backend** para relatórios
- **Exportação:** Melhorar `export-pdf.ts` e `export-excel.ts` para incluir resumos no topo
- **Componentes:** Reutilizar `ReportTable`, `TableToolbar`, criar `ReportSummaryCards`

> **IMPORTANTE:** Todos os relatórios terão: **Cards de resumo no topo** → **Toolbar com busca e exportação** → **Tabela de dados**
