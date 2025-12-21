// sync-events.js
// Eventos específicos para sincronização no dashboard

class DashboardSyncEvents {
    constructor() {
        this.init();
    }

    init() {
        console.log('Dashboard Sync Events inicializado');
        
        // Ouvir eventos de sincronização
        this.setupEventListeners();
        
        // Configurar handlers para ações do dashboard
        this.setupDashboardHandlers();
    }

    setupEventListeners() {
        // Usuários atualizados
        window.addEventListener('usersUpdated', (e) => {
            this.handleUsersUpdated(e.detail);
        });

        // Produtos atualizados
        window.addEventListener('productsUpdated', (e) => {
            this.handleProductsUpdated(e.detail);
        });

        // Vendas atualizadas
        window.addEventListener('salesUpdated', (e) => {
            this.handleSalesUpdated(e.detail);
        });

        // Suporte atualizado
        window.addEventListener('supportUpdated', (e) => {
            this.handleSupportUpdated(e.detail);
        });

        // Configurações atualizadas
        window.addEventListener('settingsUpdated', (e) => {
            this.handleSettingsUpdated(e.detail);
        });

        // Sincronização concluída
        window.addEventListener('syncCompleted', (e) => {
            this.handleSyncCompleted(e.detail);
        });
    }

    setupDashboardHandlers() {
        // Verificar se é a página do dashboard
        if (!window.location.pathname.includes('dashboard.html')) {
            return;
        }

        // Monitorar ações que precisam ser sincronizadas
        this.monitorUserActions();
        this.monitorPurchaseActions();
        this.monitorSupportActions();
    }

    monitorUserActions() {
        // Monitorar login/logout
        const originalAuth = window.auth;
        if (originalAuth) {
            // Sobrescrever métodos para adicionar sincronização
            const originalLogin = originalAuth.login;
            const originalLogout = originalAuth.logout;
            const originalRegister = originalAuth.register;
            
            if (originalLogin) {
                window.auth.login = function(...args) {
                    const result = originalLogin.apply(this, args);
                    window.syncAdmin?.forceUserSync();
                    return result;
                };
            }
            
            if (originalLogout) {
                window.auth.logout = function(...args) {
                    const result = originalLogout.apply(this, args);
                    window.syncAdmin?.forceUserSync();
                    return result;
                };
            }
            
            if (originalRegister) {
                window.auth.register = function(...args) {
                    const result = originalRegister.apply(this, args);
                    window.syncAdmin?.forceUserSync();
                    return result;
                };
            }
        }
    }

    monitorPurchaseActions() {
        // Monitorar compras
        const cartButtons = document.querySelectorAll('[data-cart-add], [data-buy-now], [data-product-id]');
        cartButtons.forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(() => {
                    window.syncAdmin?.forceSalesSync();
                    window.syncAdmin?.forceProductSync();
                }, 1000);
            });
        });
    }

    monitorSupportActions() {
        // Monitorar tickets de suporte
        const supportForms = document.querySelectorAll('#supportForm, .support-ticket-form');
        supportForms.forEach(form => {
            form.addEventListener('submit', () => {
                setTimeout(() => {
                    window.syncAdmin?.forceSupportSync();
                }, 1000);
            });
        });
    }

    // Handlers de eventos
    handleUsersUpdated(data) {
        console.log('Usuários atualizados via sincronização:', data);
        
        // Atualizar contadores no dashboard
        this.updateUserCounters(data.count);
    }

    handleProductsUpdated(data) {
        console.log('Produtos atualizados via sincronização:', data);
        
        // Atualizar lista de produtos se necessário
        if (typeof updateProductList === 'function') {
            updateProductList();
        }
    }

    handleSalesUpdated(data) {
        console.log('Vendas atualizadas via sincronização:', data);
        
        // Atualizar estatísticas de vendas no dashboard
        this.updateSalesStats(data);
    }

    handleSupportUpdated(data) {
        console.log('Suporte atualizado via sincronização:', data);
        
        // Atualizar contador de tickets se existir
        const ticketCount = document.querySelector('.ticket-count, .support-badge');
        if (ticketCount && data.pending) {
            ticketCount.textContent = data.pending;
            ticketCount.style.display = data.pending > 0 ? 'inline' : 'none';
        }
    }

    handleSettingsUpdated(data) {
        console.log('Configurações atualizadas via sincronização:', data);
        
        // Aplicar configurações no dashboard
        this.applyDashboardSettings(data.data);
    }

    handleSyncCompleted(data) {
        console.log('Sincronização concluída:', data);
        
        // Mostrar notificação se for de outra fonte
        if (data.source !== 'dashboard') {
            this.showSyncNotification('Dados sincronizados com sucesso!');
        }
    }

    // Métodos auxiliares
    updateUserCounters(count) {
        const userCounters = document.querySelectorAll('.user-count, .total-users');
        userCounters.forEach(counter => {
            if (counter.tagName === 'SPAN' || counter.tagName === 'DIV') {
                counter.textContent = count;
            } else if (counter.tagName === 'INPUT') {
                counter.value = count;
            }
        });
    }

    updateSalesStats(data) {
        // Atualizar estatísticas de vendas
        const salesElements = document.querySelectorAll('.total-sales, .today-sales, .revenue');
        salesElements.forEach(element => {
            const className = element.className;
            if (className.includes('total-sales')) {
                element.textContent = `R$ ${data.total?.toFixed(2) || '0.00'}`;
            } else if (className.includes('today-sales')) {
                element.textContent = data.count || '0';
            }
        });
    }

    applyDashboardSettings(settings) {
        if (!settings) return;
        
        // Aplicar tema
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
            
            // Atualizar seletor de tema se existir
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                themeSelect.value = settings.theme;
            }
        }
        
        // Aplicar nome do sistema
        if (settings.systemName) {
            const systemNames = document.querySelectorAll('.system-name, .app-title');
            systemNames.forEach(el => {
                if (el.tagName === 'TITLE') {
                    el.textContent = `${settings.systemName} - Dashboard`;
                } else {
                    el.textContent = settings.systemName;
                }
            });
        }
    }

    showSyncNotification(message) {
        // Criar notificação não intrusiva
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <i class="fas fa-sync"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Métodos para integração com dashboard existente
    static integrateWithDashboard() {
        // Verificar se é dashboard
        if (!window.location.pathname.includes('dashboard.html')) {
            return null;
        }
        
        const dashboardSync = new DashboardSyncEvents();
        
        // Integrar com sistema de dashboard existente
        if (typeof dashboard !== 'undefined') {
            // Adicionar métodos de sincronização ao dashboard
            dashboard.sync = {
                forceSync: () => window.syncAdmin?.syncData(),
                getStatus: () => window.syncAdmin?.getSyncStatus()
            };
        }
        
        return dashboardSync;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar apenas no dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        window.dashboardSync = DashboardSyncEvents.integrateWithDashboard();
    }
});

// CSS para animações (adicionar ao estilo principal)
const syncStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.sync-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(16, 185, 129, 0.9);
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
}
`;

// Adicionar estilos ao documento
if (document.head) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = syncStyles;
    document.head.appendChild(styleSheet);
}
