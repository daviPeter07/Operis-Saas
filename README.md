<div align="center">

<a href="https://www.dgcomputer.com.br">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/dg-logo-dark.svg" />
    <img src="docs/brand/dg-logo-light.svg" alt="DG Computer" height="88" />
  </picture>
</a>

# Operis

**Gestão comercial, estoque e financeiro em um só lugar.**

Sistema em produção utilizado pela **[DG Computer](https://www.dgcomputer.com.br)** para controlar vendas, compras, estoque e contas a pagar e a receber.

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.5-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Inertia](https://img.shields.io/badge/Inertia.js-3-9553E9?logo=inertia&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Pest](https://img.shields.io/badge/Tests-Pest_4-F472B6)

</div>

---

## 📌 Sobre

O **Operis** é a plataforma de gestão usada no dia a dia da **DG Computer**. Ele reúne o ciclo comercial inteiro: do cadastro de produtos e fornecedores à venda no balcão, passando pelo controle de estoque, crediário, boletos de compra e relatórios gerenciais.

A aplicação é **multiempresa**: cada usuário trabalha dentro de uma empresa ativa, e todos os dados são isolados por empresa.

## ✨ Funcionalidades

| Módulo | O que faz |
|---|---|
| 🛒 **Vendas** | Venda com múltiplos itens, PIX, dinheiro, cartão e **crediário** com entrada e parcelas; checagem de estoque; recibo para **impressora térmica** e fatura em PDF |
| 📦 **Compras** | Entrada de mercadorias com preço de custo, pagamento à vista ou **boleto (30/60/90/120 dias)**, status faturada/paga |
| 🏷️ **Estoque** | Produtos, categorias e marcas, com histórico de movimentações gerado automaticamente por vendas, compras, edições e cancelamentos |
| 👥 **Cadastros** | Clientes (com limite de crédito) e fornecedores, pessoa física ou jurídica |
| 💰 **Contas a receber** | Parcelas geradas pelas vendas, baixa total ou parcial, estorno e sincronização com o status da venda |
| 💸 **Contas a pagar** | Parcelas geradas pelas compras, baixa total ou parcial, estorno e sincronização com o status da compra |
| 📊 **Relatórios** | Vendas, produtos mais vendidos, vendas por categoria e marca, estoque atual, inadimplência, pagamentos por método e maiores compradores |
| 📥 **Importação / exportação** | Importação de cadastros por planilha; exportação de tabelas para Excel e PDF |

## 🛠️ Correções em vendas (novembro de 2026)

Revisão completa do módulo de vendas. Para cada um dos 21 problemas está registrado como era antes, por que acontecia, o que foi feito e como funciona hoje. Também entraram as correções de clientes que afetavam o crediário.

### Desconto

**1. O desconto não era salvo na venda**
- **Antes:** o caixa mostrava o desconto, mas a venda era gravada pelo valor cheio. As parcelas, a entrada do crediário e as contas a receber também saíam sem desconto.
- **Por quê:** o banco não tinha onde guardar o desconto (não existia a coluna) e a API não recebia esse campo. O desconto existia só na tela e era descartado ao salvar.
- **Correção:** coluna `discount` na venda. A API passou a aceitar o desconto e a calcular `total = subtotal − desconto` num único lugar, na criação e na edição.
- **Hoje:** o desconto fica salvo e entra no total, nas parcelas, na entrada do crediário, no limite de crédito e no comprovante. Um desconto maior que o subtotal é recusado com uma mensagem.

**2. O desconto sumia ou ficava errado no cadastro**
- **Antes:** ao editar uma venda, o desconto voltava zerado. Um desconto em % não acompanhava as mudanças do carrinho, e um valor acima do subtotal era cortado sem aviso.
- **Por quê:** o desconto não era carregado da venda salva e era calculado uma vez só, no momento em que era aplicado.
- **Correção:** o desconto é carregado ao editar, recalculado sempre que o carrinho muda e validado na própria janela de desconto.
- **Hoje:** o desconto aparece ao editar e acompanha o carrinho. Um valor inválido mostra o erro com a prévia do total e o botão "Remover desconto". A linha do desconto fica destacada em laranja no carrinho, no pagamento e no resumo.

**3. O lucro do resumo ignorava o desconto**
- **Antes:** o lucro mostrado antes de confirmar a venda era maior do que o real quando havia desconto.
- **Por quê:** a conta usava só preço de venda menos custo dos itens.
- **Correção e hoje:** o lucro do resumo desconta o desconto da venda.

### Crediário e parcelas

**4. O crediário ignorava a data da 1ª parcela**
- **Antes:** o caixa pedia a data da primeira parcela, mas as parcelas venciam sempre 30 dias depois da venda.
- **Por quê:** a data escolhida não era enviada, e o servidor sempre usava "data da venda + 30 dias".
- **Correção:** a data é enviada e usada pelo servidor. Sem data, continua valendo o padrão de 30 dias.
- **Hoje:** a 1ª parcela vence na data escolhida e as seguintes mês a mês, respeitando o fim do mês (31/01 → 28/02).

**5. As parcelas perdiam centavos**
- **Antes:** R$ 220,00 em 3 parcelas virava 3 × R$ 73,33 = R$ 219,99. Faltava um centavo para fechar o total.
- **Por quê:** cada parcela era arredondada sozinha e ninguém cuidava da sobra.
- **Correção:** a divisão é feita em centavos e a sobra vai para a última parcela. O cadastro, o resumo, os detalhes e o comprovante usam essa mesma regra.
- **Hoje:** 73,33 + 73,33 + 73,34 = 220,00. A soma das parcelas sempre fecha com o valor financiado.

**6. O resumo do crediário calculava errado**
- **Antes:** as parcelas eram calculadas sobre o total da venda, e não sobre o que sobra depois da entrada. O limite de crédito do cliente contava parcelas canceladas e, ao editar, as parcelas da própria venda.
- **Por quê:** a tela usava o total cheio e somava todas as contas do cliente, sem filtrar o status nem a venda que estava sendo editada.
- **Correção e hoje:** as parcelas dividem só o saldo financiado (total − entrada). O limite considera apenas as contas em aberto e desconta as parcelas da própria venda quando ela está sendo editada.

**7. Uma entrada inválida travava o cadastro sem explicação**
- **Antes:** com uma entrada zerada ou maior que o total, o botão de avançar ficava desabilitado sem nenhuma mensagem.
- **Por quê:** a regra existia, mas só desabilitava o botão.
- **Correção e hoje:** a tela explica que a entrada precisa ser maior que zero e menor que o total da venda.

**8. Ao editar, as parcelas já pagas voltavam a ficar em aberto**
- **Antes:** depois de editar uma venda no crediário, parcelas que o cliente já tinha pago apareciam de novo como pendentes.
- **Por quê:** a edição não enviava quais parcelas já estavam pagas, e o servidor recriava todas como em aberto.
- **Correção e hoje:** as parcelas pagas vêm marcadas ao editar e são enviadas junto. Um crediário de 1 parcela também pode ser marcado como pago.

### Cancelar, excluir, editar e estoque

**9. Cancelar uma venda pendente não desfazia nada**
- **Antes:** as contas a receber continuavam em aberto (e contando no limite do cliente) e o estoque não voltava. Receber ou desfazer uma parcela depois tirava a venda do status "cancelada".
- **Por quê:** o cancelamento só trocava o status da venda. As baixas de contas a receber recalculavam o status sem saber que a venda tinha sido cancelada.
- **Correção:** o cancelamento devolve ao estoque exatamente o que a venda tirou, cancela as contas em aberto e mantém as já recebidas. Contas de vendas canceladas não podem mais receber baixa nem estorno (a API responde com erro).
- **Hoje:** cancelar devolve o estoque uma única vez, libera o limite do cliente e não altera o dinheiro já recebido. Uma migration cancelou as contas que ficaram em aberto de vendas canceladas antes da correção.

**10. Excluir uma venda cancelada devolvia o estoque de novo**
- **Antes:** uma venda concluída, depois cancelada e depois excluída devolvia os produtos ao estoque duas vezes.
- **Por quê:** o cancelamento e a exclusão devolviam o estoque cada um por conta própria, sem verificar o que já tinha voltado.
- **Correção e hoje:** os dois calculam o saldo pelas movimentações de estoque da própria venda. O estoque volta uma vez só, não importa a ordem das ações.

**11. Editar a venda mexia errado no estoque**
- **Antes:** passar uma venda de concluída para pendente devolvia o estoque, e alterar os itens de uma venda pendente não ajustava nada.
- **Por quê:** o ajuste de estoque dependia do status da venda, mas o estoque já sai no momento da criação, qualquer que seja o status.
- **Correção e hoje:** a edição ajusta o estoque só pela diferença entre os itens antigos e os novos, em qualquer status. Produto repetido em duas linhas também é somado certo.

### Cadastro da venda (janela de venda)

**12. A janela fechava antes de a venda ser salva**
- **Antes:** se a API recusasse a venda (por exemplo, estoque insuficiente), a janela já tinha fechado e o carrinho se perdia.
- **Por quê:** a janela era fechada assim que o botão era clicado, sem esperar a resposta do servidor.
- **Correção e hoje:** a janela só fecha depois que a venda é salva. Em caso de erro, o carrinho continua lá e a mensagem aparece.

**13. A janela reabria com a venda anterior**
- **Antes:** ao clicar em "Criar" de novo, voltavam o cliente, o carrinho e a etapa da venda anterior.
- **Por quê:** o formulário continuava montado depois de fechar e guardava o estado da última venda.
- **Correção e hoje:** o formulário é recriado sempre que a janela abre, então cada venda começa vazia (ou com os dados da venda que está sendo editada).

**14. Preço errado ao adicionar produto pelo catálogo**
- **Antes:** alguns preços viravam um valor enorme ao adicionar o produto (por exemplo, um produto de R$ 19,99).
- **Por quê:** o preço era multiplicado por 100 para a máscara de moeda, e no JavaScript `19,99 × 100` dá `1998,9999999…`. A máscara juntava todos esses dígitos num número só.
- **Correção e hoje:** o preço é convertido em centavos inteiros antes da máscara e aparece sempre certo.

**15. Observações e "Marcar como entregue" não eram salvos**
- **Antes:** os dois campos apareciam no caixa, mas nunca chegavam ao servidor.
- **Por quê:** não existiam colunas para eles e a tela não os enviava.
- **Correção e hoje:** as observações ficam salvas e aparecem nos detalhes da venda. A marcação de entrega saiu do cadastro por não estar em uso, mas o servidor continua aceitando o campo e uma entrega já registrada não é apagada ao editar.

### Listagem e detalhes da venda

**16. "Visualizar" abria a impressão**
- **Antes:** o botão do olho na tabela abria o comprovante em vez dos detalhes.
- **Por quê:** no componente de ações da tabela, os botões de ver e de imprimir chamavam a mesma função.
- **Correção e hoje:** cada botão tem a sua ação. "Ver detalhes" abre a página da venda e "Imprimir" abre o comprovante.

**17. Parcelas com R$ 0,00 nos detalhes**
- **Antes:** o card Parcelas mostrava R$ 0,00 nas parcelas recebidas ou canceladas, e uma venda cancelada aparecia como "1x".
- **Por quê:** a tela lia o valor **em aberto** da parcela (que é zero depois de receber ou cancelar) e contava só as parcelas que restavam.
- **Correção e hoje:** mostra o valor original de cada parcela e, na venda cancelada, a divisão original.

**18. "Recebido em" mostrava um dia antes**
- **Antes:** um recebimento feito em 06/11 aparecia como 05/11.
- **Por quê:** recebimentos gravados só com a data viravam meia-noite no horário universal, que em Manaus é 20h do dia anterior.
- **Correção e hoje:** datas sem horário são exibidas como estão, sem conversão de fuso.

**19. Formas de pagamento antigas sem nome**
- **Antes:** vendas antigas feitas no "cartão" ou "parcelado" (opções que não existem mais) mostravam "-" na tabela, o código interno nos detalhes, e não podiam ser filtradas.
- **Por quê:** esses valores não estavam na lista de nomes nem no filtro.
- **Correção e hoje:** aparecem como "Cartão" e "Parcelado" e entram no filtro de forma de pagamento.

**20. O comprovante em PDF mostrava valores de pagamento errados**
- **Antes:** numa venda pendente no crediário, o PDF dizia "Valor pago R$ 0,00" mesmo com a entrada paga, e qualquer venda paga aparecia como "Liquidado". O PDF não mostrava as parcelas com vencimento nem as observações, e uma venda ainda não salva saía como "Venda #0".
- **Por quê:** o PDF só olhava o status da venda (paga = tudo pago, pendente = nada pago) e não usava a entrada nem as parcelas.
- **Correção e hoje:** o comprovante (PDF e prévia) foi refeito. Ele mostra a situação com cor (Paga, Pendente ou Cancelada), o desconto em destaque, a entrada paga e o que falta no crediário, a tabela de parcelas com o vencimento de cada uma, as observações e o número das páginas. Venda ainda não salva aparece como "Nova venda".

### Clientes (afetava o crediário)

**21. Todo cliente era salvo como pessoa física**
- **Antes:** escolher "Pessoa jurídica" no cadastro não tinha efeito. O cliente voltava como PF.
- **Por quê:** a tela não enviava o tipo de pessoa ao salvar, e a API não o devolvia.
- **Correção e hoje:** o tipo é salvo e devolvido. Uma migration corrigiu os clientes já cadastrados: quem tem documento com 14 dígitos (CNPJ) passou a ser PJ.

### Melhorias que vieram junto

- **Cadastro da venda em 4 etapas** (Produtos → Cliente e carrinho → Pagamento → Resumo), com bolinhas no topo mostrando o progresso. O "Próximo" só libera com a etapa completa e diz o que falta.
- **Cards centralizados, um embaixo do outro**, em todas as etapas, no computador e no celular.
- **Etapas "Cliente e carrinho" e "Pagamento" redesenhadas:** cada etapa virou um card só, dividido em seções com ícone. O carrinho mostra quantidade e subtotal de cada item com botões de + e −, as formas de pagamento têm ícone e uma explicação curta, o crediário mostra o saldo financiado e o limite lado a lado, e o total fica em destaque no fim.
- **Confirmação ao adicionar produto:** aparece a mensagem "2 × Produto adicionado ao carrinho", com a quantidade de itens e o total do carrinho.
- **Resumo da venda num card só:** cliente e total em destaque, itens, valores e a pergunta "O cliente já pagou?" (Pendente ou Paga). No crediário, a pergunta é quais parcelas já foram pagas. O botão passou a se chamar "Imprimir Nota".
- **Cadastro de produto no celular:** a janela agora cabe na tela. O título e os botões Cancelar/Criar ficam sempre visíveis e só o formulário rola. Antes ela ficava mais alta que a tela, cortando o título e os botões. No celular, os botões "Gerar" e "Ler" mostram só o ícone.
- **Janela do comprovante ajustada para o celular:** as opções ficam em cima, o documento ocupa o resto da tela e os botões ficam lado a lado.
- **Página de detalhes da venda** com resumo, valores, itens, parcelas e o **histórico** de tudo o que aconteceu (registro, edição, recebimentos, conclusão, cancelamento).
- **Filtros por coluna** na tabela de vendas (cliente, produto, categoria, marca, status, forma de pagamento) e ordenação por data, total e lucro.

### O que não teve como corrigir

- Os descontos de vendas gravadas antes da correção se perderam, porque nunca foram salvos.
- Vendas pendentes canceladas antes da correção continuam sem o estoque devolvido. O estoque já se movimentou desde então, e ajustar para trás poderia gerar números errados.

## 🛒 Compras no padrão de vendas (novembro de 2026)

Compras ganhou o mesmo cadastro em etapas, a tabela com filtros por coluna e a página de detalhes de vendas. Na revisão apareceram os 8 problemas abaixo, cada um com como era antes, por que acontecia, o que foi feito e como funciona hoje.

### Problemas corrigidos

**1. As observações da compra não eram salvas**
- **Antes:** o cadastro de compra tinha o campo "Observações", mas o texto sumia depois de salvar.
- **Por quê:** a tela não enviava o campo e o banco não tinha onde guardá-lo.
- **Correção e hoje:** coluna `notes` nas compras. As observações ficam salvas, aparecem nos detalhes e no resumo do cadastro, e voltam ao editar.

**2. Excluir uma compra cancelada tirava o estoque de novo**
- **Antes:** ao cancelar uma compra, os produtos saíam do estoque. Se depois ela fosse excluída, saíam mais uma vez.
- **Por quê:** o cancelamento e a exclusão retiravam o estoque cada um por conta própria, sem ver o que já tinha saído.
- **Correção e hoje:** os dois calculam pelas movimentações de estoque da própria compra. O estoque sai uma vez só, em qualquer ordem.

**3. Produto repetido em duas linhas contava só uma no estoque ao editar**
- **Antes:** ao editar uma compra com o mesmo produto em duas linhas (por exemplo, custos diferentes), o estoque considerava só uma das linhas.
- **Por quê:** a diferença de estoque era calculada por produto, e a segunda linha sobrescrevia a primeira.
- **Correção e hoje:** as linhas do mesmo produto são somadas antes de ajustar o estoque.

**4. Editar a compra apagava boletos já pagos**
- **Antes:** numa compra pendente com, por exemplo, o 1º boleto já pago em contas a pagar, qualquer edição (até só a observação) voltava esse boleto para "pendente".
- **Por quê:** toda edição apagava as contas a pagar da compra e criava de novo, sem os pagamentos.
- **Correção e hoje:** as contas a pagar só são refeitas quando muda o que define elas (valor, forma de pagamento, boletos, data ou situação). Editar observação, fornecedor ou itens sem mudar o total mantém os pagamentos. Se a compra tem pagamento registrado e você tenta mudar o valor ou a forma de pagamento, aparece um aviso para desfazer a baixa antes.

**5. Compras canceladas não apareciam na lista**
- **Antes:** a tela de compras escondia as compras canceladas, sem como filtrar por elas.
- **Por quê:** a lista removia as canceladas antes de mostrar.
- **Correção e hoje:** elas aparecem com o status "Cancelada" e podem ser filtradas pela coluna Status.

**6. Compra em dinheiro ficava pendente para sempre**
- **Antes:** uma compra em dinheiro marcada como pendente ficava pendente, mas a conta a pagar dela já nascia paga.
- **Por quê:** o sistema sempre registra o pagamento em dinheiro como pago, e nada concluía a compra depois.
- **Correção e hoje:** no cadastro, compra em dinheiro é sempre registrada como paga.

**7. Não dava para dizer que só parte dos boletos estava paga**
- **Antes:** no fim do cadastro, a única opção era marcar a compra inteira como "Paga" ou "Pendente". Quem já tinha pago só o 1º boleto precisava escolher entre marcar tudo como pago (errado) ou deixar tudo em aberto e dar baixa depois em contas a pagar.
- **Por quê:** a compra só tinha uma situação geral, sem olhar os boletos um a um.
- **Correção e hoje:** no boleto, o resumo mostra a lista dos boletos para marcar os que já foram pagos, com o total pago e o em aberto. Os marcados já entram como pagos em contas a pagar, e a compra fica concluída quando todos estão pagos. Ao editar, os boletos pagos vêm marcados, e desmarcar um volta ele para em aberto.

**8. "60 dias" no boleto não deixava claro quantos boletos eram**
- **Antes:** as opções eram "30 dias", "60 dias"... e não mostravam que 60 dias significa 2 boletos (um em 30 e outro em 60 dias), nem as datas e os valores.
- **Por quê:** a tela mostrava só o prazo total.
- **Correção e hoje:** cada opção mostra a quantidade de boletos ("2 boletos, a cada 30 dias, até 05/01/27"), e embaixo aparece a lista de vencimentos com a data e o valor de cada boleto, igual ao que vai para contas a pagar.

### Crediário sem entrada

- **Antes:** a venda no crediário exigia uma entrada maior que zero. Sem entrada, o cadastro mostrava "Informe uma entrada maior que zero" e não deixava avançar, e a API também recusava.
- **Por quê:** a regra foi escrita supondo que todo crediário tem entrada, nas duas pontas (tela e servidor).
- **Correção e hoje:** a entrada é **opcional**. Deixando em branco, o valor total é dividido nas parcelas, e o limite de crédito do cliente considera o total. Quando informada, a entrada continua precisando ser menor que o total.

### Comprovante da venda em PDF de 80 mm

- **Novo:** em "Imprimir Nota" → **Digital**, dá para escolher o formato do PDF: **A4** (folha inteira, para imprimir) ou **80 mm** (no tamanho do cupom da impressora térmica, para enviar ao cliente por WhatsApp ou e-mail). O PDF de 80 mm tem o mesmo conteúdo do cupom térmico e a altura do próprio cupom.
- **Correção junto:** o cupom térmico (na tela, no PDF de 80 mm e na impressão direta) mostrava "Pago R$ 0,00" num crediário pendente mesmo com a entrada paga, porque olhava só o status da venda. Agora mostra a entrada como paga e o restante certo.

### Melhorias que vieram junto

- **Cadastro da compra em 4 etapas** (Produtos → Fornecedor e carrinho → Pagamento → Resumo), igual ao de vendas, com a confirmação de produto adicionado e o total sempre à vista.
- **Custo unitário ao adicionar produto**, com o último custo e o preço de venda como referência.
- **Cadastrar fornecedor pela busca:** digite o nome e escolha "Cadastrar", o fornecedor é criado e já fica selecionado.
- **Tabela com filtros por coluna** (fornecedor, produto, categoria, marca, status e forma de pagamento) e ordenação por data, vencimento e total. Data e vencimento ficam lado a lado no começo.
- **Página de detalhes da compra** com resumo, valores (total, pago e em aberto), observações, itens e as contas a pagar com a situação de cada boleto.

### Histórico da compra

- **Novo:** os detalhes da compra mostram o histórico, igual ao da venda: compra registrada, editada, cada boleto pago ("Boleto 2 pago", "Pagamento parcial do boleto 3"), pagamento desfeito, compra concluída e cancelada, com data, hora e valor. Vale para o que é feito no cadastro da compra e para as baixas em contas a pagar.
- **Compras antigas:** o histórico delas foi montado a partir do que já estava salvo (cadastro, boletos pagos, conclusão e cancelamento).
- **Datas:** o resumo mostra a data de conclusão (ou do cancelamento) da compra.
- O histórico das vendas foi conferido e não tinha erro.

## 💰 Contas a receber e a pagar (novembro de 2026)

As duas telas ganharam o mesmo padrão das outras: filtros em cada coluna, página de detalhes de cada conta e as ações de baixa num lugar só. A seleção pela caixinha à esquerda continua.

### O que mudou

- **Filtros por coluna:**
  - Cliente/Fornecedor e Descrição: texto;
  - Origem: select com Venda/Compra ou Manual;
  - Status: select com Pendente, Parcial, Recebida/Paga ou Cancelada.
- **Ordenação:** por Valor, Vencimento e Lançamento. O filtro de período usa o vencimento.
- **Parcela:** aparece como nas vendas: "1/3", "Entrada" (entrada do crediário) ou "Única".
- **Seleção:** marcando contas (de qualquer página), aparece uma barra no rodapé com o total e as ações:
  - "Marcar como recebida/paga";
  - "Baixa parcial" (com uma conta só);
  - "Desfazer baixa".
- **Página de detalhes de cada conta:**
  - resumo, com link para a venda ou a compra de origem;
  - valores: valor, recebido/pago e em aberto;
  - forma e observação do pagamento (em contas a pagar);
  - observações;
  - as mesmas ações, mais editar e excluir.
- **Cadastro de conta:**
  - formulário novo, com busca de cliente/fornecedor e "Cadastrar" pelo nome digitado;
  - em contas a pagar no boleto, aparece a lista dos boletos com o vencimento e o valor de cada um, igual ao que vai ser criado.
  - contas a receber ganhou forma de pagamento, igual à da venda: Dinheiro, PIX, Cartão (débito ou crédito) ou Crediário. No crediário, escolha de 1 a 24 parcelas e a data da 1ª, e aparece a lista com o vencimento e o valor de cada uma (uma por mês, os centavos que sobram vão na última, como na venda). As parcelas ficam em aberto até o cliente pagar. Nas outras formas, informe o vencimento e se já foi recebida. Antes, a conta a receber manual era lançada sem vencimento nem forma de pagamento.
- **Colunas:** Lançamento e Vencimento vêm primeiro, lado a lado.
- **Origem clicável:** "Venda #26" ou "Compra #22" na coluna Origem abre a venda ou a compra direto, sem passar pelos detalhes da conta.
- **De vendas e compras para as contas:** nos detalhes da venda, o card "Parcelas" virou "Contas a receber", igual ao card "Contas a pagar" da compra. Os dois têm o botão "Ver em contas a receber/pagar", que abre a tabela já filtrada só com as contas daquela venda ou compra (com um aviso e o botão "Ver todas"), e cada parcela abre os detalhes da conta.

### Filtro de período

- **Novo:** a opção "Mês anterior" (o mês passado inteiro) em todos os filtros de período, inclusive na Visão Geral, que compara com o mês antes dele.

### Problemas corrigidos

**1. Baixa parcial em contas a receber com a data do dia seguinte**
- **Antes:** uma baixa parcial feita à noite ficava registrada com a data do dia seguinte.
- **Por quê:** a data era tirada do relógio universal (UTC), que em Manaus já virou o dia às 20h.
- **Correção e hoje:** a data usa o dia de Manaus, como a baixa completa já fazia.

**2. "Total recebido/pago" ignorava pagamentos parciais**
- **Antes:** o cartão de resumo só somava contas totalmente baixadas; o que entrou em baixas parciais não aparecia.
- **Por quê:** a conta somava o valor das contas com status "Recebida/Paga".
- **Correção e hoje:** o cartão soma o que foi efetivamente recebido ou pago, inclusive as parciais.

**3. Contas canceladas não apareciam em lugar nenhum**
- **Antes:** a lista escondia as contas canceladas, sem como consultar.
- **Por quê:** a API removia as canceladas sempre.
- **Correção e hoje:** elas continuam fora da lista normal, mas aparecem ao filtrar o Status por "Cancelada".

**4. Conta a receber de R$ 0,00**
- **Antes:** era possível lançar uma conta a receber com valor zero.
- **Por quê:** a validação aceitava valor mínimo 0.
- **Correção e hoje:** o valor precisa ser maior que zero, como em contas a pagar.

**5. A lista carregava tudo e filtrava no navegador**
- **Antes:** a tela baixava todas as contas e todos os clientes/fornecedores para filtrar e mostrar os nomes, o que fica lento com muitos registros.
- **Por quê:** a API não tinha filtros nem devolvia o nome do cliente/fornecedor.
- **Correção e hoje:** filtros, ordenação e paginação rodam no servidor, que já devolve o nome.

## 📋 Tabelas, Visão Geral e dados antigos (novembro de 2026)

Ajustes feitos depois de conferir o sistema com os dados reais da DG Computer.

### Tabelas

**1. Era preciso rolar para o lado para ver as ações**
- **Antes:** em telas de notebook e monitores comuns (até uns 1500 px de largura), vendas, compras, contas a pagar e clientes ficavam mais largas que a tela, e o olho e a impressora só apareciam rolando para o lado.
- **Por quê:** cada coluna com filtro tinha uma largura mínima grande, o espaçamento entre colunas era largo e as colunas "M. Pagamento" e "Parcela" ficavam separadas.
- **Correção e hoje:** colunas mais compactas, o conteúdo da página alinhado com o topo, e a forma de pagamento junto com as parcelas numa coluna só ("Crediário 3x", "Boleto 2x"). Com a barra lateral aberta, todas as tabelas cabem a partir de 1440 px. Na exportação para Excel e PDF as colunas continuam separadas.

**2. Nome do produto cortado**
- **Antes:** nomes longos eram cortados com "…".
- **Correção e hoje:** o nome aparece inteiro, quebrando em mais de uma linha quando precisa.

**3. "+1" pouco visível**
- **Antes:** quando a venda ou a compra tinha mais de um produto, o "+1" era cinza claro e pequeno.
- **Correção e hoje:** o número fica em negrito com fundo mais forte, e ao passar o mouse aparecem os outros produtos separados por vírgula. Vale também para categoria e marca.

**4. A pesquisa por produto mostrava outro produto na coluna**
- **Antes:** ao pesquisar um produto, a venda aparecia na lista mas a coluna mostrava o primeiro produto dela, que podia ser outro.
- **Correção e hoje:** a coluna mostra o produto pesquisado, com o trecho buscado marcado.

**5. Links com aparência diferente em cada tela**
- **Antes:** em categorias e marcas o link era preto com uma setinha, e em contas a pagar e a receber era laranja sem setinha.
- **Correção e hoje:** todos os links para outro registro são laranja com a setinha: origem das contas, quantidade de produtos em categorias e marcas, e as parcelas nos detalhes da venda e da compra.

**Melhorias que vieram junto**
- Em clientes, a coluna Crediário usa o mesmo selo de Ativo/Inativo (verde "Habilitado", cinza "Desabilitado").
- Em categorias e marcas, o botão "Visualizar" foi tirado por enquanto.

### Visão Geral

**6. A página demorava e recarregava toda vez**
- **Antes:** a Visão Geral buscava vendas, contas, produtos e clientes de 15 em 15, um pedido depois do outro (77 pedidos com os dados atuais), e voltar para ela depois de um minuto buscava tudo de novo.
- **Correção e hoje:** os dados vêm de 100 em 100 e ao mesmo tempo (16 pedidos), ficam guardados por alguns minutos e só são buscados de novo quando algo muda (uma venda, uma compra, uma baixa) ou quando ficam velhos.

**7. Números zerados enquanto carregava**
- **Antes:** os indicadores, os gráficos e os alertas mostravam R$ 0,00 até os dados chegarem.
- **Correção e hoje:** esses pontos mostram um carregamento no lugar do número, e um aviso "Atualizando" aparece enquanto a página renova dados que já estavam na tela.

**8. Alertas da Visão Geral com número errado ou levando para a lista errada**
- **Antes:** "Pagamentos atrasados" mostrava sempre 0, mesmo com contas vencidas, e "Compras a pagar" abria contas a pagar em vez das compras. Ao chegar na lista, nada dizia que ela estava filtrada.
- **Por quê:** o alerta procurava um status "atrasado" que nenhuma conta tem (uma conta vencida continua "pendente", só que com vencimento no passado).
- **Correção e hoje:** "Pagamentos atrasados" conta as contas a pagar em aberto com vencimento passado e abre contas a pagar filtradas por "Vencida", um novo valor do filtro de Status (também em contas a receber). "Compras a pagar" abre as compras pendentes, e "Produtos sem estoque" conta só produtos ativos, como o estoque.

**9. Aviso de lista filtrada em todo atalho**
- **Antes:** só contas a receber e a pagar avisavam quando a lista vinha filtrada de uma venda ou compra.
- **Correção e hoje:** toda tabela aberta já filtrada por outra tela (alertas, produtos de uma categoria ou marca, contas de uma venda ou compra) mostra no topo "Mostrando só …" com o filtro e o botão "Ver tudo". O aviso se ajusta ao celular.

**10. "Últimas atividades" abria só a lista**
- **Antes:** clicar numa atividade (uma venda, uma compra, um cliente novo) abria a tabela inteira, e era preciso procurar o registro.
- **Correção e hoje:** a tabela abre já filtrada naquele registro, com o aviso "Mostrando só Venda #230" (ou o nome do cliente, fornecedor ou produto) e o botão "Ver tudo".

**11. Porcentagem dos indicadores confusa**
- **Antes:** a variação vinha como "+13.916%", com ponto separando o milhar, e parecia 13 com três casas decimais. Os cards de contas a receber e a pagar não diziam que ignoram o filtro de período.
- **Correção e hoje:** a variação usa vírgula e no máximo duas casas ("+13915,83%"), sem ponto de milhar, e diz exatamente com que dias compara: em "Mês atual", os mesmos dias do mês passado ("vs. 01/10 a 06/10"), e não o mês passado inteiro. Os cards de contas mostram "Todo o período" e, ao passar o mouse, explicam que somam todas as contas em aberto, de qualquer data.

### Dados antigos corrigidos

**12. Contas recebidas antes de 15/05 sem valor pago**
- **Antes:** 12 contas a receber marcadas como recebidas tinham "valor pago" zerado (R$ 12.911,04 no total), então o "Total recebido" ficava menor e o histórico dessas vendas não mostrava o pagamento.
- **Por quê:** em 15/05 o sistema passou a guardar quanto foi pago em cada conta, e as contas que já estavam recebidas ficaram com zero.
- **Correção e hoje:** as contas recebidas (e as pagas, em contas a pagar) passam a ter o valor pago igual ao valor da conta.

**13. Vendas pagas que continuavam pendentes**
- **Antes:** 3 vendas no crediário tinham todas as parcelas recebidas mas continuavam como pendentes.
- **Correção e hoje:** viram concluídas, com a conclusão no histórico.

## 🧱 Stack

- **Backend:** Laravel 13 (PHP 8.5), Fortify (autenticação), Sanctum (API com sessão por cookie)
- **Frontend:** React 19 + TypeScript via Inertia.js 3, TanStack Query, React Hook Form
- **UI:** Tailwind CSS 4, componentes no estilo shadcn/ui (Radix UI), Lucide icons
- **Rotas tipadas:** Laravel Wayfinder
- **Banco:** MySQL 8
- **Testes:** Pest 4

## 🗺️ Arquitetura em resumo

```
Inertia (rotas web)  ──►  páginas React (casca)
                               │
                               ▼  TanStack Query
API REST /api  ──►  Controller ─► FormRequest ─► Service ─► Repository ─► Model
                                             │
                                             └─► efeitos colaterais na mesma transação:
                                                 estoque · contas a receber · contas a pagar
```

- As páginas Inertia apenas renderizam a interface; **todos os dados vêm da API** (`routes/api.php`).
- As regras de negócio ficam nos **Services** (`app/Services`). Uma venda, por exemplo, movimenta o estoque e gera as parcelas a receber dentro de uma única transação.
- Mais detalhes para desenvolvimento em [`CLAUDE.md`](CLAUDE.md) e [`AGENTS.md`](AGENTS.md).

## 🚀 Rodando localmente

### Pré-requisitos

- PHP 8.5 + Composer. No Linux, a forma mais simples é o [Herd Lite](https://php.new): `/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"`
- Node.js 22 + pnpm
- Docker (para o MySQL)

### Setup

```bash
git clone https://github.com/daviPeter07/Operis-Saas.git
cd Operis-Saas

composer install
pnpm install

cp .env.example .env          # use DB_HOST=127.0.0.1 com o MySQL do Docker
php artisan key:generate

docker compose up -d mysql
php artisan migrate --seed
```

### Desenvolvimento

```bash
composer run dev   # servidor PHP + fila + Vite, tudo junto
```

Acesse **http://localhost:8000**.

## 🧪 Qualidade

```bash
DB_DATABASE=operis_test_main php artisan test --compact                  # suíte completa
DB_DATABASE=operis_test_main php artisan test --compact --filter="nome"  # um teste específico

vendor/bin/pint        # formatação PHP
pnpm lint              # ESLint
pnpm format            # Prettier
pnpm types:check       # TypeScript
composer run ci:check  # tudo acima de uma vez
```

> ⚠️ Os testes usam `RefreshDatabase` e **zeram o banco que estiver configurado**. Rode sempre com `DB_DATABASE=operis_test_main` (um banco só de testes no MySQL do Docker) para não apagar os dados de desenvolvimento, e nunca aponte o `.env` local para o banco de produção.

## 📦 Deploy

O deploy é **automático a cada push na `main`** via GitHub Actions (`.github/workflows/deploy-production-ftp.yml`):

1. O CI instala as dependências, gera o build do frontend e empacota tudo em um único `release.zip`.
2. O pacote é enviado por FTPS para a hospedagem (cPanel).
3. Um receptor protegido por token (`.github/deploy/receiver.php`) troca os arquivos, preserva `.env` e `storage/` e roda `migrate --force`, `config:cache`, `event:cache`, `view:cache` e `queue:restart`. As rotas não são cacheadas, porque o app roda na subpasta `/operis`.
4. Um healthcheck confirma que a aplicação está no ar.

Também é possível disparar manualmente: `gh workflow run deploy-production-ftp.yml`.

## 📄 Licença

MIT
