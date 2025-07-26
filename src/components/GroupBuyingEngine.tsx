'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService, Order, BuyingGroup, Product, Vendor } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

interface GroupBuyingEngineProps {
  currentOrder?: Order;
  onGroupFormed?: (group: BuyingGroup) => void;
}

interface GroupFormationStatus {
  isSearching: boolean;
  nearbyVendors: Vendor[];
  compatibleOrders: Order[];
  potentialSavings: number;
  groupFormationProgress: number;
}

export default function GroupBuyingEngine({ currentOrder, onGroupFormed }: GroupBuyingEngineProps) {
  const { vendor } = useAuth();
  const [status, setStatus] = useState<GroupFormationStatus>({
    isSearching: false,
    nearbyVendors: [],
    compatibleOrders: [],
    potentialSavings: 0,
    groupFormationProgress: 0
  });
  const [activeGroups, setActiveGroups] = useState<BuyingGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadActiveGroups();
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentOrder && vendor) {
      startGroupFormation(currentOrder);
    }
  }, [currentOrder, vendor]);

  const loadActiveGroups = async () => {
    try {
      const groups = await FirestoreService.getBuyingGroups('forming');
      setActiveGroups(groups);
    } catch (error) {
      console.error('Error loading active groups:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const productList = await FirestoreService.getProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const startGroupFormation = async (order: Order) => {
    if (!vendor?.stallLocation) return;

    setStatus(prev => ({ ...prev, isSearching: true, groupFormationProgress: 10 }));

    try {
      // Step 1: Find nearby vendors (within 2km)
      const nearbyVendors = await FirestoreService.findNearbyVendors(
        vendor.stallLocation,
        2 // 2km radius
      );
      
      setStatus(prev => ({ 
        ...prev, 
        nearbyVendors, 
        groupFormationProgress: 30 
      }));

      // Step 2: Find compatible orders
      const compatibleOrders = await FirestoreService.findCompatibleOrders(order);
      
      setStatus(prev => ({ 
        ...prev, 
        compatibleOrders, 
        groupFormationProgress: 50 
      }));

      // Step 3: Calculate potential savings
      const savings = calculatePotentialSavings(order, compatibleOrders);
      
      setStatus(prev => ({ 
        ...prev, 
        potentialSavings: savings, 
        groupFormationProgress: 70 
      }));

      // Step 4: Create group if minimum criteria met
      if (compatibleOrders.length >= 1 && savings > 50) { // Minimum 2 vendors, ₹50 savings
        const group = await createBuyingGroup(order, compatibleOrders);
        onGroupFormed?.(group);
        
        setStatus(prev => ({ 
          ...prev, 
          groupFormationProgress: 100,
          isSearching: false
        }));
      } else {
        // Not enough for group, process individual order
        setStatus(prev => ({ 
          ...prev, 
          groupFormationProgress: 100,
          isSearching: false
        }));
      }

    } catch (error) {
      console.error('Group formation error:', error);
      setStatus(prev => ({ ...prev, isSearching: false }));
    }
  };

  const calculatePotentialSavings = (mainOrder: Order, compatibleOrders: Order[]): number => {
    let totalSavings = 0;
    
    // Group all orders together
    const allOrders = [mainOrder, ...compatibleOrders];
    
    // Calculate savings for each product
    const productQuantities = new Map<string, number>();
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const currentQty = productQuantities.get(item.productId) || 0;
        productQuantities.set(item.productId, currentQty + item.quantity);
      });
    });

    productQuantities.forEach((totalQuantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const individualPrice = product.basePrice;
      const bulkPrice = FirestoreService.calculateBulkDiscount(product, totalQuantity);
      const savingsPerUnit = individualPrice - bulkPrice;
      
      totalSavings += savingsPerUnit * totalQuantity;
    });

    return Math.round(totalSavings);
  };

  const createBuyingGroup = async (mainOrder: Order, compatibleOrders: Order[]): Promise<BuyingGroup> => {
    if (!vendor?.stallLocation) throw new Error('Vendor location required');

    const allOrders = [mainOrder, ...compatibleOrders];
    const memberIds = allOrders.map(order => order.vendorId);
    
    // Aggregate products
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      totalQuantity: number;
      unitPrice: number;
      bulkPrice: number;
      totalSavings: number;
      memberOrders: { vendorId: string; quantity: number; individualSavings: number }[];
    }>();

    allOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: product.name,
            totalQuantity: 0,
            unitPrice: product.basePrice,
            bulkPrice: 0,
            totalSavings: 0,
            memberOrders: []
          });
        }

        const productData = productMap.get(item.productId)!;
        productData.totalQuantity += item.quantity;
        productData.memberOrders.push({
          vendorId: order.vendorId,
          quantity: item.quantity,
          individualSavings: 0 // Will calculate after bulk price is determined
        });
      });
    });

    // Calculate bulk prices and savings
    const groupProducts = Array.from(productMap.values()).map(productData => {
      const product = products.find(p => p.id === productData.productId)!;
      const bulkPrice = FirestoreService.calculateBulkDiscount(product, productData.totalQuantity);
      const savingsPerUnit = productData.unitPrice - bulkPrice;
      
      productData.bulkPrice = bulkPrice;
      productData.totalSavings = savingsPerUnit * productData.totalQuantity;
      
      // Update individual savings
      productData.memberOrders.forEach(memberOrder => {
        memberOrder.individualSavings = savingsPerUnit * memberOrder.quantity;
      });

      return productData;
    });

    const totalValue = groupProducts.reduce((sum, product) => 
      sum + (product.bulkPrice * product.totalQuantity), 0
    );
    
    const totalSavings = groupProducts.reduce((sum, product) => 
      sum + product.totalSavings, 0
    );

    const groupData: Omit<BuyingGroup, 'id'> = {
      memberIds,
      products: groupProducts,
      totalValue,
      totalSavings,
      status: 'forming',
      centerLocation: vendor.stallLocation,
      radiusKm: 2,
      formationDeadline: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)), // 30 minutes
      minimumMembers: 2,
      deliverySlot: Timestamp.fromDate(new Date(Date.now() + 4 * 60 * 60 * 1000)), // 4 hours from now
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const groupId = await FirestoreService.createBuyingGroup(groupData);
    return { id: groupId, ...groupData };
  };

  if (!vendor) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="body-2 text-gray-600">Please login to access group buying features.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="heading-4 text-gray-900">Group Buying Engine</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="caption text-green-600">Active</span>
        </div>
      </div>

      {status.isSearching && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="body-2 text-gray-700">Forming your group...</span>
            <span className="caption text-gray-500">{status.groupFormationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.groupFormationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-blue-600 uppercase">Nearby Vendors</p>
              <p className="heading-5 text-blue-900">{status.nearbyVendors.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-green-600 uppercase">Compatible Orders</p>
              <p className="heading-5 text-green-900">{status.compatibleOrders.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="caption text-orange-600 uppercase">Potential Savings</p>
              <p className="heading-5 text-orange-900">₹{status.potentialSavings}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {activeGroups.length > 0 && (
        <div>
          <h3 className="heading-5 text-gray-900 mb-4">Active Groups Near You</h3>
          <div className="space-y-3">
            {activeGroups.slice(0, 3).map(group => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="body-2 font-medium text-gray-900">
                      {group.memberIds.length} vendors • ₹{group.totalSavings} savings
                    </p>
                    <p className="caption text-gray-500">
                      {group.products.length} products • Delivery in 4 hours
                    </p>
                  </div>
                  <button className="button-text bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}