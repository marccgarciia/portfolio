/* ============================================
   SERVEIS — animacions d'aparició + elements dinàmics
   Mètode basat en posició real (fiable a tot arreu).
   Progressive enhancement: si JS no corre, tot es veu igual.
   ============================================ */
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const add = (nodes, stagger) => {
        nodes.forEach((el, i) => {
            el.classList.add('reveal');
            if (stagger) el.style.transitionDelay = (i * 0.08) + 's';
        });
    };

    add([...document.querySelectorAll(
        '#metrics .cap-seccio, ' +
        '#escenaris .cap-seccio, #escenaris .escenaris-cta, ' +
        '#integracions .integra-left, #integracions .globe-stage, ' +
        '#construit .cap-seccio, #construit .construit-nota, ' +
        '#diferenciacio .diferenciacio-box, ' +
        '#proces .cap-seccio, ' +
        '#contacte-serveis .cap-seccio, #contacte-serveis .form-box, ' +
        '.footer-inner'
    )], false);

    add([...document.querySelectorAll('#metrics .metric-card')], true);
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

    // ── Gràfic de línia que es dibuixa sol ──
    const line = document.querySelector('.mc-line');
    const chartCard = document.querySelector('.metric-chart');
    if (line) {
        try {
            const len = line.getTotalLength();
            line.style.strokeDasharray = len;
            line.style.strokeDashoffset = reduceMotion ? 0 : len;
            line.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)';
        } catch (e) { /* no-op */ }
    }

    // ── Comptador ascendent per als números ──
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const countUp = (el) => {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const to = parseFloat(el.dataset.to);
        const pre = el.dataset.prefix || '';
        const suf = el.dataset.suffix || '';
        if (isNaN(to)) return;
        if (reduceMotion) { el.textContent = pre + to + suf; return; }
        const dur = 1400;
        const t0 = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            el.textContent = pre + Math.round(to * easeOut(p)) + suf;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    let metricsDone = false;
    const metricsSection = document.getElementById('metrics');
    const animateMetrics = () => {
        if (metricsDone || !metricsSection) return;
        if (metricsSection.getBoundingClientRect().top < window.innerHeight * 0.8) {
            metricsDone = true;
            if (line && !reduceMotion) line.style.strokeDashoffset = 0;
            if (chartCard) chartCard.classList.add('drawn');
            document.querySelectorAll('#metrics .metric-num[data-to]').forEach(countUp);
        }
    };

    // ── Pills d'integracions: entrada escalonada ──
    let tagsDone = false;
    const feature = document.querySelector('.feature-integra');
    const animateTags = () => {
        if (tagsDone || !feature) return;
        if (feature.getBoundingClientRect().top < window.innerHeight * 0.82) {
            tagsDone = true;
            const tags = [...feature.querySelectorAll('.itag')];
            tags.forEach((t, i) => { t.style.transitionDelay = (0.12 + i * 0.07) + 's'; });
            feature.classList.add('tags-in');
        }
    };

    // ── Vídeos dels casos ──
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

    // ── Globus de punts (xarxa global) ──
    const globeSvg = document.querySelector('.globe-svg');
    let globeVisible = false;
    if (globeSvg) {
        const NS = 'http://www.w3.org/2000/svg';
        const CX = 260, CY = 260, R = 192;
        const dotsG = globeSvg.querySelector('.globe-dots');
        const nodesG = globeSvg.querySelector('.globe-nodes');
        const dots = [];
        for (let lat = -78; lat <= 78; lat += 13) {
            const ring = Math.max(1, Math.round(Math.cos(lat * Math.PI / 180) * 26));
            for (let k = 0; k < ring; k++) {
                const lon = (k / ring) * 360;
                const c = document.createElementNS(NS, 'circle');
                c.setAttribute('r', '1.5');
                c.setAttribute('fill', '#f2f1ee');
                dotsG.appendChild(c);
                dots.push({ lat, lon, el: c });
            }
        }
        const nodeDefs = [[22, -15], [41, 32], [-12, 58], [33, -52], [-28, 22], [8, 95]];
        const nodes = nodeDefs.map(([lat, lon]) => {
            const c = document.createElementNS(NS, 'circle');
            c.setAttribute('fill', '#5b8cff');
            nodesG.appendChild(c);
            return { lat, lon, el: c };
        });

        const project = (lat, lon, rot) => {
            const phi = lat * Math.PI / 180;
            const lam = (lon + rot) * Math.PI / 180;
            const cphi = Math.cos(phi);
            return {
                x: CX + R * cphi * Math.sin(lam),
                y: CY - R * Math.sin(phi),
                z: cphi * Math.cos(lam)
            };
        };

        let rot = 0;
        const draw = (time) => {
            for (const d of dots) {
                const p = project(d.lat, d.lon, rot);
                if (p.z < -0.05) { d.el.setAttribute('opacity', '0'); continue; }
                const depth = (p.z + 1) / 2;
                d.el.setAttribute('cx', p.x.toFixed(1));
                d.el.setAttribute('cy', p.y.toFixed(1));
                d.el.setAttribute('r', (0.9 + depth * 1.5).toFixed(2));
                d.el.setAttribute('opacity', (0.12 + depth * 0.7).toFixed(2));
            }
            for (const n of nodes) {
                const p = project(n.lat, n.lon, rot);
                if (p.z < 0.02) { n.el.setAttribute('opacity', '0'); continue; }
                const pulse = 3.2 + Math.sin(time / 500 + n.lon) * 1.6;
                n.el.setAttribute('cx', p.x.toFixed(1));
                n.el.setAttribute('cy', p.y.toFixed(1));
                n.el.setAttribute('r', pulse.toFixed(2));
                n.el.setAttribute('opacity', (0.5 + p.z * 0.5).toFixed(2));
            }
        };

        const loop = (time) => {
            if (globeVisible) { rot += 0.18; draw(time); }
            requestAnimationFrame(loop);
        };
        draw(0);
        if (!reduceMotion) requestAnimationFrame(loop);
    }

    const updateGlobeVisible = () => {
        if (!globeSvg) return;
        const r = globeSvg.getBoundingClientRect();
        globeVisible = r.top < window.innerHeight && r.bottom > 0;
    };

    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                reveal(); handleVideos(); animateMetrics(); animateTags(); updateGlobeVisible();
                ticking = false;
            });
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', () => { onScroll(); });

    const kick = () => { reveal(); handleVideos(); animateMetrics(); animateTags(); updateGlobeVisible(); };
    kick();
    setTimeout(kick, 300);
    setTimeout(kick, 1200);
})();
