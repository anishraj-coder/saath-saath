'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { cart, cartCount, updateItemQuantity, removeFromCart } = useAuth();

  const cartSubtotal = cart.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);

  const deliveryFee = cartSubtotal > 0 ? 50.00 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold text-orange-600">Saath-Saath</Link>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">&larr; Continue Shopping</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

        {cartCount === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Your cart is empty</h3>
            <p className="text-gray-500 mt-1 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className="mt-4 inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-sm hover:shadow-md">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border divide-y divide-gray-200">
                {cart.map(item => (
                  <div key={item.productId} className="p-4 flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0">
                       {/* Image placeholder */}
                    </div>
                    
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.unitPrice.toFixed(2)} / {item.unit}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-xs text-red-500 hover:text-red-700 font-medium mt-1">
                        Remove
                      </button>
                    </div>
                    
                    {/* UPDATED: Quantity Controls with darker colors */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold text-lg transition-colors">-</button>
                      <span className="font-semibold w-10 text-center text-lg text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold text-lg transition-colors">+</button>
                    </div>

                    <p className="font-semibold text-gray-800 w-24 text-right text-lg">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">Order Summary</h2>
                <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-bold text-gray-900 text-lg">
                        <span>Total</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                </div>
                <button className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
