import { FirestoreService, Product, BulkTier } from './firestore';
import { Timestamp } from 'firebase/firestore';

// Product Catalog and Pricing Engine
export class ProductCatalogService {
  // Initialize product catalog with real street food vendor products
  static async initializeProductCatalog() {
    const products: Omit<Product, 'id'>[] = [
      // Vegetables
      {
        name: 'Onions',
        category: 'vegetables',
        unit: 'kg',
        basePrice: 30,
        currentStock: 1000,
        supplierId: 'supplier_1',
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 28, discountPercentage: 6.7 },
          { minQuantity: 25, pricePerUnit: 25, discountPercentage: 16.7 },
          { minQuantity: 50, pricePerUnit: 22, discountPercentage: 26.7 }
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
        supplierId: 'supplier_1',
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 23, discountPercentage: 8 },
          { minQuantity: 25, pricePerUnit: 20, discountPercentage: 20 },
          { minQuantity: 50, pricePerUnit: 18, discountPercentage: 28 }
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
        currentStock: 600,
        supplierId: 'supplier_1',
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 38, discountPercentage: 5 },
          { minQuantity: 25, pricePerUnit: 35, discountPercentage: 12.5 },
          { minQuantity: 50, pricePerUnit: 32, discountPercentage: 20 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Green Chilies',
        category: 'vegetables',
        unit: 'kg',
        basePrice: 80,
        currentStock: 200,
        supplierId: 'supplier_2',
        bulkPricing: [
          { minQuantity: 5, pricePerUnit: 75, discountPercentage: 6.25 },
          { minQuantity: 10, pricePerUnit: 70, discountPercentage: 12.5 },
          { minQuantity: 20, pricePerUnit: 65, discountPercentage: 18.75 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      // Spices
      {
        name: 'Turmeric Powder',
        category: 'spices',
        unit: 'kg',
        basePrice: 200,
        currentStock: 100,
        supplierId: 'supplier_2',
        bulkPricing: [
          { minQuantity: 5, pricePerUnit: 190, discountPercentage: 5 },
          { minQuantity: 10, pricePerUnit: 180, discountPercentage: 10 },
          { minQuantity: 25, pricePerUnit: 170, discountPercentage: 15 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Red Chili Powder',
        category: 'spices',
        unit: 'kg',
        basePrice: 250,
        currentStock: 80,
        supplierId: 'supplier_2',
        bulkPricing: [
          { minQuantity: 5, pricePerUnit: 240, discountPercentage: 4 },
          { minQuantity: 10, pricePerUnit: 225, discountPercentage: 10 },
          { minQuantity: 20, pricePerUnit: 210, discountPercentage: 16 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Garam Masala',
        category: 'spices',
        unit: 'kg',
        basePrice: 400,
        currentStock: 50,
        supplierId: 'supplier_2',
        bulkPricing: [
          { minQuantity: 3, pricePerUnit: 380, discountPercentage: 5 },
          { minQuantity: 5, pricePerUnit: 360, discountPercentage: 10 },
          { minQuantity: 10, pricePerUnit: 340, discountPercentage: 15 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      // Oil
      {
        name: 'Mustard Oil',
        category: 'oil',
        unit: 'litre',
        basePrice: 150,
        currentStock: 200,
        supplierId: 'supplier_3',
        bulkPricing: [
          { minQuantity: 5, pricePerUnit: 145, discountPercentage: 3.3 },
          { minQuantity: 10, pricePerUnit: 140, discountPercentage: 6.7 },
          { minQuantity: 20, pricePerUnit: 135, discountPercentage: 10 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Sunflower Oil',
        category: 'oil',
        unit: 'litre',
        basePrice: 120,
        currentStock: 300,
        supplierId: 'supplier_3',
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 115, discountPercentage: 4.2 },
          { minQuantity: 20, pricePerUnit: 110, discountPercentage: 8.3 },
          { minQuantity: 50, pricePerUnit: 105, discountPercentage: 12.5 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      // Flour
      {
        name: 'Wheat Flour',
        category: 'flour',
        unit: 'kg',
        basePrice: 35,
        currentStock: 500,
        supplierId: 'supplier_1',
        bulkPricing: [
          { minQuantity: 25, pricePerUnit: 33, discountPercentage: 5.7 },
          { minQuantity: 50, pricePerUnit: 31, discountPercentage: 11.4 },
          { minQuantity: 100, pricePerUnit: 29, discountPercentage: 17.1 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        name: 'Gram Flour (Besan)',
        category: 'flour',
        unit: 'kg',
        basePrice: 60,
        currentStock: 200,
        supplierId: 'supplier_1',
        bulkPricing: [
          { minQuantity: 10, pricePerUnit: 57, discountPercentage: 5 },
          { minQuantity: 25, pricePerUnit: 54, discountPercentage: 10 },
          { minQuantity: 50, pricePerUnit: 51, discountPercentage: 15 }
        ],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    // Create products in Firestore
    for (const product of products) {
      try {
        await FirestoreService.createProduct(product);
        console.log(`Created product: ${product.name}`);
      } catch (error) {
        console.error(`Error creating product ${product.name}:`, error);
      }
    }
  }

  // Dynamic pricing calculation based on quantity and group size
  static calculateOptimalPrice(product: Product, quantity: number, groupSize: number = 1): {
    unitPrice: number;
    totalPrice: number;
    savings: number;
    discountPercentage: number;
    tier?: BulkTier;
  } {
    // Find the best applicable bulk tier
    const applicableTier = product.bulkPricing
      .filter(tier => quantity >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    let unitPrice = product.basePrice;
    let discountPercentage = 0;
    let tier: BulkTier | undefined;

    if (applicableTier) {
      unitPrice = applicableTier.pricePerUnit;
      discountPercentage = applicableTier.discountPercentage;
      tier = applicableTier;
    }

    // Additional group discount for larger groups
    if (groupSize > 3) {
      const groupDiscount = Math.min(groupSize * 0.5, 5); // Max 5% additional discount
      discountPercentage += groupDiscount;
      unitPrice = unitPrice * (1 - groupDiscount / 100);
    }

    const totalPrice = unitPrice * quantity;
    const originalPrice = product.basePrice * quantity;
    const savings = originalPrice - totalPrice;

    return {
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      discountPercentage: Math.round(discountPercentage * 100) / 100,
      tier
    };
  }

  // Get products with pricing for a specific vendor
  static async getProductsWithPricing(vendorId?: string, category?: string): Promise<(Product & {
    pricing: ReturnType<typeof ProductCatalogService.calculateOptimalPrice>;
  })[]> {
    const products = await FirestoreService.getProducts(category);
    
    return products.map(product => ({
      ...product,
      pricing: this.calculateOptimalPrice(product, 1) // Default quantity of 1
    }));
  }

  // Real-time inventory tracking
  static async updateStock(productId: string, quantityUsed: number): Promise<void> {
    // This would typically update the product stock in Firestore
    // For demo purposes, we'll just log it
    console.log(`Stock updated for product ${productId}: -${quantityUsed}`);
  }

  // Supplier management
  static async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    const allProducts = await FirestoreService.getProducts();
    return allProducts.filter(product => product.supplierId === supplierId);
  }

  // Price comparison and recommendations
  static compareProductPrices(products: Product[], targetQuantity: number): {
    product: Product;
    pricing: ReturnType<typeof ProductCatalogService.calculateOptimalPrice>;
    rank: number;
  }[] {
    return products
      .map(product => ({
        product,
        pricing: this.calculateOptimalPrice(product, targetQuantity)
      }))
      .sort((a, b) => a.pricing.unitPrice - b.pricing.unitPrice)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  // Seasonal pricing adjustments
  static applySeasonalPricing(product: Product, season: 'summer' | 'monsoon' | 'winter'): Product {
    const seasonalMultipliers = {
      summer: { vegetables: 1.1, oil: 1.0, spices: 1.0, flour: 1.0, dairy: 1.15, other: 1.0 },
      monsoon: { vegetables: 1.2, oil: 1.05, spices: 1.0, flour: 1.0, dairy: 1.1, other: 1.0 },
      winter: { vegetables: 0.9, oil: 1.0, spices: 1.0, flour: 1.0, dairy: 0.95, other: 1.0 }
    };

    const multiplier = seasonalMultipliers[season][product.category];
    
    return {
      ...product,
      basePrice: Math.round(product.basePrice * multiplier),
      bulkPricing: product.bulkPricing.map(tier => ({
        ...tier,
        pricePerUnit: Math.round(tier.pricePerUnit * multiplier)
      }))
    };
  }
}