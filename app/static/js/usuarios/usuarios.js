/**
 * ==========================================================================
 * USUÁRIOS SCRIPT — AAPM SENAI
 * Controla o spotlight interativo do cursor.
 * ==========================================================================
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        setupSpotlightEffect();
    });

    /**
     * Efeito de luz interativa do cursor (Spotlight SaaS)
     */
    function setupSpotlightEffect() {
        const spotlight = document.getElementById('spotlight');
        if (!spotlight) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderSpotlight() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;

            spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderSpotlight);
        }

        renderSpotlight();
    }
})();