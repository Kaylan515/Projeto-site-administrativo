document.addEventListener('DOMContentLoaded', () => {
    const selectProduto = document.getElementById('select-produto');
    const inputQuantidade = document.getElementById('input-quantidade');
    const inputPreco = document.getElementById('input-preco');
    const infoEstoque = document.getElementById('info-estoque');
    const valorEstoque = document.getElementById('valor-estoque');
    const infoSubtotal = document.getElementById('info-subtotal');
    const valorSubtotal = document.getElementById('valor-subtotal');

    if (!selectProduto) return;

    // Ao selecionar produto: mostra estoque atual e preenche preço
    selectProduto.addEventListener('change', function () {
        const option = this.options[this.selectedIndex];
        const estoque = option.dataset.estoque;
        const preco = option.dataset.preco;

        if (estoque !== undefined && option.value !== "") {
            valorEstoque.textContent = estoque;
            infoEstoque.style.display = 'block';

            if (preco) {
                inputPreco.value = parseFloat(preco).toFixed(2);
            }
        } else {
            infoEstoque.style.display = 'none';
        }

        atualizarSubtotal();
    });

    // Atualiza o subtotal ao digitar quantidade ou preço
    function atualizarSubtotal() {
        const qtd = parseFloat(inputQuantidade.value) || 0;
        const preco = parseFloat(inputPreco.value) || 0;
        const total = qtd * preco;

        if (qtd > 0 && preco > 0) {
            valorSubtotal.textContent = total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            infoSubtotal.style.display = 'block';
        } else {
            infoSubtotal.style.display = 'none';
        }
    }

    inputQuantidade.addEventListener('input', atualizarSubtotal);
    inputPreco.addEventListener('input', atualizarSubtotal);
});