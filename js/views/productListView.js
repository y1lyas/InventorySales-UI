import { renderPagination } from '../utils/pagination.js';
import { formatDateTime, getProductCategoryName, getProductId, getProductName, getProductSku } from '../utils/productDisplay.js';
import { Toast } from '../utils/toast.js';

export class ProductListView {
    constructor() {
        this.tableBody = document.getElementById('product-list-body');
        this.paginationContainer = document.getElementById('pagination-container');
        this.pagination = document.getElementById('pagination');
        this.tableView = document.getElementById('table-view');
        this.emptyState = document.getElementById('empty-state');
        this.emptyStateTitle = document.getElementById('empty-state-title');
        this.emptyStateText = document.getElementById('empty-state-text');
        this.emptyStateButton = document.getElementById('empty-state-button');
        this.emptyStateIcon = document.getElementById('empty-state-icon');
        this.loadingState = document.getElementById('loading-state');
    }

    showLoading() {
        this.loadingState?.classList.remove('d-none');
        this.tableView?.classList.add('d-none');
        this.emptyState?.classList.add('d-none');
        this.paginationContainer?.classList.add('d-none');
    }

    showTable() {
        this.loadingState?.classList.add('d-none');
        this.tableView?.classList.remove('d-none');
        this.emptyState?.classList.add('d-none');
    }

    showEmptyState(options = {}) {
        const {
            icon = 'bi-box-seam',
            title = 'Your inventory is empty',
            text = 'Start by adding your first product to manage your stock levels.',
            buttonText = 'Create Your First Product',
            buttonAction = null
        } = options;

        if (this.emptyStateIcon) {
            this.emptyStateIcon.className = `bi ${icon}`;
        }

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
        console.error('ProductListView error:', message);
        this.showEmptyState({
            title: 'Unable to load products',
            text: message || 'Please try again later.',
            buttonText: null
        });
    }

    showSuccess(message) {
        Toast.show(message, 'success');
    }

    showActionError(message) {
        console.error('ProductListView error:', message);
        Toast.show(message, 'danger');
    }


    renderProducts(products) {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = products.map(p => {
            const productId = getProductId(p);
            const priceAmount = p.unitPrice || 0;
            const currency = p.currency;
            const skuValue = getProductSku(p);
            const formattedDate = formatDateTime(p.createdAt);
            const stockQuantity = p.currentStock || 0;

            return `
                <tr data-product-id="${productId}">
                    <td class="px-4">
                        <div class="fw-medium">${getProductName(p)}</div>
                        <div class="text-muted small">${skuValue}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${getProductCategoryName(p)}</span></td>
                    <td>
                        <span class="${stockQuantity < 10 ? 'text-danger fw-bold' : ''}">
                            ${stockQuantity} units
                        </span>
                    </td>
                    <td>${currency || ''} ${Number(priceAmount).toFixed(2)}</td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td class="text-end px-4">
                        <button class="btn btn-sm btn-light text-primary shadow-sm border-0 btn-edit-action" title="Edit Product">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border-0 btn-delete-action" title="Delete Product">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }
}
