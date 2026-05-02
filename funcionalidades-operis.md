# Funcionalidades do Operis SaaS

## Visao Geral

O Operis SaaS e um sistema web Laravel + Inertia + React voltado para gestao comercial, estoque, vendas, compras, financeiro, equipe, relatorios e configuracoes de empresa.

No estado atual, a aplicacao esta estruturada como um MVP visual: a autenticacao usa Laravel Fortify, enquanto os modulos operacionais usam dados mockados e estado local no frontend.

## Estado Atual da Implementacao

- Autenticacao real via Laravel Fortify.
- Dashboard e modulos operacionais navegaveis.
- Dados operacionais mockados no frontend.
- Fluxos de criacao, edicao, visualizacao e exclusao majoritariamente visuais.
- Exportacao e importacao funcionando no frontend.
- Backend dos modulos de negocio ainda pendente.

## Base do Sistema

- Landing page placeholder.
- Area autenticada em `/dashboard`.
- Layout principal com sidebar, header e breadcrumbs.
- Navegacao entre modulos do dashboard.
- Tema visual base preto e laranja.
- Componentes UI baseados em shadcn/ui.
- Estrutura preparada para Laravel Wayfinder.
- TanStack Query configurado para futura integracao com APIs.

## Multiempresa

- Lista mockada de empresas.
- Empresa atual selecionavel no workspace.
- Troca visual de empresa.
- Branding por empresa:
    - Nome.
    - Iniciais.
    - Descricao.
    - Cor primaria.
    - Cor secundaria.
- Navegacao adaptada por role da empresa selecionada.

## Roles e Permissoes Visuais

- Admin.
- Supervisor.
- User.
- Admin com acesso visual completo.
- Supervisor sem acesso visual a configuracoes.
- User sem acesso visual a configuracoes.
- Equipe com modos diferentes por role:
    - Admin gerencia.
    - Supervisor solicita ao admin.
    - User apenas visualiza.

## Autenticacao

- Login.
- Logout.
- Cadastro.
- Recuperacao de senha.
- Reset de senha.
- Verificacao de email.
- Confirmacao de senha.
- Autenticacao de dois fatores.
- Desafio de 2FA.
- Confirmacao de 2FA.
- QR code de 2FA.
- Chave secreta de 2FA.
- Codigos de recuperacao.
- Regeneracao de codigos de recuperacao.
- Rate limit para login.
- Rate limit para 2FA.
- Bypass de autenticacao em ambiente local/desenvolvimento quando existe usuario demo.

## Dashboard / Visao Geral

- Cards de indicadores.
- Indicador de vendas.
- Indicador de lucro.
- Indicador de contas a receber.
- Indicador de contas a pagar.
- Alternancia entre modo KPI e modo grafico.
- Filtros de periodo:
    - Ultimos 7 dias.
    - Ultimos 30 dias.
    - Ultimos 90 dias.
    - Ultimos 12 meses.
    - Todos os periodos.
    - Intervalo customizado.
- Grafico de vendas por periodo.
- Grafico de lucro por periodo.
- Atividades recentes.
- Alertas mockados:
    - Pagamentos atrasados.
    - Pedidos nao entregues.
    - Pedidos a confirmar.
    - Produtos sem estoque.
- Planejamento de alertas clicaveis com redirecionamento para tabelas e filtros aplicados.

## Acoes Rapidas

- Criar cliente.
- Criar venda.
- Criar compra.
- Criar despesa.
- Criar marca.

No estado atual, essas acoes sao principalmente pontos de entrada visuais.

## Tabelas e CRUD Visual

O sistema possui uma base reutilizavel de tabela para modulos operacionais.

Funcionalidades disponiveis:

- Busca.
- Filtros em sidebar.
- Operadores de filtro.
- Ordenacao crescente e decrescente.
- Paginacao.
- Sincronizacao de estado com a URL.
- Criacao de registros.
- Visualizacao de detalhes.
- Edicao.
- Exclusao com confirmacao.
- Importacao de Excel/CSV.
- Preview de dados importados.
- Exportacao para Excel.
- Exportacao para PDF.
- Estado vazio.
- Layout responsivo em mobile.
- Acoes por linha.

## Clientes

- Listagem de clientes.
- Cadastro visual.
- Visualizacao de detalhes.
- Edicao.
- Exclusao.
- Busca.
- Filtros.
- Campos mockados:
    - Nome.
    - Email.
    - Telefone.
    - Documento.
    - Cidade.
    - Estado.
    - Endereco.
    - Data de cadastro.
- Identificacao PF/PJ em andamento.
- Padronizacao de localidade estado/cidade em andamento.

## Fornecedores

- Listagem de fornecedores.
- Cadastro visual.
- Visualizacao de detalhes.
- Edicao.
- Exclusao.
- Busca.
- Filtros.
- Tipo de pessoa PF/PJ.
- Campos mockados:
    - Nome.
    - Email.
    - Telefone.
    - Documento.
    - Cidade.
    - Estado.
    - Endereco.
    - Data de cadastro.
- Campos de endereco separados em andamento:
    - Rua.
    - Bairro.
    - Numero.
    - CEP.
- Endereco de fornecedor planejado como opcional.

## Marcas

- Listagem de marcas.
- Cadastro visual.
- Visualizacao.
- Edicao.
- Exclusao.
- Campos:
    - Nome.
    - Descricao.
    - Data de cadastro.

## Categorias

- Listagem de categorias.
- Cadastro visual.
- Visualizacao.
- Edicao.
- Exclusao.
- Campos:
    - Nome.
    - Descricao.
    - Categoria pai.
    - Data de cadastro.

## Estoque / Produtos

- Listagem de produtos.
- Cadastro visual de produto.
- Visualizacao.
- Edicao.
- Exclusao.
- Busca e filtros pela tabela.
- Campos mockados:
    - Nome.
    - SKU.
    - Codigo de barras.
    - Descricao.
    - Preco de venda.
    - Custo.
    - Estoque atual.
    - Estoque minimo.
    - Categoria.
    - Marca.
    - Data de cadastro.
- Controle visual de estoque baixo.

## Vendas

- Listagem de vendas.
- Cadastro visual de venda.
- Dialogo de venda com fluxo mais completo.
- Selecao de cliente.
- Catalogo de produtos.
- Itens da venda.
- Quantidade de itens.
- Subtotal.
- Total.
- Forma de pagamento.
- Status da venda.
- Criacao rapida de cliente.
- Criacao rapida de produto.
- Campos de pagamento com cartao:
    - Tipo do cartao.
    - Parcelas.
    - Data da primeira parcela.
    - Valor por parcela.
- Status:
    - Pendente.
    - Concluida.
    - Cancelada.
- Formas de pagamento:
    - Dinheiro.
    - PIX.
    - Cartao.
    - Outros.
- API mockada pronta para futura troca por controller Laravel.

## Compras

- Listagem de compras.
- Cadastro visual de compra.
- Dialogo de compra.
- Selecao de fornecedor.
- Criacao rapida de fornecedor.
- Selecao de produtos.
- Itens da compra.
- Total.
- Data de vencimento.
- Forma de pagamento.
- Status da compra.
- Status:
    - Pendente.
    - Concluida.
    - Cancelada.
- Formas de pagamento:
    - Dinheiro.
    - Credito.
    - Debito.
    - PIX.
- API mockada pronta para futura troca por controller Laravel.

## Contas a Pagar

- Listagem baseada em dados mockados de compras.
- Cadastro visual de despesa/lancamento.
- Visualizacao.
- Edicao.
- Exclusao.
- Busca.
- Filtros.
- Selecao multipla.
- Banner de confirmacao para itens selecionados.
- Campos principais:
    - Fornecedor.
    - Total.
    - Status.
    - Forma de pagamento.
    - Itens.
    - Vencimento.
    - Data de criacao.
- Padronizacao de metodos de pagamento em portugues em andamento.

## Contas a Receber

- Listagem baseada em dados mockados de vendas.
- Visualizacao.
- Edicao.
- Exclusao.
- Busca.
- Filtros.
- Selecao multipla.
- Banner de confirmacao para itens selecionados.
- Campos principais:
    - Cliente.
    - Total.
    - Status.
    - Forma de pagamento.
    - Itens.
    - Data de criacao.

## Equipe

- Listagem visual de membros.
- Cards de resumo:
    - Membros totais.
    - Membros ativos.
    - Perfis de lideranca.
    - Membros inativos.
- Avatar automatico por nome.
- Roles:
    - Admin.
    - Supervisor.
    - User.
- Status:
    - Ativo.
    - Inativo.
- Admin pode adicionar membro visualmente.
- Admin pode gerenciar membro visualmente.
- Supervisor pode solicitar gestao ao admin.
- User apenas visualiza.
- Convite por email mockado.
- Geracao de link de convite.
- Copia do link de convite.
- Envio visual de email.

## Relatorios

O sistema possui area de relatorios com paginas dedicadas e dados mockados.

Relatorios disponiveis:

- Vendas.
- Produtos mais vendidos.
- Vendas por categoria.
- Vendas por marca.
- Estoque atual.
- Estoque por marca.
- Proximos de vencer.
- Perdas.
- Inadimplencia.
- Pagamentos por metodo.
- Maiores compradores.
- Clientes por cidade.

Funcionalidades:

- Visualizacao em tabela.
- Busca e filtros conforme componente de tabela.
- Exportacao para Excel.
- Exportacao para PDF.

## Configuracoes

- Tela restrita visualmente ao admin.
- Dados da empresa:
    - Nome.
    - Email.
    - Telefone.
    - Endereco.
    - CNPJ.
- Preferencias do sistema:
    - Formato de data.
    - Formato de hora.
    - Moeda.
    - Fuso horario.
- Aparencia:
    - Tema.
    - Cor primaria.
- Notificacoes:
    - Email.
    - Navegador.
- Seguranca:
    - Exigir senha forte.
    - 2FA visual.
- Usuarios e permissoes:
    - Resumo de usuarios.
    - Botao para gerenciar.
- Salvamento visual com toast, sem persistencia real.

## Comprovantes e Impressao

O dominio de comprovantes esta previsto no escopo do MVP, mas ainda nao aparece como backend real.

Funcionalidades previstas:

- Previa de comprovante de venda.
- Comprovante digital.
- Comprovante termico 58mm.
- Comprovante termico 80mm.
- Download em PDF.
- Impressao pelo navegador.

Implementacao possivel no frontend sem backend:

- Renderizar o comprovante em HTML.
- Criar area isolada de impressao.
- Usar `window.print()`.
- Aplicar CSS `@media print` para imprimir apenas o comprovante.

Funcionalidades que dependem de backend futuro:

- Historico real de impressoes.
- Reimpressao de vendas antigas persistidas.
- Status de impressao.
- Integracao direta com impressora termica.
- Controle fiscal ou numeracao persistente.

## Importacao e Exportacao

- Importacao de arquivos `.xlsx`, `.xls` e `.csv`.
- Preview dos dados antes de importar.
- Tratamento de arquivo invalido.
- Exportacao para Excel.
- Exportacao para PDF.
- Exportacao disponivel em tabelas e relatorios.

## APIs e Preparacao para Backend

- Estrutura inicial em `resources/js/api`.
- Query config mockada para vendas.
- Query config mockada para compras.
- Tipos TypeScript preparados para respostas paginadas.
- Comentarios indicando futura substituicao por controllers Laravel e Wayfinder.

## Fora do Escopo Atual

- Backend real dos modulos operacionais.
- Persistencia real de clientes, fornecedores, produtos, vendas, compras e financeiro.
- Modelos e migrations para todas as entidades de negocio.
- Regras fiscais.
- Controle real de estoque.
- Baixa financeira real.
- Historico real de comprovantes.
- Integracao direta com impressoras.
- Permissoes backend completas por role nos modulos operacionais.

## Resumo Final

O Operis SaaS ja possui uma base visual ampla e navegavel para apresentacao do MVP, cobrindo autenticacao, workspace multiempresa, dashboard, tabelas operacionais, cadastros, estoque, vendas, compras, financeiro, equipe, relatorios e configuracoes.

A autenticacao esta implementada de forma real com Laravel Fortify. Os demais modulos funcionam como experiencia frontend com dados mockados, prontos para serem conectados a controllers, models, migrations e servicos de backend em etapas futuras.
