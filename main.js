document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.hub-nav-item');
    const stage = document.getElementById('stage');
    const progressInner = document.getElementById('progressInner');

    // 1. Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 2. Intersection Observer for Active State & Animations
    const observerOptions = {
        root: stage,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                
                // Update Nav
                navItems.forEach(item => {
                    item.classList.toggle('active', item.getAttribute('data-target') === id);
                    if (item.getAttribute('data-target') === id) {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });

                // Run Section Animations
                animateSection(entry.target);
                
                // Update Progress
                const index = Array.from(sections).indexOf(entry.target);
                const progress = ((index + 1) / sections.length) * 100;
                progressInner.style.height = `${progress}%`;
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    function animateSection(section) {
        const title = section.querySelector('h1, h2');
        const cards = section.querySelectorAll('.bento-card, .data-table-container');
        const elements = section.querySelectorAll('p, .tag, tr');

        anime.set([title, cards, elements], { opacity: 0 });

        const tl = anime.timeline({
            easing: 'easeOutQuart'
        });

        tl.add({
            targets: title,
            translateX: [-30, 0],
            opacity: [0, 1],
            duration: 800
        })
        .add({
            targets: cards,
            translateY: [40, 0],
            opacity: [0, 1],
            scale: [0.98, 1],
            delay: anime.stagger(150),
            duration: 1000
        }, '-=600')
        .add({
            targets: elements,
            opacity: [0, 1],
            translateY: [10, 0],
            delay: anime.stagger(50),
            duration: 600
        }, '-=800');
    }

    // 3. Sync Scroll for manual navigation
    stage.addEventListener('scroll', () => {
        // Observer handles the state update
    });

    // 4. Keyboard Support
    window.addEventListener('keydown', (e) => {
        const activeItem = document.querySelector('.hub-nav-item.active');
        const targetId = activeItem ? activeItem.getAttribute('data-target') : 's1';
        const currentIndex = Array.from(sections).indexOf(document.getElementById(targetId));

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (currentIndex < sections.length - 1) {
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (currentIndex > 0) {
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Initial Trigger
    animateSection(sections[0]);
});
