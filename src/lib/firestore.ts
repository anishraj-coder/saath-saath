import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Firestore documents
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stallAddress?: string;
  stallLocation?: GeoPoint;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  creditLimit: number;
  totalSavings: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  category: 'vegetables' | 'spices' | 'oil' | 'flour' | 'dairy' | 'other';
  unit: 'kg' | 'litre' | 'piece' | 'gram';
  basePrice: number;
  currentStock: number;
  supplierId: string;
  bulkPricing: BulkTier[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BulkTier {
  minQuantity: number;
  pricePerUnit: number;
  discountPercentage: number;
}

export interface Order {
  id: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'snpl';
  status: 'pending' | 'grouped' | 'confirmed' | 'delivered' | 'cancelled';
  groupId?: string;
  deliveryAddress: string;
  deliveryLocation?: GeoPoint;
  createdAt: Timestamp;
  deliveryTime?: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BuyingGroup {
  id: string;
  memberIds: string[];
  products: GroupProduct[];
  totalValue: number;
  totalSavings: number;
  status: 'forming' | 'confirmed' | 'ordered' | 'delivered';
  deliverySlot: Timestamp;
  deliveryArea: string;
  createdAt: Timestamp;
}

export interface GroupProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  unitPrice: number;
  totalSavings: number;
  memberOrders: { vendorId: string; quantity: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPhone: string;
  address: string;
  location?: GeoPoint;
  rating: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface CreditTransaction {
  id: string;
  vendorId: string;
  amount: number;
  type: 'debit' | 'credit' | 'repayment';
  orderId?: string;
  status: 'pending' | 'completed' | 'failed';
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
}

// Firestore helper functions
export class FirestoreService {
  // Vendor operations
  static async createVendor(vendorData: Omit<Vendor, 'id'>) {
    const docRef = await addDoc(collection(db, 'vendors'), vendorData);
    return docRef.id;
  }

  static async getVendor(vendorId: string): Promise<Vendor | null> {
    const docRef = doc(db, 'vendors', vendorId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Vendor : null;
  }

  static async updateVendor(vendorId: string, data: Partial<Vendor>) {
    const docRef = doc(db, 'vendors', vendorId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  }

  // Product operations
  static async getProducts(category?: string): Promise<Product[]> {
    let q = query(collection(db, 'products'), where('isActive', '==', true));
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  static async createProduct(productData: Omit<Product, 'id'>) {
    const docRef = await addDoc(collection(db, 'products'), productData);
    return docRef.id;
  }

  // Order operations
  static async createOrder(orderData: Omit<Order, 'id'>) {
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  }

  static async getVendorOrders(vendorId: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  static async updateOrderStatus(orderId: string, status: Order['status']) {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
  }

  // Buying Group operations
  static async createBuyingGroup(groupData: Omit<BuyingGroup, 'id'>) {
    const docRef = await addDoc(collection(db, 'buyingGroups'), groupData);
    return docRef.id;
  }

  static async getBuyingGroups(status?: BuyingGroup['status']): Promise<BuyingGroup[]> {
    let q = query(collection(db, 'buyingGroups'), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BuyingGroup));
  }

  // Supplier operations
  static async getSuppliers(): Promise<Supplier[]> {
    const q = query(collection(db, 'suppliers'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
  }

  // Credit operations
  static async createCreditTransaction(transactionData: Omit<CreditTransaction, 'id'>) {
    const docRef = await addDoc(collection(db, 'creditTransactions'), transactionData);
    return docRef.id;
  }

  static async getVendorCreditHistory(vendorId: string): Promise<CreditTransaction[]> {
    const q = query(
      collection(db, 'creditTransactions'),
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditTransaction));
  }

  // Analytics and reporting
  static async getVendorStats(vendorId: string) {
    const orders = await this.getVendorOrders(vendorId);
    const creditHistory = await this.getVendorCreditHistory(vendorId);
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSavings = orders.reduce((sum, order) => {
      // Calculate savings based on group discounts
      return sum + (order.groupId ? order.totalAmount * 0.15 : 0); // Assume 15% average savings
    }, 0);
    
    return {
      totalOrders,
      totalSpent,
      totalSavings,
      creditUsed: creditHistory
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  }
}