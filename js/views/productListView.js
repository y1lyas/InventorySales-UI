import { renderPagination } from '../utils/pagination.js';

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
            title = 'Your inventory is empty',
            text = 'Start by adding your first product to manage your stock levels.',
            buttonText = 'Create Your First Product',
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
        console.error('ProductListView error:', message);
        this.showEmptyState({
            title: 'Unable to load products',
            text: message || 'Please try again later.',
            buttonText: null
        });
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showActionError(message) {
        console.error('ProductListView error:', message);
        this.showAlert(message, 'danger');
    }

    showAlert(message, type = 'success') {
        const toastRoot = this.getToastRoot();
        const toast = document.createElement('div');

        toast.className = 'toast align-items-center bg-white border-0 shadow-sm';
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close me-3" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastRoot.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        toast.addEventListener('hidden.bs.toast', () => toast.remove(), { once: true });
        bsToast.show();
    }

    getToastRoot() {
        let toastRoot = document.getElementById('product-toast-root');

        if (!toastRoot) {
            toastRoot = document.createElement('div');
            toastRoot.id = 'product-toast-root';
            toastRoot.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastRoot.style.zIndex = '1100';
            document.body.appendChild(toastRoot);
        }

        return toastRoot;
    }

    renderProducts(products) {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = products.map(p => {
            const productId = p.id ?? p.productId;
            const priceAmount = p.unitPrice || 0;
            const currency = p.currency;
            const skuValue = p.skUnit || p.sku || 'N/A';
            const dateRaw = p.createdAt;
            const formattedDate = dateRaw
                ? new Date(dateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' , hour: '2-digit', minute: '2-digit' })
                : 'N/A';
            const stockQuantity = p.currentStock || 0;

            return `
                <tr data-product-id="${productId}">
                    <td class="px-4">
                        <div class="fw-medium">${p.name || 'Unnamed Product'}</div>
                        <div class="text-muted small">${skuValue}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${p.categoryName || p.category?.name || 'General'}</span></td>
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
