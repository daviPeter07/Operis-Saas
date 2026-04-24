## Resumo

Este PR consolida o slice visual do workspace e da equipe para o MVP, com navegação adaptada por empresa e role, branding dinâmico por companhia, fluxo de equipe mais compacto e ajustes no layout de settings para funcionar com a estrutura atual do projeto.

Também inclui a versão finalizada do template de PR em [specs/PULL_REQUEST_TEMPLATE.md](specs/PULL_REQUEST_TEMPLATE.md) e a reconciliação da documentação de tarefas com o estado real entregue no front.

## Objetivo de negócio

Entregar uma experiência de demonstração mais realista e profissional para o Operis MVP, com contexto multiempresa, leitura clara de permissões e uma tela de equipe mais próxima do uso esperado pelo cliente.

## Tipo de mudança

- [x] Feature
- [x] UI/UX
- [x] Refatoração
- [x] Testes
- [x] Documentação

## Escopo

### Incluído neste PR

- Workspace com navegação adaptada por role e empresa ativa.
- Branding da empresa aplicado no logo e no seletor de empresas.
- Página de equipe com cards compactos, avatar automático por nome e modal de gerenciamento.
- Fluxo de convite com cópia manual do link e cópia automática ao gerar o convite.
- Página de solicitação para admin.
- Ajustes no layout de settings para não depender de helpers ausentes.
- Template de PR profissionalizado e simplificado.
- Atualização do plano de tarefas do spec para refletir o que foi concluído.

### Fora de escopo

- Enforcement backend real para acesso por role nas rotas.
- Persistência real de equipe, convites e alterações de usuário.
- Integração com API ou banco para dados operacionais.

## Contexto técnico

- O workspace passou a reagir à empresa selecionada, ajustando branding e visibilidade.
- O módulo de equipe foi restringido aos atributos oficiais definidos para USUÁRIO/EQUIPE.
- O layout de settings foi adaptado para links estáveis, sem depender de rotas geradas inexistentes no estado atual.
- A documentação de tasks foi reconciliada com o que realmente está pronto no front.

## Referências

- Spec: [specs/001-mvp-foundation-dashboard/tasks.md](specs/001-mvp-foundation-dashboard/tasks.md)
- Template: [specs/PULL_REQUEST_TEMPLATE.md](specs/PULL_REQUEST_TEMPLATE.md)

## Evidências visuais

### Antes

A navegação, a equipe e o fluxo de settings ainda dependiam de partes quebradas ou incompletas da geração de rotas.

### Depois

Workspace com branding por empresa, equipe compacta com gerenciamento visual, convite com cópia controlada e settings compatível com a estrutura atual.

## Validação

### Testes automatizados executados

- pnpm run types:check
- pnpm run build
- vendor/bin/pint --dirty --format agent

### Resultado resumido

- Types check passou
- Build passou
- Pint passou

### Testes manuais executados

1. Abrir o dashboard e validar branding da empresa e navegação por role.
2. Abrir a página de equipe e validar cards compactos, avatar automático e modal de gerenciamento.
3. Abrir o fluxo de convite e validar cópia do link e envio visual.
4. Abrir settings e confirmar navegação funcional sem imports quebrados.

## Checklist de qualidade

- [x] Código segue os padrões do projeto
- [x] Sem impacto colateral conhecido
- [x] Casos de erro e edge cases considerados
- [x] Logs e mensagens de erro adequados
- [x] Nomes, validações e tratamento de erros revisados
- [x] Sem segredos, senhas ou chaves expostos

## Banco de dados

- [x] Sem alteração de banco

## Riscos e impacto

### Risco da mudança

- [x] Baixo

### Áreas impactadas

- Dashboard
- Team
- Settings
- Workspace context
- Documentação do spec

### Plano de rollback

- Reverter o commit caso seja necessário voltar o comportamento visual.
- Restaurar os links de settings se houver regeneração correta dos helpers no futuro.

## Deploy e operação

- [x] Não requer ação especial

## Documentação

- [x] Atualizada neste PR

## Pontos de atenção para revisão

- Conferir se o fluxo de equipe está aderente ao recorte do MVP.
- Validar se o comportamento de settings está aceitável com links diretos por seção.
- Confirmar se o fluxo de convite atende a apresentação visual desejada.

## Observações finais

Este PR entrega o recorte visual do workspace e da equipe para o MVP, com validação local concluída em types, build e Pint. O enforcement backend por role foi deixado fora do escopo por enquanto, conforme alinhado.
