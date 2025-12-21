// dashboard-functions.js - Funções específicas do dashboard
class DashboardManager {
    constructor() {
        this.charts = {};
        this.intervalIds = [];
        this.init();
    }
    
    init() {
        if (!auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Dashboard Manager inicializado');
        
        // Configurar informações do usuário
        this.setupUserInfo();
        
        // Configurar navegação
        this.setupNavigation();
        
        // Inicializar gráficos
        this.initCharts();
        
        // Configurar eventos
        this.setupEvents();
        
        // Iniciar atualizações em tempo real
        this.startLiveUpdates();
        
        // Carregar dados iniciais
        this.loadInitialData();
    }
    
    setupUserInfo() {
        const user = auth.currentUser;
        
        // Atualizar elementos de UI
        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        updateElement('userName', user.fullName);
        updateElement('userDisplay', user.fullName);
        
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.textContent = user.fullName.charAt(0).toUpperCase();
        }
        
        // Status premium
        const premiumStatus = document.getElementById('premiumStatus');
        if (premiumStatus) {
            if (user.isPremium || user.vip) {
                premiumStatus.textContent = 'PREMIUM';
                premiumStatus.className = 'user-plan plan-premium';
            } else {
                premiumStatus.textContent = 'BASIC';
                premiumStatus.className = 'user-plan plan-basic';
            }
        }
        
        // Adicionar link admin se for admin
        if (auth.isAdmin()) {
            const sidebarNav = document.querySelector('.sidebar-nav');
            if (sidebarNav && !document.querySelector('.nav-item[href="admin.html"]')) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-item';
                adminLink.innerHTML = `
                    <i class="fas fa-user-shield"></i>
                    <span>Admin</span>
                `;
                sidebarNav.appendChild(adminLink);
            }
        }
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const href = item.getAttribute('href');
                if (href && href.includes('.html')) {
                    window.location.href = href;
                    return;
                }
                
                const sectionId = item.getAttribute('data-section');
                if (!sectionId) return;
                
                // Ativar item de navegação
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Mostrar seção correspondente
                sections.forEach(section => section.classList.remove('active'));
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.onSectionChange(sectionId);
                }
            });
        });
        
        // Ativar seção inicial
        const activeNav = document.querySelector('.nav-item.active') || navItems[0];
        if (activeNav) {
            const sectionId = activeNav.getAttribute('data-section');
            if (sectionId) {
                sections.forEach(section => section.classList.remove('active'));
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            }
        }
    }
    
    initCharts() {
        // Gráfico de recursos
        const resourceCtx = document.getElementById('resourceChart');
        if (resourceCtx) {
            this.charts.resource = new Chart(resourceCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    datasets: [
                        {
                            label: 'CPU %',
                            data: [65, 59, 80, 81, 56, 55, 40],
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Memória %',
                            data: [28, 48, 40, 19, 86, 27, 90],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#fff' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: { color: '#94a3b8' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
        
        // Gráfico de desbloqueios
        const unlockCtx = document.getElementById('unlockChart');
        if (unlockCtx) {
            this.charts.unlock = new Chart(unlockCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Samsung', 'Xiaomi', 'LG', 'Motorola', 'Outros'],
                    datasets: [{
                        data: [35, 25, 15, 15, 10],
                        backgroundColor: [
                            '#4f46e5',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderColor: 'rgba(30, 41, 59, 0.95)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#fff',
                                padding: 20
                            }
                        }
                    }
                }
            });
        }
    }
    
    setupEvents() {
        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            auth.logout();
        });
        
        // Atualizar estatísticas
        document.getElementById('btnRefreshStats')?.addEventListener('click', () => {
            this.updateSystemStats();
            showNotification('Estatísticas atualizadas!', 'success');
        });
        
        // Botões de ações rápidas
        const actions = {
            'btnQuickScan': { message: 'Scan de dispositivos iniciado...', type: 'info' },
            'btnQuickBackup': { message: 'Backup em andamento...', type: 'info' },
            'btnQuickReport': { message: 'Gerando relatório...', type: 'info' },
            'btnQuickSupport': { message: 'Conectando com suporte...', type: 'info' }
        };
        
        Object.keys(actions).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    const action = actions[btnId];
                    showNotification(action.message, action.type);
                    
                    // Simular processamento
                    setTimeout(() => {
                        showNotification('Ação concluída com sucesso!', 'success');
                    }, 1500);
                });
            }
        });
        
        // Suporte
        document.getElementById('supportSend')?.addEventListener('click', () => {
            this.sendSupportMessage();
        });
        
        document.getElementById('supportInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendSupportMessage();
        });
    }
    
    startLiveUpdates() {
        // Atualizar temporizador de sessão
        this.intervalIds.push(setInterval(() => {
            this.updateSystemStats();
        }, 5000));
        
        // Atualizar gráficos periodicamente
        this.intervalIds.push(setInterval(() => {
            this.updateCharts();
        }, 30000));
    }
    
    updateSystemStats() {
        // Atualizar contadores
        const updateValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        // Gerar valores aleatórios para demonstração
        const serversOnline = Math.floor(Math.random() * 4) + 12;
        const apiResponse = Math.floor(Math.random() * 20) + 15;
        const devicesToday = Math.floor(Math.random() * 5) + 8;
        
        updateValue('serversOnline', `${serversOnline}/15`);
        updateValue('apiResponse', `${apiResponse}ms`);
        updateValue('devicesToday', devicesToday);
        
        // Atualizar temporizador
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pt-BR');
        updateValue('sessionTimer', timeStr);
    }
    
    updateCharts() {
        if (this.charts.resource) {
            const newData = Array.from({length: 7}, () => Math.floor(Math.random() * 100));
            this.charts.resource.data.datasets[0].data = newData;
            this.charts.resource.update('none');
        }
    }
    
    loadInitialData() {
        this.updateSystemStats();
        this.loadProducts();
        this.loadSupportMessages();
    }
    
    loadProducts() {
        const products = JSON.parse(localStorage.getItem('site_products')) || [
            {
                id: 'frp_premium',
                name: 'Licença FRP Premium',
                description: 'Acesso vitalício ao FRP Unlocker Pro',
                price: 299.90,
                icon: 'fa-unlock-alt'
            },
            {
                id: 'imei_credits_10',
                name: 'Créditos IMEI (10x)',
                description: '10 desbloqueios IMEI em servidores premium',
                price: 199.00,
                icon: 'fa-key'
            },
            {
                id: 'subscription_30',
                name: 'Assinatura Pro (30 dias)',
                description: 'Acesso a todas as ferramentas por 30 dias',
                price: 79.90,
                icon: 'fa-star'
            }
        ];
        
        const shopGrid = document.getElementById('shopProducts');
        if (!shopGrid) return;
        
        shopGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <i class="fas ${product.icon}" style="font-size: 40px; color: #4f46e5; margin-bottom: 10px;"></i>
                    <h3 style="margin-bottom: 10px;">${product.name}</h3>
                    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 15px;">${product.description}</p>
                    <div style="font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 15px;">
                        R$ ${product.price.toFixed(2)}
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                    </button>
                </div>
            `;
            
            shopGrid.appendChild(productCard);
        });
        
        // Adicionar eventos aos botões
        shopGrid.querySelectorAll('[data-product-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('button').getAttribute('data-product-id');
                this.addToCart(productId);
            });
        });
    }
    
    addToCart(productId) {
        const products = JSON.parse(localStorage.getItem('site_products')) || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('Produto não encontrado!', 'danger');
            return;
        }
        
        const cart = JSON.parse(localStorage.getItem('shopping_cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1,
                addedAt: Date.now()
            });
        }
        
        localStorage.setItem('shopping_cart', JSON.stringify(cart));
        showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    }
    
    sendSupportMessage() {
        try {
            const input = document.getElementById('supportInput');
            const text = input?.value.trim();
            
            if (!text) {
                showNotification('Digite uma mensagem!', 'warning');
                return;
            }
            
            const messagesData = localStorage.getItem('support_messages') || '[]';
            const messages = JSON.parse(messagesData);
            
            messages.push({
                sender: 'user',
                text: text,
                timestamp: Date.now()
            });
            
            if (input) input.value = '';
            
            // Simular resposta do suporte
            setTimeout(() => {
                try {
                    const responses = [
                        "Recebemos sua mensagem! Nossa equipe responderá em breve.",
                        "Estamos verificando sua solicitação. Por favor, aguarde.",
                        "Sua mensagem foi registrada com sucesso."
                    ];
                    
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    messages.push({
                        sender: 'support',
                        text: randomResponse,
                        timestamp: Date.now()
                    });
                    
                    localStorage.setItem('support_messages', JSON.stringify(messages));
                    this.loadSupportMessages();
                } catch (error) {
                    console.error('Erro ao processar resposta do suporte:', error);
                }
            }, 1000 + Math.random() * 1000);
            
            localStorage.setItem('support_messages', JSON.stringify(messages));
            this.loadSupportMessages();
            
            showNotification('Mensagem enviada!', 'success');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            showNotification('Erro ao enviar mensagem. Tente novamente.', 'danger');
        }
    }
    
    loadSupportMessages() {
        try {
            const messagesData = localStorage.getItem('support_messages') || '[]';
            const messages = JSON.parse(messagesData);
            const supportMessages = document.getElementById('supportMessages');
            
            if (!supportMessages) return;
        
        let html = '';
        messages.forEach(msg => {
            const isUser = msg.sender === 'user';
            const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div style="margin-bottom: 10px; padding: 10px; background: ${isUser ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 8px;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: ${isUser ? '#4f46e5' : '#10b981'}">
                        ${isUser ? 'Você' : 'Suporte'}
                    </div>
                    <div style="color: #e2e8f0;">${msg.text}</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
                        ${time}
                    </div>
                </div>
            `;
        });
        
        supportMessages.innerHTML = html;
        supportMessages.scrollTop = supportMessages.scrollHeight;
    }
    
    onSectionChange(sectionId) {
        console.log(`Mudou para seção: ${sectionId}`);
        
        switch(sectionId) {
            case 'suporte':
                this.loadSupportMessages();
                break;
            case 'loja':
                this.loadProducts();
                break;
            case 'perfil':
                this.loadProfileData();
                break;
        }
    }
    
    loadProfileData() {
        const user = auth.currentUser;
        
        const elements = {
            'profileFullName': user.fullName,
            'profileEmail': user.email,
            'profilePhone': user.phone
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = elements[id];
        });
    }
    
    // Limpar intervalos quando necessário
    destroy() {
        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});