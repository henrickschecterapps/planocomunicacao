// ========== FIREBASE CONFIG & AUTH ==========
const firebaseConfig = {
    apiKey: "AIzaSyBB8fkp6Vb868GhrLVoh4XO4Zf_P1Mc_OI",
    authDomain: "planocomunicacao-77e57.firebaseapp.com",
    projectId: "planocomunicacao-77e57",
    storageBucket: "planocomunicacao-77e57.firebasestorage.app",
    messagingSenderId: "1055331801415",
    appId: "1:1055331801415:web:cc90758dc68718e22d1462"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ========== LOGIN LOGIC ==========
(function initLogin() {
    const loginOverlay = document.getElementById('login-overlay');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const togglePassword = document.getElementById('toggle-password');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPassword.setAttribute('type', type);
            togglePassword.querySelector('svg').style.opacity = type === 'text' ? '1' : '0.6';
        });
    }

    function getErrorMessage(code) {
        const messages = {
            'auth/invalid-email': 'E-mail inválido.',
            'auth/user-disabled': 'Esta conta foi desativada.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
            'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
        };
        return messages[code] || 'Erro ao fazer login. Tente novamente.';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = '';
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            try {
                await auth.signInWithEmailAndPassword(loginEmail.value.trim(), loginPassword.value);
            } catch (err) {
                loginError.textContent = getErrorMessage(err.code);
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                loginForm.style.animation = 'none';
                loginForm.offsetHeight;
                loginForm.style.animation = 'shake 0.4s ease';
            }
        });
    }

    let dashboardInitialized = false;
    auth.onAuthStateChanged((user) => {
        if (user) {
            loginOverlay.classList.add('hidden');
            dashboard.style.display = '';
            updateUserUI(user);
            if (!dashboardInitialized) {
                dashboardInitialized = true;
                initDashboard();
            }
            // Initialize Icons
            if (window.lucide) lucide.createIcons();
        } else {
            loginOverlay.classList.remove('hidden');
            dashboard.style.display = 'none';
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut());
})();

function updateUserUI(user) {
    const emailEl = document.getElementById('sidebar-email');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (emailEl && user.email) emailEl.textContent = user.email;
    if (avatarEl && user.email) avatarEl.textContent = user.email.charAt(0).toUpperCase();
}

// ========== SHAKE KEYFRAMES ==========
(function () {
    const s = document.createElement('style');
    s.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`;
    document.head.appendChild(s);
})();

// ========== MOBILE MENU ==========
(function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    function closeSidebar() {
        sidebar?.classList.remove('open');
        backdrop?.classList.remove('active');
        setTimeout(() => { if (backdrop) backdrop.style.display = 'none'; }, 300);
    }

    hamburger?.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            backdrop.style.display = 'block';
            requestAnimationFrame(() => {
                sidebar.classList.add('open');
                backdrop.classList.add('active');
            });
        }
    });

    backdrop?.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 900) closeSidebar();
        });
    });
})();

// ========== DASHBOARD LOGIC ==========
function initDashboard() {
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const progressBar = document.getElementById('nav-progress-bar');
    const topbarSection = document.getElementById('topbar-section');
    const topbarCounter = document.getElementById('topbar-counter');
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    const prevLabel = document.getElementById('nav-prev-label');
    const nextLabel = document.getElementById('nav-next-label');
    const searchInput = document.getElementById('nav-search');
    const total = navItems.length;

    let currentIndex = 0;
    let isTransitioning = false;

    // Search Filtering
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const groups = document.querySelectorAll('.nav-group');
        let totalVisible = 0;
        
        groups.forEach(group => {
            const items = group.querySelectorAll('.nav-item');
            let groupVisible = false;
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const visible = text.includes(term);
                item.style.display = visible ? 'block' : 'none';
                if (visible) {
                    groupVisible = true;
                    totalVisible++;
                }
            });
            
            group.style.display = groupVisible ? 'flex' : 'none';
        });

        // Toggle visibility of a potential "no results" message if you decide to add one later
        searchInput.style.borderColor = (term !== '' && totalVisible === 0) ? 'var(--danger)' : '';
    });

    function getLabel(index) {
        return navItems[index]?.textContent || '';
    }

    function updateUI(index) {
        if (progressBar) progressBar.style.width = ((index + 1) / total * 100) + '%';
        if (topbarSection) topbarSection.textContent = getLabel(index);
        if (topbarCounter) topbarCounter.textContent = (index + 1) + ' / ' + total;
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === total - 1;
        if (prevLabel) prevLabel.textContent = index > 0 ? getLabel(index - 1) : 'Anterior';
        if (nextLabel) nextLabel.textContent = index < total - 1 ? getLabel(index + 1) : 'Próxima';
    }

    navItems.forEach((item, i) => {
        item.addEventListener('click', () => {
            if (!isTransitioning) setActiveIndex(i);
        });
    });

    prevBtn?.addEventListener('click', () => { if (!isTransitioning) setActiveIndex(currentIndex - 1); });
    nextBtn?.addEventListener('click', () => { if (!isTransitioning) setActiveIndex(currentIndex + 1); });

    function setActiveIndex(index) {
        if (index < 0 || index >= total || index === currentIndex) return;
        const targetId = navItems[index].getAttribute('data-target');
        navItems.forEach(i => i.classList.remove('active'));
        navItems[index].classList.add('active');
        switchPanel(targetId);
        currentIndex = index;
        updateUI(index);
        navItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function switchPanel(targetId) {
        const cur = document.querySelector('.content-panel.active');
        const next = document.getElementById(targetId);
        if (!cur || !next || cur === next) return;

        isTransitioning = true;
        anime({
            targets: cur, opacity: 0, translateY: 20, duration: 250, easing: 'easeInQuad',
            complete: () => {
                cur.classList.remove('active');
                cur.scrollTop = 0;
                next.classList.add('active');
                next.scrollTop = 0;
                anime({
                    targets: next, opacity: [0, 1], translateY: [20, 0], duration: 500, easing: 'easeOutQuart',
                    complete: () => { isTransitioning = false; }
                });
                animatePanelItems(next);
            }
        });
    }

    function animatePanelItems(panel) {
        const items = panel.querySelectorAll('.card, .table-wrapper, h2, h3, p, tr, li');
        anime({
            targets: items,
            opacity: [0, 1],
            translateY: [12, 0],
            delay: anime.stagger(25, { start: 40 }),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }

    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setActiveIndex(currentIndex + 1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setActiveIndex(currentIndex - 1); }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    const viewport = document.querySelector('.main-viewport');

    viewport?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewport?.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        const dy = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0) setActiveIndex(currentIndex + 1);
            else setActiveIndex(currentIndex - 1);
        }
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
        const glows = document.querySelectorAll('.glow');
        glows.forEach((glow, i) => {
            const speed = (i + 1) * 0.02;
            anime({
                targets: glow,
                translateX: (e.clientX - window.innerWidth / 2) * speed,
                translateY: (e.clientY - window.innerHeight / 2) * speed,
                duration: 500, easing: 'easeOutQuad'
            });
        });
    });

    updateUI(0);
    animatePanelItems(document.querySelector('.content-panel.active'));
}
