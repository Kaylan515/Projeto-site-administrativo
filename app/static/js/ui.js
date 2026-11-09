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

    function mountNavigation() {
        const body = document.body;
        const path = window.location.pathname;
        if (path.startsWith('/auth/') || path === '/welcome' || path === '/erro' || body.classList.contains('auth-page') || body.querySelector('.cupom')) return;
        const existingSidebar = body.querySelector('.sidebar');
        ensureNavigationStyles();
        if (existingSidebar) {
            mountSidebarToggle(existingSidebar, existingSidebar.closest('.layout'));
            return;
        }

        const nav = document.createElement('nav');
        nav.className = 'aapm-global-nav';
        nav.setAttribute('aria-label', 'Navegação principal');
        nav.innerHTML = '<div class="nav-brand-row"><span class="brand">AAPM · SENAI</span><button class="aapm-nav-toggle" type="button" aria-expanded="true" aria-label="Fechar menu"><span aria-hidden="true">×</span></button></div><a href="/">Dashboard</a><a href="/produtos">Produtos</a><a href="/categorias">Categorias</a><a href="/movimentacoes">Movimentações</a><a href="/armarios">Armários</a><a href="/clientes">Clientes</a><a href="/pdv">Ponto de venda</a><a href="/pdv/historico">Histórico de vendas</a><a href="/pdv/extrato">Extrato</a><a href="/usuarios">Usuários</a><a href="/auth/logout">Sair</a>';
        nav.querySelectorAll('a').forEach((link) => {
            const matches = [...nav.querySelectorAll('a')].filter((item) => item.pathname === path || (item.pathname !== '/' && path.startsWith(item.pathname + '/')));
            const active = matches.sort((a, b) => b.pathname.length - a.pathname.length)[0];
            if (link === active) link.setAttribute('aria-current', 'page');
        });
        body.classList.add('aapm-with-nav');
        body.prepend(nav);
        mountSidebarToggle(nav, null);
    }

    function ensureNavigationStyles() {
        if (document.getElementById('aapm-navigation-styles')) return;
        const style = document.createElement('style');
        style.id = 'aapm-navigation-styles';
        style.textContent = `
            .aapm-global-nav { --nav-bg:rgba(24,20,18,.96); --nav-surface:rgba(33,27,26,.8); --nav-border:rgba(68,54,51,.55); --nav-amber:#d97706; --nav-amber-bright:#f59e0b; --nav-text:#d6cdca; position:fixed; z-index:1000; inset:0 auto 0 0; display:flex; flex-direction:column; gap:4px; width:260px; padding:22px 12px; overflow-y:auto; color:#f5f5f4; background:var(--nav-bg); border-right:1px solid var(--nav-border); box-shadow:12px 0 36px rgba(0,0,0,.16); backdrop-filter:blur(14px); font:500 14px 'DM Sans',system-ui,sans-serif; transition:width .22s ease; }
            .nav-brand-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 8px 16px 12px; margin-bottom:9px; border-bottom:1px solid var(--nav-border); }
            .aapm-global-nav .brand { min-width:0; color:var(--nav-amber-bright); font:700 19px 'Space Grotesk',system-ui,sans-serif; letter-spacing:-.025em; white-space:nowrap; }
            .aapm-global-nav a { display:block; padding:10px 14px; border:1px solid transparent; border-radius:10px; color:var(--nav-text); text-decoration:none; transition:background .18s ease,color .18s ease,border-color .18s ease,transform .18s ease; }
            .aapm-global-nav a:hover { transform:translateX(2px); color:#f5f5f4; background:var(--nav-surface); }
            .aapm-global-nav a[aria-current='page'] { color:var(--nav-amber-bright); background:rgba(217,119,6,.13); border-color:rgba(217,119,6,.38); font-weight:600; }
            .sidebar { background:linear-gradient(180deg,rgba(24,20,18,.88),rgba(18,14,13,.97)); border-right-color:rgba(217,119,6,.22); box-shadow:12px 0 36px rgba(0,0,0,.14); }
            .sidebar-nav .nav-link { border:1px solid transparent; transition:background .18s ease,color .18s ease,border-color .18s ease,transform .18s ease; }
            .sidebar-nav .nav-link:hover { border-color:rgba(217,119,6,.18); }
            .sidebar-nav .nav-link.active { color:#f59e0b; background:rgba(217,119,6,.13); border-color:rgba(217,119,6,.38); }
            .topbar { background:linear-gradient(110deg,rgba(24,20,18,.97),rgba(33,27,26,.92)); border-bottom:1px solid rgba(217,119,6,.28); box-shadow:0 8px 28px rgba(0,0,0,.18); }
            .topbar-title { color:#f5f5f4; font-family:'Space Grotesk',system-ui,sans-serif; }
            .topbar-links a { padding:8px 11px; border:1px solid transparent; border-radius:9px; transition:background .18s ease,color .18s ease,border-color .18s ease; }
            .topbar-links a:hover,.topbar-links a[aria-current='page'] { color:#fbbf24; background:rgba(217,119,6,.13); border-color:rgba(217,119,6,.3); }
            .aapm-nav-toggle { position:relative; isolation:isolate; display:grid; place-items:center; flex:0 0 34px; width:34px; height:34px; padding:0; border:1px solid rgba(245,158,11,.7); border-radius:50%; color:#fde68a; background:linear-gradient(145deg,rgba(217,119,6,.35),rgba(120,53,15,.48)); box-shadow:0 0 0 3px rgba(217,119,6,.10),inset 0 1px rgba(255,255,255,.14),0 5px 14px rgba(0,0,0,.3); cursor:pointer; transition:transform .2s ease,box-shadow .2s ease,background .2s ease; }
            .aapm-nav-toggle span { font:500 22px/1 'DM Sans',system-ui,sans-serif; }
            .aapm-nav-toggle:hover { transform:rotate(-8deg) scale(1.07); background:linear-gradient(145deg,rgba(245,158,11,.5),rgba(180,83,9,.6)); box-shadow:0 0 0 4px rgba(217,119,6,.15),0 0 18px rgba(217,119,6,.3); }
            .aapm-nav-toggle:focus-visible { outline:2px solid #fbbf24; outline-offset:4px; }
            .sidebar-brand-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
            .sidebar-brand-row .aapm-nav-toggle { position:relative; isolation:isolate; display:grid; place-items:center; flex:0 0 34px; width:34px; height:34px; padding:0; border:1px solid rgba(245,158,11,.7); border-radius:50%; color:#fde68a; background:linear-gradient(145deg,rgba(217,119,6,.35),rgba(120,53,15,.48)); box-shadow:0 0 0 3px rgba(217,119,6,.10),inset 0 1px rgba(255,255,255,.14),0 5px 14px rgba(0,0,0,.3); cursor:pointer; transition:transform .2s ease,box-shadow .2s ease,background .2s ease; }
            .sidebar-brand-row .aapm-nav-toggle span { font:500 22px/1 'DM Sans',system-ui,sans-serif; }
            .sidebar-brand-row .aapm-nav-toggle:hover { transform:rotate(-8deg) scale(1.07); box-shadow:0 0 0 4px rgba(217,119,6,.15),0 0 18px rgba(217,119,6,.3); }
            .sidebar-brand-row .aapm-nav-toggle:focus-visible { outline:2px solid #fbbf24; outline-offset:4px; }
            .layout.sidebar-collapsed { grid-template-columns:76px minmax(0,1fr); }
            body.aapm-nav-collapsed .sidebar { overflow:hidden; }
            body.aapm-nav-collapsed .sidebar-logo { padding-inline:8px; text-align:center; }
            body.aapm-nav-collapsed .sidebar-logo .logo-tag,body.aapm-nav-collapsed .sidebar-logo .logo-sub,body.aapm-nav-collapsed .sidebar-brand-row .logo-name,body.aapm-nav-collapsed .sidebar-footer { display:none; }
            body.aapm-nav-collapsed .sidebar-brand-row { justify-content:center; }
            body.aapm-nav-collapsed .sidebar-nav .nav-section { display:none; }
            body.aapm-nav-collapsed .sidebar-nav .nav-link { justify-content:center; padding:10px 4px; overflow:hidden; font-size:0; }
            body.aapm-nav-collapsed .sidebar-nav .nav-link .icon { font-size:16px; }
            body.aapm-with-nav { padding-left:260px !important; }
            body.aapm-with-nav.aapm-nav-collapsed { padding-left:76px !important; }
            body.aapm-nav-collapsed .aapm-global-nav { width:76px; padding-inline:9px; }
            body.aapm-nav-collapsed .aapm-global-nav .nav-brand-row { justify-content:center; padding:0 0 14px; }
            body.aapm-nav-collapsed .aapm-global-nav .brand { display:none; }
            body.aapm-nav-collapsed .aapm-global-nav a { overflow:hidden; padding:10px 4px; text-align:center; font-size:0; }
            body.aapm-nav-collapsed .aapm-global-nav a::after { display:block; font-size:17px; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/']::after { content:'⌂'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/produtos']::after { content:'▦'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/categorias']::after { content:'▤'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/movimentacoes']::after { content:'▤'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/armarios']::after { content:'▣'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/clientes']::after { content:'♙'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/pdv']::after { content:'▣'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/pdv/historico']::after { content:'◷'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/pdv/extrato']::after { content:'≡'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/usuarios']::after { content:'♙'; }
            body.aapm-nav-collapsed .aapm-global-nav a[href='/auth/logout']::after { content:'⏻'; }
            @media(max-width:1200px) and (min-width:761px) { .aapm-global-nav { width:230px; } body.aapm-with-nav { padding-left:230px !important; } }
            @media(max-width:760px) {
                .aapm-global-nav { inset:0 0 auto; width:100%; padding:8px 12px; flex-direction:row; align-items:center; overflow-x:auto; overflow-y:hidden; white-space:nowrap; border-right:0; border-bottom:1px solid var(--nav-border); box-shadow:0 10px 28px rgba(0,0,0,.24); }
                .nav-brand-row { flex:0 0 auto; padding:0 10px 0 2px; margin:0; border:0; }
                .aapm-global-nav .brand { font-size:16px; }
                .aapm-global-nav a { flex:0 0 auto; padding:8px 10px; }
                .layout.sidebar-collapsed { display:block; }
                body.aapm-nav-collapsed .sidebar { padding:8px 0; }
                body.aapm-nav-collapsed .sidebar-logo { display:flex; justify-content:flex-end; padding:0 12px 8px; border:0; }
                body.aapm-nav-collapsed .sidebar-brand-row { display:flex; }
                body.aapm-nav-collapsed .sidebar-logo .aapm-nav-toggle { display:grid; }
                body.aapm-nav-collapsed .sidebar-nav { display:none; }
                body.aapm-with-nav,body.aapm-with-nav.aapm-nav-collapsed { padding:58px 0 0 !important; }
                body.aapm-nav-collapsed .aapm-global-nav { width:100%; padding:8px 12px; }
                body.aapm-nav-collapsed .aapm-global-nav .nav-brand-row { padding:0 10px 0 2px; }
                body.aapm-nav-collapsed .aapm-global-nav .brand { display:inline; }
                body.aapm-nav-collapsed .aapm-global-nav a { display:none; }
            }
            @media(max-width:420px) { .aapm-global-nav { padding:6px 8px; } .aapm-global-nav .brand { font-size:14px; } .aapm-global-nav a { padding:7px 8px; font-size:12px; } .aapm-nav-toggle { flex-basis:32px; width:32px; height:32px; } }
        `;
        document.head.append(style);
    }

    function mountSidebarToggle(sidebar, layout) {
        let button = sidebar.querySelector('.aapm-nav-toggle');
        if (!button) {
            button = document.createElement('button');
            button.className = 'aapm-nav-toggle';
            button.type = 'button';
        }
        const collapsed = localStorage.getItem('aapm-nav-collapsed') === 'true';
        button.setAttribute('aria-expanded', String(!collapsed));
        button.setAttribute('aria-label', collapsed ? 'Abrir menu' : 'Fechar menu');
        button.innerHTML = `<span aria-hidden="true">${collapsed ? '☰' : '×'}</span>`;
        button.addEventListener('click', () => {
            const isCollapsed = document.body.classList.toggle('aapm-nav-collapsed');
            if (layout) layout.classList.toggle('sidebar-collapsed', isCollapsed);
            button.setAttribute('aria-expanded', String(!isCollapsed));
            button.setAttribute('aria-label', isCollapsed ? 'Abrir menu' : 'Fechar menu');
            button.innerHTML = `<span aria-hidden="true">${isCollapsed ? '☰' : '×'}</span>`;
            localStorage.setItem('aapm-nav-collapsed', String(isCollapsed));
        });
        if (layout) {
            layout.classList.toggle('sidebar-collapsed', collapsed);
            document.body.classList.toggle('aapm-nav-collapsed', collapsed);
            const logo = sidebar.querySelector('.sidebar-logo');
            const name = logo?.querySelector('.logo-name');
            if (logo && name) {
                const row = document.createElement('div');
                row.className = 'sidebar-brand-row';
                name.after(row);
                row.append(name, button);
            } else logo?.append(button);
        } else {
            document.body.classList.toggle('aapm-nav-collapsed', collapsed);
            if (!button.isConnected) sidebar.prepend(button);
        }
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
        style.textContent += `
            .app-confirm-backdrop { background: rgba(0,0,0,.68); backdrop-filter: blur(4px); font-family: 'DM Sans', system-ui, sans-serif; }
            .app-confirm-dialog { box-sizing: border-box; background: #191a1d; border: 1px solid #3a3b40; border-radius: 16px; box-shadow: 0 24px 80px #0008; max-height: calc(100dvh - 2rem); overflow-y: auto; text-align: left; }
            .app-confirm-badge { color: #f0ae54; background: #30291f; border-color: #484035; letter-spacing: .06em; }
            .app-confirm-dialog h2 { color: #f5f5f4; font-size: 1.3rem; }
            .app-confirm-dialog p { color: #bfc0c8; overflow-wrap: anywhere; white-space: pre-line; }
            .app-confirm-close { border-radius: 8px; }
            .app-confirm-actions { background: #151619; flex-wrap: wrap; }
            .app-confirm-cancel, .app-confirm-accept { width: auto; min-height: 44px; margin: 0; border-radius: 9px; }
            .app-confirm-accept { background: #f0ae54; color: #191a1d; border: 1px solid #f0ae54; box-shadow: none; }
            .app-confirm-accept:hover { background: #f6be74; transform: none; box-shadow: none; }
            @media (max-width: 420px) { .app-confirm-actions > button { flex: 1; padding-inline: 12px; } }
            @media (prefers-reduced-motion: reduce) { .app-confirm-backdrop, .app-confirm-dialog { animation: none; } }
        `;
        document.head.append(style);
    }

    function showAppConfirm(message, onConfirm) {
        if (document.querySelector('.app-confirm-backdrop')) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        ensureConfirmStyles();
        const backdrop = document.createElement('div');
        backdrop.className = 'app-confirm-backdrop';
        backdrop.innerHTML = `
            <section class="app-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="app-confirm-title" aria-describedby="app-confirm-message">
                <div class="app-confirm-header">
                    <span class="app-confirm-badge">AAPM SENAI</span>
                    <button type="button" class="app-confirm-close" aria-label="Fechar">×</button>
                </div>
                <h2 id="app-confirm-title">Confirmar ação</h2>
                <p id="app-confirm-message"></p>
                <div class="app-confirm-actions">
                    <button type="button" class="app-confirm-cancel">Cancelar</button>
                    <button type="button" class="app-confirm-accept">Confirmar</button>
                </div>
            </section>
        `;

        const closeButton = backdrop.querySelector('.app-confirm-close');
        const cancelButton = backdrop.querySelector('.app-confirm-cancel');
        const acceptButton = backdrop.querySelector('.app-confirm-accept');

        backdrop.querySelector('#app-confirm-message').textContent = message;
        const handleKey = (event) => {
            if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
            if (event.key === 'Tab') {
                const buttons = [closeButton, cancelButton, acceptButton];
                const index = buttons.indexOf(document.activeElement);
                event.preventDefault();
                buttons[(index + (event.shiftKey ? 2 : 1)) % 3].focus();
            }
        };
        const dismiss = () => {
            document.removeEventListener('keydown', handleKey);
            backdrop.remove();
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };

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
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKey);
        cancelButton.focus();
    }

    const approvedForms = new WeakSet();
    function openConfirmation(form, message, submitter) {
        showAppConfirm(message, () => {
            approvedForms.add(form);
            try { form.requestSubmit(submitter || undefined); }
            finally { approvedForms.delete(form); }
        });
    }

    function formatConfirmMessage(action) {
        const frase = action.trim();
        return `Confirma ${frase.toLowerCase()} no sistema AAPM SENAI?`;
    }

    window.showAppConfirm = showAppConfirm;

    document.addEventListener('DOMContentLoaded', () => {
        mountShell();
        mountNavigation();
        if (document.body.classList.contains('admin-page') && !document.querySelector('.cupom')) {
            const effectsCss = document.createElement('link');
            effectsCss.rel = 'stylesheet';
            effectsCss.href = '/static/css/visual-effects.css';
            document.head.append(effectsCss);
            const effectsScript = document.createElement('script');
            effectsScript.src = '/static/js/visual-effects.js';
            document.head.append(effectsScript);
        }
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
            if (event.defaultPrevented || approvedForms.has(form) || form.hasAttribute('onsubmit')) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const label = event.submitter?.textContent?.trim() || 'confirmar esta ação';
            openConfirmation(form, form.dataset.confirm || formatConfirmMessage(label), event.submitter);
        });
    });
})();
