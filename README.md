# Saath-Saath: Hyperlocal Sourcing Platform for Street Food Vendors

A Next.js application that transforms individual street food vendors into powerful Group Purchasing Organizations (GPOs) through collective buying, AI forecasting, and integrated micro-credit.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

You have several options for the database:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `saath_saath`
3. Update `.env` with your local database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/saath_saath"
```

#### Option B: Cloud Database (Recommended for Hackathon)
Use a free cloud database service:

**Supabase (Recommended):**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string and update `.env`

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Create a PostgreSQL database
3. Copy the DATABASE_URL and update `.env`

**Neon:**
1. Go to [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection string and update `.env`

### 3. Initialize Database
```bash
npx prisma db push
```

### 4. Test Database Connection
```bash
npm run dev
```
Then visit: http://localhost:3000/test

### 5. Start the Application
If the database test passes, visit: http://localhost:3000

## 🧪 Testing the Application

### Test Database Connection
Visit `/test` to check if your database is properly connected.

### Test Authentication Flow
1. Go to `/register` to create a new vendor account
2. Use any 10-digit phone number starting with 6-9
3. The OTP will be displayed on screen in development mode
4. Complete registration and you'll be redirected to the dashboard

### Test Login
1. Go to `/login` 
2. Enter the phone number you registered with
3. Use the displayed OTP to login

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Client-side state management** with React hooks

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **JWT** for authentication
- **Zod** for input validation

### Key Features Implemented
- ✅ Vendor registration with OTP verification
- ✅ JWT-based authentication
- ✅ Responsive dashboard
- ✅ Database models for all core features
- ✅ Error handling and validation

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication APIs
│   ├── dashboard/         # Vendor dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── test/             # Test utilities
├── lib/
│   ├── auth.ts           # JWT and OTP utilities
│   ├── db.ts             # Database connection
│   └── validations.ts    # Input validation schemas
├── hooks/
│   └── useClientOnly.ts  # Client-side hydration hook
└── prisma/
    └── schema.prisma     # Database schema
```

## 🔧 Environment Variables

Copy `.env` and update the following:

```bash
# Required
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-key"

# Optional (for production features)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
WEATHER_API_KEY="your-weather-api-key"
```

## 🚨 Troubleshooting

### "Internal Server Error" on Login/Register
- Check if your database is connected: visit `/test`
- Ensure `DATABASE_URL` is correct in `.env`
- Run `npx prisma db push` to create tables

### Hydration Errors
- These are fixed with the `useClientOnly` hook
- Make sure you're not accessing `localStorage` during server-side rendering

### Database Connection Issues
- Verify your database is running
- Check the connection string format
- For cloud databases, ensure your IP is whitelisted

## 🎯 Next Steps

The authentication system is complete! Ready to implement:

1. **Product Catalog** - Add products and pricing tiers
2. **Group Buying Algorithm** - Implement vendor clustering and bulk pricing
3. **AI Forecasting** - Add demand prediction based on weather and events
4. **Micro-Credit System** - Implement "Source Now, Pay Later" functionality
5. **Logistics Optimization** - Add delivery route planning

## 🏆 Hackathon Features

This implementation demonstrates:
- **Scalable Architecture** - Microservices-ready design
- **Real-world Problem Solving** - Addresses actual street vendor pain points
- **Modern Tech Stack** - Next.js, TypeScript, Prisma, PostgreSQL
- **Production Ready** - Proper error handling, validation, and security
- **Social Impact** - Empowers 10M+ street vendors in India

## 📞 Support

If you encounter any issues:
1. Check the `/test` page for database connectivity
2. Review the console logs for detailed error messages
3. Ensure all environment variables are properly set

---

**Built for the hackathon with ❤️ - Transforming India's street food economy, one vendor at a time.**