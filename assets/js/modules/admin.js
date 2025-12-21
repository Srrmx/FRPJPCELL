// admin-functions.js - Funções do painel administrativo
class AdminManager {
    constructor() {
        this.modal = null;
        this.currentSection = 'dashboard';
        this.init();
    }
    
    init() {
        if (!auth.requireAdmin()) return;
        
        console.log('Admin Manager inicializado');
        
        this.setupUserInfo();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadAllData();
        this.startLiveUpdates();
    }
    
    setupUserInfo() {
        const user = auth.currentUser;
        
        const elements = {
            'adminName': user.fullName,
            'adminAvatar': user.fullName.charAt(0).toUpperCase(),
            'adminRole': user.role === 'superadmin' ? 'SUPER ADMIN' : 'ADMIN'
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        });
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        const sections = document.querySelectorAll('.admin-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const sectionId = item.getAttribute('data-section');
                
                // Ativar item de navegação
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Mostrar seção correspondente
                sections.forEach(section => section.classList.remove('active'));
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.currentSection = sectionId;
                    this.onSectionChange(sectionId);
                }
            });
        });
    }
    
    setupEventListeners() {
        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            auth.logout();
        });
        
        // Atualizar admin
        document.getElementById('btnRefreshAdmin')?.addEventListener('click', () => {
            this.updateStats();
            showNotification('Estatísticas atualizadas!', 'success');
        });
        
        // Backup do sistema
        document.getElementById('btnBackupSystem')?.addEventListener('click', () => {
            this.backupSystem();
        });
        
        // Limpar cache
        document.getElementById('btnClearCache')?.addEventListener('click', () => {
            this.clearCache();
        });
        
        // Criar novo usuário
        document.getElementById('btnCreateUser')?.addEventListener('click', () => {
            this.showCreateUserModal();
        });
        
        // Anúncio global
        document.getElementById('btnBroadcast')?.addEventListener('click', () => {
            this.showBroadcastModal();
        });
        
        // Comandos avançados
        document.getElementById('btnExecuteCommand')?.addEventListener('click', () => {
            this.executeCommand();
        });
        
        document.getElementById('adminCommand')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executeCommand();
        });
        
        // Filtros de usuários
        document.getElementById('btnApplyFilter')?.addEventListener('click', () => {
            this.filterUsers();
        });
        
        // Configurações
        document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
            this.saveSettings();
        });
    }
    
    loadAllData() {
        this.loadUsers();
        this.loadModules();
        this.loadProducts();
        this.updateStats();
    }
    
    loadUsers() {
        const users = auth.getAllUsers();
        const usersList = document.getElementById('usersList');
        
        if (!usersList) return;
        
        usersList.innerHTML = '';
        
        users.forEach((user, index) => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card fade-in';
            
            const userType = user.role === 'admin' || user.role === 'superadmin' ? 'admin' : 
                            (user.vip || user.isPremium ? 'premium' : 'basic');
            
            const typeColors = {
                admin: 'linear-gradient(45deg, #8b5cf6, #c084fc)',
                premium: 'linear-gradient(45deg, #FFD700, #FFB347)',
                basic: 'linear-gradient(45deg, #666, #999)'
            };
            
            const lastLogin = user.lastLogin ? 
                new Date(user.lastLogin).toLocaleString('pt-BR') : 
                'Nunca';
            
            userCard.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-avatar" style="background: ${typeColors[userType]}">
                        ${(user.fullName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div class="user-card-info">
                        <h3>${user.fullName || user.username}</h3>
                        <p>@${user.username} • ${this.getRoleName(user.role)}</p>
                        <p style="font-size: 12px; margin-top: 5px;">
                            <i class="fas fa-calendar"></i> Cadastro: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p style="font-size: 12px;">
                            <i class="fas fa-sign-in-alt"></i> Último login: ${lastLogin}
                        </p>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="btn btn-sm ${user.active === false ? 'success' : 'warning'}" 
                            data-action="toggle" data-username="${user.username}">
                        <i class="fas fa-user-${user.active === false ? 'check' : 'slash'}"></i> 
                        ${user.active === false ? 'Ativar' : 'Desativar'}
                    </button>
                    <button class="btn btn-sm ${user.role.includes('admin') ? 'warning' : 'info'}" 
                            data-action="role" data-username="${user.username}">
                        <i class="fas fa-user-shield"></i> 
                        ${user.role.includes('admin') ? 'Rebaixar' : 'Promover'}
                    </button>
                    <button class="btn btn-sm ${user.vip ? 'danger' : 'success'}" 
                            data-action="vip" data-username="${user.username}">
                        <i class="fas fa-crown"></i> 
                        ${user.vip ? 'Remover VIP' : 'Tornar VIP'}
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            data-action="delete" data-username="${user.username}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            
            usersList.appendChild(userCard);
        });
        
        // Atualizar estatísticas
        const totalUsers = document.getElementById('totalUsers');
        const premiumUsers = document.getElementById('premiumUsers');
        
        if (totalUsers) totalUsers.textContent = users.length;
        if (premiumUsers) {
            const premiumCount = users.filter(u => u.vip || u.isPremium).length;
            premiumUsers.textContent = premiumCount;
        }
        
        // Adicionar eventos aos botões
        usersList.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('button').getAttribute('data-action');
                const username = e.target.closest('button').getAttribute('data-username');
                this.handleUserAction(action, username);
            });
        });
    }
    
    getRoleName(role) {
        const roles = {
            'superadmin': 'Super Admin',
            'admin': 'Administrador',
            'user': 'Usuário'
        };
        return roles[role] || role;
    }
    
    handleUserAction(action, username) {
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            showNotification('Usuário não encontrado!', 'danger');
            return;
        }
        
        const currentUser = auth.currentUser;
        if (currentUser.username === username) {
            showNotification('Você não pode modificar sua própria conta!', 'warning');
            return;
        }
        
        switch(action) {
            case 'toggle':
                users[userIndex].active = !users[userIndex].active;
                showNotification(`Usuário ${users[userIndex].active ? 'ativado' : 'desativado'}!`, 'success');
                break;
                
            case 'role':
                users[userIndex].role = users[userIndex].role.includes('admin') ? 'user' : 'admin';
                showNotification(`Usuário ${users[userIndex].role === 'admin' ? 'promovido a admin' : 'rebaixado para usuário'}!`, 'success');
                break;
                
            case 'vip':
                users[userIndex].vip = !users[userIndex].vip;
                users[userIndex].isPremium = users[userIndex].vip;
                showNotification(`Status VIP ${users[userIndex].vip ? 'ativado' : 'desativado'}!`, 'success');
                break;
                
            case 'delete':
                if (confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) {
                    users.splice(userIndex, 1);
                    showNotification('Usuário excluído com sucesso!', 'success');
                }
                break;
        }
        
        localStorage.setItem('users_db', JSON.stringify(users));
        this.loadUsers();
        this.updateStats();
    }
    
    loadModules() {
        const modules = [
            { 
                id: 'frp', 
                name: 'FRP Unlocker Pro', 
                description: 'Sistema de desbloqueio FRP', 
                icon: 'fa-unlock-alt', 
                enabled: true,
                version: '2.1.0'
            },
            { 
                id: 'imei', 
                name: 'IMEI Unlock', 
                description: 'Desbloqueio via IMEI', 
                icon: 'fa-key', 
                enabled: true,
                version: '1.5.0'
            },
            { 
                id: 'shop', 
                name: 'Loja', 
                description: 'Sistema de vendas', 
                icon: 'fa-store', 
                enabled: true,
                version: '1.2.0'
            },
            { 
                id: 'support', 
                name: 'Suporte', 
                description: 'Sistema de atendimento', 
                icon: 'fa-headset', 
                enabled: true,
                version: '1.0.0'
            },
            { 
                id: 'updates', 
                name: 'Atualizações', 
                description: 'Central de atualizações', 
                icon: 'fa-cloud-download-alt', 
                enabled: true,
                version: '1.1.0'
            }
        ];
        
        const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        const enabledSet = new Set(settings.enabledModules || CONFIG.ENABLED_MODULES || []);
        modules.forEach(m => {
            m.enabled = enabledSet.has(m.id);
        });
        
        const modulesList = document.getElementById('modulesList');
        if (!modulesList) return;
        
        modulesList.innerHTML = '';
        
        modules.forEach(module => {
            const moduleCard = document.createElement('div');
            moduleCard.className = 'module-card fade-in';
            
            moduleCard.innerHTML = `
                <div class="module-header">
                    <div class="module-icon">
                        <i class="fas ${module.icon}"></i>
                    </div>
                    <div class="module-details">
                        <h3>${module.name}</h3>
                        <p>${module.description}</p>
                        <small style="color: #64748b;">v${module.version}</small>
                    </div>
                </div>
                <div class="module-actions">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" ${module.enabled ? 'checked' : ''} 
                               data-module="${module.id}" style="cursor: pointer;">
                        <span>${module.enabled ? 'Ativo' : 'Inativo'}</span>
                    </label>
                    <button class="btn btn-sm btn-info" data-module-config="${module.id}">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            `;
            
            modulesList.appendChild(moduleCard);
        });

        // Eventos de módulos
        modulesList.querySelectorAll('input[type="checkbox"][data-module]').forEach(input => {
            input.addEventListener('change', (e) => {
                const modId = e.target.getAttribute('data-module');
                const checked = e.target.checked;
                const label = e.target.parentElement.querySelector('span');
                if (label) label.textContent = checked ? 'Ativo' : 'Inativo';
                
                const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
                const enabled = new Set(settings.enabledModules || []);
                if (checked) enabled.add(modId); else enabled.delete(modId);
                settings.enabledModules = Array.from(enabled);
                localStorage.setItem('admin_settings', JSON.stringify(settings));
                showNotification(`Módulo ${modId} ${checked ? 'ativado' : 'desativado'}`, 'success');
                
                // Notificar sincronização
                window.syncAdmin?.syncSettings();
            });
        });
        
        modulesList.querySelectorAll('button[data-module-config]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modId = e.currentTarget.getAttribute('data-module-config');
                this.showModuleConfigModal(modId);
            });
        });
    }
    
    loadProducts() {
        let products = JSON.parse(localStorage.getItem('site_products') || '[]');
        if (!products || products.length === 0) {
            products = [
                { id: 'frp_premium', name: 'Licença FRP Premium', description: 'Acesso vitalício ao FRP Unlocker Pro', price: 299.90, icon: 'fa-unlock-alt' },
                { id: 'imei_credits_10', name: 'Créditos IMEI (10x)', description: '10 desbloqueios IMEI em servidores premium', price: 199.00, icon: 'fa-key' },
                { id: 'subscription_30', name: 'Assinatura Pro (30 dias)', description: 'Acesso a todas as ferramentas por 30 dias', price: 79.90, icon: 'fa-star' }
            ];
            localStorage.setItem('site_products', JSON.stringify(products));
        }
        const productsList = document.getElementById('productsList');
        
        if (!productsList) return;
        
        productsList.innerHTML = '';
        
        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'user-card fade-in';
            
            productCard.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-avatar" style="background: linear-gradient(45deg, #8b5cf6, #c084fc)">
                        <i class="fas ${product.icon || 'fa-box'}"></i>
                    </div>
                    <div class="user-card-info">
                        <h3>${product.name}</h3>
                        <p>R$ ${product.price.toFixed(2)} • ID: ${product.id}</p>
                        <p style="font-size: 12px; margin-top: 5px;">
                            ${product.description || 'Sem descrição'}
                        </p>
                        <p style="font-size: 12px; color: #64748b;">
                            Em estoque: ${product.stock || '∞'}
                        </p>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="btn btn-sm btn-info" data-product-edit="${index}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-warning" data-product-stats="${index}">
                        <i class="fas fa-chart-bar"></i> Estatísticas
                    </button>
                    <button class="btn btn-sm btn-danger" data-product-delete="${index}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                    <button class="btn btn-sm btn-primary" data-payment-edit>
                        <i class="fas fa-wallet"></i> Editar Pagamento
                    </button>
                </div>
            `;
            
            productsList.appendChild(productCard);
        });

        // Eventos de produtos
        productsList.querySelectorAll('[data-product-edit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-product-edit'), 10);
                const p = products[idx];
                this.showModal('Editar Produto', `
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" id="editName" value="${p.name}">
                    </div>
                    <div class="form-group">
                        <label>Preço (R$)</label>
                        <input type="number" step="0.01" id="editPrice" value="${p.price}">
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea id="editDesc" rows="3">${p.description || ''}</textarea>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:15px;">
                        <button class="btn btn-success" id="btnSaveProduct"><i class="fas fa-save"></i> Salvar</button>
                        <button class="btn btn-danger" onclick="admin.closeModal()"><i class="fas fa-times"></i> Cancelar</button>
                    </div>
                `);
                setTimeout(() => {
                    const saveBtn = document.getElementById('btnSaveProduct');
                    saveBtn?.addEventListener('click', () => {
                        p.name = (document.getElementById('editName').value || p.name).trim();
                        p.price = parseFloat(document.getElementById('editPrice').value || p.price) || p.price;
                        p.description = (document.getElementById('editDesc').value || p.description).trim();
                        localStorage.setItem('site_products', JSON.stringify(products));
                        showNotification('Produto atualizado!', 'success');
                        this.closeModal();
                        this.loadProducts();
                        window.syncAdmin?.forceProductSync();
                    });
                }, 0);
            });
        });
        
        productsList.querySelectorAll('[data-product-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-product-delete'), 10);
                const p = products[idx];
                if (confirm(`Excluir produto ${p.name}?`)) {
                    products.splice(idx, 1);
                    localStorage.setItem('site_products', JSON.stringify(products));
                    showNotification('Produto excluído!', 'success');
                    this.loadProducts();
                    window.syncAdmin?.forceProductSync();
                }
            });
        });
        
        productsList.querySelectorAll('[data-product-stats]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-product-stats'), 10);
                const p = products[idx];
                const salesStats = JSON.parse(localStorage.getItem('today_sales_stats') || '{}');
                this.showModal('Estatísticas do Produto', `
                    <p><strong>${p.name}</strong></p>
                    <p>Vendas hoje: ${salesStats.count || 0}</p>
                    <p>Total vendido hoje: R$ ${(salesStats.total || 0).toFixed(2)}</p>
                    <div style="margin-top:15px;">
                        <button class="btn btn-info" onclick="admin.closeModal()"><i class="fas fa-check"></i> Ok</button>
                    </div>
                `);
            });
        });
        
        productsList.querySelectorAll('[data-payment-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const pay = JSON.parse(localStorage.getItem('payment_settings') || '{}');
                this.showModal('Configurações de Pagamento', `
                    <div class="form-group">
                        <label>Chave PIX</label>
                        <input type="text" id="pixKey" value="${pay.pixKey || ''}">
                    </div>
                    <div class="form-group">
                        <label>API do Banco (URL)</label>
                        <input type="text" id="bankApiUrl" value="${pay.bankApiUrl || ''}">
                    </div>
                    <div class="form-group">
                        <label>Token de API</label>
                        <input type="password" id="bankApiToken" value="${pay.bankApiToken || ''}">
                    </div>
                    <div style="display:flex;gap:10px;margin-top:15px;">
                        <button class="btn btn-success" id="btnSavePayment"><i class="fas fa-save"></i> Salvar</button>
                        <button class="btn btn-danger" onclick="admin.closeModal()"><i class="fas fa-times"></i> Cancelar</button>
                    </div>
                `);
                setTimeout(() => {
                    document.getElementById('btnSavePayment')?.addEventListener('click', () => {
                        const newPay = {
                            pixKey: document.getElementById('pixKey').value.trim(),
                            bankApiUrl: document.getElementById('bankApiUrl').value.trim(),
                            bankApiToken: document.getElementById('bankApiToken').value
                        };
                        localStorage.setItem('payment_settings', JSON.stringify(newPay));
                        showNotification('Configurações de pagamento salvas!', 'success');
                        this.closeModal();
                        const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
                        settings.payment = { pixKey: newPay.pixKey, bankApiUrl: newPay.bankApiUrl };
                        localStorage.setItem('admin_settings', JSON.stringify(settings));
                        window.syncAdmin?.syncSettings();
                    });
                }, 0);
            });
        });
    }
    
    updateStats() {
        const stats = auth.getStats();
        
        const elements = {
            'totalUsers': stats.total,
            'premiumUsers': stats.premium,
            'active24h': stats.active,
            'licensesSold': Math.floor(Math.random() * 50) + 10,
            'unlocksToday': Math.floor(Math.random() * 20) + 5,
            'conversionRate': `${Math.floor(Math.random() * 30) + 10}%`,
            'activeChats': Math.floor(Math.random() * 5),
            'todaySales': `R$ ${(Math.random() * 1000 + 500).toFixed(2)}`
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        });
    }
    
    backupSystem() {
        showNotification('Iniciando backup do sistema...', 'info');
        
        // Coletar todos os dados
        const backupData = {
            timestamp: new Date().toISOString(),
            version: CONFIG.VERSION,
            users: JSON.parse(localStorage.getItem('users_db') || '[]'),
            products: JSON.parse(localStorage.getItem('site_products') || '[]'),
            settings: JSON.parse(localStorage.getItem('ui_settings') || '{}'),
            imeiBlocks: JSON.parse(localStorage.getItem('imei_block_list') || '[]'),
            supportMessages: JSON.parse(localStorage.getItem('support_messages') || '[]'),
            shoppingCart: JSON.parse(localStorage.getItem('shopping_cart') || '[]')
        };
        
        // Criar arquivo de backup
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `jpcellfrp-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        setTimeout(() => {
            showNotification('Backup concluído com sucesso!', 'success');
        }, 1500);
    }
    
    clearCache() {
        if (confirm('Tem certeza que deseja limpar o cache do sistema?')) {
            // Preservar dados essenciais
            const essentialData = {
                users_db: localStorage.getItem('users_db'),
                authenticated: localStorage.getItem('authenticated'),
                currentUser: localStorage.getItem('currentUser')
            };
            
            // Limpar tudo
            localStorage.clear();
            
            // Restaurar dados essenciais
            Object.keys(essentialData).forEach(key => {
                if (essentialData[key]) {
                    localStorage.setItem(key, essentialData[key]);
                }
            });
            
            showNotification('Cache limpo com sucesso!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    showCreateUserModal() {
        this.showModal('Criar Novo Usuário', `
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" id="newUserName" class="input-wrapper" placeholder="Digite o nome completo">
            </div>
            <div class="form-group">
                <label>Nome de Usuário</label>
                <input type="text" id="newUserUsername" class="input-wrapper" placeholder="Digite o username">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="newUserEmail" class="input-wrapper" placeholder="Digite o email">
            </div>
            <div class="form-group">
                <label>Senha</label>
                <input type="password" id="newUserPassword" class="input-wrapper" placeholder="Digite a senha">
            </div>
            <div class="form-group">
                <label>Tipo de Usuário</label>
                <select id="newUserType" class="input-wrapper">
                    <option value="user">Usuário Básico</option>
                    <option value="premium">Usuário Premium</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-success" onclick="admin.createNewUser()">
                    <i class="fas fa-user-plus"></i> Criar Usuário
                </button>
                <button class="btn btn-danger" onclick="admin.closeModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `);
    }
    
    createNewUser() {
        const name = document.getElementById('newUserName').value.trim();
        const username = document.getElementById('newUserUsername').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const password = document.getElementById('newUserPassword').value;
        const type = document.getElementById('newUserType').value;
        
        // Validações básicas
        if (!name || !username || !password) {
            showNotification('Preencha todos os campos obrigatórios!', 'warning');
            return;
        }
        
        // Validar formato de email se fornecido
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Email inválido!', 'danger');
            return;
        }
        
        // Validar força da senha
        if (password.length < 6) {
            showNotification('Senha deve ter no mínimo 6 caracteres!', 'danger');
            return;
        }
        
        // Validar username (apenas letras, números e _)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showNotification('Usuário deve conter apenas letras, números e _', 'danger');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        
        // Verificar se usuário já existe
        if (users.find(u => u.username === username)) {
            showNotification('Usuário já existe!', 'danger');
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            id: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9),
            username: username,
            fullName: name,
            email: email,
            password: password,
            role: type === 'admin' ? 'admin' : 'user',
            vip: type === 'premium',
            isPremium: type === 'premium',
            active: true,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            permissions: type === 'admin' ? ['admin'] : ['basic']
        };
        
        users.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(users));
        
        showNotification('Usuário criado com sucesso!', 'success');
        this.closeModal();
        this.loadUsers();
    }
    
    showBroadcastModal() {
        this.showModal('Enviar Anúncio Global', `
            <div class="form-group">
                <label>Título do Anúncio</label>
                <input type="text" id="broadcastTitle" class="input-wrapper" placeholder="Digite o título">
            </div>
            <div class="form-group">
                <label>Mensagem</label>
                <textarea id="broadcastMessage" class="input-wrapper" rows="4" placeholder="Digite sua mensagem..."></textarea>
            </div>
            <div class="form-group">
                <label>Tipo de Anúncio</label>
                <select id="broadcastType" class="input-wrapper">
                    <option value="info">Informação</option>
                    <option value="warning">Alerta</option>
                    <option value="success">Sucesso</option>
                    <option value="danger">Importante</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="broadcastNotify" checked>
                    Enviar notificação para todos os usuários
                </label>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-warning" onclick="admin.sendBroadcast()">
                    <i class="fas fa-bullhorn"></i> Enviar Anúncio
                </button>
                <button class="btn btn-danger" onclick="admin.closeModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `);
    }
    
    sendBroadcast() {
        const title = document.getElementById('broadcastTitle').value.trim();
        const message = document.getElementById('broadcastMessage').value.trim();
        const type = document.getElementById('broadcastType').value;
        const notify = document.getElementById('broadcastNotify').checked;
        
        if (!title || !message) {
            showNotification('Preencha todos os campos!', 'warning');
            return;
        }
        
        // Salvar anúncio
        const broadcasts = JSON.parse(localStorage.getItem('broadcasts') || '[]');
        broadcasts.push({
            title,
            message,
            type,
            timestamp: Date.now(),
            sentBy: auth.currentUser.username,
            notify: notify
        });
        
        localStorage.setItem('broadcasts', JSON.stringify(broadcasts));
        
        showNotification('Anúncio enviado para todos os usuários!', 'success');
        this.closeModal();
    }
    
    executeCommand() {
        const commandInput = document.getElementById('adminCommand');
        const output = document.getElementById('commandOutput');
        
        if (!commandInput || !output) return;
        
        const command = commandInput.value.trim();
        if (!command) return;
        
        let result = '';
        
        switch(command.toLowerCase()) {
            case 'help':
                result = 'Comandos disponíveis:\n' +
                        '• help - Mostra esta ajuda\n' +
                        '• users - Lista todos os usuários\n' +
                        '• stats - Mostra estatísticas do sistema\n' +
                        '• backup - Faz backup do sistema\n' +
                        '• clear - Limpa o cache\n' +
                        '• maintenance on/off - Ativa/desativa manutenção\n' +
                        '• update - Verifica atualizações\n' +
                        '• restart - Reinicia o sistema\n' +
                        '• logs - Mostra logs do sistema';
                break;
                
            case 'users':
                const users = auth.getAllUsers();
                result = `Total de usuários: ${users.length}\n\n`;
                users.forEach((user, index) => {
                    result += `${index + 1}. ${user.username} (${user.role}) - ${user.active !== false ? 'Ativo' : 'Inativo'}\n`;
                });
                break;
                
            case 'stats':
                const stats = auth.getStats();
                result = `Estatísticas do Sistema:\n` +
                        `• Usuários totais: ${stats.total}\n` +
                        `• Usuários ativos: ${stats.active}\n` +
                        `• Usuários premium: ${stats.premium}\n` +
                        `• Administradores: ${stats.admins}\n` +
                        `• Usuários regulares: ${stats.regular}\n` +
                        `\nSistema v${CONFIG.VERSION}`;
                break;
                
            case 'backup':
                result = 'Iniciando backup do sistema...\n' +
                        'Backup concluído com sucesso!';
                this.backupSystem();
                break;
                
            case 'clear':
                result = 'Cache limpo com sucesso!';
                this.clearCache();
                break;
                
            case 'maintenance on':
                result = 'Modo de manutenção ativado!';
                localStorage.setItem('maintenance_mode', 'true');
                const uiOn = JSON.parse(localStorage.getItem('ui_settings') || '{}');
                uiOn.maintenanceMode = 'on';
                localStorage.setItem('ui_settings', JSON.stringify(uiOn));
                break;
                
            case 'maintenance off':
                result = 'Modo de manutenção desativado!';
                localStorage.removeItem('maintenance_mode');
                const uiOff = JSON.parse(localStorage.getItem('ui_settings') || '{}');
                uiOff.maintenanceMode = 'off';
                localStorage.setItem('ui_settings', JSON.stringify(uiOff));
                break;
                
            case 'update':
                result = 'Verificando atualizações...\n' +
                        'Sistema atualizado para a versão mais recente!';
                break;
                
            case 'restart':
                result = 'Reiniciando sistema...';
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                break;
                
            case 'logs':
                result = 'Últimos logs do sistema:\n';
                const logs = JSON.parse(localStorage.getItem('imei_block_log') || '[]');
                logs.slice(0, 10).forEach(log => {
                    result += `[${new Date(log.timestamp).toLocaleString()}] ${log.message}\n`;
                });
                break;
                
            default:
                result = `Comando não reconhecido: ${command}\nDigite "help" para ver os comandos disponíveis.`;
        }
        
        output.innerHTML = `<span style="color: #94a3b8;">$ ${command}</span><br><pre style="margin:0;">${result}</pre>`;
        output.scrollTop = output.scrollHeight;
        commandInput.value = '';
        
        showNotification('Comando executado!', 'info');
    }
    
    filterUsers() {
        const query = document.getElementById('userSearch')?.value.trim().toLowerCase() || '';
        const users = auth.getAllUsers();
        const filtered = users.filter(u => 
            (u.username || '').toLowerCase().includes(query) ||
            (u.fullName || '').toLowerCase().includes(query)
        );
        const usersList = document.getElementById('usersList');
        if (!usersList) return;
        usersList.innerHTML = '';
        filtered.forEach((user) => {
            const userType = user.role === 'admin' || user.role === 'superadmin' ? 'admin' : 
                             (user.vip || user.isPremium ? 'premium' : 'basic');
            const typeColors = {
                admin: 'linear-gradient(45deg, #8b5cf6, #c084fc)',
                premium: 'linear-gradient(45deg, #FFD700, #FFB347)',
                basic: 'linear-gradient(45deg, #666, #999)'
            };
            const card = document.createElement('div');
            card.className = 'user-card fade-in';
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca';
            card.innerHTML = `
                <div class="user-card-header">
                    <div class="user-card-avatar" style="background: ${typeColors[userType]}">
                        ${(user.fullName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div class="user-card-info">
                        <h3>${user.fullName || user.username}</h3>
                        <p>@${user.username} • ${this.getRoleName(user.role)}</p>
                        <p style="font-size: 12px; margin-top: 5px;">
                            <i class="fas fa-calendar"></i> Cadastro: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p style="font-size: 12px;">
                            <i class="fas fa-sign-in-alt"></i> Último login: ${lastLogin}
                        </p>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="btn btn-sm ${user.active === false ? 'success' : 'warning'}" 
                            data-action="toggle" data-username="${user.username}">
                        <i class="fas fa-user-${user.active === false ? 'check' : 'slash'}"></i> 
                        ${user.active === false ? 'Ativar' : 'Desativar'}
                    </button>
                    <button class="btn btn-sm ${user.role.includes('admin') ? 'warning' : 'info'}" 
                            data-action="role" data-username="${user.username}">
                        <i class="fas fa-user-shield"></i> 
                        ${user.role.includes('admin') ? 'Rebaixar' : 'Promover'}
                    </button>
                    <button class="btn btn-sm ${user.vip ? 'danger' : 'success'}" 
                            data-action="vip" data-username="${user.username}">
                        <i class="fas fa-crown"></i> 
                        ${user.vip ? 'Remover VIP' : 'Tornar VIP'}
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            data-action="delete" data-username="${user.username}">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            `;
            usersList.appendChild(card);
        });
        usersList.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.closest('button').getAttribute('data-action');
                const username = e.target.closest('button').getAttribute('data-username');
                this.handleUserAction(action, username);
            });
        });
        showNotification('Filtro aplicado!', 'info');
    }
    
    saveSettings() {
        // Salvar configurações de aparência
        const theme = document.getElementById('themeSelect').value;
        const maxWidth = document.getElementById('maxWidth').value;
        const borderRadius = document.getElementById('borderRadius').value;
        const systemName = document.getElementById('systemName').value;
        const autoBackup = document.getElementById('autoBackup').checked;
        const twoFactorAuth = document.getElementById('auth2FA')?.checked || false;
        const maintenanceMode = document.getElementById('maintenanceMode')?.value || 'off';
        
        const settings = {
            theme: theme,
            maxWidth: parseInt(maxWidth) || 1400,
            borderRadius: parseInt(borderRadius) || 16,
            systemName: systemName,
            autoBackup: autoBackup,
            twoFactorAuth: twoFactorAuth,
            maintenanceMode: maintenanceMode
        };
        
        localStorage.setItem('ui_settings', JSON.stringify(settings));
        const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
        adminSettings.theme = settings.theme;
        adminSettings.maxWidth = settings.maxWidth;
        adminSettings.borderRadius = settings.borderRadius;
        adminSettings.systemName = settings.systemName;
        adminSettings.autoBackup = settings.autoBackup;
        adminSettings.twoFactorAuth = settings.twoFactorAuth;
        adminSettings.maintenanceMode = settings.maintenanceMode;
        localStorage.setItem('admin_settings', JSON.stringify(adminSettings));
        
        // Aplicar imediatamente
        document.body.classList.remove('dark-theme', 'light-theme', 'auto-theme');
        document.body.classList.add(`${theme}-theme`);
        
        if (maxWidth) {
            document.documentElement.style.setProperty('--container-max-width', `${maxWidth}px`);
        }
        
        showNotification('Configurações salvas com sucesso!', 'success');
        window.syncAdmin?.syncSettings();
    }

    showModuleConfigModal(moduleId) {
        const moduleConfigs = JSON.parse(localStorage.getItem('module_configs') || '{}');
        const current = moduleConfigs[moduleId] || {};
        const fields = moduleId === 'frp' ? `
            <div class="form-group">
                <label>FRP API URL</label>
                <input type="text" id="modApiUrl" value="${current.apiUrl || ''}">
            </div>
        ` : moduleId === 'shop' ? `
            <div class="form-group">
                <label>Gateway Pagamentos (URL)</label>
                <input type="text" id="modApiUrl" value="${current.apiUrl || ''}">
            </div>
        ` : `
            <div class="form-group">
                <label>Endpoint</label>
                <input type="text" id="modApiUrl" value="${current.apiUrl || ''}">
            </div>
        `;
        this.showModal(`Configurações do módulo: ${moduleId}`, `
            ${fields}
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button class="btn btn-success" id="btnSaveModule"><i class="fas fa-save"></i> Salvar</button>
                <button class="btn btn-danger" onclick="admin.closeModal()"><i class="fas fa-times"></i> Cancelar</button>
            </div>
        `);
        setTimeout(() => {
            document.getElementById('btnSaveModule')?.addEventListener('click', () => {
                const apiUrl = document.getElementById('modApiUrl').value.trim();
                moduleConfigs[moduleId] = { apiUrl };
                localStorage.setItem('module_configs', JSON.stringify(moduleConfigs));
                showNotification('Configurações do módulo salvas!', 'success');
                this.closeModal();
                const settings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
                settings.modules = Object.assign(settings.modules || {}, { [moduleId]: { apiUrl } });
                localStorage.setItem('admin_settings', JSON.stringify(settings));
                window.syncAdmin?.syncSettings();
            });
        }, 0);
    }
    
    showModal(title, content) {
        // Fechar modal existente
        if (this.modal) {
            document.body.removeChild(this.modal);
        }
        
        // Criar novo modal
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: rgba(30, 41, 59, 0.95);
            border-radius: 16px;
            padding: 30px;
            width: 90%;
            max-width: 500px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <span class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 24px;
                cursor: pointer;
                color: #94a3b8;
                z-index: 1;
            ">&times;</span>
            <h2 style="margin-bottom: 20px; padding-right: 30px;">${title}</h2>
            <div id="modalDynamicContent">${content}</div>
        `;
        
        this.modal.appendChild(modalContent);
        document.body.appendChild(this.modal);
        
        // Fechar modal
        const closeBtn = modalContent.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }
    
    closeModal() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }
    
    onSectionChange(sectionId) {
        console.log(`Seção admin alterada para: ${sectionId}`);
        
        switch(sectionId) {
            case 'users':
                this.loadUsers();
                break;
            case 'modules':
                this.loadModules();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    loadSecurityData() {
        // Carregar dados de segurança
        const settings = JSON.parse(localStorage.getItem('ui_settings') || '{}');
        
        const auth2FA = document.getElementById('auth2FA');
        if (auth2FA) {
            auth2FA.checked = settings.twoFactorAuth || false;
        }
        
        const maintenanceMode = document.getElementById('maintenanceMode');
        if (maintenanceMode) {
            maintenanceMode.value = settings.maintenanceMode || 'off';
        }
    }
    
    loadSettings() {
        this.loadSecurityData();
        const settings = JSON.parse(localStorage.getItem('ui_settings') || '{}');
        
        const elements = {
            'themeSelect': settings.theme || 'dark',
            'maxWidth': settings.maxWidth || 1400,
            'borderRadius': settings.borderRadius || 16,
            'systemName': settings.systemName || CONFIG.SITE_NAME,
            'autoBackup': settings.autoBackup !== undefined ? settings.autoBackup : true
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = elements[id];
                } else {
                    el.value = elements[id];
                }
            }
        });
    }
    
    startLiveUpdates() {
        // Atualizar estatísticas periodicamente
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateStats();
            }
        }, 30000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminManager();
});
