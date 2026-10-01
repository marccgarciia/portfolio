/* ============================================
   SERVEIS — animacions d'aparició en scroll
   Mètode basat en posició real (fiable a tot arreu).
   Progressive enhancement: si JS no corre, tot es veu igual.
   ============================================ */
(function () {
    const add = (nodes, stagger) => {
        nodes.forEach((el, i) => {
            el.classList.add('reveal');
            if (stagger) el.style.transitionDelay = (i * 0.08) + 's';
        });
    };

    add([...document.querySelectorAll(
        '#escenaris .cap-seccio, #escenaris .escenaris-cta, ' +
        '#construit .cap-seccio, #construit .construit-box, ' +
        '#diferenciacio .diferenciacio-box, ' +
        '#proces .cap-seccio, ' +
        '#contacte-serveis .cap-seccio, #contacte-serveis .form-box, ' +
        '.footer-inner'
    )], false);

    add([...document.querySelectorAll('#serveis-blocs .servei-card')], true);
    add([...document.querySelectorAll('#escenaris .escenari')], true);
    add([...document.querySelectorAll('#proces .proces-step')], true);

    const all = [...document.querySelectorAll('.reveal')];

    const reveal = () => {
        const h = window.innerHeight;
        for (const el of all) {
            if (el.classList.contains('visible')) continue;
            const top = el.getBoundingClientRect().top;
            if (top < h * 0.88) el.classList.add('visible');
        }
    };

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => { reveal(); ticking = false; });
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', reveal);
    reveal();

    // Re-comprova posicions quan les fonts/layout acaben d'assentar-se
    setTimeout(reveal, 300);
    setTimeout(reveal, 1200);
})();
