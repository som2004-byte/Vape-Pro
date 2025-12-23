import React, { useState } from 'react';
import { checkBackendConnection, testEndpoints } from '../utils/api';

const BackendTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Click the button to test connection');
  const [endpointResults, setEndpointResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api');

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('Testing connection...');
    setEndpointResults([]);

    try {
      // Test basic connection
      const connection = await checkBackendConnection(apiUrl);

      if (connection.success) {
        setConnectionStatus('✅ Connected to backend');

        // Test individual endpoints
        const results = await testEndpoints(apiUrl);
        setEndpointResults(results);
      } else {
        setConnectionStatus(`❌ ${connection.error}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Error: ${error.message}`);
      console.error('Connection test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusEmoji = (ok) => (ok ? '✅' : '❌');

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>

      <div className="mb-4">
        <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Backend API URL:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="apiUrl"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder="http://localhost:3000/api"
          />
          <button
            onClick={testConnection}
            disabled={isTesting}
            className={`px-4 py-2 rounded-md text-white ${isTesting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Connection Status:</h3>
        <p className={connectionStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {connectionStatus}
        </p>
      </div>

      {!isTesting && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Endpoint Tests:</h3>
          <div className="space-y-2">
            {endpointResults.map((result, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
                <span className="mr-3">
                  {result.ok ? '✅' : '❌'}
                </span>
                <div>
                  <p className="font-mono">GET {result.endpoint}</p>
                  <p className="text-sm text-gray-600">
                    Status: {result.status} {result.statusText || ''}
                    {result.error && ` | Error: ${result.error}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Make sure the backend server is running on port 3000</li>
          <li>Check for CORS errors in the browser console</li>
          <li>Verify the backend URL in <code>src/utils/api.js</code></li>
          <li>Check if any firewall is blocking the connection</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendTest;
