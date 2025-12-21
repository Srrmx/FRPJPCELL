// sync-admin.js
// Sistema de sincronização entre Dashboard e Admin

class SyncAdminSystem {
    constructor() {
        this.syncInterval = 30000; // 30 segundos
        this.lastSync = null;
        this.isAdmin = window.location.pathname.includes('admin.html');
        this.init();
    }

    init() {
        console.log('Sistema de sincronização inicializado');
        
        // Iniciar sincronização periódica
        this.startPeriodicSync();
        
        // Ouvir eventos de sincronização do localStorage
        this.setupStorageListener();
        
        // Sincronização inicial
        this.syncData();
    }

    startPeriodicSync() {
        setInterval(() => {
            this.syncData();
        }, this.syncInterval);
    }

    setupStorageListener() {
        // Monitorar mudanças no localStorage
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('_sync')) {
                this.handleStorageChange(e.key, e.newValue);
            }
        });
    }

    syncData() {
        console.log('Iniciando sincronização de dados...');
        this.lastSync = new Date();

        try {
            // Sincronizar usuários
            this.syncUsers();
            
            // Sincronizar produtos
            this.syncProducts();
            
            // Sincronizar vendas
            this.syncSales();
            
            // Sincronizar tickets de suporte
            this.syncSupportTickets();
            
            // Sincronizar configurações
            this.syncSettings();
            
            // Notificar outras abas/janelas
            this.notifySync();
            
            console.log('Sincronização concluída:', this.lastSync);
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
        }
    }

    syncUsers() {
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const syncKey = 'users_sync';
        
        // Salvar timestamp da última modificação
        localStorage.setItem(syncKey, JSON.stringify({
            count: users.length,
            lastUpdate: Date.now(),
            source: this.isAdmin ? 'admin' : 'dashboard'
        }));
        
        // Atualizar estatísticas
        this.updateUserStats(users);
    }

    updateUserStats(users) {
        const stats = {
            total: users.length,
            active: users.filter(u => u.active !== false).length,
            premium: users.filter(u => u.vip || u.isPremium).length,
            admins: users.filter(u => u.role === 'admin').length,
            lastSync: Date.now()
        };
        
        localStorage.setItem('user_stats', JSON.stringify(stats));
        
        // Atualizar UI se estiver no admin
        if (this.isAdmin && typeof admin !== 'undefined') {
            admin.updateStats();
        }
    }

    syncProducts() {
        const products = JSON.parse(localStorage.getItem('site_products') || '[]');
        const syncKey = 'products_sync';
        
        localStorage.setItem(syncKey, JSON.stringify({
            count: products.length,
            lastUpdate: Date.now(),
            source: this.isAdmin ? 'admin' : 'dashboard'
        }));
        
        // Calcular estatísticas de produtos
        const productStats = {
            total: products.length,
            totalValue: products.reduce((sum, p) => sum + p.price, 0),
            averagePrice: products.length > 0 ? 
                products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
            lastSync: Date.now()
        };
        
        localStorage.setItem('product_stats', JSON.stringify(productStats));
    }

    syncSales() {
        const sales = JSON.parse(localStorage.getItem('sales_data') || '[]');
        const syncKey = 'sales_sync';
        
        localStorage.setItem(syncKey, JSON.stringify({
            count: sales.length,
            total: sales.reduce((sum, s) => sum + (s.amount || 0), 0),
            lastUpdate: Date.now(),
            source: this.isAdmin ? 'admin' : 'dashboard'
        }));
        
        // Calcular vendas do dia
        const today = new Date().toDateString();
        const todaySales = sales.filter(s => {
            const saleDate = new Date(s.date || Date.now()).toDateString();
            return saleDate === today;
        });
        
        const todayStats = {
            count: todaySales.length,
            total: todaySales.reduce((sum, s) => sum + (s.amount || 0), 0),
            date: today
        };
        
        localStorage.setItem('today_sales_stats', JSON.stringify(todayStats));
    }

    syncSupportTickets() {
        const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
        const syncKey = 'support_sync';
        
        localStorage.setItem(syncKey, JSON.stringify({
            count: tickets.length,
            pending: tickets.filter(t => t.status === 'pending').length,
            active: tickets.filter(t => t.status === 'active').length,
            lastUpdate: Date.now(),
            source: this.isAdmin ? 'admin' : 'dashboard'
        }));
    }

    syncSettings() {
        const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        const syncKey = 'settings_sync';
        
        localStorage.setItem(syncKey, JSON.stringify({
            lastUpdate: Date.now(),
            source: this.isAdmin ? 'admin' : 'dashboard',
            data: settings
        }));
    }

    notifySync() {
        // Disparar evento de sincronização
        const event = new CustomEvent('syncCompleted', {
            detail: {
                timestamp: this.lastSync,
                source: this.isAdmin ? 'admin' : 'dashboard'
            }
        });
        window.dispatchEvent(event);
        
        // Atualizar timestamp no localStorage
        localStorage.setItem('last_sync', this.lastSync.getTime());
    }

    handleStorageChange(key, value) {
        console.log('Mudança detectada no storage:', key);
        
        try {
            const data = JSON.parse(value);
            
            switch(key) {
                case 'users_sync':
                    this.handleUsersUpdate(data);
                    break;
                    
                case 'products_sync':
                    this.handleProductsUpdate(data);
                    break;
                    
                case 'sales_sync':
                    this.handleSalesUpdate(data);
                    break;
                    
                case 'support_sync':
                    this.handleSupportUpdate(data);
                    break;
                    
                case 'settings_sync':
                    this.handleSettingsUpdate(data);
                    break;
            }
            
        } catch (error) {
            console.error('Erro ao processar mudança no storage:', error);
        }
    }

    handleUsersUpdate(data) {
        if (this.isAdmin && typeof admin !== 'undefined') {
            // Forçar atualização da lista de usuários no admin
            admin.loadUsers();
            admin.updateStats();
        }
        
        // Disparar evento de atualização de usuários
        const event = new CustomEvent('usersUpdated', { detail: data });
        window.dispatchEvent(event);
    }

    handleProductsUpdate(data) {
        if (this.isAdmin && typeof admin !== 'undefined') {
            // Forçar atualização da lista de produtos no admin
            admin.loadProducts();
        }
        
        // Disparar evento de atualização de produtos
        const event = new CustomEvent('productsUpdated', { detail: data });
        window.dispatchEvent(event);
    }

    handleSalesUpdate(data) {
        if (this.isAdmin && typeof admin !== 'undefined') {
            // Atualizar estatísticas de vendas
            admin.updateStats();
        }
        
        // Disparar evento de atualização de vendas
        const event = new CustomEvent('salesUpdated', { detail: data });
        window.dispatchEvent(event);
    }

    handleSupportUpdate(data) {
        if (this.isAdmin && typeof admin !== 'undefined') {
            // Atualizar contador de tickets pendentes
            const pendingTickets = document.getElementById('pendingTickets');
            if (pendingTickets) {
                pendingTickets.textContent = `${data.pending} pendentes`;
            }
        }
        
        // Disparar evento de atualização de suporte
        const event = new CustomEvent('supportUpdated', { detail: data });
        window.dispatchEvent(event);
    }

    handleSettingsUpdate(data) {
        // Aplicar configurações atualizadas
        if (data.data) {
            this.applySettings(data.data);
        }
        
        // Disparar evento de atualização de configurações
        const event = new CustomEvent('settingsUpdated', { detail: data });
        window.dispatchEvent(event);
    }

    applySettings(settings) {
        // Aplicar tema
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }
        
        // Aplicar raios dos cantos
        if (settings.borderRadius) {
            document.documentElement.style.setProperty('--radius-card', `${settings.borderRadius}px`);
            document.documentElement.style.setProperty('--radius-btn', `${settings.borderRadius - 6}px`);
        }
        
        // Aplicar largura máxima
        if (settings.maxWidth && this.isAdmin) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.maxWidth = `${settings.maxWidth}px`;
                mainContent.style.margin = '0 auto';
            }
        }
    }

    // Métodos para forçar sincronização de outras páginas
    forceUserSync() {
        localStorage.setItem('force_user_sync', Date.now().toString());
        this.syncUsers();
    }

    forceProductSync() {
        localStorage.setItem('force_product_sync', Date.now().toString());
        this.syncProducts();
    }

    forceSalesSync() {
        localStorage.setItem('force_sales_sync', Date.now().toString());
        this.syncSales();
    }

    forceSupportSync() {
        localStorage.setItem('force_support_sync', Date.now().toString());
        this.syncSupportTickets();
    }

    // Métodos utilitários
    getSyncStatus() {
        return {
            lastSync: this.lastSync,
            isAdmin: this.isAdmin,
            users: JSON.parse(localStorage.getItem('users_sync') || 'null'),
            products: JSON.parse(localStorage.getItem('products_sync') || 'null'),
            sales: JSON.parse(localStorage.getItem('sales_sync') || 'null'),
            support: JSON.parse(localStorage.getItem('support_sync') || 'null')
        };
    }

    resetSyncData() {
        const syncKeys = [
            'users_sync',
            'products_sync',
            'sales_sync',
            'support_sync',
            'settings_sync',
            'last_sync',
            'user_stats',
            'product_stats',
            'today_sales_stats'
        ];
        
        syncKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('Dados de sincronização resetados');
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.syncAdmin = new SyncAdminSystem();
    
    // Expor métodos globais para debug
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugSync = {
            forceSync: () => window.syncAdmin.syncData(),
            getStatus: () => window.syncAdmin.getSyncStatus(),
            reset: () => window.syncAdmin.resetSyncData()
        };
    }
});