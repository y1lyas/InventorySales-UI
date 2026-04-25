export default class DashboardView {
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
        this.bindEvents();
    }

    bindEvents() {
    // Delete button click
    this.tableBody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-delete-action');
        if (btn) {
            const id = btn.dataset.id;
            this.onDeleteClick?.(id);
        }
    });
    
    // Empty state button click
    this.emptyStateButton?.addEventListener('click', () => {
        if (window.showAddProductModal) {
            window.showAddProductModal();
        }
    });
}

    // Render methods for dashboardRenderer
    renderLoading() {
        if (this.loadingState) {
            this.loadingState.classList.remove('d-none');
            this.loadingState.style.display = 'block';
        }
        if (this.tableView) this.tableView.classList.add('d-none');
        if (this.emptyState) this.emptyState.classList.add('d-none');
    }

    renderError(message = 'An error occurred') {
        if (this.loadingState) this.loadingState.classList.add('d-none');
        if (this.tableView) this.tableView.classList.add('d-none');
        if (this.emptyState) {
            this.emptyState.classList.remove('d-none');
            this.emptyState.style.display = 'block';
            if (this.emptyStateTitle) this.emptyStateTitle.textContent = 'Error';
            if (this.emptyStateText) this.emptyStateText.textContent = message;
        }
    }

    renderEmpty() {
        if (this.loadingState) this.loadingState.classList.add('d-none');
        if (this.tableView) this.tableView.classList.add('d-none');
        if (this.emptyState) {
            this.emptyState.classList.remove('d-none');
            this.emptyState.style.display = 'block';
        }
    }

    showEmptyState() {
        this.renderEmpty();
    }

    showError(message) {
        console.error('DashboardView error:', message);
        this.showEmptyState();
    }

    showSuccess(message) {
    this.showAlert(message, 'success');
    }

    showActionError(message) {
        console.error('DashboardView error:', message);
        this.showAlert(message, 'danger');
    }

    showAlert(message, type = 'success') {

    const alertContainer = document.getElementById('alert-container') || this.tableView;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show shadow-sm border-0`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.prepend(alertDiv);

    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 3000);
}

  renderTable(products) {
    if (!this.tableBody) {
      return;
    }
    
    if (!products || products.length === 0) {
      this.renderEmpty();
      return;
    }

    this.tableBody.innerHTML = products.map(p => `
        <tr>
            <td class="px-4"> <div class="fw-medium">${p.name ?? 'Unnamed Product'}</div>
                        <div class="text-muted small">${p.skUnit || '-'}</div></td>
            <td><span class="badge bg-light text-dark border">${p.categoryName || p.category?.name || 'General'}</span></td>
            <td>${p.currentStock || 0}</td>
            <td>${p.unitPrice || 0} ${p.currency || 'TL'}</td>
            <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : '-'}</td>
            <td class="text-end px-4">
                <button data-id="${p.id}" class="btn btn-sm btn-outline-danger btn-delete-action" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Show table, hide others
    if (this.tableView) {
        this.tableView.classList.remove('d-none');
        this.tableView.style.display = 'table';
    }
    if (this.emptyState) this.emptyState.classList.add('d-none');
    if (this.loadingState) this.loadingState.classList.add('d-none');
    
    console.log('DashboardView: table rendered successfully');
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
