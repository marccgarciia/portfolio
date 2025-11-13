/* ============================================
   CURSOR PERSONALITZAT
   ============================================ */
const cursor = document.querySelector('.cursor');
const cursorSeguidor = document.querySelector('.cursor-seguidor');

let mouseX = 0, mouseY = 0;
let seguidorX = 0, seguidorY = 0;

// Actualitzar posició del cursor principal
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// Animació suau del cursor seguidor
function animarCursorSeguidor() {
    const velocitat = 0.15;
    
    seguidorX += (mouseX - seguidorX) * velocitat;
    seguidorY += (mouseY - seguidorY) * velocitat;
    
    cursorSeguidor.style.left = seguidorX + 'px';
    cursorSeguidor.style.top = seguidorY + 'px';
    
    requestAnimationFrame(animarCursorSeguidor);
}

animarCursorSeguidor();

// Efectes hover del cursor
document.querySelectorAll('a, button, .projecte').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursorSeguidor.style.transform = 'scale(1.5)';
    });
    element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorSeguidor.style.transform = 'scale(1)';
    });
});