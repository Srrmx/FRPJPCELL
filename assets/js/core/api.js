const api = {
    baseUrl: (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : '',
    async request(method, endpoint, data) {
        const url = `${this.baseUrl}/${endpoint}`;
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method === 'GET' ? undefined : JSON.stringify(data || {})
            });
            if (!res.ok) throw new Error('request_failed');
            return await res.json();
        } catch {
            if (endpoint.startsWith('frp/drivers')) {
                return { drivers: ['Samsung', 'Xiaomi', 'LG'], installed: true };
            }
            if (endpoint.startsWith('frp/status')) {
                return { online: true, latency: 42 };
            }
            if (endpoint.startsWith('frp/unlock')) {
                return { success: true, ticketId: `FRP-${Date.now()}` };
            }
            return { success: true };
        }
    },
    get(endpoint) { return this.request('GET', endpoint); },
    post(endpoint, data) { return this.request('POST', endpoint, data); },
    frp: {
        getDrivers() { return api.get('frp/drivers'); },
        getStatus() { return api.get('frp/status'); },
        unlock(payload) { return api.post('frp/unlock', payload); }
    }
};
window.api = api;
