'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GroupBuyingEngine from '@/components/GroupBuyingEngine';
import VoiceInterface from '@/components/VoiceInterface';
import AIForecastingEngine from '@/components/AIForecastingEngine';
import SNPLCreditSystem from '@/components/SNPLCreditSystem';
import { FirestoreService, Order, Product, BuyingGroup } from '@/lib/firestore';
import { ProductCatalogService } from '@/lib/productCatalog';
import { Timestamp, GeoPoint } from 'firebase/firestore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, vendor, loading, logout } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSavings: 0,
    activeGroups: 0
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast' | 'credit' | 'voice'>('dashboard');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!vendor) return;

    try {
      // Initialize product catalog if empty
      const productList = await FirestoreService.getProducts();
      if (productList.length === 0) {
        console.log('Initializing product catalog...');
        await ProductCatalogService.initializeProductCatalog();
        const newProductList = await FirestoreService.getProducts();
        setProducts(newProductList);
      } else {
        setProducts(productList);
      }

      // Load vendor's recent orders
      const orders = await FirestoreService.getVendorOrders(vendor.id);
      setRecentOrders(orders.slice(0, 5));

      // Calculate stats
      const totalSavings = orders.reduce((sum, order) => {
        // Estimate savings based on group membership
        return sum + (order.groupId ? order.totalAmount * 0.15 : 0);
      }, 0);

      setStats({
        totalOrders: orders.length,
        totalSavings: Math.round(totalSavings),
        activeGroups: orders.filter(order => order.groupId && order.status !== 'delivered').length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [vendor]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (vendor) {
      loadDashboardData();
    }
  }, [loadDashboardData, vendor]);

  const createSampleOrder = async () => {
    if (!vendor || products.length === 0) return;

    try {
      // Ensure vendor has location (add if missing)
      let vendorWithLocation = vendor;
      if (!vendor.stallLocation) {
        // Set default location for demo user (Connaught Place center)
        const defaultLocation = new GeoPoint(28.6315, 77.2167);
        vendorWithLocation = { ...vendor, stallLocation: defaultLocation };
        
        // Update vendor in database
        await FirestoreService.updateVendor(vendor.id, { 
          stallLocation: defaultLocation,
          stallAddress: vendor.stallAddress || 'Connaught Place, Block M, New Delhi'
        });
      }

      // Create a realistic sample order with common products
      const sampleOrder: Order = {
        id: `sample_order_${Date.now()}`,
        vendorId: vendor.id,
        items: [
          {
            productId: 'onions',
            productName: 'Onions',
            quantity: 12,
            unitPrice: 30,
            totalPrice: 360
          },
          {
            productId: 'potatoes', 
            productName: 'Potatoes',
            quantity: 8,
            unitPrice: 25,
            totalPrice: 200
          },
          {
            productId: 'tomatoes',
            productName: 'Tomatoes', 
            quantity: 6,
            unitPrice: 40,
            totalPrice: 240
          }
        ],
        totalAmount: 800,
        paymentMethod: 'credit',
        status: 'pending',
        deliveryAddress: vendorWithLocation.stallAddress || 'Connaught Place, Block M, New Delhi',
        deliveryLocation: vendorWithLocation.stallLocation,
        createdAt: Timestamp.now()
      };

      console.log('Created sample order:', sampleOrder);
      setCurrentOrder(sampleOrder);
      
      // Show success message
      alert('Sample order created! Watch the Group Buying Engine find compatible orders and form a group.');
      
    } catch (error) {
      console.error('Error creating sample order:', error);
      alert('Error creating sample order. Please try again.');
    }
  };

  const handleGroupFormed = (group: BuyingGroup) => {
    console.log('Group formed:', group);
    // Show success notification
    alert(`Great! Group formed with ${group.memberIds.length} vendors. You'll save ₹${group.totalSavings}!`);
    
    // Refresh dashboard data
    loadDashboardData();
  };

  const handleVoiceCommand = (command: string, data?: unknown) => {
    console.log('Voice command received:', command, data);
    
    switch (command) {
      case 'dashboard':
        setActiveTab('dashboard');
        break;
      case 'forecast':
        setActiveTab('forecast');
        break;
      case 'credit':
        setActiveTab('credit');
        break;
      case 'create_order':
        createSampleOrder();
        break;
      case 'products':
        // Show products in current view
        break;
      case 'help':
        alert('Available commands: Dashboard, Forecast, Credit, Create Order, Products');
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="body-2 mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !vendor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="heading-4 text-orange-600 mb-0">Saath-Saath</h1>
              <span className="body-2 text-gray-500 ml-4">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="body-2 text-gray-700">Welcome, {vendor.name}</span>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`button-text px-3 py-2 rounded ${voiceEnabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {voiceEnabled ? '🔇 Voice Off' : '🎤 Voice On'}
              </button>
              <button
                onClick={() => router.push('/test-group-buying')}
                className="button-text bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                Test Engine
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Logging out...');
                    await logout();
                    console.log('Logout successful, redirecting...');
                    router.push('/');
                  } catch (error) {
                    console.error('Logout failed:', error);
                    // Force redirect even if logout fails
                    router.push('/');
                  }
                }}
                className="button-text text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Interface */}
        <VoiceInterface 
          onCommand={handleVoiceCommand}
          isActive={voiceEnabled}
          language="hi-IN"
        />

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
              { id: 'forecast', label: '🤖 AI Forecast', icon: '🤖' },
              { id: 'credit', label: '💳 SNPL Credit', icon: '💳' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'forecast' | 'credit')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="caption text-gray-500 uppercase">Total Orders</p>
                <p className="heading-4 text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="caption text-gray-500 uppercase">Total Savings</p>
                <p className="heading-4 text-green-900">₹{stats.totalSavings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="caption text-gray-500 uppercase">Active Groups</p>
                <p className="heading-4 text-orange-900">{stats.activeGroups}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Buying Engine */}
        <div className="mb-8">
          <GroupBuyingEngine 
            currentOrder={currentOrder}
            onGroupFormed={handleGroupFormed}
          />
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="heading-5 text-gray-900 mb-4">Try Group Buying</h3>
          <p className="body-2 text-gray-600 mb-4">
            Create a sample order to see how the group buying engine works. 
            It will automatically find nearby vendors with similar orders and form a group to unlock bulk discounts.
          </p>
          <button
            onClick={createSampleOrder}
            disabled={products.length === 0}
            className="button-text bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {products.length === 0 ? 'Loading Products...' : 'Create Sample Order'}
          </button>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="heading-5 text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="body-2 font-medium text-gray-900">
                        Order #{order.id.slice(-8)} • ₹{order.totalAmount}
                      </p>
                      <p className="caption text-gray-500">
                        {order.items.length} items • {order.status}
                        {order.groupId && ' • Group Order'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="caption text-gray-500">
                        {order.createdAt.toDate().toLocaleDateString()}
                      </p>
                      {order.groupId && (
                        <p className="caption text-green-600">
                          ₹{Math.round(order.totalAmount * 0.15)} saved
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}

        {/* AI Forecasting Tab */}
        {activeTab === 'forecast' && (
          <AIForecastingEngine />
        )}

        {/* SNPL Credit Tab */}
        {activeTab === 'credit' && (
          <SNPLCreditSystem />
        )}
      </main>
    </div>
  );
}