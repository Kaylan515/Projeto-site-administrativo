/**
 * ==========================================================================
 * FORMULÁRIO DE ALUGUER SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Efeito interativo do spotlight que segue o cursor do rato no fundo com tom âmbar refinado
    const spotlight = document.getElementById('spotlight');
    
    if (spotlight) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(217, 119, 6, 0.14), transparent 70%)`;
        });
    }

    // Feedback visual ao submeter o formulário com tipografia Space Grotesk integrada
    const form = document.querySelector('.auth-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            const btnPrimary = form.querySelector('.btn-primary, button[type="submit"]');
            if (btnPrimary) {
                btnPrimary.textContent = 'A confirmar...';
                btnPrimary.style.opacity = '0.85';
                btnPrimary.style.pointerEvents = 'none';
            }
        });
    }

    console.log("Página de formulário de aluguer inicializada com sucesso (AAPM SENAI).");
});