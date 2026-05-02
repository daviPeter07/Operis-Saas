# Data Model - Correcoes de Usabilidade em Tabelas

## AlertReminderNavigation

- Purpose: Define navegacao clicavel de alertas/lembretes para tabelas com filtros.
- Fields:
  - `itemType` (string, required): tipo canonico do alerta/lembrete.
  - `targetModule` (string, required): modulo/tabela de destino.
  - `predefinedFilters` (object, required): filtros iniciais aplicados no destino.
  - `requiresPermission` (string, required): permissao necessaria para navegar.
- Validation Rules:
  - `itemType` deve existir no mapeamento fixo.
  - `targetModule` deve ser acessivel pela configuracao de rotas/telas validas.
  - Sem permissao, navegacao bloqueada com feedback de acesso negado.

## TableFilter

- Purpose: Representar filtros aplicados automaticamente via redirecionamento.
- Fields:
  - `state` (string, optional)
  - `city` (string, optional; depende de `state` quando selecionada)
  - `status` (string, optional)
  - `paymentMethod` (string, optional)
- Validation Rules:
  - Cidade so pode ser definida quando estado estiver selecionado.
  - Filtro invalido ativa fallback seguro (sem quebrar fluxo).

## CustomerClassification

- Purpose: Exibir tipo de cliente PF/PJ de forma clara e consistente.
- Fields:
  - `personType` (enum: PF|PJ, required)
  - `document` (string, optional para validacao de consistencia)
  - `badgeLabel` (string, required)
- Validation Rules:
  - `personType` e fonte principal de classificacao.
  - Documento apenas valida coerencia, sem sobrescrever classificacao principal.

## SupplierAddress

- Purpose: Endereco desacoplado de fornecedor em campos menores.
- Fields:
  - `street` (string, optional)
  - `neighborhood` (string, optional)
  - `number` (string, optional)
  - `zipCode` (string, optional)
- Validation Rules:
  - Todos os campos opcionais por decisao de negocio.

## PaymentMethodDisplay

- Purpose: Padronizar nomenclatura de metodos de pagamento em portugues.
- Fields:
  - `canonicalKey` (string, required)
  - `ptLabel` (string, required)
  - `appliesTo` (set: compras|contas-a-pagar, required)
- Validation Rules:
  - Rotulos devem vir de lista canonica unica.
  - Mesmo `canonicalKey` deve mapear para mesmo `ptLabel` em todos os modulos aplicaveis.

## DateInputStandard

- Purpose: Garantir padrao unico de calendario em pontos ativos do sistema.
- Fields:
  - `context` (enum: filtro|formulario|modal|dialog, required)
  - `componentFamily` (string, required)
- Validation Rules:
  - Todo ponto ativo de data deve usar a mesma familia de componente.

## Relationships

- `AlertReminderNavigation` 1..* -> `TableFilter`
- `CustomerClassification` 1..1 -> `Customer`
- `SupplierAddress` 1..1 -> `Supplier`
- `PaymentMethodDisplay` 1..* -> (`Purchases`, `AccountsPayable`)
- `DateInputStandard` aplica-se transversalmente aos modulos afetados.

## State Transitions

- AlertNavigation:
  - `Idle` -> `Mapped` -> `PermissionChecked` -> `Redirected`
  - `PermissionChecked` -> `BlockedAccess` (sem permissao)
  - `Mapped` -> `FallbackApplied` (filtro invalido/incompleto)
