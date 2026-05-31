export const state = {
    products: [],
    deletedProducts: [],
    categories: [],
    loaded: {
        products: false,
        deletedProducts: false,
        categories: false,
        movementProducts: false,
        sales: false
    },
    sales: [],
    salesPagination: {
        currentPage: 1,
        totalPages: 1
    },
    movement: {
        products: [],
        productFilterId: '',
        movementTypeFilter: '',
        movementReasonFilter: '',
        movementStartDate: '',
        movementEndDate: '',
        movementMinQuantity: '',
        movementMaxQuantity: '',
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
        productMinStock: '',
        productMaxStock: '',
        productMinPrice: '',
        productMaxPrice: '',
        productStartDate: '',
        productEndDate: '',
        trashPage: 1,
        categoriesPage: 1,
        categoriesPageSize: 6,
        salesPage: 1,
        salesPageSize: 12,
        salesStartDate: '',
        salesEndDate: '',
        salesMinAmount: '',
        salesMaxAmount: '',
        salesSaleId: '',
        saleCreatePage: 1,
        saleCreateSearchTerm: '',
        productSearchTerm: '',
        trashSearchTerm: '',
        productCategoryId: '',
        isLoadingProducts: false,
        isLoadingDeletedProducts: false,
        isLoadingSales: false
    }
};
