/**
 * ==========================================================================
 * FORMULÁRIO DE CATEGORIAS SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.categoria-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            const inputNome = document.getElementById('input-nome');
            if (inputNome && !inputNome.value.trim()) {
                e.preventDefault();
                alert('O nome da categoria não pode estar vazio.');
                inputNome.focus();
            }
        });
    }

    console.log("Formulário de categoria inicializado com sucesso.");
});