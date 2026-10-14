/* ============================================================
   BRAND v2 — moviment (inspirat en jorgeml.com)
   · Lenis: scroll suau
   · Text reveal amb màscara línia a línia
   · Stagger d'entrada
   · Comptadors i files animades al mockup
   Progressive enhancement: sense JS tot es veu igual.
   ============================================================ */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('anim-ready');

    /* ---------- Scroll suau (Lenis) ---------- */
    if (!reduce && window.Lenis) {
        const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.6 });
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        window.__lenis = lenis;
    }

    /* ---------- Comptador ascendent ---------- */
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const countUp = (el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const to = parseFloat(el.dataset.count);
        const pre = el.dataset.pre || '';
        const suf = el.dataset.suf || '';
        if (isNaN(to)) return;
        if (reduce) { el.textContent = pre + to + suf; return; }
        const dur = 1300, t0 = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            el.textContent = pre + Math.round(to * easeOut(p)) + suf;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    /* ---------- Activació d'elements ---------- */
    const activate = (el) => {
        if (el.hasAttribute('data-reveal-lines')) {
            el.querySelectorAll('.ln').forEach((l, i) => {
                const inner = l.firstElementChild;
                if (inner) inner.style.transitionDelay = (i * 0.09) + 's';
                l.classList.add('in');
            });
        } else if (el.hasAttribute('data-stagger')) {
            [...el.children].forEach((c, i) => {
                c.style.transitionDelay = (0.05 + i * 0.07) + 's';
                c.classList.add('in');
            });
        } else {
            el.classList.add('in');
        }
        if (el.hasAttribute('data-mockup')) {
            el.querySelectorAll('[data-count]').forEach(countUp);
        }
    };

    const targets = [...document.querySelectorAll(
        '[data-reveal], [data-reveal-lines], [data-stagger], [data-mockup]'
    )];

    if (reduce || !('IntersectionObserver' in window)) {
        targets.forEach(activate);
        return;
    }

    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); }
        }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(el => io.observe(el));

    /* ---------- Vídeos: càrrega diferida + play només si es veuen ---------- */
    const vids = [...document.querySelectorAll('video[data-lazy]')];
    if (vids.length && 'IntersectionObserver' in window) {
        const vio = new IntersectionObserver((entries) => {
            for (const e of entries) {
                const v = e.target;
                if (e.isIntersecting) {
                    if (v.dataset.loaded !== '1') { v.dataset.loaded = '1'; v.setAttribute('preload', 'auto'); v.load(); }
                    v.muted = true;
                    const p = v.play();
                    if (p && p.catch) p.catch(() => {});
                } else if (!v.paused) {
                    v.pause();
                }
            }
        }, { threshold: 0.25 });
        vids.forEach(v => vio.observe(v));
    }
})();
