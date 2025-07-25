import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Simple database connection test
    await prisma.$connect();
    
    // Try to count vendors (this will fail if tables don't exist)
    const vendorCount = await prisma.vendor.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      vendorCount
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure your DATABASE_URL is correct and the database is running'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}