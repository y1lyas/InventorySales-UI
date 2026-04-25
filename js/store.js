// store.js - Central State Management
// This is the single source of truth for application state

// Initial state
const initialState = {
  products: [],
  categories: [],
  removedProducts: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  searchTerm: '',
  isDeletedFilter: false
};

// Create reactive state using Proxy
export const store = {
  state: new Proxy(initialState, {
    set(target, property, value) {
      target[property] = value;
      // Notify subscribers of state change
      store.notify(property, value);
      return true;
    }
  }),
  
  // Subscribers for state changes
  subscribers: {},
  
  // Subscribe to state changes
  subscribe(property, callback) {
    if (!this.subscribers[property]) {
      this.subscribers[property] = [];
    }
    this.subscribers[property].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers[property] = this.subscribers[property].filter(cb => cb !== callback);
    };
  },
  
  // Notify subscribers
  notify(property, value) {
    if (this.subscribers[property]) {
      this.subscribers[property].forEach(callback => callback(value));
    }
    // Also notify 'all' subscribers
    if (this.subscribers['*']) {
      this.subscribers['*'].forEach(callback => callback(property, value));
    }
  },
  
  // Get current state
  getState() {
    return this.state;
  },
  
  // Update state
  setState(updates) {
    Object.keys(updates).forEach(key => {
      this.state[key] = updates[key];
    });
  },
  
  // Reset to initial state
  reset() {
    Object.keys(initialState).forEach(key => {
      this.state[key] = initialState[key];
    });
  }
};

// Export state for backward compatibility
export const state = store.state;

// Export store methods
export default store;