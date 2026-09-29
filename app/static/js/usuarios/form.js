document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('button[type="submit"]');
    const nomeInput = document.querySelector('input[name="nome"]');

    // Foca automaticamente no campo de Nome se estiver vazio
    if (nomeInput && !nomeInput.value) {
        nomeInput.focus();
    }

    // Previne duplo envio (evita cliques repetidos no botão de salvar)
    if (form && submitBtn) {
        form.addEventListener('submit', () => {
            if (form.checkValidity()) {
                submitBtn.innerHTML = 'Salvando...';
                setTimeout(() => {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.7';
                    submitBtn.style.cursor = 'not-allowed';
                }, 10);
            }
        });
    }
});