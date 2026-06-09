import { formatDateTime } from '../../utils/productDisplay.js';

export class DashboardView {
    constructor() {
        this.loadingState = document.getElementById('dashboard-loading');
        this.contentState = document.getElementById('dashboard-content');

        // KPI elements
        this.totalProductsEl = document.getElementById('kpi-total-products');
        this.totalCategoriesEl = document.getElementById('kpi-total-categories');
        this.totalStockEl = document.getElementById('kpi-total-stock');
        this.lowStockEl = document.getElementById('kpi-low-stock');
        this.outOfStockEl = document.getElementById('kpi-out-of-stock');
        this.todaySalesAmountEl = document.getElementById('kpi-today-sales-amount');
        this.todaySalesCountEl = document.getElementById('kpi-today-sales-count');

        // Table bodies
        this.lowStockBody = document.getElementById('low-stock-table-body');
        this.recentSalesBody = document.getElementById('recent-sales-table-body');
        this.recentMovementsBody = document.getElementById('recent-movements-table-body');

        // Empty states
        this.lowStockEmpty = document.getElementById('low-stock-empty');
        this.recentSalesEmpty = document.getElementById('recent-sales-empty');
        this.recentMovementsEmpty = document.getElementById('recent-movements-empty');

        // Table wrappers
        this.lowStockTable = document.getElementById('low-stock-table');
        this.recentSalesTable = document.getElementById('recent-sales-table');
        this.recentMovementsTable = document.getElementById('recent-movements-table');
    }

    showLoading() {
        this.loadingState?.classList.remove('d-none');
        this.contentState?.classList.add('d-none');
    }

    showContent() {
        this.loadingState?.classList.add('d-none');
        this.contentState?.classList.remove('d-none');
    }

    renderKpis(data) {
        this.setTextContent(this.totalProductsEl, this.formatNumber(data.totalProducts));
        this.setTextContent(this.totalCategoriesEl, this.formatNumber(data.totalCategories));
        this.setTextContent(this.totalStockEl, this.formatNumber(data.totalStockQuantity));
        this.setTextContent(this.lowStockEl, this.formatNumber(data.lowStockProducts));
        this.setTextContent(this.outOfStockEl, this.formatNumber(data.outOfStockProducts));
        this.setTextContent(this.todaySalesAmountEl, this.formatCurrency(data.todaySalesAmount));
        this.setTextContent(this.todaySalesCountEl, this.formatNumber(data.todaySalesCount));
    }

    renderLowStockProducts(products) {
        if (!products || !products.length) {
            this.lowStockTable?.classList.add('d-none');
            this.lowStockEmpty?.classList.remove('d-none');
            return;
        }

        this.lowStockEmpty?.classList.add('d-none');
        this.lowStockTable?.classList.remove('d-none');

        if (!this.lowStockBody) return;

        this.lowStockBody.innerHTML = products.map((product) => {
            const stockClass = product.stock === 0 ? 'text-danger' : 'text-warning';
            const stockLabel = product.stock === 0 ? 'Out of stock' : `${this.formatNumber(product.stock)} left`;
            return `
                <tr>
                    <td class="fw-medium">${this.escapeHtml(product.productName)}</td>
                    <td><span class="text-muted">${this.escapeHtml(product.sku)}</span></td>
                    <td>
                        <span class="badge bg-opacity-10 ${product.stock === 0 ? 'bg-danger text-danger' : 'bg-warning text-warning'}">
                            ${this.escapeHtml(stockLabel)}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderRecentSales(sales) {
        if (!sales || !sales.length) {
            this.recentSalesTable?.classList.add('d-none');
            this.recentSalesEmpty?.classList.remove('d-none');
            return;
        }

        this.recentSalesEmpty?.classList.add('d-none');
        this.recentSalesTable?.classList.remove('d-none');

        if (!this.recentSalesBody) return;

        this.recentSalesBody.innerHTML = sales.map((sale) => {
            return `
                <tr>
                    <td class="text-muted small">${this.escapeHtml(sale.id)}</td>
                    <td>${this.escapeHtml(this.formatCurrency(sale.totalPrice))}</td>
                    <td>${this.escapeHtml(formatDateTime(sale.saleDate))}</td>
                </tr>
            `;
        }).join('');
    }

    renderRecentMovements(movements) {
        if (!movements || !movements.length) {
            this.recentMovementsTable?.classList.add('d-none');
            this.recentMovementsEmpty?.classList.remove('d-none');
            return;
        }

        this.recentMovementsEmpty?.classList.add('d-none');
        this.recentMovementsTable?.classList.remove('d-none');

        if (!this.recentMovementsBody) return;

        this.recentMovementsBody.innerHTML = movements.map((movement) => {
            const typeLabel = movement.movementType === 1 ? 'Increase' : 'Decrease';
            const typeClass = movement.movementType === 1 ? 'text-success' : 'text-danger';
            const typeBgClass = movement.movementType === 1 ? 'bg-success' : 'bg-danger';
            const typeIcon = movement.movementType === 1 ? 'bi-arrow-up' : 'bi-arrow-down';

            const reasonLabel = movement.reason === 1 ? 'Sale' : 'Adjustment';

            return `
                <tr>
                    <td class="fw-medium">${this.escapeHtml(movement.productName)}</td>
                    <td>
                        <span class="badge bg-opacity-10 ${typeBgClass} ${typeClass}">
                            <i class="bi ${typeIcon} me-1"></i>${this.escapeHtml(typeLabel)}
                        </span>
                    </td>
                    <td>${this.escapeHtml(String(movement.quantity))}</td>
                    <td><span class="text-muted">${this.escapeHtml(reasonLabel)}</span></td>
                    <td>${this.escapeHtml(formatDateTime(movement.createdDate))}</td>
                </tr>
            `;
        }).join('');
    }

    setTextContent(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    formatNumber(value) {
        return Number(value ?? 0).toLocaleString('tr-TR');
    }

    formatCurrency(value) {
        return Number(value ?? 0).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' ₺';
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
