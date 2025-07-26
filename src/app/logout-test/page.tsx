'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutTestPage() {
  const { user, vendor, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Before logout - User:', user?.email, 'Vendor:', vendor?.name);
      await logout();
      console.log('After logout - should be null');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="heading-3 text-gray-900 mb-6">Logout Test</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="body-2 text-gray-600">User Status:</p>
            <p className="body-1 text-gray-900">{user ? `Logged in as ${user.email}` : 'Not logged in'}</p>
          </div>
          
          <div>
            <p className="body-2 text-gray-600">Vendor Status:</p>
            <p className="body-1 text-gray-900">{vendor ? `Vendor: ${vendor.name}` : 'No vendor data'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={!user}
            className="button-text w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Test Logout
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="button-text w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go to Home
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="button-text w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="caption text-gray-600">
            Check browser console for logout debugging info
          </p>
        </div>
      </div>
    </div>
  );
}