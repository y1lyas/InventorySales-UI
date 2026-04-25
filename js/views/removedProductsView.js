class RemovedProductsView {
    constructor() {
this.modalElement = document.getElementById('recycleBinModal');
        this.modal = new bootstrap.Modal(this.modalElement);        
        this.tableBody = document.getElementById('recycle-bin-table-body');
        this.spinner = document.getElementById('trash-spinner');
        this.tableContainer = document.getElementById('trash-table-container');
        this.paginationContainer = document.getElementById('trash-pagination-container');
        this.pagination = document.getElementById('trash-pagination');
    }
show() {
        if (this.modal) {
            this.modal.show();
        } else {
            console.error("Modal element found but bootstrap modal not initialized.");
        }
    }
showLoading() {
        if (this.tableContainer) this.tableContainer.classList.add('d-none');
        if (this.paginationContainer) this.paginationContainer.classList.add('d-none');
        if (this.tableBody) this.tableBody.innerHTML = ''; 
        if (this.spinner) this.spinner.classList.remove('d-none');
    }

    showTable() {
        if (this.spinner && this.tableContainer) {
            this.spinner.classList.add('d-none');
            this.tableContainer.classList.remove('d-none');
        }
    }

    showEmptyState({ icon= 'bi-trash3', title = 'Bin is empty', text = 'There are no removed products to display.', buttonText = null, buttonAction = null, isSearch = false } = {}) {
        if (this.spinner) this.spinner.classList.add('d-none');
        if (this.paginationContainer) this.paginationContainer.classList.add('d-none');
        if (this.tableContainer) this.tableContainer.classList.remove('d-none');
        if (!this.tableBody) return;

        this.tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <div class="mb-3">
                        <i class="bi ${isSearch ? 'bi-search' : icon} fs-1 text-muted opacity-50"></i>
                    </div>
                    <h5 class="fw-bold">${title}</h5>
                    <p class="text-muted">${text}</p>
                    ${buttonText ? `<button type="button" class="btn btn-sm btn-primary mt-3" id="trash-empty-state-button">${buttonText}</button>` : ''}
                </td>
            </tr>`;

        if (buttonText && buttonAction) {
            const button = document.getElementById('trash-empty-state-button');
            if (button) {
                button.onclick = buttonAction;
            }
        }
    }

    showError(message) {
        console.error('RemovedProductsView error:', message);
        this.showEmptyState({
            title: 'Error loading products',
            text: message || 'Unable to load removed products. Please try again.',
            icon: 'bi-exclamation-octagon',
        });
    }

    renderProducts(products, options = {}) {
        if (this.tableBody) this.tableBody.innerHTML = '';
        
        this.renderDeletedProducts(products);
    }

renderDeletedProducts(products) {
        this.showTable(); 
        
        if (!this.tableBody) return;

        this.tableBody.innerHTML = products.map(p => {
            const skuValue = p.skUnit ?? p.sku ?? 'N/A';
            const dateRaw = p.deletedAt || p.DeletedAt || p.deleted_date;
            const createdDateRaw = p.createdAt || p.CreatedAt || p.created_date;
            const formattedDate = dateRaw
                ? new Date(dateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';
            const formattedCreatedDate = createdDateRaw
                ? new Date(createdDateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A';

            return `
                <tr>
                    <td class="px-4">
                        <div class="fw-medium">${p.name ?? 'Unnamed Product'}</div>
                        <div class="text-muted small">${skuValue}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">${p.categoryName || 'General'}</span></td>
                    <td class="text-muted small">${formattedCreatedDate}</td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td class="text-end px-4">
                        <button class="btn btn-sm btn-light text-success border-0 shadow-sm me-2" onclick="restoreProduct('${p.id}')">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger border-0 shadow-sm" onclick="permanentlyDelete('${p.id}')">
                            <i class="bi bi-x-circle-fill"></i>
                        </button>
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



window.RemovedProductsView = RemovedProductsView;