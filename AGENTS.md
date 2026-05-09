# Operis SaaS - Diário de Desenvolvimento (Agentes)

## Commits de Hoje (Resumo das Implementações)

### Correções realizadas (18/05/2026)

- **Back‑end (`SaleService.php`)**
    - Importado `FinancialStatus`.
    - Após gerar e (possivelmente) quitar os recebíveis, verificado se todas as parcelas estão quitadas usando `whereNotIn('status', [FinancialStatus::Received, FinancialStatus::Cancelled])`.
    - Quando todas as parcelas estão quitadas, a venda tem seu status atualizado para `completed` e o movimento de estoque é aplicado.
    - Lógica de `update` reorganizada para lidar corretamente com mudança de status, reversão de estoque e diffs.
- **Front‑end (`resources/js/features/dashboard/sales/index.tsx`)**
    - Criado `receivableStatusMap` que mapeia `sale_id‑installment_number` → status do receivable.
    - No payload de criação, calculado `isAllPaid` e enviado `status: 'completed'` quando todas as parcelas foram marcadas como pagas.
    - Ao montar a tabela de vendas, o status da linha agora é sobrescrito com o status do receivable obtido do mapa, permitindo que parcelas individuais apareçam como `received` ou `pending`.
- **Dialog de confirmação (`sale-confirmation-dialog.tsx`)**
    - Mantida a coleta de `paidInstallments` via check‑boxes; o array é enviado ao backend.
- **Validação (`StoreSaleRequest.php`)**
    - Campo `paid_installments` já aceita um array de inteiros; nada a mudar.
- **Criação de marcas (`StoreBrandRequest.php` / `BrandService.php`)**
    - `status` passou a ser opcional (`sometimes`) e, se ausente, a marca é criada com `status: 'active'`.

Essas mudanças garantem que, ao marcar parcelas como pagas na UI, o status da parcela na tabela de Vendas refletirá corretamente `Received` (ou `Pending` quando ainda não quitada).

Hoje foi um dia de grandes avanços, principalmente focados nas regras de negócio, integrações de formulários e painéis de checkout. Aqui está o resumo das funcionalidades implementadas nos commits:

1. **Gestão de Compras (Painel de Checkout):**
    - Criação de interface para adicionar produtos com preço de compra (formatado com máscara de moeda `R$`).
    - Implementação de opções de vencimento para Boletos (30, 60, 90 e 120 dias) no painel de checkout.
    - Adição do Status de Compra (Faturada vs Paga) na confirmação do resumo.
    - Refatoração do painel de checkout de compras (`purchase-checkout-panel`).

2. **Contas a Receber & Contas a Pagar:**
    - Implementação da funcionalidade de liquidação (baixa) de contas a receber.
    - Sincronização do status financeiro entre contas a receber e contas a pagar com base na situação das vendas e compras (status dinâmicos e regras de atualização).

3. **Validações e Melhorias de UI/UX:**
    - Integração do `react-hook-form` em diversos diálogos e componentes, melhorando a validação de campos obrigatórios e fluxo de digitação.
    - Formatação e máscara de entrada de crédito na criação de clientes.
    - Ajuste de formatação de datas padronizado para o fuso horário de Manaus em todo o sistema e nas respostas da API.
    - Otimizações no cálculo de estoque total no módulo de inventário e melhorias na organização dos diálogos de produtos.

---

## Próximos Passos (O Plano)

O objetivo principal em andamento é **padronizar as interfaces financeiras**, replicando e adaptando a lógica do "Dialog de Vendas" para os outros módulos.

Como a funcionalidade de **Compras** já foi implementada e ajustada com os requisitos específicos de custo e boleto, o foco agora muda para:

1. **Contas a Pagar (Accounts Payable):**
    - Replicar a interface unificada de diálogo.
    - Adaptar para o contexto de pagamentos (Fornecedor, Vencimentos, Forma de Pagamento e Status).
    - Aplicar a máscara de moedas e campos de formulário como na Venda/Compra.

2. **Contas a Receber (Accounts Receivable):**
    - Replicar a interface unificada de diálogo.
    - Ajustar para a visualização dos valores que entram no fluxo de caixa.
    - Permitir gestão fácil e clara das parcelas ou dos vencimentos (ex: controle de faturas e boletos em aberto).

3. **Sincronização Final:**
    - Garantir que todas as telas conversem perfeitamente com o backend (via Inertia.js).
    - Certificar-se de que a sincronização financeira (A pagar / A receber) seja gerada ou cancelada corretamente sempre que uma Nova Compra ou Nova Venda for salva/cancelada.

### 09/05/2026 - Commits do dia

- **8862285** feat: remover alerta de pedidos não entregues conforme solicitado
- **e35b7bf** feat: adicionar invalidação de queries para produtos e clientes nas mutações de vendas
- **9d369f7** feat: ajustar lógica de atualização de status de vendas e movimentação de estoque
- **bbaaa08** feat: atualizar status da parcela para 'completa' quando recebida
- **67463b7** Add 'Marcar todas' button to select all crediário installments in confirmation dialog
- **f81fceb** feat: implementar lógica de pagamento em crediário e atualizar status de parcelas nas vendas
- **5645db3** feat: permitir pagamento em crediário e ajustar exibição de parcelas nas vendas
- **5886f26** feat: adicionar campo de status ao formulário de cliente e ajustar lógica de inicialização
- **dc8bc8a** feat: melhorar formatação de preços e adicionar máscara de campo no diálogo de vendas
- **3bddcc3** feat: adicionar cabeçalho de compras com métricas e formatação de valores
- **65f767a** feat: atualizar painel de compras com melhorias na exibição de produtos e métodos de pagamento
- **03b1582** feat: adicionar funcionalidade de seleção de prazo de vencimento para boleto e status de compra no painel de checkout
- **6cc1c1e** feat: implement account receivable settlement functionality
- **32ef66a** feat: refactor accounts receivable dialog and add purchase checkout panel
- **4813143** feat: adicionar suporte ao react-hook-form em diversos diálogos e componentes, incluindo validação de campos obrigatórios
- **8432018** feat: adicionar sincronização de status financeiro entre contas a receber e contas a pagar com base em vendas e compras
- **455630e** feat: ajustar formatação de data para o fuso horário de Manaus e otimizar importações em diversos componentes
- **dc78cab** feat: adicionar campo de status nas regras de atualização de vendas e exibir data de criação formatada nas respostas de vendas e compras
- **42cb044** feat: adicionar tooltip e formatação de entrada de crédito no diálogo de criação de cliente; refactor: otimizar cálculo de estoque total no módulo de inventário; refactor: melhorar formatação e estrutura de labels no diálogo de produtos

**Resumo do dia**

- Removemos o alerta de "Pedidos não entregues".
- Atualizamos mutações de vendas para invalidar caches de produtos e clientes.
- Corrigimos a lógica de estoque e status de vendas/recebíveis para crediário.
- Melhorias de UI: botão "Marcar todas", máscaras de preço, tooltips, cabeçalhos de compra, seleção de prazo de boleto.
- Integração de react‑hook‑form e validações.
- Sincronização de status financeiro entre contas a pagar e a receber.
- Ajustes de formatação de datas/horários.

**Sugestões de melhorias futuras**

1. Dashboard de Finanças com gráficos comparativos.
2. Notificações em tempo real via WebSocket/Laravel Echo.
3. Relatórios PDF/Excel de vendas, compras e estoque.
4. Histórico de alterações/auditoria.
5. Integração com gateway de pagamento para baixa automática.
6. Customização de planos de crédito para clientes.
