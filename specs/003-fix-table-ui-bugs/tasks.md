# Tasks: Correcoes de Usabilidade em Tabelas

**Input**: Design documents from `/specs/003-fix-table-ui-bugs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-behavior-contract.md, quickstart.md

**Tests**: Incluidos, pois o projeto exige validacao programatica para toda alteracao.

**Organization**: Tasks agrupadas por user story para entrega independente e testavel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencia de tarefa incompleta)
- **[Story]**: Mapeia para a user story (`US1`, `US2`, `US3`, `US4`)
- Cada tarefa inclui caminho exato de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura de organizacao limpa e base de testes/lint para a feature.

- [ ] T001 Criar estrutura base da feature em `resources/js/features/table-ui-bugs/README.md`
- [X] T002 [P] Criar constantes canonicas de pagamento em `resources/js/constants/payment-methods.ts`
- [X] T003 [P] Criar tipos compartilhados da feature em `resources/js/types/table-ui-bugs.ts`
- [X] T004 [P] Criar hook compartilhado para mapeamento de redirecionamento em `resources/js/hooks/useAlertNavigationMap.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura obrigatoria para todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story inicia antes deste bloco.

- [X] T005 Criar componente global de localidade em `resources/js/components/filters/state-city-select.tsx`
- [X] T006 [P] Criar constantes da fonte canonica de localidade em `resources/js/constants/location-source.ts`
- [ ] T007 [P] Criar tipos do componente de localidade em `resources/js/types/location.ts`
- [X] T008 Definir adaptador unico de calendario em `resources/js/components/date/date-picker.tsx`
- [ ] T009 [P] Criar helper de fallback/normalizacao de filtros em `resources/js/features/table-ui-bugs/utils/filter-fallback.ts`
- [ ] T010 Criar teste de componente de localidade (estado/cidade) em `tests/Feature/Frontend/StateCitySelectTest.php`

**Checkpoint**: Base compartilhada pronta para implementar historias em paralelo.

---

## Phase 3: User Story 1 - Navegacao por Alertas com Filtro (Priority: P1) 🎯 MVP

**Goal**: Tornar alertas/lembretes clicaveis com redirecionamento para tabela correta, filtro aplicado e controle de permissao.

**Independent Test**: Clicar em alertas/lembretes na visao geral e validar destino/filtros; sem permissao, validar bloqueio com mensagem.

### Tests for User Story 1

- [ ] T011 [P] [US1] Criar teste de fluxo de redirecionamento por alerta em `tests/Feature/Dashboard/AlertReminderNavigationTest.php`
- [ ] T012 [P] [US1] Criar teste de bloqueio por permissao no redirecionamento em `tests/Feature/Dashboard/AlertReminderPermissionTest.php`

### Implementation for User Story 1

- [X] T013 [P] [US1] Implementar mapa fixo de item->destino/filtros em `resources/js/features/dashboard/constants/alert-reminder-map.ts`
- [X] T014 [US1] Integrar clique dos itens de alerta/lembrete em `resources/js/features/dashboard/components/alerts-reminders-tab.tsx`
- [ ] T015 [US1] Aplicar fallback seguro de filtros no redirecionamento em `resources/js/features/dashboard/utils/apply-alert-filters.ts`
- [ ] T016 [US1] Implementar tratamento de acesso negado no fluxo em `resources/js/features/dashboard/components/alerts-reminders-tab.tsx`
- [ ] T017 [US1] Ajustar leitura de filtros na tabela de destino em `resources/js/features/shared/table-filters/use-table-filters.ts`

**Checkpoint**: US1 funcional e validavel isoladamente.

---

## Phase 4: User Story 2 - Identificacao e Busca Padronizada de Pessoas e Enderecos (Priority: P1)

**Goal**: Diferenciar PF/PJ em clientes e padronizar localidade/endereco em clientes e fornecedores.

**Independent Test**: Validar badge PF/PJ em clientes; validar componente estado/cidade nas duas telas; validar endereco desacoplado e opcional em fornecedores.

### Tests for User Story 2

- [ ] T018 [P] [US2] Criar teste de exibicao de badge PF/PJ em clientes em `tests/Feature/Customers/CustomerPersonTypeBadgeTest.php`
- [ ] T019 [P] [US2] Criar teste de regra estado->cidade no componente global em `tests/Feature/Frontend/LocationDependencyRuleTest.php`
- [ ] T020 [P] [US2] Criar teste de campos opcionais de endereco de fornecedor em `tests/Feature/Suppliers/SupplierAddressOptionalFieldsTest.php`

### Implementation for User Story 2

- [X] T021 [P] [US2] Criar badge de tipo de pessoa em `resources/js/features/customers/components/person-type-badge.tsx`
- [X] T022 [US2] Integrar badge na tabela de clientes em `resources/js/features/customers/components/customers-table.tsx`
- [ ] T023 [P] [US2] Substituir filtro/form localidade em clientes por componente global em `resources/js/features/customers/components/customer-location-fields.tsx`
- [ ] T024 [P] [US2] Substituir filtro/form localidade em fornecedores por componente global em `resources/js/features/suppliers/components/supplier-location-fields.tsx`
- [X] T025 [US2] Desacoplar endereco de fornecedores (rua/bairro/numero/cep) em `resources/js/features/suppliers/components/supplier-address-fields.tsx`
- [ ] T026 [US2] Ajustar types de cliente/fornecedor para novas props em `resources/js/types/customers-suppliers.ts`

**Checkpoint**: US2 funcional e testavel sem dependencia de US3/US4.

---

## Phase 5: User Story 3 - Consistencia Visual e Terminologia Financeira (Priority: P2)

**Goal**: Padronizar badges de status em vendas e metodos de pagamento em portugues em compras/contas a pagar, com dialogo de compras alinhado a vendas.

**Independent Test**: Validar badges em vendas, dialogo de compras com mesma estrutura base de vendas, e rotulos canonicos de pagamento em portugues.

### Tests for User Story 3

- [ ] T027 [P] [US3] Criar teste de padrao de badge de status em vendas em `tests/Feature/Sales/SalesStatusBadgeParityTest.php`
- [ ] T028 [P] [US3] Criar teste de rotulos canonicos de pagamento em compras em `tests/Feature/Purchases/PurchasePaymentMethodLabelTest.php`
- [ ] T029 [P] [US3] Criar teste de rotulos canonicos de pagamento em contas a pagar em `tests/Feature/AccountsPayable/AccountsPayablePaymentMethodLabelTest.php`

### Implementation for User Story 3

- [X] T030 [P] [US3] Reutilizar componente de badge financeiro em vendas em `resources/js/features/sales/components/sales-status-badge.tsx`
- [X] T031 [US3] Aplicar badge de status na tabela de vendas em `resources/js/features/sales/components/sales-table.tsx`
- [X] T032 [P] [US3] Aplicar rotulos canonicos de pagamento em compras em `resources/js/features/purchases/utils/payment-method-label.ts`
- [X] T033 [P] [US3] Aplicar rotulos canonicos de pagamento em contas a pagar em `resources/js/features/accounts-payable/utils/payment-method-label.ts`
- [ ] T034 [US3] Ajustar estrutura base do dialogo de compras para espelhar vendas em `resources/js/features/purchases/components/create-purchase-dialog.tsx`

**Checkpoint**: US3 agrega consistencia financeira sem quebrar US1/US2.

---

## Phase 6: User Story 4 - Padronizacao de Selecao de Datas (Priority: P2)

**Goal**: Substituir todos os seletores de data ativos por padrao unico de calendario.

**Independent Test**: Percorrer filtros/formularios/modais/dialogs ativos e confirmar uso do mesmo componente de data.

### Tests for User Story 4

- [ ] T035 [P] [US4] Criar teste de conformidade de calendario em filtros ativos em `tests/Feature/Frontend/DatePickerFilterStandardTest.php`
- [ ] T036 [P] [US4] Criar teste de conformidade de calendario em formularios/modais/dialogs em `tests/Feature/Frontend/DatePickerFormStandardTest.php`

### Implementation for User Story 4

- [ ] T037 [P] [US4] Substituir calendario em filtros de clientes em `resources/js/features/customers/components/customer-filters.tsx`
- [ ] T038 [P] [US4] Substituir calendario em filtros de fornecedores em `resources/js/features/suppliers/components/supplier-filters.tsx`
- [ ] T039 [P] [US4] Substituir calendario em formularios/dialogs de vendas em `resources/js/features/sales/components/create-sale-dialog.tsx`
- [ ] T040 [P] [US4] Substituir calendario em formularios/dialogs de compras em `resources/js/features/purchases/components/create-purchase-dialog.tsx`
- [ ] T041 [US4] Substituir calendario em contas a pagar em `resources/js/features/accounts-payable/components/accounts-payable-filters.tsx`

**Checkpoint**: US4 concluida com padrao unico de data em todos os pontos ativos mapeados.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento tecnico, qualidade e verificacao final da feature completa.

- [ ] T042 [P] Atualizar documentacao de componentes reutilizados em `resources/js/components/README.md`
- [ ] T043 Revisar organizacao clean code nos arquivos alterados em `resources/js/features/table-ui-bugs/README.md`
- [ ] T044 Executar formatacao de PHP alterado com `vendor/bin/pint --dirty --format agent`
- [ ] T045 Executar testes afetados com `php artisan test --compact`
- [X] T046 Executar validacao frontend com `npm run build`
- [ ] T047 Executar checklist funcional final em `specs/003-fix-table-ui-bugs/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: inicia imediatamente.
- **Phase 2 (Foundational)**: depende de Phase 1 e bloqueia todas as historias.
- **Phase 3-6 (User Stories)**: dependem da Phase 2; podem rodar em paralelo por equipe, priorizando P1.
- **Phase 7 (Polish)**: depende da conclusao das historias planejadas.

### User Story Dependencies

- **US1 (P1)**: depende apenas da Foundation.
- **US2 (P1)**: depende apenas da Foundation.
- **US3 (P2)**: depende da Foundation; pode reutilizar componentes da US2 sem bloquear a entrega independente.
- **US4 (P2)**: depende da Foundation; pode ser executada em paralelo a US3.

### Within Each User Story

- Testes da historia antes dos ajustes finais e validacao.
- Constantes/types/componentes base antes da integracao na tela.
- Integracao da UI antes da validacao final da historia.

### Parallel Opportunities

- Setup: T002, T003, T004 em paralelo.
- Foundation: T006, T007, T009 em paralelo apos T005/T008.
- US1: T011 e T012 em paralelo; T013 e T017 em paralelo.
- US2: T018-T020 em paralelo; T021/T023/T024 em paralelo.
- US3: T027-T029 em paralelo; T030/T032/T033 em paralelo.
- US4: T035-T036 em paralelo; T037-T040 em paralelo.

---

## Parallel Example: User Story 2

```bash
# Testes em paralelo
Task: "T018 tests/Feature/Customers/CustomerPersonTypeBadgeTest.php"
Task: "T019 tests/Feature/Frontend/LocationDependencyRuleTest.php"
Task: "T020 tests/Feature/Suppliers/SupplierAddressOptionalFieldsTest.php"

# Implementacoes em paralelo
Task: "T021 resources/js/features/customers/components/person-type-badge.tsx"
Task: "T023 resources/js/features/customers/components/customer-location-fields.tsx"
Task: "T024 resources/js/features/suppliers/components/supplier-location-fields.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 e Phase 2.
2. Entregar Phase 3 (US1) completa.
3. Validar redirecionamento, fallback e permissao.
4. Demonstrar MVP.

### Incremental Delivery

1. Foundation pronta.
2. US1 (P1) -> validar -> integrar.
3. US2 (P1) -> validar -> integrar.
4. US3 (P2) -> validar -> integrar.
5. US4 (P2) -> validar -> integrar.
6. Polish final.

### Parallel Team Strategy

1. Time completo em Setup + Foundation.
2. Depois dividir:
   - Dev A: US1
   - Dev B: US2
   - Dev C: US3
   - Dev D: US4

---

## Notes

- Todas as tarefas seguem formato checklist com ID sequencial e caminho de arquivo.
- Tarefas com `[P]` evitam conflito de arquivo e dependencia direta.
- Cada user story permanece testavel de forma independente.
