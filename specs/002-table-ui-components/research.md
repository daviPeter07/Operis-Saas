# Research: Table UI Components

## Decision: Component Architecture

**Decision**: Usar DataTable do shadcn/ui como base para tabelas

**Rationale**: shadcn/ui já está instalado no projeto, oferece componentes acessíveis e customizáveis

**Alternatives considered**: 
- react-table (TanStack Table) puro - requer mais customização
- DataGrid de libs externas - maior bundle size
- Criar do zero - alto esforço de manutenção

---

## Decision: Biblioteca de Excel

**Decision**: Biblioteca xlsx (SheetJS)

**Rationale**: Suporta .xlsx, .xls, CSV; bem mantida; boa para parsing e generation

**Alternatives considered**:
- exceljs - mais recursos mas maior
- csv-parser - só CSV
- xlsx-populate - só geração

---

## Decision: Biblioteca de PDF

**Decision**: jsPDF com jspdf-autotable

**Rationale**: Integração simples com tabelas; bom suporte a表格

**Alternatives considered**:
- pdfmake - mais complexo
- jspdf-only - sem suporte表格
- react-pdf - para visualização

---

## Decision: Sidebar de Filtros

**Decision**: Usar Sheet ou Dialog do shadcn

**Rationale**: Componentes já disponíveis no projeto

**Alternatives considered**:
- Drawer customizado - mais trabalho
- Popover - limitado para muitos filtros
- Page separada - navegação extra

---

## Decision: Paginação

**Decision**: Usar Pagination do shadcn/ui

**Rationale**: Componente acessível, stylizado, já disponível

**Alternatives considered**:
- Custom pagination - mais trabalho
- Infite scroll - não pedido
- Load more button - diferente do solicitado