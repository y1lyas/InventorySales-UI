import { getProductId, getProductOptionLabel } from '../../utils/productDisplay.js';
import { renderPagination } from '../../utils/pagination.js';
import { SearchableSelect } from '../../utils/searchableSelect.js';
import { Toast } from '../../utils/toast.js';


export class CategoryView {
    constructor() {
        this.categoryList = document.getElementById('category-list');
        this.createForm = document.getElementById('createCategoryForm');
        this.categoryNameInput = document.getElementById('categoryName');
        this.categoryDescriptionInput = document.getElementById('categoryDescription');
        this.assignForm = document.getElementById('assignCategoryForm');
        this.assignProductSelect = document.getElementById('assignProduct');
        this.assignCategorySelect = document.getElementById('assignCategory');
        this.unassignForm = document.getElementById('unassignCategoryForm');
        this.unassignProductSelect = document.getElementById('unassignProduct');
        this.alertContainer = document.getElementById('category-alert');
        this.loadingState = document.getElementById('category-loading');
        this.content = document.getElementById('category-content');
        this.paginationContainer = document.getElementById('category-pagination-container');
        this.pagination = document.getElementById('category-pagination');

        this.assignProductPicker = new SearchableSelect(this.assignProductSelect, {
            emptyText: 'No products found',
            placeholder: 'Find a product to assign',
        });

        this.unassignProductPicker = new SearchableSelect(this.unassignProductSelect, {
            emptyText: 'No products found',
            placeholder: 'Find a product to unassign',
        });
        this.assignCategoryPicker = new SearchableSelect(this.assignCategorySelect, {
            emptyText: 'No categories found',
            placeholder: 'Find a category to assign',
        });
    }

    showLoading() {
        this.loadingState?.classList.remove('d-none');
        this.content?.classList.add('d-none');
    }

    showContent() {
        this.loadingState?.classList.add('d-none');
        this.content?.classList.remove('d-none');
    }

    renderCategories(categories, getCategoryId) {
        if (this.categoryList) {
            this.categoryList.innerHTML = categories.length
                ? categories.map((category) => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${category.name ?? 'Unnamed category'}</span>
                        <span class="text-muted small">${getCategoryId(category)}</span>
                    </li>
                `).join('')
                : '<li class="list-group-item text-muted">No categories found.</li>';
        }

        this.renderCategoryOptions(categories, getCategoryId);
        this.assignCategoryPicker?.refreshOptions();
    }

    renderCategoryList(pageCategories, getCategoryId) {
        if (this.categoryList) {
            this.categoryList.innerHTML = pageCategories.length
                ? pageCategories.map((category) => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${category.name ?? 'Unnamed category'}</span>
                        <span class="text-muted small">${getCategoryId(category)}</span>
                    </li>
                `).join('')
                : '<li class="list-group-item text-muted">No categories found.</li>';
        }
    }

    renderCategoryPagination({ currentPage, totalPages }, onPageChange) {
        renderPagination(this.pagination, this.paginationContainer, { currentPage, totalPages }, onPageChange);
    }

    renderProducts(products) {
        this.renderProductOptions(this.assignProductSelect, products);
        this.renderProductOptions(this.unassignProductSelect, products);
        this.assignProductPicker?.refreshOptions();
        this.unassignProductPicker?.refreshOptions();
    }

    renderCategoryOptions(categories, getCategoryId) {
        if (!this.assignCategorySelect) return;

        this.assignCategorySelect.innerHTML = '<option value="">Select category</option>';
        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = getCategoryId(category);
            option.textContent = category.name ?? 'Unnamed category';
            this.assignCategorySelect.appendChild(option);
        });
    }

    renderProductOptions(selectElement, products) {
        if (!selectElement) return;

        selectElement.innerHTML = '<option value="">Select product</option>';
        products.forEach((product) => {
            const option = document.createElement('option');
            option.value = getProductId(product);
            option.textContent = getProductOptionLabel(product);
            selectElement.appendChild(option);
        });
    }

    getCreateFormData() {
        return {
            name: this.categoryNameInput?.value || '',
            description: this.categoryDescriptionInput?.value || ''

        };
    }

    getAssignFormData() {
        return {
            productId: this.assignProductSelect?.value || '',
            categoryId: this.assignCategorySelect?.value || ''
        };
    }

    getUnassignFormData() {
        return {
            productId: this.unassignProductSelect?.value || ''
        };
    }

    resetCreateForm() {
        this.createForm?.reset();
    }

    resetAssignForm() {
        this.assignForm?.reset();
    }

    resetUnassignForm() {
        this.unassignForm?.reset();
    }

    showSuccess(message) {
        Toast.show(message, 'success');
    }

    showError(message) {
        Toast.show(message, 'danger');
    }

    showAlert(message, type) {
        if (!this.alertContainer) return;

        this.alertContainer.className = `alert alert-${type}`;
        this.alertContainer.textContent = message;
        this.alertContainer.classList.remove('d-none');
    }
}
