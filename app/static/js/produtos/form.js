/**
 * ==========================================================================
 * PRODUTO FORM SCRIPT — AAPM SENAI
 * Controla a exibição dinâmica do campo de variação.
 * ==========================================================================
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        setupVariacaoToggle();
    });

    function setupVariacaoToggle() {
        const seletorVariacao = document.getElementById('possui-variacao');
        const detalheVariacaoWrap = document.getElementById('detalhe-variacao-wrap');
        const inputVariacao = document.getElementById('input-variacao');

        if (!seletorVariacao || !detalheVariacaoWrap) return;

        const atualizarCampoVariacao = () => {
            if (seletorVariacao.value === 'sim') {
                detalheVariacaoWrap.style.display = 'flex';
            } else {
                detalheVariacaoWrap.style.display = 'none';
                if (inputVariacao) {
                    inputVariacao.value = ''; // Limpa o valor se alternar para 'não'
                }
            }
        };

        seletorVariacao.addEventListener('change', atualizarCampoVariacao);
        
        // Executa ao carregar para respeitar o estado inicial
        atualizarCampoVariacao();
    }
})();