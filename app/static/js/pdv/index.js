// ── Estado Global do PDV ─────────────────────────────────────
let carrinho = [];
let clienteAtual = {
    id: 0,
    associado: false
};

// Obtém a percentagem de desconto configurada no body
const descontoAssociadoPercent = parseFloat(document.body.dataset.descontoAssociado || 0);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Dropdown Customizado de Clientes
    initCustomDropdown();

    // 2. Inicializar Filtro de Busca de Produtos
    initBuscaProdutos();
});

// ── 1. DROPDOWN CUSTOMIZADO DE CLIENTES ───────────────────────
function initCustomDropdown() {
    const dropdown = document.getElementById('cliente-dropdown');
    if (!dropdown) return;

    const selectedText = document.getElementById('dropdown-selected-text');
    const optionsList = document.getElementById('dropdown-options-list');
    const hiddenInput = document.getElementById('input-cliente-id');

    dropdown.querySelector('.dropdown-selected').addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('ativo');
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('ativo');
    });

    optionsList.addEventListener('click', (e) => {
        const option = e.target.closest('.dropdown-option');
        if (!option) return;

        optionsList.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedText.textContent = option.textContent.trim();

        const valorId = option.dataset.value;
        const isAssociado = option.dataset.associado === 'true';

        hiddenInput.value = valorId;
        clienteAtual.id = parseInt(valorId);
        clienteAtual.associado = isAssociado;

        const badge = document.getElementById('badge-desconto');
        if (badge) {
            badge.style.display = isAssociado ? 'block' : 'none';
        }

        renderizarCarrinho();
        dropdown.classList.remove('ativo');
    });
}

// ── 2. SELECIONAR FORMA DE PAGAMENTO (BOTÕES) ────────────────
function selecionarPagamento(botaoElement) {
    const botoes = document.querySelectorAll('.pagamento-btn');
    botoes.forEach(btn => btn.classList.remove('selected'));

    botaoElement.classList.add('selected');

    const formaPagamento = botaoElement.dataset.value;
    const inputPagamento = document.getElementById('input-pagamento');
    if (inputPagamento) {
        inputPagamento.value = formaPagamento;
    }
}

// ── 3. BUSCA / FILTRO DE PRODUTOS ─────────────────────────────
function initBuscaProdutos() {
    const inputBusca = document.getElementById('busca-produto');
    if (!inputBusca) return;

    inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.produto-card');

        cards.forEach(card => {
            const nomeLower = card.dataset.nomeLower || '';
            if (nomeLower.includes(termo)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ── 4. GESTÃO DO CARRINHO ─────────────────────────────────────
function adicionarAoCarrinho(cardElement) {
    const id = parseInt(cardElement.dataset.id);
    const nome = cardElement.dataset.nome;
    const preco = parseFloat(cardElement.dataset.preco);
    const estoque = parseInt(cardElement.dataset.estoque);

    if (estoque <= 0) {
        alert('Este produto está sem estoque.');
        return;
    }

    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        if (itemExistente.quantidade < estoque) {
            itemExistente.quantidade++;
        } else {
            alert('Quantidade máxima atingida para o estoque atual.');
        }
    } else {
        carrinho.push({
            id: id,
            nome: nome,
            preco: preco,
            quantidade: 1,
            estoque: estoque
        });
    }

    renderizarCarrinho();
}

function alterarQuantidade(id, delta) {
    const item = carrinho.find(i => i.id === id);
    if (!item) return;

    const novaQtd = item.quantidade + delta;

    if (novaQtd <= 0) {
        removerItem(id);
    } else if (novaQtd <= item.estoque) {
        item.quantidade = novaQtd;
        renderizarCarrinho();
    } else {
        alert('Estoque insuficiente.');
    }
}

function removerItem(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const listaContainer = document.getElementById('lista-carrinho');
    const msgVazio = document.getElementById('msg-vazio');
    const totaisContainer = document.getElementById('totais');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (carrinho.length === 0) {
        listaContainer.innerHTML = `
            <div class="carrinho-vazio" id="msg-vazio">
                <span class="carrinho-vazio-icon">🛒</span>
                Clique nos produtos para adicionar
            </div>
        `;
        totaisContainer.style.display = 'none';
        btnFinalizar.disabled = true;
        document.getElementById('input-carrinho').value = '';
        return;
    }

    let htmlItens = '';
    let subtotal = 0;

    carrinho.forEach(item => {
        const totalItem = item.preco * item.quantidade;
        subtotal += totalItem;

        htmlItens += `
            <div class="carrinho-item">
                <div class="carrinho-item-info">
                    <span class="carrinho-item-nome">${item.nome}</span>
                    <span class="carrinho-item-preco">R$ ${item.preco.toFixed(2)} un</span>
                </div>
                <div class="carrinho-item-controlo">
                    <button type="button" class="carrinho-item-btn" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button type="button" class="carrinho-item-btn" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                    <button type="button" class="btn-remover" onclick="removerItem(${item.id})">🗑️</button>
                </div>
            </div>
        `;
    });

    listaContainer.innerHTML = htmlItens;
    totaisContainer.style.display = 'block';
    btnFinalizar.disabled = false;

    let descontoValor = 0;
    const linhaDesconto = document.getElementById('linha-desconto');
    const labelDesconto = document.getElementById('label-desconto');
    const valDesconto = document.getElementById('val-desconto');

    if (clienteAtual.associado && descontoAssociadoPercent > 0) {
        descontoValor = subtotal * (descontoAssociadoPercent / 100);
        labelDesconto.textContent = `Desconto (${descontoAssociadoPercent}%)`;
        valDesconto.textContent = `- R$ ${descontoValor.toFixed(2)}`;
        linhaDesconto.style.display = 'flex';
    } else {
        linhaDesconto.style.display = 'none';
    }

    const totalFinal = Math.max(0, subtotal - descontoValor);

    document.getElementById('val-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('val-total').textContent = `R$ ${totalFinal.toFixed(2)}`;

    document.getElementById('input-carrinho').value = JSON.stringify(
        carrinho.map(item => ({
            produto_id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade
        }))
    );
}

// ── 5. FINALIZAR VENDA COM MODAL ESTILIZADO ───────────────────
function finalizarVenda() {
    if (carrinho.length === 0) {
        alert('O carrinho está vazio.');
        return;
    }

    const modal = document.getElementById('modal-confirmacao');
    const btnSim = document.getElementById('modal-btn-sim');
    const btnNao = document.getElementById('modal-btn-nao');

    if (!modal) {
        if (window.confirm('Deseja realmente finalizar esta venda?')) {
            submeterVenda();
        }
        return;
    }

    modal.classList.add('ativo');

    const aoConfirmar = () => {
        limparEventosModal();
        modal.classList.remove('ativo');
        submeterVenda();
    };

    const aoCancelar = () => {
        limparEventosModal();
        modal.classList.remove('ativo');
    };

    function limparEventosModal() {
        btnSim.removeEventListener('click', aoConfirmar);
        btnNao.removeEventListener('click', aoCancelar);
        modal.removeEventListener('click', foraModal);
    }

    const foraModal = (e) => {
        if (e.target === modal) aoCancelar();
    };

    btnSim.addEventListener('click', aoConfirmar);
    btnNao.addEventListener('click', aoCancelar);
    modal.addEventListener('click', foraModal);
}

function submeterVenda() {
    const obsInput = document.getElementById('obs-input');
    const inputObs = document.getElementById('input-obs');
    if (obsInput && inputObs) {
        inputObs.value = obsInput.value;
    }

    document.getElementById('form-venda').submit();
}