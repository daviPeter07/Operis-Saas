# Escopo do MVP Front-end - Operis

## Documento de planejamento semanal

## Contexto

O Operis será um sistema SaaS multiempresa com personalização por cliente, permitindo que cada empresa tenha seus próprios dados, usuários e identidade visual sem interferir nas demais.

Neste primeiro momento, o foco será a entrega de um MVP somente front-end, com interfaces responsivas, dados mockados e fluxo visual validável, para apresentação e evolução futura do produto.

## Objetivo

Construir, em 1 semana, um MVP front-end responsivo do Operis com estrutura visual sólida, navegação clara, módulos principais do sistema e experiência coerente para uso comercial inicial.

O MVP deve permitir visualizar a proposta real do sistema, validar layout, navegação e usabilidade, apresentar os módulos centrais do produto e preparar a base para integração futura com o backend.

## Critério de aprovação

* ☐ A navegação principal está funcional entre todos os módulos.
* ☐ Todas as telas principais estão criadas em versão visual.
* ☐ O sistema está responsivo nas principais larguras.
* ☐ A Visão Geral está funcional com dados mockados.
* ☐ Os módulos principais possuem listagem, formulário e visualização.
* ☐ O botão de ação rápida no header está funcional visualmente.
* ☐ O comprovante de venda possui prévia digital e térmica.
* ☐ A diferenciação visual de permissões por role está representada.
* ☐ A tela de Configurações está visível apenas para admin.
* ☐ A sessão de Relatórios permite filtros e exportação visual.
* ☐ O projeto possui consistência visual entre telas, componentes e interações.

## Checklist geral do MVP

### Estrutura base

* ☐ Criar layout principal autenticado.
* ☐ Criar sidebar do sistema.
* ☐ Criar header global.
* ☐ Criar sistema de navegação entre módulos.
* ☐ Criar variação visual por tema/cor da empresa.
* ☐ Preparar estrutura visual multiempresa.
* ☐ Definir tipografia, espaçamentos e padrão visual global.

### Módulos do menu lateral

* ☐ Visão Geral
* ☐ Clientes
* ☐ Fornecedores
* ☐ Marcas
* ☐ Categorias
* ☐ Estoque
* ☐ Compras
* ☐ Vendas
* ☐ Contas a Pagar
* ☐ Contas a Receber
* ☐ Equipe
* ☐ Relatórios
* ☐ Configurações

### Roles e permissões visuais

* ☐ Admin com acesso total visual.
* ☐ Supervisor sem acesso a equipe/configurações.
* ☐ User com acesso limitado visual.

## Planejamento de execução - 1 semana

### Dia 1 - Estrutura base e navegação

**Objetivo:** Montar a fundação visual do sistema.

#### Checklist

* ☐ Criar layout principal autenticado.
* ☐ Criar sidebar com todos os módulos.
* ☐ Criar header global.
* ☐ Criar botão de ação rápida no header.
* ☐ Criar dropdown de ação rápida com criar cliente, produto, venda, compra, despesa e marca.
* ☐ Criar estados visuais da navegação.
* ☐ Criar estrutura base para role-based UI.
* ☐ Criar página inicial da Visão Geral.

#### Critério de aprovação

* ☐ Sidebar funcional.
* ☐ Header funcional.
* ☐ Dropdown de ações rápidas funcional visualmente.
* ☐ Estrutura de navegação pronta.

### Dia 2 - Visão Geral / Dashboard

**Objetivo:** Entregar o dashboard inicial em modo KPI e gráficos.

#### Checklist

* ☐ Criar aba de KPI.
* ☐ Criar aba de gráficos.
* ☐ Criar cards com dados mockados de vendas, lucro, contas a receber e contas a pagar.
* ☐ Criar filtros por período: últimos 7 dias, último mês, últimos 3 meses, último ano, todos os períodos e intervalo personalizado.
* ☐ Criar gráfico de vendas por período.
* ☐ Criar gráfico de lucro por período.
* ☐ Criar gráfico de contas a pagar x contas a receber.
* ☐ Criar seção de atividades recentes.
* ☐ Garantir coerência visual com os prints de referência.

#### Critério de aprovação

* ☐ Dashboard alterna entre KPI e gráficos.
* ☐ Filtros visuais aplicáveis no front mockado.
* ☐ Cards e gráficos com boa leitura.
* ☐ Layout coerente com desktop.

### Dia 3 - Clientes, Fornecedores, Marcas e Categorias

**Objetivo:** Entregar os módulos cadastrais centrais.

#### Checklist

* ☐ Criar em Clientes: listagem, cadastro, visualização, edição, exclusão visual e filtros por status, tag, cidade e nome crescente/decrescente.
* ☐ Criar em Fornecedores: listagem, cadastro, visualização, edição, exclusão visual e filtros por nome, status e ordem alfabética.
* ☐ Criar módulo de Marcas com listagem, cadastro, edição, visualização e exclusão visual.
* ☐ Criar módulo de Categorias com listagem, cadastro, edição, visualização e exclusão visual.

#### Critério de aprovação

* ☐ Os 4 módulos estão navegáveis.
* ☐ Formulários visuais estão completos.
* ☐ Filtros estão representados.
* ☐ Padrão visual consistente.

### Dia 4 - Estoque, Compras e Vendas

**Objetivo:** Entregar os módulos operacionais principais.

#### Checklist

* ☐ Criar em Estoque/Produtos: listagem, cadastro, edição, visualização, exclusão visual e filtros por nome, categoria, marca, status, estoque baixo, ordem alfabética e maior/menor preço.
* ☐ Criar em Compras: listagem, cadastro, visualização, edição, exclusão visual, tabela de itens, status pendente/finalizada/cancelada e número manual ou automático.
* ☐ Criar em Vendas: listagem, cadastro, visualização, edição, exclusão visual, tabela de itens, número manual ou automático, formas de pagamento e status pendente/concluída/cancelada.

#### Critério de aprovação

* ☐ Estoque, compras e vendas navegáveis.
* ☐ Formulários coerentes.
* ☐ Itens internos bem representados.
* ☐ Fluxo visual de operação validável.

### Dia 5 - Financeiro e Equipe

**Objetivo:** Entregar contas a pagar, contas a receber e equipe.

#### Checklist

* ☐ Criar em Contas a Pagar: listagem, cadastro, visualização, edição, exclusão visual, campos do módulo e filtros por status, vencimento, fornecedor, ordem por data e maior/menor valor.
* ☐ Criar em Contas a Receber: listagem, cadastro, visualização, edição, exclusão visual, campos do módulo e filtros por status, vencimento, cliente, ordem por data e maior/menor valor.
* ☐ Criar em Equipe: listagem, cadastro, visualização, edição, exclusão visual, upload de foto, avatares da aplicação e roles admin, supervisor e user.
* ☐ Restringir acesso visual conforme role.

#### Critério de aprovação

* ☐ Financeiro navegável.
* ☐ Equipe navegável.
* ☐ Regras visuais por role definidas.
* ☐ Tela de equipe sem acesso para supervisor.

### Dia 6 - Relatórios, exportação e comprovantes

**Objetivo:** Entregar a camada de relatórios e o módulo visual de comprovantes.

#### Checklist

* ☐ Criar módulo Relatórios no menu lateral.
* ☐ Criar consulta por módulo com filtros visuais.
* ☐ Criar botões de exportação em Excel e PDF.
* ☐ Disponibilizar relatórios para clientes, fornecedores, marcas, categorias, estoque, compras, vendas, contas a pagar, contas a receber e equipe.
* ☐ Inserir exportação também dentro dos módulos.
* ☐ Criar prévia do comprovante.
* ☐ Criar versão digital do comprovante.
* ☐ Criar versão térmica 58mm.
* ☐ Criar versão térmica 80mm.
* ☐ Criar botão de baixar em PDF e de imprimir.
* ☐ Criar layout digital com 420px.
* ☐ Adaptar o visual com base nas referências enviadas.

#### Critério de aprovação

* ☐ Relatórios navegáveis.
* ☐ Exportação visual presente.
* ☐ Comprovante com 3 formatos visuais.
* ☐ Prévia funcional e convincente.

### Dia 7 - Configurações, polimento e revisão final

**Objetivo:** Fechar o MVP com consistência visual e validação geral.

#### Checklist

* ☐ Criar tela de Configurações com nome da empresa, email, telefone, CPF/CNPJ, endereço completo, logo, cor primária, cor secundária e senha.
* ☐ Restringir acesso apenas ao admin.
* ☐ Revisar navegação entre telas.
* ☐ Revisar consistência visual, estados de botão, dropdowns, filtros, tabelas, formulários, espaçamentos e textos.
* ☐ Revisar responsividade básica principal.
* ☐ Revisar experiência da Visão Geral.
* ☐ Revisar experiência do comprovante.

#### Critério de aprovação

* ☐ Sistema inteiro navegável.
* ☐ Layout consistente.
* ☐ Restrições visuais por role funcionando.
* ☐ MVP pronto para apresentação.

## Entregável final esperado

* ☐ Identidade visual base pronta.
* ☐ Layout autenticado pronto.
* ☐ Menu lateral completo.
* ☐ Dashboard de Visão Geral funcional com dados mockados.
* ☐ Todos os módulos principais em versão visual.
* ☐ Relatórios e exportações visuais.
* ☐ Comprovante digital e térmico com prévia.
* ☐ Configurações da empresa.
* ☐ Separação visual de permissões por role.
* ☐ Estrutura sólida para começar a plugar backend.
