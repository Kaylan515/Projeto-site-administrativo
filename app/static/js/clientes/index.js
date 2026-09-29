/**
 * ==========================================================================
 * GESTÃO DE CLIENTES SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initClientesDropdowns();
});

function initClientesDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const selectedText = dropdown.querySelector('.dropdown-selected');
        const optionsList = dropdown.querySelector('.dropdown-options');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');

        if (!selectedText || !optionsList) return;

        // Abrir/Fechar ao clicar no seletor visível
        selectedText.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Fecha todos os outros dropdowns abertos
            dropdowns.forEach(other => {
                if (other !== dropdown) other.classList.remove('ativo');
            });

            // Alterna o estado do atual
            dropdown.classList.toggle('ativo');
        });

        // Selecionar uma opção da lista
        optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (!option) return;

            // Remove a seleção anterior e marca a nova
            optionsList.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Atualiza o texto visível com o valor escolhido
            selectedText.textContent = option.textContent.trim();
            
            // Atualiza o valor do input hidden para enviar no formulário GET
            if (hiddenInput) {
                hiddenInput.value = option.dataset.value;
            }

            // Fecha o menu dropdown
            dropdown.classList.remove('ativo');
        });
    });

    // Fecha todos os dropdowns ao clicar fora da área dos filtros
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => dropdown.classList.remove('ativo'));
    });
}