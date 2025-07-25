import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { vendorRegistrationSchema } from '@/lib/validations';
import { generateOTP, storeOTP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = vendorRegistrationSchema.parse(body);
    
    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor with this phone number already exists' },
        { status: 400 }
      );
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(validatedData.phone, otp);
    
    // In production, send OTP via SMS service
    console.log(`OTP for ${validatedData.phone}: ${otp}`);
    
    // Create vendor record with pending verification
    const vendor = await prisma.vendor.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        stallLatitude: validatedData.stallLatitude,
        stallLongitude: validatedData.stallLongitude,
        stallAddress: validatedData.stallAddress,
        verificationStatus: 'pending'
      }
    });
    
    return NextResponse.json({
      message: 'Registration initiated. Please verify your phone number.',
      vendorId: vendor.id,
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }
    
    // Handle Prisma/Database errors
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        { error: 'Database connection error. Please check your database setup.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}