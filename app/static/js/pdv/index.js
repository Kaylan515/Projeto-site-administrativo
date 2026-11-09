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
    initPagamentoDinheiro();
    initPagamentoPix();
    document.querySelectorAll('.payment-amount').forEach(input => input.addEventListener('input', atualizarPagamentos));
    atualizarPagamentos();
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
    if (!carrinho.length) return;
    if (botaoElement.dataset.value === 'Dinheiro') { abrirPagamentoDinheiro(); return; }
    if (botaoElement.dataset.value === 'PIX') { abrirPagamentoPix(); return; }
    const field = [...document.querySelectorAll('.payment-amount')].find(input => input.dataset.method === botaoElement.dataset.value);
    field?.focus();
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
        atualizarPagamentos();
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
    btnFinalizar.disabled = true;

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

    const totalFinal = totalVendaCentavos() / 100;
    atualizarPagamentos();

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

    if (!atualizarPagamentos()) return;
    const dinheiro = lerPagamentos().valores.Dinheiro;
    if (dinheiro > 0 && (!cashPayment || cashPayment.portion !== dinheiro)) { abrirPagamentoDinheiro(); return; }
    const resumo = dinheiro > 0 ? `\nDinheiro: ${moedaBRL(dinheiro)}\nRecebido: ${moedaBRL(cashPayment.received)}\nTroco: ${moedaBRL(cashPayment.received - dinheiro)}` : '';
    window.showAppConfirm(`Total da venda: ${moedaBRL(totalVendaCentavos())}${resumo}\n\nDeseja finalizar esta venda?`, submeterVenda);
}

function submeterVenda() {
    if (!atualizarPagamentos()) return;
    const obsInput = document.getElementById('obs-input');
    const inputObs = document.getElementById('input-obs');
    if (obsInput && inputObs) {
        inputObs.value = obsInput.value;
    }

    document.getElementById('form-venda').submit();
}
// Cash values use integer cents so the displayed change has no floating-point residue.
function valorEmCentavos(value) {
    const normalized = String(value).trim().replace(/\s/g, '');
    if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(normalized) && !/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
    const grouped = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(normalized);
    const number = Number(normalized.includes(',') || grouped ? normalized.replace(/\./g, '').replace(',', '.') : normalized);
    const cents = Math.round(number * 100);
    return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}
function totalVendaCentavos() {
    const subtotal = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
    const discount = clienteAtual.associado ? descontoAssociadoPercent : 0;
    return Math.round(Math.max(0, subtotal * (1 - discount / 100)) * 100);
}
const moedaBRL = cents => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let cashTotal = 0;
let cashPayment = null;
function atualizarTroco() {
    const withChange = document.getElementById('cash-with-change').checked;
    const exact = document.getElementById('cash-without-change').checked;
    const input = document.getElementById('cash-change-amount');
    document.getElementById('cash-change-field').hidden = !withChange;
    input.disabled = !withChange;
    input.required = withChange;
    const change = exact ? 0 : valorEmCentavos(input.value);
    const pagamentos = lerPagamentos();
    const outros = pagamentos.pago - pagamentos.valores.Dinheiro;
    cashTotal = Math.max(0, totalVendaCentavos() - outros);
    const invalid = !pagamentos.valido || cashTotal <= 0 || (!exact && !withChange) || change === null || (withChange && change <= 0) || !Number.isSafeInteger(cashTotal + change);
    const error = document.getElementById('cash-error');
    error.hidden = !invalid || (!withChange && !exact) || (withChange && input.value.trim() === '');
    error.textContent = cashTotal <= 0 ? 'Não há saldo restante para pagar em dinheiro.' : 'Informe um valor de troco válido e maior que zero, ou selecione que não haverá troco.';
    document.getElementById('cash-confirm').disabled = invalid;
    return invalid ? null : cashTotal + change;
}
function abrirPagamentoDinheiro() {
    const pagamentos = lerPagamentos();
    cashTotal = Math.max(0, totalVendaCentavos() - (pagamentos.pago - pagamentos.valores.Dinheiro));
    document.getElementById('cash-total').textContent = moedaBRL(cashTotal);
    const change = cashPayment ? cashPayment.received - cashPayment.portion : null;
    document.getElementById('cash-with-change').checked = change !== null && change > 0;
    document.getElementById('cash-without-change').checked = change === 0;
    document.getElementById('cash-change-amount').value = change > 0 ? (change / 100).toFixed(2).replace('.', ',') : '';
    atualizarTroco();
    document.getElementById('cash-dialog').showModal();
    document.getElementById(change > 0 ? 'cash-change-amount' : 'cash-with-change').focus();
}
function initPagamentoDinheiro() {
    const dialog = document.getElementById('cash-dialog');
    if (!dialog) return;
    const cancel = () => dialog.close();
    document.getElementById('cash-close').addEventListener('click', cancel);
    document.getElementById('cash-cancel').addEventListener('click', cancel);
    document.getElementById('cash-change-amount').addEventListener('input', atualizarTroco);
    ['cash-with-change', 'cash-without-change'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            atualizarTroco();
            if (id === 'cash-with-change') document.getElementById('cash-change-amount').focus();
        });
    });
    document.getElementById('cash-form').addEventListener('submit', event => {
        event.preventDefault();
        const received = atualizarTroco();
        if (received === null) return;
        cashPayment = { portion: cashTotal, received };
        document.getElementById('payment-dinheiro').value = (cashTotal / 100).toFixed(2).replace('.', ',');
        dialog.close();
        atualizarPagamentos();
    });
}

function lerPagamentos() {
    const valores = {};
    let valido = true;
    document.querySelectorAll('.payment-amount').forEach(input => {
        const cents = input.value.trim() === '' ? 0 : valorEmCentavos(input.value);
        if (cents === null) valido = false;
        valores[input.dataset.method] = cents ?? 0;
    });
    const pago = Object.values(valores).reduce((sum, cents) => sum + cents, 0);
    return { valores, pago, valido: valido && Number.isSafeInteger(pago) };
}
function atualizarPagamentos() {
    const { valores, pago, valido } = lerPagamentos();
    const total = totalVendaCentavos();
    const restante = total - pago;
    const pixConfirmado = !valores.PIX || document.getElementById('input-pix-recebido').value === 'true';
    const fechado = carrinho.length > 0 && valido && restante === 0 && pixConfirmado;
    document.getElementById('payment-total').textContent = moedaBRL(total);
    document.getElementById('payment-paid').textContent = moedaBRL(pago);
    document.getElementById('payment-balance-label').textContent = restante < 0 ? 'Valor excedente' : 'Saldo restante';
    document.getElementById('payment-remaining').textContent = moedaBRL(Math.abs(restante));
    const summary = document.getElementById('cash-payment-summary');
    summary.hidden = !valores.Dinheiro;
    summary.textContent = cashPayment && valores.Dinheiro ? `Dinheiro: ${moedaBRL(valores.Dinheiro)} | Recebido: ${moedaBRL(cashPayment.received)} | Troco: ${moedaBRL(cashPayment.received - valores.Dinheiro)}` : '';
    const message = document.getElementById('payment-message');
    message.textContent = !pixConfirmado ? 'Confira o recebimento do PIX no banco antes de finalizar.' : !valido ? 'Informe valores monetários válidos.' : fechado ? 'Pagamento completo. Você pode finalizar.' : restante < 0 ? 'A soma excede o total. Ajuste os valores; o troco é informado na etapa de dinheiro.' : 'Informe os valores até quitar o saldo restante.';
    message.classList.toggle('is-complete', fechado);
    document.getElementById('btn-finalizar').disabled = !fechado;
    document.getElementById('input-pagamentos').value = JSON.stringify(valores);
    document.querySelectorAll('.pagamento-btn').forEach(button => {
        button.classList.toggle('selected', valores[button.dataset.value] > 0);
        button.setAttribute('aria-pressed', String(valores[button.dataset.value] > 0));
    });
    return fechado;
}

let pixGerado = null;
let pixRequest = null;
function invalidarPix() {
    pixRequest?.abort();
    pixGerado = null;
    document.getElementById('pix-code-area').hidden = true;
    document.getElementById('pix-received').checked = false;
    document.getElementById('pix-confirm').disabled = true;
}
function abrirPagamentoPix() {
    invalidarPix();
    const pagamentos = lerPagamentos();
    const remaining = Math.max(0, totalVendaCentavos() - (pagamentos.pago - pagamentos.valores.PIX));
    document.getElementById('pix-amount').value = (remaining / 100).toFixed(2).replace('.', ',');
    document.getElementById('pix-error').hidden = true;
    document.getElementById('pix-dialog').returnValue = '';
    document.getElementById('pix-dialog').showModal();
    gerarCodigoPix();
}
async function gerarCodigoPix() {
    invalidarPix();
    const amount = valorEmCentavos(document.getElementById('pix-amount').value);
    const pagamentos = lerPagamentos();
    const available = totalVendaCentavos() - (pagamentos.pago - pagamentos.valores.PIX);
    const error = document.getElementById('pix-error');
    error.hidden = true;
    if (!pagamentos.valido || amount === null || amount <= 0 || amount > available) {
        error.textContent = 'Informe um valor PIX maior que zero e dentro do saldo restante.';
        error.hidden = false;
        return;
    }
    const controller = new AbortController();
    pixRequest = controller;
    const button = document.getElementById('pix-generate');
    button.disabled = true;
    button.textContent = 'Gerando...';
    try {
        const response = await fetch('/pdv/pix/qr', {
            method: 'POST', body: new URLSearchParams({ valor_centavos: String(amount) }), signal: controller.signal
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('QR indisponivel');
        const data = await response.json();
        if (controller.signal.aborted || !document.getElementById('pix-dialog').open) return;
        pixGerado = data.valor_centavos;
        document.getElementById('pix-total').textContent = moedaBRL(pixGerado);
        document.getElementById('pix-qr-image').src = data.qr_code;
        document.getElementById('pix-copy-code').value = data.codigo;
        document.getElementById('pix-code-area').hidden = false;
    } catch (exc) {
        if (exc.name !== 'AbortError') {
            error.textContent = 'Não foi possível gerar o PIX. Confira a configuração ou tente novamente.';
            error.hidden = false;
        }
    } finally {
        if (pixRequest === controller) { button.disabled = false; button.textContent = 'Gerar QR Code'; }
    }
}
function initPagamentoPix() {
    const dialog = document.getElementById('pix-dialog');
    ['pix-close', 'pix-cancel'].forEach(id => document.getElementById(id).addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => {
        if (dialog.returnValue !== 'registrado') {
            document.getElementById('payment-pix').value = '';
            document.getElementById('input-pix-recebido').value = 'false';
            atualizarPagamentos();
        }
        invalidarPix();
    });
    document.getElementById('pix-amount').addEventListener('input', invalidarPix);
    document.getElementById('pix-generate').addEventListener('click', gerarCodigoPix);
    document.getElementById('pix-received').addEventListener('change', event => {
        document.getElementById('pix-confirm').disabled = !event.target.checked || pixGerado === null;
    });
    document.getElementById('pix-confirm').addEventListener('click', () => {
        if (pixGerado === null || !document.getElementById('pix-received').checked) return;
        document.getElementById('payment-pix').value = (pixGerado / 100).toFixed(2).replace('.', ',');
        document.getElementById('input-pix-recebido').value = 'true';
        atualizarPagamentos();
        dialog.close('registrado');
    });
    document.getElementById('pix-copy').addEventListener('click', async event => {
        const code = document.getElementById('pix-copy-code');
        try { await navigator.clipboard.writeText(code.value); event.target.textContent = 'Código copiado'; }
        catch { code.focus(); code.select(); event.target.textContent = 'Selecione e copie o código'; }
    });
}
