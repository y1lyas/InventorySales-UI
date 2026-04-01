
async function loadCategories() {
    const categorySelect = document.getElementById('pCategory');
    try {
        const response = await fetch(`${API_BASE_URL}/categories/GetAll`);
        const categories = await response.json();

        categorySelect.innerHTML = '<option value="">None (Optional)</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            const categoryIdValue = cat.id ?? cat.categoryId ?? cat._id ?? '';
            option.value = categoryIdValue;
            option.textContent = cat.name ?? 'Unknown category';
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Categories couldn't be loaded:", error);
    }
}

function showAddProductModal() {
    loadCategories();
    const myModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    myModal.show();
}

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawPrice = document.getElementById('pPrice').value.trim().replace(',', '.');
    const price = parseFloat(rawPrice);

    if (Number.isNaN(price) || price <= 0) {
        alert('Please enter a product price greater than 0.');
        return;
    }

    const categorySelect = document.getElementById('pCategory');
    const selectedCategoryValue = categorySelect.value?.trim();
    const categoryId = selectedCategoryValue && selectedCategoryValue !== 'undefined' && selectedCategoryValue !== 'null'
        ? (Number.isNaN(Number(selectedCategoryValue)) ? selectedCategoryValue : Number(selectedCategoryValue))
        : null;

    const productData = {
        name: document.getElementById('pName').value,
        categoryId,
        sku: document.getElementById('pSku').value,
        unitPrice: price,
        price,
        currency: "TL"
    };

    console.log('Sending product data:', productData);

    try {
        const response = await fetch(`${API_BASE_URL}/products/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            const modalElement = document.getElementById('addProductModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            document.getElementById('addProductForm').reset(); 
            await fetchAndRenderProducts(); 
            
            alert('Product added successfully!');
        } else {
            const errorText = await response.text();
            alert('Error: ' + errorText);
        }
    } catch (error) {
        console.error('Create Error:', error);
        alert('An unexpected error occurred.');
    }
});