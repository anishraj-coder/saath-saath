'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { FirestoreService } from '@/lib/firestore';

export default function SetupFirebasePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createSampleData = async () => {
    setLoading(true);
    setMessage('Setting up Firebase data...');

    try {
      // 1. Create sample suppliers
      const suppliers = [
        {
          name: 'Fresh Vegetables Wholesale',
          contactPhone: '9876543210',
          address: 'Azadpur Mandi, Delhi',
          location: new GeoPoint(28.7041, 77.1025),
          rating: 4.5,
          isActive: true,
          createdAt: Timestamp.now()
        },
        {
          name: 'Spice Kingdom',
          contactPhone: '9876543211',
          address: 'Khari Baoli, Delhi',
          location: new GeoPoint(28.6562, 77.2410),
          rating: 4.2,
          isActive: true,
          createdAt: Timestamp.now()
        },
        {
          name: 'Delhi Wholesale Market',
          contactPhone: '9876543212',
          address: 'INA Market, Delhi',
          location: new GeoPoint(28.5706, 77.2094),
          rating: 4.3,
          isActive: true,
          createdAt: Timestamp.now()
        }
      ];

      const supplierIds = [];
      for (const supplier of suppliers) {
        const docRef = await addDoc(collection(db, 'suppliers'), supplier);
        supplierIds.push(docRef.id);
        setMessage(`Created supplier: ${supplier.name}`);
      }

      // 2. Create sample products
      const products = [
        {
          name: 'Onions',
          category: 'vegetables',
          unit: 'kg',
          basePrice: 30,
          currentStock: 1000,
          supplierId: supplierIds[0],
          bulkPricing: [
            { minQuantity: 10, pricePerUnit: 28, discountPercentage: 6.7 },
            { minQuantity: 50, pricePerUnit: 25, discountPercentage: 16.7 },
            { minQuantity: 100, pricePerUnit: 22, discountPercentage: 26.7 }
          ],
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          name: 'Potatoes',
          category: 'vegetables',
          unit: 'kg',
          basePrice: 25,
          currentStock: 800,
          supplierId: supplierIds[0],
          bulkPricing: [
            { minQuantity: 10, pricePerUnit: 23, discountPercentage: 8 },
            { minQuantity: 50, pricePerUnit: 20, discountPercentage: 20 },
            { minQuantity: 100, pricePerUnit: 18, discountPercentage: 28 }
          ],
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          name: 'Tomatoes',
          category: 'vegetables',
          unit: 'kg',
          basePrice: 40,
          currentStock: 500,
          supplierId: supplierIds[0],
          bulkPricing: [
            { minQuantity: 10, pricePerUnit: 38, discountPercentage: 5 },
            { minQuantity: 50, pricePerUnit: 35, discountPercentage: 12.5 },
            { minQuantity: 100, pricePerUnit: 32, discountPercentage: 20 }
          ],
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          name: 'Cooking Oil',
          category: 'oil',
          unit: 'litre',
          basePrice: 120,
          currentStock: 200,
          supplierId: supplierIds[1],
          bulkPricing: [
            { minQuantity: 5, pricePerUnit: 115, discountPercentage: 4.2 },
            { minQuantity: 20, pricePerUnit: 110, discountPercentage: 8.3 },
            { minQuantity: 50, pricePerUnit: 105, discountPercentage: 12.5 }
          ],
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          name: 'Wheat Flour',
          category: 'flour',
          unit: 'kg',
          basePrice: 35,
          currentStock: 300,
          supplierId: supplierIds[1],
          bulkPricing: [
            { minQuantity: 10, pricePerUnit: 33, discountPercentage: 5.7 },
            { minQuantity: 50, pricePerUnit: 30, discountPercentage: 14.3 },
            { minQuantity: 100, pricePerUnit: 28, discountPercentage: 20 }
          ],
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      for (const product of products) {
        await addDoc(collection(db, 'products'), product);
        setMessage(`Created product: ${product.name}`);
      }

      // 3. Create demo user
      try {
        const { user } = await createUserWithEmailAndPassword(auth, 'demo@saathsaath.com', 'demo123');
        await updateProfile(user, { displayName: 'Demo Vendor' });
        
        // Create vendor profile with proper location
        const vendorData = {
          id: user.uid,
          name: 'Demo Vendor',
          email: 'demo@saathsaath.com',
          phone: '9876543210',
          stallAddress: 'Connaught Place, Block M, New Delhi',
          stallLocation: new GeoPoint(28.6315, 77.2167), // Central CP location
          verificationStatus: 'verified' as const,
          creditLimit: 10000,
          totalSavings: 2500,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await addDoc(collection(db, 'vendors'), vendorData);
        setMessage('✅ Demo user created: demo@saathsaath.com / demo123');
        
        // Create additional demo vendors for group buying testing
        const demoVendors = [
          {
            id: 'vendor_cp_1',
            name: 'Raj Chaat Corner',
            email: 'raj@chaatcorner.com',
            phone: '9876543201',
            stallAddress: 'Connaught Place, Block A, New Delhi',
            stallLocation: new GeoPoint(28.6318, 77.2165), // 30m from demo user
            verificationStatus: 'verified',
            creditLimit: 8000,
            totalSavings: 1200,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          },
          {
            id: 'vendor_cp_2', 
            name: 'Sharma Samosa Stall',
            email: 'sharma@samosa.com',
            phone: '9876543202',
            stallAddress: 'Connaught Place, Block B, New Delhi',
            stallLocation: new GeoPoint(28.6312, 77.2169), // 50m from demo user
            verificationStatus: 'verified',
            creditLimit: 6000,
            totalSavings: 800,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          },
          {
            id: 'vendor_cp_3',
            name: 'Delhi Dosa Point',
            email: 'dosa@delhi.com', 
            phone: '9876543203',
            stallAddress: 'Connaught Place, Block C, New Delhi',
            stallLocation: new GeoPoint(28.6310, 77.2160), // 100m from demo user
            verificationStatus: 'verified',
            creditLimit: 7000,
            totalSavings: 950,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          },
          {
            id: 'vendor_cp_4',
            name: 'CP Snacks Corner',
            email: 'snacks@cp.com',
            phone: '9876543204', 
            stallAddress: 'Connaught Place, Block D, New Delhi',
            stallLocation: new GeoPoint(28.6308, 77.2172), // 80m from demo user
            verificationStatus: 'verified',
            creditLimit: 7500,
            totalSavings: 1100,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          },
          {
            id: 'vendor_far',
            name: 'Gurgaon Food Cart',
            email: 'gurgaon@food.com',
            phone: '9876543205', 
            stallAddress: 'Cyber City, Gurgaon',
            stallLocation: new GeoPoint(28.4595, 77.0266), // Far from demo user (>20km)
            verificationStatus: 'verified',
            creditLimit: 5000,
            totalSavings: 600,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          }
        ];

        for (const vendor of demoVendors) {
          await addDoc(collection(db, 'vendors'), vendor);
          setMessage(`Created demo vendor: ${vendor.name}`);
        }

        // Create more recent pending orders for group formation testing
        const now = new Date();
        const pendingOrders = [
          {
            id: 'order_raj_1',
            vendorId: 'vendor_cp_1',
            items: [
              { productId: 'onions', productName: 'Onions', quantity: 15, unitPrice: 30, totalPrice: 450 },
              { productId: 'potatoes', productName: 'Potatoes', quantity: 10, unitPrice: 25, totalPrice: 250 }
            ],
            totalAmount: 700,
            paymentMethod: 'credit',
            status: 'pending',
            deliveryAddress: 'Connaught Place, Block A, New Delhi',
            deliveryLocation: new GeoPoint(28.6318, 77.2165), // 30m from demo user
            createdAt: Timestamp.fromDate(new Date(now.getTime() - 30 * 60 * 1000)) // 30 min ago
          },
          {
            id: 'order_sharma_1',
            vendorId: 'vendor_cp_2',
            items: [
              { productId: 'onions', productName: 'Onions', quantity: 20, unitPrice: 30, totalPrice: 600 },
              { productId: 'oil', productName: 'Cooking Oil', quantity: 3, unitPrice: 120, totalPrice: 360 }
            ],
            totalAmount: 960,
            paymentMethod: 'snpl',
            status: 'pending',
            deliveryAddress: 'Connaught Place, Block B, New Delhi',
            deliveryLocation: new GeoPoint(28.6312, 77.2169), // 50m from demo user
            createdAt: Timestamp.fromDate(new Date(now.getTime() - 45 * 60 * 1000)) // 45 min ago
          },
          {
            id: 'order_dosa_1',
            vendorId: 'vendor_cp_3',
            items: [
              { productId: 'potatoes', productName: 'Potatoes', quantity: 25, unitPrice: 25, totalPrice: 625 },
              { productId: 'flour', productName: 'Wheat Flour', quantity: 8, unitPrice: 35, totalPrice: 280 }
            ],
            totalAmount: 905,
            paymentMethod: 'credit',
            status: 'pending',
            deliveryAddress: 'Connaught Place, Block C, New Delhi',
            deliveryLocation: new GeoPoint(28.6320, 77.2163), // 70m from demo user
            createdAt: Timestamp.fromDate(new Date(now.getTime() - 60 * 60 * 1000)) // 1 hour ago
          },
          {
            id: 'order_extra_1',
            vendorId: 'vendor_cp_1',
            items: [
              { productId: 'tomatoes', productName: 'Tomatoes', quantity: 12, unitPrice: 40, totalPrice: 480 },
              { productId: 'onions', productName: 'Onions', quantity: 8, unitPrice: 30, totalPrice: 240 }
            ],
            totalAmount: 720,
            paymentMethod: 'credit',
            status: 'pending',
            deliveryAddress: 'Connaught Place, Block A, New Delhi',
            deliveryLocation: new GeoPoint(28.6318, 77.2165),
            createdAt: Timestamp.fromDate(new Date(now.getTime() - 20 * 60 * 1000)) // 20 min ago
          },
          {
            id: 'order_extra_2',
            vendorId: 'vendor_cp_2',
            items: [
              { productId: 'potatoes', productName: 'Potatoes', quantity: 18, unitPrice: 25, totalPrice: 450 },
              { productId: 'tomatoes', productName: 'Tomatoes', quantity: 15, unitPrice: 40, totalPrice: 600 }
            ],
            totalAmount: 1050,
            paymentMethod: 'snpl',
            status: 'pending',
            deliveryAddress: 'Connaught Place, Block B, New Delhi',
            deliveryLocation: new GeoPoint(28.6312, 77.2169),
            createdAt: Timestamp.fromDate(new Date(now.getTime() - 10 * 60 * 1000)) // 10 min ago
          }
        ];

        for (const order of pendingOrders) {
          await addDoc(collection(db, 'orders'), order);
          setMessage(`Created pending order: ${order.id}`);
        }
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-in-use') {
          setMessage('✅ Demo user already exists: demo@saathsaath.com / demo123');
        } else {
          console.error('Demo user creation error:', error);
        }
      }

      setMessage('🎉 Firebase setup complete! You can now use the app with full functionality.');

    } catch (error) {
      console.error('Setup error:', error);
      setMessage(`❌ Setup failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    setLoading(true);
    try {
      const products = await FirestoreService.getProducts();
      setMessage(`✅ Firestore test successful! Found ${products.length} products.`);
    } catch (error) {
      setMessage(`❌ Firestore test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-2 text-gray-900">Firebase Setup for Saath-Saath</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="heading-4 mb-4">Setup Complete Firebase Database</h2>
          <p className="body-1 text-gray-600">
            This will create sample suppliers, products, and a demo user account in Firestore.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={createSampleData}
              disabled={loading}
              className="button-text w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup Firebase Data'}
            </button>
            
            <button
              onClick={testFirestore}
              disabled={loading}
              className="button-text w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Firestore Connection'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('✅') || message.includes('🎉') ? 'bg-green-100 text-green-800' : 
              message.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              <p className="body-2">{message}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="heading-4 mb-4">Next Steps</h2>
          <ol className="body-2 list-decimal list-inside space-y-2 text-gray-600">
            <li>Make sure Firebase Authentication and Firestore are enabled in Firebase Console</li>
            <li>Click &quot;Setup Firebase Data&quot; above</li>
            <li>Go to <a href="/login" className="text-orange-500 hover:underline">Login</a> and use: demo@saathsaath.com / demo123</li>
            <li>Explore the <a href="/dashboard" className="text-orange-500 hover:underline">Dashboard</a> with full Firebase integration</li>
          </ol>
        </div>
      </div>
    </div>
  );
}