import { Toast } from '../../utils/toast.js';

export class DashboardController {
    constructor(view, dashboardService) {
        this.view = view;
        this.dashboardService = dashboardService;
    }

    async initialize() {
        this.view.showLoading();

        try {
            const data = await this.dashboardService.getDashboard();

            this.view.renderKpis(data);
            this.view.renderLowStockProducts(data.lowStockProductsList);
            this.view.renderRecentSales(data.recentSales);
            this.view.renderRecentMovements(data.recentMovements);
            this.view.showContent();
        } catch (error) {
            Toast.show(error.message || 'Failed to load dashboard', 'error');
            this.view.showContent();
        }
    }
}
