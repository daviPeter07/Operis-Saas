# Feature Specification: Correcoes de Usabilidade em Tabelas

**Feature Branch**: `003-table-ui-components`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "vamos iniciar um plano de concertar pequenos bugs aqui nas seguintes telas..."

## Clarifications

### Session 2026-05-01

- Q: Como deve funcionar o redirecionamento de alertas e lembretes para telas com filtros? → A: Mapeamento fixo por tipo de item para tabela de destino e filtros predefinidos.
- Q: Qual regra define pessoa fisica ou juridica em clientes? → A: Campo explicito de tipo de pessoa como regra principal; documento apenas valida consistencia.
- Q: Qual regra de uso para estado e cidade no componente de localidade? → A: Ambos opcionais, porem a selecao de cidade exige selecao previa de estado.
- Q: Como padronizar os nomes de metodos de pagamento em portugues? → A: Usar lista canonica unica em portugues com os mesmos rotulos em compras e contas a pagar.
- Q: Qual o alcance da substituicao do calendario? → A: Substituir em todos os pontos ativos de data (filtros, formularios, modais e dialogs).
- Q: Qual origem de dados usar no componente global de estado/cidade? → A: Fonte canonica unica ja existente no sistema, centralizada para reuso.
- Q: Como organizar esses valores de reuso no frontend? → A: Centralizar em constantes compartilhadas.
- Q: Qual alcance da padronizacao de organizacao de codigo limpo nesta entrega? → A: Aplicar o padrao em todos os arquivos tocados nesta entrega.
- Q: O que fazer quando o usuario nao tiver permissao para a tela de destino ao clicar em alerta/lembrete? → A: Nao redirecionar e exibir mensagem clara de acesso negado.
- Q: Quais campos de endereco em fornecedores serao obrigatorios? → A: Nenhum, todos opcionais.
- Q: O que significa o dialogo de compras ser o mais parecido possivel com o de vendas? → A: Mesma estrutura visual base (secoes, ordem e padroes de interacao), alterando apenas campos especificos de compras.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Navegacao por Alertas com Filtro (Priority: P1)

Como usuario da tela de visao geral, quero clicar em alertas e lembretes e ser levado para a tabela correspondente com filtros aplicados para agir rapidamente sem refazer buscas.

**Why this priority**: reduz tempo de resposta operacional e conecta o dashboard as acoes principais do dia.

**Independent Test**: pode ser testado clicando em cada item de alerta/lembrete e validando se a tela de destino abre com filtros corretos ativos.

**Acceptance Scenarios**:

1. **Given** que estou na aba de alertas e lembretes da visao geral, **When** clico em um item de alerta, **Then** sou redirecionado para a tabela relacionada com os filtros do alerta aplicados automaticamente.
2. **Given** que estou na aba de alertas e lembretes da visao geral, **When** clico em um item de lembrete, **Then** sou redirecionado para a tabela relacionada com os filtros do lembrete aplicados automaticamente.
3. **Given** que o filtro do item contem criterio invalido ou indisponivel, **When** acesso a tabela de destino, **Then** o sistema mostra estado seguro com filtro padrao e mensagem clara ao usuario.

---

### User Story 2 - Identificacao e Busca Padronizada de Pessoas e Enderecos (Priority: P1)

Como usuario de clientes e fornecedores, quero diferenciar pessoa fisica e juridica visualmente e usar um mesmo componente de pesquisa por cidade e estado para localizar registros com rapidez e consistencia.

**Why this priority**: impacta diretamente cadastros e consultas frequentes em duas telas criticas.

**Independent Test**: pode ser testado verificando badges de tipo de pessoa, comportamento do componente de cidade/estado em clientes e fornecedores, e campos de endereco desacoplados em fornecedores.

**Acceptance Scenarios**:

1. **Given** uma listagem de clientes, **When** visualizo cada linha, **Then** consigo identificar claramente se o cliente e pessoa fisica ou juridica por meio de indicador visual.
2. **Given** formularios ou filtros com localidade em clientes e fornecedores, **When** uso o componente de cidade e estado, **Then** consigo selecionar estado e pesquisar cidade no mesmo padrao de interacao em ambas as telas.
3. **Given** cadastro ou edicao de fornecedor, **When** preencho endereco, **Then** encontro campos separados para rua, bairro, numero e CEP.

---

### User Story 3 - Consistencia Visual e Terminologia Financeira (Priority: P2)

Como usuario de vendas, compras e contas a pagar, quero que status e metodos de pagamento aparecam de forma consistente e em portugues para reduzir erros de leitura e operacao.

**Why this priority**: padronizacao melhora entendimento e reduz ambiguidade em processos financeiros.

**Independent Test**: pode ser testado validando badges de status em vendas, comparando o dialogo de criacao de compras com o de vendas e checando exibicao em portugues de metodos de pagamento.

**Acceptance Scenarios**:

1. **Given** a tabela de vendas, **When** visualizo a coluna de status, **Then** os status aparecem com badges consistentes com o padrao usado em contas a pagar e receber.
2. **Given** o dialogo de criacao de compras, **When** abro o formulario, **Then** encontro estrutura visual e fluxo semelhante ao dialogo de vendas, respeitando os campos proprios de compras.
3. **Given** telas de compras e contas a pagar com metodo de pagamento, **When** visualizo os valores, **Then** os nomes sao exibidos em portugues de forma padronizada.

---

### User Story 4 - Padronizacao de Selecao de Datas (Priority: P2)

Como usuario do sistema, quero o mesmo comportamento de calendario em todas as telas para reduzir inconsistencias e erros de preenchimento de datas.

**Why this priority**: aumenta previsibilidade de uso e reduz retrabalho ao navegar entre modulos.

**Independent Test**: pode ser testado percorrendo os fluxos com data e confirmando que o mesmo componente de calendario e utilizado em todos os pontos.

**Acceptance Scenarios**:

1. **Given** qualquer campo de data no sistema, **When** abro o seletor, **Then** o comportamento visual e interativo segue um unico padrao de calendario.

---

### Edge Cases

- Item de alerta aponta para um registro que nao existe mais na tabela de destino.
- Filtros vindos da visao geral incluem combinacoes sem resultado.
- Cliente ou fornecedor sem informacao completa para inferir tipo de pessoa.
- Cidade pesquisada sem estado selecionado ou estado sem cidades disponiveis.
- Metodos de pagamento legados com nomenclatura mista (ingles e portugues).
- Campos de data com valor preexistente invalido ao abrir o calendario.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Itens da aba de alertas e lembretes na visao geral MUST ser clicaveis.
- **FR-002**: Ao clicar em alerta ou lembrete, o sistema MUST redirecionar para a tabela correspondente com filtros preaplicados conforme contexto do item.
- **FR-013**: O redirecionamento de cada tipo de alerta/lembrete MUST seguir mapeamento fixo e explicito para tabela de destino e conjunto de filtros predefinidos.
- **FR-003**: A tela de clientes MUST exibir identificacao visual clara de pessoa fisica e pessoa juridica para cada registro.
- **FR-014**: A classificacao de pessoa fisica/juridica MUST usar o campo explicito de tipo de pessoa como fonte principal, com validacao de consistencia por documento.
- **FR-004**: O sistema MUST disponibilizar um componente unico e reutilizavel de localidade com selecao de estado e pesquisa de cidade.
- **FR-005**: O componente de localidade MUST ser aplicado nos pontos equivalentes de clientes e fornecedores, substituindo variacoes existentes.
- **FR-015**: No componente de localidade, estado e cidade MUST ser opcionais; porem, a selecao de cidade MUST exigir estado previamente selecionado.
- **FR-006**: A tela de fornecedores MUST usar campos de endereco desacoplados para rua, bairro, numero e CEP.
- **FR-020**: No cadastro/edicao de fornecedores, os campos de endereco desacoplados (rua, bairro, numero e CEP) MUST ser opcionais.
- **FR-007**: A tabela de vendas MUST exibir status com badges no mesmo padrao visual e semantico ja adotado nas areas financeiras.
- **FR-008**: O dialogo de criacao de compras MUST seguir a mesma estrutura visual base do dialogo de vendas (secoes, ordem e padroes de interacao), alterando apenas os campos especificos de compras.
- **FR-009**: Compras e contas a pagar MUST exibir metodos de pagamento em portugues padronizado.
- **FR-016**: A exibicao de metodos de pagamento MUST usar lista canonica unica em portugues, com rotulos identicos em compras e contas a pagar.
- **FR-017**: O componente global de localidade MUST consumir uma unica fonte canonica de estado/cidade reutilizada por clientes e fornecedores.
- **FR-018**: Arquivos alterados nesta entrega MUST seguir padrao de organizacao por feature com separacao coerente de constantes, hooks e types, sem alterar comportamento funcional esperado.
- **FR-010**: Todos os pontos ativos do sistema que usam seletor de data MUST adotar um unico padrao de calendario, incluindo filtros, formularios, modais e dialogs.
- **FR-011**: Quando filtros de redirecionamento nao puderem ser aplicados integralmente, o sistema MUST aplicar fallback seguro e informar o usuario sem bloquear a navegacao.
- **FR-012**: As alteracoes MUST preservar comportamento existente de permissao de acesso por tela.
- **FR-019**: Quando o usuario nao tiver permissao para a tela alvo de alerta/lembrete, o sistema MUST bloquear o redirecionamento e exibir mensagem clara de acesso negado.

### Key Entities *(include if feature involves data)*

- **Alerta/Lembrete**: item de acompanhamento da visao geral com referencia para modulo de destino e criterios de filtro.
- **Filtro de Tabela**: conjunto de criterios aplicados automaticamente na navegacao entre telas.
- **Cliente**: registro comercial com classificacao de tipo de pessoa (fisica ou juridica).
- **Fornecedor**: registro de parceiro com campos de endereco estruturados.
- **Metodo de Pagamento**: rotulo exibido em contexto financeiro que deve seguir idioma e padrao unico.
- **Campo de Data**: ponto de entrada de data presente em formularios e filtros do sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste de fluxo, 100% dos itens clicaveis de alertas e lembretes levam a tela correta com filtro inicial coerente com o item.
- **SC-002**: Usuarios conseguem identificar tipo de cliente (fisica/juridica) em menos de 3 segundos por registro em avaliacao de usabilidade interna.
- **SC-003**: Pelo menos 90% dos usuarios de operacao concluem busca por cidade/estado em clientes e fornecedores na primeira tentativa.
- **SC-004**: 100% dos status de vendas e metodos de pagamento em compras e contas a pagar aparecem em padrao visual e idioma definidos.
- **SC-005**: 100% dos campos de data auditados nas telas afetadas utilizam o mesmo padrao de calendario.

## Assumptions

- A regra para diferenciar pessoa fisica e juridica reutiliza dados cadastrais ja existentes no registro do cliente.
- A substituicao do calendario cobre telas e componentes ativos no fluxo principal do produto, sem incluir paginas descontinuadas.
- O padrao de badges de status e o mesmo ja aceito pelo time no modulo financeiro.
- Textos de metodo de pagamento em portugues seguem nomenclatura de negocio ja adotada pela operacao.
- O escopo desta entrega e de ajustes de experiencia e consistencia; nao inclui novas regras fiscais ou financeiras.
