// Example usage of ErrorPopup component in your App.jsx or any component

import React, { useState } from 'react';
import ErrorPopup from './components/ErrorPopup';
import { apiCall, API_ENDPOINTS } from './config';

function ExampleComponent() {
    const [error, setError] = useState(null);

    // Example: Making an API call with error handling
    const handleLogin = async (credentials) => {
        try {
            const data = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify(credentials),
            });

            console.log('Login successful:', data);
            // Handle success...
        } catch (err) {
            // Show error popup
            setError(err);
        }
    };

    // Example: Handling email verification
    const handleVerifyEmail = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.USER.VERIFY_EMAIL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to send verification email');
            }

            const data = await response.json();
            console.log('Verification email sent:', data);
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div>
            {/* Your component content */}
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleVerifyEmail}>Verify Email</button>

            {/* Error Popup - Add this at the root level of your component */}
            <ErrorPopup
                error={error}
                onClose={() => setError(null)}
                duration={5000} // Auto-dismiss after 5 seconds
            />
        </div>
    );
}

// ============================================
// RECOMMENDED: Add to your App.jsx root level
// ============================================

/*
In your App.jsx, add this at the top level:

import ErrorPopup from './components/ErrorPopup';

function App() {
  const [globalError, setGlobalError] = useState(null);

  // You can also create a global error handler
  useEffect(() => {
    const handleGlobalError = (event) => {
      setGlobalError(event.error || event.reason);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  return (
    <div className="App">
      {/* Your app content *\/}
      
      {/* Global Error Popup *\/}
      <ErrorPopup 
        error={globalError} 
        onClose={() => setGlobalError(null)}
        duration={6000}
      />
    </div>
  );
}
*/

export default ExampleComponent;
