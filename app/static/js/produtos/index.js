/**
 * ==========================================================================
 * PRODUTOS INDEX SCRIPT — AAPM SENAI
 * Limpeza automática de parâmetros de sucesso da URL após algumas segundos.
 * ==========================================================================
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        limparParametrosURL();
    });

    function limparParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('criado') || urlParams.has('desativado')) {
            setTimeout(() => {
                urlParams.delete('criado');
                urlParams.delete('desativado');
                
                const novaQuery = urlParams.toString();
                const novaURL = window.location.pathname + (novaQuery ? '?' + novaQuery : '');
                
                window.history.replaceState({}, document.title, novaURL);
            }, 4000);
        }
    }
})();