class DashboardController {
    constructor(view, service) {
        this.view = view;
        this.service = service;
        this.searchTerm = '';
    }

    async loadProducts(page = 1) {
        this.view.showLoading();

        try {
            const { products, pagination } = await this.service.getProductsForPage(page, this.searchTerm);

            if (!products.length) {
                if (this.searchTerm) {
                    this.view.showEmptyState({
                        title: 'No products found',
                        text: `No products match "${this.searchTerm}". Try a different search term or clear the search.`,
                        buttonText: 'Clear search',
                        buttonAction: () => this.setSearchTerm('')
                    });
                } else {
                    this.view.showEmptyState();
                }
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

    async setSearchTerm(searchTerm) {
        this.searchTerm = String(searchTerm || '').trim();
        await this.loadProducts(1);
    }
}

window.DashboardController = DashboardController;
