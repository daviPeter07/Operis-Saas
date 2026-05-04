# Research: Backend Operis SaaS

## Decision 1: Onboarding resend limit

- Decision: aplicar limite de 5 reenvios por hora por usuario/empresa, mantendo cooldown de 1 minuto.
- Rationale: reduz abuso sem bloquear onboarding legitimo.
- Alternatives considered:
- 3/h: pode bloquear usuarios legitimos em validacoes reais.
- 10/dia: janela muito longa para controle operacional.
- apenas rate limiter tecnico: perde regra explicita de dominio.

## Decision 2: Payment model for sales

- Decision: `sale_payments` armazena condicao de pagamento; `account_receivables` armazena parcelas geradas.
- Rationale: separa condicao comercial do lancamento financeiro executavel.
- Alternatives considered:
- tudo em `account_receivables`: simplifica, mas perde semantica de condicao.
- somente `sales.payment_method`: insuficiente para parcelamento e reajuste.

## Decision 3: Payment model for purchases

- Decision: `purchase_payments` armazena condicao de pagamento; `account_payables` armazena parcelas geradas.
- Rationale: simetria com vendas e melhor manutencao.
- Alternatives considered:
- tudo em `account_payables`: mistura regra comercial com obrigacao financeira.

## Decision 4: Editing concluded documents with settled finance

- Decision: recalcular apenas quando nao houver baixa/recebimento; se houver, bloquear edicao financeira, exceto fluxo de devolucao/reembolso com ajuste compensatorio.
- Rationale: evita inconsistencias em operacoes ja liquidadas.
- Alternatives considered:
- sempre recalcular: alto risco de quebrar trilha financeira.
- nunca editar concluido: restritivo para operacao real.

## Decision 5: Import preview lifecycle

- Decision: preview nao e persistido para reutilizacao posterior; confirmacao deve ocorrer no mesmo fluxo.
- Rationale: reduz armazenamento temporario e complexidade de sincronizacao.
- Alternatives considered:
- persistir preview em lote: aumenta complexidade de expiracao/seguranca.
- reprocessar arquivo em confirmacao tardia: custo extra de processamento e risco de divergencia.

## Decision 6: Required fields baseline

- Decision:
- Customer/Supplier: `name` obrigatorio.
- Brand/Category: `name` obrigatorio.
- Product: `name`, `sku`, `sale_price`, `cost`, `stock`, `category_id`, `brand_id` obrigatorios.
- Rationale: baseline minima para nao bloquear operacao e manter consistencia de dominio.
- Alternatives considered:
- exigir todos os campos: alto atrito em onboarding de dados.
- exigir quase nada: degrada qualidade de dados.

## Decision 7: Enum strategy for phase 1

- Decision: adotar conjunto minimo de enums nesta fase.
- Rationale: evita overdesign enquanto preserva consistencia.
- Alternatives considered:
- conjunto completo futuro: aumenta custo inicial sem ganho imediato.

## Decision 8: Product identity keys

- Decision: `sku` obrigatorio e unico por empresa; `barcode` opcional e unico quando informado.
- Rationale: SKU e identificador operacional interno confiavel.
- Alternatives considered:
- barcode obrigatorio: nao atende todos os cenarios de cadastro.
- ambos opcionais: dificulta deduplicacao e controle.

## Open research items retained

- Fluxo de devolucao/reembolso ainda requer especificacao de estados/endpoints.
- Regra exata de distribuicao de parcelas (datas e arredondamento) ainda requer definicao.
- Valores finais de `company_users.role` para esta fase ainda requerem definicao.

