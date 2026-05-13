export class Toast {
    static rootId = 'app-toast-root';

    static show(message, type = 'success') {
        const root = this.getRoot();

        const toast = document.createElement('div');
        toast.className = 'toast align-items-center bg-light border shadow-sm';
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';

        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${
                        type === 'success'
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-exclamation-triangle-fill text-danger'
                    } me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close me-3" data-bs-dismiss="toast"></button>
            </div>
        `;

        root.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });

        toast.addEventListener('hidden.bs.toast', () => toast.remove(), { once: true });

        bsToast.show();
    }

    static getRoot() {
        let root = document.getElementById(this.rootId);

        if (!root) {
            root = document.createElement('div');
            root.id = this.rootId;
            root.className = 'toast-container position-fixed top-0 end-0 p-3';
            root.style.zIndex = '1100';
            document.body.appendChild(root);
        }

        return root;
    }
}