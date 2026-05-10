export function renderPagination(paginationElement, paginationContainer, { currentPage, totalPages }, onPageChange) {
    if (!paginationElement || !paginationContainer) return;

    paginationContainer.classList.add('w-100');
    paginationElement.classList.remove('justify-content-end');
    paginationElement.classList.add('justify-content-center');

    if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        paginationElement.innerHTML = '';
        return;
    }

    paginationContainer.classList.remove('d-none');
    paginationElement.innerHTML = '';

    const createPageItem = (page, label, disabled = false, active = false, iconClass = '') => {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;

        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';

        if (iconClass) {
            a.setAttribute('aria-label', label);
            a.innerHTML = `<i class="bi ${iconClass}" aria-hidden="true"></i>`;
        } else {
            a.textContent = label;
        }

        a.addEventListener('click', (event) => {
            event.preventDefault();
            if (!disabled && !active && typeof onPageChange === 'function') {
                onPageChange(page);
            }
        });

        li.appendChild(a);
        return li;
    };

    const createEllipsisItem = () => {
        const li = document.createElement('li');
        li.className = 'page-item disabled';
        li.innerHTML = '<span class="page-link">&hellip;</span>';
        return li;
    };

    paginationElement.appendChild(createPageItem(currentPage - 1, 'Previous page', currentPage <= 1, false, 'bi-chevron-left'));

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationElement.appendChild(createPageItem(1, '1'));
        if (startPage > 2) {
            paginationElement.appendChild(createEllipsisItem());
        }
    }

    for (let page = startPage; page <= endPage; page += 1) {
        paginationElement.appendChild(createPageItem(page, String(page), false, page === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationElement.appendChild(createEllipsisItem());
        }
        paginationElement.appendChild(createPageItem(totalPages, String(totalPages)));
    }

    paginationElement.appendChild(createPageItem(currentPage + 1, 'Next page', currentPage >= totalPages, false, 'bi-chevron-right'));
}
