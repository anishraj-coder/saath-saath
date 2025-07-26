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

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stallAddress?: string;
  stallLatitude?: number;
  stallLongitude?: number;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setError(null);
      
      if (user) {
        // Fetch vendor profile from Firestore
        try {
          const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
          if (vendorDoc.exists()) {
            const vendorData = vendorDoc.data() as Vendor;
            setVendor(vendorData);
          } else {
            // Create a basic vendor profile if it doesn't exist
            const newVendor: Vendor = {
              id: user.uid,
              name: user.displayName || 'New Vendor',
              email: user.email || '',
              phone: '',
              stallAddress: '',
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
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, name: string, vendorData?: Partial<Vendor>) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(user, { displayName: name });
      
      // Create vendor document in Firestore
      const newVendor: Vendor = {
        id: user.uid,
        name,
        email,
        phone: vendorData?.phone || '',
        stallAddress: vendorData?.stallAddress || '',
        stallLatitude: vendorData?.stallLatitude,
        stallLongitude: vendorData?.stallLongitude,
        verificationStatus: 'verified',
        creditLimit: 5000,
        totalSavings: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...vendorData
      };
      
      await setDoc(doc(db, 'vendors', user.uid), newVendor);
      setVendor(newVendor);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setVendor(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateVendorProfile = async (data: Partial<Vendor>) => {
    if (!user || !vendor) return;
    
    try {
      setError(null);
      const updatedVendor = { 
        ...vendor, 
        ...data, 
        updatedAt: Timestamp.now() 
      };
      await setDoc(doc(db, 'vendors', user.uid), updatedVendor);
      setVendor(updatedVendor);
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    vendor,
    loading,
    error,
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