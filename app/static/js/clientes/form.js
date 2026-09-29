/**
 * ==========================================================================
 * FORMULÁRIO DE CLIENTES SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const telefoneInput = document.getElementById('input-telefone');

    if (telefoneInput) {
        // Formatação simples e automática para telefone brasileiro ao digitar
        telefoneInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);

            if (valor.length > 6) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
            } else if (valor.length > 2) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
            } else if (valor.length > 0) {
                valor = `(${valor}`;
            }

            e.target.value = valor;
        });
    }

    console.log("Formulário de cliente inicializado com sucesso.");
});