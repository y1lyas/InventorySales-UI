import { renderPagination } from '../../utils/pagination.js';
import { SearchableSelect } from '../../utils/searchableSelect.js';
import { formatDateTime, getProductCategoryName, getProductId, getProductName, getProductSku } from '../../utils/productDisplay.js';
import { Toast } from '../../utils/toast.js';

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
        this.categoryFilter = document.getElementById('category-filter');
        this.filterPanel = document.getElementById('product-filter-panel');
        this.categoryPicker = new SearchableSelect(this.categoryFilter, {
            placeholder: 'Filter by category',
            emptyText: 'No categories found'
        });
        this.categoryDescriptions = new Map();
        this.activeCategoryPopover = null;
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

    bindCategoryFilterChange(onChange) {
        this.categoryFilter?.addEventListener('change', function (event) {
            onChange(event.target.value);
        });
    }

    renderCategoryFilter(categories, getCategoryId) {
        if (!this.categoryFilter) {
            return;
        }

        this.categoryDescriptions.clear();
        this.categoryFilter.innerHTML = '<option value="">All Categories</option>';

        categories.forEach((category) => {
            const categoryId = getCategoryId(category);
            const option = document.createElement('option');
            option.value = categoryId;
            option.textContent = category.name ?? 'Unknown category';
            this.categoryFilter.appendChild(option);

            if (categoryId) {
                this.categoryDescriptions.set(String(categoryId), {
                    name: category.name ?? 'Unknown category',
                    description: category.description || 'No description available.'
                });
            }
        });

        this.categoryPicker?.refreshOptions();
    }

    setCategoryFilterValue(value) {
        if (!this.categoryFilter) {
            return;
        }

        if (this.categoryPicker) {
            this.categoryPicker.setValue(value || '', false);
            return;
        }

        this.categoryFilter.value = value || '';
    }

    toggleFilterPanel() {
        this.filterPanel?.classList.toggle('d-none');
    }

    getAdvancedFilterValues() {
        return {
            minStock: document.getElementById('product-filter-min-stock')?.value || '',
            maxStock: document.getElementById('product-filter-max-stock')?.value || '',
            minPrice: document.getElementById('product-filter-min-price')?.value || '',
            maxPrice: document.getElementById('product-filter-max-price')?.value || '',
            startDate: document.getElementById('product-filter-start-date')?.value || '',
            endDate: document.getElementById('product-filter-end-date')?.value || ''
        };
    }

    setAdvancedFilterValues(filters = {}) {
        const values = {
            'product-filter-min-stock': filters.minStock || '',
            'product-filter-max-stock': filters.maxStock || '',
            'product-filter-min-price': filters.minPrice || '',
            'product-filter-max-price': filters.maxPrice || '',
            'product-filter-start-date': filters.startDate || '',
            'product-filter-end-date': filters.endDate || ''
        };

        Object.entries(values).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
            }
        });
    }

    renderProducts(products, options = {}) {
        if (!this.tableBody) return;

        const editingProductId = options.editingProductId ? String(options.editingProductId) : '';
        this.closeCategoryPopover();
        this.tableBody.innerHTML = products.map(p => {
            const productId = getProductId(p);
            const isEditing = String(productId) === editingProductId;
            const productName = getProductName(p);
            const priceAmount = p.unitPrice || 0;
            const currency = p.currency;
            const skuValue = getProductSku(p);
            const formattedDate = formatDateTime(p.createdAt);
            const stockQuantity = p.currentStock || 0;
            const category = this.getCategoryDisplay(p);

            return `
                <tr data-product-id="${this.escapeHtml(productId)}">
                    <td class="px-4">
                        ${isEditing
                            ? `<input type="text"
                                class="form-control form-control-sm product-name-edit-input"
                                value="${this.escapeHtml(productName)}"
                                maxlength="120"
                                aria-label="Product name">`
                            : `<div class="fw-medium product-name-text">${this.escapeHtml(productName)}</div>`}
                        <div class="text-muted small">${this.escapeHtml(skuValue)}</div>
                    </td>
                    <td>
                        <button type="button"
                            class="badge bg-light text-dark border category-description-badge"
                            data-bs-toggle="popover"
                            data-bs-placement="top"
                            data-bs-title="${this.escapeHtml(category.name)}"
                            data-bs-content="${this.escapeHtml(category.description)}">
                            ${this.escapeHtml(category.name)}
                        </button>
                    </td>
                    <td>
                        <span class="${stockQuantity < 10 ? 'text-danger fw-bold' : ''}">
                            ${stockQuantity} units
                        </span>
                    </td>
                    <td>${this.escapeHtml(currency || '')} ${Number(priceAmount).toFixed(2)}</td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td class="text-end px-4">
                        <button class="btn btn-sm btn-light ${isEditing ? 'text-success' : 'text-primary'} shadow-sm border-0 btn-edit-action"
                            title="${isEditing ? 'Save Product Name' : 'Edit Product'}"
                            aria-label="${isEditing ? 'Save product name' : 'Edit product name'}"
                            data-edit-mode="${isEditing ? 'save' : 'edit'}">
                            <i class="bi ${isEditing ? 'bi-check-lg' : 'bi-pencil-fill'}"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger shadow-sm border-0 btn-delete-action" title="Delete Product">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.bindCategoryDescriptionBadges();
    }

    getInlineProductName(productId) {
        const row = this.getProductRow(productId);
        const input = row?.querySelector('.product-name-edit-input');
        return input?.value || '';
    }

    focusInlineProductName(productId) {
        const row = this.getProductRow(productId);
        const input = row?.querySelector('.product-name-edit-input');

        if (!input) {
            return;
        }

        input.focus();
        input.select();
    }

    getProductRow(productId) {
        if (!this.tableBody) {
            return null;
        }

        return Array.from(this.tableBody.querySelectorAll('tr[data-product-id]'))
            .find((row) => row.dataset.productId === String(productId)) || null;
    }

    renderPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }

    bindCategoryDescriptionBadges() {
        if (!window.bootstrap?.Popover) {
            return;
        }

        this.tableBody.querySelectorAll('.category-description-badge').forEach((badge) => {
            const popover = new window.bootstrap.Popover(badge, {
                trigger: 'manual',
                html: false
            });

            badge.addEventListener('click', (event) => {
                event.stopPropagation();

                if (this.activeCategoryPopover && this.activeCategoryPopover !== popover) {
                    this.activeCategoryPopover.hide();
                }

                popover.toggle();
                this.activeCategoryPopover = popover;
                window.setTimeout(() => {
                    document.addEventListener('click', () => this.closeCategoryPopover(), { once: true });
                }, 0);
            });
        });
    }

    closeCategoryPopover() {
        if (this.activeCategoryPopover) {
            this.activeCategoryPopover.hide();
            this.activeCategoryPopover = null;
        }
    }

    getCategoryDisplay(product) {
        const categoryId = this.getCategoryId(product?.category ?? product);
        const categoryFromList = this.categoryDescriptions.get(String(categoryId));
        const productCategoryName = getProductCategoryName(product, '');

        return {
            name: productCategoryName || categoryFromList?.name || 'General',
            description: product?.category?.description || categoryFromList?.description || 'No description available.'
        };
    }

    getCategoryId(item) {
        return item?.categoryId ?? item?.id ?? item?.categoryGuid ?? item?._id ?? '';
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character]));
    }
}
