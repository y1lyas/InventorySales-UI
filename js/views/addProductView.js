class AddProductView {
    constructor() {
        this.form = document.getElementById('addProductForm');
        this.modal = document.getElementById('addProductModal');
        this.modalInstance = null;
        this.categorySelect = document.getElementById('pCategory');
        this.nameInput = document.getElementById('pName');
        this.priceInput = document.getElementById('pPrice');
        this.skuInput = document.getElementById('pSku');
    }

    show() {
        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.modal);
        }
        this.modalInstance.show();
    }

    showWithLoading() {
        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.modal);
        }
        this.modalInstance.show();
        this.showCategoryLoading();
    }

    showCategoryLoading() {
        if (!this.categorySelect) return;
        this.categorySelect.innerHTML = '<option value="">Loading categories...</option>';
        this.categorySelect.disabled = true;
    }

    hide() {
        if (this.modalInstance) {
            this.modalInstance.hide();
        }
    }

    renderCategories(categories) {
        if (!this.categorySelect) return;

        this.categorySelect.disabled = false;
        this.categorySelect.innerHTML = '<option value="">None (Optional)</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            const categoryIdValue = cat.id ?? cat.categoryId ?? cat._id ?? '';
            option.value = categoryIdValue;
            option.textContent = cat.name ?? 'Unknown category';
            this.categorySelect.appendChild(option);
        });
    }

    getFormData() {
        return {
            name: this.nameInput?.value?.trim() || '',
            sku: this.skuInput?.value?.trim() || '',
            priceRaw: this.priceInput?.value?.trim().replace(',', '.') || '',
            categoryValue: this.categorySelect?.value?.trim() || ''
        };
    }

    resetForm() {
        this.form?.reset();
    }

    showSuccess(message = 'Product added successfully!') {
        alert(message);
    }

    showError(message = 'An error occurred.') {
        alert('Error: ' + message);
    }

    showCategoryError(message = 'Failed to load categories') {
        if (!this.categorySelect) return;
        this.categorySelect.disabled = false;
        this.categorySelect.innerHTML = '<option value="">Failed to load categories</option>';
        console.error(message);
    }

    onFormSubmit(callback) {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}

window.AddProductView = AddProductView;
export default AddProductView;
