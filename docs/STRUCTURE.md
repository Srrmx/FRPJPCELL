# 📁 ESTRUTURA DETALHADA DO PROJETO

## Visão Geral da Arquitetura

```
SITE FRPJP/
│
├── 📂 admin/                           # Área Administrativa
│   ├── index.html                      # Dashboard principal admin
│   └── imei-block.html                 # Gerenciador de bloqueio IMEI
│
├── 📂 assets/                          # Recursos Estáticos
│   │
│   ├── 📂 css/                         # Folhas de Estilo
│   │   └── style.css                   # Estilos globais do sistema
│   │
│   ├── 📂 js/                          # JavaScript
│   │   ├── 📂 core/                    # Núcleo da Aplicação
│   │   │   ├── auth.js                 # Sistema de autenticação
│   │   │   └── main.js                 # Funções principais e inicialização
│   │   │
│   │   ├── 📂 modules/                 # Módulos Funcionais
│   │   │   ├── admin.js                # Lógica do painel administrativo
│   │   │   └── dashboard.js            # Lógica do dashboard do usuário
│   │   │
│   │   └── 📂 utils/                   # Utilitários
│   │       ├── sync-admin.js           # Sincronização de dados admin
│   │       └── sync-events.js          # Sistema de eventos e sincronização
│   │
│   ├── 📂 images/                      # Imagens do Sistema
│   │   ├── logo.png                    # Logo principal (adicionar)
│   │   ├── favicon.ico                 # Ícone do site (adicionar)
│   │   └── backgrounds/                # Imagens de fundo
│   │
│   └── 📂 fonts/                       # Fontes Customizadas
│       └── custom-fonts/               # Fontes personalizadas (se houver)
│
├── 📂 config/                          # Configurações
│   ├── config.js                       # Configuração global do sistema
│   └── local.js.example                # Exemplo de configuração local
│
├── 📂 data/                            # Dados da Aplicação
│   ├── 📂 users/                       # Dados de Usuários
│   │   ├── .gitkeep                    # Manter pasta no git
│   │   └── README.md                   # Instruções sobre dados de usuários
│   │
│   ├── 📂 logs/                        # Logs do Sistema
│   │   ├── .gitkeep
│   │   ├── access.log                  # Log de acessos (gerado)
│   │   ├── error.log                   # Log de erros (gerado)
│   │   └── system.log                  # Log geral do sistema (gerado)
│   │
│   ├── 📂 backup/                      # Backups Automáticos
│   │   ├── .gitkeep
│   │   └── README.md                   # Instruções sobre backups
│   │
│   └── 📂 temp/                        # Arquivos Temporários
│       ├── .gitkeep
│       └── uploads/                    # Uploads temporários
│
├── 📂 docs/                            # Documentação
│   ├── STRUCTURE.md                    # Este arquivo
│   ├── API.md                          # Documentação de API (futuro)
│   ├── CHANGELOG.md                    # Histórico de mudanças
│   └── DEPLOYMENT.md                   # Guia de deploy
│
├── 📂 public/                          # Páginas Públicas
│   ├── index.html                      # Página de login/entrada
│   └── dashboard.html                  # Dashboard do usuário comum
│
├── .gitignore                          # Arquivos ignorados pelo Git
└── README.md                           # Documentação principal
```

## 📄 Descrição Detalhada dos Arquivos

### 🔐 Área Administrativa (`/admin`)

#### `index.html`
- **Propósito**: Dashboard administrativo principal
- **Acesso**: Apenas usuários com role `admin` ou `superadmin`
- **Funcionalidades**:
  - Gerenciamento de usuários
  - Controle de módulos
  - Estatísticas do sistema
  - Configurações globais
  - Sistema de comandos
  - Logs e auditoria

#### `imei-block.html`
- **Propósito**: Gerenciamento de bloqueio IMEI
- **Acesso**: Apenas administradores
- **Funcionalidades**:
  - Adicionar/remover bloqueios IMEI
  - Importar/exportar lista de IMEIs
  - Auditoria de bloqueios
  - Validação de IMEI

---

### 🎨 Assets (`/assets`)

#### CSS (`/assets/css`)

**`style.css`**
- Estilos globais do sistema
- Variáveis CSS customizadas
- Temas (dark/light)
- Componentes reutilizáveis
- Responsividade
- Animações

#### JavaScript Core (`/assets/js/core`)

**`auth.js`**
```javascript
// Sistema de Autenticação
- init()              // Inicializar banco de dados
- isAuthenticated()   // Verificar autenticação
- currentUser         // Getter do usuário atual
- login()            // Fazer login
- logout()           // Fazer logout
- register()         // Registrar usuário
- requireAdmin()     // Requer privilégios admin
- hasPermission()    // Verificar permissões
- updateProfile()    // Atualizar perfil
```

**`main.js`**
```javascript
// Funções Principais
- initializePage()        // Inicializar página
- setupCommonFeatures()   // Recursos comuns
- updateUserUI()          // Atualizar UI do usuário
- setupTheme()            // Configurar tema
- setupLogoutButtons()    // Configurar botões de logout
- setupNotifications()    // Sistema de notificações
- showNotification()      // Exibir notificação
```

#### JavaScript Modules (`/assets/js/modules`)

**`dashboard.js`** (DashboardManager)
```javascript
// Gerenciamento do Dashboard
- constructor()           // Inicializar
- setupNavigation()       // Navegação
- loadProducts()          // Carregar produtos
- addToCart()            // Adicionar ao carrinho
- sendSupportMessage()   // Enviar mensagem suporte
- loadSupportMessages()  // Carregar mensagens
- updateCharts()         // Atualizar gráficos
```

**`admin.js`** (AdminManager)
```javascript
// Gerenciamento Admin
- constructor()           // Inicializar
- loadUsers()            // Carregar usuários
- createNewUser()        // Criar usuário
- handleUserAction()     // Ações de usuário
- loadModules()          // Carregar módulos
- loadProducts()         // Carregar produtos
- executeCommand()       // Executar comando
- backupSystem()         // Backup do sistema
```

#### JavaScript Utils (`/assets/js/utils`)

**`sync-admin.js`** (SyncAdminSystem)
```javascript
// Sistema de Sincronização
- syncData()             // Sincronizar dados
- syncUsers()            // Sincronizar usuários
- syncProducts()         // Sincronizar produtos
- syncSales()            // Sincronizar vendas
- updateUserStats()      // Atualizar estatísticas
```

**`sync-events.js`** (SyncEvents)
```javascript
// Eventos de Sincronização
- setupListeners()       // Configurar listeners
- handleUserUpdate()     // Tratar atualização usuário
- handleProductUpdate()  // Tratar atualização produto
```

---

### ⚙️ Configuração (`/config`)

#### `config.js`
```javascript
const CONFIG = {
    SITE_NAME: string,
    VERSION: string,
    API_URL: string,
    DEFAULT_THEME: 'dark' | 'light',
    CURRENCY: string,
    ENABLED_MODULES: string[],
    ADMIN_ROLES: string[],
    PREMIUM_FEATURES: string[]
};
```

---

### 💾 Dados (`/data`)

#### `/users`
- Armazena dados de usuários (localStorage)
- **NÃO** commitar dados reais
- Estrutura:
  ```json
  {
    "id": "user_xxx",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "password": "string",
    "role": "user|admin|superadmin",
    "vip": boolean,
    "isPremium": boolean,
    "active": boolean,
    "createdAt": timestamp,
    "lastLogin": timestamp,
    "permissions": string[]
  }
  ```

#### `/logs`
- **access.log**: Logs de acesso ao sistema
- **error.log**: Logs de erros
- **system.log**: Logs gerais do sistema
- Formato: `[TIMESTAMP] [LEVEL] Message`

#### `/backup`
- Backups automáticos do sistema
- Formato: `backup_YYYYMMDD_HHMMSS.json`
- Rotação automática (manter últimos 30 dias)

#### `/temp`
- Arquivos temporários
- Uploads de usuários
- Cache temporário
- **Limpeza automática**: arquivos > 24h

---

### 📖 Páginas Públicas (`/public`)

#### `index.html`
- Página de entrada do sistema
- Login/Registro
- Esqueci minha senha
- Sem autenticação necessária

#### `dashboard.html`
- Dashboard do usuário comum
- Requer autenticação
- Estatísticas pessoais
- Acesso a serviços

---

## 🔄 Fluxo de Dados

### Autenticação
```
1. Usuário acessa /public/index.html
2. Submete credenciais
3. auth.js valida no localStorage
4. Redireciona para:
   - Admin: /admin/index.html (se admin)
   - User: /public/dashboard.html (se user)
```

### Sincronização
```
1. Ação do usuário (criar/editar/deletar)
2. Atualiza localStorage
3. sync-admin.js dispara evento
4. sync-events.js ouve evento
5. Atualiza UI em todas as abas abertas
```

### Backup
```
1. Timer automático (diário)
2. admin.js coleta dados
3. Serializa para JSON
4. Salva em /data/backup/
5. Log em /data/logs/system.log
```

---

## 🗂️ LocalStorage Schema

### Keys Utilizadas
```javascript
{
  "authenticated": "true|false",
  "currentUser": "username",
  "users_db": User[],
  "site_products": Product[],
  "imei_blocks": IMEIBlock[],
  "support_messages": Message[],
  "shopping_cart": CartItem[],
  "admin_settings": Settings,
  "theme": "dark|light",
  
  // Sync
  "users_sync": SyncData,
  "products_sync": SyncData,
  "sales_sync": SyncData,
  "last_sync": timestamp
}
```

---

## 🚀 Ordem de Carregamento

### Todas as Páginas
```
1. config/config.js          # Configurações globais
2. assets/js/core/auth.js    # Autenticação
3. assets/js/core/main.js    # Funções principais
```

### Dashboard Usuário (`/public/dashboard.html`)
```
4. assets/js/modules/dashboard.js  # Lógica dashboard
5. assets/js/utils/sync-admin.js   # Sincronização
6. assets/js/utils/sync-events.js  # Eventos
```

### Admin (`/admin/index.html`)
```
4. assets/js/modules/admin.js      # Lógica admin
5. assets/js/utils/sync-admin.js   # Sincronização
6. assets/js/utils/sync-events.js  # Eventos
```

---

## 🔐 Segurança

### Níveis de Acesso
1. **Público**: `/public/index.html`
2. **Autenticado**: `/public/dashboard.html`
3. **Admin**: `/admin/*`

### Validações
- ✅ Inputs sanitizados
- ✅ Email validado com regex
- ✅ Senha mínimo 6 caracteres
- ✅ Username alfanumérico + _
- ✅ Try-catch em operações críticas

---

## 📦 Dependências

### CDN
- **Font Awesome 6**: Ícones
- **Chart.js**: Gráficos

### Nativas
- LocalStorage
- Fetch API
- ES6+ Features

---

## 🛠️ Manutenção

### Adicionar Nova Página
1. Criar HTML em `/public` ou `/admin`
2. Adicionar scripts necessários
3. Atualizar navegação
4. Testar autenticação
5. Documentar em README.md

### Adicionar Novo Módulo
1. Criar arquivo em `/assets/js/modules/`
2. Seguir padrão de classe
3. Exportar classe
4. Carregar na página necessária
5. Documentar API

### Atualizar Estilos
1. Editar `/assets/css/style.css`
2. Usar variáveis CSS existentes
3. Manter responsividade
4. Testar em múltiplos navegadores

---

## 📊 Métricas

- **Total de Arquivos**: ~20
- **Linhas de Código**: ~7.000
- **Tamanho Total**: ~265 KB
- **Páginas**: 4 (index, dashboard, admin, imei-block)
- **Módulos JS**: 6
- **Componentes CSS**: 50+

---

**Última atualização**: 20/12/2025  
**Versão da estrutura**: 2.1.0
