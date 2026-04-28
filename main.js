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

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            loginPassword.setAttribute('type', type);
            togglePassword.querySelector('svg').style.opacity = type === 'text' ? '1' : '0.6';
        });
    }

    // Translate Firebase error codes to Portuguese
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

    // Form submit → Firebase signInWithEmailAndPassword
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
                // Auth state listener below will handle the transition
            } catch (err) {
                loginError.textContent = getErrorMessage(err.code);
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;

                // Shake animation on error
                loginForm.style.animation = 'none';
                loginForm.offsetHeight; // trigger reflow
                loginForm.style.animation = 'shake 0.4s ease';
            }
        });
    }

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in — hide login, show dashboard
            loginOverlay.classList.add('hidden');
            dashboard.style.display = '';
            // Initialize dashboard after showing it
            initDashboard();
        } else {
            // User is signed out — show login, hide dashboard
            loginOverlay.classList.remove('hidden');
            dashboard.style.display = 'none';
        }
    });
})();

// ========== SHAKE ANIMATION (injected via JS for the login form) ==========
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

// ========== DASHBOARD LOGIC (original) ==========
function initDashboard() {
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
}
