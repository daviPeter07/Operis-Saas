# Implementation Plan: Correcoes de Usabilidade em Tabelas

**Branch**: `[003-table-ui-components]` | **Date**: 2026-05-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fix-table-ui-bugs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Padronizar fluxos de usabilidade em visao geral, clientes, vendas, fornecedores, compras e contas a pagar, com foco em navegacao por alertas com filtros, classificacao clara de clientes PF/PJ, componente global de localidade (estado/cidade), uniformizacao de badges e metodos de pagamento, e substituicao total de seletores de data para um unico padrao de calendario. A implementacao seguira organizacao por feature e separacao de constantes, hooks e types nos arquivos tocados.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: PHP 8.5, TypeScript 5.x, React 19, Node 22  
**Primary Dependencies**: Laravel 13, Inertia v3, shadcn/ui, Tailwind CSS 4, Laravel Wayfinder  
**Storage**: Banco relacional existente da aplicacao (sem alteracao de schema nesta feature)  
**Testing**: Pest (PHP feature tests) e verificacoes frontend (typecheck/build)  
**Target Platform**: Aplicacao web Laravel + Inertia
**Project Type**: Aplicacao web full-stack monolitica (Laravel + React/Inertia)  
**Performance Goals**: Redirecionamento por alerta com feedback visual em ate 1 segundo na navegacao normal do usuario  
**Constraints**: Nao quebrar layout atual; manter permissoes existentes; aplicar padrao de organizacao por feature nos arquivos alterados  
**Scale/Scope**: Ajustes em 6 modulos principais + substituicao dos campos de data ativos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- O arquivo `.specify/memory/constitution.md` esta em formato placeholder e nao define principios executaveis.
- Gates aplicados por diretrizes ativas do projeto (AGENTS.md e Laravel Boost):
  - Testes obrigatorios para cada alteracao: PASS
  - Nao introduzir detalhes fora de escopo/sem aprovacao: PASS
  - Seguir padrao Laravel/Inertia/Wayfinder e reutilizacao de componentes: PASS
  - Manter compatibilidade com permissoes existentes: PASS

Resultado pre-Phase 0: PASS (sem violacoes bloqueantes).

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-table-ui-bugs/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── Http/
│   └── Controllers/
├── Models/
└── Actions/

resources/
└── js/
    ├── components/
    ├── features/
    ├── hooks/
    ├── constants/
    ├── types/
    └── pages/

routes/
tests/
├── Feature/
└── Unit/
```

**Structure Decision**: Usar a estrutura web existente Laravel + Inertia, com alteracoes concentradas em `resources/js/features/` por tela, extraindo artefatos reutilizaveis para `resources/js/components/`, `resources/js/constants/`, `resources/js/hooks/` e `resources/js/types/` conforme necessidade.

## Phase 0: Research

- Consolidado em [research.md](./research.md) com decisoes para: mapeamento de alertas, componente global estado/cidade, estrategia de badges, padronizacao de metodos de pagamento, substituicao de calendario e organizacao limpa por feature.

## Phase 1: Design & Contracts

- Modelo de dados e regras funcionais em [data-model.md](./data-model.md).
- Contratos de interface em [contracts/ui-behavior-contract.md](./contracts/ui-behavior-contract.md).
- Fluxo de validacao manual e tecnica em [quickstart.md](./quickstart.md).
- Contexto de agente atualizado em `AGENTS.md` para apontar para este plano.

## Post-Design Constitution Check

- Testabilidade: PASS (requisitos mapeados para cenarios verificaveis)
- Reuso/padronizacao: PASS (componente global + lista canonica + calendario unico)
- Seguranca de acesso: PASS (bloqueio de redirecionamento sem permissao)
- Escopo controlado: PASS (sem mudanca fiscal/financeira de regra de negocio)

Resultado pos-Phase 1: PASS.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
