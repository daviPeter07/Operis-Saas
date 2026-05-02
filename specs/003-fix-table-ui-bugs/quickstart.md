# Quickstart - Validacao da Feature

## 1) Preparacao

1. Instalar dependencias do projeto (se necessario).
2. Garantir banco e servidor de desenvolvimento ativos.
3. Executar build/typecheck frontend e testes afetados antes da revisao final.

## 2) Validacao funcional por fluxo

1. Visao Geral
   - Abrir aba de alertas/lembretes.
   - Clicar em itens diferentes e confirmar redirecionamento para tabela correta com filtros aplicados.
   - Simular falta de permissao e validar bloqueio com mensagem clara.

2. Clientes
   - Verificar badge PF/PJ em todas as linhas testadas.
   - Confirmar que classificacao segue campo explicito de tipo de pessoa.

3. Clientes e Fornecedores (localidade)
   - Validar componente unico de estado/cidade em ambos os modulos.
   - Confirmar: estado opcional, cidade opcional, cidade so selecionavel apos estado.

4. Fornecedores (endereco)
   - Confirmar campos desacoplados: rua, bairro, numero, CEP.
   - Confirmar que todos sao opcionais.

5. Vendas
   - Validar badges de status no mesmo padrao visual ja usado no financeiro.

6. Compras
   - Comparar dialogo de criacao com vendas: mesma estrutura base (secoes, ordem, interacao), com campos especificos de compras.
   - Validar metodos de pagamento em portugues canonico.

7. Contas a pagar
   - Validar metodos de pagamento em portugues canonico.

8. Calendario
   - Revisar filtros, formularios, modais e dialogs ativos com data.
   - Confirmar uso do mesmo padrao de calendario em todos os pontos ativos.

## 3) Validacao tecnica

1. Executar formatacao/lint aplicaveis aos arquivos alterados.
2. Executar testes de backend/frontend afetados.
3. Confirmar ausencia de regressao visual nas telas impactadas.

## 4) Critério de pronto

- Todos os requisitos funcionais FR-001..FR-020 satisfeitos.
- Cenarios de permissao e fallback cobertos.
- Sem quebra de layout.
