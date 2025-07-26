'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FirestoreService, Product as ProductType } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get cart functions and state from AuthContext
  const { addToCart, cartCount } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productList = await FirestoreService.getProducts();
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const newFilteredList = products.filter(product => 
      product.name.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredProducts(newFilteredList);
  }, [searchTerm, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-2xl font-bold text-orange-600">Saath-Saath</Link>
          <div className="flex items-center gap-6">
            {/* Cart Icon and Count */}
            <Link href="/cart" className="relative">
              <svg className="w-6 h-6 text-gray-600 hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-orange-500">&larr; Back to Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
          <p className="text-gray-600">Find raw materials for your stall.</p>
        </div>
        
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-black"
          />
        </div>

        {loading ? (
          <div className="text-center py-10"><p>Loading Products...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-6 shadow-sm border flex flex-col">
                <div className="flex-grow">
                  <p className="text-xs font-semibold uppercase text-orange-500 mb-1">{product.category}</p>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-4">₹{product.basePrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">per {product.unit}</p>
                </div>
                {/* NEW: Add to Cart Button */}
                <button 
                  onClick={() => addToCart(product, 1)}
                  className="mt-6 w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}