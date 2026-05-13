export function extractCollection(data, keys = []) {
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    for (const key of ['data', 'items', 'result']) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
}

export function extractPagination(data, currentCount, currentPage, fallbackPageSize) {
    const explicitTotalPages = typeof data?.totalPages === 'number'
        ? data.totalPages
        : typeof data?.pageCount === 'number'
            ? data.pageCount
            : null;
    const totalItems = typeof data?.totalCount === 'number'
        ? data.totalCount
        : typeof data?.totalItems === 'number'
            ? data.totalItems
            : typeof data?.total === 'number'
                ? data.total
                : null;
    const pageSize = parseInt(data?.pageSize ?? data?.size ?? fallbackPageSize, 10) || fallbackPageSize;
    const totalPages = explicitTotalPages !== null
        ? Math.max(1, explicitTotalPages)
        : totalItems !== null
            ? Math.max(1, Math.ceil(totalItems / pageSize))
            : Math.max(1, Math.ceil(currentCount / pageSize));

    return {
        currentPage: parseInt(data?.pageNumber ?? data?.currentPage ?? data?.page ?? currentPage, 10) || currentPage,
        totalPages: totalPages
    };
}
