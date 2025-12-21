export const checkBackendConnection = async (baseUrl) => {
  try {
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error connecting to backend:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to connect to backend',
      details: error
    };
  }
};

// Test specific endpoints
export const testEndpoints = async (baseUrl) => {
  const endpoints = [
    '/health',
    '/products',
    '/categories',
    '/cart',
    '/orders'
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      results.push({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    } catch (error) {
      results.push({
        endpoint,
        error: error.message,
        details: error
      });
    }
  }

  return results;
};
