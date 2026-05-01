# Phase 0 Research - Correcoes de Usabilidade em Tabelas

## 1) Navegacao por alertas/lembretes

- Decision: Usar mapeamento fixo por tipo de alerta/lembrete para tela de destino e filtros predefinidos.
- Rationale: Evita ambiguidade, facilita testes de regressao e garante previsibilidade para o usuario operacional.
- Alternatives considered:
  - Redirecionar para ultima tela usada: rejeitado por comportamento imprevisivel.
  - Redirecionar para tela padrao unica: rejeitado por perda de contexto do alerta.

## 2) Controle de permissao no redirecionamento

- Decision: Se o usuario nao tiver permissao na tela alvo, bloquear redirecionamento e exibir mensagem clara.
- Rationale: Mantem postura de seguranca explicita e evita navegacao para tela bloqueada.
- Alternatives considered:
  - Deixar destino bloquear depois: rejeitado por UX confusa.
  - Redirecionar para fallback generico: rejeitado por esconder causa real.

## 3) Tipo de cliente PF/PJ

- Decision: Usar campo explicito de tipo de pessoa como fonte principal, com documento apenas para validar consistencia.
- Rationale: Reduz falsos positivos e evita inferencia ambigua.
- Alternatives considered:
  - Inferir apenas por documento: rejeitado por risco com dados incompletos/legados.
  - Exibir somente quando houver alta confianca: rejeitado por baixa cobertura.

## 4) Componente global de localidade

- Decision: Criar/compor um unico componente reutilizavel para estado/cidade, consumindo fonte canonica unica do sistema.
- Rationale: Padroniza comportamento em clientes e fornecedores e reduz duplicacao.
- Alternatives considered:
  - Implementacoes separadas por tela: rejeitado por divergencia de UX.
  - Lista local hardcoded: rejeitado por manutencao ruim.

## 5) Regra de uso estado/cidade

- Decision: Estado e cidade sao opcionais; para selecionar cidade, estado deve estar selecionado antes.
- Rationale: Mantem flexibilidade de filtro com coerencia na hierarquia geografica.
- Alternatives considered:
  - Cidade pesquisavel sem estado: rejeitado por ambiguidade.
  - Ambos obrigatorios: rejeitado por friccao desnecessaria.

## 6) Padrao de pagamentos e status

- Decision: Adotar lista canonica unica em portugues para metodos de pagamento e reutilizar padrao visual de badges existente no financeiro.
- Rationale: Consistencia cross-modulo e menor erro de interpretacao.
- Alternatives considered:
  - Traducao livre por tela: rejeitado por inconsistencias.
  - Rotulo bilingue: rejeitado por ruido visual.

## 7) Dialogo de compras vs vendas

- Decision: Dialogo de compras segue mesma estrutura base de vendas (secoes, ordem e interacao), mudando apenas campos especificos de compras.
- Rationale: Reuso de padrao mental do usuario e menor curva de uso.
- Alternatives considered:
  - Similaridade apenas estetica: rejeitado por margem de interpretacao alta.
  - Layout livre: rejeitado por risco de divergencia.

## 8) Calendario unico em pontos ativos

- Decision: Substituir todos os seletores de data ativos (filtros, formularios, modais e dialogs) por um unico padrao.
- Rationale: Evita inconsistencias de interacao e reduz erros de preenchimento.
- Alternatives considered:
  - Troca parcial por modulo: rejeitado por manter fragmentacao.

## 9) Organizacao de codigo limpo

- Decision: Em todos os arquivos tocados, aplicar organizacao por feature e extrair `constants`, `hooks` e `types` quando fizer sentido.
- Rationale: Atende diretriz do produto e reduz acoplamento.
- Alternatives considered:
  - Refatoracao global irrestrita: rejeitado por risco/escopo.
  - Somente novos arquivos: rejeitado por inconsistencia nos alterados.
