import { SearchableSelect } from '../../utils/searchableSelect.js';
import { getProductId, getProductOptionLabel } from '../../utils/productDisplay.js';

export class PriceAdjustmentView {
    constructor() {
        this.form = document.getElementById('adjustPriceForm');
        this.modalElement = document.getElementById('adjustPriceModal');
        this.modalInstance = null;
        this.productSelect = document.getElementById('adjustPriceProduct');
        this.productPicker = new SearchableSelect(this.productSelect, {
            placeholder: 'Find a product to price',
            emptyText: 'No products match that search'
        });
        this.priceInput = document.getElementById('adjustPriceValue');
    }

    show(products, selectedProduct = null) {
        if (!this.modalElement) return;

        this.renderProducts(products);

        const productId = selectedProduct ? getProductId(selectedProduct) : '';
        const price = selectedProduct?.unitPrice ?? selectedProduct?.price ?? '';

        this.productPicker?.setValue(productId, false);

        if (this.priceInput) {
            this.priceInput.value = price !== '' ? Number(price).toFixed(2) : '';
        }

        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.modalElement);
        }

        this.modalInstance.show();
        this.priceInput?.focus();
    }

    hide() {
        this.modalInstance?.hide();
    }

    getFormData() {
        return {
            productId: this.productPicker?.hasUncommittedSearch() ? '' : (this.productSelect?.value || ''),
            newPrice: this.priceInput?.value || ''
        };
    }

    resetForm() {
        this.form?.reset();
        this.productPicker?.setValue('', false);
    }

    renderProducts(products) {
        if (!this.productSelect) return;

        const seenProductIds = new Set();
        this.productSelect.innerHTML = '<option value="">Select product</option>';

        products.forEach((product) => {
            const productId = getProductId(product);
            if (!productId || seenProductIds.has(String(productId))) {
                return;
            }

            seenProductIds.add(String(productId));

            const option = document.createElement('option');
            option.value = productId;
            option.textContent = getProductOptionLabel(product);
            this.productSelect.appendChild(option);
        });

        this.productPicker?.refreshOptions();
    }

    showError(message) {
        alert('Error: ' + message);
    }
}
