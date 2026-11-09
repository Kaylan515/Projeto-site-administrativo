(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
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