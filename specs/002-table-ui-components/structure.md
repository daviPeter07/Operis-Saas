# Project Structure: Table UI Components

## Source Code Structure

```text
resources/js/
├── components/
│   ├── table/
│   │   ├── table-toolbar.tsx          # Barra de ferramentas (busca, filtros, criar, importar, exportar)
│   │   ├── filter-sidebar.tsx         # Sidebar de filtros à direita
│   │   ├── table-actions.tsx          # Coluna ações (Ver, Editar, Excluir)
│   │   ├── view-dialog.tsx            # Dialog para visualizar detalhes
│   │   ├── edit-dialog.tsx            # Dialog para editar registro
│   │   ├── delete-confirm-dialog.tsx  # Dialog de confirmação de exclusão
│   │   ├── create-modal.tsx           # Modal para criar novo registro
│   │   ├── import-dialog.tsx          # Dialog para importar Excel/CSV
│   │   ├── empty-state.tsx            # Estado vazio da tabela
│   │   ├── data-table.tsx             # Componente DataTable base com zebra stripes
│   │   ├── data-table-row.tsx         # Linha da tabela
│   │   └── pagination.tsx             # Componente de paginação
│   └── ui/
│       └── (componentes shadcn existentes)
├── hooks/
│   ├── use-table-pagination.ts       # Hook para gerenciar paginação
│   └── use-table-filters.ts         # Hook para gerenciar filtros
├── lib/
│   ├── export.ts                     # Utilitário para exportar Excel
│   ├── export-pdf.ts                 # Utilitário para exportar PDF
│   └── mocks/
│       ├── mock-data.ts              # Dados mockados para desenvolvimento
│       ├── mock-reports.ts           # Mocks específicos para relatórios
│       └── mock-filters.ts           # Mocks de opções de filtro
├── pages/
│   └── dashboard/
│       ├── products.tsx              # Exemplo de tabela completa
│       ├── clients.tsx
│       ├── suppliers.tsx
│       ├── brands.tsx
│       ├── categories.tsx
│       ├── inventory.tsx
│       ├── sales.tsx
│       ├── purchases.tsx
│       ├── accounts-receivable.tsx
│       ├── accounts-payable.tsx
│       ├── team.tsx
│       └── reports/
│           ├── index.tsx             # Menu de relatórios
│           ├── vendas.tsx             # Relatório de vendas
│           ├── produtos-mais-vendidos.tsx
│           ├── vendas-categoria.tsx
│           ├── vendas-marca.tsx
│           ├── estoque-atual.tsx
│           ├── estoque-marca.tsx
│           ├── proximos-vencer.tsx
│           ├── perdas.tsx
│           ├── inadimplencia.tsx
│           ├── pagamentos-metodo.tsx
│           ├── maiores-compradores.tsx
│           └── clientes-cidade.tsx
└── routes/
    └── dashboard.ts                   # Rotas geradas pelo Wayfinder
```

## Arquivos a Criar (Frontend Only - Mocks)

### Componentes de Tabela

| Arquivo | Descrição |
|---------|-----------|
| `components/table/data-table.tsx` | DataTable base com zebra stripes |
| `components/table/data-table-row.tsx` | Linha da tabela |
| `components/table/table-toolbar.tsx` | Toolbar com busca, filtros, criar, importar, exportar |
| `components/table/filter-sidebar.tsx` | Sheet/Sidebar de filtros |
| `components/table/table-actions.tsx` | Componente de ações |
| `components/table/view-dialog.tsx` | Dialog de visualização |
| `components/table/edit-dialog.tsx` | Dialog de edição |
| `components/table/delete-confirm-dialog.tsx` | Dialog de confirmação |
| `components/table/create-modal.tsx` | Modal de criação |
| `components/table/import-dialog.tsx` | Dialog de importação |
| `components/table/empty-state.tsx` | Estado vazio |
| `components/table/pagination.tsx` | Componente de paginação |

### Hooks

| Arquivo | Descrição |
|---------|-----------|
| `hooks/use-table-pagination.ts` | Hook de paginação |
| `hooks/use-table-filters.ts` | Hook de filtros |
| `hooks/use-table-search.ts` | Hook de busca com debounce |

### Utilitários

| Arquivo | Descrição |
|---------|-----------|
| `lib/export.ts` | Utilitário Excel |
| `lib/export-pdf.ts` | Utilitário PDF |
| `lib/mocks/mock-data.ts` | Dados mockados |
| `lib/mocks/mock-reports.ts` | Mocks de relatórios |

### Páginas de Relatório

| Arquivo | Descrição |
|---------|-----------|
| `pages/dashboard/reports/vendas.tsx` | Relatório de vendas |
| `pages/dashboard/reports/estoque-atual.tsx` | Relatório estoque |
| `pages/dashboard/reports/...` | Outros relatórios |

## Mocks de Dados

### Exemplo: mock-data.ts

```typescript
export const mockProducts = [
  { id: '1', name: 'Produto A', price: 100, stock: 50, category: 'Eletrônicos' },
  { id: '2', name: 'Produto B', price: 200, stock: 30, category: 'Eletrônicos' },
  // ...
];

export const mockReportVendas = [
  { id: '1', date: '2024-01-15', total: 1500, client: 'Cliente X', items: 5 },
  // ...
];
```

## Dependências a Instalar

```bash
npm install xlsx jspdf jspdf-autotable
```

## Rotas (Frontend - Wayfinder)

```typescript
dashboard.products
dashboard.clients
dashboard.suppliers
dashboard.brands
dashboard.categories
dashboard.inventory
dashboard.sales
dashboard.purchases
dashboard.accountsReceivable
dashboard.accountsPayable
dashboard.team
dashboard.reports.vendas
dashboard.reports.estoqueAtual
// ... outras rotas de relatórios
```

## Nota

- **Backend**: Não incluído nesta fase - dados vêm de mocks
- **Rotas backend**: Serão adicionadas quando backend for implementado
- **Foco**: UI/UX, componentes React, interatividade com dados mockados