/* ============================================
   CONTROL INTERACTIU VÍDEOS (OPTIMITZAT)
   ============================================ */

// Array amb tots els IDs dels vídeos
const videosIds = ['video-webball', 'video-webeea', 'video-joan', 'video-finances-landing', 'video-webfinances', 'video-festa2024', 'video-festa2025'];

// Objecte per guardar l'estat de cada vídeo
const videosEstat = {};

// Inicialitzar estat de cada vídeo
videosIds.forEach(id => {
    const video = document.getElementById(id);
    if (video) {
        videosEstat[id] = {
            element: video,
            estaHover: false,
            autoReproduint: true
        };

        // Event listeners per hover
        video.addEventListener('mouseenter', () => {
            videosEstat[id].estaHover = true;
            videosEstat[id].autoReproduint = false;
            video.pause();
        });

        video.addEventListener('mouseleave', () => {
            videosEstat[id].estaHover = false;
            videosEstat[id].autoReproduint = true;
            video.play();
        });

        // Control amb scroll
        video.addEventListener('wheel', (e) => {
            if (videosEstat[id].estaHover) {
                e.preventDefault();

                const velocitatScroll = e.deltaY * 0.01;
                video.currentTime += velocitatScroll;

                // Límits del vídeo
                if (video.currentTime < 0) video.currentTime = 0;
                if (video.currentTime > video.duration) video.currentTime = video.duration;
            }
        });
    }
});

// UN SOL OBSERVADOR per tots els vídeos
const observadorVideos = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const videoId = entry.target.id;
        const video = videosEstat[videoId]?.element;

        if (video && videosEstat[videoId].autoReproduint) {
            if (entry.isIntersecting) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => { });
                }
            } else {
                video.pause();
            }
        }
    });
});

// Observar tots els vídeos amb el mateix observador
videosIds.forEach(id => {
    const video = document.getElementById(id);
    if (video) {
        observadorVideos.observe(video);
    }
});