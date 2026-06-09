export class DashboardService {
    constructor(dashboardApi) {
        this.dashboardApi = dashboardApi;
    }

    async getDashboard() {
        return await this.dashboardApi.get();
    }
}
