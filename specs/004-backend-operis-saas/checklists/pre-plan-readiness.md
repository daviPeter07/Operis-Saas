# Pre-Plan Readiness Checklist: Backend Operis SaaS

**Purpose**: Validate the spec package before `/speckit.plan`  
**Created**: 2026-05-04  
**Feature**: [spec.md](../spec.md)

## Required Inputs

- [x] Source document reviewed (`docs/operis-backend-regras-estrutura.md`)
- [x] Scope and out-of-scope aligned with source
- [x] SDD created with architecture layers
- [x] Clarifications integrated into spec (`## Clarifications`)
- [x] Clarification log created ([clarifications.md](../clarifications.md))

## Data and Domain Readiness

- [x] Core entities and relationships described
- [x] Multi-company preparation (`company_id`) explicit
- [x] Stock movement rules explicit
- [x] Financial auto-generation rules explicit
- [ ] Return/refund flow fully specified
- [ ] Installment generation algorithm fully specified
- [ ] `company_users.role` minimal values fixed

## API and Validation Readiness

- [x] Endpoint capabilities listed per module
- [x] Validation baseline documented
- [x] Import flow with preview documented
- [x] Duplicate rules per import module documented

## Implementation Sequencing

- [x] Migration list documented
- [x] Recommended implementation order documented
- [x] Service and repository responsibilities documented

## Decision

- [ ] Ready for `/speckit.plan`

## Blocking Notes

- Close the 3 unchecked items before planning to avoid rework in:
  - schema design,
  - financial recalculation logic,
  - task decomposition.

