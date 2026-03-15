/* ============================================
   EXPERIÈNCIA — SCROLL HORITZONTAL
   Lògica basada en scroll-cards.html
   ============================================ */

(function () {
    const wrapper = document.querySelector('.experiencia-sticky-wrapper');
    const inner = document.querySelector('.experiencia-sticky-inner');
    const track = document.getElementById('cardsTrack');
    const cards = document.querySelectorAll('.card-experiencia');
    const dots = document.querySelectorAll('.dot');
    const hint = document.getElementById('scrollHint');

    if (!wrapper || !track || cards.length === 0) return;

    /* ── Mòbil: no scroll horitzontal per JS ── */
    if (window.innerWidth <= 768) {
        cards.forEach(c => c.classList.add('visible'));
        return;
    }

    /* ── Entrada animada de les cards ── */
    setTimeout(() => {
        cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 150);
        });
    }, 200);

    /* ── Helpers ── */
    function getCardWidth() {
        const card = track.children[0];
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.offsetWidth + gap;
    }

    function getCenterOffset() {
        const cardW = track.children[0].offsetWidth;
        return (window.innerWidth / 2) - (cardW / 2);
    }
    function getMaxShift() {
        return getCardWidth() * (cards.length - 1);
    }

    function update() {
        const rect = wrapper.getBoundingClientRect();
        const total = wrapper.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / total));

        const shift = progress * getMaxShift();
        const center = getCenterOffset();
        track.style.transform = `translateX(${center - shift}px)`;

        /* Efecte bombolla: cada card flota verticalment depenent de la seva posició */
        const now = Date.now() / 1000;
        cards.forEach((card, i) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distFromCenter = (cardCenter - window.innerWidth / 2) / window.innerWidth;
            const floatY = Math.sin(now * 0.8 + i * 1.2) * 6;
            const tiltX = distFromCenter * -3;
            card.style.transform = `translateY(${floatY}px) rotateX(${tiltX}deg)`;
        });

        /* Dots actius */
        const cardW = getCardWidth();
        const activeI = Math.round(shift / cardW);
        dots.forEach((dot, i) => dot.classList.toggle('actiu', i === activeI));

        /* Scroll hint */
        if (hint) hint.classList.toggle('hidden', progress > 0.05);

        requestAnimationFrame(update);
    }

    window.addEventListener('resize', () => { });
    requestAnimationFrame(update);
})();