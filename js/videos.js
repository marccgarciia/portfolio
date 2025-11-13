/* ============================================
   CONTROL INTERACTIU VÍDEOS
   ============================================ */
const videosInteractius = [
    { id: 'video-webball', element: null },
    { id: 'video-festa2024', element: null },
    { id: 'video-festa2025', element: null }
];

videosInteractius.forEach(configVideo => {
    const video = document.getElementById(configVideo.id);
    configVideo.element = video;
    
    if (video) {
        let estaHover = false;
        let autoReproduint = true;
        
        // Iniciar vídeo quan entra al viewport
        const observadorVideo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && autoReproduint) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        });
        
        observadorVideo.observe(video);
        
        // Hover: pausar per control manual
        video.addEventListener('mouseenter', () => {
            estaHover = true;
            autoReproduint = false;
            video.pause();
        });
        
        // Sortir: reprendre autoplay
        video.addEventListener('mouseleave', () => {
            estaHover = false;
            autoReproduint = true;
            video.play();
        });
        
        // Scroll per controlar vídeo
        video.addEventListener('wheel', (e) => {
            if (estaHover) {
                e.preventDefault();
                
                const velocitatScroll = e.deltaY * 0.01;
                video.currentTime += velocitatScroll;
                
                if (video.currentTime < 0) {
                    video.currentTime = 0;
                }
                if (video.currentTime > video.duration) {
                    video.currentTime = video.duration;
                }
            }
        });
    }
});