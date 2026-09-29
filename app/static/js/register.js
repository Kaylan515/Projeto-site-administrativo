document.addEventListener('DOMContentLoaded', () => {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;

    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function renderSpotlight() {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderSpotlight);
    }
    renderSpotlight();
});