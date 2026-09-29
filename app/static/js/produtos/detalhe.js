/**
 * ==========================================================================
 * PRODUTO DETALHE SCRIPT — AAPM SENAI
 * ==========================================================================
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        limparParametrosURL();
    });

    /**
     * Remove parâmetros de sucesso da URL (como ?editado=ok ou ?movimentacao=ok)
     * após 4 segundos para manter a barra de endereços limpa caso o utilizador atualize a página.
     */
    function limparParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('editado') || urlParams.has('movimentacao')) {
            setTimeout(() => {
                urlParams.delete('editado');
                urlParams.delete('movimentacao');
                
                const novaQuery = urlParams.toString();
                const novaURL = window.location.pathname + (novaQuery ? '?' + novaQuery : '');
                
                window.history.replaceState({}, document.title, novaURL);
            }, 4000);
        }
    }
})();