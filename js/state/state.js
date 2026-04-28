export const state = {
    products: [],
    deletedProducts: [],
    categories: [],
    loaded: {
        products: false,
        deletedProducts: false,
        categories: false
    },
    ui: {
        pageSize: 10,
        dashboardPage: 1,
        trashPage: 1,
        searchTerm: '',
        trashSearchTerm: '',
        categoryId: '',
        isLoadingProducts: false,
        isLoadingDeletedProducts: false
    }
};
