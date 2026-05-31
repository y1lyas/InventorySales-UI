import { renderPagination } from '../utils/pagination.js';
import { formatDateTime } from '../utils/productDisplay.js';

export class SaleListView {
    constructor() {
        this.tableBody = document.getElementById('sales-table-body');
        this.tableView = document.getElementById('sales-table');
        this.loadingState = document.getElementById('sales-loading');
        this.emptyState = document.getElementById('sales-empty');
        this.emptyStateTitle = document.getElementById('sales-empty-title');
        this.emptyStateText = document.getElementById('sales-empty-text');
        this.emptyStateButton = document.getElementById('sales-empty-button');
        this.paginationContainer = document.getElementById('sales-pagination-container');
        this.pagination = document.getElementById('sales-pagination');
        this.refreshButton = document.getElementById('sales-refresh-button');
        this.activeFiltersContainer = document.getElementById('sales-active-filters');
    }

    showLoading() {
        this.loadingState?.classList.remove('d-none');
        this.emptyState?.classList.add('d-none');
        this.tableView?.classList.add('d-none');
        this.paginationContainer?.classList.add('d-none');
    }

    showTable() {
        this.loadingState?.classList.add('d-none');
        this.emptyState?.classList.add('d-none');
        this.tableView?.classList.remove('d-none');
        this.paginationContainer?.classList.remove('d-none');
    }

    showEmptyState(options = {}) {
        const {
            icon = 'bi bi-cart3',
            title = 'No sales found',
            text = 'Record your first sale to see it listed here.',
            buttonText = 'Create sale',
            buttonAction = null
        } = options;

        if (this.emptyStateTitle) {
            this.emptyStateTitle.textContent = title;
        }

        if (this.emptyStateText) {
            this.emptyStateText.textContent = text;
        }

        if (this.emptyStateButton) {
            if (buttonText && buttonAction) {
                this.emptyStateButton.classList.remove('d-none');
                this.emptyStateButton.textContent = buttonText;
                this.emptyStateButton.onclick = buttonAction;
            } else {
                this.emptyStateButton.classList.add('d-none');
                this.emptyStateButton.onclick = null;
            }
        }

        this.loadingState?.classList.add('d-none');
        this.tableView?.classList.add('d-none');
        this.emptyState?.classList.remove('d-none');
        this.paginationContainer?.classList.add('d-none');
    }

    showError(message) {
        console.error('SaleListView error:', message);
        this.showEmptyState({
            title: 'Unable to load sales',
            text: message || 'Please try again later.',
            buttonText: null
        });
    }

    renderSales(sales) {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = sales.map((sale) => {
            const saleDate = formatDateTime(sale.saleDate || sale.createdAt || sale.createdDate);
            const totalPrice = Number(sale.totalPrice ?? 0).toFixed(2);
            const itemsCount = sale.itemsCount ?? sale.items?.length ?? 'N/A';
            const createdBy = sale.createdById ?? 'N/A';

            return `
                <tr data-sale-id="${this.escapeHtml(sale.id)}">
                    <td class="px-4">${this.escapeHtml(sale.id)}</td>
                    <td>${this.escapeHtml(saleDate)}</td>
                    <td>${this.escapeHtml(totalPrice)}</td>
                    <td>${this.escapeHtml(itemsCount)}</td>
                    <td>${this.escapeHtml(createdBy)}</td>
                    <td class="text-end px-4">
                        <button type="button" class="btn btn-sm btn-light text-primary shadow-sm border-0 btn-view-sale-details">
                            <i class="bi bi-eye-fill"></i> Show
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }

    renderActiveFilters(filters) {
        if (!this.activeFiltersContainer) {
            return;
        }

        const elements = [];
        if (filters.startDate || filters.endDate) {
            const start = filters.startDate || 'Any';
            const end = filters.endDate || 'Any';
            elements.push(`Date: ${this.escapeHtml(start)} - ${this.escapeHtml(end)}`);
        }

        if (filters.minAmount || filters.maxAmount) {
            const min = filters.minAmount ? Number(filters.minAmount).toFixed(2) : 'Any';
            const max = filters.maxAmount ? Number(filters.maxAmount).toFixed(2) : 'Any';
            elements.push(`Amount: ${this.escapeHtml(min)} - ${this.escapeHtml(max)} TRY`);
        }

        if (filters.saleId) {
            elements.push(`Sale ID: ${this.escapeHtml(filters.saleId)}`);
        }

        if (!elements.length) {
            this.activeFiltersContainer.innerHTML = '';
            this.activeFiltersContainer.classList.add('d-none');
            return;
        }

        this.activeFiltersContainer.classList.remove('d-none');
        this.activeFiltersContainer.innerHTML = elements.map((text) => `
            <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle">
                ${text}
            </span>
        `).join('');
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character]));
    }
}
