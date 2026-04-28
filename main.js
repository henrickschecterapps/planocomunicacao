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
                await auth.signInWithEmailAndPassword(
                    loginEmail.value.trim(),
                    loginPassword.value
                );
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
        } else {
            loginOverlay.classList.remove('hidden');
            dashboard.style.display = 'none';
        }
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        auth.signOut();
    });
})();

// ========== UPDATE USER UI ==========
function updateUserUI(user) {
    const emailEl = document.getElementById('sidebar-email');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (emailEl && user.email) {
        emailEl.textContent = user.email;
    }
    if (avatarEl && user.email) {
        avatarEl.textContent = user.email.charAt(0).toUpperCase();
    }
}

// ========== SHAKE ANIMATION ==========
(function injectShakeKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
        }
    `;
    document.head.appendChild(style);
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
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
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

    // Close sidebar on nav click (mobile)
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
    let currentIndex = 0;
    let isTransitioning = false;

    function updateProgress(index) {
        if (!progressBar) return;
        const pct = ((index + 1) / navItems.length) * 100;
        progressBar.style.width = pct + '%';
    }

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (isTransitioning) return;
            setActiveIndex(index);
        });
    });

    function setActiveIndex(index) {
        if (index < 0 || index >= navItems.length || index === currentIndex) return;

        const targetId = navItems[index].getAttribute('data-target');

        navItems.forEach(i => i.classList.remove('active'));
        navItems[index].classList.add('active');

        switchPanel(targetId);
        currentIndex = index;
        updateProgress(index);

        navItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function switchPanel(targetId) {
        const currentPanel = document.querySelector('.content-panel.active');
        const nextPanel = document.getElementById(targetId);

        if (!currentPanel || !nextPanel || currentPanel === nextPanel) return;

        isTransitioning = true;

        anime({
            targets: currentPanel,
            opacity: 0,
            translateY: 20,
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                currentPanel.classList.remove('active');
                currentPanel.scrollTop = 0;
                nextPanel.classList.add('active');
                nextPanel.scrollTop = 0;

                anime({
                    targets: nextPanel,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 600,
                    easing: 'easeOutQuart',
                    complete: () => { isTransitioning = false; }
                });

                animatePanelItems(nextPanel);
            }
        });
    }

    function animatePanelItems(panel) {
        const items = panel.querySelectorAll('.card, .table-wrapper, h2, h3, p, tr, li');

        anime({
            targets: items,
            opacity: [0, 1],
            translateY: [15, 0],
            delay: anime.stagger(30, { start: 50 }),
            duration: 700,
            easing: 'easeOutQuart'
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            setActiveIndex(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            setActiveIndex(currentIndex - 1);
        }
    });

    // Background Glows follow mouse
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

    // Initial animation
    updateProgress(0);
    animatePanelItems(document.querySelector('.content-panel.active'));
}
