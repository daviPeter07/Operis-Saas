# Quickstart: Table UI Components

## Validation Steps

Para validar a implementação, siga estes passos:

### 1. Teste de Tabela Comum

1. Acesse qualquer tela de tabela do sistema
2. Verifique se input de busca está presente
3. Digite um termo e verifique filtragem
4. Clique no ícone de filtro e verifique sidebar
5. Clique em "Criar" e verifique modal
6. Clique em "Importar" e verifique dialog
7. Clique em "Exportar" e verifique dropdown
8. Verifique coluna ações com ícones
9. Verifique visual zebra stripes
10. Navegue pela paginação

### 2. Teste de Relatórios

1. Acesse seção Relatórios no menu
2. Selecione cada opção de relatório
3. Verifique rota correta (/relatorios/...)
4. Verifique tabela com dados
5. Teste busca
6. Teste filtros
7. Teste paginação
8. Clique em "Baixar" e verifique opções
9. Baixe em Excel e PDF

### 3. Quick Demo Flow

```bash
# Acessar dashboard
/home -> verificar overview

# Navegar para equipe
/equipe -> verificar tabela com search, filtros, criar

# Acessar relatório
/relatorios/estoque-atual -> verificar tabela simples

# Exportar
-click Exportar -> selecionar PDF -> verificar download
```

## Expected Results

- Busca filtra dados em tempo real
- Sidebar de filtros abre à direita
- Criar abre modal com formulário
- Importar processa Excel/CSV corretamente
- Exportar gera arquivos válidos
- Ações abrem modais de details/edit
- Zebra stripes visível em todas as linhas
- Paginação funciona corretamente
- Relatórios têm rotas dedicadas
- Baixar gera Excel/PDF válido