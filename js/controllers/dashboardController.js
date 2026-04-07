class DashboardController {
    constructor(view, service) {
        this.view = view;
        this.service = service;
    }

    async loadProducts(page = 1) {
        this.view.showLoading();

        try {
            const { products, pagination } = await this.service.getProductsForPage(page);

            if (!products.length) {
                this.view.showEmptyState();
                return;
            }

            this.view.renderProducts(products);
            this.view.renderPagination(pagination, (nextPage) => this.loadProducts(nextPage));
            this.view.showTable();
        } catch (error) {
            console.error('DashboardController error:', error);
            this.view.showError(error.message || 'Unable to load products');
        }
    }
}

window.DashboardController = DashboardController;
