document.addEventListener('DOMContentLoaded', () => {
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const panels = document.querySelectorAll('.content-panel');
    let currentIndex = 0;
    let isTransitioning = false;

    // 1. Sidebar Navigation Logic
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (isTransitioning) return;
            setActiveIndex(index);
        });
    });

    function setActiveIndex(index) {
        if (index < 0 || index >= navItems.length || index === currentIndex) return;

        const targetId = navItems[index].getAttribute('data-target');
        
        // Update Sidebar UI
        navItems.forEach(i => i.classList.remove('active'));
        navItems[index].classList.add('active');

        // Switch Panels
        switchPanel(targetId);
        currentIndex = index;
        
        // Scroll sidebar to keep active item in view if needed
        navItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function switchPanel(targetId) {
        const currentPanel = document.querySelector('.content-panel.active');
        const nextPanel = document.getElementById(targetId);

        if (!currentPanel || !nextPanel || currentPanel === nextPanel) return;

        isTransitioning = true;

        // Transition Out
        anime({
            targets: currentPanel,
            opacity: 0,
            translateY: 20,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                currentPanel.classList.remove('active');
                nextPanel.classList.add('active');
                
                // Transition In
                anime({
                    targets: nextPanel,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 600,
                    easing: 'easeOutQuart',
                    complete: () => {
                        isTransitioning = false;
                    }
                });

                // Stagger items inside the new panel
                animatePanelItems(nextPanel);
            }
        });
    }

    function animatePanelItems(panel) {
        const items = panel.querySelectorAll('.card, .table-wrapper, h2, h3, p, tr, li');
        
        anime({
            targets: items,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(40),
            duration: 800,
            easing: 'easeOutQuart'
        });
    }

    // 2. Keyboard Navigation (Arrows)
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            setActiveIndex(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            setActiveIndex(currentIndex - 1);
        }
    });

    // 3. Interactive Background Glows (Mouse follow)
    document.addEventListener('mousemove', (e) => {
        const glows = document.querySelectorAll('.glow');
        const x = e.clientX;
        const y = e.clientY;

        glows.forEach((glow, index) => {
            const speed = (index + 1) * 0.02;
            anime({
                targets: glow,
                translateX: (x - window.innerWidth / 2) * speed,
                translateY: (y - window.innerHeight / 2) * speed,
                duration: 500,
                easing: 'easeOutQuad'
            });
        });
    });

    // 5. Initial Animation
    animatePanelItems(document.querySelector('.content-panel.active'));
});
