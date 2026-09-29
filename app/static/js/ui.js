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
                background: rgba(12, 10, 9, 0.78);
                backdrop-filter: blur(8px);
                display: grid;
                place-items: center;
                z-index: 9999;
                padding: 1rem;
                animation: aapmFadeIn 0.2s ease-out;
            }
            @keyframes aapmFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .app-confirm-dialog {
                width: min(460px, calc(100vw - 2rem));
                background: linear-gradient(145deg, rgba(28, 23, 21, 0.98), rgba(18, 14, 13, 0.98));
                border: 1px solid rgba(217, 119, 6, 0.45);
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(217, 119, 6, 0.12);
                overflow: hidden;
                animation: aapmScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes aapmScaleUp {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .app-confirm-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 1.25rem 1.25rem 0.75rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            .app-confirm-badge {
                display: inline-flex;
                align-items: center;
                padding: 0.42rem 0.85rem;
                border-radius: 999px;
                background: rgba(217, 119, 6, 0.15);
                border: 1px solid rgba(217, 119, 6, 0.3);
                color: #fbbf24;
                font-family: 'Space Grotesk', system-ui, sans-serif;
                font-size: 0.72rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-weight: 700;
            }
            .app-confirm-close {
                width: 2.25rem;
                height: 2.25rem;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.03);
                color: #a8a29e;
                font-size: 1.4rem;
                line-height: 1;
                cursor: pointer;
                display: grid;
                place-items: center;
                transition: all 0.2s ease;
            }
            .app-confirm-close:hover {
                background: rgba(239, 68, 68, 0.15);
                border-color: rgba(239, 68, 68, 0.4);
                color: #fca5a5;
            }
            .app-confirm-dialog h2 {
                margin: 0;
                padding: 1.25rem 1.25rem 0.5rem;
                color: #f5f5f4;
                font-family: 'Space Grotesk', system-ui, sans-serif;
                font-size: 1.4rem;
                font-weight: 700;
                letter-spacing: -0.02em;
            }
            .app-confirm-dialog p {
                margin: 0;
                padding: 0 1.25rem 1.5rem;
                color: #d6cdca;
                font-size: 0.98rem;
                line-height: 1.6;
            }
            .app-confirm-actions {
                display: flex;
                justify-content: flex-end;
                gap: 0.85rem;
                padding: 1rem 1.25rem 1.25rem;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid rgba(255, 255, 255, 0.04);
            }
            .app-confirm-cancel,
            .app-confirm-accept {
                border: none;
                border-radius: 12px;
                padding: 0.8rem 1.35rem;
                font-family: 'Space Grotesk', system-ui, sans-serif;
                font-size: 0.92rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .app-confirm-cancel {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #f5f5f4;
            }
            .app-confirm-cancel:hover {
                background: rgba(255, 255, 255, 0.09);
                border-color: rgba(255, 255, 255, 0.22);
            }
            .app-confirm-accept {
                background: linear-gradient(135deg, #d97706, #b45309);
                color: #ffffff;
                box-shadow: 0 4px 15px rgba(217, 119, 6, 0.35);
                border: 1px solid rgba(251, 191, 36, 0.2);
            }
            .app-confirm-accept:hover {
                transform: translateY(-2px);
                background: linear-gradient(135deg, #f59e0b, #d97706);
                box-shadow: 0 6px 20px rgba(217, 119, 6, 0.5);
            }
            .app-confirm-cancel:focus,
            .app-confirm-accept:focus,
            .app-confirm-close:focus {
                outline: 2px solid #fbbf24;
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