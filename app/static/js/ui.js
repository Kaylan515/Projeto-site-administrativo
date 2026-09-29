/**
 * ==========================================================================
 * DESIGN SYSTEM GLOBAL SCRIPT — AAPM SENAI (UI INTERACTION)
 * ==========================================================================
 */

(() => {
    function mountShell() {
        const body = document.body;
        if (body.classList.contains('auth-page') || body.querySelector('.layout, .page-wrapper, .topbar, .cupom')) return;

        const shell = document.createElement('div');
        shell.className = 'app-shell';
        shell.innerHTML = '<header class="app-shell-header"><a class="app-shell-brand" href="/">AAPM <span>•</span> SENAI</a><nav class="app-shell-nav" aria-label="Navegação principal"><a href="/">Dashboard</a><a href="/produtos">Produtos</a><a href="/armarios">Armários</a><a href="/pdv">PDV</a></nav></header><main class="app-content"></main><footer class="app-shell-footer"><span><strong>AAPM SENAI</strong> · Gestão acadêmica e operacional</span><a href="/">Ir ao dashboard</a></footer>';

        const content = shell.querySelector('.app-content');
        [...body.childNodes].forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') return;
            if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
            content.append(node);
        });
        body.prepend(shell);
        shell.querySelectorAll('.app-shell-nav a').forEach((link) => {
            if (link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
        });
    }

    function ensureConfirmStyles() {
        if (document.getElementById('aapm-confirm-styles')) return;

        const style = document.createElement('style');
        style.id = 'aapm-confirm-styles';
        style.textContent = `
            .app-confirm-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(12, 10, 9, 0.72);
                backdrop-filter: blur(6px);
                display: grid;
                place-items: center;
                z-index: 9999;
                padding: 1rem;
            }
            .app-confirm-dialog {
                width: min(460px, calc(100vw - 2rem));
                background: rgba(24, 20, 18, 0.96);
                border: 1px solid rgba(217, 119, 6, 0.38);
                border-radius: 22px;
                box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45);
                overflow: hidden;
            }
            .app-confirm-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 1rem 1.1rem 0.75rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            .app-confirm-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.42rem 0.8rem;
                border-radius: 999px;
                background: rgba(217, 119, 6, 0.12);
                border: 1px solid rgba(217, 119, 6, 0.25);
                color: #d97706;
                font-size: 0.7rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-weight: 700;
            }
            .app-confirm-close {
                width: 2.15rem;
                height: 2.15rem;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: transparent;
                color: #a8a29e;
                font-size: 1.5rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .app-confirm-close:hover {
                background: rgba(255, 255, 255, 0.04);
                color: #f5f5f4;
            }
            .app-confirm-dialog h2 {
                margin: 0;
                padding: 1.2rem 1.2rem 0.4rem;
                color: #f5f5f4;
                font-family: 'Space Grotesk', system-ui, sans-serif;
                font-size: 1.35rem;
                font-weight: 700;
            }
            .app-confirm-dialog p {
                margin: 0;
                padding: 0 1.2rem 1.2rem;
                color: #d6cdca;
                font-size: 0.98rem;
                line-height: 1.6;
            }
            .app-confirm-actions {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
                padding: 0 1.2rem 1.2rem;
            }
            .app-confirm-cancel,
            .app-confirm-accept {
                border: none;
                border-radius: 12px;
                padding: 0.8rem 1.15rem;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
            }
            .app-confirm-cancel {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #f5f5f4;
            }
            .app-confirm-accept {
                background: linear-gradient(135deg, #d97706, #b45309);
                color: #fff;
                box-shadow: 0 14px 28px rgba(217, 119, 6, 0.28);
            }
            .app-confirm-cancel:hover,
            .app-confirm-accept:hover {
                transform: translateY(-1px);
                filter: brightness(1.05);
            }
            .app-confirm-cancel:focus,
            .app-confirm-accept:focus,
            .app-confirm-close:focus {
                outline: 2px solid rgba(217, 119, 6, 0.7);
                outline-offset: 2px;
            }
        `;
        document.head.append(style);
    }

    function showAppConfirm(message, onConfirm) {
        ensureConfirmStyles();
        const backdrop = document.createElement('div');
        backdrop.className = 'app-confirm-backdrop';
        backdrop.innerHTML = `
            <section class="app-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="app-confirm-title">
                <div class="app-confirm-header">
                    <span class="app-confirm-badge">AAPM SENAI</span>
                    <button type="button" class="app-confirm-close" aria-label="Fechar">×</button>
                </div>
                <h2 id="app-confirm-title">Confirmar ação</h2>
                <p>${message}</p>
                <div class="app-confirm-actions">
                    <button type="button" class="app-confirm-cancel">Cancelar</button>
                    <button type="button" class="app-confirm-accept">Confirmar</button>
                </div>
            </section>
        `;

        const closeButton = backdrop.querySelector('.app-confirm-close');
        const cancelButton = backdrop.querySelector('.app-confirm-cancel');
        const acceptButton = backdrop.querySelector('.app-confirm-accept');

        const dismiss = () => backdrop.remove();

        closeButton.addEventListener('click', dismiss);
        cancelButton.addEventListener('click', dismiss);
        acceptButton.addEventListener('click', () => {
            dismiss();
            if (typeof onConfirm === 'function') onConfirm();
        });

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) dismiss();
        });

        document.body.append(backdrop);
        acceptButton.focus();
    }

    function openConfirmation(form, message) {
        showAppConfirm(message, () => {
            form.classList.add('is-submitting');
            form.submit();
        });
    }

    function formatConfirmMessage(action) {
        const frase = action.trim();
        return `Confirma ${frase.toLowerCase()} no sistema AAPM SENAI?`;
    }

    window.showAppConfirm = showAppConfirm;

    document.addEventListener('DOMContentLoaded', () => {
        mountShell();
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button, .btn-primary, .btn-secondary');
            if (!target || target.disabled) return;

            const ripple = document.createElement('span');
            ripple.className = 'ui-ripple';
            const bounds = target.getBoundingClientRect();
            ripple.style.left = `${event.clientX - bounds.left}px`;
            ripple.style.top = `${event.clientY - bounds.top}px`;
            target.append(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });

        // Melhora a UX da paginação evitando cliques duplos
        document.querySelectorAll('.pagination a').forEach((link) => {
            link.addEventListener('click', () => {
                link.style.pointerEvents = 'none';
                link.style.opacity = '.7';
                link.setAttribute('aria-busy', 'true');
            });
        });

        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || form.method.toLowerCase() !== 'post') return;
            const action = form.getAttribute('action') || '';
            if (action.startsWith('/auth/') || action === '/pdv/finalizar') return;
            if (form.hasAttribute('onsubmit')) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const label = event.submitter?.textContent?.trim() || 'confirmar esta ação';
            openConfirmation(form, form.dataset.confirm || formatConfirmMessage(label));
        }, true);
    });
})();