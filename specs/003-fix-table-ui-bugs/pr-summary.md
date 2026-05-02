# Resumo do PR

## Visao Geral

Este PR consolida a base visual e operacional das tabelas do Operis SaaS, com foco em usabilidade, consistencia entre modulos e preparacao para integracao futura com backend Laravel.

O escopo atual permanece majoritariamente frontend, usando dados mockados e estado local para demonstrar fluxos reais de uso nos modulos do dashboard.

## Principais Entregas

- Componente reutilizavel de tabela para os modulos operacionais.
- Busca, filtros, ordenacao e paginacao.
- Sincronizacao de estado da tabela com a URL.
- Acoes por linha: visualizar, editar e excluir.
- Criacao visual de novos registros.
- Importacao de arquivos Excel/CSV.
- Exportacao de dados para Excel e PDF.
- Estados vazios e comportamento responsivo em mobile.
- Estrutura pronta para futura integracao com TanStack Query, Wayfinder e controllers Laravel.

## Modulos Impactados

- Clientes.
- Fornecedores.
- Marcas.
- Categorias.
- Estoque.
- Vendas.
- Compras.
- Contas a pagar.
- Contas a receber.
- Relatorios.
- Configuracoes.

## Ajustes de Usabilidade da Spec Atual

### Alertas e Lembretes

- Planejamento de redirecionamento a partir da visao geral.
- Cada alerta/lembrete deve apontar para uma tabela de destino.
- Os filtros devem ser aplicados automaticamente conforme o contexto.
- Caso o usuario nao tenha permissao, o redirecionamento deve ser bloqueado com mensagem clara.

### Clientes e Fornecedores

- Diferenciacao visual entre pessoa fisica e pessoa juridica.
- Uso de tipo de pessoa como fonte principal de classificacao.
- Padronizacao do componente de estado/cidade.
- Cidade exige estado previamente selecionado.
- Campos de endereco de fornecedor separados e opcionais: rua, bairro, numero e CEP.

### Financeiro

- Padronizacao de badges de status em vendas.
- Metodos de pagamento exibidos em portugues.
- Lista canonica compartilhada para pagamentos em compras e contas a pagar.
- Dialogo de compras deve seguir a mesma estrutura visual base do dialogo de vendas.

### Datas

- Padronizacao de todos os seletores de data ativos.
- Um unico componente de calendario deve ser usado em filtros, formularios, modais e dialogs.

## Funcionalidades Ja Disponiveis no MVP Visual

- Navegacao entre modulos do dashboard.
- Tabelas operacionais com dados mockados.
- Fluxos visuais de CRUD.
- Importacao e exportacao de dados.
- Relatorios com paginas proprias e mocks.
- Configuracoes visuais da empresa.
- Contas a pagar e receber baseadas em mocks de compras e vendas.
- Dialogos de venda, compra e lancamentos financeiros em modo visual.

## Fora de Escopo Neste PR

- Backend real dos modulos operacionais.
- Persistencia real de clientes, vendas, compras, estoque e financeiro.
- Historico real de impressoes ou comprovantes.
- Regras fiscais, tributarias ou financeiras definitivas.
- Integracao direta com impressoras termicas.
- Enforcement backend completo de permissoes por role.

## Estado Atual

O PR entrega uma base frontend consistente para o MVP, com comportamento visual navegavel e pronto para validacao de produto.

A autenticacao ja existe via Laravel Fortify, mas os modulos operacionais ainda dependem de mocks e devem ser conectados ao backend em uma etapa futura.

