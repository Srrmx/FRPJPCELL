// config.js - Configurações globais do sistema
const CONFIG = {
    SITE_NAME: 'JPCELLFRP PRO',
    VERSION: '2.1.0',
    API_URL: 'https://api.jpcellfrp.com',
    DEFAULT_THEME: 'dark',
    CURRENCY: 'BRL',
    ENABLED_MODULES: ['frp', 'imei', 'shop', 'support', 'updates'],
    ADMIN_ROLES: ['admin', 'superadmin'],
    PREMIUM_FEATURES: ['frp_unlock', 'imei_unlock', 'priority_support', 'advanced_tools']
};

// Exportar para uso global
window.CONFIG = CONFIG;