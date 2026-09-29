/**
 * ==========================================================================
 * PDV HISTÓRICO SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos os dropdowns customizados do histórico
    initAllCustomDropdowns();
});

function initAllCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const selectedText = dropdown.querySelector('.dropdown-selected');
        const optionsList = dropdown.querySelector('.dropdown-options');
        const hiddenInputId = dropdown.id.replace('dropdown-', 'input-');
        
        // Mapeamento especial para o ID do input de cliente
        let hiddenInput;
        if (dropdown.id === 'dropdown-cliente') {
            hiddenInput = document.getElementById('input-cliente-id');
        } else if (dropdown.id === 'dropdown-ordenar') {
            hiddenInput = document.getElementById('input-ordenar');
        } else if (dropdown.id === 'dropdown-direcao') {
            hiddenInput = document.getElementById('input-direcao');
        } else if (dropdown.id === 'dropdown-por-pagina') {
            hiddenInput = document.getElementById('input-por-pagina');
        }

        // Abrir/Fechar ao clicar no seletor
        selectedText.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Fecha outros dropdowns abertos
            dropdowns.forEach(other => {
                if (other !== dropdown) other.classList.remove('ativo');
            });

            dropdown.classList.toggle('ativo');
        });

        // Selecionar uma opção
        optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (!option) return;

            optionsList.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            selectedText.textContent = option.textContent.trim();
            
            const valor = option.dataset.value;
            if (hiddenInput) {
                hiddenInput.value = valor;
            }

            dropdown.classList.remove('ativo');
        });
    });

    // Fechar ao clicar fora de qualquer dropdown
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => dropdown.classList.remove('ativo'));
    });
}