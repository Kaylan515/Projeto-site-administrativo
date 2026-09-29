/**
 * ==========================================================================
 * HISTÓRICO DE MOVIMENTAÇÕES SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const filtrosForm = document.querySelector('.filtros-form');
    
    if (!filtrosForm) return;

    // Opcional: Submeter o formulário automaticamente ao alterar selects de ordenação ou paginação
    const selectsAutoSubmit = filtrosForm.querySelectorAll('select[name="ordenar_por"], select[name="direcao"], select[name="por_pagina"], select[name="tipo"], select[name="produto_id"]');

    selectsAutoSubmit.forEach(select => {
        select.addEventListener('change', () => {
            filtrosForm.submit();
        });
    });

    console.log("Página de histórico de movimentações inicializada com sucesso.");
});