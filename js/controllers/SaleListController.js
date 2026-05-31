export class SaleListController {
    constructor(view, saleService, state, options = {}) {
        this.view = view;
        this.saleService = saleService;
        this.state = state;
        this.detailsView = options.detailsView || null;
        this.filters = {
            startDate: this.state.ui.salesStartDate || '',
            endDate: this.state.ui.salesEndDate || '',
            minAmount: this.state.ui.salesMinAmount || '',
            maxAmount: this.state.ui.salesMaxAmount || '',
            saleId: this.state.ui.salesSaleId || ''
        };
    }

    async initialize() {
        await this.loadSales();
        const initialSaleId = this.getInitialSaleId();
        if (initialSaleId) {
            await this.openSaleDetails(initialSaleId);
        }
    }

    async loadSales(forceReload = false) {
        if (!forceReload && this.state.loaded.sales && !this.hasActiveFilters()) {
            this.render();
            return;
        }

        this.state.ui.isLoadingSales = true;
        this.view.showLoading();

        try {
            if (this.filters.saleId) {
                const saleDetail = await this.saleService.getSaleById(this.filters.saleId);
                this.state.sales = saleDetail ? [saleDetail] : [];
                this.state.salesPagination = {
                    currentPage: 1,
                    totalPages: this.state.sales.length ? 1 : 0
                };
                this.state.ui.salesPage = 1;
                this.state.loaded.sales = true;
            } else {
                const result = await this.saleService.getAllSales({
                    page: this.state.ui.salesPage,
                    size: this.state.ui.salesPageSize,
                    filters: this.filters
                });

                if (!result.sales.length && this.state.ui.salesPage > 1) {
                    this.state.ui.salesPage = 1;
                    return await this.loadSales(forceReload);
                }

                this.state.sales = result.sales;
                this.state.salesPagination = result.pagination;
                this.state.ui.salesPage = result.pagination.currentPage;
                this.state.loaded.sales = true;
            }
        } catch (error) {
            this.view.showError(error.message || 'Unable to load sales');
        } finally {
            this.state.ui.isLoadingSales = false;
            this.render();
        }
    }

    render() {
        if (this.state.ui.isLoadingSales) {
            this.view.showLoading();
            return;
        }

        if (!this.state.sales || !this.state.sales.length) {
            this.view.renderActiveFilters(this.filters);
            this.view.showEmptyState();
            return;
        }

        this.view.renderSales(this.state.sales);
        this.view.renderActiveFilters(this.filters);
        this.view.renderPagination(this.state.salesPagination, (nextPage) => {
            this.state.ui.salesPage = nextPage;
            this.loadSales(true);
        });
        this.view.showTable();
    }

    async setFilter(filterName, value) {
        this.filters[filterName] = value;
        this.state.ui.salesPage = 1;
        this.state.ui.salesStartDate = this.filters.startDate;
        this.state.ui.salesEndDate = this.filters.endDate;
        this.state.ui.salesMinAmount = this.filters.minAmount;
        this.state.ui.salesMaxAmount = this.filters.maxAmount;
        this.state.ui.salesSaleId = this.filters.saleId;
        await this.loadSales(true);
    }

    async setQuickFilter(filterKey) {
        const now = new Date();
        let start = '';
        let end = '';

        if (filterKey === 'today') {
            start = this.formatDate(now);
            end = this.formatDate(now);
        } else if (filterKey === 'last7') {
            const last7 = new Date(now);
            last7.setDate(now.getDate() - 6);
            start = this.formatDate(last7);
            end = this.formatDate(now);
        } else if (filterKey === 'month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            start = this.formatDate(firstDay);
            end = this.formatDate(now);
        }

        this.filters.startDate = start;
        this.filters.endDate = end;
        this.filters.minAmount = '';
        this.filters.maxAmount = '';
        this.filters.saleId = '';

        this.state.ui.salesPage = 1;
        this.state.ui.salesStartDate = start;
        this.state.ui.salesEndDate = end;
        this.state.ui.salesMinAmount = '';
        this.state.ui.salesMaxAmount = '';
        this.state.ui.salesSaleId = '';

        await this.loadSales(true);
    }

    async clearFilters() {
        this.filters.startDate = '';
        this.filters.endDate = '';
        this.filters.minAmount = '';
        this.filters.maxAmount = '';
        this.filters.saleId = '';
        this.state.ui.salesPage = 1;
        this.state.ui.salesStartDate = '';
        this.state.ui.salesEndDate = '';
        this.state.ui.salesMinAmount = '';
        this.state.ui.salesMaxAmount = '';
        this.state.ui.salesSaleId = '';
        await this.loadSales(true);
    }

    hasActiveFilters() {
        return Boolean(this.filters.startDate || this.filters.endDate || this.filters.minAmount || this.filters.maxAmount || this.filters.saleId);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async handleViewDetails(saleId) {
        if (!saleId || !this.detailsView) {
            return;
        }

        await this.openSaleDetails(saleId);
    }

    async openSaleDetails(saleId) {
        if (!this.detailsView) {
            return;
        }

        this.detailsView.showLoading();

        try {
            const saleDetail = await this.saleService.getSaleById(saleId);
            if (!saleDetail) {
                this.detailsView.showError('Sale was not found.');
                return;
            }

            this.detailsView.renderSaleDetails(saleDetail);
        } catch (error) {
            this.detailsView.showError(error.message || 'Unable to load sale details');
        }
    }

    async refresh() {
        await this.loadSales(true);
    }

    getInitialSaleId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('saleId') || params.get('viewSaleId');
    }
}
