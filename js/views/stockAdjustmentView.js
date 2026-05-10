import { SearchableSelect } from '../utils/searchableSelect.js';

export class StockAdjustmentView {
    constructor() {
        this.form = document.getElementById('adjustStockForm');
        this.modalElement = document.getElementById('adjustStockModal');
        this.modalInstance = null;
        this.productSelect = document.getElementById('adjustStockProduct');
        this.productPicker = new SearchableSelect(this.productSelect, {
            placeholder: 'Search product by name or SKU',
            emptyText: 'No products match that search'
        });
        this.quantityInput = document.getElementById('adjustStockQuantity');
        this.actionSelect = document.getElementById('adjustStockAction');
    }

    show(products) {
        this.renderProducts(products);

        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.modalElement);
        }

        this.modalInstance.show();
    }

    hide() {
        if (this.modalInstance) {
            this.modalInstance.hide();
        }
    }

    renderProducts(products) {
        if (!this.productSelect) return;

        const seenProductIds = new Set();
        this.productSelect.innerHTML = '<option value="">Select product</option>';

        products.forEach((product) => {
            const productId = product.id ?? product.productId;
            if (!productId || seenProductIds.has(String(productId))) {
                return;
            }

            seenProductIds.add(String(productId));

            const option = document.createElement('option');
            option.value = productId;
            option.textContent = `${product.name || 'Unnamed Product'} (${product.sku || product.skUnit || 'N/A'})`;
            this.productSelect.appendChild(option);
        });

        this.productPicker?.refreshOptions();
    }

    getFormData() {
        return {
            productId: this.productPicker?.hasUncommittedSearch() ? '' : (this.productSelect?.value || ''),
            quantityRaw: this.quantityInput?.value || '',
            action: this.actionSelect?.value || 'increase'
        };
    }

    resetForm() {
        this.form?.reset();
        this.productPicker?.setValue('', false);
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert('Error: ' + message);
    }
}
