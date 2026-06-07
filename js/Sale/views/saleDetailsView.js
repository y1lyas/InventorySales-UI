export class SaleDetailsView {
    constructor() {
        this.modalElement = document.getElementById('sale-details-modal');
        this.modalInstance = null;
        this.modalTitle = document.getElementById('sale-details-title');
        this.saleIdElement = document.getElementById('sale-details-id');
        this.saleDateElement = document.getElementById('sale-details-date');
        this.totalPriceElement = document.getElementById('sale-details-total');
        this.itemsBody = document.getElementById('sale-details-items-body');
        this.loadingState = document.getElementById('sale-details-loading');
        this.errorState = document.getElementById('sale-details-error');
        this.detailsSection = document.getElementById('sale-details-content');
    }

    ensureModal() {
        if (!this.modalElement) {
            return null;
        }
        if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(this.modalElement);
        }
        return this.modalInstance;
    }

    showLoading() {
        if (this.errorState) {
            this.errorState.classList.add('d-none');
            this.errorState.textContent = '';
        }

        if (this.detailsSection) {
            this.detailsSection.classList.add('d-none');
        }

        if (this.loadingState) {
            this.loadingState.classList.remove('d-none');
        }

        this.showModal();
    }

    hasVisibleDetails() {
        return Boolean(this.detailsSection && !this.detailsSection.classList.contains('d-none'));
    }

    setDetailsBusy(isBusy) {
        if (!this.detailsSection) return;

        this.detailsSection.style.opacity = isBusy ? '0.65' : '';
        this.detailsSection.style.pointerEvents = isBusy ? 'none' : '';
        this.detailsSection.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    }

    showModal() {
        const modal = this.ensureModal();
        if (!modal) {
            return;
        }
        modal.show();
    }

    hideModal() {
        this.modalInstance?.hide();
    }

    showError(message) {
        if (this.loadingState) {
            this.loadingState.classList.add('d-none');
        }

        this.setDetailsBusy(false);
        if (this.detailsSection) {
            this.detailsSection.classList.add('d-none');
        }

        if (this.errorState) {
            this.errorState.textContent = message || 'Unable to load sale details.';
            this.errorState.classList.remove('d-none');
        }

        this.showModal();
    }

    renderSaleDetails(sale) {
        if (this.loadingState) {
            this.loadingState.classList.add('d-none');
        }

        if (this.errorState) {
            this.errorState.classList.add('d-none');
            this.errorState.textContent = '';
        }

        if (this.saleIdElement) {
            this.saleIdElement.textContent = sale.id ?? 'N/A';
        }

        if (this.saleDateElement) {
            const dateValue = sale.saleDate || sale.createdAt || sale.createdDate;
            this.saleDateElement.textContent = dateValue ? new Date(dateValue).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'N/A';
        }

        if (this.totalPriceElement) {
            this.totalPriceElement.textContent = Number(sale.totalPrice ?? 0).toFixed(2);
        }

        if (this.itemsBody) {
            this.itemsBody.innerHTML = (sale.items || []).map((item) => `
                <tr>
                    <td>${this.escapeHtml(item.productName || 'N/A')}</td>
                    <td>${this.escapeHtml(item.quantity ?? 'N/A')}</td>
                    <td>${this.escapeHtml(Number(item.unitPrice ?? 0).toFixed(2))}</td>
                    <td>${this.escapeHtml(Number(item.lineTotal ?? 0).toFixed(2))}</td>
                </tr>
            `).join('');
        }

        if (this.detailsSection) {
            this.detailsSection.classList.remove('d-none');
        }

        this.showModal();
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
