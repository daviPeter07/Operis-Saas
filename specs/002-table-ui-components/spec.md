# Feature Specification: Telas de Tabela com Componentes UI

**Feature Branch**: `[002-table-ui-components]`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "tabelas com search, filtros, criar, import, export, actions, pagination"

## Clarifications

### Session 2026-04-24

- Q: Quais são as opções de relatório específicas que devem aparecer no sistema Operis? → A: Vendas (realizadas por período), Produtos mais vendidos, Vendas por categoria, Vendas por marca, Estoque, Estoque por marca, Próximos de vencer, Perdas, Inadimplência por cliente, Pagamentos por método, Maiores compradores, Clientes por cidade
- Q: Quantos registros por página na paginação? → A: 25 por página
- Q: Página de relatório tem todos os componentes ou apenas alguns? → A: Tabela + paginação + filtro + busca + botão baixar (sem criar, importar, ações)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Busca e Filtro de Dados (Priority: P1)

O usuário precisa localizar registros específicos rapidamente em qualquer tela de tabela. Ele deve poder digitar um termo de busca e aplicar filtros avançados para refinar os resultados.

**Why this priority**: A busca é a ação mais frequente em telas de tabela; sem ela o usuário não consegue acessar dados.

**Independent Test**: Pode ser testado digitando um termo na caixa de busca e verificando se os resultados correspondem.

**Acceptance Scenarios**:

1. **Given** que a tabela contém registros, **When** o usuário digita um termo de busca, **Then** apenas linhas que contêm o termo são exibidas
2. **Given** que o usuário clica no ícone de filtro, **When** uma sidebar abre à direita com opções de filtro, **Then** ao aplicar filtros a tabela exibe apenas registros que atendem aos critérios

---

### User Story 2 - Criar Novo Registro (Priority: P1)

O usuário precisa criar novos registros diretamente da tela de tabela através de um botão "Criar".

**Why this priority**: Funcionalidade essencial para entrada de dados no sistema.

**Independent Test**: Pode ser testadoclicando em "Criar" e preenchendo um formulário, verificando se o novo registro aparece na tabela.

**Acceptance Scenarios**:

1. **Given** que o usuário está na tela de tabela, **When** clica no botão "Criar", **Then** um formulário ou modal de criação abre
2. **Given** que o formulário está preenchido corretamente, **When** o usuário submete, **Then** o novo registro aparece na tabela e uma mensagem de sucesso é exibida

---

### User Story 3 - Importar Dados (Priority: P2)

O usuário precisa importar dados em massa via Excel ou CSV para população rápida de tabelas.

**Why this priority**: Evita entrada manual de muitos registros; facilita migração de dados.

**Independent Test**: Pode ser testado importando um arquivo e verificando se os dados aparecem na tabela.

**Acceptance Scenarios**:

1. **Given** que o usuário clica em "Importar", **When** seleciona arquivo Excel ou CSV, **Then** o sistemaprocessa e exibe preview dos dados
2. **Given** que o preview está correto, **When** o usuário confirma, **Then** os registros são inseridos na tabela

---

### User Story 4 - Exportar Dados (Priority: P2)

O usuário precisa exportar dados da tabela para PDF ou Excel para compartilhar ou arquivar.

**Why this priority**: Necessidade comum para relatórios e integração com outros sistemas.

**Independent Test**: Pode ser testado exportando e verificando que o arquivo baixado contém os dados corretos.

**Acceptance Scenarios**:

1. **Given** que o usuário clica em "Exportar", **When** seleciona o formato (PDF ou Excel), **Then** o arquivo é gerado e baixado automaticamente

---

### User Story 5 - Ações por Registro (Priority: P1)

Cada linha de tabela deve permitir visualizar detalhes, editar e excluir o registro correspondente.

**Why this priority**: Essencial para manutenção de dados; o usuário precisa gerenciar registros individualmente.

**Independent Test**: Pode ser testado realizando cada ação e verificando o resultado.

**Acceptance Scenarios**:

1. **Given** que há registros na tabela, **When** o usuário clica em "Ver" na coluna ações, **Then** um modal ou página de detalhes abre
2. **Given** que há registros na tabela, **When** o usuário clica em "Editar", **Then** um formulário de edição abre com os dados preenchidos
3. **Given** que há registros na tabela, **When** o usuário clica em "Excluir", **Then** uma confirmação aparece e ao confirmar o registro é removido

---

### User Story 6 - Visual Alternado de Linhas (Priority: P3)

As linhas da tabela devem ter cores alternadas para facilitar a leitura.

**Why this priority**: Melhora experiência do usuário em tabelas com muitos dados.

**Independent Test**: Pode ser verificado inspecionando visualmente as linhas.

**Acceptance Scenarios**:

1. **Given** que a tabela tem múltiplas linhas, **When** visualizada, **Then** linhas pares têm uma cor e linhas ímpares têm outra cor (mais clara/escura)

---

### User Story 7 - Paginação (Priority: P1)

O usuário precisa navegar entre páginas de resultados com botões de próxima, anterior e indicador de página atual.

**Why this priority**: Permite explorar grandes volumes de dados sem degradação de performance.

**Independent Test**: Pode ser testado navegando entre páginas.

**Acceptance Scenarios**:

1. **Given** que há mais registros do que cabe em uma página, **When** o usuário clica em "Próxima", **Then** a página seguinte é exibida
2. **Given** que há mais de uma página, **When** o usuário clica em "Anterior", **Then** a página anterior é exibida
3. **Given** que há múltiplas páginas, **When** a paginação é exibida, **Then** mostra o número de páginas de forma visual com componentes styled (shadcn)

---

### User Story 8 - Relatórios (Priority: P2)

Cada relatório (ex: "Estoque atual") terá uma rota própria (ex: `/relatorios/estoque-atual`) com tabela que inclui busca, paginação, filtro e botão baixar. Não terá botão criar, importar ou coluna ações.

**Why this priority**: Cada tipo de relatório precisa de uma página dedicada para visualização e exportação.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa a seção Relatórios no menu, **When** seleciona uma opção de relatório, **Then** é redirecionado para uma rota específica (ex: /relatorios/estoque-atual)
2. **Given** que o usuário está na página de relatório, **When** visualiza, **Then** vê uma tabela com dados, campo de busca, filtros, paginação e botão "Baixar"
3. **Given** que o usuário clica em "Baixar", **When** abre opções (Excel/PDF), **Then** seleciona formato e arquivo é baixado

---

### Edge Cases

- O que acontece quando a tabela não tem dados? Mostrar estado vazio com mensagem amigável.
- O que acontece quando a busca não retorna resultados? Mostrar "Nenhum resultado encontrado".
- Como lidar com importação de arquivo inválido? Exibir mensagem de erro clara.
- Como confirmar exclusão? Sempre pedir confirmação antes de excluir.
- O que acontece quando há erro na paginação? Manter estado atual e exibir erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir busca por texto em qualquer campo da tabela
- **FR-002**: Sistema DEVE abrir sidebar de filtros à direita quando ícone de filtro é clicado
- **FR-003**: Sistema DEVE permitir criar novo registro via botão "Criar"
- **FR-004**: Sistema DEVE permitir importar dados via Excel (.xlsx, .xls) e CSV
- **FR-005**: Sistema DEVE permitir exportar dados para PDF e Excel
- **FR-006**: Cada linha DEVE ter coluna de ações com opções Ver, Editar, Excluir
- **FR-007**: Linhas DEVE ter visual alternado (zebra stripes) para melhor leitura
- **FR-008**: Sistema DEVE implementar paginação com botões Próxima/Anterior e indicador de páginas usando componentes shadcn
- **FR-009**: Relatórios DEVE ter uma rota dedicada por opção (ex: /relatorios/estoque-atual)
- **FR-010**: Cada página de relatório DEVE conter: tabela com dados, busca, paginação, filtro, botão baixar (sem criar, importar, ações)
- **FR-011**: Relatórios DEVE filtrar dados automaticamente ao selecionar opção
- **FR-012**: Relatórios DEVE permitir baixar em Excel ou PDF quando botão "Baixar" é clicado

### Key Entities

- **Tabela dados**: Representa os registros exibidos na tabela com seus campos
- **Filtro**: Define critérios de busca que o usuário aplica
- **Registro**: Item individual na tabela com dados e ações
- **Opção de relatório**: Configuração de relatório pré-definida baseada em regra de negócio

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários localizam registros em até 5 segundos usando busca ou filtros
- **SC-002**: 100% dos registros podem ser criados, editados ou excluídos via interface
- **SC-003**: Importação de arquivo Excel/CSV processa até 1000 registros
- **SC-004**: Exportação para PDF/Excel gera arquivo baixável corretamente
- **SC-005**: Paginação permite navegar entre resultados em menos de 1 segundo
- **SC-006**: Relatórios exibem dados filtrados corretamente ao selecionar opção

## Assumptions

- Todas as telas de tabela seguirão o mesmo padrão UI (menos Relatórios e Configurações)
- O sistema Operis já tem definição de entidades e regras de negócio para relatórios
- Componentes shadcn já estão instalados e podem ser usados para paginação
- Backend fornecerá endpoints para CRUD, busca, filtros, importação e exportação