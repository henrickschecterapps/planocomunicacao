document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navTimeline = document.getElementById('navTimeline');
    const main = document.getElementById('main');

    // Generate Sidebar Items
    sections.forEach((section, i) => {
        const label = section.getAttribute('data-label');
        const navItem = document.createElement('div');
        navItem.className = 'nav-item' + (i === 0 ? ' active' : '');
        navItem.innerHTML = label;
        
        navItem.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth' });
        });
        
        navTimeline.appendChild(navItem);
    });

    const navItems = document.querySelectorAll('.nav-item');

    // Intersection Observer for Timeline/Active state
    const observerOptions = {
        root: main,
        threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update Slide Classes
                sections.forEach(s => s.classList.remove('active'));
                entry.target.classList.add('active');

                // Update Sidebar
                const index = Array.from(sections).indexOf(entry.target);
                navItems.forEach(item => item.classList.remove('active'));
                navItems[index].classList.add('active');

                // Auto-scroll sidebar to keep active item in view
                navItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Trigger Content Animations
                animateSlide(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    function animateSlide(section) {
        const elements = section.querySelectorAll('h1, h2, .glass-panel, .table-wrapper, .grid-2, .grid-3');
        
        anime({
            targets: elements,
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(80),
            easing: 'easeOutExpo',
            duration: 800
        });
    }

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
        const active = document.querySelector('section.active');
        const index = Array.from(sections).indexOf(active);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (index < sections.length - 1) {
                sections[index + 1].scrollIntoView({ behavior: 'smooth' });
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (index > 0) {
                sections[index - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Initial animation for first slide
    animateSlide(sections[0]);
});
