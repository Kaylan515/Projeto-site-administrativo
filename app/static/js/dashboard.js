(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const spotlight = document.getElementById('spotlight');
        let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderSpotlight() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            if (spotlight) {
                spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(renderSpotlight);
        }
        renderSpotlight();

        // Linhas de tabela clicáveis
        document.querySelectorAll('tbody tr').forEach(row => {
            const link = row.querySelector('.td-name');
            if (link) {
                row.style.cursor = 'pointer';
                row.addEventListener('click', (e) => {
                    if (e.target.tagName.toLowerCase() === 'a') return;
                    window.location.href = link.href;
                });
            }
        });
    });
})();