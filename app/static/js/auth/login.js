/**
 * ==========================================================================
 * PÁGINA DE LOGIN SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Foco automático no campo de email caso esteja vazio
    const emailInput = document.getElementById('email');
    if (emailInput && !emailInput.value) {
        emailInput.focus();
    }

    // Feedback visual dinâmico ao submeter o formulário de login
    const loginForm = document.querySelector('.auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', () => {
            const btnPrimary = loginForm.querySelector('.btn-primary');
            if (btnPrimary) {
                btnPrimary.textContent = 'Entrando...';
                btnPrimary.style.opacity = '0.8';
            }
        });
    }

    console.log("Página de login inicializada com sucesso.");
});