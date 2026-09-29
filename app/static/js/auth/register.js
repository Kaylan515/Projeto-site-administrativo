/**
 * ==========================================================================
 * PÁGINA DE REGISTO SCRIPT — AAPM SENAI
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

    // Foco automático no primeiro campo do formulário
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.focus();
    }

    // Feedback visual dinâmico ao submeter o formulário de registo
    const registerForm = document.querySelector('.auth-form');
    if (registerForm) {
        registerForm.addEventListener('submit', () => {
            const btnPrimary = registerForm.querySelector('.btn-primary');
            if (btnPrimary) {
                btnPrimary.textContent = 'A registar...';
                btnPrimary.style.opacity = '0.8';
            }
        });
    }

    console.log("Página de registo inicializada com sucesso.");
});