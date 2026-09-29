/**
 * ==========================================================================
 * DETALHE DO ARMÁRIO SCRIPT — AAPM SENAI
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

    console.log("Página de detalhe do armário inicializada com sucesso.");
});