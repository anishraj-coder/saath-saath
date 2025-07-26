'use client';

// Removed unused imports
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  // Removed automatic redirect to dashboard to prevent logout issues
  // Users can manually navigate to dashboard via the button

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="body-2 mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="heading-4 text-orange-600 mb-0">Saath-Saath</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="body-2 text-gray-700">Welcome back!</span>
                  <Link
                    href="/dashboard"
                    className="button-text bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="button-text text-gray-700 hover:text-orange-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="button-text bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="heading-1 text-gray-900">
            Welcome to <span className="text-orange-600">Saath-Saath</span>
          </h1>
          <p className="body-large text-gray-600 max-w-3xl mx-auto">
            A hyperlocal sourcing platform that transforms street food vendors into powerful 
            Group Purchasing Organizations. Save money, save time, grow together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="button-text bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="button-text bg-white text-orange-500 px-8 py-4 rounded-lg border-2 border-orange-500 hover:bg-orange-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="heading-5 text-gray-900">Group Buying</h3>
            <p className="body-2 text-gray-600">Join with nearby vendors to unlock bulk pricing and save money on raw materials.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="heading-5 text-gray-900">AI Forecasting</h3>
            <p className="body-2 text-gray-600">Smart recommendations based on weather, events, and your sales history.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="heading-5 text-gray-900">Micro-Credit</h3>
            <p className="body-2 text-gray-600">Source now, pay later. Access working capital without traditional banking.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="heading-5 text-gray-900">Fast Delivery</h3>
            <p className="body-2 text-gray-600">Optimized routes deliver your materials directly to your stall.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <div className="text-center mb-8">
            <h2 className="heading-2 text-gray-900">Empowering India&apos;s Street Food Economy</h2>
            <p className="body-1 text-gray-600 max-w-2xl mx-auto">
              Join thousands of vendors who are already saving money and time with Saath-Saath
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="heading-1 text-orange-600 mb-2">10M+</div>
              <div className="body-2 text-gray-600">Street Vendors in India</div>
            </div>
            <div className="text-center">
              <div className="heading-1 text-green-600 mb-2">₹80Cr</div>
              <div className="body-2 text-gray-600">Daily Turnover</div>
            </div>
            <div className="text-center">
              <div className="heading-1 text-blue-600 mb-2">15%</div>
              <div className="body-2 text-gray-600">Average Savings</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="heading-5 text-gray-900">Saath-Saath</h3>
            <p className="body-2 text-gray-600">Empowering street food vendors through collective buying power</p>
          </div>
        </div>
      </footer>
    </div>
  );
}