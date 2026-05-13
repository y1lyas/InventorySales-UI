import { renderPagination } from '../utils/pagination.js';
import { formatDateTime, getProductId, getProductOptionLabel } from '../utils/productDisplay.js';
import { SearchableSelect } from '../utils/searchableSelect.js';

export class StockMovementsView {
    constructor() {
        this.productSelect = document.getElementById('dashboard-product-select');
        this.movementTypeSelect = document.getElementById('dashboard-movement-type-select');
        this.productPicker = new SearchableSelect(this.productSelect, {
            emptyText: 'No products match that search'
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
        const searchInput = document.getElementById('dashboard-movement-search');
        if (searchInput) {
            searchInput.value = searchTerm || '';
        }
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

            return `
                <tr>
                    <td class="px-4">
                        <div class="fw-medium">${productName}</div>
                        <div class="text-muted small">${sku}</div>
                    </td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td>
                        <span class="badge ${movementDisplay.badgeClass}">
                            <i class="bi ${movementDisplay.iconClass} me-1"></i>${movementDisplay.label}
                        </span>
                    </td>
                    <td class="fw-semibold text-end px-4 ${movementDisplay.quantityClass}">${movementDisplay.sign}${quantity}</td>
                </tr>
            `;
        }).join('');

        this.loadingState?.classList.add('d-none');
        this.emptyState?.classList.add('d-none');
        this.errorState?.classList.add('d-none');
        this.tableView?.classList.remove('d-none');
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

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }
}
