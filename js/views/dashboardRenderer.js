import DashboardView from "./dashboardView.js";

// Lazy initialization - view created when first render called
let view = null;

function getView() {
    if (!view) {
        view = new DashboardView();
    }
    return view;
}

export function renderDashboard(state) {
  const v = getView();
  
  if (state.isLoading) {
    v.renderLoading();
    return;
  }

  if (state.error) {
    v.renderError(state.error);
    return;
  }

  if (!state.products || state.products.length === 0) {
    v.renderEmpty();
    return;
  }

  v.renderTable(state.products);
}