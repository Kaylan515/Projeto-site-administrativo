/**
 * ==========================================================================
 * PDV / CAIXA SCRIPT — AAPM SENAI
 * ==========================================================================
 */

let carrinho = [];
let clienteAtual = { id: 0, associado: false };
const DESCONTO_PCT = parseFloat(document.body.dataset.descontoAssociado) || 0;

// ── Adicionar produto ao carrinho ────────────────────────────
function adicionarAoCarrinho(card) {
    const id = parseInt(card.dataset.id);
    const nome = card.dataset.nome;
    const preco = parseFloat(card.dataset.preco);
    const estoque = parseInt(card.dataset.estoque);

    const existente = carrinho.find(i => i.produto_id === id);

    if (!Number.isFinite(preco) || estoque <= 0) return;

    if (existente) {
        if (existente.quantidade < existente.estoque_max) {
            existente.quantidade = Math.min(existente.quantidade + 1, existente.estoque_max);
        } else {
            alert(`Estoque máximo atingido: ${existente.estoque_max} unidade(s).`);
            return;
        }
    } else {
        carrinho.push({ produto_id: id, nome, preco, quantidade: 1, estoque_max: estoque });
    }

    renderizarCarrinho();
}

// ── Alterar quantidade ────────────────────────────────────────
function alterarQtd(produtoId, delta) {
    const item = carrinho.find(i => i.produto_id === produtoId);
    if (!item) return;

    item.quantidade += delta;

    if (item.quantidade <= 0) {
        removerItem(produtoId);
        return;
    }

    if (item.quantidade > item.estoque_max) {
        item.quantidade = item.estoque_max;
    }

    renderizarCarrinho();
}

function removerItem(produtoId) {
    carrinho = carrinho.filter(i => i.produto_id !== produtoId);
    renderizarCarrinho();
}

// ── Atualizar cliente selecionado ─────────────────────────────
function atualizarCliente(select) {
    const opt = select.options[select.selectedIndex];
    clienteAtual.id = parseInt(opt.value);
    clienteAtual.associado = opt.dataset.associado === 'true';

    const badge = document.getElementById('badge-desconto');
    badge.style.display = clienteAtual.associado ? 'inline-flex' : 'none';

    renderizarCarrinho();
}

// ── Renderizar lista do carrinho ──────────────────────────────
function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const vazio = document.getElementById('msg-vazio');
    const totais = document.getElementById('totais');
    const btnFinal = document.getElementById('btn-finalizar');

    if (carrinho.length === 0) {
        lista.innerHTML = '';
        lista.appendChild(vazio);
        vazio.style.display = 'flex';
        totais.style.display = 'none';
        btnFinal.disabled = true;
        return;
    }

    vazio.style.display = 'none';
    totais.style.display = 'block';
    btnFinal.disabled = false;

    lista.innerHTML = '';

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        const div = document.createElement('div');
        div.className = 'item-carrinho';
        div.innerHTML = `
            <div style="flex:1">
                <div class="item-nome">${item.nome}</div>
                <div class="item-preco-unit">
                    R$ ${item.preco.toFixed(2).replace('.', ',')} / un.
                </div>
            </div>
            <div class="item-qty-ctrl">
                <button type="button" class="qty-btn" onclick="alterarQtd(${item.produto_id}, -1)">−</button>
                <span class="qty-value">${item.quantidade}</span>
                <button type="button" class="qty-btn" onclick="alterarQtd(${item.produto_id}, +1)">+</button>
            </div>
            <div class="item-subtotal">
                R$ ${subtotal.toFixed(2).replace('.', ',')}
            </div>
            <button type="button" class="item-remover" onclick="removerItem(${item.produto_id})" title="Remover">×</button>
        `;
        lista.appendChild(div);
    });

    renderizarTotais();
}

// ── Calcular e exibir totais ──────────────────────────────────
function renderizarTotais() {
    const subtotal = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    const descontoValor = clienteAtual.associado ? subtotal * (DESCONTO_PCT / 100) : 0;
    const total = subtotal - descontoValor;

    const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');

    document.getElementById('val-subtotal').textContent = fmt(subtotal);
    document.getElementById('val-total').textContent = fmt(total);

    const linhaDesc = document.getElementById('linha-desconto');
    const labelDesc = document.getElementById('label-desconto');
    const valDesc = document.getElementById('val-desconto');

    if (clienteAtual.associado && descontoValor > 0) {
        linhaDesc.style.display = 'flex';
        labelDesc.textContent = `Desconto (${DESCONTO_PCT}%)`;
        valDesc.textContent = `− ${fmt(descontoValor)}`;
    } else {
        linhaDesc.style.display = 'none';
    }
}

// ── Submeter a venda ──────────────────────────────────────────
function finalizarVenda() {
    if (carrinho.length === 0) return;
    if (!window.confirm('Confirma o fechamento desta venda no sistema AAPM SENAI?')) return;

    document.getElementById('input-carrinho').value = JSON.stringify(carrinho.map(i => ({
        produto_id: i.produto_id,
        nome: i.nome,
        preco: i.preco,
        quantidade: i.quantidade,
    })));

    document.getElementById('input-cliente-id').value = clienteAtual.id;
    document.getElementById('input-obs').value = document.getElementById('obs-input').value;

    document.getElementById('form-venda').submit();
}

// ── Filtro de busca de produtos ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const buscaInput = document.getElementById('busca-produto');
    if (buscaInput) {
        buscaInput.addEventListener('input', function () {
            const termo = this.value.toLowerCase().trim();
            document.querySelectorAll('.produto-card').forEach(card => {
                const nome = card.dataset.nomeLower || '';
                card.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }
});