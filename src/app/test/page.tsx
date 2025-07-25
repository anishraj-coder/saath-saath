'use client';

import { useState } from 'react';

export default function TestPage() {
  const [dbStatus, setDbStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/db');
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus(`✅ Database connected! Vendor count: ${data.vendorCount}`);
      } else {
        setDbStatus(`❌ Database error: ${data.message} - ${data.error}`);
      }
    } catch (error) {
      setDbStatus(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: '9876543210' }),
      });
      
      const data = await response.json();
      console.log('Login test result:', data);
      alert(`Login API test: ${response.ok ? 'Success' : 'Error'} - ${data.message || data.error}`);
    } catch (error) {
      console.error('Login test error:', error);
      alert(`Login test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Saath-Saath Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          <p className="text-gray-600 mb-4">Status: {dbStatus}</p>
          <button
            onClick={testDatabase}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button
            onClick={testLogin}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-4"
          >
            Test Login API
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>1. Database Setup:</strong></p>
            <p>• Update DATABASE_URL in .env file</p>
            <p>• Run: <code className="bg-gray-100 px-2 py-1 rounded">npx prisma db push</code></p>
            
            <p className="pt-4"><strong>2. Test the app:</strong></p>
            <p>• Click "Test Database" above</p>
            <p>• If successful, go to <a href="/" className="text-blue-500 hover:underline">Home Page</a></p>
            <p>• Try <a href="/register" className="text-blue-500 hover:underline">Registration</a> or <a href="/login" className="text-blue-500 hover:underline">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}