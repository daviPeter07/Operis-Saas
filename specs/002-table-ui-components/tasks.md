# Implementation Tasks: Table UI Components

> **⚠️ AVISO IMPORTANTE**: As tarefas DEVEM ser executadas SEQUENCIALMENTE.
> - **NÃO** inicie a próxima tarefa sem ter completado a anterior
> - Ao completar cada tarefa, traga o **relatório completo** do que foi feito
> - A próxima tarefa só será iniciada após a aprovação e reporte da anterior
> - Aguarde instrução do usuário para prosseguir

**Feature**: Telas de Tabela com Componentes UI  
**Plan**: `specs/002-table-ui-components/plan.md`  
**Generated**: 2026-04-24  
**Scope**: Frontend Only (dados via mocks)

---

## Dependency Graph

```
[Setup] → [Foundational] → [US1: Busca] → [US2: Criar] → [US5: Ações] → [US7: Paginação]
                  ↓
              [US3: Import] ← [US4: Export] (P2, podem paralelizar)
                  ↓
              [US8: Relatórios] → [Polish]
                  ↓
              [US6: Zebra Stripes] (visual, baixa prioridade)
```

**Parallel Opportunities**:
- US1, US2, US3, US4, US5 podem paralelizar se foundational completo
- US6 (zebra stripes) é independente e pode ser feito a qualquer momento

---

## Phase 1: Setup

- [x] T001 ✅ Instalar biblioteca xlsx para manipulação Excel/CSV em `package.json`
- [x] T002 ✅ Instalar biblioteca jsPDF e jspdf-autotable para geração PDF em `package.json`
- [x] T003 ✅ Verificar componentes shadcn/ui instalados (Table, Pagination, Dialog, Sheet, Button, Input, DropdownMenu, AlertDialog)

---

## Phase 2: Foundational

- [x] T004 ✅ [P] Criar mocks de dados em `resources/js/lib/mocks/mock-data.ts`
- [x] T005 ✅ [P] Criar mocks de relatórios em `resources/js/lib/mocks/mock-reports.ts`
- [x] T006 ✅ [P] Criar hook useTablePagination em `resources/js/hooks/use-table-pagination.ts`
- [x] T007 ✅ [P] Criar hook useTableFilters em `resources/js/hooks/use-table-filters.ts`
- [x] T008 ✅ [P] Criar hook useTableSearch em `resources/js/hooks/use-table-search.ts`
- [x] T009 ✅ [P] Criar componente DataTable base em `resources/js/components/table/data-table.tsx`
- [x] T010 ✅ [P] Criar componente DataTableRow em `resources/js/components/table/data-table-row.tsx`
- [x] T011 ✅ [P] Criar componente Pagination em `resources/js/components/table/pagination.tsx`
- [x] T012 ✅ [P] Criar EmptyState em `resources/js/components/table/empty-state.tsx`

> **📝 URL State Management (Laravel + Inertia)**: Busca, filtros e paginação DEVEM ser controlados pela URL usando Inertia router.
> - `?search=termo` - termo de busca
> - `?page=1&per_page=25` - paginação
> - `?filters[field]=value` - filtros aplicados
> - Usar `router.get()` do Inertia para navegação com `preserveState: true`

---

## Phase 3: User Story 1 - Busca e Filtro de Dados (P1)

**Independent Test**: Digitar termo na busca e verificar filtragem; clicar filtro e verificar sidebar

- [x] T013 ✅ [US1] Implementar TableToolbar com Input de busca em `resources/js/components/table/table-toolbar.tsx`
- [x] T014 ✅ [US1] Implementar debounce de 300ms na busca via useTableSearch
- [x] T015 ✅ [US1] Implementar FilterSidebar com campos dinâmicos em `resources/js/components/table/filter-sidebar.tsx`
- [x] T016 ✅ [US1] Conectar busca e filtros ao estado da tabela via hooks (com controle de URL via Inertia router)

> **📝 URL State Control**: Busca, filtros e paginação são controlados pela URL usando `router.get()` do Inertia.
> - `?search=termo` - termo de busca
> - `?page=1` - paginação
> - `?filters[field]=value` - filtros aplicados

---

## Phase 4: User Story 2 - Criar Novo Registro (P1)

**Independent Test**: Clicar "Criar", preencher formulário, verificar novo registro na tabela

- [ ] T018 [US2] Adicionar botão "Criar" no TableToolbar
- [ ] T019 [US2] Criar CreateModal em `resources/js/components/table/create-modal.tsx`
- [ ] T020 [US2] Implementar abertura do modal ao clicar "Criar"
- [ ] T021 [US2] Implementar handleSubmit para adicionar registro aos mocks
- [ ] T022 [US2] Mostrar toast de sucesso após criação
- [ ] T023 [US2] Atualizar tabela após criação

---

## Phase 5: User Story 5 - Ações por Registro (P1)

**Independent Test**: Clicar em Ver/Editar/Excluir e verificar comportamento

- [ ] T024 [US5] Implementar TableActions na DataTable com ícones View, Edit, Delete em `resources/js/components/table/table-actions.tsx`
- [ ] T025 [US5] Criar ViewDialog em `resources/js/components/table/view-dialog.tsx`
- [ ] T026 [US5] Criar EditDialog em `resources/js/components/table/edit-dialog.tsx`
- [ ] T027 [US5] Criar DeleteConfirmDialog em `resources/js/components/table/delete-confirm-dialog.tsx`
- [ ] T028 [US5] Implementar handlers para cada ação (view, edit, delete) com estado local

---

## Phase 6: User Story 7 - Paginação (P1)

**Independent Test**: Navegar entre páginas e verificar dados corretos

- [ ] T029 [US7] Implementar Pagination shadcn na DataTable
- [ ] T030 [US7] Configurar 25 registros por página
- [ ] T031 [US7] Implementar Previous/Next buttons
- [ ] T032 [US7] Implementar page indicator (página atual de total)
- [ ] T033 [US7] Sincronizar paginação com estado local via useTablePagination

---

## Phase 7: User Story 3 - Importar Dados (P2)

**Independent Test**: Importar arquivo Excel/CSV e verificar dados na tabela

- [ ] T034 [US3] Implementar ImportDialog em `resources/js/components/table/import-dialog.tsx`
- [ ] T035 [US3] Adicionar input file aceite .xlsx, .xls, .csv
- [ ] T036 [US3] Implementar preview dos dados antes de importar (xlsx parsing)
- [ ] T037 [US3] Implementar merge dos dados importados com estado local
- [ ] T038 [US3] Tratar erros de arquivo inválido com mensagem clara

---

## Phase 8: User Story 4 - Exportar Dados (P2)

**Independent Test**: Exportar tabela para PDF/Excel e verificar arquivo

- [ ] T039 [US4] Adicionar dropdown "Exportar" no TableToolbar
- [ ] T040 [US4] Implementar exportação Excel via xlsx
- [ ] T041 [US4] Implementar exportação PDF via jsPDF + autotable
- [ ] T042 [US4] Manter formatação de colunas na exportação

---

## Phase 9: User Story 8 - Relatórios (P2)

**Independent Test**: Selecionar relatório, verificar rota e tabela, baixar

- [ ] T043 [US8] Criar página de relatório genérica em `resources/js/pages/dashboard/reports/[slug].tsx`
- [ ] T044 [US8] Criar componentes específicos para cada relatório com mocks
- [ ] T045 [US8] Implementar layout simplificado: tabela + busca + filtro + paginação + baixar
- [ ] T046 [US8] Implementar rota /relatorios/vendas com mock
- [ ] T047 [US8] Implementar rota /relatorios/produtos-mais-vendidos com mock
- [ ] T048 [US8] Implementar rota /relatorios/vendas-categoria com mock
- [ ] T049 [US8] Implementar rota /relatorios/vendas-marca com mock
- [ ] T050 [US8] Implementar rota /relatorios/estoque-atual com mock
- [ ] T051 [US8] Implementar rota /relatorios/estoque-marca com mock
- [ ] T052 [US8] Implementar rota /relatorios/proximos-vencer com mock
- [ ] T053 [US8] Implementar rota /relatorios/perdas com mock
- [ ] T054 [US8] Implementar rota /relatorios/inadimplencia com mock
- [ ] T055 [US8] Implementar rota /relatorios/pagamentos-metodo com mock
- [ ] T056 [US8] Implementar rota /relatorios/maiores-compradores com mock
- [ ] T057 [US8] Implementar rota /relatorios/clientes-cidade com mock

---

## Phase 10: User Story 6 - Visual Alternado (P3)

**Independent Test**: Visualizar tabela e verificar zebra stripes

- [ ] T058 [US6] Implementar CSS para zebra stripes em `resources/js/components/table/data-table-row.tsx`
- [ ] T059 [US6] Aplicar classes tailwind alternadas (bg-gray-50, bg-white)

---

## Phase 11: Polish & Cross-Cutting

- [ ] T060 Verificar estado vazio quando tabela sem dados
- [ ] T061 Verificar mensagem "Nenhum resultado" quando busca não encontra
- [ ] T062 Aplicar keyboard navigation na tabela
- [ ] T063 Testar responsividade em mobile/tablet
- [ ] T064 Run `npm run build` para verificar build

---

## Summary

| Phase | Tasks | User Story |
|-------|-------|------------|
| Setup | 3 | - |
| Foundational | 9 | - |
| US1 (P1) | 5 | Busca e Filtro |
| US2 (P1) | 6 | Criar |
| US5 (P1) | 5 | Ações |
| US7 (P1) | 5 | Paginação |
| US3 (P2) | 5 | Importar |
| US4 (P2) | 4 | Exportar |
| US8 (P2) | 14 | Relatórios |
| US6 (P3) | 2 | Zebra Stripes |
| Polish | 5 | - |

**Total**: 63 tarefas

**Suggested MVP Scope**: Fases 1-6 (Setup, Foundational, US1, US2, US5, US7) - tabela funcional com busca, criar, ações e paginação

**Parallel Opportunities**: US1, US2, US3, US4, US5 após foundational completo

**Nota**: Backend não incluído - todos os dados são mocks locais