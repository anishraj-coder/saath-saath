'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Product } from '@/lib/firestore'; // Make sure this path is correct

// Define the structure for an item in the cart
interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stallAddress?: string;
  verificationStatus: string;
  creditLimit: number;
  totalSavings: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AuthContextType {
  user: User | null;
  vendor: Vendor | null;
  loading: boolean;
  error: string | null;
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity: number) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, vendorData?: Partial<Vendor>) => Promise<void>;
  logout: () => Promise<void>;
  updateVendorProfile: (data: Partial<Vendor>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // This effect runs ONCE when the app loads to get the cart from localStorage
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`saath-cart-${user.uid}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
          localStorage.removeItem(`saath-cart-${user.uid}`);
        }
      }
    }
  }, [user]); // It runs when the user object becomes available

  // This effect runs whenever the cart changes to SAVE it to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`saath-cart-${user.uid}`, JSON.stringify(cart));
    }
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cart, user]); // It runs when the cart or user changes

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setError(null);
      
      if (user) {
        try {
          const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
          if (vendorDoc.exists()) {
            setVendor(vendorDoc.data() as Vendor);
          } else {
            // Create a default profile if one doesn't exist
            const newVendor: Vendor = {
              id: user.uid,
              name: user.displayName || 'New Vendor',
              email: user.email || '',
              verificationStatus: 'verified',
              creditLimit: 5000,
              totalSavings: 0,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            };
            await setDoc(doc(db, 'vendors', user.uid), newVendor);
            setVendor(newVendor);
          }
        } catch (error) {
          console.error('Error fetching vendor profile:', error);
          setError('Failed to load vendor profile');
        }
      } else {
        setVendor(null);
        setCart([]); // Clear cart on logout
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          quantity: quantity,
          unitPrice: product.basePrice,
          unit: product.unit
        };
        return [...prevCart, newItem];
      }
    });
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const register = async (email: string, password: string, name: string, vendorData?: Partial<Vendor>) => {
    // ... (Your existing register function)
  };

  const login = async (email: string, password: string) => {
     // ... (Your existing login function)
  };

  const logout = async () => {
     // ... (Your existing logout function)
     if (user) {
        localStorage.removeItem(`saath-cart-${user.uid}`);
     }
  };

  const updateVendorProfile = async (data: Partial<Vendor>) => {
     // ... (Your existing updateVendorProfile function)
  };

  const value = {
    user,
    vendor,
    loading,
    error,
    cart,
    cartCount,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    login,
    register,
    logout,
    updateVendorProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}