const DATE_TIME_FORMAT_OPTIONS = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
};

export function getProductId(product) {
    return product?.id ?? product?.productId ?? '';
}

export function getProductName(product, fallback = 'Unnamed Product') {
    return product?.name || fallback;
}

export function getProductSku(product, fallback = 'N/A') {
    return product?.sku || product?.skUnit || fallback;
}

export function getProductCategoryName(product, fallback = 'General') {
    return product?.categoryName || product?.category?.name || fallback;
}

export function getProductOptionLabel(product) {
    return `${getProductName(product)} (${getProductSku(product)})`;
}

export function formatDateTime(value, fallback = 'N/A') {
    return value
        ? new Date(value).toLocaleDateString('tr-TR', DATE_TIME_FORMAT_OPTIONS)
        : fallback;
}
