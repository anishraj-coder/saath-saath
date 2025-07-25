import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { generateOTP, storeOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please register first.' },
        { status: 404 }
      );
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(validatedData.phone, otp);
    
    // In production, send OTP via SMS service
    console.log(`Login OTP for ${validatedData.phone}: ${otp}`);
    
    return NextResponse.json({
      message: 'OTP sent successfully. Please verify your phone number.',
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid phone number format', details: error },
        { status: 400 }
      );
    }
    
    // Handle Prisma/Database errors
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}