/**
 * ==========================================================================
 * PDV COMPROVANTE SCRIPT — AAPM SENAI
 * ==========================================================================
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // Opcional: focar o botão de impressão para facilitar caso o operador use teclado
        const btnPrint = document.querySelector('.btn-print');
        if (btnPrint) {
            btnPrint.focus();
        }
    });
})();