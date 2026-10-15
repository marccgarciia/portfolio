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
        const dec = to % 1 !== 0;
        const fmt = (v) => dec ? v.toFixed(1) : Math.round(v);
        if (reduce) { el.textContent = pre + fmt(to) + suf; return; }
        const dur = 1300, t0 = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            el.textContent = pre + fmt(to * easeOut(p)) + suf;
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
            el.classList.add('drawn');
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

    /* ---------- Globus de punts (integracions) ---------- */
    const globeSvg = document.querySelector('.globe-svg');
    if (globeSvg) {
        const NS = 'http://www.w3.org/2000/svg';
        const CX = 260, CY = 260, R = 192;
        const dotsG = globeSvg.querySelector('.globe-dots');
        const nodesG = globeSvg.querySelector('.globe-nodes');
        const dots = [];
        for (let lat = -78; lat <= 78; lat += 13) {
            const ring = Math.max(1, Math.round(Math.cos(lat * Math.PI / 180) * 26));
            for (let k = 0; k < ring; k++) {
                const c = document.createElementNS(NS, 'circle');
                c.setAttribute('fill', '#ffffff');
                dotsG.appendChild(c);
                dots.push({ lat, lon: (k / ring) * 360, el: c });
            }
        }
        const nodes = [[22, -15], [41, 32], [-12, 58], [33, -52], [-28, 22], [8, 95]].map(([lat, lon]) => {
            const c = document.createElementNS(NS, 'circle');
            c.setAttribute('fill', '#4ade80');
            nodesG.appendChild(c);
            return { lat, lon, el: c };
        });
        let rot = 0, tilt = 0.42, globeVisible = false; // tilt per defecte = perspectiva humana
        const project = (lat, lon) => {
            const phi = lat * Math.PI / 180, lam = (lon + rot) * Math.PI / 180, cphi = Math.cos(phi);
            const X = cphi * Math.sin(lam), Y = Math.sin(phi), Z = cphi * Math.cos(lam);
            const ct = Math.cos(tilt), st = Math.sin(tilt);
            const Y2 = Y * ct - Z * st, Z2 = Y * st + Z * ct;
            return { x: CX + R * X, y: CY - R * Y2, z: Z2 };
        };
        const draw = (time) => {
            for (const d of dots) {
                const p = project(d.lat, d.lon);
                if (p.z < -0.05) { d.el.setAttribute('opacity', '0'); continue; }
                const depth = (p.z + 1) / 2;
                d.el.setAttribute('cx', p.x.toFixed(1));
                d.el.setAttribute('cy', p.y.toFixed(1));
                d.el.setAttribute('r', (0.9 + depth * 1.5).toFixed(2));
                d.el.setAttribute('opacity', (0.1 + depth * 0.6).toFixed(2));
            }
            for (const n of nodes) {
                const p = project(n.lat, n.lon);
                if (p.z < 0.02) { n.el.setAttribute('opacity', '0'); continue; }
                n.el.setAttribute('cx', p.x.toFixed(1));
                n.el.setAttribute('cy', p.y.toFixed(1));
                n.el.setAttribute('r', (3.2 + Math.sin(time / 500 + n.lon) * 1.6).toFixed(2));
                n.el.setAttribute('opacity', (0.5 + p.z * 0.5).toFixed(2));
            }
        };
        draw(0);

        // Arrossegar per girar el globus
        let dragging = false, lastX = 0, lastY = 0;
        const stage = globeSvg.closest('.globe-stage') || globeSvg;
        stage.addEventListener('pointerdown', (e) => {
            dragging = true; lastX = e.clientX; lastY = e.clientY; stage.classList.add('dragging');
            if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
        });
        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            rot += (e.clientX - lastX) * 0.4;
            tilt = Math.max(-0.5, Math.min(1.05, tilt + (e.clientY - lastY) * 0.006));
            lastX = e.clientX; lastY = e.clientY;
            draw(performance.now());
        });
        const endDrag = () => { if (dragging) { dragging = false; stage.classList.remove('dragging'); } };
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);

        const loop = (t) => { if (globeVisible && !dragging) { rot += 0.18; draw(t); } requestAnimationFrame(loop); };
        if (!reduce) requestAnimationFrame(loop);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((e) => { globeVisible = e[0].isIntersecting; }).observe(globeSvg);
        } else { globeVisible = true; }
    }

    /* ---------- Fons negre superior només quan hi ha títols sticky ---------- */
    const capSecs = [...document.querySelectorAll('.proj.cap')];
    if (capSecs.length) {
        const first = capSecs[0], last = capSecs[capSecs.length - 1];
        const LINE = 71;
        let maskTick = false;
        const updateMask = () => {
            const top = first.getBoundingClientRect().top;
            const bottom = last.getBoundingClientRect().bottom;
            document.body.classList.toggle('titles-on', top <= LINE && bottom > LINE);
        };
        const onScrollMask = () => {
            if (!maskTick) { maskTick = true; requestAnimationFrame(() => { updateMask(); maskTick = false; }); }
        };
        window.addEventListener('scroll', onScrollMask, { passive: true });
        window.addEventListener('resize', onScrollMask, { passive: true });
        updateMask();
    }

    /* ---------- Frases centrades amb omplerta al scroll (gris -> blanc, vora blava) ---------- */
    const fillEls = [...document.querySelectorAll('[data-fill]')];
    if (fillEls.length && !reduce) {
        const charMap = new Map();
        fillEls.forEach((el) => {
            const words = el.textContent.split(/(\s+)/);
            el.textContent = '';
            const chars = [];
            words.forEach((tok) => {
                if (tok.trim() === '') { el.appendChild(document.createTextNode(tok)); return; }
                const wd = document.createElement('span'); wd.className = 'wd';
                for (const ch of tok) {
                    const c = document.createElement('span'); c.className = 'c'; c.textContent = ch;
                    wd.appendChild(c); chars.push(c);
                }
                el.appendChild(wd);
            });
            charMap.set(el, chars);
        });
        const clampF = (v, a, b) => Math.max(a, Math.min(b, v));
        let fillTick = false, lastY = window.scrollY, dir = 1;
        const updateFill = () => {
            const vh = window.innerHeight;
            const start = vh * 0.85, end = vh * 0.4;
            for (const el of fillEls) {
                const cs = charMap.get(el);
                const p = clampF((start - el.getBoundingClientRect().top) / (start - end), 0, 1);
                const edge = p * (cs.length + 2);
                for (let i = 0; i < cs.length; i++) {
                    const d = edge - i;
                    const on = d >= 1;
                    cs[i].classList.toggle('on', on);
                    cs[i].classList.toggle('blue', !on && d >= 0 && dir === 1);
                }
            }
        };
        const onFill = () => {
            const y = window.scrollY;
            if (y !== lastY) { dir = y > lastY ? 1 : -1; lastY = y; }
            if (!fillTick) { fillTick = true; requestAnimationFrame(() => { updateFill(); fillTick = false; }); }
        };
        window.addEventListener('scroll', onFill, { passive: true });
        window.addEventListener('resize', onFill, { passive: true });
        updateFill();
    }
})();
