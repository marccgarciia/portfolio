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
            const start = vh * 0.85;
            const remaining = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
            for (const el of fillEls) {
                const cs = charMap.get(el);
                const top = el.getBoundingClientRect().top;
                // si l'element és al final de la pàgina, ha d'acabar d'omplir-se abans d'arribar al fons
                const end = Math.max(vh * 0.4, top - remaining + 30);
                const p = clampF((start - top) / Math.max(1, start - end), 0, 1);
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
    /* ---------- Efecte d'escriptura als càrrecs/títols de la trajectòria ---------- */
    const twItems = [...document.querySelectorAll('.traj-item .t')];
    if (twItems.length && !reduce && 'IntersectionObserver' in window) {
        twItems.forEach((el) => {
            const full = el.textContent;
            el.textContent = '';
            const v = document.createElement('span'); v.className = 'tw-v';
            const h = document.createElement('span'); h.className = 'tw-h'; h.textContent = full;
            el.setAttribute('aria-label', full);
            el.append(v, h);
        });
        const typeIt = (el, delay) => {
            const v = el.querySelector('.tw-v'), h = el.querySelector('.tw-h');
            const full = h.textContent;
            let i = 0;
            setTimeout(() => {
                v.classList.add('typing');
                const tick = () => {
                    i++;
                    v.textContent = full.slice(0, i);
                    h.textContent = full.slice(i);
                    if (i < full.length) setTimeout(tick, 22 + Math.random() * 26);
                    else setTimeout(() => v.classList.remove('typing'), 700);
                };
                tick();
            }, delay);
        };
        const tio = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue;
                tio.unobserve(e.target);
                [...e.target.querySelectorAll('.traj-item .t')].forEach((el, i) => typeIt(el, 350 + i * 420));
            }
        }, { threshold: 0.3 });
        document.querySelectorAll('.traj-card').forEach(c => tio.observe(c));
    }
    /* ---------- Marquesines: velocitat constant (px/s) sigui quina sigui la llargada ---------- */
    const setMarqueeSpeed = () => {
        document.querySelectorAll('.brand-marquee .track, .skills .track').forEach((t) => {
            const speed = t.closest('.skills') ? 42 : 52;
            const half = t.scrollWidth / 2;
            if (half > 0) t.style.animationDuration = (half / speed).toFixed(1) + 's';
        });
    };
    setMarqueeSpeed();
    window.addEventListener('load', setMarqueeSpeed);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setMarqueeSpeed);
    /* ---------- Quadrícula de punts del hero que reacciona al ratolí ---------- */
    const gridCv = document.querySelector('.hero-grid');
    if (gridCv && gridCv.getContext) {
        const hero = gridCv.parentElement;
        const ctx = gridCv.getContext('2d');
        const GAP = 22, RADIUS = 210;
        let W = 0, H = 0, dpr = 1, running = false;
        const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, k: 0, kt: 0 };
        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            const r = gridCv.getBoundingClientRect();
            W = r.width; H = r.height;
            gridCv.width = Math.round(W * dpr); gridCv.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw();
        };
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            const cols = Math.ceil(W / GAP) + 1, rows = Math.ceil(H / GAP) + 1;
            const ox = (W % GAP) / 2;
            for (let i = 0; i < cols; i++) {
                const x = ox + i * GAP;
                for (let j = 0; j < rows; j++) {
                    const y = j * GAP + GAP / 2;
                    const d = Math.hypot(x - mouse.sx, y - mouse.sy);
                    const f = Math.max(0, 1 - d / RADIUS) * mouse.k;
                    const e = f * f * (3 - 2 * f);
                    const a = 0.13 + e * 0.5;
                    const r = 0.7 + e * 0.75;
                    // gris -> blau segons la proximitat
                    const rr = Math.round(150 - e * 59), gg = Math.round(150 - e * 10), bb = Math.round(160 + e * 95);
                    ctx.fillStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + a.toFixed(3) + ')';
                    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
                }
            }
        };
        let autoMode = false, heroVisible = true, touchUntil = 0;
        const tick = (now) => {
            if (autoMode && now > touchUntil) {
                // mòbil: llum que voreja sola per la quadrícula
                mouse.x = W * (0.5 + 0.34 * Math.sin(now * 0.00042));
                mouse.y = H * (0.48 + 0.2 * Math.sin(now * 0.00071 + 1.3));
                mouse.kt = 1;
            }
            mouse.sx += (mouse.x - mouse.sx) * 0.16;
            mouse.sy += (mouse.y - mouse.sy) * 0.16;
            mouse.k += (mouse.kt - mouse.k) * 0.1;
            draw();
            if (autoMode && !heroVisible) { running = false; return; }
            if (mouse.kt > 0 || mouse.k > 0.01) requestAnimationFrame(tick); else running = false;
        };
        const wake = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
        resize();
        window.addEventListener('resize', resize, { passive: true });
        if (!reduce && window.matchMedia('(hover: hover)').matches) {
            hero.addEventListener('pointermove', (e) => {
                const r = gridCv.getBoundingClientRect();
                mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
                if (mouse.k < 0.02) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
                mouse.kt = 1; wake();
            }, { passive: true });
            hero.addEventListener('pointerleave', () => { mouse.kt = 0; wake(); });
        } else if (!reduce) {
            autoMode = true;
            mouse.sx = W * 0.5; mouse.sy = H * 0.5; mouse.k = 0;
            hero.addEventListener('pointermove', (e) => {
                const r = gridCv.getBoundingClientRect();
                mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
                touchUntil = performance.now() + 2200; mouse.kt = 1; wake();
            }, { passive: true });
            if ('IntersectionObserver' in window) {
                new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; if (heroVisible) wake(); }).observe(hero);
            }
            wake();
        }
    }
    /* ---------- Cursor personalitzat: punt blanc + cercle en passar per sobre d'elements clicables ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const cur = document.createElement('div');
        cur.className = 'cursor';
        cur.innerHTML = '<span class="cursor-in"></span>';
        document.body.appendChild(cur);
        document.documentElement.classList.add('has-cursor');
        const LINKS = 'a, button, [role="button"], input, textarea, select, summary, label';
        let tx = -100, ty = -100, cx = -100, cy = -100, shown = false, raf = 0;
        const loop = () => {
            cx += (tx - cx) * (reduce ? 1 : 0.34);
            cy += (ty - cy) * (reduce ? 1 : 0.34);
            cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
            raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : 0;
        };
        window.addEventListener('pointermove', (e) => {
            tx = e.clientX; ty = e.clientY;
            if (!shown) { shown = true; cx = tx; cy = ty; cur.classList.add('on'); }
            cur.classList.toggle('is-link', !!(e.target.closest && e.target.closest(LINKS)));
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
        window.addEventListener('pointerdown', () => cur.classList.add('down'));
        window.addEventListener('pointerup', () => cur.classList.remove('down'));
        document.documentElement.addEventListener('pointerleave', () => { shown = false; cur.classList.remove('on'); });
    }
    /* ---------- Menú mòbil ---------- */
    const burger = document.querySelector('.brand-burger');
    const mmenu = document.querySelector('.mobile-menu');
    if (burger && mmenu) {
        const setMenu = (open) => {
            document.body.classList.toggle('menu-open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
            if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
        };
        burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
        mmenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
        window.addEventListener('resize', () => { if (window.innerWidth > 760) setMenu(false); }, { passive: true });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }
    /* ---------- Visor de vídeo per als vídeos verticals (només mòbil) ---------- */
    const vcards = [...document.querySelectorAll('.vcard .frame')];
    if (vcards.length) {
        const box = document.createElement('div');
        box.className = 'vbox';
        box.setAttribute('aria-hidden', 'true');
        box.innerHTML = '<button class="vbox-x" type="button" aria-label="Tanca">×</button>';
        document.body.appendChild(box);
        let big = null;
        const closeBox = () => {
            box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
            if (window.__lenis) window.__lenis.start();
            if (big) { const v = big; big = null; v.pause(); setTimeout(() => v.remove(), 320); }
        };
        vcards.forEach((fr) => fr.addEventListener('click', () => {
            if (window.innerWidth > 860) return;
            const src = fr.querySelector('video source');
            if (!src) return;
            const v = document.createElement('video');
            v.src = src.getAttribute('src'); v.controls = true; v.loop = true; v.playsInline = true; v.autoplay = true;
            v.setAttribute('playsinline', '');
            const poster = fr.querySelector('video').getAttribute('poster'); if (poster) v.poster = poster;
            big = v; box.appendChild(v);
            box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
            if (window.__lenis) window.__lenis.stop();
            const p = v.play(); if (p && p.catch) p.catch(() => {});
        }));
        box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('vbox-x')) closeBox(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBox(); });
    }
})();
