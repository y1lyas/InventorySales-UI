export const state = {
    products: [],
    deletedProducts: [],
    categories: [],
    loaded: {
        products: false,
        deletedProducts: false,
        categories: false,
        dashboardProducts: false
    },
    dashboard: {
        products: [],
        productFilterId: '',
        movementTypeFilter: '',
        movementSearchTerm: '',
        stockMovements: [],
        movementsPage: 1,
        movementsPageSize: 12,
        movementsPagination: {
            currentPage: 1,
            totalPages: 1
        }
    },
    ui: {
        pageSize: 12,
        productsPage: 1,
        trashPage: 1,
        productSearchTerm: '',
        trashSearchTerm: '',
        productCategoryId: '',
        isLoadingProducts: false,
        isLoadingDeletedProducts: false
    }
};
