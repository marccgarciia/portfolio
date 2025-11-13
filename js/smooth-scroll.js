/* ============================================
   SMOOTH SCROLL CONTROLAT
   ============================================ */

// Offset per deixar espai amb la navegació fixa (70px del nav)
const scrollOffset = 70;

// Seleccionar tots els enllaços interns (que comencen amb #)
document.querySelectorAll('a[href^="#"]').forEach(enllac => {
    enllac.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        
        // Si és només # (scroll to top), comportament especial
        if (targetId === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Calcular posició tenint en compte l'offset
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
            
            // Scroll suau amb offset personalitzat
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Tancar menú mòbil si està obert
            const menuMobil = document.querySelector('.menu-mobil');
            const botoMenu = document.querySelector('.boto-menu');
            const capaMenu = document.querySelector('.capa-menu');
            
            if (menuMobil && menuMobil.classList.contains('active')) {
                menuMobil.classList.remove('active');
                botoMenu.classList.remove('active');
                capaMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});

/* ============================================
   INDICADOR DE SECCIÓ ACTIVA AL NAV
   ============================================ */

// Observador per detectar quina secció és visible
const seccions = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.contenidor-links-nav a, .menu-mobil a');

const observadorSeccio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Eliminar classe activa de tots els links
            navLinks.forEach(link => {
                link.classList.remove('actiu');
                
                // Afegir classe activa al link corresponent
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('actiu');
                }
            });
        }
    });
}, {
    rootMargin: '-100px 0px -66%',
    threshold: 0
});

// Observar totes les seccions
seccions.forEach(seccio => {
    observadorSeccio.observe(seccio);
});

/* ============================================
   DETECTAR QUAN ESTÀS AL TOP (Hero sense id)
   ============================================ */

// Si no hi ha cap secció visible, treure negreta de tot
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Si estàs a menys de 200px del top, treure totes les negretes
    if (scrollTop < 200) {
        navLinks.forEach(link => {
            link.classList.remove('actiu');
        });
    }
});