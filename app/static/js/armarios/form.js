/**
 * ==========================================================================
 * FORMULÁRIO DE CADASTRO/EDIÇÃO DE ARMÁRIO SCRIPT — AAPM SENAI
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

    // Feedback visual ao submeter o formulário
    const form = document.querySelector('.auth-form');
    if (form) {
        form.addEventListener('submit', () => {
            const btnPrimary = form.querySelector('.btn-primary');
            if (btnPrimary) {
                btnPrimary.textContent = 'A guardar...';
                btnPrimary.style.opacity = '0.8';
            }
        });
    }

    console.log("Página de formulário de armário inicializada com sucesso.");
});