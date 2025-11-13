/* ============================================
   EFECTE MAGNIFYING GLASS NAVEGACIÓ
   ============================================ */
const contenidorNav = document.querySelector('.contenidor-links-nav');
const linksNav = document.querySelectorAll('.contenidor-links-nav a');

if (contenidorNav && linksNav.length > 0) {
    linksNav.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const rect = link.getBoundingClientRect();
            const containerRect = contenidorNav.getBoundingClientRect();
            const offsetEsquerra = rect.left - containerRect.left + (rect.width / 2);
            
            contenidorNav.style.setProperty('--magnifier-x', `${offsetEsquerra}px`);
            contenidorNav.style.setProperty('--magnifier-width', `${rect.width + 20}px`);
            contenidorNav.style.setProperty('--magnifier-opacity', '1');
        });
    });
    
    contenidorNav.addEventListener('mouseleave', () => {
        contenidorNav.style.setProperty('--magnifier-opacity', '0');
    });
}

/* ============================================
   MENÚ MÒBIL
   ============================================ */
const botoMenu = document.querySelector('.boto-menu');
const menuMobil = document.querySelector('.menu-mobil');
const capaMenu = document.querySelector('.capa-menu');
const linksMobil = document.querySelectorAll('.menu-mobil a');

if (botoMenu && menuMobil) {
    // Obrir/tancar menú
    botoMenu.addEventListener('click', () => {
        botoMenu.classList.toggle('active');
        menuMobil.classList.toggle('active');
        capaMenu.classList.toggle('active');
        document.body.style.overflow = menuMobil.classList.contains('active') ? 'hidden' : '';
    });
    
    // Tancar amb overlay
    capaMenu.addEventListener('click', () => {
        botoMenu.classList.remove('active');
        menuMobil.classList.remove('active');
        capaMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Tancar en clicar link
    linksMobil.forEach(link => {
        link.addEventListener('click', () => {
            botoMenu.classList.remove('active');
            menuMobil.classList.remove('active');
            capaMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}