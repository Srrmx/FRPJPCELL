// auth.js - Sistema de autenticação completo (CORRIGIDO)
const auth = {
    // Inicializar banco de dados
    init: function() {
        if (!localStorage.getItem('users_db')) {
            const defaultUsers = [
                {
                    id: 'admin001',
                    username: 'admin',
                    fullName: 'Administrador Principal',
                    email: 'admin@jpcellfrp.com',
                    phone: '(11) 99999-9999',
                    password: 'admin123',
                    role: 'superadmin',
                    vip: true,
                    isPremium: true,
                    active: true,
                    createdAt: Date.now(),
                    lastLogin: Date.now(),
                    permissions: ['all']
                },
                {
                    id: 'user001',
                    username: 'usuario',
                    fullName: 'Usuário Teste',
                    email: 'usuario@teste.com',
                    phone: '(11) 88888-8888',
                    password: 'usuario123',
                    role: 'user',
                    vip: false,
                    isPremium: false,
                    active: true,
                    createdAt: Date.now(),
                    lastLogin: Date.now(),
                    permissions: ['basic']
                }
            ];
            
            localStorage.setItem('users_db', JSON.stringify(defaultUsers));
        }
    },

    // Verificar se o usuário está autenticado
    isAuthenticated: function() {
        try {
            const auth = localStorage.getItem('authenticated') === 'true';
            const currentUser = localStorage.getItem('currentUser');
            const usersData = localStorage.getItem('users_db') || '[]';
            const users = JSON.parse(usersData);
            const user = users.find(u => u.username === currentUser);
            
            return auth && user && user.active !== false;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            return false;
        }
    },

    // Obter usuário atual
    get currentUser() {
        try {
            const username = localStorage.getItem('currentUser') || '';
            const usersData = localStorage.getItem('users_db') || '[]';
            const users = JSON.parse(usersData);
            const user = users.find(u => u.username === username) || {};
            
            return {
                id: user.id || '',
                username: username,
                fullName: user.fullName || username,
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'user',
                vip: user.vip || false,
                isPremium: user.isPremium || false,
                active: user.active !== false,
                createdAt: user.createdAt || Date.now(),
                permissions: user.permissions || ['basic']
            };
        } catch (error) {
            console.error('Erro ao obter usuário atual:', error);
            return {
                id: '',
                username: '',
                fullName: 'Usuário',
                email: '',
                phone: '',
                role: 'user',
                vip: false,
                isPremium: false,
                active: false,
                createdAt: Date.now(),
                permissions: ['basic']
            };
        }
    },

    // Fazer login
    login: function(username, password) {
        this.init();
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.active !== false
        );
        
        if (user) {
            // Atualizar último login
            user.lastLogin = Date.now();
            localStorage.setItem('users_db', JSON.stringify(users));
            
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('currentUser', username);
            return { success: true, user: user };
        }
        
        return { success: false, message: 'Credenciais inválidas' };
    },

    // Fazer logout
    logout: function() {
        localStorage.removeItem('authenticated');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Registrar novo usuário
    register: function(userData) {
        this.init();
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        
        // Validações
        if (!userData.username || userData.username.length < 3) {
            return { success: false, message: 'Usuário deve ter no mínimo 3 caracteres' };
        }
        
        if (!userData.password || userData.password.length < 4) {
            return { success: false, message: 'Senha deve ter no mínimo 4 caracteres' };
        }
        
        if (users.find(u => u.username === userData.username)) {
            return { success: false, message: 'Usuário já existe' };
        }
        
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email já cadastrado' };
        }

        // Criar novo usuário
        const newUser = {
            id: 'user_' + Date.now() + Math.random().toString(36).substr(2, 9),
            username: userData.username,
            fullName: userData.fullName || userData.username,
            email: userData.email || '',
            phone: userData.phone || '',
            password: userData.password,
            role: 'user',
            vip: false,
            isPremium: false,
            active: true,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            permissions: ['basic']
        };
        
        users.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(users));
        
        // Login automático
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('currentUser', newUser.username);
        
        return { success: true, user: newUser };
    },

    // Requer autenticação
    requireAuth: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Requer privilégios de admin
    requireAdmin: function() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        
        const user = this.currentUser;
        const adminRoles = (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_ROLES) 
            ? CONFIG.ADMIN_ROLES 
            : ['admin', 'superadmin'];
            
        if (!adminRoles.includes(user.role)) {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    },

    // Verificar permissões
    hasPermission: function(permission) {
        const user = this.currentUser;
        
        if (user.role === 'superadmin') return true;
        if (user.permissions && user.permissions.includes('all')) return true;
        
        return user.permissions && user.permissions.includes(permission);
    },

    // Atualizar perfil
    updateProfile: function(userData) {
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const username = localStorage.getItem('currentUser');
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }
        
        // Atualizar dados permitidos
        if (userData.fullName) users[userIndex].fullName = userData.fullName;
        if (userData.email) users[userIndex].email = userData.email;
        if (userData.phone) users[userIndex].phone = userData.phone;
        
        localStorage.setItem('users_db', JSON.stringify(users));
        return { success: true };
    },

    // Mudar senha
    changePassword: function(currentPassword, newPassword) {
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const username = localStorage.getItem('currentUser');
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }
        
        if (users[userIndex].password !== currentPassword) {
            return { success: false, message: 'Senha atual incorreta' };
        }
        
        users[userIndex].password = newPassword;
        localStorage.setItem('users_db', JSON.stringify(users));
        return { success: true };
    },

    // Verificar se é admin
    isAdmin: function() {
        const user = this.currentUser;
        return CONFIG.ADMIN_ROLES.includes(user.role);
    },

    // Verificar se é VIP/Premium
    isPremium: function() {
        const user = this.currentUser;
        return user.vip || user.isPremium;
    },

    // Listar todos os usuários (admin)
    getAllUsers: function() {
        if (!this.isAdmin()) {
            return [];
        }
        
        return JSON.parse(localStorage.getItem('users_db') || '[]');
    },

    // Obter estatísticas
    getStats: function() {
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        const activeUsers = users.filter(u => u.active !== false);
        const premiumUsers = users.filter(u => u.vip || u.isPremium);
        const admins = users.filter(u => CONFIG.ADMIN_ROLES.includes(u.role));
        
        return {
            total: users.length,
            active: activeUsers.length,
            premium: premiumUsers.length,
            admins: admins.length,
            regular: users.length - premiumUsers.length - admins.length
        };
    }
};

// Inicializar
auth.init();

// Torna auth globalmente disponível
window.auth = auth;