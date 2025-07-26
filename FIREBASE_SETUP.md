# 🔥 Firebase Setup Guide for Saath-Saath

## 🚀 Quick Setup (5 minutes)

### **Step 1: Firebase Console Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `saath-22541`
3. Enable required services:

#### **Enable Firestore Database:**
1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select location: **asia-south1 (Mumbai)** or closest to you

#### **Enable Authentication:**
1. Go to **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **"Email/Password"**

### **Step 2: Firestore Security Rules (Development)**
```javascript
// Firestore Rules (Development - Open Access)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Open for development
    }
  }
}
```

### **Step 3: Test the Setup**
1. Run: `npm run dev`
2. Go to: http://localhost:3000/setup-firebase
3. Click **"Setup Firebase Data"**
4. Should see: "🎉 Firebase setup complete!"

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: "Query requires an index"**
**Solution**: Simplified queries to avoid composite indexes
- ✅ **Fixed**: Compatible orders query now uses single-field filtering
- ✅ **Graceful**: Falls back to empty array if query fails

### **Issue 2: "Permission denied"**
**Solution**: Update Firestore rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **Issue 3: "Firebase not initialized"**
**Solution**: Check environment variables
- Verify Firebase config in `src/lib/firebase.ts`
- Ensure project ID matches your Firebase project

### **Issue 4: "Network error"**
**Solution**: Check internet connection
- ✅ **Handled**: App shows offline indicator
- ✅ **Graceful**: Works with cached/mock data

## 📊 **Collections Structure**

### **vendors**
```typescript
{
  id: string,
  name: string,
  email: string,
  stallLocation: GeoPoint,
  stallAddress: string,
  verificationStatus: 'verified',
  creditLimit: number,
  totalSavings: number
}
```

### **products**
```typescript
{
  id: string,
  name: string,
  category: 'vegetables' | 'spices' | 'oil' | 'flour',
  basePrice: number,
  bulkPricing: [
    { minQuantity: 10, pricePerUnit: 28, discountPercentage: 6.7 },
    { minQuantity: 50, pricePerUnit: 25, discountPercentage: 16.7 }
  ]
}
```

### **orders**
```typescript
{
  id: string,
  vendorId: string,
  items: [
    { productId: string, quantity: number, unitPrice: number }
  ],
  status: 'pending' | 'grouped' | 'confirmed',
  deliveryAddress: string,
  createdAt: Timestamp
}
```

### **buyingGroups**
```typescript
{
  id: string,
  memberIds: string[],
  products: GroupProduct[],
  totalValue: number,
  totalSavings: number,
  status: 'forming' | 'confirmed',
  centerLocation: GeoPoint
}
```

## 🎯 **Testing Workflow**

### **1. Setup Demo Data**
```bash
# Start development server
npm run dev

# Go to setup page
http://localhost:3000/setup-firebase

# Click "Setup Firebase Data"
# Wait for completion message
```

### **2. Test Group Buying**
```bash
# Login as demo user
Email: demo@saathsaath.com
Password: demo123

# Go to dashboard
http://localhost:3000/dashboard

# Click "Create Sample Order"
# Watch group formation process
```

### **3. Run Test Suite**
```bash
# Click "Test Engine" in dashboard
# Or go directly to:
http://localhost:3000/test-group-buying

# Click "Run Group Buying Test"
# Check console output for results
```

## 🔒 **Production Security Rules**

For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Vendors can read/write their own data
    match /vendors/{vendorId} {
      allow read, write: if request.auth != null && request.auth.uid == vendorId;
    }
    
    // Products are read-only for all authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can modify products
    }
    
    // Orders can be read/written by the vendor who created them
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.vendorId;
    }
    
    // Buying groups can be read by members
    match /buyingGroups/{groupId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null;
    }
  }
}
```

## 📈 **Performance Optimization**

### **Indexes to Create (if needed):**
1. **orders**: `status` (single field)
2. **orders**: `vendorId` (single field) 
3. **buyingGroups**: `status` (single field)
4. **products**: `category` (single field)

### **Query Optimization:**
- ✅ Simplified compound queries
- ✅ Added error handling and fallbacks
- ✅ Client-side filtering for complex logic
- ✅ Graceful degradation when offline

## 🎉 **Ready to Test!**

Your Firebase setup is now optimized for the Group Buying Engine with:
- ✅ No composite index requirements
- ✅ Graceful error handling
- ✅ Offline mode support
- ✅ Comprehensive test suite

**Start testing**: Run the setup and try the group buying features! 🚀