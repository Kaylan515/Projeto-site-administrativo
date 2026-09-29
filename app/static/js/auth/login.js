/**
 * ==========================================================================
 * PÁGINA DE LOGIN SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Efeito interativo do spotlight que segue o cursor do rato no fundo
    const spotlight = document.getElementById('spotlight');
    
    if (spotlight) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(217, 119, 6, 0.12), transparent 70%)`;
        });
    }

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
                btnPrimary.textContent = 'A entrar...';
                btnPrimary.style.opacity = '0.8';
            }
        });
    }

    console.log("Página de login inicializada com sucesso.");
});