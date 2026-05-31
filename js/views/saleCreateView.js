import { renderPagination } from '../utils/pagination.js';

export class SaleCreateView {
    constructor() {
        this.productTableBody = document.getElementById('sale-product-table-body');
        this.cartTableBody = document.getElementById('sale-cart-table-body');
        this.cartEmptyState = document.getElementById('sale-cart-empty');
        this.cartSummary = document.getElementById('sale-cart-total');
        this.errorState = document.getElementById('sale-create-error');
        this.productTable = document.getElementById('sale-product-table');
        this.productSearchInput = document.getElementById('sale-product-search');
        this.paginationContainer = document.getElementById('sale-product-pagination-container');
        this.pagination = document.getElementById('sale-product-pagination');
    }

    showProductTable() {
        this.productTable?.classList.remove('d-none');
    }

    renderProductList(products) {
        if (!this.productTableBody) return;

        if (!products.length) {
            this.productTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No products match your search.</td>
                </tr>
            `;
            return;
        }

        this.productTableBody.innerHTML = products.map((product) => {
            const price = Number(product.unitPrice ?? product.price ?? 0).toFixed(2);
            const stockQuantity = product.currentStock ?? product.stock ?? 0;
            return `
                <tr data-product-id="${this.escapeHtml(product.id)}">
                    <td>
                        <div class="fw-semibold">${this.escapeHtml(product.name)}</div>
                        <div class="text-muted small">${this.escapeHtml(product.sku || product.skUnit || 'N/A')}</div>
                    </td>
                    <td>${this.escapeHtml(String(stockQuantity))}</td>
                    <td>${this.escapeHtml(price)}</td>
                    <td>
                        <input type="number" min="1" step="1" class="form-control form-control-sm product-quantity-input" value="1">
                    </td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-primary btn-add-to-cart">Add</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }

    renderCart(items) {
        if (!this.cartTableBody || !this.cartSummary) return;

        if (!items.length) {
            this.cartEmptyState?.classList.remove('d-none');
            this.cartTableBody.innerHTML = '';
            this.cartSummary.textContent = '0.00';
            return;
        }

        this.cartEmptyState?.classList.add('d-none');
        this.cartTableBody.innerHTML = items.map((item) => {
            const lineTotal = Number(item.unitPrice * item.quantity).toFixed(2);
            return `
                <tr data-product-id="${this.escapeHtml(item.productId)}">
                    <td>${this.escapeHtml(item.productName)}</td>
                    <td>
                        <input type="number" min="1" step="1" class="form-control form-control-sm cart-item-quantity" value="${this.escapeHtml(item.quantity)}">
                    </td>
                    <td>${this.escapeHtml(Number(item.unitPrice).toFixed(2))}</td>
                    <td>${this.escapeHtml(lineTotal)}</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger btn-remove-cart-item">Remove</button>
                    </td>
                </tr>
            `;
        }).join('');

        const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        this.cartSummary.textContent = Number(total).toFixed(2);
    }

    showError(message) {
        if (!this.errorState) return;
        this.errorState.textContent = message || '';
        this.errorState.classList.remove('d-none');
    }

    clearError() {
        if (!this.errorState) return;
        this.errorState.textContent = '';
        this.errorState.classList.add('d-none');
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
