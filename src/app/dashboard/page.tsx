'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GroupBuyingEngine from '@/components/GroupBuyingEngine';
import { FirestoreService, Order, Product, BuyingGroup } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (vendor) {
      loadDashboardData();
    }
  }, [vendor]);

  const loadDashboardData = async () => {
    if (!vendor) return;

    try {
      // Load products
      const productList = await FirestoreService.getProducts();
      setProducts(productList);

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
  };

  const createSampleOrder = () => {
    if (!vendor || products.length === 0) return;

    // Create a sample order for demonstration
    const sampleOrder: Order = {
      id: `order_${Date.now()}`,
      vendorId: vendor.id,
      items: [
        {
          productId: products[0].id,
          productName: products[0].name,
          quantity: 10,
          unitPrice: products[0].basePrice,
          totalPrice: products[0].basePrice * 10
        },
        {
          productId: products[1]?.id || products[0].id,
          productName: products[1]?.name || products[0].name,
          quantity: 5,
          unitPrice: products[1]?.basePrice || products[0].basePrice,
          totalPrice: (products[1]?.basePrice || products[0].basePrice) * 5
        }
      ],
      totalAmount: 0,
      paymentMethod: 'credit',
      status: 'pending',
      deliveryAddress: vendor.stallAddress || 'Demo Stall Location',
      deliveryLocation: vendor.stallLocation,
      createdAt: Timestamp.now()
    };

    sampleOrder.totalAmount = sampleOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
    setCurrentOrder(sampleOrder);
  };

  const handleGroupFormed = (group: BuyingGroup) => {
    console.log('Group formed:', group);
    // Show success notification
    alert(`Great! Group formed with ${group.memberIds.length} vendors. You'll save ₹${group.totalSavings}!`);
    
    // Refresh dashboard data
    loadDashboardData();
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
      </main>
    </div>
  );
}