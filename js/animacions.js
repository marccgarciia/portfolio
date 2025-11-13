/* ============================================
   ANIMACIONS SCROLL
   ============================================ */
const observador = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.projecte').forEach(projecte => {
    projecte.style.opacity = '0';
    projecte.style.transform = 'translateY(30px)';
    projecte.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observador.observe(projecte);
});