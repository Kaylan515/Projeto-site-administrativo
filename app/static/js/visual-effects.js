(() => {
    if (document.querySelector('.ambient-light')) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    // Decorative backdrop stays behind every page and never handles input.
    document.body.classList.add('has-ambient-background');
    const backdrop = document.createElement('div');
    backdrop.className = 'site-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = '<div class="backdrop-orb backdrop-orb-amber"></div><div class="backdrop-orb backdrop-orb-blue"></div><div class="backdrop-grid"></div><div class="backdrop-mouse"></div>';
    document.body.prepend(backdrop);
    const backgroundAnimations = [];
    backdrop.querySelectorAll('.backdrop-orb').forEach((orb, index) => {
        if (typeof orb.animate !== 'function') return;
        const animation = orb.animate([
            { transform: 'translate3d(0, 0, 0) scale(1)' },
            { transform: `translate3d(${index ? -50 : 65}px, ${index ? 45 : -35}px, 0) scale(1.12)` }
        ], { duration: index ? 24000 : 18000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        backgroundAnimations.push(animation);
    });
    function syncBackground() {
        backdrop.classList.toggle('is-paused', motion.matches || document.hidden);
        backgroundAnimations.forEach(animation => {
            if (motion.matches || document.hidden) animation.pause();
            else animation.play();
        });
    }
    motion.addEventListener('change', syncBackground);
    document.addEventListener('visibilitychange', syncBackground);
    window.addEventListener('beforeprint', () => backgroundAnimations.forEach(animation => animation.pause()));
    window.addEventListener('afterprint', syncBackground);
    syncBackground();
    const light = document.createElement('div');
    light.className = 'ambient-light';
    light.setAttribute('aria-hidden', 'true');
    document.body.append(light);
    let frame = 0;
    let targetX = 0, targetY = 0, x = 0, y = 0;
    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        light.classList.remove('is-visible');
        backdrop.classList.remove('is-tracking');
        backdrop.style.setProperty('--drift-x', '0px');
        backdrop.style.setProperty('--drift-y', '0px');
    }
    function render() {
        x += (targetX - x) * .16;
        y += (targetY - y) * .16;
        light.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        backdrop.style.setProperty('--pointer-x', `${x}px`);
        backdrop.style.setProperty('--pointer-y', `${y}px`);
        backdrop.style.setProperty('--drift-x', `${(x / Math.max(window.innerWidth, 1) - .5) * 64}px`);
        backdrop.style.setProperty('--drift-y', `${(y / Math.max(window.innerHeight, 1) - .5) * 48}px`);
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > .5) frame = requestAnimationFrame(render);
        else frame = 0;
    }
    document.addEventListener('pointermove', (event) => {
        if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
        targetX = event.clientX;
        targetY = event.clientY;
        if (!light.classList.contains('is-visible')) { x = targetX; y = targetY; }
        light.classList.add('is-visible');
        backdrop.classList.add('is-tracking');
        if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', stop);
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    motion.addEventListener('change', stop);
    pointer.addEventListener('change', stop);

    // Animate once when a section enters view; content stays visible without JS.
    const animations = new Set();
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            observer.unobserve(target);
            if (motion.matches || typeof target.animate !== 'function') return;
            const animation = target.animate([
                { opacity: .35, transform: 'translateY(14px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 460, easing: 'cubic-bezier(.2,.7,.3,1)' });
            animations.add(animation);
            animation.finished.catch(() => {}).finally(() => animations.delete(animation));
        });
    }, { threshold: .08 }) : null;
    const revealSelector = '.cards-grid > .card, .section, .access-feature, .auth-intro, .pdv-page-header, .table-container, .table-wrapper, .app-pagination, .form-container, .history-card, .filter-card, .resumo-card, .stat-mini-card, .error-section';
    document.querySelectorAll(revealSelector).forEach(element => {
        // A table inside an animated section should not animate a second time.
        if (!element.parentElement?.closest(revealSelector)) observer?.observe(element);
    });
    motion.addEventListener('change', () => {
        if (motion.matches) animations.forEach(animation => animation.cancel());
    });

    // Shared click feedback for buttons and pagination, including public pages.
    document.addEventListener('click', (event) => {
        const target = event.target.closest('button, a[class*="btn-"], .dashboard-action, .app-pagination a');
        if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true' || motion.matches) return;
        const bounds = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ui-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        target.classList.add('has-click-feedback');
        ripple.style.left = `${event.detail ? event.clientX - bounds.left : bounds.width / 2}px`;
        ripple.style.top = `${event.detail ? event.clientY - bounds.top : bounds.height / 2}px`;
        const size = Math.max(bounds.width, bounds.height) * 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        target.append(ripple);
        const cleanup = () => {
            ripple.remove();
            if (!target.querySelector('.ui-ripple')) target.classList.remove('has-click-feedback');
        };
        ripple.addEventListener('animationend', cleanup, { once: true });
        window.setTimeout(cleanup, 700);
    });
    // Graceful entry animation when cross-document transitions are unavailable.
    function animatePageEntry(event) {
        if (event?.persisted || motion.matches || 'CSSViewTransitionRule' in window) return;
        const content = document.querySelector('.admin-main, .admin-page .main, .welcome-wrapper, .auth-page-wrapper, .cupom-wrapper');
        if (!content || typeof content.animate !== 'function') return;
        const animation = content.animate([
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 360, easing: 'cubic-bezier(.2,.7,.3,1)' });
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    }
    if (document.readyState === 'complete') animatePageEntry();
    window.addEventListener('pageshow', animatePageEntry);
})();
