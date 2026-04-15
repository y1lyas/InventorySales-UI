class DashboardController {
    static #MODES = {
        normal: {
            emptyIcon:  'bi-box',
            emptyTitle: 'No products',
            emptyText:  'Add your first product to get started.',
            emptyButtonText: null,
        },
        trash: {
            emptyIcon:  'bi-trash',
            emptyTitle: 'Bin is empty',
            emptyText:  'You haven\'t removed any products yet.',
            emptyButtonText: null,
        },
    };

    constructor(view, service, { isTrashMode = false } = {}) {
        this.view = view;
        this.service = service;
        this.isTrashMode = isTrashMode;
        this.searchTerm = '';
    }

      get #modeConfig() {
        return DashboardController.#MODES[this.isTrashMode ? 'trash' : 'normal'];
    }

      async open() {
        if (this.view.show) this.view.show();
        await this.loadProducts(1);
    }

  async loadProducts(page = 1) {
        this.view.showLoading();

        try {
            const { products, pagination } = await this.service.getProductsForPage(
                page,
                this.searchTerm,
                { isDeleted: this.isTrashMode ? true : undefined }
            );

            if (!products.length) {
                this.#handleEmptyState();
                return;
            }

            this.view.renderProducts(products, { isTrashMode: this.isTrashMode });

            this.view.renderPagination(
                pagination,
                (nextPage) => this.loadProducts(nextPage)
            );

            this.view.showTable();

        } catch (error) {
            console.error('DashboardController error:', error);
            this.view.showError(error.message || 'Unable to load products');
        }
    }

    #handleEmptyState() {
        const config = this.#modeConfig;

        if (this.searchTerm) {
            this.view.showEmptyState({
                title: `No ${this.isTrashMode ? 'removed ' : ''}products found`,
                text: `No products match "${this.searchTerm}". Try a different search term.`,
                buttonText: 'Clear search',
                buttonAction: () => this.setSearchTerm(''),
            });
        } else {
            this.view.showEmptyState({
                title: config.emptyTitle,
                text:  config.emptyText,
            });
        }
    }

    async setSearchTerm(searchTerm) {
        this.searchTerm = String(searchTerm || '').trim();
        await this.loadProducts(1);
    }
}

window.DashboardController = DashboardController;
