// API Configuration
// Use the deployed Render backend
const API_BASE_URL = 'https://vape-pro-2.onrender.com';
// const API_BASE_URL = 'http://localhost:3000';

console.log(`[API] Using base URL: ${API_BASE_URL}`);

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        SIGNUP: `${API_BASE_URL}/api/signup`,
        LOGIN: `${API_BASE_URL}/api/login`,
        GOOGLE_LOGIN: `${API_BASE_URL}/api/google-login`,
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
        ADD: `${API_BASE_URL}/api/cart`, // POST /api/cart
        UPDATE: `${API_BASE_URL}/api/cart`, // PUT /api/cart
        REMOVE: `${API_BASE_URL}/api/cart/item`, // DELETE /api/cart/item
        CLEAR: `${API_BASE_URL}/api/cart`, // DELETE /api/cart
    },

    // Order endpoints
    ORDERS: {
        CREATE: `${API_BASE_URL}/api/orders/checkout`, // POST /api/orders/checkout
        GET_ALL: `${API_BASE_URL}/api/orders`, // GET /api/orders
        BY_ID: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
        UPDATE_PAYMENT: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/payment`,
        CANCEL: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/cancel`,
    },

    // User endpoints
    USER: {
        UserProfile: `${API_BASE_URL}/api/profile`,
        PROFILE: `${API_BASE_URL}/api/account`, // GET /api/account
        UPDATE_PROFILE: `${API_BASE_URL}/api/account`, // PUT /api/account
        VERIFY_EMAIL: `${API_BASE_URL}/api/request-email-otp`,
        VERIFY_OTP: `${API_BASE_URL}/api/verify-email-otp`,
    },

    // Client requirement endpoints
    CLIENT_REQUIREMENTS: {
        CREATE: `${API_BASE_URL}/api/admin/client-requirements`, // Or wherever users submit it
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
            let errorData = {};

            try {
                errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;

            // Attach extra data (like dev_otp) from backend response to the error object
            Object.assign(error, errorData);

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

        console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
        throw error;
    }
};

export default API_BASE_URL;
