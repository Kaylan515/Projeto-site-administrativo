(() => {
    if (document.querySelector('.ambient-light')) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
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
    }
    function render() {
        x += (targetX - x) * .16;
        y += (targetY - y) * .16;
        light.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > .5) frame = requestAnimationFrame(render);
        else frame = 0;
    }
    document.addEventListener('pointermove', (event) => {
        if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
        targetX = event.clientX;
        targetY = event.clientY;
        if (!light.classList.contains('is-visible')) { x = targetX; y = targetY; }
        light.classList.add('is-visible');
        if (!frame) frame = requestAnimationFrame(render);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', stop);
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    motion.addEventListener('change', stop);
    pointer.addEventListener('change', stop);
})();
