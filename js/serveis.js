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
        '#construit .cap-seccio, #construit .construit-nota, ' +
        '#diferenciacio .diferenciacio-box, ' +
        '#proces .cap-seccio, ' +
        '#contacte-serveis .cap-seccio, #contacte-serveis .form-box, ' +
        '.footer-inner'
    )], false);

    add([...document.querySelectorAll('#serveis-blocs .servei-card')], true);
    add([...document.querySelectorAll('#escenaris .escenari')], true);
    add([...document.querySelectorAll('#construit .cas-card')], true);
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

    // ── Vídeos dels casos: reproduir només els visibles, càrrega diferida ──
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vids = [...document.querySelectorAll('#construit .cas-media video')];

    const handleVideos = () => {
        if (reduceMotion) return;
        const h = window.innerHeight;
        for (const v of vids) {
            const r = v.getBoundingClientRect();
            const inView = r.top < h && r.bottom > 0;
            if (inView) {
                if (v.getAttribute('preload') === 'none') {
                    v.setAttribute('preload', 'auto');
                    v.load();
                }
                v.muted = true;
                const p = v.play();
                if (p && p.catch) p.catch(() => {});
            } else if (!v.paused) {
                v.pause();
            }
        }
    };

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => { reveal(); handleVideos(); ticking = false; });
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', () => { reveal(); handleVideos(); });
    reveal();
    handleVideos();

    // Re-comprova posicions quan les fonts/layout acaben d'assentar-se
    setTimeout(() => { reveal(); handleVideos(); }, 300);
    setTimeout(() => { reveal(); handleVideos(); }, 1200);
})();
