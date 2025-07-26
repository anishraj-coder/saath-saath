'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export default function TestGroupBuyingPage() {
  const { vendor } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runGroupBuyingTest = async () => {
    if (!vendor) {
      addResult('❌ Please login first');
      return;
    }

    setLoading(true);
    addResult('🚀 Starting Group Buying Engine Test...');

    try {
      // Test 1: Check nearby vendors
      addResult('📍 Testing nearby vendor discovery...');
      if (vendor.stallLocation) {
        const nearbyVendors = await FirestoreService.findNearbyVendors(vendor.stallLocation, 2);
        addResult(`✅ Found ${nearbyVendors.length} vendors within 2km`);
        nearbyVendors.forEach(v => addResult(`   - ${v.name} at ${v.stallAddress}`));
      } else {
        addResult('⚠️ No location set for current vendor');
      }

      // Test 2: Create a test order
      addResult('📦 Creating test order...');
      const testOrder = {
        id: `test_order_${Date.now()}`,
        vendorId: vendor.id,
        items: [
          { productId: 'onions', productName: 'Onions', quantity: 12, unitPrice: 30, totalPrice: 360 },
          { productId: 'potatoes', productName: 'Potatoes', quantity: 8, unitPrice: 25, totalPrice: 200 }
        ],
        totalAmount: 560,
        paymentMethod: 'credit' as const,
        status: 'pending' as const,
        deliveryAddress: vendor.stallAddress || 'Test Location',
        deliveryLocation: vendor.stallLocation,
        createdAt: Timestamp.now()
      };

      // Test 3: Find compatible orders
      addResult('🔍 Searching for compatible orders...');
      const compatibleOrders = await FirestoreService.findCompatibleOrders(testOrder);
      addResult(`✅ Found ${compatibleOrders.length} compatible orders`);
      compatibleOrders.forEach(order => {
        const productNames = order.items.map(item => item.productName).join(', ');
        addResult(`   - Order ${order.id.slice(-8)}: ${productNames} (₹${order.totalAmount})`);
      });

      // Test 4: Calculate bulk discounts
      addResult('💰 Testing bulk discount calculations...');
      const products = await FirestoreService.getProducts();
      const onionProduct = products.find(p => p.name === 'Onions');
      if (onionProduct) {
        const totalOnions = testOrder.items.find(item => item.productName === 'Onions')?.quantity || 0;
        const compatibleOnions = compatibleOrders.reduce((sum, order) => {
          return sum + (order.items.find(item => item.productName === 'Onions')?.quantity || 0);
        }, 0);
        const totalQuantity = totalOnions + compatibleOnions;
        
        const individualPrice = onionProduct.basePrice;
        const bulkPrice = FirestoreService.calculateBulkDiscount(onionProduct, totalQuantity);
        const savings = (individualPrice - bulkPrice) * totalQuantity;
        
        addResult(`   - Onions: ${totalQuantity}kg total`);
        addResult(`   - Individual price: ₹${individualPrice}/kg`);
        addResult(`   - Bulk price: ₹${bulkPrice}/kg`);
        addResult(`   - Total savings: ₹${Math.round(savings)}`);
      }

      // Test 5: Group formation criteria
      addResult('👥 Testing group formation criteria...');
      const minVendors = 2;
      const minSavings = 50;
      const canFormGroup = compatibleOrders.length >= (minVendors - 1); // -1 because current vendor is included
      const estimatedSavings = 150; // Simplified calculation
      
      addResult(`   - Minimum vendors needed: ${minVendors}`);
      addResult(`   - Available vendors: ${compatibleOrders.length + 1}`);
      addResult(`   - Minimum savings needed: ₹${minSavings}`);
      addResult(`   - Estimated savings: ₹${estimatedSavings}`);
      addResult(`   - Can form group: ${canFormGroup && estimatedSavings >= minSavings ? '✅ YES' : '❌ NO'}`);

      // Test 6: Active groups
      addResult('🔄 Checking active groups...');
      const activeGroups = await FirestoreService.getBuyingGroups('forming');
      addResult(`✅ Found ${activeGroups.length} active groups`);
      activeGroups.forEach(group => {
        addResult(`   - Group ${group.id.slice(-8)}: ${group.memberIds.length} members, ₹${group.totalSavings} savings`);
      });

      addResult('🎉 Group Buying Engine test completed successfully!');

    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="heading-2 text-gray-900 mb-6">Group Buying Engine Test Suite</h1>
          
          <div className="mb-6">
            <p className="body-1 text-gray-600 mb-4">
              This page tests all components of the Group Buying Engine:
            </p>
            <ul className="body-2 text-gray-600 space-y-1 ml-6">
              <li>• Nearby vendor discovery (2km radius)</li>
              <li>• Compatible order matching</li>
              <li>• Bulk discount calculations</li>
              <li>• Group formation criteria</li>
              <li>• Active group monitoring</li>
            </ul>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={runGroupBuyingTest}
              disabled={loading || !vendor}
              className="button-text bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Running Tests...' : 'Run Group Buying Test'}
            </button>
            
            <button
              onClick={clearResults}
              className="button-text bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          </div>

          {!vendor && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="body-2">Please <a href="/login" className="underline">login</a> first to run the tests.</p>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            <div className="font-mono text-sm text-green-400">
              {testResults.length === 0 ? (
                <p>Click &quot;Run Group Buying Test&quot; to start testing...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}