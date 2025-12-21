// main.js - Inicialização global do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Carregar configurações
    if (typeof CONFIG === 'undefined') {
        console.warn('CONFIG não encontrado, carregando padrões...');
        window.CONFIG = {
            SITE_NAME: 'JPCELLFRP PRO',
            VERSION: '2.1.0',
            DEFAULT_THEME: 'dark'
        };
    }

    // Inicializar auth se necessário
    if (typeof auth === 'undefined') {
        console.error('Sistema de autenticação não encontrado!');
        return;
    }

    // Verificar página atual e contexto
    const path = window.location.pathname;
    let pageType = 'unknown';
    
    if (path.includes('/admin/')) {
        if (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('admin')) pageType = 'admin.html';
        else if (path.endsWith('imei-block.html')) pageType = 'imei-block.html';
        
        // Verificação de segurança para admin
        if (!auth.requireAdmin()) return;
        
    } else {
        if (path.endsWith('index.html') || path.endsWith('/')) pageType = 'index.html';
        else if (path.endsWith('dashboard.html')) {
            pageType = 'dashboard.html';
            if (!auth.requireAuth()) return;
        }
    }
    
    // Inicializar componentes específicos da página
    initializePage(pageType);
});

function initializePage(page) {
    console.log(`Inicializando página: ${page}`);
    
    switch(page) {
        case 'index.html':
            setupLoginPage();
            break;
        case 'dashboard.html':
            setupDashboard();
            break;
        case 'admin.html':
            setupAdminPanel();
            break;
        case 'imei-block.html':
            setupIMEIBlock();
            break;
        default:
            // Página genérica
            setupCommonFeatures();
    }
    
    // Sempre inicializar recursos comuns
    setupCommonFeatures();
}

function setupCommonFeatures() {
    // Atualizar informações do usuário
    if (auth.isAuthenticated()) {
        updateUserUI();
    }
    
    // Configurar tema
    setupTheme();
    
    // Configurar logout
    setupLogoutButtons();
    
    // Configurar notificações
    setupNotifications();
}

function updateUserUI() {
    const user = auth.currentUser;
    
    // Atualizar elementos comuns
    const elements = {
        'userName': user.fullName,
        'userAvatar': user.fullName.charAt(0).toUpperCase(),
        'userDisplay': user.fullName,
        'adminName': user.fullName,
        'adminAvatar': user.fullName.charAt(0).toUpperCase()
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Atualizar status premium
    const premiumElements = document.querySelectorAll('.user-plan, #premiumStatus, #adminRole');
    premiumElements.forEach(element => {
        if (user.isPremium || user.vip) {
            element.textContent = user.role === 'admin' ? 'ADMIN' : 'PREMIUM';
            element.className = element.className.replace('plan-basic', 'plan-premium');
            if (!element.className.includes('plan-premium')) {
                element.classList.add('plan-premium');
            }
        } else {
            element.textContent = user.role === 'admin' ? 'ADMIN' : 'BASIC';
            element.className = element.className.replace('plan-premium', 'plan-basic');
            if (!element.className.includes('plan-basic')) {
                element.classList.add('plan-basic');
            }
        }
    });
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || CONFIG.DEFAULT_THEME;
    document.body.classList.add(`${savedTheme}-theme`);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = savedTheme === 'dark' 
            ? '<i class="fas fa-sun"></i> Modo Claro'
            : '<i class="fas fa-moon"></i> Modo Escuro';
            
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            document.body.classList.toggle('dark-theme', !isDark);
            document.body.classList.toggle('light-theme', isDark);
            
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            
            themeToggle.innerHTML = newTheme === 'dark' 
                ? '<i class="fas fa-sun"></i> Modo Claro'
                : '<i class="fas fa-moon"></i> Modo Escuro';
        });
    }
}

function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('#btnLogout, .logout-btn[onclick*="logout"], [data-action="logout"]');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair?')) {
                auth.logout();
            }
        });
    });
}

function setupNotifications() {
    // Sistema simples de notificações
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${
                type === 'success' ? 'check-circle' : 
                type === 'warning' ? 'exclamation-triangle' : 
                type === 'danger' ? 'times-circle' : 'info-circle'
            }"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    };
}

// Funções específicas de cada página
function setupLoginPage() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            const result = auth.login(username, password);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                const errorEl = document.getElementById('errorMessage');
                if (errorEl) {
                    errorEl.textContent = result.message || 'Erro no login';
                    errorEl.style.display = 'block';
                }
            }
        });
    }
    
    // Toggle entre login e registro
    const toggleRegister = document.getElementById('toggleRegister');
    const toggleLogin = document.getElementById('toggleLogin');
    
    if (toggleRegister) {
        toggleRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        });
    }
    
    if (toggleLogin) {
        toggleLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
        });
    }
    
    // Register form
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = {
                username: document.getElementById('reg_username').value.trim(),
                password: document.getElementById('reg_password').value.trim(),
                email: '',
                fullName: ''
            };
            
            const result = auth.register(userData);
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                const errorEl = document.getElementById('registerMessage');
                if (errorEl) {
                    errorEl.textContent = result.message || 'Erro no registro';
                    errorEl.style.display = 'block';
                }
            }
        });
    }
}

function setupDashboard() {
    // Esta função será chamada pelo dashboard.html
    console.log('Dashboard inicializado');
}

function setupAdminPanel() {
    // Esta função será chamada pelo admin.html
    console.log('Painel Admin inicializado');
}

function setupIMEIBlock() {
    // Esta função será chamada pelo imei-block.html
    console.log('IMEI Block inicializado');
}

// Exportar funções úteis
window.initializeApp = initializePage;