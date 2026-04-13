class DashboardView {
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
            buttonAction = window.showAddProductModal
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
        console.error('DashboardView error:', message);
        this.showEmptyState();
    }

    renderProducts(products) {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = products.map(p => {
            const priceAmount = p.unitPrice ?? p.price ?? 0;
            const currency = p.currency ?? 'TL';
            const skuValue = p.skUnit ?? p.sku ?? 'N/A';
            const dateRaw = p.createdAt || p.CreatedAt || p.created_date;
            const formattedDate = dateRaw
                ? new Date(dateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';
            const stockQuantity = p.currentStock ?? p.stock ?? 0;

            return `
                <tr>
                    <td class="px-4">
                        <div class="fw-medium">${p.name ?? 'Unnamed Product'}</div>
                        <div class="text-muted small">${skuValue}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${p.categoryName || p.category?.name || 'General'}</span></td>
                    <td>
                        <span class="${stockQuantity < 10 ? 'text-danger fw-bold' : ''}">
                            ${stockQuantity} units
                        </span>
                    </td>
                    <td>${currency} ${Number(priceAmount).toFixed(2)}</td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td class="text-end px-4">
                        <button class="text-decoration-none btn btn-sm btn-link text-primary p-0 me-2">Edit</button>
                        <button class="text-decoration-none btn btn-sm btn-link text-danger p-0">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        if (!this.pagination || !this.paginationContainer) return;
        if (totalPages <= 1) {
            this.paginationContainer.classList.add('d-none');
            return;
        }

        this.paginationContainer.classList.remove('d-none');
        this.pagination.innerHTML = '';

        const createPageItem = (page, label, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = label;
            a.addEventListener('click', (event) => {
                event.preventDefault();
                if (!disabled && !active && typeof onPageChange === 'function') {
                    onPageChange(page);
                }
            });
            li.appendChild(a);
            return li;
        };

        this.pagination.appendChild(createPageItem(currentPage - 1, 'Previous', currentPage <= 1));

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            this.pagination.appendChild(createPageItem(1, '1'));
            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">&hellip;</span>';
                this.pagination.appendChild(ellipsis);
            }
        }

        for (let page = startPage; page <= endPage; page += 1) {
            this.pagination.appendChild(createPageItem(page, String(page), false, page === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">&hellip;</span>';
                this.pagination.appendChild(ellipsis);
            }
            this.pagination.appendChild(createPageItem(totalPages, String(totalPages)));
        }

        this.pagination.appendChild(createPageItem(currentPage + 1, 'Next', currentPage >= totalPages));
    }
}

window.DashboardView = DashboardView;
