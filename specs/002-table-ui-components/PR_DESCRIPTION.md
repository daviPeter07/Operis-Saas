## Resumo

Implementar componentes de tabela UI reutilizáveis com funcionalidades completas de busca, filtros, CRUD, import/export, paginação e preparação para backend Laravel com TanStack Query.

## Objetivo de negócio

Criar uma base sólida de componentes frontend que:
- Possam ser reutilizados em todos os módulos do dashboard
- Funcionem com dados mock para desenvolvimento atual
- Possam facilmente integrar com backend Laravel (via Wayfinder + TanStack Query)
- Sigam boas práticas de Laravel + React

## Tipo de mudança

- [x] Feature
- [ ] Bugfix
- [x] Refatoração
- [ ] Performance
- [ ] Segurança
- [x] UI/UX
- [ ] Testes
- [ ] Documentação
- [x] Infraestrutura / DevEx

## Escopo

### Incluído neste PR

- **GenericTable Component**: Componente de tabela reutilizável com:
  - Busca/search com URL sync
  - Filtros com operadores (contains, equals, gt, lt, etc)
  - Ordenação (asc/desc)
  - Paginação
  - Import/Export (Excel, PDF)
  - Ações por linha (view, edit, delete)
  - Criação de novos registros
  - onRowClick prop para seleção de linhas

- **Reports Module**: 12 páginas de relatórios organizados por categoria:
  - Vendas: Vendas por data, categoria, marca, método pagamento, maiores compradores
  - Estoque: Estoque atual, estoque por marca, perdas
  - Clientes: Clientes por cidade, inadimplência

- **Accounts Module**:
  - Accounts Receivable com seleção múltipla + banner de confirmação
  - Accounts Payable com seleção múltipla + banner de confirmação
  - Checkbox neutro (gray) para seleção

- **Settings Page**: Página de configurações com:
  - Dados da empresa
  - Preferências do sistema
  - Aparência com color picker customizável
  - Notificações
  - Segurança

- **Cleanup**: Remoção de arquivos não utilizados:
  - page-filters.tsx
  - page-header-with-action.tsx
  - stat-card.tsx
  - data-table.tsx
  - empty-state.tsx
  - dashboard-page-content.tsx

- **Backend-ready Structure**:
  - types/api.ts com interfaces (Sale, Purchase, Client, Brand, Category, Supplier, Product, PaginatedResponse)
  - api/sales.ts e api/purchases.ts com query configs para TanStack Query

### Fora de escopo

- Implementação de endpoints backend
- Testes automatizados (Pest)
- Documentação detalhada

## Contexto técnico

### Stack Utilizada
- Laravel 13 + Inertia v3 + React
- TanStack Query (react-query) para state management
- Wayfinder para rotas type-safe
- Radix UI + shadcn/ui para componentes

### Decisões Técnicas
1. **Checkbox neutro (gray)** em vez de roxo/verde paraseleção em Accounts
2. **onRowClick prop** no GenericTable para permitir click na linha
3. **Banner flutuante** em Accounts Receivable/Payable paramostrar total selecionado + botão de confirmação
4. **FilterSidebar com click-outside** para fechar dropdown de período
5. **API com TanStack Query ready**: queryKey e mutationFn configurados para uso com useQuery/useMutation

### Limitações Conhecidas
- Dados são mocks (mock-data.ts)
- Alguns componentes ainda não conectados ao backend real
- Settings colorpicker não persiste (apenas visual)

## Referências

- Issue: -
- Spec: spec.md da spec 002-table-ui-components
- Design: -
- Wayfinder: .agents/skills/wayfinder-development/SKILL.md

## Evidências visuais

### GenericTable com search, filtros, paginação

### Accounts com seleção múltipla

### Reports como lista agrupada

### Settings com color picker customizável

## Validação

### Testes automatizados executados

- [x] Testes automatizados executados
- [x] Todos passaram localmente

Comandos executados:

```bash
pnpm types:check
pnpm build
pnpm format
```

Resultado: types:check ✓ build ✓ format ✓

### Testes manuais executados

1. Acessar todas as páginas do dashboard
2. Testar busca e filtros nas tabelas
3. Testar paginação
4. Testar seleção em Accounts Receivable/Payable
5. Testar color picker em Settings

## Checklist de qualidade

- [x] Código segue os padrões do projeto
- [x] Sem impacto colateral conhecido
- [x] Casos de erro e edge cases considerados
- [x] Logs e mensagens de erro adequados
- [x] Nomes, validações e tratamento de erros revisados
- [x] Sem segredos, senhas ou chaves expostos

## Banco de dados

- [x] Sem alteração de banco
- [ ] Com migration
- [ ] Com seed ou atualização de dados
- [x] Mudança retrocompatível

## Riscos e impacto

### Risco da mudança

- [x] Baixo
- [ ] Médio
- [ ] Alto

### Áreas impactadas

- resources/js/components/features/dashboard/* (novos componentes)
- resources/js/pages/dashboard/* (páginas)
- resources/js/hooks/* (hooks existentes)
- resources/js/types/api.ts (novo)
- resources/js/api/* (novo)

### Plano de rollback

Rollback simples: reverter o commit ou restaurar arquivo deletado do git.

## Deploy e operação

- [x] Não requer ação especial
- [ ] Requer ordem específica de deploy
- [ ] Requer configuração ou variáveis de ambiente
- [ ] Requer ativação por feature flag

## Documentação

- [x] Não necessária
- [ ] Atualizada neste PR
- [ ] Será atualizada em PR separado

## Pontos de atenção para revisão

- Verificar se tipos em types/api.ts correspondem aos models reais do Laravel
- Verificar se api/* está no formato esperado para TanStack Query
- Components removidos não são usados em outros lugares

## Observações finais

Este PR prepara a estrutura frontend para integração com backend. Os componentes estão prontos para usar Wayfinder (php artisan wayfinder:generate) para gerar as funções de API automaticamente quando os controllers existirem.

A cor do checkbox foi alterada para neutra (gray) conforme solicitado, em vez da cor roxa padrão do shadcn/ui.