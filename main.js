document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.content-panel');

    // 1. Sidebar Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // Update Sidebar UI
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Switch Panels
            switchPanel(target);
        });
    });

    function switchPanel(targetId) {
        const currentPanel = document.querySelector('.content-panel.active');
        const nextPanel = document.getElementById(targetId);

        if (currentPanel === nextPanel) return;

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
                    easing: 'easeOutQuart'
                });

                // Stagger items inside the new panel
                animatePanelItems(nextPanel);
            }
        });
    }

    function animatePanelItems(panel) {
        const items = panel.querySelectorAll('.card, .table-wrapper, h2, p, tr');
        
        anime({
            targets: items,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(50),
            duration: 800,
            easing: 'easeOutQuart'
        });
    }

    // 2. Interactive Background Glows (Mouse follow)
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

    // 3. Initial Animation
    animatePanelItems(document.querySelector('.content-panel.active'));
});
