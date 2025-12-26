// API Configuration
const API_BASE_URL = 'https://vape-pro-2.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        SIGNUP: `${API_BASE_URL}/api/signup`,
        LOGIN: `${API_BASE_URL}/api/login`,
        VERIFY_OTP: `${API_BASE_URL}/api/verify-otp`,
        RESEND_OTP: `${API_BASE_URL}/api/resend-otp`,
    },

    // Admin endpoints
    ADMIN: {
        SIGNUP: `${API_BASE_URL}/api/admin/signup`,
        LOGIN: `${API_BASE_URL}/api/admin/login`,
        STATS: `${API_BASE_URL}/api/admin/stats`,
        USERS: `${API_BASE_URL}/api/admin/users`,
        ORDERS: `${API_BASE_URL}/api/admin/orders`,
        CLIENT_REQUIREMENTS: `${API_BASE_URL}/api/admin/client-requirements`,
        UPDATE_ORDER: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}`,
    },

    // Product endpoints
    PRODUCTS: {
        ALL: `${API_BASE_URL}/api/products`,
        BY_ID: (productId) => `${API_BASE_URL}/api/products/${productId}`,
    },

    // Cart endpoints
    CART: {
        GET: `${API_BASE_URL}/api/cart`,
        ADD: `${API_BASE_URL}/api/cart/add`,
        UPDATE: `${API_BASE_URL}/api/cart/update`,
        REMOVE: `${API_BASE_URL}/api/cart/remove`,
        CLEAR: `${API_BASE_URL}/api/cart/clear`,
    },

    // Order endpoints
    ORDERS: {
        CREATE: `${API_BASE_URL}/api/orders`,
        GET_ALL: `${API_BASE_URL}/api/orders`,
        BY_ID: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
        UPDATE_PAYMENT: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/payment`,
        CANCEL: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/cancel`,
    },

    // User endpoints
    USER: {
        PROFILE: `${API_BASE_URL}/api/user/profile`,
        UPDATE_PROFILE: `${API_BASE_URL}/api/user/profile`,
        VERIFY_EMAIL: `${API_BASE_URL}/api/user/verify-email`,
    },

    // Client requirement endpoints
    CLIENT_REQUIREMENTS: {
        CREATE: `${API_BASE_URL}/api/client-requirements`,
    },
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
});

// Helper function for API calls with enhanced error handling
export const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;
            throw error;
        }

        return await response.json();
    } catch (error) {
        // Enhanced error for network failures
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
            networkError.originalError = error;
            throw networkError;
        }

        console.error('API Error:', error);
        throw error;
    }
};


export default API_BASE_URL;
