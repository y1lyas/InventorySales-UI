const API_BASE_URL = 'https://localhost:7298/api';


async function fetchAndRenderProducts() {
    
    const tableView = document.getElementById('table-view');
    const emptyState = document.getElementById('empty-state');
    const tbody = document.getElementById('product-list-body');

    try {
        const response = await fetch(`${API_BASE_URL}/products/GetAll`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        console.log('API Response:', data);  // Debug log to see structure
        const products = data.products || data.data || (Array.isArray(data) ? data : []);

        if (!Array.isArray(products) || products.length === 0) {
            console.log('Showing empty state');
            showEmptyState(true);
        } else {
            console.log('Rendering products:', products.length);
            showEmptyState(false);
            renderTable(products, tbody);
        }

    } catch (error) {
        console.error('Dashboard Error:', error);
        showEmptyState(true);
    }
}


function showEmptyState(isEmpty) {
    const tableView = document.getElementById('table-view');
    const emptyState = document.getElementById('empty-state');

    if (isEmpty) {
        tableView.classList.add('d-none');
        emptyState.classList.remove('d-none');
    } else {
        tableView.classList.remove('d-none');
        emptyState.classList.add('d-none');
    }
}

function renderTable(products, container) {
    container.innerHTML = products.map(p => {
        const priceAmount = p.unitPrice ?? 0;
        const currency = p.currency ?? '$';
        const skuValue = p.skUnit ?? 'N/A';
        const dateRaw = p.createdAt || p.CreatedAt;
        const formattedDate = dateRaw 
            ? new Date(dateRaw).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : 'N/A';
        const stockQuantity = p.currentStock ?? 0; // Quantity de muhtemelen Value Object

        return `
            <tr>
                <td class="px-4">
                    <div class="fw-medium">${p.name}</div>
                    <div class="text-muted small">${skuValue}</div>
                </td>
                <td><span class="badge bg-light text-dark border">${p.categoryName || 'General'}</span></td>
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
document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);