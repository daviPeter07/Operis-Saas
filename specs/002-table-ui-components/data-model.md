# Data Model: Table UI Components

## Entities

### TableData
Representa os dados exibidos em uma tabela.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Identificador único |
| records | array | Array de objetos com dados |
| total | number | Total de registros |
| page | number | Página atual |
| perPage | number | Registros por página (25) |
| filters | object | Filtros ativos |
| search | string | Termo de busca |

---

### Filter
Define critérios de filtro aplicados à tabela.

| Field | Type | Description |
|-------|------|-------------|
| field | string | Campo para filtrar |
| operator | enum | eq, neq, gt, gte, lt, lte, contains, in |
| value | any | Valor do filtro |

---

### TableAction
Ação executada em um registro.

| Field | Type | Description |
|-------|------|-------------|
| type | enum | view, edit, delete |
| recordId | UUID | ID do registro afetado |

---

### ReportConfig
Configuração de uma página de relatório.

| Field | Type | Description |
|-------|------|-------------|
| slug | string | Identificador da rota (ex: "estoque-atual") |
| title | string | Título exibido |
| query | object | Query/filtro do relatório |
| columns | array | Colunas a exibir |