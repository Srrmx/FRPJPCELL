class SiteTester {
    constructor() {
        this.results = [];
        this.tests = [
            this.checkGlobals,
            this.checkAuth,
            this.checkDashboardStructure,
            this.checkNavigation,
            this.checkDataLoading
        ];
    }

    async run() {
        console.log('Iniciando Auto-Teste do Site...');
        this.results = [];
        
        for (const test of this.tests) {
            try {
                await test.call(this);
            } catch (error) {
                this.log('Erro fatal no teste', 'fail', error.message);
            }
        }

        this.generateReport();
    }

    log(name, status, details = '') {
        this.results.push({ name, status, details, time: new Date().toLocaleTimeString() });
        console.log(`[${status.toUpperCase()}] ${name} - ${details}`);
    }

    checkGlobals() {
        if (typeof auth !== 'undefined') this.log('Global Auth', 'pass');
        else this.log('Global Auth', 'fail', 'Objeto auth não encontrado');

        if (typeof dashboard !== 'undefined') this.log('Global Dashboard', 'pass');
        else this.log('Global Dashboard', 'fail', 'Objeto dashboard não encontrado');
    }

    checkAuth() {
        if (auth.currentUser) this.log('Usuário Logado', 'pass', auth.currentUser.email);
        else this.log('Usuário Logado', 'warn', 'Nenhum usuário logado para testes completos');
    }

    checkDashboardStructure() {
        const ids = ['sidebar', 'dashboard', 'servicos', 'loja', 'servidores', 'suporte', 'atualizacoes', 'perfil'];
        let missing = [];

        ids.forEach(id => {
            if (!document.getElementById(id)) missing.push(id);
        });

        if (missing.length === 0) this.log('Estrutura DOM', 'pass', 'Todas as seções encontradas');
        else this.log('Estrutura DOM', 'fail', `Seções faltando: ${missing.join(', ')}`);
    }

    async checkNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        if (navItems.length === 0) {
            this.log('Navegação', 'fail', 'Nenhum item de navegação encontrado');
            return;
        }

        this.log('Navegação', 'pass', `${navItems.length} itens de menu encontrados`);
    }

    checkDataLoading() {
        // Verificar se os métodos de carregamento existem
        const methods = ['loadServices', 'loadServers', 'loadUpdates', 'loadProducts'];
        let missingMethods = [];

        if (typeof dashboard !== 'undefined') {
            methods.forEach(m => {
                if (typeof dashboard[m] !== 'function') missingMethods.push(m);
            });
        }

        if (missingMethods.length === 0) this.log('Métodos de Dados', 'pass', 'Todas as funções de carregamento existem');
        else this.log('Métodos de Dados', 'fail', `Funções faltando: ${missingMethods.join(', ')}`);
    }

    generateReport() {
        let report = `RELATÓRIO DE AUTO-TESTE - JPCELL SITE\n`;
        report += `Data: ${new Date().toLocaleString()}\n`;
        report += `----------------------------------------\n`;
        
        let passed = 0;
        let failed = 0;

        this.results.forEach(res => {
            report += `[${res.time}] ${res.status.toUpperCase()}: ${res.name}\n`;
            if (res.details) report += `   > ${res.details}\n`;
            
            if (res.status === 'pass') passed++;
            if (res.status === 'fail') failed++;
        });

        report += `----------------------------------------\n`;
        report += `Resumo: ${passed} Passou | ${failed} Falhou\n`;
        report += `Status Geral: ${failed === 0 ? 'OPERACIONAL' : 'ATENÇÃO NECESSÁRIA'}\n`;

        console.log(report);
        
        // Salvar relatório ou mostrar ao usuário
        this.showReportModal(report);
    }

    showReportModal(reportText) {
        // Criar modal simples para mostrar o relatório
        const modalId = 'testReportModal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
            align-items: center; justify-content: center; backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div style="background: #1e293b; padding: 30px; border-radius: 16px; width: 90%; max-width: 600px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <h2 style="color: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-clipboard-check" style="color: #10b981;"></i> Relatório de Teste
                </h2>
                <textarea style="width: 100%; height: 300px; background: #0f172a; color: #10b981; padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); font-family: monospace; resize: none;" readonly>${reportText}</textarea>
                <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="this.closest('#${modalId}').remove()" class="btn btn-danger">Fechar</button>
                    <button onclick="navigator.clipboard.writeText(document.querySelector('textarea').value); alert('Copiado!')" class="btn btn-primary">Copiar Relatório</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

window.siteTester = new SiteTester();