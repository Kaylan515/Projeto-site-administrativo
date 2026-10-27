document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');
        const options = dropdown.querySelectorAll('.dropdown-option');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('ativo');
            });

            dropdown.classList.toggle('ativo');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const val = option.getAttribute('data-value');
                const text = option.textContent;

                selected.textContent = text;
                if (hiddenInput) {
                    hiddenInput.value = val;
                }

                options.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');

                dropdown.classList.remove('ativo');

                const form = document.getElementById('form-filtros');
                if (form) form.submit();
            });
        });
    });

    document.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('ativo'));
    });
});