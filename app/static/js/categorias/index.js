/**
 * ==========================================================================
 * LISTAGEM DE CATEGORIAS SCRIPT — AAPM SENAI
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Gestão de confirmação inteligente baseada na quantidade de produtos vinculados
    const botoesDesativar = document.querySelectorAll('.btn-acao.desativar');

    botoesDesativar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const linha = botao.closest('tr');
            if (!linha) return;

            const nomeCelula = linha.querySelector('td');
            const badgeProdutos = linha.querySelector('.badge.produtos-count');

            const nomeCategoria = nomeCelula ? nomeCelula.textContent.trim() : 'esta categoria';
            const qtdProdutos = badgeProdutos ? parseInt(badgeProdutos.textContent.trim()) || 0 : 0;

            if (qtdProdutos > 0) {
                // Se houver produtos vinculados, intercepta o clique padrão e exibe o modal customizado AAPM SENAI
                e.preventDefault();
                const mensagem = `A categoria "${nomeCategoria}" está vinculada a ${qtdProdutos} produto(s). Confirma a desativação desta categoria no sistema AAPM SENAI?`;

                if (typeof window.showAppConfirm === 'function') {
                    window.showAppConfirm(mensagem, () => {
                        // Se o utilizador confirmar no modal personalizado, prossegue com a ação (submissão ou redirecionamento do link/botão)
                        if (botao.tagName === 'A') {
                            window.location.href = botao.href;
                        } else if (botao.form) {
                            botao.form.submit();
                        } else {
                            // Se for um link ou botão form-action customizado
                            const formParent = botao.closest('form');
                            if (formParent) formParent.submit();
                        }
                    });
                } else {
                    // Fallback de segurança caso o ui.js ainda não tenha carregado
                    if (confirm(mensagem)) {
                        if (botao.tagName === 'A') window.location.href = botao.href;
                    }
                }
            }
        });
    });

    console.log("Listagem de categorias inicializada com sucesso (AAPM SENAI).");
});