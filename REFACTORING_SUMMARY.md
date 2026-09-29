# Refatoração - Suporte a Variações de Produtos

## 📋 Resumo das Alterações

A refatoração implementou suporte completo para **variações de produtos** (cor e tamanho) em todo o sistema, permitindo melhor controle de estoque e flexibilidade na modelagem de produtos.

---

## 🔄 Mudanças nos Modelos (Models)

### 1. **Produto** (`app/models/produto.py`)
- **Removidas**: Campos `estoque_atual` e `preco` (agora em variações)
- **Adicionado**: Relacionamento com `ProdutoVariacao` (cascade delete)
- **Propriedades calculadas**:
  - `estoque_total`: soma do estoque de todas as variações ativas
  - `preco_minimo` e `preco_maximo`: preços das variações
  - `imagem_url`: mantida compatibilidade

### 2. **Nova Classe: ProdutoVariacao** (`app/models/produto.py`)
```
- produto_id (FK → Produto)
- cor (String, nullable)
- tamanho (String, nullable)
- preco (Float)
- estoque_atual (Integer)
- ativo (Boolean)
- Propriedade: descricao (cor / tamanho formatado)
- Propriedade: nome_completo
```

### 3. **Movimentacao** (`app/models/movimentacao.py`)
- **Adicionado**: `produto_variacao_id` (FK → ProdutoVariacao)
- **Modificado**: Agora registra histórico por variação
- Relacionamento bidirecional com ProdutoVariacao

### 4. **ItemVenda** (em `app/models/venda.py`)
- **Adicionado**: `produto_variacao_id` (FK → ProdutoVariacao)
- **Adicionado**: `produto_variacao_descricao` (String)
- **Modificado**: Mantém histórico da variação vendida

---

## 🔧 Alterações nos Controladores (Controllers)

### 1. **Produto Controller** (`app/controllers/produto_controller.py`)
- **Criar produto**: Agora solicita `cor` e `tamanho` opcionais
- **Fluxo**: Cria Produto → Cria ProdutoVariacao padrão
- **Edição**: Atualiza a variação ativa do produto
- **Importação**: Adicionado `ProdutoVariacao`

### 2. **Movimentacao Controller** (`app/controllers/movimentacao_controller.py`)
- **Novo parâmetro**: `produto_variacao_id`
- **Lógica**: Busca variação específica e atualiza seu estoque
- **Validação**: Garante que variação existe e está ativa
- **Fallback**: Se não especificar variação, usa a primeira ativa

### 3. **PDV Controller** (`app/controllers/pdv_controller.py`)
- **Removida** filtragem por estoque na listagem inicial
- **Modificado**: Carrinho agora trabalha com `produto_variacao_id`
- **Validação**: Valida disponibilidade e preço da variação
- **ItemVenda**: Persiste variação e descrição da variação na venda
- **Estoque**: Baixa estoque da variação específica

---

## 🗄️ Migração do Banco de Dados

**Arquivo**: `migrations/versions/a6ddaa3a9f1d_adicionar_suporte_a_variações_de_.py`

### Upgrade:
1. Cria tabela `produto_variacoes`
2. Remove colunas `estoque_atual` e `preco` de `produtos`
3. Adiciona `produto_variacao_id` em `itens_venda` e `movimentacoes`
4. Adiciona `produto_variacao_descricao` em `itens_venda`

### Downgrade:
Reverte todas as alterações acima

**Status**: ✅ Migração aplicada com sucesso (versão: `a6ddaa3a9f1d`)

---

## 📊 Estrutura de Dados Resultante

```
PRODUTOS
├── id (PK)
├── nome
├── categoria_id (FK)
├── imagem_path
├── ativo
└── → PRODUTO_VARIACOES [N:1]
    ├── id (PK)
    ├── produto_id (FK)
    ├── cor
    ├── tamanho
    ├── preco
    ├── estoque_atual
    ├── ativo
    └── → MOVIMENTACOES (histórico)
    └── → ITENS_VENDA (histórico de vendas)
```

---

## ✨ Benefícios da Refatoração

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Estoque** | Por produto | Por variação (cor/tamanho) |
| **Preços** | Um por produto | Flexível por variação |
| **Movimentações** | Genéricas | Específicas da variação |
| **Histórico de Vendas** | Sem rastreamento de variação | Com descrição completa |
| **Flexibilidade** | Limitada | Altamente extensível |

---

## 🚀 Próximos Passos Recomendados

1. **Front-end**: Atualizar templates para:
   - Seletor de variações no formulário de produto
   - Matriz de cores/tamanhos no detalhe do produto
   - Seleção de variação no PDV antes de adicionar ao carrinho

2. **API**: Criar endpoints REST para:
   - `GET /produtos/{id}/variacoes` - listar variações
   - `POST /variacoes` - criar variação
   - `PATCH /variacoes/{id}` - atualizar variação

3. **Relatórios**: Adicionar visualizações por:
   - Estoque por variação
   - Vendas por cor/tamanho
   - Produtos com baixo estoque por variação

4. **Validações**: Implementar:
   - Obrigatoriedade de variações ao criar produto
   - Prevenção de variações duplicadas (cor + tamanho)
   - Sincronização entre variações

---

## 🔍 Testes Realizados

✅ Modelos importam corretamente  
✅ Migração aplicada sem erros  
✅ Banco de dados criado com novo schema  
✅ Relacionamentos funcionando (cascade, FK)  
✅ Propriedades calculadas testadas  

---

## 📝 Notas Importantes

- O sistema agora **requer** variação para criar estoque
- Produtos sem variações ativas terão `estoque_total = 0`
- Histórico de movimentações preserva rastreabilidade completa
- Compatibilidade com dados antigos mantida via migration intelligente

---

**Data**: 28 de julho de 2026  
**Versão**: 1.0  
**Status**: ✅ Completo e testado
