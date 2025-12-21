# 🔐 JPCELLFRP PRO

Sistema profissional de gerenciamento FRP (Factory Reset Protection) e IMEI com painel administrativo completo.

## 📋 Características

- ✅ Sistema de autenticação robusto
- ✅ Painel administrativo completo
- ✅ Gerenciamento de usuários
- ✅ Bloqueio/desbloqueio de IMEI
- ✅ Sistema de loja integrado
- ✅ Suporte ao cliente
- ✅ Sincronização em tempo real
- ✅ Interface moderna e responsiva

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Icons**: Font Awesome 6
- **Storage**: LocalStorage (cliente)
- **Design**: Gradientes modernos, UI/UX otimizada

## 📂 Estrutura do Projeto

```
SITE FRPJP/
├── admin/                      # Páginas administrativas
│   ├── index.html             # Dashboard admin
│   └── imei-block.html        # Gerenciamento IMEI
├── assets/                     # Recursos estáticos
│   ├── css/
│   │   └── style.css          # Estilos globais
│   ├── js/
│   │   ├── core/              # JavaScript core
│   │   │   ├── auth.js        # Autenticação
│   │   │   └── main.js        # Funções principais
│   │   ├── modules/           # Módulos funcionais
│   │   │   ├── admin.js       # Lógica admin
│   │   │   └── dashboard.js   # Lógica dashboard
│   │   └── utils/             # Utilitários
│   │       ├── sync-admin.js  # Sincronização admin
│   │       └── sync-events.js # Eventos de sync
│   ├── images/                # Imagens
│   └── fonts/                 # Fontes customizadas
├── config/                     # Configurações
│   └── config.js              # Configuração global
├── data/                       # Dados da aplicação
│   ├── users/                 # Dados de usuários
│   ├── logs/                  # Logs do sistema
│   ├── backup/                # Backups automáticos
│   └── temp/                  # Arquivos temporários
├── docs/                       # Documentação
│   └── STRUCTURE.md           # Estrutura detalhada
├── public/                     # Páginas públicas
│   ├── index.html             # Página de login
│   └── dashboard.html         # Dashboard do usuário
├── .gitignore                  # Arquivos ignorados pelo git
└── README.md                   # Este arquivo
```

## 🔧 Instalação

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional: Live Server, XAMPP, etc.)

### Passo a Passo

1. **Clone ou baixe o repositório**
```bash
git clone [url-do-repositorio]
cd SITE-FRPJP
```

2. **Configure o servidor local**
   - Opção 1: Use Live Server (VS Code)
   - Opção 2: Use Python HTTP Server
     ```bash
     python -m http.server 8000
     ```
   - Opção 3: Use XAMPP/WAMP

3. **Acesse a aplicação**
   - Abra: `http://localhost:8000/public/index.html`

## 👤 Credenciais de Teste

### Administrador
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Tipo**: Super Admin

### Usuário Normal
- **Usuário**: `usuario`
- **Senha**: `usuario123`
- **Tipo**: Usuário Básico

> ⚠️ **IMPORTANTE**: Altere as credenciais em produção!

## 📖 Como Usar

### Login
1. Acesse `public/index.html`
2. Digite suas credenciais
3. Clique em "Entrar"

### Dashboard do Usuário
- Visualize estatísticas do sistema
- Acesse serviços FRP
- Gerencie produtos na loja
- Entre em contato com suporte

### Painel Admin
- Gerencie usuários
- Configure módulos do sistema
- Bloqueie/desbloqueie IMEIs
- Visualize logs e estatísticas
- Configure o sistema

## 🔒 Segurança

### Implementado
- ✅ Validação de entrada de dados
- ✅ Sanitização de inputs
- ✅ Verificação de permissões
- ✅ Try-catch em operações críticas
- ✅ Validação de email e senha

### Para Produção (Recomendado)
- ⚠️ Implementar hash de senhas (bcrypt)
- ⚠️ Usar HTTPS obrigatório
- ⚠️ Implementar backend real
- ⚠️ Adicionar tokens JWT
- ⚠️ Implementar rate limiting
- ⚠️ Adicionar CSP headers

## 📊 Funcionalidades

### Autenticação
- Login/Logout
- Registro de usuários
- Verificação de permissões
- Sessão persistente

### Dashboard
- Estatísticas em tempo real
- Gráficos interativos
- Sistema de notificações
- Gerenciamento de perfil

### Administração
- CRUD de usuários
- Gerenciamento de módulos
- Controle de produtos
- Sistema de logs
- Backup do sistema

### IMEI Block
- Bloqueio de IMEI
- Desbloqueio de IMEI
- Importação/Exportação
- Histórico de ações
- Auditoria completa

## 🛠️ Configuração

### config/config.js
```javascript
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
```

## 🐛 Solução de Problemas

### Página em branco
- Verifique o console do navegador (F12)
- Certifique-se de que todos os arquivos foram carregados
- Verifique se está usando um servidor web

### Erro de login
- Verifique as credenciais
- Limpe o localStorage: `localStorage.clear()`
- Recarregue a página

### Dados não aparecem
- Abra o console e verifique erros
- Verifique se o localStorage está habilitado
- Teste em modo anônimo

## 📝 Changelog

### v2.1.0 (20/12/2025)
- ✅ Reestruturação completa do projeto
- ✅ Correção de 30 bugs identificados
- ✅ Melhorias de segurança
- ✅ Validações robustas
- ✅ Try-catch em operações críticas
- ✅ Documentação completa

### v2.0.0
- ✅ Nova interface moderna
- ✅ Sistema de sincronização
- ✅ Gráficos interativos
- ✅ Painel admin completo

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👨‍💻 Autor

**JPCELL FRP PRO**
- Website: [Em construção]
- Email: [contato@jpcellfrp.com]

## 🙏 Agradecimentos

- Font Awesome por ícones
- Chart.js por gráficos
- Comunidade open source

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**

**📧 Para suporte: contato@jpcellfrp.com**
