## Resumo

Implementação completa da spec 005 - Frontend-Backend Bridge: criação da camada de serviços tipada com Zod, conexão dos módulos do dashboard aos endpoints reais, novo layout de autenticação Operis (preto/laranja), e correção do redirecionamento automático após login/registro.

## Objetivo de negócio

Estabelecer uma ponte tipada e robusta entre o frontend React/Inertia e o backend Laravel utilizando:
- Wayfinder para rotas tipadas
- Zod para validação de esquemas
- Services organizados por domínio
- React Query para cache e gerenciamento de estado
- HttpOnly cookies para autenticação

Além disso, corrigir problemas de UX na autenticação (redirect automático) e implementar identidade visual Operis.

## Tipo de mudança

- [X] Feature
- [X] Bugfix
- [X] Refatoração
- [ ] Performance
- [X] Segurança
- [X] UI/UX
- [X] Testes
- [ ] Documentação
- [ ] Infraestrutura / DevEx

## Escopo

### Incluído neste PR

**Fase 1 & 2 - Fundamentos**
- Configuração de tasks.md com toda a documentação da spec
- Criação do `apiClient.ts` com suporte a HttpOnly cookies
- Criação do `base.zod.ts` com helpers para validação

**Fase 3 - Camada de Serviços**
- Criação de `apiService.ts` base para operações CRUD
- Criação de `importService.ts` para importação genérica de arquivos
- Criação de schemas Zod para: user, customer, supplier, brand, category, product, sale, purchase, accountReceivable, accountPayable
- Criação de services: customers, suppliers, brands, categories, products, sales, purchases, accountReceivable, accountPayable
- Criação do hook `useCurrentUser`

**Fase 3 - Integração Frontend**
- Conexão de todos os módulos do dashboard (clients, suppliers, brands, categories, products, inventory, sales, purchases, accounts-receivable, accounts-payable) aos services backend
- Substituição completa da camada mock por chamadas API reais
- Implementação de React Query para cache e invalidation
- Remoção de arquivos mock (mock-data.ts, mock-reports.ts, workspace-mocks.ts, dashboard-mocks.ts)

**Fase 4-6 - Funcionalidades Extras**
- Adição de filtro de status para paginação de contas a pagar e receber
- Implementação de funcionalidade de exclusão definitiva (soft delete) para todas as entidades
- Adição de validação de termos de uso no registro
- Hooks para operações de exclusão (use-brands, use-categories, use-customers, use-products, use-purchases, use-sales, use-suppliers)
- Normalização de valores numéricos nos serviços com utilitário `toNumber`

**UI/UX - Layout de Autenticação**
- Criação do componente `OperisLogoIcon` (ícone laranja da marca)
- Implementação do `auth-split-layout.tsx` com split screen preto/laranja
- Atualização das páginas de login e register para usar o novo layout
- Ajuste do background para usar Tailwind (bg-black/bg-zinc-950)

**Correções de Bugs**
- Correção do middleware `BypassAuth` para excluir `/login` e `/logout`
- Sobrescrita de `LoginResponse` e `RegisterResponse` para retornar JSON (sem redirect)
- Ajuste do fluxo de logout via Inertia `<Link method="post">`
- Correção de erros de TypeScript nos services
- Correção de erros de lint (reduzindo de 50 para 16)
- Correção de erros em métodos de cancelamento de vendas e compras
- Correção de type errors no accountPayable service

### Fora de escopo

- Documentação OpenAPI (T059)
- Atualização do README com setup

## Contexto técnico

- **Backend**: Laravel 13, Inertia 3, Fortify, Wayfinder
- **Frontend**: React 19, TypeScript, Zod, React Query, Tailwind CSS
- **Autenticação**: HttpOnly Secure cookies (via Fortify)
- **Rotas**: Wayfinder gera rotas tipadas em `resources/js/routes/`
- **Testes**: Pest (PHP), Jest (frontend)

Decisões técnicas importantes:
- Uso de React Query para gerenciamento de estado servidor (cache, invalidation, optimistic updates)
- Serviços baseados em classes com métodos tipados
- Schema Zod para validação de todas as respostas API
- Layout de autenticação customizado sem uso de Breeze/Laravel UI

## Referências

- Issue: N/A
- Spec: specs/005-frontend-backend-bridge/spec.md
- Design: N/A
- Outros links:
  - contracts/api-contract.md
  - data-model.md
  - quickstart.md
  - research.md

## Evidências visuais

### Antes

- Layout de autenticação padrão Laravel/Breeze
- Dashboard com dados mock
- Redirect automático ao dashboard após login

### Depois

- Layout split com informações Operis à esquerda e formulário à direita
- Fundo preto (bg-black), cartões em zinc-950
- Ícone Operis em laranja (#f97316)
- Dashboard com dados reais vindos do backend
- Permanece na página de login após autenticação (sem redirect automático)

## Validação

### Testes automatizados executados

- [X] Testes automatizados executados
- [X] Todos passaram localmente

Comandos executados:

```bash
php artisan test --testsuite=Feature --filter=Auth
```

Resultado resumido: 31 testes passaram, 101 assertions.

### Testes manuais executados

1. Acessar /login e verificar renderização do novo layout Operis
2. Realizar login e verificar que não há redirect automático
3. Acessar /register e verificar layout e validação de termos
4. Verificar logout funciona corretamente com POST via Inertia
5. Navegar pelos módulos do dashboard e verificar dados reais
6. Testar operações de criação, edição e exclusão
7. Testar filtros de status em contas a pagar e receber

## Checklist de qualidade

- [X] Código segue os padrões do projeto
- [X] Sem impacto colateral conhecido
- [X] Casos de erro e edge cases considerados
- [X] Logs e mensagens de erro adequados
- [X] Nomes, validações e tratamento de erros revisados
- [X] Sem segredos, senhas ou chaves expostos

## Banco de dados

- [X] Sem alteração de banco
- [ ] Com migration
- [ ] Com seed ou atualização de dados
- [ ] Mudança retrocompatível

Detalhes, se aplicável: N/A

## Riscos e impacto

### Risco da mudança

- [X] Baixo
- [ ] Médio
- [ ] Alto

### Áreas impactadas

- Autenticação (login, register, logout)
- Todos os módulos do dashboard
- API layer (services, hooks, schemas)
- Middleware BypassAuth
- Configurações Fortify

### Plano de rollback

- Reverter modificações em `resources/js/services/`
- Reverter modificações em `resources/js/hooks/`
- Reverter modificações em `resources/js/layouts/auth/`
- Remover `app/Http/Responses/LoginResponse.php` e `RegisterResponse.php`
- Restaurar arquivos mock removidos
- Reverter modificações em `config/fortify.php` e `app/Http/Middleware/BypassAuth.php`

## Deploy e operação

- [X] Não requer ação especial
- [ ] Requer ordem específica de deploy
- [ ] Requer configuração ou variáveis de ambiente
- [ ] Requer ativação por feature flag

Passos de deploy, se aplicável: N/A

## Documentação

- [X] Não necessária
- [ ] Atualizada neste PR
- [ ] Será atualizada em PR separado

Links ou documentos atualizados:
- specs/005-frontend-backend-bridge/tasks.md
- specs/005-frontend-backend-bridge/data-model.md
- specs/005-frontend-backend-bridge/quickstart.md
- specs/005-frontend-backend-bridge/research.md
- specs/005-frontend-backend-bridge/contracts/api-contract.md

## Pontos de atenção para revisão

- Verificar que todos os módulos do dashboard estão funcionando com dados reais
- Confirmar que o comportamento de redirect após login está conforme esperado
- Validar que o logout utiliza método POST corretamente com CSRF
- Garantir que a camada de services está seguindo os padrões de clean code
- Verificar que todos os hooks estão tipados corretamente

## Observações finais

Este PR representa a implementação completa da spec 005 com:
- ~1200+ linhas de código novas (services, hooks, schemas)
- ~2500 linhas removidas (mocks)
- 33 arquivos modificados na fase 3
- 23 arquivos modificados na integração frontend
- Múltiplas correções de tipos e lint

Próximos passos não incluídos:
- Documentação OpenAPI
- Refresh token mechanism (T011)
- Password reset flow (T010)
- UI de importação completa (T056)