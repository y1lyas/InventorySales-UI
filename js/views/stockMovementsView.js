import { renderPagination } from '../utils/pagination.js';
import { formatDateTime, getProductId, getProductOptionLabel } from '../utils/productDisplay.js';
import { SearchableSelect } from '../utils/searchableSelect.js';

export class StockMovementsView {
    constructor() {
        this.productSelect = document.getElementById('movement-product-select');
        this.movementTypeSelect = document.getElementById('movement-type-select');
        this.productPicker = new SearchableSelect(this.productSelect, {
            emptyText: 'No products match that search',
            placeholder: 'Find by product',
        });
        this.tableBody = document.getElementById('stock-movement-table-body');
        this.loadingState = document.getElementById('stock-movement-loading');
        this.emptyState = document.getElementById('stock-movement-empty');
        this.emptyStateTitle = document.getElementById('stock-movement-empty-title');
        this.emptyStateText = document.getElementById('stock-movement-empty-text');
        this.emptyStateButton = document.getElementById('stock-movement-empty-button');
        this.errorState = document.getElementById('stock-movement-error');
        this.tableView = document.getElementById('stock-movement-table');
        this.paginationContainer = document.getElementById('stock-movement-pagination-container');
        this.pagination = document.getElementById('stock-movement-pagination');
        this.filterPanel = document.getElementById('movement-filter-panel');
    }

    renderProductOptions(products) {
        if (!this.productSelect) return;

        const seenProductIds = new Set();

        this.productSelect.innerHTML = '<option value="">All products</option>';
        products.forEach((product) => {
            const productId = getProductId(product);
            if (!productId || seenProductIds.has(String(productId))) {
                return;
            }

            seenProductIds.add(String(productId));

            const option = document.createElement('option');
            option.value = productId;
            option.textContent = getProductOptionLabel(product);
            this.productSelect.appendChild(option);
        });

        this.productPicker?.refreshOptions();
    }

    setSelectedProduct(productId) {
        if (this.productSelect) {
            this.productSelect.value = productId || '';
            this.productPicker?.setValue(productId || '', false);
        }
    }

    setSelectedMovementType(movementType) {
        if (this.movementTypeSelect) {
            this.movementTypeSelect.value = movementType ?? '';
        }
    }

    setSearchTerm(searchTerm) {
        const searchInput = document.getElementById('movement-search');
        if (searchInput) {
            searchInput.value = searchTerm || '';
        }
    }

    toggleFilterPanel() {
        this.filterPanel?.classList.toggle('d-none');
    }

    getAdvancedFilterValues() {
        return {
            movementReason: document.getElementById('movement-filter-reason')?.value || '',
            startDate: document.getElementById('movement-filter-start-date')?.value || '',
            endDate: document.getElementById('movement-filter-end-date')?.value || '',
            minQuantity: document.getElementById('movement-filter-min-quantity')?.value || '',
            maxQuantity: document.getElementById('movement-filter-max-quantity')?.value || ''
        };
    }

    setAdvancedFilterValues(filters = {}) {
        const values = {
            'movement-filter-reason': filters.movementReason || '',
            'movement-filter-start-date': filters.startDate || '',
            'movement-filter-end-date': filters.endDate || '',
            'movement-filter-min-quantity': filters.minQuantity || '',
            'movement-filter-max-quantity': filters.maxQuantity || ''
        };

        Object.entries(values).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        });
    }

    showLoading() {
        this.loadingState?.classList.remove('d-none');
        this.emptyState?.classList.add('d-none');
        this.errorState?.classList.add('d-none');
        this.tableView?.classList.add('d-none');
        this.paginationContainer?.classList.add('d-none');
    }

    showEmptyState(options = {}) {
        const {
            title = 'No stock movements found',
            text = 'Stock changes will appear here after inventory is adjusted.',
            buttonText = null,
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
        this.errorState?.classList.add('d-none');
        this.tableView?.classList.add('d-none');
        this.emptyState?.classList.remove('d-none');
        this.paginationContainer?.classList.add('d-none');
    }

    showEmpty(options = {}) {
        if (typeof options === 'string') {
            this.showEmptyState({
                title: options,
                text: 'Try changing your filters or adjust product stock to create a movement.'
            });
            return;
        }

        this.showEmptyState(options);
    }

    showError(message) {
        console.error('StockMovementsView error:', message);
        this.showEmptyState({
            title: 'Unable to load stock movements',
            text: message || 'Please try again later.'
        });
    }

    renderMovements(movements, emptyStateOptions = {}) {
        if (!this.tableBody) return;

        if (!movements.length) {
            this.showEmpty(emptyStateOptions);
            return;
        }

        this.tableBody.innerHTML = movements.map((movement) => {
            const formattedDate = formatDateTime(movement.createdAt);
            const quantity = movement.quantity ?? 'N/A';
            const movementDisplay = this.getMovementDisplay(movement.movementType);
            const productName = movement.productName || 'N/A';
            const sku = movement.productSku || 'N/A';
            const saleReferenceId = movement.saleReferenceId;
            const reason = this.getReasonLabel(movement.reason);
            const relatedSaleAction = saleReferenceId
                ? `
                    <button
                        type="button"
                        class="btn btn-sm btn-light text-primary shadow-sm border-0 btn-copy-sale-reference"
                        data-sale-reference-id="${this.escapeHtml(saleReferenceId)}"
                        title="Copy sale ID"
                        aria-label="Copy sale ID">
                        <i class="bi bi-clipboard me-2"></i>Copy Sale ID
                    </button>
                `
                : '-';

            return `
                <tr>
                    <td class="px-4">
                        <div class="fw-medium">${this.escapeHtml(productName)}</div>
                        <div class="text-muted small">${this.escapeHtml(sku)}</div>
                    </td>
                    <td>${this.escapeHtml(reason)}</td>
                    <td class="text-muted small">${this.escapeHtml(formattedDate)}</td>
                    <td>
                        <span class="badge ${movementDisplay.badgeClass}">
                            <i class="bi ${movementDisplay.iconClass} me-1"></i>${this.escapeHtml(movementDisplay.label)}
                        </span>
                    </td>
                    <td class="fw-semibold text-end px-4 ${movementDisplay.quantityClass}">${movementDisplay.sign}${this.escapeHtml(quantity)}</td>
                    <td class="text-end px-4">
                        ${relatedSaleAction}
                    </td>
                </tr>
            `;
        }).join('');

        if (this.loadingState) {
            this.loadingState.classList.add('d-none');
        }
        if (this.emptyState) {
            this.emptyState.classList.add('d-none');
        }
        if (this.errorState) {
            this.errorState.classList.add('d-none');
        }
        if (this.tableView) {
            this.tableView.classList.remove('d-none');
        }
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

    getMovementDisplay(movementType) {
        const normalizedType = String(movementType ?? '').toLowerCase();
        const isIncrease = normalizedType === '1' || normalizedType === 'increase' || normalizedType === 'increased';
        const isDecrease = normalizedType === '2' || normalizedType === 'decrease' || normalizedType === 'decreased';

        if (isDecrease) {
            return {
                label: 'Decrease',
                sign: '-',
                badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
                iconClass: 'bi-arrow-down-circle-fill',
                quantityClass: 'text-danger'
            };
        }

        if (isIncrease) {
            return {
                label: 'Increase',
                sign: '+',
                badgeClass: 'bg-success-subtle text-success border border-success-subtle',
                iconClass: 'bi-arrow-up-circle-fill',
                quantityClass: 'text-success'
            };
        }

        return {
            label: movementType ?? 'Stock Movement',
            sign: '',
            badgeClass: 'bg-light text-dark border',
            iconClass: 'bi-arrow-left-right',
            quantityClass: ''
        };
    }

    getReasonLabel(reason) {
        const normalized = String(reason ?? '').trim().toLowerCase();

        if (normalized === '1' || normalized === 'sale') {
            return 'Sale';
        }

        if (normalized === '2' || normalized === 'adjustment') {
            return 'Adjustment';
        }

        if (normalized) {
            return String(reason);
        }

        return 'N/A';
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }

    bindSaleReferenceCopy(onCopy) {
        this.tableBody?.addEventListener('click', async (event) => {
            const button = event.target.closest('.btn-copy-sale-reference');
            if (!button) {
                return;
            }

            await onCopy(button.dataset.saleReferenceId, button);
        });
    }

    showCopySuccess(button) {
        const icon = button.querySelector('i');
        button.classList.remove('text-primary');
        button.classList.add('text-success');
        button.title = 'Copied';

        if (icon) {
            icon.className = 'bi bi-check2 me-2';
        }

        window.setTimeout(() => {
            button.classList.remove('text-success');
            button.classList.add('text-primary');
            button.title = 'Copy sale ID';
            if (icon) {
                icon.className = 'bi bi-clipboard me-2';
            }
        }, 1200);
    }

    showCopyError(button) {
        const icon = button.querySelector('i');
        button.classList.remove('text-primary');
        button.classList.add('text-danger');
        button.title = 'Copy failed';

        if (icon) {
            icon.className = 'bi bi-exclamation-circle';
        }
    }
}
