# Design Document

## Overview

Saath-Saath is architected as a modern, scalable web application built on Next.js 15 with TypeScript and Firebase, designed to implement the 6 essential features that directly address street food vendors' core challenges. The platform leverages Firebase's real-time capabilities, modern React patterns, and component-based architecture to create a comprehensive B2B sourcing solution.

The design prioritizes the implementation of these critical features:
1. **Hyperlocal Group Buying Engine** - Core aggregation and bulk pricing
2. **Accessible UI/UX Components** - Voice-first, vernacular interface
3. **AI-Powered Demand Forecasting** - Smart procurement recommendations
4. **Integrated SNPL Micro-Credit** - Source Now, Pay Later financing
5. **Pooled Logistics & Route Optimization** - Efficient delivery system
6. **ONDC-Native Architecture** - Government-backed digital commerce integration

The architecture is modular, component-based, and designed for rapid development while maintaining production-ready principles.

## Architecture

### High-Level System Architecture

The application follows a Firebase-first architecture optimized for the 6 essential features:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  Next.js 15 + TypeScript + Tailwind CSS + Poppins Font    │
│  Voice Interface + Component Library + Mobile-First Design  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component Layer                          │
│  GroupBuyingEngine + VoiceInterface + CreditSystem +       │
│  ForecastingEngine + LogisticsOptimizer + ONDCConnector    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Services                        │
│  Firestore + Authentication + Cloud Functions + Storage    │
│  Real-time Database + Cloud Messaging                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Integrations                    │
│  ONDC Network + Weather API + Maps API + Payment Gateway   │
│  Speech Recognition + Text-to-Speech + SMS Gateway         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

**Frontend:**
- **Next.js 15**: Server-side rendering, API routes, and excellent developer experience
- **TypeScript**: Type safety and better code maintainability for complex business logic
- **Tailwind CSS**: Rapid UI development with utility-first approach
- **Poppins Font**: Modern, accessible typography system for better readability
- **Component Architecture**: Reusable, modular components for the 6 essential features

**Backend & Database:**
- **Firebase Firestore**: Real-time NoSQL database perfect for group formation and live updates
- **Firebase Authentication**: Secure, scalable auth with SMS OTP support
- **Firebase Cloud Functions**: Serverless functions for complex business logic
- **Firebase Storage**: File storage for vendor verification documents

**Essential Feature Technologies:**
- **Web Speech API**: Voice recognition for accessible interface
- **Geolocation API**: Location-based group formation and logistics
- **Web Workers**: Background processing for AI forecasting
- **Service Workers**: Offline functionality and push notifications
- **WebRTC**: Real-time communication for vendor coordination

## Components and Interfaces

### Essential Feature Components Architecture

#### 1. Hyperlocal Group Buying Engine
```typescript
interface GroupBuyingEngine {
  findNearbyVendors(location: GeoPoint, radiusKm: number): Promise<Vendor[]>;
  createBuyingGroup(orders: Order[]): Promise<BuyingGroup>;
  calculateBulkDiscounts(groupOrder: GroupOrder): BulkDiscount[];
  optimizeGroupFormation(pendingOrders: Order[]): Promise<BuyingGroup[]>;
}

interface BuyingGroup {
  id: string;
  memberIds: string[];
  products: GroupProduct[];
  totalValue: number;
  totalSavings: number;
  status: 'forming' | 'confirmed' | 'ordered' | 'delivered';
  centerLocation: GeoPoint;
  radiusKm: number;
  formationDeadline: Timestamp;
  deliverySlot: Timestamp;
  createdAt: Timestamp;
}

interface GroupProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  unitPrice: number;
  bulkPrice: number;
  totalSavings: number;
  memberOrders: { vendorId: string; quantity: number; individualSavings: number }[];
}
```

#### 2. Accessible Voice-First Interface
```typescript
interface VoiceInterface {
  startListening(): void;
  stopListening(): void;
  processVoiceCommand(command: string): Promise<VoiceResponse>;
  speak(text: string, language: string): void;
  getAvailableLanguages(): string[];
}

interface VoiceResponse {
  action: 'navigate' | 'order' | 'confirm' | 'help';
  data?: any;
  feedback: string;
  requiresConfirmation: boolean;
}

interface AccessibleComponent {
  voiceEnabled: boolean;
  iconBased: boolean;
  highContrast: boolean;
  largeTouch: boolean;
  vernacularSupport: string[];
}
```

#### 3. AI-Powered Demand Forecasting
```typescript
interface ForecastingEngine {
  generateDailyForecast(vendorId: string): Promise<DailyForecast>;
  analyzeHistoricalPatterns(vendorId: string): Promise<ConsumptionPattern[]>;
  incorporateWeatherData(forecast: DailyForecast, weather: WeatherData): DailyForecast;
  processEventData(forecast: DailyForecast, events: LocalEvent[]): DailyForecast;
}

interface DailyForecast {
  vendorId: string;
  date: Date;
  recommendations: ProductRecommendation[];
  confidence: number;
  reasoning: string[];
  weatherImpact: WeatherImpact;
  eventImpact: EventImpact[];
}

interface ProductRecommendation {
  productId: string;
  productName: string;
  recommendedQuantity: number;
  currentAverageQuantity: number;
  changePercentage: number;
  changeReason: string;
  visualIndicator: 'increase' | 'decrease' | 'maintain';
  confidence: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  forecast: string; // 'sunny', 'rainy', 'cloudy', etc.
}
```

#### 4. Integrated SNPL Micro-Credit System
```typescript
interface CreditSystem {
  assessCreditLimit(vendorId: string): Promise<CreditAssessment>;
  processSNPLTransaction(transaction: SNPLTransaction): Promise<TransactionResult>;
  trackRepayment(vendorId: string): Promise<RepaymentStatus>;
  updateCreditScore(vendorId: string, paymentHistory: PaymentRecord[]): Promise<CreditScore>;
}

interface SNPLTransaction {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  dueDate: Date;
  interestRate: number;
  status: 'pending' | 'approved' | 'disbursed' | 'repaid' | 'overdue';
  createdAt: Timestamp;
}

interface CreditAssessment {
  vendorId: string;
  creditLimit: number;
  availableCredit: number;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: CreditFactor[];
}
```

#### 5. Pooled Logistics & Route Optimization
```typescript
interface LogisticsEngine {
  optimizeDeliveryRoute(group: BuyingGroup): Promise<OptimizedRoute>;
  calculateDeliveryTime(route: OptimizedRoute): Promise<DeliverySchedule>;
  trackDelivery(deliveryId: string): Promise<DeliveryStatus>;
  handleDeliveryExceptions(deliveryId: string, exception: DeliveryException): Promise<Resolution>;
}

interface OptimizedRoute {
  id: string;
  groupId: string;
  stops: DeliveryStop[];
  totalDistance: number;
  estimatedTime: number;
  vehicleType: 'bike' | 'auto' | 'van';
  driverId: string;
  optimizationScore: number;
}

interface DeliveryStop {
  vendorId: string;
  stallLocation: GeoPoint;
  stallAddress: string;
  items: DeliveryItem[];
  estimatedArrival: Date;
  actualArrival?: Date;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  deliveryNotes?: string;
}

interface DeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  specialInstructions?: string;
}
```

#### 6. ONDC-Native Architecture
```typescript
interface ONDCConnector {
  registerAsSellerApp(): Promise<ONDCRegistration>;
  searchSuppliers(searchCriteria: SupplierSearchCriteria): Promise<ONDCSupplier[]>;
  placeOrderWithSupplier(order: ONDCOrder): Promise<ONDCOrderResponse>;
  trackOrderStatus(orderId: string): Promise<ONDCOrderStatus>;
  handleSupplierCallback(callback: ONDCCallback): Promise<void>;
}

interface ONDCOrder {
  id: string;
  buyingGroupId: string;
  supplierId: string;
  items: ONDCOrderItem[];
  totalAmount: number;
  deliveryLocation: GeoPoint;
  deliveryTime: Date;
  paymentMethod: string;
}

interface ONDCSupplier {
  id: string;
  name: string;
  location: GeoPoint;
  rating: number;
  products: ONDCProduct[];
  deliveryRadius: number;
  minimumOrderValue: number;
  isVerified: boolean;
}

interface ONDCProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  bulkPricing: BulkTier[];
  availability: number;
  quality: string;
  certifications: string[];
}
```

### User Interface Components

#### 1. Voice-First Interface Components
- **VoiceCommandProcessor**: Handles speech recognition and command interpretation
- **VoiceNavigator**: Voice-guided navigation through app features
- **VoiceFeedback**: Text-to-speech responses and confirmations
- **VoiceFallback**: Touch-based alternatives when voice fails

#### 2. Vernacular Design Components
- **IconLibrary**: Visual icons for common actions and products
- **LanguageSelector**: Multi-language support (Hindi, English, regional)
- **AccessibleButton**: Large, high-contrast touch targets
- **GuidedTutorial**: Interactive onboarding for new users

#### 3. Mobile-First Components
- **SwipeNavigation**: Gesture-based navigation
- **QuickActions**: One-tap ordering for frequent items
- **OfflineQueue**: Order queuing when network is unavailable
- **PushNotifications**: Real-time updates and reminders

## Data Models

### Firebase Firestore Collections

#### Core Collections
```typescript
interface Order {
  id: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'snpl';
  status: 'pending' | 'grouped' | 'confirmed' | 'delivered';
  groupId?: string;
  createdAt: Date;
  deliveryTime?: Date;
}

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

#### 5. AI Forecasting Engine
```typescript
interface ForecastInput {
  vendorId: string;
  productId: string;
  historicalOrders: number[];
  weatherData: WeatherData;
  eventData: EventData;
  dayOfWeek: number;
}

interface ForecastOutput {
  productId: string;
  recommendedQuantity: number;
  confidence: number;
  reasoning: string;
  visualIndicator: 'increase' | 'decrease' | 'maintain';
}
```

### User Interface Components

#### 1. Voice-First Interface
- **Speech Recognition**: Web Speech API for voice commands
- **Text-to-Speech**: For audio feedback and confirmations
- **Fallback UI**: Touch-based interface for when voice fails
- **Language Support**: Hindi, English, and regional languages

#### 2. Vernacular Design System
- **Icon-Heavy Design**: Minimal text, maximum visual communication
- **Large Touch Targets**: Optimized for users with varying digital literacy
- **High Contrast**: Ensures visibility in outdoor lighting conditions
- **Progressive Disclosure**: Complex features revealed gradually

#### 3. Mobile-First Responsive Design
- **PWA Capabilities**: Offline functionality and push notifications
- **Gesture Navigation**: Swipe-based interactions familiar to mobile users
- **Quick Actions**: One-tap ordering for frequently purchased items

## Data Models

**vendors**
```typescript
interface VendorDocument {
  id: string;
  name: string;
  phone: string;
  email: string;
  stallLocation: GeoPoint;
  stallAddress: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  creditLimit: number;
  availableCredit: number;
  totalSavings: number;
  totalOrders: number;
  joinedGroups: string[];
  preferredLanguage: string;
  voiceEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**products**
```typescript
interface ProductDocument {
  id: string;
  name: string;
  category: 'vegetables' | 'spices' | 'oil' | 'flour' | 'dairy' | 'other';
  unit: 'kg' | 'litre' | 'piece' | 'gram';
  basePrice: number;
  currentStock: number;
  supplierId: string;
  bulkPricing: BulkTier[];
  isActive: boolean;
  ondcProductId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**buyingGroups**
```typescript
interface BuyingGroupDocument {
  id: string;
  memberIds: string[];
  products: GroupProduct[];
  totalValue: number;
  totalSavings: number;
  status: 'forming' | 'confirmed' | 'ordered' | 'delivered';
  centerLocation: GeoPoint;
  radiusKm: number;
  formationDeadline: Timestamp;
  deliverySlot: Timestamp;
  deliveryRoute?: OptimizedRoute;
  ondcOrderId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**orders**
```typescript
interface OrderDocument {
  id: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'snpl';
  status: 'pending' | 'grouped' | 'confirmed' | 'delivered' | 'cancelled';
  groupId?: string;
  creditTransactionId?: string;
  deliveryStatus?: DeliveryStatus;
  createdAt: Timestamp;
  deliveryTime?: Timestamp;
}
```

**creditTransactions**
```typescript
interface CreditTransactionDocument {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  interestRate: number;
  dueDate: Timestamp;
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  repaymentHistory: Payment[];
  createdAt: Timestamp;
  paidAt?: Timestamp;
}
```

**forecasts**
```typescript
interface ForecastDocument {
  id: string;
  vendorId: string;
  date: Timestamp;
  recommendations: ProductRecommendation[];
  weatherData: WeatherData;
  eventData: LocalEvent[];
  confidence: number;
  accuracy?: number; // Calculated after actual orders
  createdAt: Timestamp;
}
```

### Real-time Data Strategy

**Firebase Real-time Listeners:**
- **Active Groups**: Real-time updates on group formation status
- **Order Status**: Live tracking of order and delivery progress
- **Product Availability**: Real-time stock and pricing updates
- **Credit Limits**: Live credit availability and transaction status

**Local Storage & Caching:**
- **Vendor Preferences**: Language, voice settings, frequent orders
- **Offline Queue**: Orders placed when network is unavailable
- **Product Catalog**: Cached for offline browsing
- **Voice Commands**: Cached speech recognition patterns

## Error Handling

### Graceful Degradation Strategy

1. **Voice Interface Fallback**: If speech recognition fails, automatically switch to touch interface
2. **Offline Functionality**: PWA caches essential data for offline order placement
3. **Network Resilience**: Retry mechanisms for failed API calls with exponential backoff
4. **Payment Failures**: Multiple payment options with clear error messaging

### Error Categories and Responses

**User Errors:**
- Invalid input validation with helpful suggestions
- Clear, vernacular error messages
- Visual indicators for required fields

**System Errors:**
- Graceful fallbacks for third-party service failures
- Automatic retry for transient failures
- Admin notifications for critical system issues

**Business Logic Errors:**
- Insufficient credit limits handled with alternative payment options
- Out-of-stock items with automatic substitution suggestions
- Group formation failures with individual order processing

## Testing Strategy

### Essential Features Testing Approach

#### 1. Hyperlocal Group Buying Engine Testing
- **Geographic Clustering**: Test vendor proximity calculations
- **Bulk Discount Logic**: Verify pricing calculations and savings
- **Group Formation**: Test automatic group creation and optimization
- **Real-time Updates**: Test live group status changes

#### 2. Voice Interface Testing
- **Speech Recognition**: Test across different accents and languages
- **Voice Commands**: Test navigation and order placement via voice
- **Fallback Mechanisms**: Test touch interface when voice fails
- **Accessibility**: Test with screen readers and assistive technologies

#### 3. AI Forecasting Testing
- **Historical Pattern Analysis**: Test with mock vendor data
- **Weather Integration**: Test forecast adjustments based on weather
- **Recommendation Accuracy**: Test prediction vs actual order comparison
- **Performance**: Test forecasting speed and resource usage

#### 4. SNPL Credit System Testing
- **Credit Assessment**: Test credit limit calculations
- **Transaction Processing**: Test SNPL order flow
- **Repayment Tracking**: Test payment reminders and status updates
- **Risk Management**: Test default detection and prevention

#### 5. Logistics Optimization Testing
- **Route Calculation**: Test delivery route optimization algorithms
- **Real-time Tracking**: Test delivery status updates
- **Exception Handling**: Test failed delivery scenarios
- **Performance**: Test route calculation speed for large groups

#### 6. ONDC Integration Testing
- **Supplier Discovery**: Test ONDC network supplier search
- **Order Placement**: Test order flow through ONDC protocol
- **Status Synchronization**: Test order status updates from suppliers
- **Error Handling**: Test ONDC network failures and fallbacks

### Demo Preparation Strategy

1. **Seed Data**: Pre-populated database with realistic vendor and product data
2. **Mock Integrations**: Simulated external APIs for reliable demo performance
3. **Performance Optimization**: Cached responses for smooth presentation flow
4. **Fallback Scenarios**: Prepared responses for potential demo failures

## Security Considerations

### Authentication and Authorization
- **OTP-based Authentication**: SMS verification for vendor registration
- **JWT Tokens**: Secure session management with refresh token rotation
- **Role-based Access**: Vendor, admin, and supplier permission levels

### Data Protection
- **PII Encryption**: Sensitive vendor information encrypted at rest
- **API Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: SQL injection and XSS prevention
- **HTTPS Enforcement**: All communications encrypted in transit

### Financial Security
- **PCI Compliance**: Secure handling of payment information
- **Credit Limit Controls**: Automated fraud detection for unusual spending patterns
- **Transaction Logging**: Comprehensive audit trail for all financial operations

## Scalability and Performance

### Optimization Strategies

#### Database Optimization
- **Indexing Strategy**: Optimized indexes for location-based queries and group formation
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Minimized N+1 queries through proper data fetching

#### Caching Strategy
- **Redis Implementation**: High-performance caching for frequently accessed data
- **CDN Integration**: Static asset delivery optimization
- **Browser Caching**: Optimized cache headers for client-side performance

#### Real-time Features
- **WebSocket Optimization**: Efficient real-time updates for group formation
- **Event-driven Architecture**: Asynchronous processing for non-critical operations
- **Background Jobs**: Queue-based processing for AI forecasting and notifications

This design provides a solid foundation for building Saath-Saath as a winning hackathon project while maintaining the architectural integrity needed for real-world deployment. The focus on rapid development, user experience, and core feature demonstration ensures maximum impact within the hackathon timeframe.