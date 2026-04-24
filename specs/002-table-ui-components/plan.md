# Implementation Plan: Table UI Components

**Branch**: `[002-table-ui-components]` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification for table screens with search, filters, create, import, export, actions, and pagination

## Summary

Implementar componentes de tabela reutilizáveis para todas as telas do sistema Operis, incluindo: barra de busca, filtro via sidebar, botão criar, importação (Excel/CSV), exportação (PDF/Excel), coluna ações (ver/editar/excluir), visual alternado de linhas (zebra stripes), e paginação com componentes shadcn. Também implementar 12 páginas de relatórios com rotas dedicadas.

## Technical Context

**Language/Version**: PHP 8.5 with TypeScript 5.7 / React 19 via Inertia v3
**Primary Dependencies**: Laravel 13, Inertia.js React 3, Laravel Wayfinder, Tailwind CSS 4, shadcn/ui, xlsx, jsPDF
**Storage**: Dados via mocks locais (frontend only - sem backend por enquanto)
**Testing**: TypeScript `tsc --noEmit`, Vite production build
**Target Platform**: Server-rendered web application

## Phase 0 Research Output

- See [research.md](./research.md) for decisions on component architecture and library choices.

## Phase 1 Design Output

- See [data-model.md](./data-model.md) for data entities.
- See [contracts/](./contracts) for Laravel ↔ React contracts.
- See [quickstart.md](./quickstart.md) for reviewer validation steps.

## Implementation Scope

### Tabela Comum (todas as telas exceto relatórios)
- Input de busca (busca por qualquer campo)
- Ícone de filtro → sidebar à direita com opções
- Botão "Criar" → abre formulário/modal
- Botão "Importar" → abre dialog para Excel/CSV
- Botão "Exportar" → dropdown PDF/Excel
- Coluna Ações → ícones Ver, Editar, Excluir
- Visual zebra stripes (linhas alternadas)
- Paginação shadcn (25 por página, botões < >)

### Páginas de Relatório (12 rotas)
1. /relatorios/vendas
2. /relatorios/produtos-mais-vendidos
3. /relatorios/vendas-categoria
4. /relatorios/vendas-marca
5. /relatorios/estoque-atual
6. /relatorios/estoque-marca
7. /relatorios/proximos-vencer
8. /relatorios/perdas
9. /relatorios/inadimplencia
10. /relatorios/pagamentos-metodo
11. /relatorios/maiores-compradores
12. /relatorios/clientes-cidade

Cada página: tabela + busca + filtro + paginação + botão Baixar (sem criar/importar/ações)

## Key Decisions

- Usar componente DataTable shadcn como base
- Biblioteca xlsx para Excel, jsPDF para PDF
- Sidebar de filtros via Dialog ou Sheet shadcn
- Paginação via componente Pagination shadcn
- Zebra stripes via classes CSS alternadas