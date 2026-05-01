# UI Behavior Contract

## Scope

Contrato funcional para comportamento de interface nas telas:
- Visao geral (alertas/lembretes)
- Clientes
- Vendas
- Fornecedores
- Compras
- Contas a pagar

## Contract Rules

### 1. Alertas/Lembretes -> Tabela com filtro

- Trigger: clique em item de alerta/lembrete.
- Guarantee:
  - sistema resolve `itemType` em mapeamento fixo;
  - valida permissao de acesso ao destino;
  - aplica filtros predefinidos no destino.
- Failure handling:
  - sem permissao: bloqueia redirecionamento + mensagem clara;
  - filtro invalido/incompleto: aplica fallback seguro + mensagem informativa.

### 2. Classificacao de cliente PF/PJ

- Trigger: renderizacao de linha em tabela de clientes.
- Guarantee:
  - badge PF/PJ baseado em campo explicito de tipo de pessoa;
  - documento atua como validacao de consistencia, nao como fonte principal.

### 3. Componente global de localidade

- Trigger: uso de filtro/formulario em clientes e fornecedores.
- Guarantee:
  - mesma experiencia de estado/cidade nas duas telas;
  - dados de uma unica fonte canonica;
  - estado e cidade opcionais;
  - selecao de cidade requer estado selecionado antes.

### 4. Padrao financeiro de exibicao

- Trigger: renderizacao de status em vendas e metodos de pagamento em compras/contas a pagar.
- Guarantee:
  - status de vendas segue padrao visual ja adotado no financeiro;
  - metodos de pagamento exibidos com lista canonica unica em portugues.

### 5. Padrao unico de calendario

- Trigger: abertura de qualquer campo de data ativo.
- Guarantee:
  - uso de um unico padrao de componente de calendario em filtros, formularios, modais e dialogs.

## Acceptance Signals

- Todos os contratos acima devem ser verificaveis por teste funcional e revisao manual guiada.
