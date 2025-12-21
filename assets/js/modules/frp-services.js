class FrpServices {
    async getDrivers() {
        return await api.frp.getDrivers();
    }
    async requestService(serviceId, params = {}) {
        return await api.frp.unlock({ serviceId, ...params });
    }
    async getStatus() {
        return await api.frp.getStatus();
    }
}
window.frpServices = new FrpServices();
