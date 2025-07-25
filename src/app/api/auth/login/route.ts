import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { generateOTP, storeOTP, generateToken } from '@/lib/auth';

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
        { error: 'Vendor not found. Please register first.' },
        { status: 404 }
      );
    }
    
    if (vendor.verificationStatus !== 'verified') {
      return NextResponse.json(
        { error: 'Phone number not verified. Please complete verification first.' },
        { status: 400 }
      );
    }
    
    // Generate and store OTP for login
    const otp = generateOTP();
    storeOTP(validatedData.phone, otp);
    
    // In production, send OTP via SMS service
    console.log(`Login OTP for ${validatedData.phone}: ${otp}`);
    
    return NextResponse.json({
      message: 'OTP sent to your phone number. Please verify to login.',
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}