# Implementation Plan: Backend Operis SaaS

**Branch**: `004-backend-operis-saas` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-backend-operis-saas/spec.md`

**Note**: This file follows the `/speckit.plan` structure and consolidates planning outputs for research, design and contracts.

## Summary

Implementar backend real para os modulos operacionais do Operis SaaS, substituindo dados mockados do frontend por persistencia e regras de negocio no Laravel 13. O foco desta fase inclui auth/onboarding de empresa, cadastros base, estoque/produtos, vendas/compras, contas a receber/pagar e importacao real com preview no mesmo fluxo.

## Technical Context

**Language/Version**: PHP 8.5, TypeScript 5.x  
**Primary Dependencies**: Laravel 13, Fortify, Sanctum, Inertia v3, Wayfinder  
**Storage**: Banco relacional da aplicacao com tabelas operacionais escopadas por `company_id`  
**Testing**: Pest v4 + PHPUnit runtime  
**Target Platform**: Aplicacao web Laravel (monolito)  
**Project Type**: Web application (backend + frontend Inertia existente)  
**Performance Goals**: p95 < 300ms para CRUD/listagens basicas dos modulos operacionais  
**Constraints**: Nao implementar itens fora do escopo; manter compatibilidade com frontend atual; preservar rastreabilidade de estoque/financeiro  
**Scale/Scope**: Uma empresa por usuario neste ciclo, preparada para multiempresa futura via `company_id`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- O arquivo `.specify/memory/constitution.md` esta em formato placeholder e nao define gates executaveis.
- Gates aplicados por diretrizes ativas do projeto:
- Testes obrigatorios para alteracoes: PASS
- Estrutura Laravel e convencoes do projeto: PASS
- Escopo restrito aos modulos aprovados: PASS
- Preparacao multiempresa com `company_id`: PASS
- Sem expansao de dependencia sem necessidade: PASS

## Project Structure

### Documentation (this feature)

```text
specs/004-backend-operis-saas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── clarifications.md
├── contracts/
│   └── backend-api-contract.md
├── checklists/
│   ├── requirements.md
│   └── pre-plan-readiness.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── Enums/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   └── Web/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
├── Repositories/
│   ├── Contracts/
│   └── Eloquent/
├── Services/
└── Traits/

database/
├── factories/
├── migrations/
└── seeders/

routes/
├── web.php
└── api.php

tests/
├── Feature/
└── Unit/
```

**Structure Decision**: manter estrutura Laravel existente e implementar camadas de dominio (Services/Repositories/Policies/Requests/Resources/Enums) para substituir mocks e conectar frontend atual aos endpoints reais.

## Phase 0: Research

Consolidado em [research.md](./research.md):

- Limite de reenvio do onboarding e regras de seguranca minima.
- Modelagem de pagamentos para vendas/compras e geracao de contas.
- Regras de edicao de operacoes concluidas com financeiro ja baixado.
- Estrategia de preview de importacao sem persistencia posterior.
- Enum set minimo para esta fase.

## Phase 1: Design & Contracts

Artefatos gerados:

- [data-model.md](./data-model.md)
- [contracts/backend-api-contract.md](./contracts/backend-api-contract.md)
- [quickstart.md](./quickstart.md)

Contexto atualizado:

- `AGENTS.md` apontando para este plano.

## Post-Design Constitution Check

- Escopo e fora de escopo respeitados: PASS
- Multiempresa futura preparada via `company_id`: PASS
- Regras de rastreabilidade de estoque/financeiro preservadas: PASS
- Compatibilidade com frontend atual: PASS
- Dependencias sem alteracao indevida: PASS

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

