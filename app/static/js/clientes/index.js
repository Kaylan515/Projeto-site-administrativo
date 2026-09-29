/**
 * ==========================================================================
 * LISTAGEM DE CLIENTES SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const filtrosForm = document.querySelector('.filtros-form');

    if (!filtrosForm) return;

    // Submete o formulário automaticamente ao alterar os seletores de filtro/ordenação
    const selectsAutoSubmit = filtrosForm.querySelectorAll('select[name="status"], select[name="ordenar_por"], select[name="direcao"], select[name="por_pagina"]');

    selectsAutoSubmit.forEach(select => {
        select.addEventListener('change', () => {
            filtrosForm.submit();
        });
    });

    const checkboxAssociados = filtrosForm.querySelector('input[name="apenas_associados"]');
    if (checkboxAssociados) {
        checkboxAssociados.addEventListener('change', () => {
            filtrosForm.submit();
        });
    }

    console.log("Gestão de clientes inicializada com sucesso.");
});