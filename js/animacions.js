/* ============================================
   ANIMACIONS SCROLL - PROJECTES
   Observa quan els projectes entren al viewport
   i els fa aparèixer amb fade-in
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

// Aplicar animació a tots els projectes
document.querySelectorAll('.projecte').forEach(projecte => {
    projecte.style.opacity = '0';
    projecte.style.transform = 'translateY(30px)';
    projecte.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observador.observe(projecte);
});

/* ============================================
   ANIMACIONS NOMÉS EN MÒBIL
   Les següents animacions només s'executen
   en pantalles menors de 768px
   ============================================ */
if (window.innerWidth <= 768) {

    /* ===== GALERIA DE FOTOS ===== */
    /* Animació secuencial: cada foto mostra la seva etiqueta
       durant 800ms, després desapareix i passa a la següent */
    const observadorFotos = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const graella = entry.target;
                const fotos = graella.querySelectorAll('.foto');

                // Animar cada foto amb un delay progressiu
                fotos.forEach((foto, index) => {
                    setTimeout(() => {
                        foto.classList.add('reveal');

                        // Treure l'etiqueta després de 800ms
                        setTimeout(() => {
                            foto.classList.remove('reveal');
                        }, 800);
                    }, index * 500); // 500ms entre cada foto (efecte fluid)
                });

                // Deixar d'observar un cop animat
                observadorFotos.unobserve(graella);
            }
        });
    }, {
        threshold: 0.2
    });

    const graellaFotos = document.querySelector('.graella-fotos');
    if (graellaFotos) {
        observadorFotos.observe(graellaFotos);
    }

    /* ===== DISSENY & BRANDING ===== */
    /* Mateix efecte que les fotos però per la graella de dissenys */
    const observadorDissenys = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const graella = entry.target;
                const dissenys = graella.querySelectorAll('.disseny');

                // Animar cada disseny amb un delay progressiu
                dissenys.forEach((disseny, index) => {
                    setTimeout(() => {
                        disseny.classList.add('reveal');

                        // Treure l'etiqueta després de 800ms
                        setTimeout(() => {
                            disseny.classList.remove('reveal');
                        }, 800);
                    }, index * 500);
                });

                // Deixar d'observar un cop animat
                observadorDissenys.unobserve(graella);
            }
        });
    }, {
        threshold: 0.2
    });

    const graellaDisseny = document.querySelector('.graella-disseny');
    if (graellaDisseny) {
        observadorDissenys.observe(graellaDisseny);
    }

    /* ===== XARXES SOCIALS ===== */
    /* Efecte "lift": cada targeta es "levanta" (translateY)
       durant 800ms simulant l'efecte hover de desktop */
    const observadorXarxes = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const graella = entry.target;
                const xarxes = graella.querySelectorAll('.targeta-xarxa');

                // Animar cada xarxa amb un delay progressiu
                xarxes.forEach((xarxa, index) => {
                    setTimeout(() => {
                        xarxa.classList.add('lift');

                        // Tornar a baixar després de 800ms
                        setTimeout(() => {
                            xarxa.classList.remove('lift');
                        }, 800);
                    }, index * 500);
                });

                // Deixar d'observar un cop animat
                observadorXarxes.unobserve(graella);
            }
        });
    }, {
        threshold: 0.2
    });

    const graellaXarxes = document.querySelector('.graella-xarxes');
    if (graellaXarxes) {
        observadorXarxes.observe(graellaXarxes);
    }
}