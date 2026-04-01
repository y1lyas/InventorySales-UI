const API_BASE_URL = 'https://localhost:7298/api';
let currentPage = 1;
const pageSize = 10;

async function fetchAndRenderProducts(page = 1) {
    currentPage = page;
    const tbody = document.getElementById('product-list-body');
    const paginationContainer = document.getElementById('pagination-container');

    setViewState({ loading: true, table: false, empty: false });
    paginationContainer?.classList.add('d-none');

    try {
        const url = new URL(`${API_BASE_URL}/products/GetAll`);
        url.searchParams.set('page', currentPage);
        url.searchParams.set('pageNumber', currentPage);
        url.searchParams.set('pageIndex', Math.max(0, currentPage - 1));
        url.searchParams.set('pageSize', pageSize);
        url.searchParams.set('size', pageSize);

        console.log('Fetching products page:', currentPage, 'url:', url.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        console.log('API Response:', data);

        const products = extractProducts(data);
        const paginationInfo = getPaginationInfo(data, products.length);

        if (!products.length) {
            console.log('Showing empty state');
            setViewState({ loading: false, table: false, empty: true });
            return;
        }

        console.log('Rendering products:', products.length);
        renderTable(products, tbody);
        setViewState({ loading: false, table: true, empty: false });
        renderPagination(paginationInfo);
    } catch (error) {
        console.error('Dashboard Error:', error);
        setViewState({ loading: false, table: false, empty: true });
    }
}

function extractProducts(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.result)) return data.result;
    return [];
}

function getPaginationInfo(data, currentCount) {
    const totalItems = typeof data.totalCount === 'number'
        ? data.totalCount
        : typeof data.totalItems === 'number'
            ? data.totalItems
            : typeof data.total === 'number'
                ? data.total
                : null;

    const page = parseInt(data.page ?? data.currentPage ?? data.pageIndex ?? data.pageNumber ?? currentPage, 10);
    const size = parseInt(data.pageSize ?? data.size ?? pageSize, 10) || pageSize;
    const currentPageValue = Number.isFinite(page) && page > 0 ? page : currentPage;
    const totalPages = totalItems !== null
        ? Math.max(1, Math.ceil(totalItems / size))
        : Math.max(1, Math.ceil(currentCount / size));

    return { currentPage: currentPageValue, pageSize: size, totalItems, totalPages };
}

function renderPagination({ currentPage, totalPages }) {
    const pagination = document.getElementById('pagination');
    const paginationContainer = document.getElementById('pagination-container');

    if (!pagination || !paginationContainer) return;
    if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        return;
    }

    paginationContainer.classList.remove('d-none');
    pagination.innerHTML = '';

    const createPageItem = (page, label, disabled = false, active = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = label;
        a.addEventListener('click', (event) => {
            event.preventDefault();
            if (!disabled && !active) fetchAndRenderProducts(page);
        });
        li.appendChild(a);
        return li;
    };

    pagination.appendChild(createPageItem(currentPage - 1, 'Previous', currentPage <= 1));

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        pagination.appendChild(createPageItem(1, '1'));
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">&hellip;</span>';
            pagination.appendChild(ellipsis);
        }
    }

    for (let page = startPage; page <= endPage; page += 1) {
        pagination.appendChild(createPageItem(page, String(page), false, page === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">&hellip;</span>';
            pagination.appendChild(ellipsis);
        }
        pagination.appendChild(createPageItem(totalPages, String(totalPages)));
    }

    pagination.appendChild(createPageItem(currentPage + 1, 'Next', currentPage >= totalPages));
}

function setViewState({ loading, table, empty }) {
    const tableView = document.getElementById('table-view');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');

    loadingState.classList.toggle('d-none', !loading);
    tableView.classList.toggle('d-none', !table);
    emptyState.classList.toggle('d-none', !empty);
}

function renderTable(products, container) {
    container.innerHTML = products.map(p => {
        const priceAmount = p.unitPrice ?? p.price ?? 0;
        const currency = p.currency ?? 'TL';
        const skuValue = p.skUnit ?? p.sku ?? 'N/A';
        const dateRaw = p.createdAt || p.CreatedAt || p.created_date;
        const formattedDate = dateRaw
            ? new Date(dateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'N/A';
        const stockQuantity = p.currentStock ?? p.stock ?? 0;

        return `
            <tr>
                <td class="px-4">
                    <div class="fw-medium">${p.name ?? 'Unnamed Product'}</div>
                    <div class="text-muted small">${skuValue}</div>
                </td>
                <td><span class="badge bg-light text-dark border">${p.categoryName || p.category?.name || 'General'}</span></td>
                <td>
                    <span class="${stockQuantity < 10 ? 'text-danger fw-bold' : ''}">
                        ${stockQuantity} units
                    </span>
                </td>
                <td>${currency} ${Number(priceAmount).toFixed(2)}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="text-end px-4">
                    <button class="text-decoration-none btn btn-sm btn-link text-primary p-0 me-2">Edit</button>
                    <button class="text-decoration-none btn btn-sm btn-link text-danger p-0">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => fetchAndRenderProducts(currentPage));