const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app/static/js/pdv/index.js', 'utf8');
function setup() {
    const nodes = {};
    function get(id) {
        if (!nodes[id]) nodes[id] = {
            value: '', checked: false, hidden: false, open: false, returnValue: '',
            classList: { toggle() {} }, listeners: {},
            addEventListener(name, callback) { this.listeners[name] = callback; },
            showModal() { this.open = true; },
            close(value = '') { this.returnValue = value; this.open = false; this.listeners.close?.(); },
            focus() {}, select() {}
        };
        return nodes[id];
    }
    const fields = ['PIX','Dinheiro','Cart?o de D?bito','Cart?o de Cr?dito'].map((method, i) => {
        const field = get(['payment-pix','payment-dinheiro','payment-debito','payment-credito'][i]);
        field.dataset = { method }; return field;
    });
    const document = {
        body: { dataset: { descontoAssociado: '10' } }, addEventListener() {},
        getElementById: get, querySelectorAll: selector => selector === '.payment-amount' ? fields : []
    };
    const context = { document, AbortController, URLSearchParams, window: { showAppConfirm() {} }, navigator: {} };
    vm.createContext(context); vm.runInContext(source, context);
    vm.runInContext('carrinho = [{preco: 100, quantidade: 1}]; initPagamentoDinheiro(); initPagamentoPix()', context);
    return { context, get, fields, run: script => vm.runInContext(script, context) };
}
for (const [value, expected] of [['50,00',5000],['50.25',5025],['1.000,50',100050],['1.000',100000],['0',0],['',null],['-5',null],['abc',null],['10,999',null],['Infinity',null]]) {
    test(`conversao monetaria ${JSON.stringify(value)}`, () => {
        const { run } = setup(); assert.equal(run(`valorEmCentavos(${JSON.stringify(value)})`), expected);
    });
}
test('pagamento misto so libera com soma exata', () => {
    const { get, run } = setup();
    get('payment-debito').value = '40,00'; get('payment-credito').value = '60,00';
    assert.equal(run('atualizarPagamentos()'), true);
    get('payment-credito').value = '59,99'; assert.equal(run('atualizarPagamentos()'), false);
    get('payment-credito').value = '60,01'; assert.equal(run('atualizarPagamentos()'), false);
    get('payment-credito').value = 'abc'; assert.equal(run('atualizarPagamentos()'), false);
});
test('mudanca de desconto exige reajustar pagamentos', () => {
    const { get, run } = setup(); get('payment-debito').value = '100,00';
    assert.equal(run('atualizarPagamentos()'), true);
    run('clienteAtual.associado = true'); assert.equal(run('atualizarPagamentos()'), false);
    get('payment-debito').value = '90,00'; assert.equal(run('atualizarPagamentos()'), true);
});
test('troco preenche somente saldo em dinheiro e nao soma troco ao pagamento', () => {
    const { get, run } = setup(); get('payment-debito').value = '40,00';
    run('abrirPagamentoDinheiro()');
    assert.equal(run('atualizarTroco()'), null);
    get('cash-with-change').checked = true; get('cash-change-amount').value = '20,00';
    assert.equal(run('atualizarTroco()'), 8000);
    get('cash-form').listeners.submit({ preventDefault() {} });
    assert.equal(get('payment-dinheiro').value, '60,00');
    assert.equal(get('btn-finalizar').disabled, false);
});
test('sem troco aceita valor exato e rejeita troco negativo', () => {
    const { get, run } = setup(); run('abrirPagamentoDinheiro()');
    get('cash-with-change').checked = true; get('cash-change-amount').value = '-1';
    assert.equal(run('atualizarTroco()'), null);
    get('cash-with-change').checked = false; get('cash-without-change').checked = true;
    assert.equal(run('atualizarTroco()'), 10000);
    assert.equal(get('cash-change-amount').disabled, true);
});
test('cancelar dinheiro nao registra pagamento', () => {
    const { get, run } = setup(); run('abrirPagamentoDinheiro()');
    get('cash-cancel').listeners.click();
    assert.equal(get('payment-dinheiro').value, '');
});
test('PIX sem confirmacao nao libera a venda mesmo com soma exata', () => {
    const { get, run } = setup(); get('payment-pix').value = '100,00';
    assert.equal(run('atualizarPagamentos()'), false);
    get('input-pix-recebido').value = 'true'; assert.equal(run('atualizarPagamentos()'), true);
});
test('fechar PIX cancela valor e confirmacao', () => {
    const { get } = setup(); get('payment-pix').value = '100,00';
    get('input-pix-recebido').value = 'true';
    get('pix-close').listeners.click();
    assert.equal(get('payment-pix').value, '');
    assert.equal(get('input-pix-recebido').value, 'false');
    assert.equal(get('btn-finalizar').disabled, true);
});
test('PIX so registra apos QR gerado e recebimento conferido', async () => {
    const { get, context, run } = setup();
    get('pix-dialog').open = true; get('pix-amount').value = '100,00';
    context.fetch = async () => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ valor_centavos: 10000, codigo: 'codigo-teste', qr_code: 'data:image/svg+xml;base64,TESTE' }) });
    await context.gerarCodigoPix();
    assert.equal(get('pix-confirm').disabled, true);
    get('pix-confirm').listeners.click(); assert.equal(get('payment-pix').value, '');
    get('pix-received').checked = true;
    get('pix-received').listeners.change({ target: get('pix-received') });
    assert.equal(get('pix-confirm').disabled, false);
    get('pix-confirm').listeners.click();
    assert.equal(get('payment-pix').value, '100,00');
    assert.equal(get('input-pix-recebido').value, 'true');
    assert.equal(run('atualizarPagamentos()'), true);
});
test('falha de rede PIX nao libera confirmacao', async () => {
    const { get, context } = setup();
    get('pix-dialog').open = true; get('pix-amount').value = '100,00';
    context.fetch = async () => { throw new Error('offline'); };
    await context.gerarCodigoPix();
    assert.equal(get('pix-error').hidden, false);
    assert.equal(get('pix-confirm').disabled, true);
    assert.equal(get('pix-generate').disabled, false);
});
